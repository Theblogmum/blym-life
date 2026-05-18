import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { X, Sparkles } from "lucide-react";
import { getXp } from "@/lib/xp.functions";
import { getDashboard } from "@/lib/dashboard.functions";
import { cn } from "@/lib/utils";

// A small, persistent "momentum pebble" — calming streak + weekly rhythm reminder.
// Lives bottom-left, dismissible per day. Supportive, never shaming.
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const DISMISS_KEY = "blym.momentumPebbleDismiss";

export function MomentumPebble() {
  const fetchXp = useServerFn(getXp);
  const fetchDash = useServerFn(getDashboard);
  const xpQ = useQuery({ queryKey: ["xp"], queryFn: () => fetchXp(), staleTime: 60_000 });
  const dashQ = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDash(), staleTime: 60_000 });

  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(DISMISS_KEY) === todayISO();
    setHidden(dismissed);
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, []);

  const streak = xpQ.data?.streak ?? 0;
  const postsWeek = (dashQ.data as any)?.posts_last_7 ?? 0;
  const weekTarget = 3;
  const weekPct = Math.min(100, Math.round((postsWeek / weekTarget) * 100));

  const { emoji, headline, sub } = useMemo(() => {
    if (streak >= 7) return { emoji: "🌿", headline: "you're flowing", sub: "rest counts too. proud of you." };
    if (streak >= 3) return { emoji: "✨", headline: `${streak} days, gentle pace`, sub: "no need to sprint." };
    if (streak === 0 && postsWeek > 0) return { emoji: "🌱", headline: "still in motion", sub: `${postsWeek} this week — that's real.` };
    if (streak === 0) return { emoji: "🫶", headline: "soft start, no pressure", sub: "one tiny thing today is enough." };
    return { emoji: "🌤️", headline: `day ${streak}, keep it light`, sub: "tomorrow it gets easier." };
  }, [streak, postsWeek]);

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") localStorage.setItem(DISMISS_KEY, todayISO());
    setHidden(true);
  };

  if (hidden || xpQ.isLoading) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-6 left-6 z-40 hidden lg:block",
        "transition-all duration-700 ease-out",
        open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
      aria-live="polite"
    >
      <Link
        to="/journey"
        className="pointer-events-auto group relative flex w-[260px] items-center gap-3 overflow-hidden rounded-2xl border border-border/40 bg-card/90 p-3 pr-3.5 shadow-[var(--shadow-soft)] backdrop-blur-md transition-all duration-500 hover:-translate-y-[2px] hover:border-border/60 hover:shadow-[var(--shadow-elegant)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(circle at 18% 20%, color-mix(in oklab, var(--surface-mint) 55%, transparent), transparent 60%), radial-gradient(circle at 90% 110%, color-mix(in oklab, var(--surface-blush) 45%, transparent), transparent 60%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 left-6 h-16 w-16 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-60"
          style={{ background: "color-mix(in oklab, var(--surface-mint) 80%, transparent)" }}
        />

        <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/80 text-[22px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-[4deg]">
          {emoji}
        </div>

        <div className="relative min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[12.5px] font-semibold leading-tight tracking-[-0.005em] text-foreground/90">
              {headline}
            </p>
          </div>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground/90">{sub}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-foreground/[0.06]">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${Math.max(6, weekPct)}%`,
                  background: "linear-gradient(90deg, color-mix(in oklab, var(--surface-mint) 75%, var(--foreground) 12%), color-mix(in oklab, var(--surface-sky) 75%, var(--foreground) 10%))",
                }}
              />
            </div>
            <span className="shrink-0 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-foreground/45 tabular-nums">
              {postsWeek}/{weekTarget}
            </span>
          </div>
        </div>

        <button
          onClick={dismiss}
          aria-label="Hide for today"
          className="relative -mr-1 grid h-6 w-6 shrink-0 place-items-center self-start rounded-md text-foreground/35 transition hover:bg-foreground/[0.05] hover:text-foreground/70"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>

        <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-foreground/[0.04] px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-foreground/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Sparkles className="h-2.5 w-2.5" /> journey
        </span>
      </Link>
    </div>
  );
}
