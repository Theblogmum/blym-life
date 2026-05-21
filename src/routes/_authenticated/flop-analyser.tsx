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
  TrendingDown,
  Sparkles,
  Lock,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { analyseFlop } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/flop-analyser")({
  component: FlopAnalyserPage,
});

const SCORE_LABELS: Record<string, string> = {
  opening_strength: "Opening strength",
  specificity: "Specificity",
  curiosity: "Curiosity",
  cta_strength: "CTA strength",
};

function FlopAnalyserPage() {
  const fn = useServerFn(analyseFlop);
  const fetchUsage = useServerFn(getUsageToday);
  const [hook, setHook] = useState("");
  const [caption, setCaption] = useState("");
  const [topic, setTopic] = useState("");
  const [watchTime, setWatchTime] = useState("");

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () =>
      fn({
        data: {
          hook,
          caption,
          topic,
          watch_time_seconds: Math.max(0, Number(watchTime) || 0),
        },
      }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;
  const ready = hook.trim() && caption.trim() && topic.trim() && watchTime.trim();

  return (
    <div>
      <PageHero
        icon={TrendingDown}
        eyebrow="Flop Analyser"
        title="Why did this video flop?"
        description="Paste in the hook, caption, topic and average watch time. We'll tell you exactly what didn't land — and rewrite it."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-6">
        <Card glow className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-plum px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              The video that flopped
            </p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="hook">Hook (first line or on-screen text)</Label>
              <Textarea
                id="hook"
                rows={2}
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                placeholder="e.g. 'Mums of toddlers, you need this!'"
                maxLength={300}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Paste the caption you posted with the video"
                maxLength={1500}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 5 toddler snack hacks"
                maxLength={120}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="watch">Average watch time (seconds)</Label>
              <Input
                id="watch"
                type="number"
                inputMode="numeric"
                min={0}
                max={3600}
                value={watchTime}
                onChange={(e) => setWatchTime(e.target.value)}
                placeholder="e.g. 4"
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                size="lg"
                className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
                disabled={!ready || m.isPending || locked}
                onClick={() => m.mutate()}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {m.isPending ? "Diagnosing your flop…" : "Analyse this video"}
              </Button>
            </div>
            {locked && (
              <div className="sm:col-span-2 flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Trial ended. Flop Analyser is a Premium tool.
                </p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-8">
          <Card className="rounded-3xl p-5">
            <div className="flex items-center gap-2 text-primary">
              <AlertCircle className="h-4 w-4" />
              <p className="text-[11px] font-bold uppercase tracking-widest">Honest verdict</p>
            </div>
            <p className="mt-2 text-base leading-relaxed">{m.data.verdict}</p>
          </Card>

          <Card glow className="rounded-3xl p-5">
            <h3 className="font-display text-lg font-black">Scorecard</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {Object.entries(m.data.scores).map(([key, value]) => (
                <ScoreBar key={key} label={SCORE_LABELS[key] ?? key} score={value as number} />
              ))}
            </div>
          </Card>

          <Card className="rounded-3xl p-5">
            <h3 className="font-display text-lg font-black">What didn't land</h3>
            <ul className="mt-3 space-y-3">
              {m.data.diagnoses.map((d, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-4">
                  <p className="font-semibold">{d.label}</p>
                  <p className="mt-1 text-sm text-foreground/70">{d.why}</p>
                  <p className="mt-2 flex gap-2 rounded-xl surface-mint p-2 text-sm">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span><span className="font-semibold">Fix:</span> {d.fix}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <RewriteCard title="Rewritten hook" body={m.data.rewrite_hook} />
          <RewriteCard title="Rewritten caption" body={m.data.rewrite_caption} />
          <RewriteCard title="Try this next post instead" body={m.data.next_post_idea} />
        </section>
      )}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round((score / 10) * 100);
  const tone =
    score >= 7 ? "bg-primary" : score >= 4 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold tabular-nums">{score}/10</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RewriteCard({ title, body }: { title: string; body: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card glow className="rounded-3xl p-5">
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
