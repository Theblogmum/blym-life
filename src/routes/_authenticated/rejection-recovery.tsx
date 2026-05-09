import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HeartHandshake, Sparkles, Lock, Copy, RefreshCw, ListChecks, Mail, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { recoverRejection } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/rejection-recovery")({ component: Page });

function Page() {
  const fn = useServerFn(recoverRejection);
  const fetchUsage = useServerFn(getUsageToday);
  const [situation, setSituation] = useState("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({ mutationFn: () => fn({ data: { situation } }), onError: (e: Error) => toast.error(e.message || "Failed") });
  const premium = !!usage.data?.premium; const inTrial = !!usage.data?.inTrial; const locked = !premium && !inTrial;
  const ready = situation.trim().length > 10;
  return (
    <div>
      <PageHero icon={HeartHandshake} eyebrow="Rejection recovery" title="A no isn't the end. Let's land it softly." description="Paste the brand no, the ghosting, the harsh comment, the flop. Get a kind reframe, a reply you can send, and 3 tiny next steps." variant="bloom">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <Card className="rounded-3xl p-6 grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="sit">What happened?</Label>
            <Textarea id="sit" rows={6} value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="e.g. Pitched a brand for £1500, they came back with £200 + 3 deliverables..." className="rounded-xl bg-secondary/40" />
          </div>
          <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto" disabled={!ready || m.isPending || locked} onClick={() => m.mutate()}>
            <Sparkles className="mr-2 h-4 w-4" /> {m.isPending ? "On it…" : "Help me bounce back"}
          </Button>
          {locked && (
            <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
              <p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended</p>
              <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
            </div>
          )}
        </Card>
      </section>
      {m.data && (
        <section className="mx-auto max-w-3xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl border-0 bg-[image:var(--gradient-warm)] p-6 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Affirmation</p>
            <p className="mt-2 font-display text-2xl font-black leading-tight">{m.data.affirmation}</p>
          </Card>
          <Card className="rounded-3xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reframe</p>
            <p className="mt-2 text-base leading-relaxed">{m.data.reframe}</p>
          </Card>
          <Card className="rounded-3xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pep talk</p>
            <p className="mt-2 text-sm leading-relaxed">{m.data.pep_talk}</p>
          </Card>
          <Card className="rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><h3 className="font-display text-lg font-black">Reply you could send</h3></div>
              <button onClick={() => { navigator.clipboard.writeText(m.data!.reply_draft); toast.success("Copied"); }} className="grid h-8 w-8 place-items-center rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground"><Copy className="h-4 w-4" /></button>
            </div>
            <p className="mt-3 whitespace-pre-line rounded-2xl bg-secondary/40 p-4 text-sm">{m.data.reply_draft}</p>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-3xl p-5">
              <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /><h3 className="font-display text-base font-black">Lessons</h3></div>
              <ul className="mt-3 space-y-2 text-sm">{m.data.lessons.map((l, i) => <li key={i} className="rounded-xl bg-secondary/40 p-3">{l}</li>)}</ul>
            </Card>
            <Card className="rounded-3xl p-5">
              <div className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary" /><h3 className="font-display text-base font-black">Next steps</h3></div>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">{m.data.next_steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </Card>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => m.mutate()}><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Try again</Button>
        </section>
      )}
    </div>
  );
}