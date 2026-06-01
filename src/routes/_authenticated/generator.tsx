import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, Copy, Check, Sparkles, Lightbulb, Lock } from "lucide-react";
import { toast } from "sonner";
import { generateContent } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { cn } from "@/lib/utils";
import { PageHero, UsageChip } from "@/components/page-hero";
import { TypingDots, IdeaGeneratedBadge } from "@/components/micro";
import { AudienceFitPanel } from "@/components/audience-fit-panel";
import { CreatorQuote, DailyNudge } from "@/components/creator-quote";

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
  validateSearch: (s: Record<string, unknown>) => ({
    kind: typeof s.kind === "string" ? s.kind : undefined,
  }),
  component: GeneratorPage,
});

function GeneratorPage() {
  const fn = useServerFn(generateContent);
  const fetchUsage = useServerFn(getUsageToday);
  const search = Route.useSearch();
  const initialKind = search.kind && KINDS.some((k) => k.v === search.kind) ? search.kind : "hook";
  const [kind, setKind] = useState<string>(initialKind);
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
        icon={Wand2}
        eyebrow="Welcome to your Studio"
        title="Let's create something worth posting."
        description="Hooks, captions, scripts, hashtags & shot lists — all in one place, in your voice."
        variant="warm"
      >
        <div className="flex flex-wrap items-center gap-2">
          <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} freeAllowed={captionsAlwaysFree} />
          <DailyNudge />
        </div>
      </PageHero>

      {/* Two-column workspace — kills the empty-page feeling */}
      <section className="mx-auto grid max-w-5xl gap-5 px-4 pt-3 pb-6 sm:px-6 lg:grid-cols-[1fr_280px] lg:gap-6">
        {/* === LEFT: the creation panel === */}
        <div className="experience-hero float-card relative space-y-5 p-5 sm:p-6">
          <div>
            <p className="eyebrow">1 · pick your magic</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.v}
                  onClick={() => setKind(k.v)}
                  className={cn(
                    "group/chip rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-300",
                    kind === k.v
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_10px_24px_-8px_oklch(0.65_0.27_350/0.55)] scale-[1.04]"
                      : "glass-chip text-foreground/75 hover:text-foreground",
                  )}
                >
                  <span className="mr-1 transition-transform group-hover/chip:scale-125 inline-block">{k.emoji}</span>
                  {k.l}
                </button>
              ))}
            </div>
            {activeKind && (
              <p className="mt-3 flex items-start gap-1.5 text-[12px] text-foreground/65">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span><span className="font-semibold text-foreground/80">{activeKind.l} tip:</span> {activeKind.tip}</span>
              </p>
            )}
          </div>

          <div>
            <p className="eyebrow">2 · what's it about?</p>
            <Input
              className="soft-input mt-3 h-12 text-base"
              placeholder="e.g. 'surviving witching hour with a 2-year-old'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {EXAMPLE_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="rounded-full bg-white/55 px-2.5 py-1 text-[11.5px] font-medium text-foreground/65 ring-1 ring-white/60 backdrop-blur transition hover:-translate-y-[1px] hover:bg-white/80 hover:text-foreground"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            className="group h-12 w-full rounded-2xl text-[15px] font-extrabold tracking-[-0.005em] shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[var(--shadow-elegant)]"
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
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/55 p-3.5 text-[13px] backdrop-blur">
              <p className="flex items-center gap-2 text-foreground/85">
                <Lock className="h-4 w-4 text-foreground/60" />
                Captions stay free — {activeKind?.l.toLowerCase()} are in Creator.
              </p>
              <Link to="/settings">
                <Button size="sm" className="rounded-full transition hover:-translate-y-[1px]">Upgrade</Button>
              </Link>
            </div>
          )}
        </div>

        {/* === RIGHT: dopamine sidebar (quote + mini tips). Stacks on mobile. === */}
        <aside className="space-y-3.5">
          <CreatorQuote />
          <MiniTip emoji="⚡" title="First 2s = everything" body="Open mid-action. Skip the intro." />
          <MiniTip emoji="💛" title="Be the friend" body="Captions like a group-chat text." />
          <MiniTip emoji="🔁" title="One idea, 3 formats" body="Hook → script → caption from the same topic." />
        </aside>
      </section>

      {options.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
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
    </div>
  );
}

function ResultRow({ text, index, delayMs = 0 }: { text: string; index: number; delayMs?: number }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="card-pop float-card group flex items-start justify-between gap-3 rounded-2xl border border-border/40 bg-card p-5 shadow-[var(--shadow-xs)]"
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

function MiniTip({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="glass-chip float-card group rounded-2xl px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-[20px] leading-none transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">{emoji}</span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-tight text-foreground">{title}</p>
          <p className="mt-0.5 text-[12px] leading-snug text-foreground/65">{body}</p>
        </div>
      </div>
    </div>
  );
}
