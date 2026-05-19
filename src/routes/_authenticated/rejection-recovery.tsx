import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HeartHandshake, Sparkles, Lock, Copy, RefreshCw, ListChecks, Mail, Lightbulb, Sprout } from "lucide-react";
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
      <PageHero icon={HeartHandshake} eyebrow="Rejection recovery" title="Tell me what happened — I've got you." description="Paste the brand no, the ghosting, the harsh comment, the flop. I'll meet you with a kind reframe, a reply you could send, and 3 tiny next steps 💛" variant="bloom">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <div className="premium-card grid gap-4 p-6 sm:p-7">
          <div className="space-y-1.5">
            <Label htmlFor="sit" className="text-[13px] font-semibold text-foreground/80">What happened? Take your time.</Label>
            <Textarea id="sit" rows={6} value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="e.g. Pitched a brand for £1500, they came back with £200 + 3 deliverables. It stung." />
          </div>
          <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto" disabled={!ready || m.isPending || locked} onClick={() => m.mutate()}>
            <Sparkles className={`mr-2 h-4 w-4 ${m.isPending ? "breathe" : ""}`} /> {m.isPending ? "Bloom is sitting with this…" : "Help me bounce back ✨"}
          </Button>
          {locked && (
            <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
              <p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended</p>
              <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
            </div>
          )}
        </div>
      </section>
      {m.data && (
        <section className="stagger mx-auto max-w-3xl space-y-4 px-5 pb-14">
          <div className="card-pop relative overflow-hidden rounded-3xl border-0 bg-[image:var(--gradient-warm)] p-7 text-white shadow-[var(--shadow-elegant)]" style={{ ["--i" as string]: 0 }}>
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/25 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-white/15 blur-3xl" />
            <p className="relative text-[10px] font-bold uppercase tracking-widest text-white/85">A breath, first</p>
            <p className="relative mt-2 font-display text-2xl font-black leading-[1.15] sm:text-3xl">{m.data.affirmation}</p>
          </div>
          <div className="card-pop bloom-bubble p-6" style={{ ["--i" as string]: 1 }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Bloom's reframe</p>
            <p className="mt-2 text-base leading-relaxed text-foreground/90">{m.data.reframe}</p>
          </div>
          <div className="card-pop premium-card p-6" style={{ ["--i" as string]: 2 }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">A little pep talk</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{m.data.pep_talk}</p>
          </div>
          <div className="card-pop premium-card p-6" style={{ ["--i" as string]: 3 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><h3 className="font-display text-lg font-black">A reply you could send</h3></div>
              <button onClick={() => { navigator.clipboard.writeText(m.data!.reply_draft); toast.success("Copied — send it when you're ready 💛"); }} className="grid h-9 w-9 place-items-center rounded-full bg-secondary transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-primary-foreground active:scale-95"><Copy className="h-4 w-4" /></button>
            </div>
            <p className="mt-3 whitespace-pre-line rounded-2xl bg-secondary/40 p-4 text-sm leading-relaxed">{m.data.reply_draft}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-pop premium-card p-6" style={{ ["--i" as string]: 4 }}>
              <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /><h3 className="font-display text-base font-black">What this taught you</h3></div>
              <ul className="mt-3 space-y-2 text-sm">{m.data.lessons.map((l, i) => <li key={i} className="rounded-xl bg-secondary/50 p-3 leading-relaxed">{l}</li>)}</ul>
            </div>
            <div className="card-pop premium-card p-6" style={{ ["--i" as string]: 5 }}>
              <div className="flex items-center gap-2"><Sprout className="h-4 w-4 text-primary" /><h3 className="font-display text-base font-black">Tiny next steps</h3></div>
              <ol className="mt-3 space-y-2 text-sm">
                {m.data.next_steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl bg-secondary/50 p-3 leading-relaxed">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-[12px] italic text-muted-foreground">You showed up. That already counts. 💛</p>
            <Button variant="outline" className="rounded-full" onClick={() => m.mutate()}><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Try a softer angle</Button>
          </div>
        </section>
      )}
    </div>
  );
}