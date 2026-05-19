import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getXp } from "@/lib/xp.functions";
import { getDashboard } from "@/lib/dashboard.functions";
import { Lock, Flame, ArrowRight, ArrowDown, Check, Compass } from "lucide-react";
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
      <div className="mx-auto max-w-3xl px-5 pt-5 pb-10 sm:px-8 sm:pt-6">
        {/* Stat shelf */}
        <div className="soft-card mb-5 grid grid-cols-3 gap-2 p-3 sm:p-4">
          <StatTile label="xp" value={`${xp}`} emoji="⚡" tint="var(--surface-butter)" />
          <StatTile label="streak" value={`${streak}d`} emoji="🔥" tint="var(--surface-peach)" />
          <StatTile label="level" value={`${currentLevel}/10`} emoji="✨" tint="var(--surface-blush)" />
        </div>

        {/* Map — compact zigzag with arrows pointing to the next tile */}
        <ol className="grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-3">
          {LEVELS.map((lvl, idx) => {
            const unlocked = xp >= lvl.xp;
            const isCurrent = lvl.n === currentLevel;
            const isNext = lvl.n === currentLevel + 1;
            const row = Math.floor(idx / 2);
            const rightCol = idx % 2 === 1;
            // zigzag flow: even rows go L→R, odd rows go R→L
            const flowsRight = row % 2 === 0;
            const isRowStart = (flowsRight && !rightCol) || (!flowsRight && rightCol);
            const isRowEnd = !isRowStart;
            const isLast = idx === LEVELS.length - 1;
            // arrow to the right neighbour in same row
            const showInlineArrow = !isRowEnd && !isLast;
            // arrow dropping down to the next row from the end of this row
            const showDownArrow = isRowEnd && !isLast;
            // place tile in grid: right-to-left rows reverse column order visually
            const colStart = flowsRight ? (rightCol ? 2 : 1) : (rightCol ? 1 : 2);

            return (
              <li
                key={lvl.n}
                className="relative"
                style={{ gridColumnStart: colStart, gridRow: row + 1 }}
              >
                <div className={cn(
                  "group relative h-full overflow-hidden rounded-xl border p-2.5 sm:p-3 transition-all duration-300",
                  isCurrent
                    ? "border-primary/35 bg-card shadow-[var(--shadow-soft)]"
                    : unlocked
                      ? "border-border/45 bg-card shadow-[var(--shadow-xs)] hover:-translate-y-[1px] hover:border-border/70 hover:shadow-[var(--shadow-elegant)]"
                      : "border-dashed border-border/40 bg-foreground/[0.015]",
                )}>
                  {isCurrent && (
                    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(80% 100% at 0% 0%, color-mix(in oklab, var(--surface-blush) 38%, transparent), transparent 60%)" }} />
                  )}
                  <div className="relative flex items-start gap-2.5">
                    <div className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[18px] transition-transform",
                      unlocked ? "bg-white/70 ring-1 ring-white/60" : "bg-foreground/[0.04]",
                      isCurrent && "wiggle ring-primary/30",
                    )}>
                      {unlocked ? lvl.emoji : <Lock className="h-3.5 w-3.5 text-foreground/40" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-foreground/45">L{lvl.n}</span>
                        {isCurrent && <span className="rounded-full bg-foreground px-1.5 py-px text-[9px] font-semibold text-background">here</span>}
                        {unlocked && !isCurrent && <Check className="h-2.5 w-2.5 text-[oklch(0.5_0.16_155)]" strokeWidth={3.5} />}
                      </div>
                      <h3 className={cn("mt-0.5 font-display text-[12.5px] font-bold leading-tight tracking-[-0.01em] truncate", !unlocked && "text-foreground/55")}>
                        {lvl.title}
                      </h3>
                      <p className="mt-0.5 text-[10px] font-semibold tabular-nums text-foreground/45">{lvl.xp} XP</p>
                    </div>
                  </div>

                  {isNext && (
                    <div className="relative mt-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                        <div
                          className="h-full rounded-full transition-[width] duration-700 ease-out"
                          style={{
                            width: `${Math.max(4, Math.min(100, Math.round(((xp - LEVELS[currentLevel - 1].xp) / (lvl.xp - LEVELS[currentLevel - 1].xp)) * 100)))}%`,
                            background: "linear-gradient(90deg, color-mix(in oklab, var(--surface-blush) 65%, var(--foreground) 14%), color-mix(in oklab, var(--surface-mint) 65%, var(--foreground) 12%))",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* arrow into the next tile, same row */}
                {showInlineArrow && (
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute top-1/2 z-10 -translate-y-1/2",
                      flowsRight ? "-right-3 sm:-right-4" : "-left-3 sm:-left-4",
                    )}
                  >
                    <ArrowRight
                      className={cn(
                        "h-4 w-4 text-foreground/35",
                        !flowsRight && "rotate-180",
                      )}
                      strokeWidth={2.25}
                    />
                  </div>
                )}

                {/* arrow dropping down to the next row */}
                {showDownArrow && (
                  <div aria-hidden className="pointer-events-none absolute -bottom-2.5 right-1/2 z-10 translate-x-1/2 sm:-bottom-3">
                    <ArrowDown className="h-4 w-4 text-foreground/35" strokeWidth={2.25} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {isNextCTA(xp, currentLevel) && (
          <Link to="/app" className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary transition hover:gap-1.5">
            do today's missions <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}

        {/* Footer encouragement */}
        <div className="pastel-card bg-surface-mint mt-6 p-5 text-center">
          <Flame className="mx-auto h-7 w-7 text-foreground/65" strokeWidth={1.75} />
          <p className="mt-2 font-display text-[16px] font-bold tracking-[-0.005em]">tiny progress still counts ✨</p>
          <p className="mt-1 text-[13px] text-foreground/65">come back tomorrow. your streak's waiting.</p>
        </div>
      </div>
    </div>
  );
}

function isNextCTA(xp: number, currentLevel: number) {
  return currentLevel < LEVELS.length && xp < LEVELS[currentLevel].xp;
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
