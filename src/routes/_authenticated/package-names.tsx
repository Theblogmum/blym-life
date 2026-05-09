import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { generatePackageNames } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/package-names")({ component: Page });

function Page() {
  const fn = useServerFn(generatePackageNames);
  const fetchUsage = useServerFn(getUsageToday);
  const [serviceType, setServiceType] = useState("");
  const [vibe, setVibe] = useState("");
  const [theme, setTheme] = useState("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({ mutationFn: () => fn({ data: { service_type: serviceType, vibe, theme: theme || undefined } }), onError: (e: Error) => toast.error(e.message || "Failed") });
  const premium = !!usage.data?.premium; const inTrial = !!usage.data?.inTrial; const locked = !premium && !inTrial;
  const ready = serviceType.trim().length > 2 && vibe.trim().length > 2;
  return (
    <div>
      <PageHero icon={Tag} eyebrow="Offers" title="Name your packages." description="Premium-feeling package names with taglines, in 5 themed sets." variant="bloom">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <Card className="rounded-3xl p-6 grid gap-4">
          <div className="space-y-1.5"><Label>Service type</Label><Input value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. UGC packages, social management, brand photography" /></div>
          <div className="space-y-1.5"><Label>Vibe</Label><Input value={vibe} onChange={(e) => setVibe(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. warm, premium, playful" /></div>
          <div className="space-y-1.5"><Label>Theme hint (optional)</Label><Input value={theme} onChange={(e) => setTheme(e.target.value)} className="rounded-xl bg-secondary/40" placeholder="e.g. garden, bakery, coastal" /></div>
          <Button size="lg" className="h-12 w-full rounded-2xl text-base font-bold sm:w-auto" disabled={!ready || m.isPending || locked} onClick={() => m.mutate()}>
            <Sparkles className="mr-2 h-4 w-4" /> {m.isPending ? "Naming…" : "Generate names"}</Button>
          {locked && (<div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm"><p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended</p><Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link></div>)}
        </Card>
      </section>
      {m.data && (
        <section className="mx-auto max-w-3xl space-y-4 px-5 pb-12">
          {m.data.sets.map((s, i) => (
            <Card key={i} className="rounded-3xl p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{s.theme}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">{s.tiers.map((t, j) => (<div key={j} className="rounded-2xl bg-secondary/50 p-3"><p className="font-display text-lg font-black">{t.name}</p><p className="text-xs text-muted-foreground">{t.tagline}</p></div>))}</div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}