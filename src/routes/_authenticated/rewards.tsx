import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getXp } from "@/lib/xp.functions";
import { Lock, Sparkles, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/rewards")({ component: RewardsPage });

type Chest = { id: string; xp: number; emoji: string; title: string; loot: string; tint: string };

const CHESTS: Chest[] = [
  { id: "starter", xp: 25, emoji: "🎁", title: "Starter Pack", loot: "10 scroll-stopping hooks", tint: "var(--surface-mint)" },
  { id: "caption", xp: 100, emoji: "💌", title: "Caption Vault", loot: "25 caption templates", tint: "var(--surface-butter)" },
  { id: "viral", xp: 250, emoji: "🔥", title: "Viral Hook Box", loot: "Pro hook formulas", tint: "var(--surface-rose)" },
  { id: "pitch", xp: 500, emoji: "💼", title: "Pitch Power-up", loot: "5 brand pitch templates", tint: "var(--surface-plum)" },
  { id: "theme", xp: 800, emoji: "✨", title: "Soft Theme Unlock", loot: "Exclusive app theme", tint: "var(--surface-blush)" },
  { id: "lesson", xp: 1250, emoji: "🎓", title: "Creator Lessons", loot: "3 mini-courses", tint: "var(--surface-sky)" },
  { id: "deal", xp: 2000, emoji: "👑", title: "Brand Deal Bundle", loot: "Media kit + invoice templates", tint: "var(--surface-grape)" },
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="sticker mb-8 p-6 sm:p-7" style={{ background: "var(--gradient-sunrise)" }}>
        <p className="eyebrow">your rewards</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">unlock chests as you grow ✨</h1>
        <p className="mt-2 text-muted-foreground">every level earns you a little dopamine drop. claim when you're ready.</p>
        <div className="mt-4 flex gap-2">
          <span className="xp-pill">⚡ {xp} XP</span>
          <span className="streak-chip">🎁 {Object.values(claimed).filter(Boolean).length} claimed</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CHESTS.map((c) => {
          const unlocked = xp >= c.xp;
          const isClaimed = !!claimed[c.id];
          return (
            <div
              key={c.id}
              className={cn(
                "sticker p-5 flex flex-col",
                !unlocked && "opacity-70",
              )}
              style={unlocked ? { background: c.tint } : undefined}
            >
              <div className="flex items-start justify-between">
                <div className={cn(
                  "grid h-16 w-16 place-items-center rounded-2xl border-2 border-foreground bg-card text-3xl shadow-[0_4px_0_0_var(--foreground)]",
                  unlocked && !isClaimed && "wiggle",
                )}>
                  {unlocked ? c.emoji : <Lock className="h-7 w-7 text-muted-foreground" />}
                </div>
                {isClaimed && <span className="xp-pill !bg-success/20 !border-success !text-success">claimed ✓</span>}
              </div>
              <h3 className="mt-3 font-display text-xl">{c.title}</h3>
              <p className="mt-1 text-sm text-foreground/80">{c.loot}</p>
              <div className="mt-auto pt-4">
                {!unlocked && (
                  <p className="text-xs text-muted-foreground"><Lock className="inline h-3 w-3 mr-1" />Reach {c.xp} XP ({c.xp - xp} to go)</p>
                )}
                {unlocked && !isClaimed && (
                  <button onClick={() => claim(c)} className="btn-chunky btn-chunky--primary text-sm w-full">
                    <Gift className="h-4 w-4" /> claim reward
                  </button>
                )}
                {isClaimed && (
                  <p className="text-xs text-success font-bold inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> in your stash forever
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
