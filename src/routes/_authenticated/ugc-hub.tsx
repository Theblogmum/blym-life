import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, Copy, Check, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { generatePitch } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/ugc-hub")({
  component: UgcHub,
});

function UgcHub() {
  const fn = useServerFn(generatePitch);
  const fetchUsage = useServerFn(getUsageToday);
  const [brand, setBrand] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [followers, setFollowers] = useState<number | "">("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });

  const m = useMutation({
    mutationFn: () => fn({ data: { brand, deliverables, followers: followers === "" ? undefined : Number(followers) } }),
    onSuccess: () => usage.refetch(),
    onError: (e: any) => toast.error(e.message || "Failed"),
  });
  const used = usage.data?.usage?.ugc_pitch ?? 0;
  const limit = usage.data?.limit ?? null;
  const premium = !!usage.data?.premium;
  const outOfQuota = !premium && limit !== null && used >= limit;

  return (
    <div>
      <PageHero
        icon={Wallet}
        eyebrow="UGC Creator Hub"
        title="Pitch brands. Get paid your worth."
        description="Tell us the brand and the deliverables — we'll write the pitch email AND suggest a fair UK rate."
        variant="sunrise"
      >
        <UsageChip used={used} limit={limit} premium={premium} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-butter px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              The collab brief
            </p>
          </div>
          <div className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Brand name
                </Label>
                <Input
                  className="mt-1.5 h-11 rounded-2xl bg-secondary/40"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Aldi UK"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Deliverables
                </Label>
                <Textarea
                  rows={3}
                  className="mt-1.5 rounded-2xl bg-secondary/40"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  placeholder="e.g. 1 reel + 3 stories, posted within 7 days, full UK usage rights"
                />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Your followers
                </Label>
                <Input
                  type="number"
                  className="mt-1.5 h-11 rounded-2xl bg-secondary/40"
                  value={followers}
                  onChange={(e) =>
                    setFollowers(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="e.g. 5000"
                />
              </div>
            </div>
            <Button
              size="lg"
              className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
              disabled={!brand.trim() || !deliverables.trim() || m.isPending || outOfQuota}
              onClick={() => m.mutate()}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {m.isPending ? "Writing your pitch…" : "Generate pitch + price"}
            </Button>
            {outOfQuota && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  You've used your 3 free pitches today.
                </p>
                <Link to="/settings">
                  <Button size="sm" className="rounded-full">
                    Go unlimited
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {m.data && (
        <section className="mx-auto max-w-5xl px-5 pb-10">
          <PitchResult data={m.data} />
        </section>
      )}

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <h2 className="mb-4 font-display text-2xl font-black">Pricing yourself fairly</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <PricingCard tier="Nano" range="£50–£150" who="Under 5k followers" surface="surface-mint" />
          <PricingCard tier="Micro" range="£150–£500" who="5k–50k followers" surface="surface-peach" />
          <PricingCard tier="Mid" range="£500–£2k+" who="50k+ followers" surface="surface-plum" />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Rough UK ranges per deliverable. Always factor in usage rights, exclusivity, and turnaround.
        </p>
      </section>
    </div>
  );
}

function PitchResult({ data }: { data: { subject: string; body: string; suggested_price_gbp: number } }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <Card className="overflow-hidden rounded-3xl border-0 bg-[image:var(--gradient-warm)] p-[2px] shadow-[var(--shadow-glow)]">
        <div className="rounded-[calc(theme(borderRadius.3xl)-2px)] bg-card p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Suggested rate
          </p>
          <p className="mt-1 font-display text-6xl font-black text-gradient-warm">
            £{data.suggested_price_gbp}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Based on your deliverables, niche and follower count.
          </p>
        </div>
      </Card>
      <Card className="mt-4 rounded-3xl border-0 p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Pitch email
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${data.subject}\n\n${data.body}`);
              setCopied(true);
              toast.success("Pitch copied — go send it!");
              setTimeout(() => setCopied(false), 1500);
            }}
            className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy email"}
          </button>
        </div>
        <p className="mt-3 font-semibold">{data.subject}</p>
        <p className="mt-3 whitespace-pre-line rounded-2xl bg-secondary/40 p-4 text-sm leading-relaxed">
          {data.body}
        </p>
      </Card>
    </>
  );
}

function PricingCard({
  tier,
  range,
  who,
  surface,
}: {
  tier: string;
  range: string;
  who: string;
  surface: string;
}) {
  return (
    <Card className={cn("rounded-3xl border-0 p-5 text-center", surface)}>
      <p className="text-xs font-bold uppercase tracking-widest text-foreground/60">{tier}</p>
      <p className="mt-2 font-display text-3xl font-black">{range}</p>
      <p className="mt-1 text-sm text-foreground/70">{who}</p>
    </Card>
  );
}