import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getXp, claimDailyXp } from "@/lib/xp.functions";
import { Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function XpBadge({ compact = false }: { compact?: boolean }) {
  const fetchXp = useServerFn(getXp);
  const claim = useServerFn(claimDailyXp);
  const qc = useQueryClient();
  const xp = useQuery({ queryKey: ["xp"], queryFn: () => fetchXp() });
  const claimMut = useMutation({
    mutationFn: () => claim({}),
    onSuccess: (r) => {
      if (r.awarded) toast.success("+5 XP daily check-in 🌱");
      qc.invalidateQueries({ queryKey: ["xp"] });
    },
  });

  useEffect(() => {
    if (xp.data && !xp.data.awardedToday) claimMut.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xp.data?.awardedToday]);

  const d = xp.data;
  if (!d) {
    return <div className="h-9 w-24 animate-pulse rounded-full bg-secondary" />;
  }
  const into = d.xp - d.prevLevelXp;
  const span = Math.max(1, d.nextLevelXp - d.prevLevelXp);
  const pct = Math.min(100, Math.round((into / span) * 100));

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Lv {d.level}
        <span className="text-muted-foreground">· {d.xp} XP</span>
        {d.streak > 0 && (
          <span className="flex items-center gap-1 text-orange-500"><Flame className="h-3.5 w-3.5" />{d.streak}</span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your level</p>
          <p className="mt-1 font-display text-2xl font-black">Lv {d.level} · {d.levelTitle}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-500">
          <Flame className="h-4 w-4" /> {d.streak}-day streak
        </div>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-[image:var(--gradient-bloom)] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{d.xp} XP</span>
        <span>{d.nextLevelXp} XP → Lv {d.level + 1}</span>
      </div>
      {d.recent.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {d.recent.slice(0, 6).map((r, i) => (
            <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
              +{r.amount} {r.reason.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
