import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Target,
  Sparkles,
  Lock,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  PoundSterling,
} from "lucide-react";
import { toast } from "sonner";
import { auditNiche } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/niche-audit")({
  component: NicheAuditPage,
});

const FIT_TONE: Record<string, string> = {
  strong: "bg-primary text-primary-foreground",
  okay: "bg-amber-100 text-amber-900",
  weak: "bg-rose-100 text-rose-900",
};
const POT_TONE: Record<string, string> = {
  high: "bg-primary text-primary-foreground",
  medium: "bg-amber-100 text-amber-900",
  low: "bg-rose-100 text-rose-900",
};

function NicheAuditPage() {
  const fn = useServerFn(auditNiche);
  const fetchUsage = useServerFn(getUsageToday);
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () =>
      fn({ data: { bio, niche, target_audience: audience } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;
  const ready = bio.trim() && niche.trim() && audience.trim();

  return (
    <div>
      <PageHero
        icon={Target}
        eyebrow="Niche Audit"
        title="Is your niche actually working?"
        description="Paste in your bio, niche and who it's for. We'll tell you what's unclear, what content is missing, your monetisation potential, and how to position better."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              About you
            </p>
          </div>
          <div className="grid gap-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio (Instagram / TikTok)</Label>
              <Textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Paste your current bio exactly as it reads"
                maxLength={500}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="niche">Niche</Label>
              <Input
                id="niche"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. weaning + family-friendly meals"
                maxLength={120}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audience">Target audience</Label>
              <Textarea
                id="audience"
                rows={2}
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. UK mums of babies 6-18 months who feel overwhelmed about starting solids"
                maxLength={300}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div>
              <Button
                size="lg"
                className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
                disabled={!ready || m.isPending || locked}
                onClick={() => m.mutate()}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {m.isPending ? "Auditing your niche…" : "Run niche audit"}
              </Button>
            </div>
            {locked && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Trial ended. Niche Audit is a Premium tool.
                </p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">Verdict</p>
                </div>
                <p className="mt-2 text-base leading-relaxed">{m.data.headline_verdict}</p>
              </div>
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-secondary text-center">
                <div>
                  <div className="text-xl font-black tabular-nums">{m.data.clarity_score}</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">/10 clarity</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl p-5">
            <h3 className="font-display text-lg font-black">What's unclear</h3>
            <ul className="mt-3 space-y-2">
              {m.data.whats_unclear.map((s, i) => (
                <li key={i} className="flex gap-2 rounded-2xl bg-secondary/40 p-3 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-3xl p-5">
            <h3 className="font-display text-lg font-black">Missing content pillars</h3>
            <ul className="mt-3 space-y-3">
              {m.data.missing_content.map((p, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-4">
                  <p className="font-semibold">{p.pillar}</p>
                  <p className="mt-1 text-sm text-foreground/70">{p.why}</p>
                  <p className="mt-2 flex gap-2 rounded-xl surface-mint p-2 text-sm">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span><span className="font-semibold">Try:</span> {p.example_post}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <PoundSterling className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-black">Monetisation potential</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${POT_TONE[m.data.monetisation.potential] ?? POT_TONE.medium}`}>
                {m.data.monetisation.potential}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{m.data.monetisation.summary}</p>
            <ul className="mt-4 space-y-2">
              {m.data.monetisation.streams.map((s, i) => (
                <li key={i} className="flex items-start gap-3 rounded-2xl bg-secondary/40 p-3 text-sm">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${FIT_TONE[s.fit] ?? FIT_TONE.okay}`}>
                    {s.fit}
                  </span>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="mt-0.5 text-foreground/70">{s.notes}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-3xl p-5">
            <h3 className="font-display text-lg font-black">Positioning advice</h3>
            <ol className="mt-3 space-y-2 text-sm">
              {m.data.positioning_advice.map((a, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-secondary/40 p-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </Card>

          <CopyCard title="Rewritten bio" body={m.data.rewritten_bio} />
          <CopyCard title="One-line positioning statement" body={m.data.one_line_positioning} />
        </section>
      )}
    </div>
  );
}

function CopyCard({ title, body }: { title: string; body: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card className="rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-black">{title}</h3>
        <button
          onClick={() => {
            navigator.clipboard.writeText(body);
            setCopied(true);
            toast.success("Copied!");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:bg-primary hover:text-primary-foreground"
          aria-label="Copy"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
    </Card>
  );
}
