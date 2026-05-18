import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getXp } from "@/lib/xp.functions";
import { Lock, Sparkles, Gift, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/rewards")({ component: RewardsPage });

type Chest = { id: string; xp: number; emoji: string; title: string; loot: string; glow: string };

const CHESTS: Chest[] = [
  { id: "starter", xp: 25,   emoji: "🎁", title: "Starter Pack",      loot: "10 scroll-stopping hooks",            glow: "oklch(0.78 0.16 150)" },
  { id: "caption", xp: 100,  emoji: "💌", title: "Caption Vault",     loot: "25 caption templates",                glow: "oklch(0.82 0.16 80)"  },
  { id: "viral",   xp: 250,  emoji: "🔥", title: "Viral Hook Box",    loot: "Pro hook formulas",                   glow: "oklch(0.74 0.2 25)"   },
  { id: "pitch",   xp: 500,  emoji: "💼", title: "Pitch Power-up",    loot: "5 brand pitch templates",             glow: "oklch(0.7 0.18 320)"  },
  { id: "theme",   xp: 800,  emoji: "✨", title: "Soft Theme Unlock", loot: "Exclusive app theme",                 glow: "oklch(0.74 0.18 350)" },
  { id: "lesson",  xp: 1250, emoji: "🎓", title: "Creator Lessons",   loot: "3 mini-courses",                      glow: "oklch(0.72 0.16 225)" },
  { id: "deal",    xp: 2000, emoji: "👑", title: "Brand Deal Bundle", loot: "Media kit + invoice templates",       glow: "oklch(0.7 0.18 290)"  },
];

const STORAGE = "blym.chests.claimed";

function RewardsPage() {
  const fetchXp = useServerFn(getXp);
  const { data: xpData } = useQuery({ queryKey: ["xp"], queryFn: () => fetchXp() });
  const xp = xpData?.xp ?? 0;
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try { setClaimed(JSON.parse(localStorage.getItem(STORAGE) || "{}")); } catch {}
  }, []);

  const claim = (c: Chest) => {
    const next = { ...claimed, [c.id]: true };
    setClaimed(next);
    localStorage.setItem(STORAGE, JSON.stringify(next));
    toast.success(`${c.emoji} ${c.title} claimed!`, { description: c.loot });
  };

  return (
    <div>
      <PageHero
        icon={Gift}
        eyebrow="Your rewards"
        title="unlock chests as you grow ✨"
        description="every level earns you a little dopamine drop. claim when you're ready."
        variant="sunrise"
      >
        <div className="flex flex-wrap gap-2">
          <span className="chip-soft">⚡ {xp} XP</span>
          <span className="chip-soft">🎁 {Object.values(claimed).filter(Boolean).length} claimed</span>
        </div>
      </PageHero>
      <section className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {CHESTS.map((c) => {
            const unlocked = xp >= c.xp;
            const isClaimed = !!claimed[c.id];
            const pct = Math.min(100, Math.round((xp / c.xp) * 100));
            return (
              <div
                key={c.id}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-[1.6rem] p-5 transition-all duration-500",
                  unlocked
                    ? "bg-white/85 backdrop-blur-sm ring-1 ring-white/60 hover:-translate-y-1"
                    : "bg-foreground/[0.025] ring-1 ring-foreground/[0.06]",
                )}
                style={
                  unlocked
                    ? {
                        boxShadow: `inset 0 1px 0 oklch(1 0 0 / 0.7), 0 1px 2px oklch(0.13 0.012 20 / 0.05), 0 18px 36px -18px ${c.glow}`,
                      }
                    : undefined
                }
              >
                {unlocked && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-12 right-0 h-32 w-32 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
                    style={{ background: c.glow }}
                  />
                )}
                <div className="relative flex items-start justify-between">
                  <div
                    className={cn(
                      "grid h-16 w-16 place-items-center rounded-2xl text-3xl transition-transform duration-500",
                      unlocked
                        ? "bg-white shadow-[0_8px_22px_-10px_var(--chest-glow)] group-hover:scale-110 group-hover:-rotate-[6deg]"
                        : "bg-foreground/[0.04]",
                    )}
                    style={unlocked ? ({ ["--chest-glow" as any]: c.glow } as React.CSSProperties) : undefined}
                  >
                    {unlocked ? c.emoji : <Lock className="h-6 w-6 text-foreground/35" />}
                  </div>
                  {isClaimed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.94_0.07_150)] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[oklch(0.4_0.14_150)]">
                      <Check className="h-3 w-3" /> claimed
                    </span>
                  )}
                </div>
                <h3 className={cn("relative mt-4 font-display text-[18px] font-bold leading-tight tracking-[-0.012em]", !unlocked && "text-foreground/55")}>
                  {c.title}
                </h3>
                <p className={cn("relative mt-1 text-[13px] leading-relaxed", unlocked ? "text-foreground/70" : "text-foreground/45")}>
                  {c.loot}
                </p>
                <div className="relative mt-auto pt-5">
                  {!unlocked && (
                    <>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                        <div className="h-full rounded-full bg-foreground/30 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-2 text-[11.5px] text-foreground/55 tabular-nums">
                        {(c.xp - xp).toLocaleString()} XP to unlock
                      </p>
                    </>
                  )}
                  {unlocked && !isClaimed && (
                    <button
                      onClick={() => claim(c)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-foreground px-4 py-2.5 text-[13px] font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_oklch(0.13_0.012_20/0.4)]"
                    >
                      <Gift className="h-3.5 w-3.5" /> claim reward
                    </button>
                  )}
                  {isClaimed && (
                    <p className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-foreground/55">
                      <Sparkles className="h-3 w-3" /> in your stash forever
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
