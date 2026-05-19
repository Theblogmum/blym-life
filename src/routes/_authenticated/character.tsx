import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Trophy, Flame, Rocket, Wand2, Heart, Pencil } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { getXp } from "@/lib/xp.functions";
import { getAchievements } from "@/lib/achievements.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/character")({ component: CharacterSheetPage });

const ERAS: Record<string, { emoji: string; label: string; tint: string }> = {
  soft:  { emoji: "🫧", label: "soft girl era",       tint: "var(--surface-sky)" },
  hot:   { emoji: "💋", label: "hot girl era",        tint: "var(--surface-peach)" },
  mum:   { emoji: "🍼", label: "mum-of-chaos era",    tint: "var(--surface-butter)" },
  boss:  { emoji: "👑", label: "ceo era",             tint: "var(--surface-plum)" },
  quiet: { emoji: "🌙", label: "quiet rebuild era",   tint: "var(--surface-mint)" },
  main:  { emoji: "✨", label: "main character era",  tint: "var(--surface-blush)" },
};

const TYPES: Record<string, { emoji: string; title: string; power: string }> = {
  storyteller: { emoji: "📖", title: "The Storyteller", power: "+10% on carousel & blog ideas" },
  entertainer: { emoji: "🎬", title: "The Entertainer", power: "+10% on hook lab & viral lab" },
  teacher:     { emoji: "🧠", title: "The Teacher",     power: "+10% on SEO & series builder" },
  aesthete:    { emoji: "🌸", title: "The Aesthete",    power: "+10% on moodboards & b-roll" },
  hustler:     { emoji: "💼", title: "The Hustler",     power: "+10% on pitches & income" },
  softie:      { emoji: "🫶", title: "The Soft Mum Era", power: "+10% on motivation & pep talks" },
};

function CharacterSheetPage() {
  const fetchXp = useServerFn(getXp);
  const fetchAch = useServerFn(getAchievements);
  const xpQ = useQuery({ queryKey: ["xp"], queryFn: () => fetchXp() });
  const achQ = useQuery({ queryKey: ["achievements"], queryFn: () => fetchAch() });

  const [era, setEra] = useState<string>("soft");
  const [typeId, setTypeId] = useState<string | null>(null);
  useEffect(() => {
    setEra(localStorage.getItem("blym.era") || "soft");
    setTypeId(localStorage.getItem("blym.creatorType"));
  }, []);

  const xp = xpQ.data;
  const level = xp?.level ?? 1;
  const totalXp = xp?.xp ?? 0;
  const streak = xp?.streak ?? 0;
  const pct = xp
    ? Math.min(100, Math.max(2, Math.round(((xp.xp - xp.prevLevelXp) / Math.max(1, xp.nextLevelXp - xp.prevLevelXp)) * 100)))
    : 0;
  const toNext = xp ? Math.max(0, xp.nextLevelXp - xp.xp) : 0;

  const eraMeta = ERAS[era] ?? ERAS.soft;
  const typeMeta = typeId ? TYPES[typeId] : null;
  const ach = achQ.data;
  const unlocked = ach?.unlockedCount ?? 0;
  const totalAch = ach?.total ?? 0;

  const recentUnlocks = (ach?.achievements ?? []).filter(a => a.unlocked).slice(0, 6);

  return (
    <>
      <PageHero
        icon={Sparkles}
        eyebrow="rpg · character sheet"
        title="Your character"
        description="your era, your power, your stats — all the things that make you, you."
        variant="bloom"
      />

      <div className="mx-auto max-w-5xl space-y-6 px-5 py-8">
        {/* Identity card */}
        <section
          className="relative overflow-hidden rounded-3xl border-2 border-foreground/12 p-6 shadow-[8px_8px_0_-2px_oklch(0.2_0.01_20/0.06)] sm:p-8"
          style={{ background: eraMeta.tint }}
        >
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl border-2 border-foreground/15 bg-background text-5xl shadow-[var(--shadow-soft)]">
              {typeMeta?.emoji ?? eraMeta.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/55">
                currently in
              </p>
              <h2 className="mt-1 font-display text-3xl font-black leading-tight tracking-tight text-foreground">
                {eraMeta.label}
              </h2>
              {typeMeta ? (
                <p className="mt-2 text-sm text-foreground/75">
                  <span className="font-semibold">{typeMeta.title}</span>
                  <span className="text-foreground/55"> · {typeMeta.power}</span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-foreground/65">
                  no creator type picked yet —{" "}
                  <Link to="/creator-type" className="font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground/70">
                    pick yours
                  </Link>
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/welcome"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-foreground/15 bg-background/80 px-3 text-[12px] font-semibold text-foreground transition hover:border-foreground/35"
                >
                  <Pencil className="h-3 w-3" /> change era
                </Link>
                <Link
                  to="/creator-type"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-foreground/15 bg-background/80 px-3 text-[12px] font-semibold text-foreground transition hover:border-foreground/35"
                >
                  <Wand2 className="h-3 w-3" /> swap type
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats grid */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Rocket className="h-4 w-4" />}
            label="Level"
            value={`Lv ${level}`}
            sub={xp?.levelTitle ?? "—"}
            tint="surface-peach"
          />
          <StatCard
            icon={<Sparkles className="h-4 w-4" />}
            label="Total XP"
            value={totalXp.toLocaleString()}
            sub={toNext > 0 ? `${toNext.toLocaleString()} to next lv` : "max effort"}
            tint="surface-plum"
          />
          <StatCard
            icon={<Flame className="h-4 w-4" />}
            label="Streak"
            value={`${streak} days`}
            sub={streak >= 7 ? "on fire 🔥" : streak > 0 ? "keep going" : "start one today"}
            tint="surface-butter"
          />
          <StatCard
            icon={<Trophy className="h-4 w-4" />}
            label="Trophies"
            value={`${unlocked} / ${totalAch || "—"}`}
            sub={unlocked > 0 ? "earned & shiny" : "your first awaits"}
            tint="surface-mint"
          />
        </section>

        {/* Level progress bar */}
        <section className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <span>Level progress</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-foreground/8">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, oklch(0.78 0.16 18), oklch(0.72 0.18 340))" }}
            />
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            {toNext > 0
              ? <>almost there — <span className="font-semibold text-foreground">{toNext.toLocaleString()} XP</span> to level {level + 1}</>
              : "you're maxed for this band — keep collecting trophies"}
          </p>
        </section>

        {/* Trophy preview */}
        <section className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-black tracking-tight text-foreground">Trophies earned</h3>
              <p className="text-[12px] text-muted-foreground">cosmetic stickers from your wins</p>
            </div>
            <Link
              to="/achievements"
              className="inline-flex h-9 items-center gap-1 rounded-full border border-border bg-background px-3 text-[12px] font-semibold text-foreground transition hover:border-foreground/30"
            >
              <Trophy className="h-3 w-3" /> trophy room
            </Link>
          </div>

          {recentUnlocks.length === 0 ? (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-foreground/15 bg-background/50 p-6 text-center">
              <div className="text-3xl">🏅</div>
              <p className="mt-2 text-sm font-semibold text-foreground">no trophies yet</p>
              <p className="text-[12px] text-muted-foreground">
                complete a daily quest or send your first pitch — they unlock fast
              </p>
            </div>
          ) : (
            <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {recentUnlocks.map((a) => (
                <li
                  key={a.id}
                  className="surface-mint group flex flex-col items-center gap-1 rounded-2xl border border-foreground/10 p-3 text-center transition hover:-translate-y-0.5"
                  title={a.description}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-[10.5px] font-bold leading-tight text-foreground">{a.label}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick links */}
        <section className="grid gap-3 sm:grid-cols-3">
          <QuickLink to="/journey"     icon={<Rocket className="h-4 w-4" />} label="My journey"     sub="full XP history" />
          <QuickLink to="/milestones"  icon={<Heart  className="h-4 w-4" />} label="Big firsts"     sub="life moments" />
          <QuickLink to="/settings"    icon={<Wand2  className="h-4 w-4" />} label="Settings"        sub="account & prefs" />
        </section>
      </div>
    </>
  );
}

function StatCard({
  icon, label, value, sub, tint,
}: { icon: React.ReactNode; label: string; value: string; sub: string; tint: string }) {
  return (
    <div className={cn("rounded-2xl border-2 border-foreground/10 p-4 shadow-[4px_4px_0_-1px_oklch(0.2_0.01_20/0.06)]", tint)}>
      <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-foreground/55">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-black leading-none tracking-tight text-foreground">{value}</div>
      <div className="mt-1 text-[12px] text-foreground/65">{sub}</div>
    </div>
  );
}

function QuickLink({
  to, icon, label, sub,
}: { to: string; icon: React.ReactNode; label: string; sub: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-[var(--shadow-soft)]"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-foreground/5 text-foreground">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-foreground">{label}</span>
        <span className="block text-[12px] text-muted-foreground">{sub}</span>
      </span>
      <span className="text-muted-foreground transition group-hover:translate-x-0.5">→</span>
    </Link>
  );
}