import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles, Snowflake, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="sticker mb-6 p-6 sm:p-7" style={{ background: "var(--gradient-sunrise)" }}>
        <p className="eyebrow">today's missions</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">5 tiny quests, big momentum 🎯</h1>
        <p className="mt-2 text-muted-foreground">tick them off as you go. low energy? freeze your streak — no guilt allowed.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="xp-pill">⚡ {dailyXp} / {dailyTotal} XP today</span>
          <span className="streak-chip">🔥 keep it alive</span>
          <button onClick={useFreeze} className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs font-bold shadow-[0_2px_0_0_var(--foreground)] active:translate-y-0.5 active:shadow-none">
            <Snowflake className="h-3 w-3" /> freeze ({freezes} left)
          </button>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full border-2 border-foreground bg-card">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <h2 className="font-display text-xl mb-3 flex items-center gap-2"><Flame className="h-5 w-5 text-primary" /> daily quests</h2>
      <div className="space-y-3 mb-8">
        {DAILY.map((q) => <QuestRow key={q.id} q={q} done={!!done[q.id]} onToggle={() => toggle(q)} />)}
      </div>

      <h2 className="font-display text-xl mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> this week</h2>
      <div className="space-y-3">
        {WEEKLY.map((q) => <QuestRow key={q.id} q={q} done={!!done[q.id]} onToggle={() => toggle(q)} />)}
      </div>
    </div>
  );
}

function QuestRow({ q, done, onToggle }: { q: Quest; done: boolean; onToggle: () => void }) {
  const Inner = (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className={cn(
        "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-foreground bg-card text-xl shadow-[0_3px_0_0_var(--foreground)]",
        done && "bounce-in",
      )}>
        {q.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-display text-base leading-tight", done && "line-through text-muted-foreground")}>{q.title}</p>
        <p className="text-xs text-foreground/70">+{q.xp} XP</p>
      </div>
    </div>
  );
  return (
    <div className="sticker p-4 flex items-center gap-3" style={done ? { background: q.tint } : undefined}>
      {q.to ? <Link to={q.to} className="flex-1 min-w-0 flex">{Inner}</Link> : <div className="flex-1 min-w-0 flex">{Inner}</div>}
      <button
        onClick={onToggle}
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-foreground transition-transform active:translate-y-0.5",
          done ? "bg-success text-white shadow-none" : "bg-card shadow-[0_3px_0_0_var(--foreground)]",
        )}
        aria-label={done ? "mark undone" : "mark done"}
      >
        <Check className="h-5 w-5" />
      </button>
    </div>
  );
}
