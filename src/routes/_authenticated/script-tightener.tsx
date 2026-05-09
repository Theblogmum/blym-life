import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Scissors, Sparkles, Lock, Copy } from "lucide-react";
import { toast } from "sonner";
import { tightenScript } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/script-tightener")({ component: Page });

function Page() {
  const fn = useServerFn(tightenScript);
  const fetchUsage = useServerFn(getUsageToday);
  const [script, setScript] = useState("");
  const [target, setTarget] = useState(30);
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({ mutationFn: () => fn({ data: { script, target_seconds: target } }), onError: (e: Error) => toast.error(e.message || "Failed") });
  const premium = !!usage.data?.premium; const inTrial = !!usage.data?.inTrial; const locked = !premium && !inTrial;
  const ready = script.trim().length > 20;
  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied!"); };
  return (
    <div>
      <PageHero icon={Scissors} eyebrow="Script tightener" title="Cut the fluff. Keep the punch." description="Paste a draft script, set a target length, get a tighter version with the cuts shown."  variant="warm">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="rounded-3xl p-6 space-y-4">
          <div className="space-y-1.5"><Label>Your script</Label>
            <Textarea rows={8} value={script} onChange={(e) => setScript(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="Paste your draft (voice-over, on-screen text, anything)" /></div>
          <div className="space-y-1.5"><Label>Target length (seconds)</Label>
            <Input type="number" value={target} onChange={(e) => setTarget(parseInt(e.target.value || "30"))} className="rounded-xl bg-secondary/40 max-w-[140px]" min={10} max={180} /></div>
          <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto" disabled={!ready || m.isPending || locked} onClick={() => m.mutate()}>
            <Sparkles className="mr-2 h-4 w-4" /> {m.isPending ? "Tightening…" : "Tighten my script"}</Button>
          {locked && (<div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm"><p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended</p><Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link></div>)}
        </Card>
      </section>
      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <Stat label="Original" value={`${m.data.original_word_count}w`} />
              <Stat label="Tightened" value={`${m.data.tightened_word_count}w`} />
              <Stat label="Length" value={`${m.data.tightened_seconds}s`} />
              <Stat label="Hook" value={`${m.data.hook_score}/10`} />
            </div>
          </Card>
          <Card className="rounded-3xl p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-display text-lg font-black">Tightened script</h3>
            <button onClick={() => copy(m.data!.tightened_script)} className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><Copy className="h-4 w-4" /></button></div>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed">{m.data.tightened_script}</p></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Issues spotted</h3>
            <ul className="space-y-2 text-sm">{m.data.issues.map((x, i) => <li key={i} className="rounded-2xl bg-secondary/40 p-3">{x}</li>)}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Cuts made</h3>
            <ul className="space-y-2 text-sm">{m.data.cuts.map((x, i) => <li key={i} className="rounded-2xl bg-rose-50 text-rose-900 p-3 line-through">{x}</li>)}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Alternative hooks</h3>
            <ul className="space-y-2 text-sm">{m.data.hook_alternatives.map((x, i) => <li key={i} className="flex items-center justify-between rounded-2xl bg-secondary/40 p-3"><span>{x}</span><button onClick={() => copy(x)} className="grid h-7 w-7 place-items-center rounded-full bg-background"><Copy className="h-3.5 w-3.5" /></button></li>)}</ul></Card>
          <Card className="rounded-3xl p-5"><h3 className="font-display text-lg font-black mb-3">Alternative endings</h3>
            <ul className="space-y-2 text-sm">{m.data.ending_alternatives.map((x, i) => <li key={i} className="flex items-center justify-between rounded-2xl bg-secondary/40 p-3"><span>{x}</span><button onClick={() => copy(x)} className="grid h-7 w-7 place-items-center rounded-full bg-background"><Copy className="h-3.5 w-3.5" /></button></li>)}</ul></Card>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (<div className="rounded-2xl bg-secondary/40 p-3"><div className="text-xl font-black">{value}</div><div className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">{label}</div></div>);
}