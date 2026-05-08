import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Copy, Check, Sparkles, Lightbulb, Lock } from "lucide-react";
import { toast } from "sonner";
import { generateContent } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { cn } from "@/lib/utils";
import { PageHero, UsageChip } from "@/components/page-hero";

const KINDS = [
  { v: "hook", l: "Hooks", emoji: "🎣", tip: "Stop the scroll in 2 seconds." },
  { v: "caption", l: "Captions", emoji: "💬", tip: "Conversational, save-worthy." },
  { v: "script", l: "Scripts", emoji: "🎬", tip: "Beat-by-beat for a 20–30s reel." },
  { v: "hashtags", l: "Hashtags", emoji: "🏷️", tip: "Mix niche + community + broad." },
  { v: "shot list", l: "Shot list", emoji: "📋", tip: "3–5 clips, each 5–10 seconds." },
] as const;

const EXAMPLE_TOPICS = [
  "Surviving the toddler witching hour",
  "Realistic SAHM morning routine",
  "5 things in my nappy bag I can't live without",
  "Mum guilt — let's talk about it",
  "Quick weeknight dinner under £5",
];

export const Route = createFileRoute("/_authenticated/generator")({
  component: GeneratorPage,
});

function GeneratorPage() {
  const fn = useServerFn(generateContent);
  const fetchUsage = useServerFn(getUsageToday);
  const [kind, setKind] = useState<string>("hook");
  const [topic, setTopic] = useState("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });

  const m = useMutation({
    mutationFn: () => fn({ data: { kind, topic } }),
    onSuccess: () => usage.refetch(),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const options = Array.isArray(m.data?.options) ? m.data.options : [];
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  // Free users (after trial) can only run captions. Other kinds are locked.
  const captionsAlwaysFree = true;
  const isCaption = kind === "caption";
  const lockedKind = !premium && !inTrial && !isCaption;
  const activeKind = KINDS.find((k) => k.v === kind);

  return (
    <div>
      <PageHero
        icon={Camera}
        eyebrow="Content Generator"
        title="Five posts. One minute."
        description="Hooks, captions, scripts, hashtags & shot lists — written in your voice for your niche."
        variant="warm"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} freeAllowed={captionsAlwaysFree} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-peach px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              Step 1 · Pick what to write
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.v}
                  onClick={() => setKind(k.v)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    kind === k.v
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                      : "bg-white/70 text-foreground/70 hover:bg-white",
                  )}
                >
                  <span className="mr-1.5">{k.emoji}</span>
                  {k.l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Step 2 · What's it about?
              </label>
              <Input
                className="mt-2 h-12 rounded-2xl bg-secondary/40 text-base"
                placeholder="e.g. surviving witching hour with a 2-year-old"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {EXAMPLE_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground/70 hover:bg-secondary/70"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {activeKind && (
              <div className="flex items-start gap-2 rounded-2xl surface-butter p-3 text-sm">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  <span className="font-semibold">{activeKind.l} tip:</span> {activeKind.tip}
                </p>
              </div>
            )}

            <Button
              size="lg"
              className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
              disabled={!topic.trim() || m.isPending || lockedKind}
              onClick={() => m.mutate()}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {m.isPending ? "Writing your 5 options…" : "Generate 5 options"}
            </Button>

            {lockedKind && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Trial ended — captions stay free, but {activeKind?.l.toLowerCase()} are premium.
                </p>
                <Link to="/settings">
                  <Button size="sm" className="rounded-full">
                    Upgrade
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {options.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-10">
          <h2 className="mb-4 font-display text-2xl font-black">Your 5 options</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {options.map((o, i) => (
              <ResultRow key={i} index={i + 1} text={o} />
            ))}
          </div>
        </section>
      )}

      {options.length === 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-16">
          <h2 className="mb-4 font-display text-2xl font-black">Tips that actually work</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <TipCard
              emoji="⚡"
              title="First 2 seconds = everything"
              body="Open mid-action or with a question. No 'Hi guys, today we're going to…'"
              surface="surface-mint"
            />
            <TipCard
              emoji="💛"
              title="Be the friend, not the expert"
              body="Write captions like you'd text your group chat. Real beats polished."
              surface="surface-sky"
            />
            <TipCard
              emoji="🔁"
              title="One idea, three formats"
              body="Generate a hook, then a script, then a caption — all from the same topic."
              surface="surface-plum"
            />
          </div>
        </section>
      )}
    </div>
  );
}

function ResultRow({ text, index }: { text: string; index: number }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card className="group flex items-start justify-between gap-3 rounded-3xl border-0 bg-card p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]">
      <div className="flex flex-1 gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-warm)] text-xs font-bold text-white">
          {index}
        </span>
        <p className="flex-1 whitespace-pre-line text-sm leading-relaxed">{text}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1200);
        }}
        className="rounded-full bg-secondary p-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        aria-label="Copy"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </Card>
  );
}

function TipCard({
  emoji,
  title,
  body,
  surface,
}: {
  emoji: string;
  title: string;
  body: string;
  surface: string;
}) {
  return (
    <Card className={cn("rounded-3xl border-0 p-5", surface)}>
      <div className="text-2xl">{emoji}</div>
      <p className="mt-2 font-display text-lg font-black">{title}</p>
      <p className="mt-1 text-sm text-foreground/70">{body}</p>
    </Card>
  );
}
