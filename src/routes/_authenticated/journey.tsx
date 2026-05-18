import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getXp } from "@/lib/xp.functions";
import { getDashboard } from "@/lib/dashboard.functions";
import { Lock, Sparkles, Flame, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/journey")({ component: JourneyPage });

// 10-level creator RPG path
const LEVELS = [
  { n: 1, title: "Nervous Beginner", emoji: "🌱", xp: 0, blurb: "you showed up. that's already huge.", unlocks: "Daily missions, Hook Lab" },
  { n: 2, title: "Content Rookie", emoji: "🐣", xp: 50, blurb: "you've got the bug now.", unlocks: "Caption packs, Script me" },
  { n: 3, title: "Hook Addict", emoji: "🪝", xp: 200, blurb: "you can stop scrolls now.", unlocks: "Viral Lab pro hooks" },
  { n: 4, title: "Chaos Creator", emoji: "🌪️", xp: 450, blurb: "messy but consistent. iconic.", unlocks: "Series builder, B-roll" },
  { n: 5, title: "Brand Ready", emoji: "✨", xp: 800, blurb: "your vibe's coming together.", unlocks: "Media kit, Portfolio" },
  { n: 6, title: "Pitching Era", emoji: "💌", xp: 1250, blurb: "sliding into brand DMs.", unlocks: "Brand Hub, Pitch templates" },
  { n: 7, title: "Consistent Creator", emoji: "📅", xp: 1800, blurb: "showing up like it's your job.", unlocks: "Recycler, Engagement booster" },
  { n: 8, title: "UGC Machine", emoji: "🎬", xp: 2450, blurb: "they keep coming back for more.", unlocks: "Deliverables, Usage rights" },
  { n: 9, title: "Booked & Busy", emoji: "📈", xp: 3200, blurb: "the calendar's filling up.", unlocks: "Invoices pro, Affiliate suite" },
  { n: 10, title: "Creator Legend", emoji: "👑", xp: 4050, blurb: "you made it. literally.", unlocks: "Everything. Forever." },
];

function levelFromXp(xp: number) {
  let lvl = 1;
  for (const l of LEVELS) if (xp >= l.xp) lvl = l.n;
  return lvl;
}

function JourneyPage() {
  const fetchXp = useServerFn(getXp);
  const fetchDash = useServerFn(getDashboard);
  const { data: xpData } = useQuery({ queryKey: ["xp"], queryFn: () => fetchXp() });
  const { data: dash } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDash() });

  const xp = xpData?.xp ?? 0;
  const currentLevel = levelFromXp(xp);
  const streak = dash?.streak ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Hero header */}
      <div className="sticker mb-8 overflow-hidden p-6 sm:p-8" style={{ background: "var(--gradient-aurora)" }}>
        <p className="eyebrow">your creator journey</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl leading-tight">
          From nervous beginner to <span className="text-gradient-game">booked & busy</span>.
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          every post, hook, pitch and tiny win moves you forward. you're not behind. you're building.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="xp-pill">⚡ {xp} XP</span>
          <span className="streak-chip">🔥 {streak} day streak</span>
          <span className="xp-pill">Level {currentLevel} / 10</span>
        </div>
      </div>

      {/* Roadmap path */}
      <div className="relative">
        {/* connecting line */}
        <div aria-hidden className="absolute left-[34px] top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-primary/40 via-accent/30 to-border" />

        <ol className="space-y-4">
          {LEVELS.map((lvl) => {
            const unlocked = xp >= lvl.xp;
            const isCurrent = lvl.n === currentLevel;
            const isNext = lvl.n === currentLevel + 1;
            const progress = isNext
              ? Math.min(100, Math.round(((xp - LEVELS[currentLevel - 1].xp) / (lvl.xp - LEVELS[currentLevel - 1].xp)) * 100))
              : unlocked ? 100 : 0;

            return (
              <li key={lvl.n} className="relative pl-20">
                {/* Level node */}
                <div className={cn(
                  "absolute left-0 top-2 grid h-[68px] w-[68px] place-items-center rounded-full text-3xl transition-all",
                  unlocked
                    ? "bg-card border-2 border-foreground shadow-[0_5px_0_0_var(--foreground)]"
                    : "bg-muted border-2 border-border opacity-60",
                  isCurrent && "pulse-glow",
                )}>
                  {unlocked ? (
                    <span className={cn(isCurrent && "wiggle")}>{lvl.emoji}</span>
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Card */}
                <div className={cn(
                  "sticker p-5",
                  isCurrent && "ring-4 ring-primary/30",
                  !unlocked && "opacity-70",
                )}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Level {lvl.n}</span>
                    {isCurrent && <span className="xp-pill !bg-primary !text-primary-foreground !border-primary">you are here</span>}
                    {unlocked && !isCurrent && <span className="inline-flex items-center gap-1 text-xs font-bold text-success"><Check className="h-3 w-3" /> unlocked</span>}
                  </div>
                  <h3 className="mt-1 font-display text-xl">{lvl.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{lvl.blurb}</p>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    <span className="text-foreground/80"><strong>Unlocks:</strong> {lvl.unlocks}</span>
                  </div>

                  {isNext && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{xp - LEVELS[currentLevel - 1].xp} / {lvl.xp - LEVELS[currentLevel - 1].xp} XP</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted border border-foreground/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <Link to="/app" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                        do today's missions <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}

                  {!unlocked && !isNext && (
                    <p className="mt-3 text-xs text-muted-foreground"><Lock className="inline h-3 w-3 mr-1" />Reach {lvl.xp} XP to unlock</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Footer encouragement */}
      <div className="sticker mt-10 p-6 text-center" style={{ background: "var(--gradient-mint)" }}>
        <Flame className="mx-auto h-8 w-8 text-accent" />
        <p className="mt-2 font-display text-lg">tiny progress still counts ✨</p>
        <p className="mt-1 text-sm text-muted-foreground">come back tomorrow. your streak's waiting.</p>
      </div>
    </div>
  );
}
