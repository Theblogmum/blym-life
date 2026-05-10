import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: posts, error } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      console.error("[db error]", error);
      throw new Error("Something went wrong. Please try again.");
    }
    const list = posts ?? [];
    if (list.length === 0) return { posts: [] };
    const ids = list.map((p) => p.id);
    const userIds = Array.from(new Set(list.map((p) => p.user_id)));
    const [{ data: likes }, { data: comments }, { data: profiles }] = await Promise.all([
      supabase.from("community_likes").select("post_id, user_id").in("post_id", ids),
      supabase.from("community_comments").select("id, post_id, user_id, content, created_at").in("post_id", ids).order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, display_name").in("id", userIds),
    ]);
    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? "A creator"]));
    return {
      posts: list.map((p) => {
        const pl = (likes ?? []).filter((l) => l.post_id === p.id);
        const cs = (comments ?? []).filter((c) => c.post_id === p.id);
        return {
          ...p,
          author: nameById.get(p.user_id) ?? "A creator",
          like_count: pl.length,
          liked_by_me: pl.some((l) => l.user_id === userId),
          mine: p.user_id === userId,
          comments: cs.map((c) => ({
            ...c,
            author: nameById.get(c.user_id) ?? "A creator",
            mine: c.user_id === userId,
          })),
        };
      }),
    };
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { content: string; mood?: string }) => d)
  .handler(async ({ data, context }) => {
    const content = data.content.trim();
    if (content.length < 2 || content.length > 1500) throw new Error("Posts must be 2–1500 characters.");
    const { error } = await context.supabase.from("community_posts").insert({
      user_id: context.userId,
      content,
      mood: data.mood ?? null,
    });
    if (error) {
      console.error("[db error]", error);
      throw new Error("Something went wrong. Please try again.");
    }
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("community_posts").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) {
      console.error("[db error]", error);
      throw new Error("Something went wrong. Please try again.");
    }
    return { ok: true };
  });

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { post_id: string; liked: boolean }) => d)
  .handler(async ({ data, context }) => {
    if (data.liked) {
      await context.supabase.from("community_likes").delete().eq("post_id", data.post_id).eq("user_id", context.userId);
    } else {
      await context.supabase.from("community_likes").insert({ post_id: data.post_id, user_id: context.userId });
    }
    return { ok: true };
  });

export const addComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { post_id: string; content: string }) => d)
  .handler(async ({ data, context }) => {
    const content = data.content.trim();
    if (content.length < 1 || content.length > 800) throw new Error("Comment must be 1–800 characters.");
    const { error } = await context.supabase.from("community_comments").insert({
      post_id: data.post_id,
      user_id: context.userId,
      content,
    });
    if (error) {
      console.error("[db error]", error);
      throw new Error("Something went wrong. Please try again.");
    }
    return { ok: true };
  });

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("community_comments").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) {
      console.error("[db error]", error);
      throw new Error("Something went wrong. Please try again.");
    }
    return { ok: true };
  });