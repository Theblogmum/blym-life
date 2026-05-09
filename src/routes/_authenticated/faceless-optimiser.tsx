import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Sparkles, Lock, Copy } from "lucide-react";
import { toast } from "sonner";
import { optimiseFaceless } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/faceless-optimiser")({
  component: Page,
});

function Page() {
  const fn = useServerFn(optimiseFaceless);
  const fetchUsage = useServerFn(getUsageToday);
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { topic, current_format: format || undefined } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const locked = !premium && !inTrial;
  const ready = topic.trim().length > 2;
  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied!"); };

  return (
    <div>
      <PageHero icon={Eye} eyebrow="Faceless content" title="Show up — without showing your face." description="Get formats, voiceover scripts, visuals and overlays for faceless short-form."  variant="bloom">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="rounded-3xl p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="t">Topic</Label>
            <Input id="t" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. weaning meals, postpartum recovery" className="rounded-xl bg-secondary/40" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f">Current format (optional)</Label>
            <Input id="f" value={format} onChange={(e) => setFormat(e.target.value)} placeholder="e.g. text-on-photo, screen recording" className="rounded-xl bg-secondary/40" />
          </div>
          <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto" disabled={!ready || m.isPending || locked} onClick={() => m.mutate()}>
            <Sparkles className="mr-2 h-4 w-4" /> {m.isPending ? "Planning…" : "Plan my faceless video"}
          </Button>
          {locked && (
            <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
              <p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended — Premium tool.</p>
              <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
            </div>
          )}
        </Card>
      </section>
      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Format ideas</h3>
            <ul className="space-y-2 text-sm">{m.data.formats.map((x, i) => <li key={i} className="rounded-2xl bg-secondary/40 p-3">{x}</li>)}</ul></Card>
          {m.data.voiceover_scripts.map((v, i) => (
            <Card key={i} className="rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{v.style}</span>
                <button onClick={() => copy(v.script)} className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><Copy className="h-4 w-4" /></button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{v.script}</p>
            </Card>
          ))}
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Visual options</h3>
            <ul className="space-y-2 text-sm">{m.data.visual_options.map((x, i) => <li key={i} className="rounded-2xl bg-secondary/40 p-3">{x}</li>)}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Hook overlays</h3>
            <ul className="space-y-2 text-sm">{m.data.hook_overlays.map((x, i) => (
              <li key={i} className="flex items-center justify-between rounded-2xl bg-secondary/40 p-3"><span>{x}</span>
                <button onClick={() => copy(x)} className="grid h-7 w-7 place-items-center rounded-full bg-background"><Copy className="h-3.5 w-3.5" /></button></li>))}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Retention tactics</h3>
            <ul className="space-y-2 text-sm">{m.data.retention_tactics.map((x, i) => <li key={i} className="rounded-2xl bg-secondary/40 p-3">{x}</li>)}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Tools</h3>
            <div className="flex flex-wrap gap-1.5">{m.data.tools.map((x, i) => <span key={i} className="rounded-full bg-secondary/60 px-3 py-1.5 text-sm font-semibold">{x}</span>)}</div></Card>
        </section>
      )}
    </div>
  );
}