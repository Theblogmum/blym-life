import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getLeague } from "@/lib/leagues.functions";
import { Trophy, Clock, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/leagues")({
  head: () => ({ meta: [{ title: "Leagues — Blym" }] }),
  component: LeaguesPage,
});

function LeaguesPage() {
  const fetchLeague = useServerFn(getLeague);
  const q = useQuery({ queryKey: ["league"], queryFn: () => fetchLeague(), staleTime: 60_000 });
  const d = q.data;

  return (
    <div>
      <PageHero
        icon={Trophy}
        eyebrow="Weekly league"
        title="climb the ranks, bestie."
        description="every Monday resets. earn XP this week → climb tiers → flex 🌟"
        variant="bloom"
      />
      <section className="mx-auto max-w-[900px] px-5 py-8 sm:py-10">
      {q.isLoading || !d ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      ) : (
        <>
          {/* Tier card */}
          <div
            className="relative overflow-hidden rounded-[2rem] p-7 sm:p-9 shadow-[var(--shadow-layered)]"
            style={{ background: `linear-gradient(135deg, ${d.tierColor}, oklch(0.2 0.04 290) 70%, oklch(0.14 0.03 290))` }}
          >
            <div aria-hidden className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
            <div aria-hidden className="absolute -bottom-16 -left-12 h-52 w-52 rounded-full opacity-30 blur-3xl" style={{ background: d.tierColor }} />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur ring-1 ring-white/20">
                  <Trophy className="h-3 w-3" /> current tier
                </span>
                <h2 className="mt-4 font-display text-[40px] font-bold leading-none tracking-[-0.02em] text-white sm:text-[54px]">
                  <span className="mr-2">{d.tierEmoji}</span>{d.tierLabel}
                </h2>
                <p className="mt-3 text-[13px] text-white/70">
                  rank <span className="font-semibold text-white tabular-nums">#{d.rank}</span> of {d.totalInTier} this week
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:text-right">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">week XP</p>
                  <p className="font-display text-[30px] font-bold tabular-nums text-white tracking-[-0.015em]">{d.weekXp}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">resets in</p>
                  <p className="font-display text-[30px] font-bold tabular-nums text-white inline-flex items-center gap-1 tracking-[-0.015em]">
                    <Clock className="h-5 w-5 opacity-70" />{d.daysLeft}d
                  </p>
                </div>
              </div>
            </div>
            {d.nextTier && (
              <div className="relative mt-6 rounded-2xl bg-white/10 px-4 py-3 text-white/85 backdrop-blur ring-1 ring-white/15">
                <p className="text-[12.5px]">
                  <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                  <span className="font-semibold tabular-nums">{d.nextTier.xpToNext} XP</span> to reach{" "}
                  <span className="font-semibold">{d.nextTier.emoji} {d.nextTier.label}</span>
                </p>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-display text-[22px] font-bold tracking-[-0.015em]">this week's rankings</h2>
              <span className="text-[11px] font-semibold text-muted-foreground">{d.tierLabel} league</span>
            </div>
            <ol className="space-y-2">
              {d.entries.map((e, i) => (
                <li
                  key={e.user_id}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl p-3.5 transition-all duration-300 hover:-translate-y-[1px]",
                    e.isMe
                      ? "bg-white ring-2 ring-foreground/85 shadow-[var(--shadow-elegant)]"
                      : "bg-white/70 ring-1 ring-border/40 hover:bg-white",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[13px] font-bold tabular-nums",
                      i === 0 ? "bg-[oklch(0.95_0.13_85)] text-[oklch(0.35_0.15_70)] shadow-[0_4px_12px_-4px_oklch(0.83_0.18_85/0.55)]" :
                      i === 1 ? "bg-[oklch(0.93_0.02_240)] text-foreground/80" :
                      i === 2 ? "bg-[oklch(0.92_0.08_50)] text-[oklch(0.4_0.16_50)] shadow-[0_4px_12px_-4px_oklch(0.78_0.15_50/0.45)]" :
                      "bg-foreground/[0.06] text-foreground/65",
                    )}
                  >
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-[-0.005em]">
                    {e.isMe ? "you 💛" : e.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-foreground/[0.06] px-2.5 py-1 text-[12px] font-semibold tabular-nums text-foreground/75">
                    {e.weekXp} XP
                  </span>
                </li>
              ))}
            </ol>
            {d.entries.length === 1 && (
              <p className="mt-4 rounded-2xl bg-foreground/[0.03] p-5 text-center text-[12.5px] text-muted-foreground ring-1 ring-dashed ring-foreground/15">
                you're the only one in your league this week. log a quest to claim the throne 👑
              </p>
            )}
          </section>
        </>
      )}
      </section>
    </div>
  );
}
