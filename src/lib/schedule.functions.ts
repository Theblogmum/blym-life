import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { getUserTier } from "@/lib/generator-helpers.server";

const PLATFORMS = ["instagram", "tiktok", "youtube", "pinterest", "other"] as const;

const ScheduledPostInput = z.object({
  platform: z.enum(PLATFORMS),
  caption: z.string().max(3000).optional().nullable(),
  hook: z.string().max(500).optional().nullable(),
  media_url: z.string().url().max(2000).optional().nullable().or(z.literal("")),
  link_url: z.string().url().max(2000).optional().nullable().or(z.literal("")),
  pinterest_board_id: z.string().max(100).optional().nullable(),
  scheduled_for: z.string().datetime(),
});

export const listScheduledPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("user_id", userId)
      .order("scheduled_for", { ascending: true })
      .limit(200);
    if (error) throw new Error("Failed to load schedule");
    const now = Date.now();
    const posts = data ?? [];
    return {
      posts,
      dueNowCount: posts.filter(
        (p) =>
          (p.status === "scheduled" || p.status === "reminded") &&
          new Date(p.scheduled_for).getTime() <= now,
      ).length,
    };
  });

export const createScheduledPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => ScheduledPostInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tier = await getUserTier(supabase, userId);
    if (tier === "free") {
      throw new Error("Scheduler is unlocked on Pro. Upgrade to plan ahead.");
    }
    const { data: inserted, error } = await supabase
      .from("scheduled_posts")
      .insert({
        user_id: userId,
        platform: data.platform,
        caption: data.caption || null,
        hook: data.hook || null,
        media_url: data.media_url || null,
        link_url: data.link_url || null,
        pinterest_board_id: data.pinterest_board_id || null,
        scheduled_for: data.scheduled_for,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { post: inserted };
  });

export const updateScheduledPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).extend(ScheduledPostInput.partial().shape).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...patch } = data;
    const cleanPatch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) continue;
      cleanPatch[k] = v === "" ? null : v;
    }
    const { error } = await supabase
      .from("scheduled_posts")
      .update(cleanPatch)
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markPosted = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: post, error: getErr } = await supabase
      .from("scheduled_posts").select("*").eq("id", data.id).eq("user_id", userId).single();
    if (getErr || !post) throw new Error("Post not found");

    await supabase.from("scheduled_posts")
      .update({ status: "posted", posted_at: new Date().toISOString() })
      .eq("id", data.id).eq("user_id", userId);

    // Auto-create posts_logged row
    if (post.platform !== "pinterest") {
      await supabase.from("posts_logged").insert({
        user_id: userId,
        platform: post.platform,
        hook: post.hook,
        description: post.caption?.slice(0, 200) || post.hook || "Scheduled post",
        posted_at: new Date().toISOString().slice(0, 10),
      });
    }
    return { ok: true };
  });

export const deleteScheduledPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("scheduled_posts").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });