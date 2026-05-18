import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getXp } from "@/lib/xp.functions";
import { getDashboard } from "@/lib/dashboard.functions";
import { Lock, Sparkles, Flame, ArrowRight, Check, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/page-hero";

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
    <div>
      <PageHero
        icon={Compass}
        eyebrow="your creator journey"
        title="From nervous beginner to booked & busy."
        description="every post, hook, pitch and tiny win moves you forward. you're not behind — you're building."
        variant="blush"
      />
      <div className="mx-auto max-w-3xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        {/* Stat shelf */}
        <div className="soft-card mb-10 grid grid-cols-3 gap-2 p-4 sm:p-5">
          <StatTile label="xp" value={`${xp}`} emoji="⚡" tint="var(--surface-butter)" />
          <StatTile label="streak" value={`${streak}d`} emoji="🔥" tint="var(--surface-peach)" />
          <StatTile label="level" value={`${currentLevel}/10`} emoji="✨" tint="var(--surface-blush)" />
        </div>

        {/* Roadmap path */}
        <div className="relative">
        {/* connecting line */}
        <div aria-hidden className="absolute left-[28px] top-8 bottom-8 w-[3px] rounded-full bg-gradient-to-b from-primary/30 via-accent/20 to-border/40" />

        <ol className="space-y-3.5">
          {LEVELS.map((lvl) => {
            const unlocked = xp >= lvl.xp;
            const isCurrent = lvl.n === currentLevel;
            const isNext = lvl.n === currentLevel + 1;
            const progress = isNext
              ? Math.min(100, Math.round(((xp - LEVELS[currentLevel - 1].xp) / (lvl.xp - LEVELS[currentLevel - 1].xp)) * 100))
              : unlocked ? 100 : 0;

            return (
              <li key={lvl.n} className="relative pl-[72px]">
                {/* Level node */}
                <div className={cn(
                  "absolute left-0 top-2 grid h-[56px] w-[56px] place-items-center rounded-2xl text-[26px] transition-all duration-500",
                  unlocked
                    ? "bg-card border border-border/50 shadow-[var(--shadow-soft)]"
                    : "bg-foreground/[0.025] border border-dashed border-border/45",
                  isCurrent && "shadow-[0_18px_40px_-18px_oklch(0.66_0.24_350/0.45)] border-primary/30",
                )}>
                  {unlocked ? (
                    <span className={cn("drop-shadow-[0_2px_6px_rgba(0,0,0,0.06)]", isCurrent && "wiggle")}>{lvl.emoji}</span>
                  ) : (
                    <Lock className="h-4 w-4 text-foreground/35" />
                  )}
                </div>

                {/* Card */}
                <div className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-500",
                  isCurrent
                    ? "border-primary/30 bg-card shadow-[var(--shadow-soft)]"
                    : unlocked
                      ? "border-border/40 bg-card shadow-[var(--shadow-xs)] hover:-translate-y-[2px] hover:border-border/60 hover:shadow-[var(--shadow-elegant)]"
                      : "border-border/30 bg-foreground/[0.015]",
                )}>
                  {isCurrent && (
                    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(60% 100% at 0% 0%, color-mix(in oklab, var(--surface-blush) 35%, transparent), transparent 60%)" }} />
                  )}
                  <div className="relative flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/45">Level {lvl.n}</span>
                    {isCurrent && <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[10.5px] font-semibold text-background">you are here</span>}
                    {unlocked && !isCurrent && <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[oklch(0.5_0.16_155)]"><Check className="h-3 w-3" strokeWidth={3} /> unlocked</span>}
                  </div>
                  <h3 className={cn("relative mt-1.5 font-display text-[17px] font-bold leading-tight tracking-[-0.01em]", !unlocked && "text-foreground/55")}>{lvl.title}</h3>
                  <p className={cn("relative mt-1 text-[13px] leading-relaxed", unlocked ? "text-muted-foreground/95" : "text-foreground/45")}>{lvl.blurb}</p>

                  <div className="relative mt-3 flex items-start gap-2 text-[11.5px]">
                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                    <span className="text-foreground/70"><span className="font-semibold text-foreground/85">unlocks:</span> {lvl.unlocks}</span>
                  </div>

                  {isNext && (
                    <div className="relative mt-4">
                      <div className="mb-1.5 flex justify-between text-[11px] font-medium tabular-nums text-foreground/55">
                        <span>{xp - LEVELS[currentLevel - 1].xp} / {lvl.xp - LEVELS[currentLevel - 1].xp} XP</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                        <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${Math.max(4, progress)}%`, background: "linear-gradient(90deg, color-mix(in oklab, var(--surface-blush) 65%, var(--foreground) 14%), color-mix(in oklab, var(--surface-mint) 65%, var(--foreground) 12%))" }} />
                      </div>
                      <Link to="/app" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary transition hover:gap-1.5">
                        do today's missions <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}

                  {!unlocked && !isNext && (
                    <p className="relative mt-3 text-[11.5px] text-foreground/45"><Lock className="mr-1 inline h-3 w-3" />Reach {lvl.xp} XP to unlock</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        </div>

        {/* Footer encouragement */}
        <div className="pastel-card bg-surface-mint mt-10 p-6 text-center">
          <Flame className="mx-auto h-7 w-7 text-foreground/65" strokeWidth={1.75} />
          <p className="mt-2 font-display text-[16px] font-bold tracking-[-0.005em]">tiny progress still counts ✨</p>
          <p className="mt-1 text-[13px] text-foreground/65">come back tomorrow. your streak's waiting.</p>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, emoji, tint }: { label: string; value: string; emoji: string; tint: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border/30 p-3 transition-all duration-500 hover:-translate-y-[2px] hover:shadow-[var(--shadow-xs)]"
      style={{ background: `color-mix(in oklab, ${tint} 65%, var(--background))` }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/55">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[18px] leading-none">{emoji}</span>
        <span className="font-display text-[20px] font-bold tabular-nums tracking-[-0.01em]">{value}</span>
      </div>
    </div>
  );
}
