import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getLeague } from "@/lib/leagues.functions";
import { Trophy, Clock, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/leagues")({
  head: () => ({ meta: [{ title: "Leagues — Blym" }] }),
  component: LeaguesPage,
});

function LeaguesPage() {
  const fetchLeague = useServerFn(getLeague);
  const q = useQuery({ queryKey: ["league"], queryFn: () => fetchLeague(), staleTime: 60_000 });
  const d = q.data;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 lg:px-8 lg:py-10">
      <header className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">weekly league</p>
        <h1 className="mt-1 font-display text-[28px] font-black leading-tight sm:text-[36px]">
          climb the ranks, bestie.
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          every Monday resets. earn XP this week → climb tiers → flex 🌟
        </p>
      </header>

      {q.isLoading || !d ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      ) : (
        <>
          {/* Tier card */}
          <div
            className="relative overflow-hidden rounded-[1.75rem] p-6 shadow-[var(--shadow-layered)]"
            style={{ background: `linear-gradient(135deg, ${d.tierColor}, oklch(0.18 0.012 20))` }}
          >
            <div aria-hidden className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  <Trophy className="h-3 w-3" /> current tier
                </span>
                <h2 className="mt-3 font-display text-[40px] font-black leading-none text-white sm:text-[52px]">
                  <span className="mr-2">{d.tierEmoji}</span>{d.tierLabel}
                </h2>
                <p className="mt-2 text-[13px] text-white/75">
                  rank <span className="font-bold text-white tabular-nums">#{d.rank}</span> of {d.totalInTier} this week
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:text-right">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/55">week XP</p>
                  <p className="font-display text-[28px] font-black tabular-nums text-white">{d.weekXp}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/55">resets in</p>
                  <p className="font-display text-[28px] font-black tabular-nums text-white inline-flex items-center gap-1">
                    <Clock className="h-5 w-5 opacity-70" />{d.daysLeft}d
                  </p>
                </div>
              </div>
            </div>
            {d.nextTier && (
              <div className="relative mt-5 rounded-2xl bg-black/25 p-3 text-white/85 backdrop-blur">
                <p className="text-[12px]">
                  <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                  <span className="font-bold tabular-nums">{d.nextTier.xpToNext} XP</span> to reach{" "}
                  <span className="font-bold">{d.nextTier.emoji} {d.nextTier.label}</span>
                </p>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <section className="mt-8">
            <div className="mb-3 flex items-end justify-between">
              <h2 className="font-display text-[20px] font-black">this week's rankings</h2>
              <span className="text-[11px] font-semibold text-muted-foreground">{d.tierLabel} league</span>
            </div>
            <ol className="space-y-1.5">
              {d.entries.map((e, i) => (
                <li
                  key={e.user_id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 p-3 transition",
                    e.isMe
                      ? "border-foreground bg-card shadow-[var(--shadow-soft)]"
                      : "border-border bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[13px] font-black tabular-nums",
                      i === 0 ? "bg-[oklch(0.95_0.13_85)] text-[oklch(0.35_0.15_70)]" :
                      i === 1 ? "bg-[oklch(0.93_0.02_240)] text-foreground/80" :
                      i === 2 ? "bg-[oklch(0.92_0.08_50)] text-[oklch(0.4_0.16_50)]" :
                      "bg-foreground/8 text-foreground/70",
                    )}
                  >
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-bold">
                    {e.isMe ? "you 💛" : e.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-foreground/8 px-2.5 py-1 text-[12px] font-bold tabular-nums">
                    {e.weekXp} XP
                  </span>
                </li>
              ))}
            </ol>
            {d.entries.length === 1 && (
              <p className="mt-4 rounded-2xl border border-dashed border-border bg-foreground/[0.03] p-4 text-center text-[12.5px] text-muted-foreground">
                you're the only one in your league this week. log a quest to claim the throne 👑
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
