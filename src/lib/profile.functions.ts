import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: creator }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("creator_profile").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    return { profile, creator };
  });

export const saveCreatorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    niches: string[];
    vibe?: string;
    kids_ages?: string;
    location?: string;
    work_status?: string;
    platforms: string[];
    follower_goal?: number;
    posting_frequency?: string;
    known_for?: string;
  }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("creator_profile")
      .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() });
    if (error) { console.error("[db error] saveCreatorProfile", error); throw new Error("A database error occurred. Please try again."); }
    await supabase.from("profiles").update({ onboarded: true, updated_at: new Date().toISOString() }).eq("id", userId);
    return { ok: true };
  });