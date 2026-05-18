import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { celebrate, pop } from "@/lib/celebrate";

type Mission = { id: string; t: string; xp: number; emoji: string };

const MISSIONS: Mission[] = [
  { id: "film",  t: "Film one tiny clip",      xp: 15, emoji: "🎬" },
  { id: "hook",  t: "Write 3 hooks",           xp: 10, emoji: "🪝" },
  { id: "pitch", t: "Find a brand to pitch",   xp: 20, emoji: "💌" },
];

const TOTAL_XP = MISSIONS.reduce((s, m) => s + m.xp, 0); // 45
const START_XP = 240; // matches the static preview vibe
const NEXT_LEVEL_AT = 320; // gives a satisfying fill on completion (45*~ = lvl-up)

const STICKERS = ["🌱","🐣","🪝","🌪️","✨","💌"];

export function LandingDemo() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [leveledUp, setLeveledUp] = useState(false);
  const allDone = MISSIONS.every((m) => done[m.id]);
  const earnedXp = MISSIONS.reduce((s, m) => (done[m.id] ? s + m.xp : s), 0);
  const xp = START_XP + earnedXp;

  // base level 3, level up when xp crosses NEXT_LEVEL_AT
  const level = xp >= NEXT_LEVEL_AT ? 4 : 3;
  const title = level === 4 ? "Brand Ready" : "Hook Addict";

  // progress to next level (level 3 band = 200..NEXT, level 4 band = NEXT..NEXT+120)
  const pct = (() => {
    if (level === 4) {
      const span = 120;
      return Math.min(100, Math.round(((xp - NEXT_LEVEL_AT) / span) * 100));
    }
    const start = 200;
    return Math.min(100, Math.round(((xp - start) / (NEXT_LEVEL_AT - start)) * 100));
  })();

  const stickersUnlocked = 3 + (done.film ? 1 : 0) + (done.hook && done.pitch ? 1 : 0) + (leveledUp ? 1 : 0);

  const toggle = (id: string) => {
    if (done[id]) return;
    setDone((s) => ({ ...s, [id]: true }));
    pop();
    // floating +XP near the tapped row would be ideal — use a tiny tween via CSS class instead
  };

  useEffect(() => {
    if (allDone && !leveledUp) {
      setLeveledUp(true);
      celebrate("level-up");
    }
  }, [allDone, leveledUp]);

  const reset = () => {
    setDone({});
    setLeveledUp(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        aria-hidden
        className="absolute -inset-10 rounded-[3rem] opacity-50 blur-3xl transition-opacity duration-700"
        style={{ background: "var(--gradient-game)", opacity: leveledUp ? 0.85 : 0.5 }}
      />
      <div className="sticker relative p-6 sm:p-7 bg-card">
        {/* try-it tag */}
        <div
          className="absolute -top-3 left-6 inline-flex h-6 items-center gap-1 rounded-full bg-foreground px-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-background shadow-[2px_2px_0_0_oklch(0.2_0.01_20/0.2)]"
        >
          <span className="grid h-2 w-2 place-items-center rounded-full bg-[oklch(0.78_0.18_140)]" />
          live demo · tap to play
        </div>

        <div className="flex items-center justify-between">
          <span className="eyebrow">your journey</span>
          <span className="streak-chip">🔥 7</span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div
            className={cn(
              "grid h-14 w-14 place-items-center rounded-full bg-card border-2 border-foreground shadow-[0_4px_0_0_var(--foreground)] text-2xl transition-transform",
              leveledUp ? "scale-110" : "wiggle",
            )}
          >
            {leveledUp ? "👑" : "✨"}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Level {level} {leveledUp && <span className="ml-1 text-[10px] text-[oklch(0.55_0.18_30)]">↑ new!</span>}
            </p>
            <p className="font-display text-lg leading-tight">{title}</p>
          </div>
          <span className="ml-auto xp-pill tabular-nums">
            ⚡ {xp} XP
          </span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span>{level === 4 ? "to Level 5" : "to Level 4"}</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted border border-foreground/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              today's missions {allDone && <span className="ml-1 text-[oklch(0.45_0.15_150)]">all done ✓</span>}
            </p>
            {allDone && (
              <button
                onClick={reset}
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                aria-label="Replay the demo"
              >
                ↻ replay
              </button>
            )}
          </div>

          {MISSIONS.map((m) => {
            const isDone = !!done[m.id];
            return (
              <button
                key={m.id}
                onClick={() => toggle(m.id)}
                disabled={isDone}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-2xl border-2 border-foreground/80 p-3 text-left transition-all",
                  isDone
                    ? "bg-success/15 cursor-default"
                    : "bg-card hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_var(--foreground)] active:translate-y-0 active:shadow-none",
                )}
                aria-label={isDone ? `${m.t} — completed` : `Complete: ${m.t}`}
              >
                <div
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-foreground text-sm font-bold transition-all",
                    isDone ? "bg-success text-success-foreground scale-110" : "bg-card text-transparent group-hover:bg-foreground/10",
                  )}
                >
                  ✓
                </div>
                <span className={cn("flex-1 text-sm font-semibold", isDone && "line-through opacity-60")}>
                  {m.t}
                </span>
                <span className={cn(
                  "shrink-0 text-xs font-black tabular-nums transition-all",
                  isDone ? "text-success" : "text-primary",
                )}>
                  +{m.xp}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex gap-2">
          {STICKERS.map((e, i) => {
            const unlocked = i < stickersUnlocked;
            return (
              <div
                key={i}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full border-2 text-base transition-all",
                  unlocked
                    ? "border-foreground bg-card shadow-[0_2px_0_0_var(--foreground)]"
                    : "border-border bg-muted opacity-50",
                )}
              >
                {unlocked ? e : "🔒"}
              </div>
            );
          })}
        </div>

        {/* helper line */}
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          {allDone
            ? "that's how a day feels in blym ✨ ready for real ones?"
            : "👆 tap a mission — earn XP, fill the bar, level up"}
        </p>
      </div>
    </div>
  );
}