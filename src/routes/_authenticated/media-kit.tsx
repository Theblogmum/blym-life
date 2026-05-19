import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { generateMediaKit } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/media-kit")({ component: Page });

function Page() {
  const fn = useServerFn(generateMediaKit);
  const fetchUsage = useServerFn(getUsageToday);
  const [stats, setStats] = useState("");
  const [rates, setRates] = useState("");
  const [pastBrands, setPastBrands] = useState("");
  const [goal, setGoal] = useState("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({ mutationFn: () => fn({ data: { stats, rates, past_brands: pastBrands || undefined, goal } }), onError: (e: Error) => toast.error(e.message || "Failed") });
  const premium = !!usage.data?.premium; const inTrial = !!usage.data?.inTrial; const locked = !premium && !inTrial;
  const ready = stats.trim().length > 4 && rates.trim().length > 4 && goal.trim().length > 4;
  return (
    <div>
      <PageHero icon={FileText} eyebrow="Brand deals" title="Media kit, written for you." description="All the copy, structure and design brief for a one-pager that sells you." variant="sunrise">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <Card glow className="rounded-3xl p-6 grid gap-4">
          <div className="space-y-1.5"><Label>Goal of media kit</Label><Input value={goal} onChange={(e) => setGoal(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. Land paid Aldi-style brand deals" /></div>
          <div className="space-y-1.5"><Label>Stats</Label><Textarea rows={3} value={stats} onChange={(e) => setStats(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. IG 18k followers, 45k avg reel views, 6% engagement" /></div>
          <div className="space-y-1.5"><Label>Rates</Label><Textarea rows={3} value={rates} onChange={(e) => setRates(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. Reel £450, story set £200, UGC £350" /></div>
          <div className="space-y-1.5"><Label>Past brands (optional)</Label><Textarea rows={2} value={pastBrands} onChange={(e) => setPastBrands(e.target.value)} className="rounded-xl bg-secondary/40" /></div>
          <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto" disabled={!ready || m.isPending || locked} onClick={() => m.mutate()}>
            <Sparkles className="mr-2 h-4 w-4" /> {m.isPending ? "Writing…" : "Write my media kit"}</Button>
          {locked && (<div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm"><p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended</p><Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link></div>)}
        </Card>
      </section>
      {m.data && (
        <section className="mx-auto max-w-3xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tagline</p><p className="mt-1 font-display text-2xl font-black">{m.data.tagline}</p></Card>
          <Card glow className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About</p><p className="mt-2 text-sm leading-relaxed">{m.data.about}</p></Card>
          <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Audience</p><p className="mt-2 text-sm leading-relaxed">{m.data.audience_summary}</p></Card>
          <Card glow className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stats</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{m.data.stats_block.map((s, i) => <div key={i} className="rounded-2xl bg-secondary/50 p-3 text-sm font-semibold">{s}</div>)}</div></Card>
          <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Services</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">{m.data.services.map((s, i) => (<div key={i} className="rounded-2xl bg-secondary/40 p-3"><p className="text-sm font-bold">{s.name}</p><p className="text-xs text-muted-foreground">{s.description}</p><p className="mt-1 text-sm font-semibold text-primary">From {s.price_from}</p></div>))}</div></Card>
          <Card glow className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Testimonial prompts</p>
            <ul className="mt-3 space-y-2 text-sm">{m.data.testimonial_prompts.map((t, i) => <li key={i} className="rounded-2xl bg-secondary/40 p-3">{t}</li>)}</ul></Card>
          <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CTA</p><p className="mt-2 text-sm font-semibold">{m.data.cta}</p></Card>
          <Card glow className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Design brief</p><p className="mt-2 text-sm leading-relaxed">{m.data.design_brief}</p></Card>
        </section>
      )}
    </div>
  );
}