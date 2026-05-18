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
        "relative overflow-hidden rounded-3xl border p-5 transition",
        a.unlocked
          ? "border-border bg-card shadow-[var(--shadow-soft)]"
          : "border-dashed border-border/70 bg-card/60",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl",
            a.unlocked ? TONE_BG[a.tone] : "bg-muted",
            !a.unlocked && "grayscale opacity-60",
          )}
        >
          {a.unlocked ? a.emoji : <Lock className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("font-display text-base font-black leading-tight", !a.unlocked && "text-muted-foreground")}>
            {a.label}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
        </div>
        {a.unlocked && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Unlocked
          </span>
        )}
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            a.unlocked ? "bg-[image:var(--gradient-bloom)]" : "bg-foreground/30",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
        <span>{Math.min(a.current, a.goal).toLocaleString()} / {a.goal.toLocaleString()} {a.unit}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
