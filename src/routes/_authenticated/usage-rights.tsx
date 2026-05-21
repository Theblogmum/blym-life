import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calculator, Sparkles, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { calculateUsageRights } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/usage-rights")({ component: Page });

function Page() {
  const fn = useServerFn(calculateUsageRights);
  const fetchUsage = useServerFn(getUsageToday);
  const [base, setBase] = useState(500);
  const [channels, setChannels] = useState("Brand's own social handles");
  const [duration, setDuration] = useState(3);
  const [territory, setTerritory] = useState("UK only");
  const [excl, setExcl] = useState("None");
  const [white, setWhite] = useState(false);
  const [ads, setAds] = useState(false);
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({ mutationFn: () => fn({ data: { base_fee: base, channels, duration_months: duration, territory, exclusivity: excl, whitelisting: white, paid_ads: ads } }), onError: (e: Error) => toast.error(e.message || "Failed") });
  const premium = !!usage.data?.premium; const inTrial = !!usage.data?.inTrial; const locked = !premium && !inTrial;
  return (
    <div>
      <PageHero icon={Calculator} eyebrow="Pricing" title="Get paid fairly for usage rights." description="Calculator + breakdown + a negotiation script you can paste straight into email." variant="warm">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card glow className="rounded-3xl p-6 grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Base content fee (£)</Label><Input type="number" value={base} onChange={(e) => setBase(parseInt(e.target.value || "0"))} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Duration (months)</Label><Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value || "1"))} className="rounded-xl bg-secondary/40" /></div>
          </div>
          <div className="space-y-1.5"><Label>Channels</Label><Input value={channels} onChange={(e) => setChannels(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. brand IG + paid Meta ads" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Territory</Label><Input value={territory} onChange={(e) => setTerritory(e.target.value)} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Exclusivity</Label><Input value={excl} onChange={(e) => setExcl(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. category, 30 days" /></div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm"><Switch checked={white} onCheckedChange={setWhite} /> Whitelisting / dark posts</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={ads} onCheckedChange={setAds} /> Paid social ads</label>
          </div>
          <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto" disabled={base < 1 || m.isPending || locked} onClick={() => m.mutate()}>
            <Sparkles className="mr-2 h-4 w-4" /> {m.isPending ? "Calculating…" : "Calculate"}</Button>
          {locked && (<div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm"><p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended</p><Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link></div>)}
        </Card>
      </section>
      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl p-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-secondary/40 p-3"><div className="text-3xl font-black">{m.data.multiplier}×</div><div className="text-[10px] font-bold uppercase tracking-wider">Multiplier</div></div>
              <div className="rounded-2xl bg-secondary/40 p-3"><div className="text-2xl font-black">£{m.data.suggested_uplift_gbp}</div><div className="text-[10px] font-bold uppercase tracking-wider">Uplift</div></div>
              <div className="rounded-2xl bg-primary/10 p-3"><div className="text-2xl font-black text-primary">£{m.data.suggested_total_gbp}</div><div className="text-[10px] font-bold uppercase tracking-wider">Total</div></div>
            </div>
          </Card>
          <Card glow className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Breakdown</h3>
            <ul className="space-y-2 text-sm">{m.data.breakdown.map((b, i) => (<li key={i} className="rounded-2xl bg-secondary/40 p-3"><div className="flex justify-between font-semibold"><span>{b.factor}</span><span>{b.multiplier}×</span></div><p className="text-xs text-foreground/70 mt-1">{b.impact}</p></li>))}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-2">Negotiation script</h3>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.data.negotiation_script}</p></Card>
          {m.data.red_flags.length > 0 && (
            <Card glow className="rounded-3xl p-5 bg-amber-50"><h3 className="font-display text-lg font-black mb-3 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-700" /> Red flags</h3>
              <ul className="space-y-2 text-sm">{m.data.red_flags.map((x, i) => <li key={i} className="rounded-2xl bg-amber-100 text-amber-900 p-3">{x}</li>)}</ul></Card>)}
        </section>
      )}
    </div>
  );
}