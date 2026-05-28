import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getUserTier } from "@/lib/generator-helpers.server";

/**
 * Free users can only plan up to 7 days ahead. Anything further is
 * Creator-tier or above (full content calendar).
 */
async function assertFreeWithinPlanningWindow(
  supabase: Parameters<typeof getUserTier>[0],
  userId: string,
  planDate: string,
) {
  const tier = await getUserTier(supabase, userId);
  if (tier !== "free") return;
  const target = new Date(planDate + "T00:00:00Z").getTime();
  const now = Date.now();
  const maxAhead = now + 7 * 24 * 60 * 60 * 1000;
  if (target > maxAhead) {
    throw new Error(
      "Free plan only lets you plan 1 week ahead. Upgrade to Creator (£6.99/mo) for the full content calendar.",
    );
  }
}

export const listWeek = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { start: string; end: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("weekly_plans").select("*")
      .eq("user_id", userId)
      .gte("plan_date", data.start)
      .lte("plan_date", data.end)
      .order("plan_date", { ascending: true });
    if (error) { console.error("[db error] listWeek", error); throw new Error("A database error occurred. Please try again."); }
    return { items: rows ?? [] };
  });

export const upsertPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; plan_date: string; idea: string; hook?: string; caption?: string; slot_label?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertFreeWithinPlanningWindow(supabase, userId, data.plan_date);
    if (data.id) {
      const { error } = await supabase.from("weekly_plans").update({
        plan_date: data.plan_date, idea: data.idea, hook: data.hook, caption: data.caption, slot_label: data.slot_label,
      }).eq("id", data.id).eq("user_id", userId);
      if (error) { console.error("[db error] upsertPlan update", error); throw new Error("A database error occurred. Please try again."); }
      return { ok: true };
    }
    const { error } = await supabase.from("weekly_plans").insert({
      user_id: userId, plan_date: data.plan_date, idea: data.idea, hook: data.hook, caption: data.caption, slot_label: data.slot_label,
    });
    if (error) { console.error("[db error] upsertPlan insert", error); throw new Error("A database error occurred. Please try again."); }
    return { ok: true };
  });

export const togglePlanDone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; done: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("weekly_plans").update({ done: data.done }).eq("id", data.id).eq("user_id", userId);
    if (error) { console.error("[db error] togglePlanDone", error); throw new Error("A database error occurred. Please try again."); }
    return { ok: true };
  });

export const deletePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("weekly_plans").delete().eq("id", data.id).eq("user_id", userId);
    if (error) { console.error("[db error] deletePlan", error); throw new Error("A database error occurred. Please try again."); }
    return { ok: true };
  });