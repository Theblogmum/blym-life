import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getUserTier } from "./generator-helpers.server";

export const listPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("posts_logged").select("*").eq("user_id", userId)
      .order("posted_at", { ascending: false });
    if (error) { console.error("[db error] listPosts", error); throw new Error("A database error occurred. Please try again."); }
    return { posts: data ?? [] };
  });

export const logPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    description: string; platform: string; hook?: string;
    views?: number; likes?: number; comments?: number; saves?: number; shares?: number;
  }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Personalised growth insights is a Pro-tier feature — logging posts
    // is what powers the personalised insights engine.
    const tier = await getUserTier(supabase, userId);
    if (tier !== "pro") {
      throw new Error(
        "Personalised growth insights is unlocked on Pro (£29.99/mo). Upgrade to start logging posts and unlock AI-powered insights on what's working.",
      );
    }
    const { error } = await supabase.from("posts_logged").insert({
      user_id: userId, description: data.description, platform: data.platform,
      hook: data.hook ?? null, views: data.views ?? 0, likes: data.likes ?? 0,
      comments: data.comments ?? 0, saves: data.saves ?? 0, shares: data.shares ?? 0,
    });
    if (error) { console.error("[db error] logPost", error); throw new Error("A database error occurred. Please try again."); }
    return { ok: true };
  });