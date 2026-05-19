import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles, Snowflake, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NotifyOptIn } from "@/components/notify-opt-in";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/quests")({ component: QuestsPage });

type Quest = {
  id: string;
  emoji: string;
  title: string;
  xp: number;
  to?: string;
  tint: string;
};

const DAILY: Quest[] = [
  { id: "open", emoji: "👋", title: "open the app (done bestie)", xp: 5, tint: "var(--surface-rose)" },
  { id: "idea", emoji: "💡", title: "grab 1 content idea", xp: 10, to: "/generator", tint: "var(--surface-butter)" },
  { id: "hook", emoji: "🪝", title: "save a hook you like", xp: 10, to: "/viral-lab", tint: "var(--surface-mint)" },
  { id: "film", emoji: "🎬", title: "film 1 thing (even 5 sec)", xp: 15, to: "/film-this", tint: "var(--surface-sky)" },
  { id: "pep", emoji: "🫶", title: "read today's pep talk", xp: 5, to: "/motivation", tint: "var(--surface-blush)" },
];

const WEEKLY: Quest[] = [
  { id: "w-post", emoji: "📱", title: "post 3 times this week", xp: 50, tint: "var(--surface-plum)" },
  { id: "w-pitch", emoji: "💌", title: "draft 1 brand pitch", xp: 75, to: "/brand-hub", tint: "var(--surface-grape)" },
  { id: "w-series", emoji: "📚", title: "plan a mini-series", xp: 60, to: "/series-builder", tint: "var(--surface-rose)" },
];

const KEY = "blym.quests";
const FREEZE_KEY = "blym.streakFreeze";
const FREEZE_DAILY_KEY = "blym.lastFreezeDate";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadDone(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

function QuestsPage() {
  const [done, setDone] = useState<Record<string, string>>({});
  const [freezes, setFreezes] = useState(2);
  const today = todayKey();

  useEffect(() => {
    const all = loadDone();
    // reset daily ones for new day
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(all)) {
      const isWeekly = k.startsWith("w-");
      if (isWeekly || v === today) cleaned[k] = v;
    }
    setDone(cleaned);
    localStorage.setItem(KEY, JSON.stringify(cleaned));
    const f = parseInt(localStorage.getItem(FREEZE_KEY) || "2", 10);
    setFreezes(Number.isFinite(f) ? f : 2);
  }, [today]);

  const toggle = (q: Quest) => {
    const next = { ...done };
    if (next[q.id]) delete next[q.id];
    else {
      next[q.id] = today;
      toast.success(`+${q.xp} XP — ${q.emoji} nice`, { description: q.title });
    }
    setDone(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const useFreeze = () => {
    const last = localStorage.getItem(FREEZE_DAILY_KEY);
    if (last === today) {
      toast("you already froze today ❄️", { description: "your streak is safe bestie" });
      return;
    }
    if (freezes <= 0) {
      toast.error("out of freezes", { description: "earn more by hitting weekly quests 💌" });
      return;
    }
    const left = freezes - 1;
    setFreezes(left);
    localStorage.setItem(FREEZE_KEY, String(left));
    localStorage.setItem(FREEZE_DAILY_KEY, today);
    toast.success("❄️ streak frozen for today", { description: "rest day. you earned it." });
  };

  const dailyXp = DAILY.filter((q) => done[q.id]).reduce((a, q) => a + q.xp, 0);
  const dailyTotal = DAILY.reduce((a, q) => a + q.xp, 0);
  const pct = Math.round((dailyXp / dailyTotal) * 100);

  return (
    <div>
      <PageHero
        icon={Sparkles}
        eyebrow="today's missions"
        title="5 tiny quests, big momentum"
        description="tick them off as you go. low energy? freeze your streak — no guilt allowed."
        variant="sunrise"
      />
      <div className="mx-auto max-w-3xl px-5 pt-4 pb-10 sm:px-8 sm:pt-5">
        {/* Progress shelf */}
        <div className="soft-card card-glow-blush mb-5 overflow-hidden p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-butter text-base">⚡</span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/55">today's xp</p>
                <p className="font-display text-[20px] font-bold tabular-nums tracking-[-0.01em]">{dailyXp} <span className="text-foreground/40">/ {dailyTotal}</span></p>
              </div>
            </div>
            <button
              onClick={useFreeze}
              className="group inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 text-[11.5px] font-semibold text-foreground/75 transition hover:-translate-y-[1px] hover:border-foreground/40 hover:text-foreground hover:shadow-[var(--shadow-xs)]"
            >
              <Snowflake className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" /> freeze · {freezes} left
            </button>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${Math.max(4, pct)}%`,
                background: "linear-gradient(90deg, color-mix(in oklab, var(--surface-butter) 65%, var(--foreground) 12%), color-mix(in oklab, var(--surface-peach) 70%, var(--foreground) 14%))",
              }}
            />
          </div>
          {pct === 100 && (
            <p className="mt-2 text-[12px] font-medium text-[oklch(0.45_0.14_140)]">all 5 today — soft applause for you 🌿</p>
          )}
        </div>

        <div className="mb-5">
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <p className="eyebrow">daily</p>
              <h2 className="section-heading flex items-center gap-2"><Flame className="h-5 w-5 text-primary" /> today's quests</h2>
            </div>
            <span className="chip-soft">{DAILY.filter((q) => done[q.id]).length}/{DAILY.length}</span>
          </div>
          <div className="space-y-1.5">
            {DAILY.map((q, i) => <QuestRow key={q.id} q={q} done={!!done[q.id]} glow={i % 2 === 0} onToggle={() => toggle(q)} />)}
          </div>
        </div>

        <div className="mb-5">
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <p className="eyebrow">weekly</p>
              <h2 className="section-heading flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> this week</h2>
            </div>
            <span className="chip-soft">{WEEKLY.filter((q) => done[q.id]).length}/{WEEKLY.length}</span>
          </div>
          <div className="space-y-1.5">
            {WEEKLY.map((q, i) => <QuestRow key={q.id} q={q} done={!!done[q.id]} glow={i === 1} onToggle={() => toggle(q)} />)}
          </div>
        </div>

        <div className="mt-4">
          <NotifyOptIn />
        </div>
      </div>
    </div>
  );
}

function QuestRow({ q, done, glow, onToggle }: { q: Quest; done: boolean; glow?: boolean; onToggle: () => void }) {
  const Inner = (
    <div className="flex items-center gap-3.5 flex-1 min-w-0">
      <div className={cn(
        "icon-tile h-10 w-10 text-[20px] bg-white/75",
        done && "bounce-in",
      )}>
        {q.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-[14.5px] font-semibold leading-tight tracking-[-0.005em]",
          done && "line-through opacity-55",
        )}>{q.title}</p>
        <p className="mt-0.5 text-[11.5px] font-semibold text-foreground/55 tabular-nums">+{q.xp} XP</p>
      </div>
    </div>
  );
  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3.5 py-2.5 transition-all duration-300 sm:px-4 sm:py-3",
        done
          ? "border-[oklch(0.78_0.1_155)]/50 bg-[oklch(0.97_0.04_155)]/70"
          : "border-border/40 bg-card hover:-translate-y-[2px] hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]",
      )}
      style={done ? { background: `color-mix(in oklab, ${q.tint} 35%, var(--card))` } : undefined}
    >
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-primary/70 transition-transform duration-300 group-hover:scale-y-100" />
      {q.to ? <Link to={q.to} className="flex-1 min-w-0 flex">{Inner}</Link> : <div className="flex-1 min-w-0 flex">{Inner}</div>}
      <button
        onClick={onToggle}
        aria-label={done ? "mark undone" : "mark done"}
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-all duration-300 active:scale-90",
          done
            ? "bg-[oklch(0.6_0.16_155)] text-white scale-105 shadow-[0_4px_14px_-4px_oklch(0.6_0.16_155/0.5)]"
            : "bg-foreground/[0.05] text-foreground/60 group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-105",
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>
    </div>
  );
}
