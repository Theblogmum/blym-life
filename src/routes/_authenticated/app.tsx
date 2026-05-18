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
  { to: "/viral-lab", label: "Hook lab", icon: Flame, tint: "from-[oklch(0.97_0.05_18)] to-[oklch(0.94_0.08_8)]", iconColor: "text-[oklch(0.55_0.22_8)]" },
  { to: "/generator", label: "Script me", icon: Wand2, tint: "from-[oklch(0.96_0.04_340)] to-[oklch(0.93_0.07_330)]", iconColor: "text-[oklch(0.55_0.22_340)]" },
  { to: "/generator", label: "Caption it", icon: MessageSquare, tint: "from-[oklch(0.96_0.04_60)] to-[oklch(0.93_0.07_50)]", iconColor: "text-[oklch(0.55_0.18_60)]" },
  { to: "/planner", label: "Plan week", icon: Calendar, tint: "from-[oklch(0.95_0.03_220)] to-[oklch(0.92_0.06_210)]", iconColor: "text-[oklch(0.5_0.16_220)]" },
  { to: "/brand-hub", label: "Find brands", icon: Trophy, tint: "from-[oklch(0.95_0.04_155)] to-[oklch(0.92_0.08_150)]", iconColor: "text-[oklch(0.5_0.16_155)]" },
  { to: "/motivation", label: "Pep talk", icon: Heart, tint: "from-[oklch(0.97_0.03_10)] to-[oklch(0.94_0.06_5)]", iconColor: "text-[oklch(0.55_0.22_10)]" },
  { to: "/insights", label: "What worked", icon: TrendingUp, tint: "from-[oklch(0.96_0.04_280)] to-[oklch(0.93_0.07_270)]", iconColor: "text-[oklch(0.5_0.18_280)]" },
  { to: "/business", label: "Get paid", icon: DollarSign, tint: "from-[oklch(0.96_0.04_120)] to-[oklch(0.93_0.07_130)]", iconColor: "text-[oklch(0.45_0.16_140)]" },
];

// Badge catalog — identity-driven, collectible
const BADGES = [
  { id: "first_post", label: "First Post", emoji: "🎬", check: (d: any) => (d?.posts_last_7 ?? 0) > 0 || (d?.portfolio_recent?.length ?? 0) > 0 },
  { id: "streak_3", label: "3-Day Streak", emoji: "🔥", check: (d: any) => (d?.streak ?? 0) >= 3 },
  { id: "streak_7", label: "Week Strong", emoji: "⚡", check: (d: any) => (d?.streak ?? 0) >= 7 },
  { id: "posted_thru_fear", label: "Posted Thru Fear", emoji: "🦋", check: (d: any) => (d?.posts_last_7 ?? 0) >= 1 },
  { id: "consistent", label: "Chaotic but Consistent", emoji: "💫", check: (d: any) => (d?.posts_last_7 ?? 0) >= 3 },
  { id: "first_pitch", label: "First Pitch", emoji: "💌", check: () => false },
  { id: "paid", label: "Got Paid", emoji: "💸", check: (d: any) => (d?.income_this_month ?? 0) > 0 },
  { id: "nap_hustler", label: "Nap-Time Hustler", emoji: "☕", check: () => false },
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
      // dopamine: small pop per mission, bigger burst when all 3 done
      const completedCount = Object.values(next).filter(Boolean).length;
      if (completedCount >= 3) fxCelebrate("big");
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
    <div className="relative pb-6">
      {/* ============ HERO: greeting + level card ============ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "var(--era-grad)", opacity: 0.55 }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent, var(--background))" }}
        />
        <div className="relative mx-auto max-w-[1200px] px-4 pb-6 pt-6 lg:px-10 lg:pb-10 lg:pt-9">
          <div className="mb-4">
            <EraRibbon />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-[26px] font-black leading-[1.1] tracking-tight sm:text-[36px]">
                {opener}
              </h1>
            </div>
            <TrialPill />
          </div>

          {/* LEVEL CARD — the heartbeat */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {/* Big level/XP card */}
            <div
              className="relative col-span-2 overflow-hidden rounded-[1.75rem] p-5 sm:p-6 shadow-[var(--shadow-layered)]"
              style={{ background: "linear-gradient(135deg, oklch(0.18 0.012 20), oklch(0.1 0.01 15))" }}
            >
              <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-warm)" }} />
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur">
                    <Rocket className="h-3 w-3" /> Level {xp?.level ?? 1}
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-white/55">
                    {xp ? `${xp.xp - xp.prevLevelXp} / ${xp.nextLevelXp - xp.prevLevelXp} XP` : "—"}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2.5">
                  <span className="text-[36px] leading-none">{lvl.emoji}</span>
                  <div>
                    <h2 className="font-display text-[24px] font-black leading-none text-white sm:text-[28px]">
                      {lvl.title}
                    </h2>
                    <p className="mt-1.5 text-[12.5px] text-white/55">{lvl.blurb}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(4, xpProgress))}%`,
                        background: "linear-gradient(90deg, oklch(0.78 0.16 18), oklch(0.72 0.18 340))",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11.5px] text-white/55">
                    next up: <span className="font-semibold text-white/85">{nextLvl.title}</span> {nextLvl.emoji}
                  </p>
                </div>
              </div>
            </div>

            {/* Streak flame card */}
            <div
              className={cn(
                "relative overflow-hidden rounded-[1.75rem] p-5 shadow-[var(--shadow-layered)]",
                streak > 0 && "pulse-glow",
              )}
              style={{
                background: streak > 0
                  ? "linear-gradient(160deg, oklch(0.97 0.05 60), oklch(0.9 0.12 30))"
                  : "linear-gradient(160deg, oklch(0.97 0.01 20), oklch(0.93 0.02 20))",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/55">
                {streak > 0 ? "streak alive" : "start a streak"}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[52px] leading-none">{streak > 0 ? "🔥" : "🌱"}</span>
                <div>
                  <p className="font-display text-[36px] font-black leading-none tabular-nums">{streak}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                    {streak === 1 ? "day" : "days"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[12px] leading-snug text-foreground/65">
                {streak >= 7 ? "you survived the week. proud x"
                  : streak >= 3 ? "don't break it now girl 🫣"
                  : streak > 0 ? "tomorrow you keep it going."
                  : "one post today. that's it. that's the move."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 pb-20 pt-2 lg:px-10">
        {/* ============ TODAY'S MISSIONS ============ */}
        <section className="mb-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">today's missions</p>
              <h2 className="mt-1 font-display text-[22px] font-black leading-tight sm:text-[26px]">
                3 tiny wins. pick any.
              </h2>
            </div>
            <div className="rounded-full bg-foreground px-3 py-1.5 text-[12px] font-bold text-background tabular-nums">
              {missionsDone}/3 · +{missionsXp} XP
            </div>
          </div>

          <ul className="space-y-2.5">
            {MISSIONS.map((m) => {
              const isDone = !!done[m.id];
              const isCelebrating = celebrate === m.id;
              return (
                <li key={m.id}>
                  <div
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border-2 p-3.5 transition-all sm:p-4",
                      isDone
                        ? "border-[oklch(0.74_0.12_155)] bg-[oklch(0.96_0.04_155)]"
                        : "border-border bg-card hover:border-foreground/30 hover:shadow-[var(--shadow-soft)]",
                    )}
                  >
                    {isCelebrating && (
                      <div className="pointer-events-none absolute inset-0 grid place-items-center sparkle-pop">
                        <span className="text-[44px]">✨</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3.5">
                      <button
                        onClick={() => toggleMission(m.id)}
                        aria-label={isDone ? "Mark undone" : "Mark done"}
                        className={cn(
                          "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-all",
                          isDone
                            ? "bg-[oklch(0.55_0.16_155)] text-white scale-105"
                            : "bg-foreground/8 text-foreground/70 hover:bg-foreground hover:text-background",
                        )}
                      >
                        {isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : <m.icon className="h-5 w-5" strokeWidth={2} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-[15px] font-bold leading-tight",
                          isDone && "line-through opacity-60",
                        )}>
                          {m.label}
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">{m.hint}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-foreground/8 px-2 py-1 text-[10.5px] font-bold tabular-nums text-foreground/70">
                          +{m.xp} XP
                        </span>
                        <Link to={m.to}>
                          <Button size="sm" variant="ghost" className="h-9 rounded-lg px-2 text-[12px]">
                            Go <ArrowRight className="ml-0.5 h-3 w-3" />
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
        <section className="mb-8">
          <Link
            to="/film-this"
            className="group relative block overflow-hidden rounded-[2rem] p-6 sm:p-8 shadow-[var(--shadow-elegant)] transition-transform hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, oklch(0.62 0.22 8), oklch(0.52 0.24 12) 60%, oklch(0.45 0.22 340))" }}
          >
            <div aria-hidden className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
            <div aria-hidden className="absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  <Sparkles className="h-3 w-3" /> instant idea
                </span>
                <h2 className="mt-3 font-display text-[30px] font-black leading-[1.05] text-white sm:text-[42px]">
                  Film this. Now.
                </h2>
                <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/80">
                  one tap. a hook, a shot list, a caption. before you overthink it.
                </p>
              </div>
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-foreground transition group-hover:scale-110 sm:h-20 sm:w-20">
                <Camera className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={2} />
              </div>
            </div>
          </Link>
        </section>

        {/* ============ DAILY IDEA ============ */}
        <section className="mb-8">
          <div
            className="relative overflow-hidden rounded-[1.75rem] p-5 sm:p-6 shadow-[var(--shadow-soft)]"
            style={{
              background: "radial-gradient(120% 80% at 0% 0%, oklch(0.97 0.03 18 / 0.7), transparent 55%), radial-gradient(120% 80% at 100% 100%, oklch(0.96 0.04 340 / 0.55), transparent 55%), var(--card)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[image:var(--gradient-warm)] text-primary-foreground">
                  <Sparkles className="h-3 w-3" />
                </span>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-foreground/65">
                  today's free idea
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 rounded-lg px-2 text-[11.5px]"
                onClick={() => idea.refetch()}
              >
                another
              </Button>
            </div>

            {idea.isLoading ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : idea.data ? (
              <div className="mt-4">
                <p className="font-display text-[20px] font-bold leading-snug sm:text-[24px]">
                  "{idea.data.idea.hook}"
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-foreground/75">
                    {idea.data.idea.format}
                  </span>
                  <span className="text-[12px] text-muted-foreground">{idea.data.idea.why}</span>
                </div>
                <div className="mt-4">
                  <Link to="/generator">
                    <Button size="sm" className="h-9 rounded-lg bg-foreground text-background hover:bg-foreground/90">
                      <Wand2 className="mr-1.5 h-3.5 w-3.5" /> make it a script
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">hiding today — tap "another".</p>
            )}
          </div>
        </section>

        {/* ============ BADGES SHELF ============ */}
        <section className="mb-8">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">badges</p>
              <h2 className="mt-1 font-display text-[22px] font-black leading-tight sm:text-[26px]">
                you, collected.
              </h2>
            </div>
            <span className="text-[11.5px] font-semibold tabular-nums text-foreground/55">
              {earned.length}/{BADGES.length}
            </span>
          </div>
          <div className="-mx-4 overflow-x-auto px-4 pb-2">
            <ul className="flex gap-2.5">
              {BADGES.map((b) => {
                const got = earned.includes(b.id);
                return (
                  <li key={b.id} className="shrink-0">
                    <div
                      className={cn(
                        "flex h-[100px] w-[88px] flex-col items-center justify-center gap-1.5 rounded-2xl p-2 text-center transition",
                        got
                          ? "bg-card shadow-[var(--shadow-soft)] border border-border"
                          : "border border-dashed border-border bg-foreground/[0.03]",
                      )}
                    >
                      <span className={cn("text-[28px] leading-none", !got && "grayscale opacity-30")}>
                        {got ? b.emoji : "🔒"}
                      </span>
                      <span className={cn(
                        "px-1 text-[10px] font-bold leading-tight",
                        got ? "text-foreground" : "text-foreground/35",
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
        <section className="mb-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/55">
            need a hand?
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {QUICK_TOOLS.map((t) => (
              <Link
                key={t.label + t.to}
                to={t.to}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]",
                  "bg-gradient-to-br",
                  t.tint,
                )}
              >
                <span className={cn("grid h-10 w-10 place-items-center rounded-xl bg-white/80 backdrop-blur", t.iconColor)}>
                  <t.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="text-[13.5px] font-bold leading-tight text-foreground">
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
    <div className="relative overflow-hidden rounded-[1.75rem] bg-card p-5 sm:p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-foreground/55">this week</p>
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-foreground/65">
          <Flame className="h-3.5 w-3.5 text-[oklch(0.6_0.2_30)]" /> {streak}d
        </span>
      </div>
      <p className="mt-3 font-display text-[40px] font-black leading-none tabular-nums">
        {postsWeek}
        <span className="ml-1.5 text-[14px] font-normal text-foreground/55">/ {goal} posts</span>
      </p>
      <p className="mt-1.5 text-[12.5px] text-muted-foreground">
        {pct >= 100 ? "you hit your rhythm. proud of you x"
          : postsWeek === 0 ? "no posts yet — and that's okay. one tiny one resets everything."
          : `${pct}% there. tiny progress still counts.`}
      </p>
      <div className="mt-5 flex items-end justify-between gap-1.5">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={
                d.filled
                  ? "h-9 w-full rounded-md bg-[image:var(--gradient-warm)]"
                  : d.isToday
                  ? "h-9 w-full rounded-md border-2 border-dashed border-foreground/30 bg-foreground/5"
                  : "h-9 w-full rounded-md bg-foreground/8"
              }
              aria-hidden
            />
            <span className={`text-[10px] font-semibold ${d.isToday ? "text-foreground" : "text-foreground/45"}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
