import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Trophy, Lock } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { getAchievements, type Achievement } from "@/lib/achievements.functions";
import { celebrate } from "@/lib/celebrate";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({ meta: [{ title: "Trophy Room · Blym" }] }),
  component: AchievementsPage,
});

const TONE_BG: Record<Achievement["tone"], string> = {
  warm:   "surface-peach",
  bloom:  "surface-plum",
  mint:   "surface-mint",
  sky:    "surface-sky",
  butter: "surface-butter",
  blush:  "surface-blush",
};

const SEEN_KEY = "blym.achievements.seen";

function loadSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]")); } catch { return new Set(); }
}
function saveSeen(s: Set<string>) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...s])); } catch { /* ignore */ }
}

function AchievementsPage() {
  const fetcher = useServerFn(getAchievements);
  const q = useQuery({ queryKey: ["achievements"], queryFn: () => fetcher() });
  const celebrated = useRef(false);

  useEffect(() => {
    if (!q.data || celebrated.current) return;
    const seen = loadSeen();
    const fresh = q.data.achievements.filter(a => a.unlocked && !seen.has(a.id));
    if (fresh.length > 0) {
      celebrated.current = true;
      celebrate(fresh.length >= 3 ? "big" : "normal");
      const next = new Set(seen);
      fresh.forEach(a => next.add(a.id));
      saveSeen(next);
    } else {
      // mark unlocked seen quietly on first ever load
      const next = new Set(seen);
      q.data.achievements.filter(a => a.unlocked).forEach(a => next.add(a.id));
      saveSeen(next);
    }
  }, [q.data]);

  const data = q.data;

  return (
    <div>
      <PageHero
        icon={Trophy}
        eyebrow="Trophy room"
        title={data ? `${data.unlockedCount} / ${data.total} unlocked` : "Your trophies"}
        description="Every badge here is proof you showed up. Keep going — the next one's closer than you think."
        variant="butter"
      />
      <section className="mx-auto max-w-5xl px-5 py-8">
        {!data ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-secondary" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.achievements.map(a => (
              <BadgeCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BadgeCard({ a }: { a: Achievement }) {
  const pct = Math.round(a.progress * 100);
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[1.6rem] p-5 transition-all duration-500",
        a.unlocked
          ? "bg-white/85 backdrop-blur-sm ring-1 ring-white/60 shadow-[inset_0_1px_0_oklch(1_0_0/0.7),0_1px_2px_oklch(0.13_0.012_20/0.04),0_16px_36px_-20px_oklch(0.66_0.24_350/0.35)] hover:-translate-y-1"
          : "bg-foreground/[0.025] ring-1 ring-foreground/[0.06]",
      )}
    >
      {a.unlocked && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-8 h-32 w-32 rounded-full opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
          style={{ background: "var(--gradient-bloom)" }}
        />
      )}
      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl transition-transform duration-500",
            a.unlocked ? cn(TONE_BG[a.tone], "shadow-[0_6px_16px_-8px_oklch(0.13_0.012_20/0.2)] group-hover:scale-110 group-hover:-rotate-[5deg]") : "bg-foreground/[0.05] grayscale",
          )}
        >
          {a.unlocked ? a.emoji : <Lock className="h-5 w-5 text-foreground/40" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("font-display text-[15px] font-bold leading-tight tracking-[-0.01em]", !a.unlocked && "text-foreground/55")}>
            {a.label}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{a.description}</p>
        </div>
        {a.unlocked && (
          <span className="rounded-full bg-[oklch(0.94_0.07_150)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[oklch(0.4_0.14_150)]">
            Unlocked
          </span>
        )}
      </div>
      <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            a.unlocked ? "bg-[image:var(--gradient-bloom)] shadow-[0_0_12px_oklch(0.7_0.2_340/0.5)]" : "bg-foreground/25",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="relative mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>{Math.min(a.current, a.goal).toLocaleString()} / {a.goal.toLocaleString()} {a.unit}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
