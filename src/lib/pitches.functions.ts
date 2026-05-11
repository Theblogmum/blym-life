import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAITool } from "@/lib/ai.server";
import { enforceTrial, getCtx, readString } from "@/lib/generator-helpers.server";

type PitchStatus = "draft" | "sent" | "followed_up" | "replied" | "bounced" | "cancelled";

export const listPitches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("brand_pitches")
      .select("*, brand:brands(name, website, category), user_brand:user_brands(name, website)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) { console.error("[db] listPitches", error); throw new Error("Couldn't load pitches."); }
    return { pitches: data ?? [] };
  });

export const composePitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    brand_id?: string;
    user_brand_id?: string;
    brand_name: string;
    brand_category?: string;
    angle?: string;
  }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "pitch");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{ subject?: unknown; body?: unknown }>({
      toolName: "brand_outreach_email",
      toolDescription: "Draft a warm, concise UK-tone outreach email to a brand.",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string", description: "Email subject line, under 70 chars." },
          body: { type: "string", description: "Full email body, under 180 words, signed off warmly. UK English." },
        },
        required: ["subject", "body"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You write brand outreach emails for UK mum creators. Warm, real, no AI clichés. Plain text, no markdown." },
        { role: "user", content: `Creator profile:\n${ctx}\n\nBrand: ${data.brand_name}${data.brand_category ? ` (${data.brand_category})` : ""}\nAngle: ${data.angle || "Open to a paid collaboration or gifted-with-fee partnership."}\n\nDraft subject + email.` },
      ],
    });
    await quota.record();
    return {
      subject: readString(result.subject),
      body: readString(result.body),
    };
  });

export const savePitchDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string;
    brand_id?: string;
    user_brand_id?: string;
    recipient_email: string;
    subject: string;
    body: string;
    status?: PitchStatus;
  }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.recipient_email?.trim()) throw new Error("Recipient email required.");
    if (!data.subject?.trim() || !data.body?.trim()) throw new Error("Subject and body required.");

    const status: PitchStatus = data.status ?? "draft";

    if (status === "sent") {
      const { data: dup } = await supabase
        .from("brand_pitches")
        .select("id")
        .eq("user_id", userId)
        .ilike("recipient_email", data.recipient_email.trim())
        .in("status", ["sent", "followed_up"])
        .maybeSingle();
      if (dup && dup.id !== data.id) {
        throw new Error("You've already pitched this brand. Check My Outreach.");
      }
    }

    const payload = {
      user_id: userId,
      brand_id: data.brand_id || null,
      user_brand_id: data.user_brand_id || null,
      recipient_email: data.recipient_email.trim(),
      subject: data.subject.trim(),
      body: data.body.trim(),
      status,
      sent_at: status === "sent" ? new Date().toISOString() : null,
      follow_up_due_at: status === "sent"
        ? new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    };

    if (data.id) {
      const { data: row, error } = await supabase
        .from("brand_pitches")
        .update(payload)
        .eq("id", data.id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) { console.error("[db] updatePitch", error); throw new Error("Couldn't save pitch."); }
      return { pitch: row };
    }

    const { data: row, error } = await supabase
      .from("brand_pitches")
      .insert(payload)
      .select()
      .single();
    if (error) { console.error("[db] insertPitch", error); throw new Error("Couldn't save pitch."); }
    return { pitch: row };
  });

export const updatePitchStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: PitchStatus }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "replied") patch.replied_at = new Date().toISOString();
    if (data.status === "followed_up") patch.follow_up_sent_at = new Date().toISOString();
    const { error } = await supabase
      .from("brand_pitches")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) { console.error("[db] updatePitchStatus", error); throw new Error("Couldn't update pitch."); }
    return { ok: true };
  });

export const deletePitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("brand_pitches")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) { console.error("[db] deletePitch", error); throw new Error("Couldn't delete pitch."); }
    return { ok: true };
  });