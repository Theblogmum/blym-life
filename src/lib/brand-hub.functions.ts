import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAITool } from "@/lib/ai.server";
import { enforceTrial, getCtx, readString } from "@/lib/generator-helpers.server";

export const listBrands = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [seedRes, mineRes, pitchRes] = await Promise.all([
      supabase.from("brands").select("*").order("name", { ascending: true }),
      supabase.from("user_brands").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("brand_pitches").select("id,brand_id,user_brand_id,recipient_email,status,created_at,sent_at,replied_at,follow_up_due_at,follow_up_sent_at,subject").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    return {
      brands: seedRes.data ?? [],
      myBrands: mineRes.data ?? [],
      pitches: pitchRes.data ?? [],
    };
  });

export const addUserBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; website?: string; instagram?: string; contact_email?: string; category?: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.name?.trim()) throw new Error("Brand name required");
    const { data: row, error } = await supabase
      .from("user_brands")
      .insert({
        user_id: userId,
        name: data.name.trim(),
        website: data.website?.trim() || null,
        instagram: data.instagram?.trim() || null,
        contact_email: data.contact_email?.trim() || null,
        category: data.category?.trim() || null,
        notes: data.notes?.trim() || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteUserBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("user_brands").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

type ComposeInput = {
  brand_id?: string;
  user_brand_id?: string;
  brand_name: string;
  recipient_email: string;
  angle?: string;
};

export const composePitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: ComposeInput) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.brand_name?.trim()) throw new Error("Brand name required");
    if (!data.recipient_email?.trim()) throw new Error("Recipient email required");

    // Double-send guard
    const email = data.recipient_email.trim().toLowerCase();
    const { data: existing } = await supabase
      .from("brand_pitches")
      .select("id,status")
      .eq("user_id", userId)
      .ilike("recipient_email", email)
      .not("status", "in", "(cancelled,replied)")
      .maybeSingle();
    if (existing) {
      throw new Error(`You've already pitched ${email}. Check My Outreach first.`);
    }

    const quota = await enforceTrial(supabase, userId, "ugc_pitch");
    const ctx = await getCtx(supabase, userId);
    const result = await callAITool<{ subject?: unknown; body?: unknown; follow_up_body?: unknown }>({
      toolName: "brand_outreach",
      toolDescription: "Warm UK brand pitch + follow-up.",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string" },
          follow_up_body: { type: "string" },
        },
        required: ["subject", "body", "follow_up_body"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "Warm, specific brand outreach for UK mum creators. Sound human, not template-y. British English." },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nBrand: ${data.brand_name}\nAngle: ${data.angle || "introduction + collab idea"}\n\nWrite (1) a first pitch email and (2) a short, polite 4-day follow-up referencing the first email.`,
        },
      ],
    });
    await quota.record();

    const subject = readString(result.subject, `Collaboration idea — ${data.brand_name}`);
    const body = readString(result.body);
    const follow_up_body = readString(result.follow_up_body);

    const { data: row, error } = await supabase
      .from("brand_pitches")
      .insert({
        user_id: userId,
        brand_id: data.brand_id ?? null,
        user_brand_id: data.user_brand_id ?? null,
        brand_name: data.brand_name.trim(),
        recipient_email: email,
        subject,
        body,
        follow_up_body,
        status: "draft",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updatePitchStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "draft" | "sent" | "replied" | "cancelled" }) => d)
  .handler(async ({ data, context }) => {
    const updates: Record<string, unknown> = { status: data.status };
    if (data.status === "sent") {
      updates.sent_at = new Date().toISOString();
      updates.follow_up_due_at = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();
    }
    if (data.status === "replied") updates.replied_at = new Date().toISOString();
    const { error } = await context.supabase
      .from("brand_pitches")
      .update(updates)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("brand_pitches")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });