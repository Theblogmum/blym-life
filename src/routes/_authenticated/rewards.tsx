import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getXp } from "@/lib/xp.functions";
import { getClaimedRewards, claimReward } from "@/lib/rewards.functions";
import { Lock, Sparkles, Gift, Check, Copy, BookOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageHero } from "@/components/page-hero";
import { REWARDS, type RewardContent } from "@/lib/rewards-content";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/rewards")({ component: RewardsPage });

const THEME_STORAGE = "blym.theme.softSunset";

function RewardsPage() {
  const qc = useQueryClient();
  const fetchXp = useServerFn(getXp);
  const fetchClaimed = useServerFn(getClaimedRewards);
  const doClaim = useServerFn(claimReward);

  const { data: xpData } = useQuery({ queryKey: ["xp"], queryFn: () => fetchXp() });
  const { data: claimedData } = useQuery({
    queryKey: ["claimed-rewards"],
    queryFn: () => fetchClaimed(),
  });

  const xp = xpData?.xp ?? 0;
  const claimed: Record<string, boolean> = {};
  for (const row of claimedData?.claimed ?? []) claimed[row.chest_id] = true;

  const [openId, setOpenId] = useState<string | null>(null);

  const claimMutation = useMutation({
    mutationFn: (chestId: string) => doClaim({ data: { chestId } }),
    onSuccess: (_d, chestId) => {
      qc.invalidateQueries({ queryKey: ["claimed-rewards"] });
      const c = REWARDS.find((r) => r.id === chestId);
      if (c) {
        toast.success(`${c.emoji} ${c.title} unlocked!`, { description: "saved to your vault forever 🤍" });
        setOpenId(chestId);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openReward = REWARDS.find((r) => r.id === openId) ?? null;
  const claimedCount = Object.values(claimed).filter(Boolean).length;

  return (
    <div>
      <PageHero
        icon={Gift}
        eyebrow="Rewards™"
        title="your rewards vault ✨"
        description="unlock chests as you earn XP. everything you unlock is saved here forever — open it anytime."
        variant="sunrise"
      >
        <div className="flex flex-wrap gap-2">
          <span className="chip-soft">⚡ {xp} XP</span>
          <span className="chip-soft">🎁 {claimedCount} in vault</span>
        </div>
      </PageHero>
      <section className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {REWARDS.map((c) => {
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
                      <Check className="h-3 w-3" /> in vault
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
                      onClick={() => claimMutation.mutate(c.id)}
                      disabled={claimMutation.isPending}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-foreground px-4 py-2.5 text-[13px] font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_oklch(0.13_0.012_20/0.4)] disabled:opacity-60"
                    >
                      <Gift className="h-3.5 w-3.5" /> unlock chest
                    </button>
                  )}
                  {isClaimed && (
                    <button
                      onClick={() => setOpenId(c.id)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-foreground/[0.06] px-4 py-2.5 text-[13px] font-semibold text-foreground transition-all duration-300 hover:bg-foreground/[0.1] hover:-translate-y-0.5"
                    >
                      <BookOpen className="h-3.5 w-3.5" /> open vault
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-[11.5px] text-foreground/45">
          <Sparkles className="mr-1 inline h-3 w-3" />
          everything you unlock stays in your vault forever — open it anytime.
        </p>
      </section>

      <RewardDialog reward={openReward} open={openId !== null} onOpenChange={(v) => !v && setOpenId(null)} />
    </div>
  );
}

function RewardDialog({
  reward,
  open,
  onOpenChange,
}: {
  reward: RewardContent | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [themeOn, setThemeOn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(THEME_STORAGE) === "1";
  });

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied 🤍`);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const toggleTheme = () => {
    const next = !themeOn;
    setThemeOn(next);
    if (next) {
      document.documentElement.classList.add("theme-soft-sunset");
      localStorage.setItem(THEME_STORAGE, "1");
      toast.success("Soft Sunset theme on ✨");
    } else {
      document.documentElement.classList.remove("theme-soft-sunset");
      localStorage.removeItem(THEME_STORAGE);
      toast("Theme off");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {reward && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl"
                  style={{ boxShadow: `0 8px 22px -10px ${reward.glow}` }}
                >
                  {reward.emoji}
                </div>
                <div>
                  <DialogTitle className="font-display text-[20px] tracking-[-0.012em]">
                    {reward.title}
                  </DialogTitle>
                  <DialogDescription className="text-[12.5px]">{reward.loot}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <p className="text-[13px] leading-relaxed text-foreground/70">{reward.intro}</p>

            {reward.kind === "theme" ? (
              <div className="rounded-2xl bg-foreground/[0.04] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-display text-[15px] font-semibold">{reward.items[0].title}</h4>
                    <p className="mt-1 text-[12.5px] text-foreground/65">{reward.items[0].body}</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                      themeOn
                        ? "bg-foreground text-background"
                        : "bg-white text-foreground ring-1 ring-foreground/10 hover:-translate-y-0.5",
                    )}
                  >
                    {themeOn ? "on ✓" : "turn on"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {reward.items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-foreground/[0.035] p-4 ring-1 ring-foreground/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-display text-[14.5px] font-semibold leading-tight">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => copy(item.body, item.title)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5"
                      >
                        <Copy className="h-3 w-3" /> copy
                      </button>
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-[12.5px] leading-relaxed text-foreground/75">
                      {item.body}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
