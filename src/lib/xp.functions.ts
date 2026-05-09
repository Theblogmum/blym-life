import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type XpStats = {
  xp: number;
  level: number;
  nextLevelXp: number;
  prevLevelXp: number;
  levelTitle: string;
  streak: number;
  awardedToday: boolean;
  recent: { reason: string; amount: number; created_at: string }[];
};

const TITLES = ["Sprout", "Seedling", "Storyteller", "Creator", "Connector", "Magnet", "Mover", "Powerhouse", "Force", "Icon"];

function calcLevel(xp: number) {
  // level n needs n*100 cumulative; n grows
  // simple: level = floor(sqrt(xp/50)) + 1
  const level = Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1);
  const prevLevelXp = 50 * Math.pow(level - 1, 2);
  const nextLevelXp = 50 * Math.pow(level, 2);
  const title = TITLES[Math.min(level - 1, TITLES.length - 1)];
  return { level, prevLevelXp, nextLevelXp, levelTitle: title };
}

async function computeStreak(supabase: any, userId: string): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - 60);
  const { data } = await supabase
    .from("posts_logged")
    .select("posted_at")
    .eq("user_id", userId)
    .gte("posted_at", since.toISOString().slice(0, 10));
  const days = new Set<string>((data ?? []).map((r: any) => r.posted_at));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const k = d.toISOString().slice(0, 10);
    if (days.has(k)) { streak++; d.setDate(d.getDate() - 1); }
    else if (i === 0) { d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

export const getXp = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: row }, { data: events }] = await Promise.all([
      supabase.from("creator_xp").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("xp_events").select("reason, amount, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
    ]);
    const xp = row?.xp ?? 0;
    const lvl = calcLevel(xp);
    const today = new Date().toISOString().slice(0, 10);
    const streak = await computeStreak(supabase, userId);
    const stats: XpStats = {
      xp,
      ...lvl,
      streak,
      awardedToday: row?.last_claim_date === today,
      recent: events ?? [],
    };
    return stats;
  });

export const claimDailyXp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.rpc("claim_daily_xp", { _user_id: userId });
    if (error) { console.error("[db error] claim_daily_xp", error); throw new Error("Couldn't claim daily XP"); }
    const row = Array.isArray(data) ? data[0] : data;
    return { awarded: !!row?.awarded, xp: row?.xp ?? 0 };
  });
