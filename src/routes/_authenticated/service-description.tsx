import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollText, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { generateServiceDescription } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/service-description")({ component: Page });

function Page() {
  const fn = useServerFn(generateServiceDescription);
  const fetchUsage = useServerFn(getUsageToday);
  const [name, setName] = useState("");
  const [includes, setIncludes] = useState("");
  const [client, setClient] = useState("");
  const [price, setPrice] = useState("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({ mutationFn: () => fn({ data: { service_name: name, what_it_includes: includes, ideal_client: client, price: price || undefined } }), onError: (e: Error) => toast.error(e.message || "Failed") });
  const premium = !!usage.data?.premium; const inTrial = !!usage.data?.inTrial; const locked = !premium && !inTrial;
  const ready = name.trim().length > 1 && includes.trim().length > 4 && client.trim().length > 2;
  return (
    <div>
      <PageHero icon={ScrollText} eyebrow="Offers" title="Service descriptions, sorted." description="One-liner, short, long, bullets, who-it's-for, and the FAQs buyers actually ask." variant="warm">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <Card className="rounded-3xl p-6 grid gap-4">
          <div className="space-y-1.5"><Label>Service name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. Reel-a-month membership" /></div>
          <div className="space-y-1.5"><Label>What's included</Label><Textarea rows={3} value={includes} onChange={(e) => setIncludes(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. 4 short-form reels per month, raw footage, 1 revision" /></div>
          <div className="space-y-1.5"><Label>Ideal client</Label><Input value={client} onChange={(e) => setClient(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. Small UK family brand launching new products" /></div>
          <div className="space-y-1.5"><Label>Price (optional)</Label><Input value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. £600/month" /></div>
          <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto" disabled={!ready || m.isPending || locked} onClick={() => m.mutate()}>
            <Sparkles className="mr-2 h-4 w-4" /> {m.isPending ? "Writing…" : "Write descriptions"}</Button>
          {locked && (<div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm"><p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended</p><Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link></div>)}
        </Card>
      </section>
      {m.data && (
        <section className="mx-auto max-w-3xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">One-liner</p><p className="mt-1 font-display text-xl font-black">{m.data.one_liner}</p></Card>
          <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Short</p><p className="mt-2 text-sm leading-relaxed">{m.data.short}</p></Card>
          <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Long</p><p className="mt-2 text-sm leading-relaxed">{m.data.long}</p></Card>
          <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bullets</p>
            <ul className="mt-3 space-y-2 text-sm">{m.data.bullets.map((b, i) => <li key={i} className="rounded-2xl bg-secondary/40 p-3">{b}</li>)}</ul></Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Who it's for</p>
              <ul className="mt-3 space-y-2 text-sm">{m.data.who_its_for.map((b, i) => <li key={i} className="rounded-2xl bg-emerald-50 text-emerald-900 p-3">{b}</li>)}</ul></Card>
            <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Not for</p>
              <ul className="mt-3 space-y-2 text-sm">{m.data.who_its_not_for.map((b, i) => <li key={i} className="rounded-2xl bg-rose-50 text-rose-900 p-3">{b}</li>)}</ul></Card>
          </div>
          <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">FAQ</p>
            <div className="mt-3 space-y-3 text-sm">{m.data.faq.map((f, i) => (<div key={i} className="rounded-2xl bg-secondary/40 p-3"><p className="font-bold">{f.q}</p><p className="mt-1 text-muted-foreground">{f.a}</p></div>))}</div></Card>
        </section>
      )}
    </div>
  );
}