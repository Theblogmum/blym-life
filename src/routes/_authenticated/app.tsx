import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Flame, Wand2, Calendar, Heart, ArrowRight,
  MessageSquare, TrendingUp, DollarSign, Trophy, Check,
  Camera, Send, PenLine, Rocket,
} from "lucide-react";
import { getDashboard } from "@/lib/dashboard.functions";
import { getMe } from "@/lib/profile.functions";
import { getXp } from "@/lib/xp.functions";
import { TrialPill } from "@/components/trial-pill";
import { EraRibbon } from "@/components/era-theme";
import { getDailyIdea } from "@/lib/daily-idea.functions";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { celebrate as fxCelebrate, pop as fxPop } from "@/lib/celebrate";
import { registerComboHit } from "@/lib/combo";

export const Route = createFileRoute("/_authenticated/app")({ component: HomePage });


// BLYM creator path — 10 levels, identity-first
const BLYM_LEVELS = [
  { n: 1, title: "Nervous Beginner", emoji: "🌱", blurb: "you showed up. that's already huge." },
  { n: 2, title: "Content Rookie", emoji: "🐣", blurb: "you've got the bug now." },
  { n: 3, title: "Brand Ready", emoji: "✨", blurb: "your vibe's coming together." },
  { n: 4, title: "Pitching Era", emoji: "💌", blurb: "sliding into brand DMs." },
  { n: 5, title: "Paid Creator", emoji: "💸", blurb: "they finally paid you. iconic." },
  { n: 6, title: "Consistent Queen", emoji: "👑", blurb: "showing up like it's your job." },
  { n: 7, title: "Niche Authority", emoji: "🎯", blurb: "people know what you're about." },
  { n: 8, title: "Brand Magnet", emoji: "🧲", blurb: "they're pitching YOU now." },
  { n: 9, title: "Booked", emoji: "📈", blurb: "the calendar's filling up." },
  { n: 10, title: "Booked & Busy", emoji: "🔥", blurb: "you made it. literally." },
];

const blymLevel = (n: number) => BLYM_LEVELS[Math.min(Math.max(1, n), 10) - 1];

// Daily missions — small, achievable, dopamine
const MISSIONS = [
  { id: "film", label: "Film one tiny clip", hint: "10 seconds counts.", icon: Camera, xp: 15, to: "/film-this" },
  { id: "hooks", label: "Write 3 hooks", hint: "Scroll-stoppers in the Lab.", icon: PenLine, xp: 10, to: "/viral-lab" },
  { id: "pitch", label: "Find a brand to pitch", hint: "Just one. We'll help.", icon: Send, xp: 20, to: "/brand-hub" },
];

const QUICK_TOOLS = [
  { to: "/viral-lab", label: "Hook lab", icon: Flame, tint: "var(--surface-peach)", iconColor: "text-[oklch(0.55_0.22_8)]" },
  { to: "/generator", label: "Script me", icon: Wand2, tint: "var(--surface-blush)", iconColor: "text-[oklch(0.55_0.22_340)]" },
  { to: "/generator", label: "Caption it", icon: MessageSquare, tint: "var(--surface-butter)", iconColor: "text-[oklch(0.5_0.16_60)]" },
  { to: "/planner", label: "Plan week", icon: Calendar, tint: "var(--surface-sky)", iconColor: "text-[oklch(0.5_0.16_220)]" },
  { to: "/brand-hub", label: "Find brands", icon: Trophy, tint: "var(--surface-mint)", iconColor: "text-[oklch(0.45_0.14_155)]" },
  { to: "/motivation", label: "Pep talk", icon: Heart, tint: "var(--surface-rose)", iconColor: "text-[oklch(0.55_0.22_10)]" },
  { to: "/insights", label: "What worked", icon: TrendingUp, tint: "var(--surface-grape)", iconColor: "text-[oklch(0.5_0.18_280)]" },
  { to: "/business", label: "Get paid", icon: DollarSign, tint: "var(--surface-stone)", iconColor: "text-[oklch(0.45_0.14_140)]" },
];

// Badge catalog — identity-driven, collectible
const BADGES = [
  { id: "first_post", label: "First Post", emoji: "🎬", glow: "oklch(0.75 0.16 30)", check: (d: any) => (d?.posts_last_7 ?? 0) > 0 || (d?.portfolio_recent?.length ?? 0) > 0 },
  { id: "streak_3", label: "3-Day Streak", emoji: "🔥", glow: "oklch(0.7 0.2 45)", check: (d: any) => (d?.streak ?? 0) >= 3 },
  { id: "streak_7", label: "Week Strong", emoji: "⚡", glow: "oklch(0.78 0.18 85)", check: (d: any) => (d?.streak ?? 0) >= 7 },
  { id: "posted_thru_fear", label: "Posted Thru Fear", emoji: "🦋", glow: "oklch(0.72 0.15 220)", check: (d: any) => (d?.posts_last_7 ?? 0) >= 1 },
  { id: "consistent", label: "Chaotic but Consistent", emoji: "💫", glow: "oklch(0.72 0.16 295)", check: (d: any) => (d?.posts_last_7 ?? 0) >= 3 },
  { id: "first_pitch", label: "First Pitch", emoji: "💌", glow: "oklch(0.75 0.14 350)", check: () => false },
  { id: "paid", label: "Got Paid", emoji: "💸", glow: "oklch(0.7 0.16 155)", check: (d: any) => (d?.income_this_month ?? 0) > 0 },
  { id: "nap_hustler", label: "Nap-Time Hustler", emoji: "☕", glow: "oklch(0.7 0.12 60)", check: () => false },
];

function HomePage() {
  const fetchDash = useServerFn(getDashboard);
  const fetchMe = useServerFn(getMe);
  const fetchXp = useServerFn(getXp);
  const fetchIdea = useServerFn(getDailyIdea);
  const navigate = useNavigate();

  const me = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDash() });
  const xpQ = useQuery({ queryKey: ["xp"], queryFn: () => fetchXp() });
  const idea = useQuery({
    queryKey: ["daily-idea", new Date().toISOString().slice(0, 10)],
    queryFn: () => fetchIdea(),
    staleTime: 1000 * 60 * 60 * 6,
  });

  useEffect(() => {
    if (me.data?.profile && !me.data.profile.onboarded) navigate({ to: "/onboarding" });
    else if (typeof window !== "undefined" && me.data?.profile?.onboarded && !localStorage.getItem("blym.onboarded")) {
      navigate({ to: "/welcome" });
    }
  }, [me.data, navigate]);

  // Mission progress — local persistence per day (will persist to DB later)
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `blym:missions:${todayKey}`;
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [celebrate, setCelebrate] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setDone(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  const toggleMission = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    if (!done[id]) {
      setCelebrate(id);
      setTimeout(() => setCelebrate(null), 1400);
      // dopamine + combo: chain missions within 90s for an XP multiplier
      const completedCount = Object.values(next).filter(Boolean).length;
      const mission = MISSIONS.find((m) => m.id === id);
      const combo = registerComboHit(mission?.xp ?? 0);
      if (completedCount >= 3) fxCelebrate("big");
      else if (combo.count >= 3) fxCelebrate("normal");
      else fxCelebrate("tiny");
    } else {
      fxPop();
    }
  };

  const missionsDone = Object.values(done).filter(Boolean).length;
  const missionsXp = MISSIONS.reduce((a, m) => a + (done[m.id] ? m.xp : 0), 0);

  const today = new Date();
  const greet = today.getHours() < 12 ? "morning" : today.getHours() < 18 ? "afternoon" : "evening";
  const d = dash.data;
  const xp = xpQ.data;
  const name = (d?.name?.split(" ")[0] ?? "you").toLowerCase();

  const streak = d?.streak ?? 0;
  const postsWeek = d?.posts_last_7 ?? 0;

  // BLYM level mapping — use server XP level, mapped to BLYM identity titles
  const lvl = blymLevel(xp?.level ?? 1);
  const nextLvl = blymLevel(Math.min(10, (xp?.level ?? 1) + 1));
  const xpProgress = xp
    ? Math.round(((xp.xp - xp.prevLevelXp) / Math.max(1, xp.nextLevelXp - xp.prevLevelXp)) * 100)
    : 0;

  // Earned vs locked badges
  const earned = useMemo(() => BADGES.filter((b) => b.check(d)).map((b) => b.id), [d]);
  const locked = BADGES.filter((b) => !earned.includes(b.id));

  // Vibe-aware opener
  const opener =
    streak >= 3 ? `🔥 ${streak} days in a row, ${name}. you're cooked (in a good way).`
    : streak === 0 && postsWeek === 0 ? `welcome back ${name}. one tiny post and we're back in it.`
    : `good ${greet}, ${name} — let's bank a small win today.`;

  return (
    <div className="relative pb-8">
      {/* ============ HERO: greeting + level card ============ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "var(--era-grad)", opacity: 0.38 }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent, var(--background))" }}
        />
        <div className="relative mx-auto max-w-[1200px] px-5 pb-8 pt-8 sm:px-8 lg:px-12 lg:pb-14 lg:pt-12">
          <div className="mb-5">
            <EraRibbon />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-[28px] font-bold leading-[1.08] tracking-[-0.018em] text-balance sm:text-[40px]">
                {opener}
              </h1>
            </div>
            <TrialPill />
          </div>

          {/* LEVEL CARD — the heartbeat */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {/* Big level/XP card */}
            <div
              className="relative col-span-2 overflow-hidden rounded-[2rem] p-6 sm:p-7 shadow-[var(--shadow-layered)]"
              style={{ background: "linear-gradient(135deg, oklch(0.24 0.05 295), oklch(0.16 0.04 290))" }}
            >
              <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-40 blur-3xl" style={{ background: "var(--gradient-bloom)" }} />
              <div aria-hidden className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full opacity-25 blur-3xl" style={{ background: "var(--gradient-mint)" }} />
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
                    <Rocket className="h-3 w-3" /> Level {xp?.level ?? 1}
                  </span>
                  <span className="text-[11px] font-medium tabular-nums text-white/60">
                    {xp ? `${xp.xp - xp.prevLevelXp} / ${xp.nextLevelXp - xp.prevLevelXp} XP` : "—"}
                  </span>
                </div>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="text-[40px] leading-none">{lvl.emoji}</span>
                  <div>
                    <h2 className="font-display text-[26px] font-bold leading-none tracking-[-0.012em] text-white sm:text-[32px]">
                      {lvl.title}
                    </h2>
                    <p className="mt-2 text-[13px] leading-snug text-white/65">{lvl.blurb}</p>
                  </div>
                </div>
                <div className="mt-7">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(4, xpProgress))}%`,
                        background: "linear-gradient(90deg, oklch(0.82 0.16 60), oklch(0.72 0.22 350))",
                      }}
                    />
                  </div>
                  <p className="mt-3 text-[12px] text-white/60">
                    next up: <span className="font-semibold text-white/90">{nextLvl.title}</span> {nextLvl.emoji}
                  </p>
                </div>
              </div>
            </div>

            {/* Streak flame card */}
            <div
              className={cn(
                "relative overflow-hidden rounded-[2rem] p-6 shadow-[var(--shadow-layered)]",
                streak > 0 && "pulse-glow",
              )}
              style={{
                background: streak > 0
                  ? "linear-gradient(160deg, oklch(0.96 0.06 70), oklch(0.92 0.11 30))"
                  : "linear-gradient(160deg, oklch(0.98 0.012 70), oklch(0.94 0.02 60))",
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
                {streak > 0 ? "streak alive" : "start a streak"}
              </p>
              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="text-[52px] leading-none">{streak > 0 ? "🔥" : "🌱"}</span>
                <div>
                  <p className="font-display text-[40px] font-bold leading-none tabular-nums tracking-[-0.02em]">{streak}</p>
                  <p className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-foreground/55">
                    {streak === 1 ? "day" : "days"}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[12.5px] leading-relaxed text-foreground/70">
                {streak >= 7 ? "you survived the week. proud x"
                  : streak >= 3 ? "don't break it now girl 🫣"
                  : streak > 0 ? "tomorrow you keep it going."
                  : "one post today. that's it. that's the move."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-4 sm:px-8 lg:px-12">
        {/* ============ TODAY'S MISSIONS ============ */}
        <section className="mb-12 sm:mb-14">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">today's missions</p>
              <h2 className="mt-2 font-display text-[24px] font-bold leading-tight tracking-[-0.015em] sm:text-[30px]">
                3 tiny wins. pick any.
              </h2>
            </div>
            <div className="rounded-full bg-foreground px-3.5 py-1.5 text-[11.5px] font-semibold text-background tabular-nums">
              {missionsDone}/3 · +{missionsXp} XP
            </div>
          </div>

          <ul className="space-y-2">
            {MISSIONS.map((m) => {
              const isDone = !!done[m.id];
              const isCelebrating = celebrate === m.id;
              return (
                <li key={m.id}>
                  <div
                    className={cn(
                      "group relative overflow-hidden rounded-xl border px-4 py-3 transition-all duration-300 sm:px-5 sm:py-3.5",
                      isDone
                        ? "border-[oklch(0.78_0.1_155)]/50 bg-[oklch(0.97_0.04_155)]/70"
                        : "border-border/40 bg-card hover:-translate-y-[2px] hover:border-primary/40 hover:bg-card hover:shadow-[var(--shadow-elegant)]",
                    )}
                  >
                    {isCelebrating && (
                      <div className="pointer-events-none absolute inset-0 grid place-items-center sparkle-pop">
                        <span className="text-[40px]">✨</span>
                      </div>
                    )}
                    <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-primary/70 transition-transform duration-300 group-hover:scale-y-100" />
                    <div className="flex items-center gap-3.5">
                      <button
                        onClick={() => toggleMission(m.id)}
                        aria-label={isDone ? "Mark undone" : "Mark done"}
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-all duration-300 active:scale-90",
                          isDone
                            ? "bg-[oklch(0.6_0.16_155)] text-white scale-105 shadow-[0_4px_14px_-4px_oklch(0.6_0.16_155/0.5)]"
                            : "bg-foreground/[0.05] text-foreground/60 group-hover:bg-foreground group-hover:text-background group-hover:scale-105",
                        )}
                      >
                        {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : <m.icon className="h-4 w-4" strokeWidth={2.25} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-[14.5px] font-semibold leading-tight tracking-[-0.005em]",
                          isDone && "line-through opacity-55",
                        )}>
                          {m.label}
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground/90 line-clamp-1">{m.hint}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="rounded-full bg-foreground/[0.05] px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-foreground/65">
                          +{m.xp} XP
                        </span>
                        <Link to={m.to}>
                          <Button size="sm" variant="ghost" className="group/btn h-8 rounded-lg px-2 text-[12px] text-foreground/65 hover:bg-foreground/[0.04] hover:text-foreground">
                            Go <ArrowRight className="ml-0.5 h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ============ FILM THIS NOW giant CTA ============ */}
        <section className="mb-12 sm:mb-14">
          <Link
            to="/film-this"
            className="group relative block overflow-hidden rounded-[2rem] p-7 sm:p-10 shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
            style={{ background: "linear-gradient(135deg, oklch(0.82 0.13 35) 0%, oklch(0.78 0.12 15) 30%, oklch(0.76 0.13 350) 60%, oklch(0.72 0.13 295) 100%)" }}
          >
            <div aria-hidden className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
            <div aria-hidden className="absolute -bottom-20 -left-12 h-60 w-60 rounded-full bg-white/15 blur-3xl" />
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.95_0.06_60/0.25),transparent_60%)]" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                  <Sparkles className="h-3 w-3" /> instant idea
                </span>
                <h2 className="mt-4 font-display text-[32px] font-bold leading-[1.04] tracking-[-0.018em] text-white sm:text-[46px]">
                  Film this. Now.
                </h2>
                <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-white/85">
                  one tap. a hook, a shot list, a caption. before you overthink it.
                </p>
              </div>
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-foreground shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg] sm:h-20 sm:w-20">
                <Camera className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={2} />
              </div>
            </div>
          </Link>
        </section>

        {/* ============ DAILY IDEA ============ */}
        <section className="mb-12 sm:mb-14">
          <div
            className="relative overflow-hidden rounded-[2rem] border border-border/50 p-6 sm:p-8 shadow-[var(--shadow-soft)]"
            style={{
              background: "radial-gradient(120% 80% at 0% 0%, oklch(0.96 0.05 60 / 0.55), transparent 55%), radial-gradient(120% 80% at 100% 100%, oklch(0.94 0.07 340 / 0.4), transparent 55%), var(--card)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[image:var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-soft)]">
                  <Sparkles className="h-3 w-3" />
                </span>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-foreground/65">
                  today's free idea
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full px-3 text-[11.5px] text-foreground/70 hover:text-foreground"
                onClick={() => idea.refetch()}
              >
                another
              </Button>
            </div>

            {idea.isLoading ? (
              <div className="mt-5 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : idea.data ? (
              <div className="mt-5">
                <p className="font-display text-[22px] font-semibold leading-snug tracking-[-0.012em] text-balance sm:text-[28px]">
                  "{idea.data.idea.hook}"
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-foreground/[0.08] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-foreground/70">
                    {idea.data.idea.format}
                  </span>
                  <span className="text-[12.5px] text-muted-foreground">{idea.data.idea.why}</span>
                </div>
                <div className="mt-6">
                  <Link to="/generator">
                    <Button size="sm" className="h-10 rounded-full bg-foreground px-4 text-[13px] text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-[var(--shadow-soft)]">
                      <Wand2 className="mr-1.5 h-3.5 w-3.5" /> make it a script
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">hiding today — tap "another".</p>
            )}
          </div>
        </section>

        {/* ============ BADGES SHELF ============ */}
        <section className="mb-12 sm:mb-14">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="eyebrow">badges</p>
              <h2 className="mt-2 font-display text-[24px] font-bold leading-tight tracking-[-0.015em] sm:text-[30px]">
                you, collected.
              </h2>
            </div>
            <span className="text-[12px] font-medium tabular-nums text-foreground/60">
              {earned.length}/{BADGES.length}
            </span>
          </div>
          <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
            <ul className="flex gap-3">
              {BADGES.map((b) => {
                const got = earned.includes(b.id);
                return (
                  <li key={b.id} className="shrink-0">
                    <div
                      className={cn(
                        "flex h-[108px] w-[96px] flex-col items-center justify-center gap-2 rounded-2xl p-2.5 text-center transition-all duration-300",
                        got
                          ? "bg-card border border-border/50 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
                          : "border border-dashed border-border/60 bg-foreground/[0.02]",
                      )}
                    >
                      <span className={cn("text-[30px] leading-none", !got && "grayscale opacity-25")}>
                        {got ? b.emoji : "🔒"}
                      </span>
                      <span className={cn(
                        "px-1 text-[10.5px] font-semibold leading-tight",
                        got ? "text-foreground" : "text-foreground/40",
                      )}>
                        {b.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ============ QUICK TOOLS — playful grid ============ */}
        <section className="mb-12 sm:mb-14">
          <div className="mb-5">
            <p className="eyebrow">need a hand?</p>
            <h2 className="mt-2 font-display text-[24px] font-bold leading-tight tracking-[-0.015em] sm:text-[30px]">
              your toolkit.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_TOOLS.map((t) => (
              <Link
                key={t.label + t.to}
                to={t.to}
                className="group relative flex flex-col gap-3.5 rounded-2xl border border-border/40 p-5 shadow-[var(--shadow-xs)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-elegant)]"
                style={{ background: t.tint }}
              >
                <span className={cn("grid h-11 w-11 place-items-center rounded-xl bg-white/85 backdrop-blur transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]", t.iconColor)}>
                  <t.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="text-[14px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
                  {t.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ============ THIS WEEK ============ */}
        <section>
          <ConsistencyWidget postsWeek={postsWeek} streak={streak} />
        </section>
      </div>
    </div>
  );
}

function ConsistencyWidget({ postsWeek, streak }: { postsWeek: number; streak: number }) {
  const today = new Date();
  const filled = Math.min(7, postsWeek);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      isToday: i === 6,
      filled: i >= 7 - filled,
    };
  });
  const goal = 5;
  const pct = Math.min(100, Math.round((postsWeek / goal) * 100));
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-card p-6 sm:p-8 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <p className="eyebrow">this week</p>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground/70">
          <Flame className="h-3.5 w-3.5 text-[oklch(0.6_0.2_30)]" /> {streak}d
        </span>
      </div>
      <p className="mt-4 font-display text-[44px] font-bold leading-none tabular-nums tracking-[-0.02em]">
        {postsWeek}
        <span className="ml-2 text-[14px] font-normal text-foreground/55">/ {goal} posts</span>
      </p>
      <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
        {pct >= 100 ? "you hit your rhythm. proud of you x"
          : postsWeek === 0 ? "no posts yet — and that's okay. one tiny one resets everything."
          : `${pct}% there. tiny progress still counts.`}
      </p>
      <div className="mt-6 flex items-end justify-between gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={
                d.filled
                  ? "h-10 w-full rounded-lg bg-[image:var(--gradient-warm)] shadow-[var(--shadow-soft)]"
                  : d.isToday
                  ? "h-10 w-full rounded-lg border-2 border-dashed border-foreground/30 bg-foreground/[0.04]"
                  : "h-10 w-full rounded-lg bg-foreground/[0.06]"
              }
              aria-hidden
            />
            <span className={`text-[10.5px] font-medium ${d.isToday ? "text-foreground" : "text-foreground/50"}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
