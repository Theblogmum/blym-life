import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date();
    const todayStr = ymd(today);
    const in7 = ymd(new Date(today.getTime() + 7 * 86400000));
    const ago30 = ymd(new Date(today.getTime() - 30 * 86400000));
    const ago7 = ymd(new Date(today.getTime() - 7 * 86400000));
    const monthStart = ymd(new Date(today.getFullYear(), today.getMonth(), 1));

    const [
      profileR, briefsR, plansR, followupsR, postsR, ideasR, goalsR, incomeR, portfolioR,
    ] = await Promise.all([
      supabase.from("profiles").select("display_name, tier, trial_started_at").eq("id", userId).maybeSingle(),
      supabase.from("daily_briefs").select("id, film, hook, post_at, filmed, saved, brief_date").eq("user_id", userId).eq("brief_date", todayStr).order("created_at", { ascending: false }),
      supabase.from("weekly_plans").select("id, plan_date, slot_label, idea, hook, done").eq("user_id", userId).gte("plan_date", todayStr).lte("plan_date", in7).order("plan_date", { ascending: true }),
      supabase.from("follow_ups").select("id, title, brand, due_date, done").eq("user_id", userId).eq("done", false).lte("due_date", in7).order("due_date", { ascending: true }),
      supabase.from("posts_logged").select("id, description, platform, posted_at, views, likes, comments, saves, shares").eq("user_id", userId).gte("posted_at", ago30).order("posted_at", { ascending: false }),
      supabase.from("saved_content").select("id, kind, title, body, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("creator_goals").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      supabase.from("income_entries").select("amount, currency, category, entry_date, brand").eq("user_id", userId).gte("entry_date", monthStart),
      supabase.from("portfolio_items").select("id, title, brand, posted_on").eq("user_id", userId).order("posted_on", { ascending: false, nullsFirst: false }).limit(5),
    ]);

    const posts = postsR.data ?? [];
    const plans = plansR.data ?? [];
    const ideas = ideasR.data ?? [];
    const income = incomeR.data ?? [];

    // Streak: consecutive days back from today (or yesterday) with at least 1 post
    const postedDays = new Set(posts.map((p) => p.posted_at));
    let streak = 0;
    const cursor = new Date(today);
    if (!postedDays.has(ymd(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (postedDays.has(ymd(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Last 7 day post count
    const last7 = posts.filter((p) => p.posted_at >= ago7).length;

    // Top post in last 30
    const topPost = posts.slice().sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0];
    const recentBig = posts.find((p) => (p.views ?? 0) >= 1000);

    // Income this month
    const incomeByCcy: Record<string, number> = {};
    for (const e of income) incomeByCcy[e.currency] = (incomeByCcy[e.currency] ?? 0) + Number(e.amount ?? 0);
    const monthIncomeGBP = incomeByCcy["GBP"] ?? Object.values(incomeByCcy).reduce((a, b) => a + b, 0);

    // Wins
    const wins: string[] = [];
    if (streak >= 2) wins.push(`🔥 ${streak}-day posting streak`);
    if (last7 >= 3) wins.push(`📤 ${last7} posts shipped this week`);
    if (topPost && (topPost.views ?? 0) > 0) wins.push(`👀 Top post: ${(topPost.views ?? 0).toLocaleString()} views`);
    if (monthIncomeGBP > 0) wins.push(`💰 £${monthIncomeGBP.toLocaleString()} earned this month`);
    if ((portfolioR.data ?? []).length > 0) wins.push(`📁 ${(portfolioR.data ?? []).length} portfolio piece${(portfolioR.data ?? []).length === 1 ? "" : "s"}`);
    if (wins.length === 0) wins.push("✨ You showed up — that's the whole game.");

    return {
      name: profileR.data?.display_name ?? null,
      tier: profileR.data?.tier ?? "free",
      today_brief: (briefsR.data ?? [])[0] ?? null,
      todays_tasks: plans.filter((p) => p.plan_date === todayStr),
      upcoming_tasks: plans.filter((p) => p.plan_date > todayStr).slice(0, 5),
      follow_ups: followupsR.data ?? [],
      ideas_waiting: ideas,
      streak,
      posts_last_7: last7,
      top_post: topPost ?? null,
      recent_big: recentBig ?? null,
      wins,
      goals: goalsR.data ?? [],
      income_this_month: monthIncomeGBP,
      income_by_currency: incomeByCcy,
      portfolio_recent: portfolioR.data ?? [],
    };
  });

// =============== Goals CRUD ===============
export const saveGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; kind: string; title: string; target_value: number; current_value?: number; unit?: string; deadline?: string }) => d)
  .handler(async ({ data, context }) => {
    const row = {
      user_id: context.userId,
      kind: data.kind, title: data.title,
      target_value: data.target_value,
      current_value: data.current_value ?? 0,
      unit: data.unit ?? null,
      deadline: data.deadline ?? null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("creator_goals").update(row).eq("id", data.id).eq("user_id", context.userId);
      if (error) console.error("[db error]", error); throw new Error("Something went wrong. Please try again.");
    } else {
      const { error } = await context.supabase.from("creator_goals").insert(row);
      if (error) console.error("[db error]", error); throw new Error("Something went wrong. Please try again.");
    }
    return { ok: true };
  });

export const updateGoalProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; current_value: number }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("creator_goals").update({ current_value: data.current_value }).eq("id", data.id).eq("user_id", context.userId);
    if (error) console.error("[db error]", error); throw new Error("Something went wrong. Please try again.");
    return { ok: true };
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("creator_goals").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) console.error("[db error]", error); throw new Error("Something went wrong. Please try again.");
    return { ok: true };
  });

// =============== Follow-ups CRUD ===============
export const saveFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; title: string; brand?: string; due_date: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const row = {
      user_id: context.userId,
      title: data.title, brand: data.brand ?? null,
      due_date: data.due_date, notes: data.notes ?? null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("follow_ups").update(row).eq("id", data.id).eq("user_id", context.userId);
      if (error) console.error("[db error]", error); throw new Error("Something went wrong. Please try again.");
    } else {
      const { error } = await context.supabase.from("follow_ups").insert(row);
      if (error) console.error("[db error]", error); throw new Error("Something went wrong. Please try again.");
    }
    return { ok: true };
  });

export const toggleFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; done: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("follow_ups").update({ done: data.done }).eq("id", data.id).eq("user_id", context.userId);
    if (error) console.error("[db error]", error); throw new Error("Something went wrong. Please try again.");
    return { ok: true };
  });

export const deleteFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("follow_ups").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) console.error("[db error]", error); throw new Error("Something went wrong. Please try again.");
    return { ok: true };
  });

// =============== Toggle plan done from dashboard ===============
export const togglePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; done: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("weekly_plans").update({ done: data.done }).eq("id", data.id).eq("user_id", context.userId);
    if (error) console.error("[db error]", error); throw new Error("Something went wrong. Please try again.");
    return { ok: true };
  });