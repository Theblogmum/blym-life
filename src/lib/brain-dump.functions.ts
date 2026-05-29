import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { enforceTrial, getCtx } from "@/lib/generator-helpers.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const BUCKET = "brain-dump-media";
const MAX_FILES = 20;

type MediaItem = {
  path: string;
  name: string;
  type: string;
  note?: string;
};

const MediaItemSchema = z.object({
  path: z.string().min(1).max(500),
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  note: z.string().max(500).optional(),
});

// --- 1. Sign upload URL for client-side direct upload to private bucket ---
export const getBrainDumpUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        filename: z.string().min(1).max(255).regex(/^[a-zA-Z0-9._\- ]+$/),
        contentType: z.string().min(1).max(100),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const safe = data.filename.replace(/\s+/g, "_");
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
    const { data: signed, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message || "Upload URL failed");
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

// --- 2. Analyse brain dump — text + media → categorised content plan ---
export const analyseBrainDump = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        rawText: z.string().min(10).max(8000),
        media: z.array(MediaItemSchema).max(MAX_FILES).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const quota = await enforceTrial(supabase, userId, "brain_dump");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service unavailable");

    const ctx = await getCtx(supabase, userId);

    // Create dump row first (status processing)
    const { data: dump, error: dumpErr } = await supabase
      .from("brain_dumps")
      .insert({
        user_id: userId,
        raw_text: data.rawText,
        media: data.media,
        status: "processing",
      })
      .select("id")
      .single();
    if (dumpErr || !dump) throw new Error(dumpErr?.message || "Failed to save dump");

    // Build multimodal content. Sign read URLs for images so the model can see them.
    const userContent: Array<
      { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
    > = [];

    const mediaSummary: string[] = [];
    const images: MediaItem[] = [];
    const videos: MediaItem[] = [];
    for (const m of data.media) {
      if (m.type.startsWith("image/")) images.push(m);
      else if (m.type.startsWith("video/")) videos.push(m);
      mediaSummary.push(
        `- [${m.type.startsWith("video/") ? "VIDEO" : "IMAGE"}] ${m.name}${m.note ? ` — ${m.note}` : ""} (id: ${m.path})`,
      );
    }

    // Add image signed URLs (cap at 8 to keep token cost sane)
    for (const img of images.slice(0, 8)) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(img.path, 60 * 10);
      if (signed?.signedUrl) {
        userContent.push({ type: "image_url", image_url: { url: signed.signedUrl } });
      }
    }

    const prompt = `Creator profile:
${ctx}

BRAIN DUMP (the creator's messy ideas + camera roll):
${data.rawText}

${data.media.length ? `Attached media (${data.media.length}):\n${mediaSummary.join("\n")}\n` : ""}
Your job: Take this chaos and turn it into an organised content plan. Categorise every distinct idea/scene into its own ready-to-post piece of content. For each one, decide whether it works best as a standalone clip (with text/voice overlay) OR as part of a batched/edited multi-clip video — and explain why. Then give the creator EVERYTHING they need to post it for maximum reach: hook, full word-for-word script, voiceover line, text-overlay copy, caption, hashtags, SEO keywords, best platform, best posting time, and a posting strategy. Be specific, real, and British English. No AI clichés.

Return 4-8 ideas. Reference attached media by their id (path) in uses_media when relevant.`;

    userContent.unshift({ type: "text", text: prompt });

    const schema = {
      type: "object",
      properties: {
        ideas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              category: { type: "string" },
              format: { type: "string" },
              hook: { type: "string" },
              script: { type: "string" },
              voiceover: { type: "string" },
              text_overlay: { type: "string" },
              caption: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
              seo_keywords: { type: "array", items: { type: "string" } },
              best_platform: { type: "string" },
              best_time: { type: "string" },
              posting_strategy: { type: "string" },
              uses_media: { type: "array", items: { type: "string" } },
            },
            required: [
              "title", "format", "hook", "script", "caption",
              "hashtags", "seo_keywords", "best_platform", "best_time", "posting_strategy",
            ],
          },
        },
      },
      required: ["ideas"],
    };

    try {
      const res = await fetch(GATEWAY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            {
              role: "system",
              content:
                "You are a content strategist for mum creators. You take messy idea dumps and camera-roll footage and turn them into fully-optimised, ready-to-post content plans. Be specific, real, British English, no AI clichés.",
            },
            { role: "user", content: userContent },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "content_plan",
                description: "Categorised content plan for the brain dump",
                parameters: schema,
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "content_plan" } },
          max_tokens: 8000,
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        if (res.status === 429) throw new Error("Rate limited — try again in a moment");
        if (res.status === 402) throw new Error("AI credits exhausted — top up workspace usage");
        console.error("Brain dump gateway error", res.status, t);
        throw new Error("AI gateway error");
      }

      const json = await res.json();
      const msg = json.choices?.[0]?.message;
      const call = msg?.tool_calls?.[0];
      let parsed: { ideas: any[] } | null = null;
      if (call?.function?.arguments) {
        try { parsed = JSON.parse(call.function.arguments); } catch {}
      }
      // Fallback: some models return JSON in content instead of using tool_calls
      if (!parsed && typeof msg?.content === "string" && msg.content.trim()) {
        const raw = msg.content.trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { parsed = JSON.parse(jsonMatch[0]); } catch {}
        }
      }
      if (!parsed) {
        console.error("Brain dump: no plan in response", JSON.stringify(json).slice(0, 2000));
        throw new Error("AI returned no plan — try fewer/smaller attachments or simpler prompt");
      }
      const ideas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
      if (!ideas.length) throw new Error("AI returned no ideas");

      const rows = ideas.map((i, idx) => ({
        dump_id: dump.id,
        user_id: userId,
        position: idx,
        title: String(i.title ?? "").slice(0, 200),
        category: i.category ? String(i.category).slice(0, 100) : null,
        format: i.format === "batched" ? "batched" : "standalone",
        hook: String(i.hook ?? "").slice(0, 500),
        script: String(i.script ?? "").slice(0, 4000),
        voiceover: i.voiceover ? String(i.voiceover).slice(0, 1500) : null,
        text_overlay: i.text_overlay ? String(i.text_overlay).slice(0, 500) : null,
        caption: String(i.caption ?? "").slice(0, 2200),
        hashtags: Array.isArray(i.hashtags)
          ? i.hashtags.map((h: any) => String(h).replace(/^#/, "").slice(0, 60)).slice(0, 15)
          : [],
        seo_keywords: Array.isArray(i.seo_keywords)
          ? i.seo_keywords.map((k: any) => String(k).slice(0, 80)).slice(0, 10)
          : [],
        best_platform: i.best_platform ? String(i.best_platform).slice(0, 60) : null,
        best_time: i.best_time ? String(i.best_time).slice(0, 120) : null,
        posting_strategy: i.posting_strategy ? String(i.posting_strategy).slice(0, 1000) : null,
        uses_media: Array.isArray(i.uses_media)
          ? i.uses_media.map((p: any) => String(p).slice(0, 500)).slice(0, 20)
          : [],
      }));

      const { error: insErr } = await supabase.from("brain_dump_ideas").insert(rows);
      if (insErr) throw new Error(insErr.message);

      await supabase
        .from("brain_dumps")
        .update({ status: "ready" })
        .eq("id", dump.id)
        .eq("user_id", userId);

      await quota.record();
      return { id: dump.id, count: rows.length };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to analyse";
      await supabase
        .from("brain_dumps")
        .update({ status: "failed", error: msg })
        .eq("id", dump.id)
        .eq("user_id", userId);
      throw err;
    }
  });

// --- 3. List recent brain dumps ---
export const listBrainDumps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("brain_dumps")
      .select("id, raw_text, status, created_at, media")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw new Error(error.message);
    return { dumps: data ?? [] };
  });

// --- 4. Get one dump + its ideas + signed read URLs for any media ---
export const getBrainDump = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: dump, error: dErr } = await supabase
      .from("brain_dumps")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (dErr) throw new Error(dErr.message);
    if (!dump) throw new Error("Not found");

    const { data: ideas, error: iErr } = await supabase
      .from("brain_dump_ideas")
      .select("*")
      .eq("dump_id", data.id)
      .eq("user_id", userId)
      .order("position", { ascending: true });
    if (iErr) throw new Error(iErr.message);

    // Signed read URLs for media
    const media = Array.isArray(dump.media) ? (dump.media as MediaItem[]) : [];
    const signedMedia: Array<MediaItem & { url: string | null }> = [];
    for (const m of media) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(m.path, 60 * 30);
      signedMedia.push({ ...m, url: signed?.signedUrl ?? null });
    }

    return { dump: { ...dump, media: signedMedia }, ideas: ideas ?? [] };
  });

// --- 5. Delete a dump and its storage files ---
export const deleteBrainDump = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: dump } = await supabase
      .from("brain_dumps")
      .select("media")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    const media = Array.isArray(dump?.media) ? (dump!.media as MediaItem[]) : [];
    if (media.length) {
      await supabase.storage.from(BUCKET).remove(media.map((m) => m.path));
    }
    const { error } = await supabase
      .from("brain_dumps")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });