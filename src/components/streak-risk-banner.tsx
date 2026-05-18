import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Snowflake, Flame, X, ArrowRight } from "lucide-react";
import { getXp } from "@/lib/xp.functions";
import { toast } from "sonner";
import { pop } from "@/lib/celebrate";

const FREEZE_KEY = "blym.streakFreeze";
const FREEZE_DAILY_KEY = "blym.lastFreezeDate";
const DISMISS_KEY = "blym.streakRiskDismiss"; // value = todayISO

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Shows ONLY when:
 *   - streak >= 3
 *   - no daily login XP earned today (awardedToday=false)
 *   - it's past 17:00 local time (give them the day)
 *   - not dismissed today, not frozen today
 */
export function StreakRiskBanner() {
  const fetcher = useServerFn(getXp);
  const xp = useQuery({ queryKey: ["xp"], queryFn: () => fetcher() });
  const today = todayKey();

  const [hourPast5, setHourPast5] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [frozenToday, setFrozenToday] = useState(true);
  const [freezes, setFreezes] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHourPast5(new Date().getHours() >= 17);
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === today);
      setFrozenToday(localStorage.getItem(FREEZE_DAILY_KEY) === today);
      const f = parseInt(localStorage.getItem(FREEZE_KEY) ?? "2", 10);
      setFreezes(Number.isFinite(f) ? f : 2);
    } catch { /* ignore */ }
  }, [today]);

  const visible = useMemo(() => {
    const d = xp.data;
    if (!d) return false;
    return d.streak >= 3 && !d.awardedToday && hourPast5 && !dismissed && !frozenToday;
  }, [xp.data, hourPast5, dismissed, frozenToday]);

  if (!visible) return null;
  const streak = xp.data!.streak;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, today); } catch { /* ignore */ }
    setDismissed(true);
    pop();
  };

  const useFreeze = () => {
    if (freezes <= 0) {
      toast.error("Out of freezes", { description: "Hit a weekly quest to earn one back." });
      return;
    }
    const left = freezes - 1;
    try {
      localStorage.setItem(FREEZE_KEY, String(left));
      localStorage.setItem(FREEZE_DAILY_KEY, today);
    } catch { /* ignore */ }
    setFreezes(left);
    setFrozenToday(true);
    toast.success("❄️ Streak frozen for today", { description: "Rest day. You earned it." });
  };

  return (
    <div className="mx-auto mt-3 max-w-5xl px-3">
      <div
        role="status"
        className="relative flex flex-wrap items-center gap-3 rounded-2xl border border-[oklch(0.85_0.1_30)] bg-[oklch(0.97_0.04_30)] px-4 py-3 text-foreground shadow-[var(--shadow-soft)] dark:bg-[oklch(0.32_0.08_30)]"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[oklch(0.92_0.08_30)] text-[oklch(0.4_0.15_30)] dark:bg-[oklch(0.4_0.12_30)] dark:text-[oklch(0.95_0.04_30)]">
          <Flame className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-black sm:text-base">
            🔥 {streak}-day streak — don't let it slip
          </p>
          <p className="text-xs text-muted-foreground">
            Tap one tiny quest below 1-min job, or freeze today guilt-free.
          </p>
        </div>
        <Link
          to="/quests"
          className="inline-flex items-center gap-1 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-bold text-background hover:opacity-90"
        >
          Save my streak <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={useFreeze}
          disabled={freezes <= 0}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold disabled:opacity-50"
        >
          <Snowflake className="h-3.5 w-3.5" /> Freeze ({freezes})
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="ml-1 grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-card"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
