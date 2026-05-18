import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Flame, Rocket } from "lucide-react";
import { getXp } from "@/lib/xp.functions";
import { cn } from "@/lib/utils";
import { celebrate } from "@/lib/celebrate";

// 10 BLYM identity titles — must match /app
const BLYM_LEVELS = [
  "Nervous Beginner","Content Rookie","Brand Ready","Pitching Era","Paid Creator",
  "Consistent Queen","Niche Authority","Brand Magnet","Booked","Booked & Busy",
];

export function PlayerHud() {
  const fetchXp = useServerFn(getXp);
  const xpQ = useQuery({ queryKey: ["xp"], queryFn: () => fetchXp(), staleTime: 30_000 });
  const xp = xpQ.data;
  const level = xp?.level ?? 1;
  const streak = xp?.streak ?? 0;

  // Level-up dopamine — fires when level increases (skips first mount).
  const prevLevel = useRef<number | null>(null);
  useEffect(() => {
    if (xp == null) return;
    if (prevLevel.current != null && xp.level > prevLevel.current) {
      celebrate("level-up");
    }
    prevLevel.current = xp.level;
  }, [xp]);

  const title = BLYM_LEVELS[Math.min(level - 1, 9)];
  const pct = xp
    ? Math.min(100, Math.max(4, Math.round(((xp.xp - xp.prevLevelXp) / Math.max(1, xp.nextLevelXp - xp.prevLevelXp)) * 100)))
    : 4;

  return (
    <Link
      to="/journey"
      aria-label={`Level ${level} — ${title}. ${streak} day streak.`}
      className="group flex h-9 items-center gap-2 rounded-full border border-border bg-card pl-1 pr-2.5 transition hover:border-foreground/30 hover:shadow-[var(--shadow-soft)]"
    >
      {/* Level chip */}
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-warm)] text-[11px] font-black tabular-nums text-primary-foreground shadow-[var(--shadow-glow)]">
        {level}
      </span>

      {/* XP bar — hidden on tiny screens */}
      <span className="hidden sm:flex w-28 flex-col gap-0.5">
        <span className="flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wider text-foreground/55 leading-none">
          <span className="inline-flex items-center gap-1"><Rocket className="h-2.5 w-2.5" /> Lv {level}</span>
          <span className="tabular-nums">{pct}%</span>
        </span>
        <span className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <span
            className="block h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, oklch(0.78 0.16 18), oklch(0.72 0.18 340))" }}
          />
        </span>
      </span>

      {/* Streak */}
      <span
        className={cn(
          "ml-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
          streak > 0
            ? "bg-[oklch(0.96_0.05_40)] text-[oklch(0.45_0.18_30)]"
            : "bg-foreground/8 text-foreground/55",
        )}
      >
        {streak > 0 ? <span className="text-[13px] leading-none">🔥</span> : <Flame className="h-3 w-3" />}
        {streak}
      </span>
    </Link>
  );
}
