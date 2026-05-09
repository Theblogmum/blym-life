import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function TrialBanner() {
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

  // Active trial → show countdown
  if (state.data.active) {
    return (
      <div className="rounded-3xl border border-primary/30 bg-[image:var(--gradient-warm)] p-[2px]">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[calc(theme(borderRadius.3xl)-2px)] bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Free trial active</p>
              <p className="text-sm font-semibold text-foreground">
                Every feature unlocked — <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatLeft(msLeft)} left</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Already used trial → small notice (optional)
  if (state.data.claimed) {
    return (
      <div className="rounded-3xl border border-border bg-card px-5 py-3 text-sm text-muted-foreground">
        Your free 48-hour trial has ended. You're on the Free plan — upgrade any time to unlock everything again.
      </div>
    );
  }

  // No trial yet → CTA
  return (
    <div className="rounded-3xl border-0 bg-[image:var(--gradient-warm)] p-[2px]">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[calc(theme(borderRadius.3xl)-2px)] bg-card px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Try everything free</p>
            <p className="text-sm font-semibold text-foreground">
              Unlock every tool for 48 hours — no card, one trial per person.
            </p>
          </div>
        </div>
        <Button className="rounded-full" disabled={loading} onClick={handleStart}>
          {loading ? "Starting…" : "Start 48-hour free trial"}
        </Button>
      </div>
    </div>
  );
}