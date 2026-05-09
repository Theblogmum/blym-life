import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { generatePassiveIdeas } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/passive-ideas")({ component: Page });

const TONE: Record<string, string> = { low: "bg-emerald-100 text-emerald-900", medium: "bg-amber-100 text-amber-900", high: "bg-rose-100 text-rose-900" };

function Page() {
  const fn = useServerFn(generatePassiveIdeas);
  const fetchUsage = useServerFn(getUsageToday);
  const [audience, setAudience] = useState("");
  const [skills, setSkills] = useState("");
  const [price, setPrice] = useState("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({ mutationFn: () => fn({ data: { audience, existing_skills: skills, price_range: price || undefined } }), onError: (e: Error) => toast.error(e.message || "Failed") });
  const premium = !!usage.data?.premium; const inTrial = !!usage.data?.inTrial; const locked = !premium && !inTrial;
  const ready = audience.trim().length > 4 && skills.trim().length > 4;
  return (
    <div>
      <PageHero icon={Lightbulb} eyebrow="Passive income" title="Digital products, while you sleep." description="8–10 product ideas with format, buyer, price, effort and a first-post hook." variant="mint">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <Card className="rounded-3xl p-6 grid gap-4">
          <div className="space-y-1.5"><Label>Audience</Label><Textarea rows={2} value={audience} onChange={(e) => setAudience(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. UK first-time mums in maternity leave" /></div>
          <div className="space-y-1.5"><Label>Existing skills</Label><Textarea rows={2} value={skills} onChange={(e) => setSkills(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. weaning, batch cooking, video editing" /></div>
          <div className="space-y-1.5"><Label>Price range (optional)</Label><Input value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. £9–£49" /></div>
          <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto" disabled={!ready || m.isPending || locked} onClick={() => m.mutate()}>
            <Sparkles className="mr-2 h-4 w-4" /> {m.isPending ? "Brainstorming…" : "Generate ideas"}</Button>
          {locked && (<div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm"><p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended</p><Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link></div>)}
        </Card>
      </section>
      {m.data && (
        <section className="mx-auto max-w-3xl space-y-4 px-5 pb-12">
          <div className="grid gap-3 sm:grid-cols-2">
            {m.data.ideas.map((i, idx) => (
              <Card key={idx} className="rounded-3xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">{i.format}</p>
                <p className="mt-1 font-display text-lg font-black">{i.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{i.what_it_is}</p>
                <p className="mt-2 text-xs"><strong>Buyer:</strong> {i.target_buyer}</p>
                <p className="text-xs"><strong>Price:</strong> {i.price_range}</p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                  <span className={`rounded-full px-2 py-0.5 ${TONE[i.effort] ?? "bg-secondary"}`}>Effort: {i.effort}</span>
                  <span className={`rounded-full px-2 py-0.5 ${TONE[i.profit_potential] ?? "bg-secondary"}`}>Profit: {i.profit_potential}</span>
                </div>
                <p className="mt-3 rounded-2xl bg-secondary/40 p-3 text-xs"><strong>First post:</strong> {i.first_post_idea}</p>
              </Card>
            ))}
          </div>
          <Card className="rounded-3xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your first 5 steps</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">{m.data.first_steps.map((s, i) => <li key={i}>{s}</li>)}</ol></Card>
        </section>
      )}
    </div>
  );
}