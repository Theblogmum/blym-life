import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Flame, ArrowRight, DollarSign, Check,
  Camera, Send, PenLine, Rocket, HeartHandshake,
} from "lucide-react";
import { getDashboard } from "@/lib/dashboard.functions";
import { getMe } from "@/lib/profile.functions";
import { getXp } from "@/lib/xp.functions";
import { TrialPill } from "@/components/trial-pill";
import { EraRibbon } from "@/components/era-theme";
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

// Only the BEST emotional/value tools — quiet shortcuts, not a tool drawer.
const QUICK_TOOLS = [
  { to: "/film-this",          label: "Film this now",     hint: "one ready brief",   icon: Camera,         glow: "oklch(0.74 0.18 15)"  },
  { to: "/viral-lab",          label: "Hook lab",          hint: "scroll-stoppers",   icon: Flame,          glow: "oklch(0.78 0.18 25)"  },
  { to: "/rejection-recovery", label: "Rejection recovery", hint: "soft reply, sent", icon: HeartHandshake, glow: "oklch(0.72 0.22 340)" },
  { to: "/business",           label: "Track money",       hint: "the receipts",      icon: DollarSign,     glow: "oklch(0.68 0.16 145)" },
];

function HomePage() {
  const fetchDash = useServerFn(getDashboard);
  const fetchMe = useServerFn(getMe);
  const fetchXp = useServerFn(getXp);
  const navigate = useNavigate();

  const me = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDash() });
  const xpQ = useQuery({ queryKey: ["xp"], queryFn: () => fetchXp() });

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

  // Vibe-aware opener
  const opener =
    streak >= 3 ? `🔥 ${streak} days in a row, ${name}. you're cooked (in a good way).`
    : streak === 0 && postsWeek === 0 ? `welcome back ${name}. one tiny post and we're back in it.`
    : `good ${greet}, ${name} — let's bank a small win today.`;

  return (
    <div className="relative pb-8">
      {/* ============ AMBIENT PAGE ATMOSPHERE — soft drifting blooms ============ */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bloom-drift absolute -top-32 -left-24 h-[520px] w-[520px] rounded-full opacity-[0.55] blur-[120px]"
             style={{ background: "radial-gradient(circle, oklch(0.92 0.1 30 / 0.7), transparent 65%)" }} />
        <div className="bloom-drift--slow absolute top-[18%] -right-32 h-[600px] w-[600px] rounded-full opacity-[0.5] blur-[140px]"
             style={{ background: "radial-gradient(circle, oklch(0.9 0.11 340 / 0.65), transparent 65%)" }} />
        <div className="bloom-drift absolute top-[55%] left-[-10%] h-[640px] w-[640px] rounded-full opacity-[0.42] blur-[150px]"
             style={{ animationDelay: "-6s", background: "radial-gradient(circle, oklch(0.9 0.1 85 / 0.55), transparent 65%)" }} />
        <div className="bloom-drift--slow absolute bottom-[8%] right-[-8%] h-[560px] w-[560px] rounded-full opacity-[0.4] blur-[140px]"
             style={{ animationDelay: "-12s", background: "radial-gradient(circle, oklch(0.88 0.1 290 / 0.55), transparent 65%)" }} />
      </div>

      {/* ============ HERO: greeting + level card ============ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "var(--era-grad)", opacity: 0.28 }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent, var(--background))" }}
        />
        <div className="relative mx-auto max-w-[1200px] px-5 pb-6 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10">
          <div className="mb-4">
            <EraRibbon />
          </div>
          <div className="grid items-start gap-5 lg:grid-cols-[1fr_460px] lg:gap-8">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-4">
                <h1 className="max-w-[18ch] font-display text-[34px] font-bold leading-[1.08] tracking-[-0.018em] text-balance sm:max-w-[20ch] sm:text-[48px]">
                  {opener}
                </h1>
                <TrialPill />
              </div>
              {/* one encouraging sentence — always visible, emotional anchor */}
              <p className="mt-4 max-w-[34ch] text-[14.5px] leading-relaxed text-foreground/65 sm:text-[16px]">
                you're closer than you think. one tiny thing today still counts.
              </p>
              {/* magic moment — floating encouragement sticker (mobile/tablet) */}
              <div
                aria-hidden
                className="sticker-bob mt-4 inline-flex select-none lg:hidden"
                style={{ ["--sticker-rot" as any]: "-6deg" }}
              >
                <div className="rounded-full bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold text-foreground/75 shadow-[0_10px_30px_-12px_oklch(0.66_0.24_350/0.35)] ring-1 ring-white/60 backdrop-blur">
                  ✨ you showed up — that's the win
                </div>
              </div>
            </div>

            {/* CONTENT ROOKIE — slotted into the hero gap on desktop */}
            <div
              className="relative hidden overflow-hidden rounded-[2.25rem] p-9 lg:block"
              style={{
                background: "linear-gradient(135deg, oklch(0.96 0.04 320) 0%, oklch(0.94 0.06 340) 45%, oklch(0.93 0.07 50) 100%)",
                boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.7), 0 1px 2px oklch(0.13 0.012 20 / 0.04), 0 20px 50px -28px oklch(0.66 0.24 350 / 0.28)",
              }}
            >
              <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-50 blur-3xl" style={{ background: "var(--gradient-bloom)" }} />
              <div aria-hidden className="absolute -bottom-20 -left-14 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-mint)" }} />
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.18em] text-foreground/75 backdrop-blur ring-1 ring-white/60">
                    <Rocket className="h-4 w-4" /> Level {xp?.level ?? 1}
                  </span>
                  <span className="text-[14px] font-medium tabular-nums text-foreground/55">
                    {xp ? `${xp.xp - xp.prevLevelXp} / ${xp.nextLevelXp - xp.prevLevelXp} XP` : "—"}
                  </span>
                </div>
                <div className="mt-6 flex items-baseline gap-4">
                  <span className="text-[54px] leading-none">{lvl.emoji}</span>
                  <div>
                    <h2 className="font-display text-[36px] font-bold leading-none tracking-[-0.012em] text-foreground">
                      {lvl.title}
                    </h2>
                    <p className="mt-2.5 text-[15px] leading-snug text-foreground/65">{lvl.blurb}</p>
                  </div>
                </div>
                <div className="mt-7">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-white/55 ring-1 ring-white/60">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(4, xpProgress))}%`,
                        background: "linear-gradient(90deg, oklch(0.82 0.16 60), oklch(0.72 0.22 350))",
                      }}
                    />
                  </div>
                  <p className="mt-3.5 text-[14px] text-foreground/55">
                    next up: <span className="font-semibold text-foreground/85">{nextLvl.title}</span> {nextLvl.emoji}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <div className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-2 sm:px-8 lg:px-12">

        {/* ============ LEVEL + STREAK CARDS (second row down — content rookie) ============ */}
        <section className="mb-6 sm:mb-9 lg:hidden">
          <div className="grid gap-4">
            <div
              className="relative overflow-hidden rounded-[2.25rem] p-8 sm:p-10"
              style={{
                background: "linear-gradient(135deg, oklch(0.96 0.04 320) 0%, oklch(0.94 0.06 340) 45%, oklch(0.93 0.07 50) 100%)",
                boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.7), 0 1px 2px oklch(0.13 0.012 20 / 0.04), 0 20px 50px -28px oklch(0.66 0.24 350 / 0.28)",
              }}
            >
              <div aria-hidden className="absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-50 blur-3xl" style={{ background: "var(--gradient-bloom)" }} />
              <div aria-hidden className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-mint)" }} />
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.18em] text-foreground/75 backdrop-blur ring-1 ring-white/60">
                    <Rocket className="h-4 w-4" /> Level {xp?.level ?? 1}
                  </span>
                  <span className="text-[14px] font-medium tabular-nums text-foreground/55">
                    {xp ? `${xp.xp - xp.prevLevelXp} / ${xp.nextLevelXp - xp.prevLevelXp} XP` : "—"}
                  </span>
                </div>
                <div className="mt-8 flex items-baseline gap-4">
                  <span className="text-[58px] leading-none">{lvl.emoji}</span>
                  <div>
                    <h2 className="font-display text-[36px] font-bold leading-none tracking-[-0.012em] text-foreground sm:text-[44px]">
                      {lvl.title}
                    </h2>
                    <p className="mt-3 text-[16px] leading-snug text-foreground/65">{lvl.blurb}</p>
                  </div>
                </div>
                <div className="mt-9">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-white/55 ring-1 ring-white/60">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(4, xpProgress))}%`,
                        background: "linear-gradient(90deg, oklch(0.82 0.16 60), oklch(0.72 0.22 350))",
                      }}
                    />
                  </div>
                  <p className="mt-4 text-[15px] text-foreground/55">
                    next up: <span className="font-semibold text-foreground/85">{nextLvl.title}</span> {nextLvl.emoji}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ QUICK TOOLS — premium glass grid ============ */}
        <section className="mb-6 sm:mb-9">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="font-display text-[20px] font-bold leading-tight tracking-[-0.018em] sm:text-[24px]">
              your quick access
            </h2>
            <p className="text-[11.5px] text-foreground/50">only the best</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {QUICK_TOOLS.map((t) => (
              <Link
                key={t.label + t.to}
                to={t.to}
                className="group relative flex h-[174px] flex-col justify-between overflow-hidden rounded-[1.25rem] p-5 transition-all duration-500 ease-out hover:-translate-y-[3px] sm:p-6"
                style={{
                  background: "linear-gradient(160deg, oklch(1 0 0 / 0.82), oklch(1 0 0 / 0.55))",
                  backdropFilter: "blur(8px)",
                  boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.7), 0 1px 2px oklch(0.13 0.012 20 / 0.04), 0 12px 28px -16px oklch(0.13 0.012 20 / 0.18)",
                  ["--tool-glow" as any]: t.glow,
                }}
              >
                {/* hover wash in the tool's signature color */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-12 left-1/2 h-32 w-40 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-70"
                  style={{ background: t.glow }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${t.glow} 35%, transparent)` }}
                />

                <span
                  className="relative grid h-12 w-12 place-items-center rounded-xl text-white shadow-[0_6px_16px_-6px_var(--tool-glow)] transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-[6deg]"
                  style={{ background: `linear-gradient(140deg, ${t.glow}, color-mix(in oklab, ${t.glow} 70%, oklch(0.4 0.18 295)))` }}
                >
                  <t.icon className="h-5 w-5" strokeWidth={2.25} />
                </span>

                <div className="relative">
                  <p className="text-[15px] font-semibold leading-tight tracking-[-0.008em] text-foreground/90">
                    {t.label}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug text-foreground/55">{t.hint}</p>
                </div>

                <ArrowRight
                  aria-hidden
                  className="absolute right-4 top-4 h-4 w-4 -translate-x-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-60"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* ============ TODAY'S MISSIONS ============ */}
        <section>
          <div
            className="relative overflow-hidden rounded-[1.75rem] p-4 sm:p-6"
            style={{
              background:
                "radial-gradient(120% 100% at 0% 0%, oklch(0.95 0.07 350 / 0.55), transparent 60%), radial-gradient(120% 100% at 100% 100%, oklch(0.94 0.06 20 / 0.45), transparent 60%), oklch(0.99 0.012 350 / 0.6)",
              boxShadow:
                "inset 0 1px 0 oklch(1 0 0 / 0.7), 0 1px 2px oklch(0.13 0.012 20 / 0.04), 0 24px 56px -28px oklch(0.78 0.18 350 / 0.45)",
            }}
          >
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle, oklch(0.88 0.13 350 / 0.55), transparent 65%)" }} />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle, oklch(0.9 0.1 20 / 0.5), transparent 65%)" }} />

          <div className="relative mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">today's missions</p>
              <h2 className="mt-1.5 font-display text-[22px] font-bold leading-tight tracking-[-0.015em] sm:text-[27px]">
                3 tiny wins. pick any.
              </h2>
            </div>
            <div className="rounded-full bg-foreground px-3.5 py-1.5 text-[11.5px] font-semibold text-background tabular-nums">
              {missionsDone}/3 · +{missionsXp} XP
            </div>
          </div>

          <ul className="relative space-y-2">
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
                            : "bg-foreground/[0.05] text-foreground/60 group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-105",
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
          </div>
        </section>

        {/* ============ SMALL WIN — "you showed up" reward (moved to bottom) ============ */}
        <section className="mt-6 sm:mt-9">
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
    <div
      className="relative overflow-hidden rounded-[1.6rem] p-4 sm:p-5"
      style={{
        background: "radial-gradient(120% 90% at 10% 0%, oklch(0.95 0.08 75 / 0.65), transparent 55%), radial-gradient(120% 90% at 100% 100%, oklch(0.92 0.09 340 / 0.5), transparent 55%), oklch(1 0 0 / 0.6)",
        backdropFilter: "blur(10px)",
        boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.75), 0 1px 2px oklch(0.13 0.012 20 / 0.04), 0 24px 60px -28px oklch(0.66 0.24 350 / 0.22)",
      }}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">this week</p>
          <p className="mt-1.5 font-display text-[28px] font-bold leading-[0.92] tabular-nums tracking-[-0.025em] sm:text-[36px]">
            {postsWeek}
            <span className="ml-1.5 text-[11px] font-normal text-foreground/45">/ {goal}</span>
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/65 max-w-xs">
            {pct >= 100 ? "you hit your rhythm. so proud of you x"
              : postsWeek === 0 ? "no posts yet — and that's okay. one tiny one resets everything."
              : `${pct}% there. tiny progress still counts.`}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-semibold text-foreground/75 backdrop-blur ring-1 ring-white/60 shadow-[0_3px_10px_-5px_oklch(0.6_0.2_30/0.4)]">
            <Flame className="h-3 w-3 text-[oklch(0.6_0.2_30)]" /> {streak}d streak
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-1.5 sm:gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="relative w-full">
              {d.filled && (
                <div
                  aria-hidden
                  className="absolute -inset-0.5 rounded-xl opacity-60 blur-md"
                  style={{ background: "linear-gradient(180deg, oklch(0.88 0.13 30 / 0.6), oklch(0.72 0.22 350 / 0.4))" }}
                />
              )}
              <span
                className={cn(
                  "relative block w-full rounded-xl transition-all duration-500",
                  d.filled
                    ? "h-7 sm:h-8 shadow-[inset_0_1px_0_oklch(1_0_0/0.6),0_4px_10px_-6px_oklch(0.66_0.24_350/0.5)]"
                    : d.isToday
                    ? "h-7 sm:h-8 bg-white/55 ring-2 ring-dashed ring-foreground/25"
                    : "h-5 sm:h-6 bg-foreground/[0.06]",
                )}
                style={d.filled ? { background: "linear-gradient(180deg, oklch(0.9 0.12 60), oklch(0.74 0.2 25), oklch(0.68 0.22 350))" } : undefined}
                aria-hidden
              />
            </div>
            <span className={cn(
              "text-[8.5px] font-semibold uppercase tracking-[0.12em]",
              d.isToday ? "text-foreground" : "text-foreground/45",
            )}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
