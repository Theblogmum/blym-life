import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Copy, Check, Sparkles, Lightbulb, Lock } from "lucide-react";
import { toast } from "sonner";
import { generateContent } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { cn } from "@/lib/utils";
import { PageHero, UsageChip } from "@/components/page-hero";
import { TypingDots, IdeaGeneratedBadge } from "@/components/micro";
import { PersonaBubble } from "@/components/ai-persona";
import { AudienceFitPanel } from "@/components/audience-fit-panel";

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
        title="Tell me what you filmed."
        description="I'll turn it into hooks, captions, scripts, hashtags or a shot list — in your voice ✨"
        variant="warm"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} freeAllowed={captionsAlwaysFree} />
      </PageHero>

      <section className="mx-auto max-w-3xl space-y-7 px-5 py-10 sm:px-8">
        <PersonaBubble tone="peach">
          Hey lovely — pick what you need, drop the topic, and I'll write 5 options you can post tonight.
        </PersonaBubble>
        <div>
          <p className="eyebrow">first — what should i write?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button
                key={k.v}
                onClick={() => setKind(k.v)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-300",
                  kind === k.v
                    ? "border-foreground bg-foreground text-background shadow-[var(--shadow-soft)]"
                    : "border-border/50 bg-card text-foreground/70 hover:-translate-y-[1px] hover:border-foreground/40 hover:text-foreground hover:shadow-[var(--shadow-xs)]",
                )}
              >
                <span className="mr-1">{k.emoji}</span>
                {k.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="eyebrow">now — what's it about?</label>
          <Input
            className="mt-3 h-12 rounded-2xl border-border/50 bg-card text-base shadow-[var(--shadow-xs)] focus-visible:border-foreground/40 focus-visible:ring-0"
            placeholder="Tell me in a sentence — e.g. 'surviving witching hour with a 2-year-old'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {EXAMPLE_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className="rounded-full bg-foreground/[0.04] px-2.5 py-1 text-[11.5px] text-foreground/65 transition hover:bg-foreground/[0.07] hover:text-foreground"
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
          className="group h-12 w-full rounded-2xl text-[15px] font-semibold tracking-[-0.005em] shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[var(--shadow-elegant)] sm:w-auto sm:px-7"
          disabled={!topic.trim() || m.isPending || lockedKind}
          onClick={() => m.mutate()}
        >
          <Sparkles className={cn("mr-2 h-4 w-4 transition-transform duration-500 group-hover:rotate-12", m.isPending && "animate-spin")} />
          {m.isPending ? (
            <span className="inline-flex items-center gap-2">Bloom is writing <TypingDots /></span>
          ) : (
            "Write me 5 options ✨"
          )}
        </Button>

        {lockedKind && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/30 bg-surface-plum p-3.5 text-[13px]">
            <p className="flex items-center gap-2 text-foreground/85">
              <Lock className="h-4 w-4 text-foreground/60" />
              Captions stay free — {activeKind?.l.toLowerCase()} are included in Creator.
            </p>
            <Link to="/settings">
              <Button size="sm" className="rounded-full transition hover:-translate-y-[1px]">Upgrade</Button>
            </Link>
          </div>
        )}
      </section>

      {options.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-12 sm:px-8">
          <div className="mb-5 flex items-center gap-3">
            <h2 className="section-heading">Here's what I'd post 👇</h2>
            <IdeaGeneratedBadge />
          </div>
          <div className="grid gap-3 sm:gap-3.5 md:grid-cols-2">
            {options.map((o, i) => (
              <ResultRow key={`${m.submittedAt}-${i}`} index={i + 1} text={o} delayMs={i * 70} />
            ))}
          </div>
          <div className="mt-6">
            <AudienceFitPanel initialText={options[0] ?? ""} />
          </div>
        </section>
      )}

      {options.length === 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
          <p className="eyebrow">while you think</p>
          <h2 className="section-heading mb-5">Tips that actually work</h2>
          <div className="grid gap-3 sm:gap-3.5 md:grid-cols-3">
            <TipCard
              emoji="⚡"
              title="First 2 seconds = everything"
              body="Open mid-action or with a question. No 'Hi guys, today we're going to…'"
              surface="bg-surface-mint"
            />
            <TipCard
              emoji="💛"
              title="Be the friend, not the expert"
              body="Write captions like you'd text your group chat. Real beats polished."
              surface="bg-surface-sky"
            />
            <TipCard
              emoji="🔁"
              title="One idea, three formats"
              body="Generate a hook, then a script, then a caption — all from the same topic."
              surface="bg-surface-plum"
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
    <div
      className="card-pop group flex items-start justify-between gap-3 rounded-2xl border border-border/40 bg-card p-5 shadow-[var(--shadow-xs)] transition-all duration-500 ease-out hover:-translate-y-[2px] hover:border-border/60 hover:shadow-[var(--shadow-elegant)]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex flex-1 gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-warm)] text-[11px] font-bold text-white shadow-[0_4px_12px_-4px_oklch(0.66_0.24_350/0.45)]">
          {index}
        </span>
        <p className="flex-1 whitespace-pre-line text-[14px] leading-relaxed text-foreground/90">{text}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1200);
        }}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/[0.05] text-foreground/65 transition-all duration-300 hover:bg-primary/15 hover:text-primary active:scale-90"
        aria-label="Copy"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
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
    <div className={cn("pastel-card p-5", surface)}>
      <div className="text-[26px] leading-none">{emoji}</div>
      <p className="mt-3 font-display text-[16px] font-bold leading-tight tracking-[-0.005em]">{title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/70">{body}</p>
    </div>
  );
}
