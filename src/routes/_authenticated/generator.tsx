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
import { TypingDots, IdeaGeneratedBadge } from "@/components/micro";

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

      <section className="mx-auto max-w-3xl space-y-6 px-5 py-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            1 · Pick what to write
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {KINDS.map((k) => (
              <button
                key={k.v}
                onClick={() => setKind(k.v)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                  kind === k.v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground/70 hover:border-foreground/30",
                )}
              >
                <span className="mr-1">{k.emoji}</span>
                {k.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            2 · What's it about?
          </label>
          <Input
            className="mt-2 h-12 rounded-xl text-base"
            placeholder="e.g. surviving witching hour with a 2-year-old"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAMPLE_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className="rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {activeKind && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span><span className="font-semibold text-foreground/80">{activeKind.l} tip:</span> {activeKind.tip}</span>
          </p>
        )}

        <Button
          size="lg"
          className="h-12 w-full rounded-xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
          disabled={!topic.trim() || m.isPending || lockedKind}
          onClick={() => m.mutate()}
        >
          <Sparkles className={cn("mr-2 h-4 w-4", m.isPending && "animate-spin")} />
          {m.isPending ? (
            <span className="inline-flex items-center gap-2">Writing your 5 options <TypingDots /></span>
          ) : (
            "Generate 5 options"
          )}
        </Button>

        {lockedKind && (
          <Card className="flex items-center justify-between gap-3 rounded-2xl border-0 surface-plum p-3 text-sm">
            <p className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Trial ended — captions stay free, but {activeKind?.l.toLowerCase()} are premium.
            </p>
            <Link to="/settings">
              <Button size="sm" className="rounded-full">Upgrade</Button>
            </Link>
          </Card>
        )}
      </section>

      {options.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-10">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-display text-2xl font-black">Your 5 options</h2>
            <IdeaGeneratedBadge />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {options.map((o, i) => (
              <ResultRow key={`${m.dataUpdatedAt}-${i}`} index={i + 1} text={o} delayMs={i * 70} />
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

function ResultRow({ text, index, delayMs = 0 }: { text: string; index: number; delayMs?: number }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card
      className="card-pop glow-hover group flex items-start justify-between gap-3 rounded-3xl border-0 bg-card p-5 shadow-[var(--shadow-soft)]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
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
