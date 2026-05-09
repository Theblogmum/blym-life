import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { buildDeliverables } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/deliverables-builder")({ component: Page });

function Page() {
  const fn = useServerFn(buildDeliverables);
  const fetchUsage = useServerFn(getUsageToday);
  const [brand, setBrand] = useState("");
  const [budget, setBudget] = useState("");
  const [goal, setGoal] = useState("");
  const [platforms, setPlatforms] = useState("Instagram, TikTok");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({ mutationFn: () => fn({ data: { brand, budget: budget || undefined, campaign_goal: goal, platforms } }), onError: (e: Error) => toast.error(e.message || "Failed") });
  const premium = !!usage.data?.premium; const inTrial = !!usage.data?.inTrial; const locked = !premium && !inTrial;
  const ready = brand.trim().length > 1 && goal.trim().length > 4;
  return (
    <div>
      <PageHero icon={Package} eyebrow="Brand deals" title="3 packages, ready in seconds." description="Pitch tiered packages with deliverables, usage rights, exclusivity and add-ons." variant="bloom">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="rounded-3xl p-6 grid gap-4">
          <div className="space-y-1.5"><Label>Brand</Label><Input value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. Aldi" /></div>
          <div className="space-y-1.5"><Label>Their budget (optional)</Label><Input value={budget} onChange={(e) => setBudget(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. £1500" /></div>
          <div className="space-y-1.5"><Label>Campaign goal</Label><Textarea rows={3} value={goal} onChange={(e) => setGoal(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. Drive sales of new toddler snacks" /></div>
          <div className="space-y-1.5"><Label>Platforms</Label><Input value={platforms} onChange={(e) => setPlatforms(e.target.value)} className="rounded-xl bg-secondary/40" /></div>
          <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto" disabled={!ready || m.isPending || locked} onClick={() => m.mutate()}>
            <Sparkles className="mr-2 h-4 w-4" /> {m.isPending ? "Building…" : "Build 3 packages"}</Button>
          {locked && (<div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm"><p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended</p><Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link></div>)}
        </Card>
      </section>
      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl p-5"><p className="text-sm">{m.data.summary}</p></Card>
          <div className="grid gap-4 md:grid-cols-3">
            {m.data.packages.map((p, i) => (
              <Card key={i} className="rounded-3xl p-5">
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{p.tier}</span>
                <p className="mt-2 text-2xl font-black">{p.price_range}</p>
                <ul className="mt-3 space-y-1.5 text-sm">{p.deliverables.map((d, j) => <li key={j} className="rounded-xl bg-secondary/40 p-2">{d}</li>)}</ul>
                <div className="mt-3 text-xs text-foreground/70"><div><strong>Usage rights:</strong> {p.usage_rights}</div><div><strong>Exclusivity:</strong> {p.exclusivity}</div></div>
              </Card>))}
          </div>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Timeline</h3>
            <ul className="space-y-2 text-sm">{m.data.timeline.map((x, i) => <li key={i} className="rounded-2xl bg-secondary/40 p-3">{x}</li>)}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">NOT included</h3>
            <ul className="space-y-2 text-sm">{m.data.exclusions.map((x, i) => <li key={i} className="rounded-2xl bg-rose-50 text-rose-900 p-3">{x}</li>)}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Add-ons</h3>
            <ul className="space-y-2 text-sm">{m.data.add_ons.map((x, i) => <li key={i} className="rounded-2xl bg-secondary/40 p-3">{x}</li>)}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Contract clauses</h3>
            <ul className="space-y-2 text-sm">{m.data.contract_clauses.map((x, i) => <li key={i} className="rounded-2xl bg-secondary/40 p-3">{x}</li>)}</ul></Card>
        </section>
      )}
    </div>
  );
}