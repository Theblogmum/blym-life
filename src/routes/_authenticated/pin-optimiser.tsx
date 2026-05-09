import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pin, Sparkles, Lock, Copy } from "lucide-react";
import { toast } from "sonner";
import { optimisePin } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/pin-optimiser")({ component: Page });

function Page() {
  const fn = useServerFn(optimisePin);
  const fetchUsage = useServerFn(getUsageToday);
  const [topic, setTopic] = useState("");
  const [t, setT] = useState("");
  const [d, setD] = useState("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { topic, current_title: t || undefined, current_description: d || undefined } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const locked = !premium && !inTrial;
  const ready = topic.trim().length > 2;
  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied!"); };
  return (
    <div>
      <PageHero icon={Pin} eyebrow="Pinterest" title="Pins that get saved (and clicked)." description="Get titles, descriptions, board ideas, keywords and an image brief for one pin." variant="sunrise">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="rounded-3xl p-6 space-y-4">
          <div className="space-y-1.5"><Label>Topic / what your pin is about</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. easy 15-min toddler dinners" className="rounded-xl bg-secondary/40" /></div>
          <div className="space-y-1.5"><Label>Current title (optional)</Label>
            <Input value={t} onChange={(e) => setT(e.target.value)} className="rounded-xl bg-secondary/40" /></div>
          <div className="space-y-1.5"><Label>Current description (optional)</Label>
            <Textarea rows={3} value={d} onChange={(e) => setD(e.target.value)} className="rounded-xl bg-secondary/40" /></div>
          <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto" disabled={!ready || m.isPending || locked} onClick={() => m.mutate()}>
            <Sparkles className="mr-2 h-4 w-4" /> {m.isPending ? "Optimising…" : "Optimise this pin"}</Button>
          {locked && (<div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm"><p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended</p><Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link></div>)}
        </Card>
      </section>
      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Titles (5)</h3>
            <ul className="space-y-2 text-sm">{m.data.titles.map((x, i) => (<li key={i} className="flex items-center justify-between rounded-2xl bg-secondary/40 p-3"><span className="flex-1 pr-3">{x} <span className="text-xs text-foreground/50">· {x.length}ch</span></span><button onClick={() => copy(x)} className="grid h-7 w-7 place-items-center rounded-full bg-background"><Copy className="h-3.5 w-3.5" /></button></li>))}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Descriptions (3)</h3>
            <div className="space-y-3">{m.data.descriptions.map((x, i) => (<div key={i} className="rounded-2xl bg-secondary/40 p-3"><p className="text-sm whitespace-pre-wrap">{x}</p><button onClick={() => copy(x)} className="mt-2 text-xs font-semibold text-primary">Copy</button></div>))}</div></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Board names</h3>
            <div className="flex flex-wrap gap-1.5">{m.data.board_suggestions.map((x, i) => <span key={i} className="rounded-full bg-secondary/60 px-3 py-1.5 text-sm font-semibold">{x}</span>)}</div></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Keywords</h3>
            <div className="flex flex-wrap gap-1.5">{m.data.keywords.map((x, i) => <span key={i} className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">{x}</span>)}</div></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Hashtags</h3>
            <div className="flex flex-wrap gap-1.5">{m.data.hashtags.map((x, i) => <span key={i} className="rounded-full bg-secondary/60 px-3 py-1.5 text-xs font-semibold">{x}</span>)}</div></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-2">Pin image brief</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.data.pin_image_brief}</p></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Text overlays</h3>
            <ul className="space-y-2 text-sm">{m.data.text_overlay.map((x, i) => <li key={i} className="rounded-2xl bg-secondary/40 p-3">{x}</li>)}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-2">CTA</h3><p className="text-sm">{m.data.cta}</p></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-2">Seasonality</h3><p className="text-sm">{m.data.seasonality}</p></Card>
        </section>
      )}
    </div>
  );
}