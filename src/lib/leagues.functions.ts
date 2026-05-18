import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type LeagueTier = "bronze" | "silver" | "gold" | "diamond";

const TIERS: { id: LeagueTier; label: string; emoji: string; minXp: number; color: string }[] = [
  { id: "bronze",  label: "Bronze",  emoji: "🥉", minXp: 0,   color: "oklch(0.65 0.12 60)"  },
  { id: "silver",  label: "Silver",  emoji: "🥈", minXp: 100, color: "oklch(0.72 0.04 250)" },
  { id: "gold",    label: "Gold",    emoji: "🥇", minXp: 300, color: "oklch(0.78 0.16 80)"  },
  { id: "diamond", label: "Diamond", emoji: "💎", minXp: 750, color: "oklch(0.78 0.15 200)" },
];

function tierFor(weekXp: number): typeof TIERS[number] {
  let t = TIERS[0];
  for (const candidate of TIERS) if (weekXp >= candidate.minXp) t = candidate;
  return t;
}

function weekStart(): string {
  // ISO week start (Monday) — UTC
  const now = new Date();
  const day = now.getUTCDay(); // 0..6, Sun=0
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
}

function weekEnd(): string {
  const start = new Date(weekStart());
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return end.toISOString();
}

function daysLeft(): number {
  const end = new Date(weekEnd()).getTime();
  return Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
}

export type LeagueEntry = {
  user_id: string;
  name: string;          // public display name OR anonymous tag
  weekXp: number;
  isMe: boolean;
};

export type LeagueStats = {
  tier: LeagueTier;
  tierLabel: string;
  tierEmoji: string;
  tierColor: string;
  nextTier?: { id: LeagueTier; label: string; emoji: string; xpToNext: number };
  weekXp: number;
  rank: number;          // your rank within tier (1 = top)
  totalInTier: number;
  daysLeft: number;
  weekStart: string;
  entries: LeagueEntry[]; // top 20 in same tier (anonymized if no public_slug)
};

export const getLeague = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LeagueStats> => {
    const { userId } = context;
    const wStart = weekStart();

    // Aggregate weekly XP across all users — needs service role to bypass RLS
    const { data: events, error } = await supabaseAdmin
      .from("xp_events")
      .select("user_id, amount")
      .gte("created_at", wStart);
    if (error) {
      console.error("[leagues] xp_events fetch failed", error);
      return emptyStats(userId, wStart);
    }

    const totals = new Map<string, number>();
    for (const ev of events ?? []) {
      totals.set(ev.user_id, (totals.get(ev.user_id) ?? 0) + (ev.amount ?? 0));
    }
    // ensure current user is at least present (so they always have a tier)
    if (!totals.has(userId)) totals.set(userId, 0);

    const myWeekXp = totals.get(userId) ?? 0;
    const myTier = tierFor(myWeekXp);
    const nextTierDef = TIERS[TIERS.findIndex((t) => t.id === myTier.id) + 1];

    // Bucket every user into their tier, sort within bucket
    const sameTier = Array.from(totals.entries())
      .filter(([, xp]) => tierFor(xp).id === myTier.id)
      .sort((a, b) => b[1] - a[1]);
    const rank = Math.max(1, sameTier.findIndex(([uid]) => uid === userId) + 1);

    // Fetch display names for top 20 of this tier (public_slug only)
    const top = sameTier.slice(0, 20);
    const ids = top.map(([uid]) => uid);
    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, public_slug")
      .in("id", ids);
    const profMap = new Map(profs?.map((p) => [p.id, p]) ?? []);

    const entries: LeagueEntry[] = top.map(([uid, xp]) => {
      const p = profMap.get(uid);
      const showName = p?.public_slug && p?.display_name ? p.display_name : `Creator #${uid.slice(0, 4)}`;
      return { user_id: uid, name: showName, weekXp: xp, isMe: uid === userId };
    });

    return {
      tier: myTier.id,
      tierLabel: myTier.label,
      tierEmoji: myTier.emoji,
      tierColor: myTier.color,
      nextTier: nextTierDef
        ? { id: nextTierDef.id, label: nextTierDef.label, emoji: nextTierDef.emoji, xpToNext: Math.max(0, nextTierDef.minXp - myWeekXp) }
        : undefined,
      weekXp: myWeekXp,
      rank,
      totalInTier: sameTier.length,
      daysLeft: daysLeft(),
      weekStart: wStart,
      entries,
    };
  });

function emptyStats(userId: string, wStart: string): LeagueStats {
  const t = TIERS[0];
  return {
    tier: t.id,
    tierLabel: t.label,
    tierEmoji: t.emoji,
    tierColor: t.color,
    nextTier: { id: TIERS[1].id, label: TIERS[1].label, emoji: TIERS[1].emoji, xpToNext: TIERS[1].minXp },
    weekXp: 0,
    rank: 1,
    totalInTier: 1,
    daysLeft: daysLeft(),
    weekStart: wStart,
    entries: [{ user_id: userId, name: "you", weekXp: 0, isMe: true }],
  };
}
