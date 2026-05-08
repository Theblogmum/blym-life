import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAITool, buildCreatorContext } from "@/lib/ai.server";

const FREE_DAILY_LIMIT = 3;

type BriefShape = {
  film: string;
  hook: string;
  caption: string;
  shot_list: { description: string; seconds: number }[];
  why_it_works: string;
  post_at: string;
};

export const listTodayBriefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("daily_briefs")
      .select("*")
      .eq("user_id", userId)
      .eq("brief_date", today)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { briefs: data ?? [] };
  });

export const generateBrief = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { vibe_hint?: string }) => d ?? {})
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("tier").eq("id", userId).maybeSingle();
    const today = new Date().toISOString().slice(0, 10);

    if ((profile?.tier ?? "free") === "free") {
      const { count } = await supabase
        .from("daily_briefs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("brief_date", today);
      if ((count ?? 0) >= FREE_DAILY_LIMIT) {
        throw new Response("Free plan limit reached (3/day). Upgrade for unlimited.", { status: 402 });
      }
    }

    const { data: creator } = await supabase
      .from("creator_profile").select("*").eq("user_id", userId).maybeSingle();
    const ctx = buildCreatorContext(creator ?? {});
    const dayName = new Date().toLocaleDateString("en-GB", { weekday: "long" });

    const brief = await callAITool<BriefShape>({
      toolName: "create_brief",
      toolDescription: "Create one concrete filming brief for a mum content creator. Be SPECIFIC, REAL, and DOABLE in 10 minutes during a normal mum day.",
      parameters: {
        type: "object",
        properties: {
          film: { type: "string", description: "What to film: 3-5 mini moments separated by → arrows" },
          hook: { type: "string", description: "Spoken/text hook, ≤10 words, scroll-stopping but feels real" },
          caption: { type: "string", description: "Full caption ready to post" },
          shot_list: {
            type: "array",
            items: {
              type: "object",
              properties: { description: { type: "string" }, seconds: { type: "number" } },
              required: ["description", "seconds"],
              additionalProperties: false,
            },
          },
          why_it_works: { type: "string" },
          post_at: { type: "string", description: "Best post time today, e.g. '7 PM'" },
        },
        required: ["film", "hook", "caption", "shot_list", "why_it_works", "post_at"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You are a viral content strategist for mum creators. Briefs must feel REAL — no AI clichés, no 'embrace your journey'. British English." },
        { role: "user", content: `Today is ${dayName}.\n\nCreator profile:\n${ctx}\n\nExtra hint: ${data.vibe_hint || "none"}\n\nGive ONE filming brief for today.` },
      ],
    });

    const { data: inserted, error } = await supabase
      .from("daily_briefs")
      .insert({
        user_id: userId, brief_date: today,
        film: brief.film, hook: brief.hook, caption: brief.caption,
        shot_list: brief.shot_list, why_it_works: brief.why_it_works, post_at: brief.post_at,
      })
      .select().single();
    if (error) throw new Error(error.message);
    return { brief: inserted };
  });

export const markBrief = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; filmed?: boolean; saved?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: { filmed?: boolean; saved?: boolean } = {};
    if (typeof data.filmed === "boolean") patch.filmed = data.filmed;
    if (typeof data.saved === "boolean") patch.saved = data.saved;
    const { error } = await supabase
      .from("daily_briefs").update(patch).eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });