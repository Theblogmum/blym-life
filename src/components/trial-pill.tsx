import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { getTrialState, startTrial } from "@/lib/trial.functions";
import { useSubscription } from "@/hooks/use-subscription";

function formatLeft(ms: number) {
  if (ms <= 0) return "0h 0m";
  const totalMins = Math.floor(ms / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h ${m}m`;
}

export function TrialPill() {
  const fetchState = useServerFn(getTrialState);
  const claimTrial = useServerFn(startTrial);
  const qc = useQueryClient();
  const { isActive: hasPaid } = useSubscription();

  const state = useQuery({
    queryKey: ["trial-state"],
    queryFn: () => fetchState(),
    staleTime: 30_000,
  });

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!state.data?.active) return;
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, [state.data?.active]);

  const msLeft = useMemo(() => {
    const ends = state.data?.endsAt ? new Date(state.data.endsAt).getTime() : 0;
    return Math.max(0, ends - now);
  }, [state.data?.endsAt, now]);

  const [loading, setLoading] = useState(false);

  if (hasPaid) return null;
  if (state.isLoading || !state.data) return null;
  if (state.data.claimed && !state.data.active) return null;

  if (state.data.active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11.5px] font-semibold text-primary ring-1 ring-primary/20">
        <Clock className="h-3 w-3" /> Trial · {formatLeft(msLeft)} left
      </span>
    );
  }

  const handleStart = async () => {
    setLoading(true);
    try {
      await claimTrial();
      toast.success("Your 48-hour free trial is on — every feature unlocked. Enjoy 💛");
      await qc.invalidateQueries({ queryKey: ["trial-state"] });
      await qc.invalidateQueries({ queryKey: ["me"] });
      await qc.invalidateQueries({ queryKey: ["usage"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't start your free trial.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[11.5px] font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:bg-primary/90 disabled:opacity-60"
    >
      <Sparkles className="h-3 w-3" /> {loading ? "Starting…" : "Start 48h free trial"}
    </button>
  );
}