import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getXp } from "@/lib/xp.functions";
import {
  Check,
  Sparkles,
  Snowflake,
  Flame,
  Gift,
  Lock,
  Trophy,
  Zap,
  Target,
  Heart,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NotifyOptIn } from "@/components/notify-opt-in";
import { celebrate } from "@/lib/celebrate";
import { xpPop } from "@/lib/xp-pop";

export const Route = createFileRoute("/_authenticated/quests")({ component: QuestsPage });

type Category = "create" | "grow" | "mindset" | "bonus";

const CAT: Record<Category, { label: string; grad: string; ring: string; text: string; soft: string; icon: typeof Sparkles }> = {
  create:  { label: "create",  grad: "linear-gradient(135deg,#ff7ab8,#ff2f92)", ring: "oklch(0.65 0.27 350 / 0.45)", text: "oklch(0.45 0.22 350)", soft: "oklch(0.96 0.05 350)", icon: Wand2 },
  grow:    { label: "grow",    grad: "linear-gradient(135deg,#8d4dff,#5b2bd6)", ring: "oklch(0.55 0.27 295 / 0.45)", text: "oklch(0.40 0.22 295)", soft: "oklch(0.95 0.05 295)", icon: TrendingUp },
  mindset: { label: "mindset", grad: "linear-gradient(135deg,#74e3b8,#3bbf86)", ring: "oklch(0.68 0.18 155 / 0.45)", text: "oklch(0.40 0.16 155)", soft: "oklch(0.96 0.05 155)", icon: Heart },
  bonus:   { label: "bonus",   grad: "linear-gradient(135deg,#ffd27d,#ff9b3d)", ring: "oklch(0.78 0.16 70 / 0.45)",  text: "oklch(0.45 0.15 60)",  soft: "oklch(0.96 0.05 70)",  icon: Gift },
};

type Quest = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  xp: number;
  to?: string;
  cat: Category;
};

const DAILY: Quest[] = [
  { id: "open", emoji: "👋", title: "show up today",          desc: "you opened the app — that's the streak",      xp: 5,  cat: "mindset" },
  { id: "idea", emoji: "💡", title: "grab 1 content idea",    desc: "one fresh idea from the studio",               xp: 10, to: "/generator",  cat: "create" },
  { id: "hook", emoji: "🪝", title: "save a hook you love",   desc: "bank a scroll-stopper for later",              xp: 10, to: "/viral-lab",  cat: "create" },
  { id: "film", emoji: "🎬", title: "film one tiny clip",     desc: "even 5 seconds counts, bestie",                xp: 15, to: "/app",        cat: "create" },
  { id: "pep",  emoji: "🫶", title: "read today's pep talk",  desc: "soft brain reset · 60 seconds",                xp: 5,  to: "/motivation", cat: "mindset" },
];

const WEEKLY: Quest[] = [
  { id: "w-post",   emoji: "📱", title: "post 3 times this week", desc: "consistency beats virality",   xp: 50, cat: "grow" },
  { id: "w-pitch",  emoji: "💌", title: "draft 1 brand pitch",    desc: "money in, magic out",          xp: 75, to: "/brand-hub",     cat: "grow" },
  { id: "w-series", emoji: "📚", title: "plan a mini-series",     desc: "3 connected ideas, one arc",   xp: 60, to: "/series-builder", cat: "create" },
];

const KEY = "blym.quests";
const FREEZE_KEY = "blym.streakFreeze";
const FREEZE_DAILY_KEY = "blym.lastFreezeDate";
const CHEST_KEY = "blym.lastChestDate";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadDone(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

function QuestsPage() {
  const [done, setDone] = useState<Record<string, string>>({});
  const [freezes, setFreezes] = useState(2);
  const [chestOpened, setChestOpened] = useState(false);
  const today = todayKey();
  const fetchXp = useServerFn(getXp);
  const xpQ = useQuery({ queryKey: ["xp"], queryFn: () => fetchXp() });

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
    setChestOpened(localStorage.getItem(CHEST_KEY) === today);
  }, [today]);

  const toggle = (q: Quest) => {
    const next = { ...done };
    const wasDone = !!next[q.id];
    if (wasDone) delete next[q.id];
    else {
      next[q.id] = today;
      xpPop(q.xp, q.title);
      celebrate(q.xp >= 50 ? "big" : "tiny");
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
  const dailyDone = DAILY.filter((q) => done[q.id]).length;
  const weeklyDone = WEEKLY.filter((q) => done[q.id]).length;

  const xp = xpQ.data;
  const into = xp ? xp.xp - xp.prevLevelXp : 0;
  const span = xp ? Math.max(1, xp.nextLevelXp - xp.prevLevelXp) : 1;
  const levelPct = xp ? Math.min(100, Math.round((into / span) * 100)) : 0;

  const chestReady = pct === 100 && !chestOpened;
  const openChest = () => {
    if (!chestReady) {
      toast("chest is locked 🔒", { description: `finish today's 5 quests to unlock — ${dailyDone}/5 done` });
      return;
    }
    localStorage.setItem(CHEST_KEY, today);
    setChestOpened(true);
    celebrate("level-up");
    xpPop(25, "daily chest");
    toast.success("✨ +25 bonus XP", { description: "tomorrow's chest is already filling up" });
  };

  return (
    <div className="page-enter relative bg-background">
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-4 pb-12 sm:px-8 sm:pt-6 lg:px-12">
        {/* HERO — level / XP / daily / streak / chest preview */}
        <HeroCard
          xp={xp}
          levelPct={levelPct}
          dailyXp={dailyXp}
          dailyTotal={dailyTotal}
          dailyDone={dailyDone}
          chestReady={chestReady}
          chestOpened={chestOpened}
          onOpenChest={openChest}
          freezes={freezes}
          onFreeze={useFreeze}
        />

        {/* Daily quests */}
        <SectionHeader
          eyebrow="today"
          title="daily quests"
          icon={Flame}
          progress={`${dailyDone}/${DAILY.length}`}
          accent="linear-gradient(135deg,#ff2f92,#8d4dff)"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {DAILY.map((q, i) => (
            <QuestCard key={q.id} q={q} done={!!done[q.id]} onToggle={() => toggle(q)} delay={i * 40} />
          ))}
        </div>

        {/* Weekly quests */}
        <SectionHeader
          eyebrow="this week"
          title="weekly quests"
          icon={Trophy}
          progress={`${weeklyDone}/${WEEKLY.length}`}
          accent="linear-gradient(135deg,#8d4dff,#7a3cff)"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WEEKLY.map((q, i) => (
            <QuestCard key={q.id} q={q} done={!!done[q.id]} onToggle={() => toggle(q)} delay={i * 40} large />
          ))}
        </div>

        <div className="mt-8">
          <NotifyOptIn />
        </div>
      </div>
    </div>
  );
}

function HeroCard({
  xp, levelPct, dailyXp, dailyTotal, dailyDone, chestReady, chestOpened, onOpenChest, freezes, onFreeze,
}: {
  xp: any; levelPct: number; dailyXp: number; dailyTotal: number; dailyDone: number;
  chestReady: boolean; chestOpened: boolean; onOpenChest: () => void;
  freezes: number; onFreeze: () => void;
}) {
  const dailyPct = Math.round((dailyXp / dailyTotal) * 100);
  return (
    <section
      className="relative mb-7 overflow-hidden rounded-[28px] p-5 sm:p-8 text-white shadow-[var(--shadow-layered)]"
      style={{
        background:
          "radial-gradient(120% 90% at 0% 0%, oklch(0.65 0.27 350 / 0.95), transparent 55%)," +
          "radial-gradient(120% 90% at 100% 0%, oklch(0.57 0.27 295 / 0.95), transparent 55%)," +
          "linear-gradient(135deg,#ff2f92 0%,#ff4db8 30%,#8d4dff 65%,#5b2bd6 100%)",
      }}
    >
      {/* Floating orbs */}
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
           style={{ background: "radial-gradient(1px 1px at 20% 30%, #fff 50%, transparent 50%), radial-gradient(1px 1px at 70% 60%, #fff 50%, transparent 50%), radial-gradient(1.5px 1.5px at 40% 80%, #fff 50%, transparent 50%), radial-gradient(1px 1px at 85% 20%, #fff 50%, transparent 50%)" }} />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.24em] text-white/85">✨ creator journey</p>
          <h1 className="mt-2 font-display text-[28px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[40px]">
            {xp ? <>Lv {xp.level} · <span className="text-white/90">{xp.levelTitle}</span></> : <>your journey</>}
          </h1>
          <p className="mt-1.5 text-[13px] text-white/80 sm:text-[14.5px]">
            tiny quests, real momentum. one tap closer to your next era.
          </p>
        </div>

        <button
          onClick={onFreeze}
          className="group inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-[11.5px] font-semibold text-white backdrop-blur-md transition hover:-translate-y-[1px] hover:bg-white/25"
        >
          <Snowflake className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" /> freeze · {freezes}
        </button>
      </div>

      {/* Level XP bar */}
      {xp && (
        <div className="relative mt-6">
          <div className="flex items-baseline justify-between text-[11.5px] font-semibold text-white/85">
            <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> {xp.xp} XP</span>
            <span className="tabular-nums">{xp.nextLevelXp} → Lv {xp.level + 1}</span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/15 ring-1 ring-inset ring-white/20">
            <div
              className="relative h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${Math.max(3, levelPct)}%`,
                background: "linear-gradient(90deg,#fff,#ffe2f0 50%,#fff 100%)",
                boxShadow: "0 0 24px oklch(1 0 0 / 0.55)",
              }}
            >
              <span aria-hidden className="absolute inset-0 animate-pulse rounded-full bg-white/40 mix-blend-overlay" />
            </div>
          </div>
        </div>
      )}

      {/* Stat tiles + chest */}
      <div className="relative mt-6 grid gap-3 sm:grid-cols-4">
        <StatTile icon={Target} label="today" value={`${dailyDone}/5`} sub={`${dailyXp}/${dailyTotal} XP`} />
        <StatTile icon={Flame} label="streak" value={xp ? `${xp.streak}d` : "—"} sub={xp?.streak ? "keep it warm" : "start today"} accent />
        <StatTile icon={Zap} label="xp today" value={`+${dailyXp}`} sub={`${dailyPct}% of goal`} />
        <ChestTile ready={chestReady} opened={chestOpened} onOpen={onOpenChest} dailyDone={dailyDone} />
      </div>
    </section>
  );
}

function StatTile({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-white/25 bg-white/12 p-3.5 backdrop-blur-md transition hover:-translate-y-[2px] hover:bg-white/20",
      accent && "ring-1 ring-white/30",
    )}>
      <div className="flex items-center gap-2 text-white/85">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-1 font-display text-[22px] font-bold tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-white/75">{sub}</p>
    </div>
  );
}

function ChestTile({ ready, opened, onOpen, dailyDone }: { ready: boolean; opened: boolean; onOpen: () => void; dailyDone: number }) {
  return (
    <button
      onClick={onOpen}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all",
        opened
          ? "border-white/25 bg-white/10 backdrop-blur-md"
          : ready
            ? "border-white/60 bg-gradient-to-br from-[#ffd27d] to-[#ff7ab8] shadow-[0_10px_30px_-8px_oklch(1_0_0/0.45)] hover:-translate-y-[2px]"
            : "border-white/25 bg-white/10 backdrop-blur-md hover:bg-white/15",
      )}
    >
      {ready && !opened && (
        <span aria-hidden className="pointer-events-none absolute inset-0 animate-pulse rounded-2xl ring-2 ring-white/70" />
      )}
      <div className="flex items-center gap-2 text-white/90">
        {opened ? <Check className="h-3.5 w-3.5" /> : ready ? <Gift className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em]">daily chest</span>
      </div>
      <p className="mt-1 font-display text-[22px] font-bold leading-none">
        {opened ? "claimed" : ready ? "+25 XP" : "🎁"}
      </p>
      <p className="mt-1 text-[11px] font-medium text-white/85">
        {opened ? "back tomorrow" : ready ? "tap to open" : `${dailyDone}/5 to unlock`}
      </p>
    </button>
  );
}

function SectionHeader({ eyebrow, title, icon: Icon, progress, accent }: { eyebrow: string; title: string; icon: any; progress: string; accent: string }) {
  return (
    <div className="mt-7 mb-3 flex items-end justify-between">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-foreground/55">{eyebrow}</p>
        <h2 className="mt-1 inline-flex items-center gap-2 font-display text-[22px] font-bold tracking-[-0.015em] sm:text-[26px]">
          <span className="grid h-7 w-7 place-items-center rounded-lg text-white shadow-[0_6px_16px_-6px_oklch(0.65_0.27_350/0.55)]" style={{ background: accent }}>
            <Icon className="h-3.5 w-3.5" strokeWidth={2.6} />
          </span>
          {title}
        </h2>
      </div>
      <span className="rounded-full border border-border/60 bg-card px-3 py-1 text-[11.5px] font-bold tabular-nums text-foreground/70 shadow-[var(--shadow-xs)]">
        {progress}
      </span>
    </div>
  );
}

function QuestCard({ q, done, onToggle, delay = 0, large = false }: { q: Quest; done: boolean; onToggle: () => void; delay?: number; large?: boolean }) {
  const c = CAT[q.cat];
  const CatIcon = c.icon;

  const Body = (
    <div className="relative flex h-full flex-col gap-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[24px] ring-1 ring-white/70 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105",
            done && "bounce-in",
          )}
          style={{
            background: c.grad,
            boxShadow: `0 10px 24px -8px ${c.ring}, inset 0 1px 0 oklch(1 0 0 / 0.55)`,
          }}
        >
          <span className="drop-shadow-sm">{q.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.16em]"
              style={{ background: c.soft, color: c.text }}
            >
              <CatIcon className="h-2.5 w-2.5" strokeWidth={3} />
              {c.label}
            </span>
          </div>
          <p className={cn(
            "mt-1.5 font-display font-bold leading-tight tracking-[-0.01em]",
            large ? "text-[16.5px]" : "text-[15.5px]",
            done && "line-through opacity-55",
          )}>
            {q.title}
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-foreground/65">{q.desc}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-1">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold tabular-nums"
          style={{ background: c.soft, color: c.text }}
        >
          <Zap className="h-3 w-3" strokeWidth={3} /> +{q.xp} XP
        </span>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
          aria-label={done ? "mark undone" : "mark done"}
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all duration-300 active:scale-90",
            done
              ? "scale-105 text-white shadow-[0_6px_18px_-4px_oklch(0.6_0.16_155/0.5)]"
              : "bg-foreground/[0.05] text-foreground/55 group-hover:scale-105 group-hover:text-white",
          )}
          style={{
            background: done ? "linear-gradient(135deg,#3bbf86,#2a9c6a)" : undefined,
          }}
          onMouseEnter={(e) => {
            if (!done) (e.currentTarget as HTMLElement).style.background = c.grad;
          }}
          onMouseLeave={(e) => {
            if (!done) (e.currentTarget as HTMLElement).style.background = "";
          }}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "group relative isolate overflow-hidden rounded-2xl border p-4 transition-all duration-300 sm:p-5",
        "bg-card/90 backdrop-blur-md",
        done
          ? "border-[oklch(0.78_0.16_155)]/45"
          : "border-border/55 hover:-translate-y-[3px] hover:border-transparent hover:shadow-[var(--shadow-elegant)]",
      )}
      style={{
        animation: `fade-in 0.4s ${delay}ms both`,
        background: done
          ? `linear-gradient(135deg, oklch(0.97 0.04 155 / 0.8), var(--card))`
          : undefined,
      }}
    >
      {/* Layered glow ring on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: c.grad, filter: "blur(18px)", transform: "scale(0.96)" }}
      />
      {/* Top tint accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] opacity-80"
        style={{ background: c.grad }}
      />
      {/* Soft corner orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-10 h-32 w-32 rounded-full opacity-35 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: c.grad }}
      />

      {q.to ? (
        <Link to={q.to} className="block h-full">{Body}</Link>
      ) : (
        <div className="h-full">{Body}</div>
      )}
    </div>
  );
}
