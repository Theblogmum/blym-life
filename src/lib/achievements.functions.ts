import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type Achievement = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  tone: "warm" | "bloom" | "mint" | "sky" | "butter" | "blush";
  progress: number; // 0..1
  unlocked: boolean;
  current: number;
  goal: number;
  unit: string;
};

type Def = Omit<Achievement, "progress" | "unlocked" | "current"> & {
  measure: (s: Stats) => number;
};

type Stats = {
  totalXp: number;
  streak: number;
  pitchesSent: number;
  postsLogged: number;
  invoices: number;
  affiliates: number;
  goals: number;
  level: number;
};

const DEFS: Def[] = [
  { id: "first-step",    label: "First Step",        description: "Earn your first 10 XP.",            emoji: "🌱", tone: "mint",   goal: 10,  unit: "XP",        measure: s => s.totalXp },
  { id: "warming-up",    label: "Warming Up",        description: "Hit 100 XP — you're rolling.",     emoji: "🔥", tone: "warm",   goal: 100, unit: "XP",        measure: s => s.totalXp },
  { id: "five-figs",     label: "Half-Grand Club",   description: "Reach 500 lifetime XP.",            emoji: "🏅", tone: "butter", goal: 500, unit: "XP",        measure: s => s.totalXp },
  { id: "xp-titan",      label: "XP Titan",          description: "1,000 lifetime XP. Iconic.",        emoji: "👑", tone: "bloom",  goal: 1000,unit: "XP",        measure: s => s.totalXp },
  { id: "streak-3",      label: "Three in a Row",    description: "Show up 3 days running.",           emoji: "✨", tone: "sky",    goal: 3,   unit: "days",      measure: s => s.streak },
  { id: "streak-7",      label: "Week Warrior",      description: "7-day streak unlocked.",            emoji: "🔥", tone: "warm",   goal: 7,   unit: "days",      measure: s => s.streak },
  { id: "streak-30",     label: "Unstoppable",       description: "30-day streak. Untouchable.",        emoji: "💎", tone: "sky",    goal: 30,  unit: "days",      measure: s => s.streak },
  { id: "first-pitch",   label: "Brave Sender",      description: "Sent your first brand pitch.",      emoji: "📬", tone: "bloom",  goal: 1,   unit: "pitches",   measure: s => s.pitchesSent },
  { id: "pitch-10",      label: "Pitch Pro",         description: "10 pitches sent.",                  emoji: "💌", tone: "bloom",  goal: 10,  unit: "pitches",   measure: s => s.pitchesSent },
  { id: "first-log",     label: "Data Witch",        description: "Logged your first post.",            emoji: "📊", tone: "mint",   goal: 1,   unit: "posts",     measure: s => s.postsLogged },
  { id: "post-25",       label: "Pattern Seeker",    description: "25 posts logged — patterns ahead.", emoji: "🔍", tone: "mint",   goal: 25,  unit: "posts",     measure: s => s.postsLogged },
  { id: "first-invoice", label: "Get Paid",          description: "Saved your first invoice.",          emoji: "🧾", tone: "warm",   goal: 1,   unit: "invoices",  measure: s => s.invoices },
  { id: "first-aff",     label: "Link Stacker",      description: "Saved your first affiliate link.",   emoji: "🔗", tone: "blush",  goal: 1,   unit: "links",     measure: s => s.affiliates },
  { id: "lvl-5",         label: "Level 5 Creator",   description: "Reach creator level 5.",             emoji: "🎯", tone: "butter", goal: 5,   unit: "level",     measure: s => s.level },
  { id: "lvl-10",        label: "Level 10 Legend",   description: "Reach creator level 10.",            emoji: "🌟", tone: "bloom",  goal: 10,  unit: "level",     measure: s => s.level },
];

function levelFromXp(xp: number): number {
  // matches existing xp curve loosely (level n needs n*100 XP cumulative)
  let lvl = 1; let need = 100; let total = 0;
  while (xp >= total + need) { total += need; lvl += 1; need = Math.round(need * 1.35); }
  return lvl;
}

export const getAchievements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const [xpRow, eventsRow, pitchesRow, postsRow, invoicesRow, affRow, goalsRow] = await Promise.all([
      supabaseAdmin.from("creator_xp").select("xp,last_claim_date").eq("user_id", userId).maybeSingle(),
      supabaseAdmin.from("xp_events").select("created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(60),
      supabaseAdmin.from("brand_pitches").select("id", { count: "exact", head: true }).eq("user_id", userId).not("sent_at", "is", null),
      supabaseAdmin.from("posts_logged").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabaseAdmin.from("invoices").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabaseAdmin.from("affiliate_links").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabaseAdmin.from("creator_goals").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);

    const totalXp = xpRow.data?.xp ?? 0;
    // streak: consecutive distinct days with xp_events ending today/yesterday
    const days = new Set<string>();
    (eventsRow.data ?? []).forEach(e => { days.add(new Date(e.created_at as string).toISOString().slice(0, 10)); });
    let streak = 0;
    const cursor = new Date();
    // allow today missing, count from yesterday too
    const todayIso = cursor.toISOString().slice(0, 10);
    if (!days.has(todayIso)) cursor.setUTCDate(cursor.getUTCDate() - 1);
    for (let i = 0; i < 60; i++) {
      const iso = cursor.toISOString().slice(0, 10);
      if (days.has(iso)) { streak += 1; cursor.setUTCDate(cursor.getUTCDate() - 1); }
      else break;
    }

    const stats: Stats = {
      totalXp,
      streak,
      pitchesSent: pitchesRow.count ?? 0,
      postsLogged: postsRow.count ?? 0,
      invoices: invoicesRow.count ?? 0,
      affiliates: affRow.count ?? 0,
      goals: goalsRow.count ?? 0,
      level: levelFromXp(totalXp),
    };

    const achievements: Achievement[] = DEFS.map(d => {
      const current = d.measure(stats);
      const progress = Math.min(1, d.goal > 0 ? current / d.goal : 0);
      return {
        id: d.id,
        label: d.label,
        description: d.description,
        emoji: d.emoji,
        tone: d.tone,
        goal: d.goal,
        unit: d.unit,
        current,
        progress,
        unlocked: current >= d.goal,
      };
    });

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    return { achievements, unlockedCount, total: achievements.length, stats };
  });
