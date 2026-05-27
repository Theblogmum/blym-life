import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Sparkles, Lock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { analyseTrend } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";
import { cn } from "@/lib/utils";
import { SaveToVaultButton } from "@/components/save-to-vault-button";

const EXAMPLES = [
  "POV: I'm pretending to enjoy soft play",
  "Mum gets ready in 60 seconds (chaos edition)",
  "Things only mums of toddlers will understand",
];

export const Route = createFileRoute("/_authenticated/viral-lab")({
  component: ViralLab,
});

function ViralLab() {
  const fn = useServerFn(analyseTrend);
  const fetchUsage = useServerFn(getUsageToday);
  const [input, setInput] = useState("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: (text: string) => fn({ data: { input: text } }),
    onSuccess: () => usage.refetch(),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const remixes = Array.isArray(m.data?.remix_for_you) ? m.data.remix_for_you : [];
  const premium = !!usage.data?.premium;
  const freeUsage = usage.data?.freeUsage as
    | Record<string, { used: number; limit: number }>
    | undefined;
  const bucket = freeUsage?.viral_lab ?? freeUsage?.daily;
  const used = bucket?.used ?? 0;
  const limit = bucket?.limit ?? 0;
  const outOfQuota = !premium && bucket ? used >= limit : false;

  return (
    <div>
      <PageHero
        icon={Flame}
        eyebrow="Viral Content Lab"
        title="Reverse-engineer what's blowing up."
        description="Paste a trend, caption, or describe a video. We'll break down WHY it works and remix it for your niche."
        variant="bloom"
      >
        <UsageChip premium={premium} used={used} limit={limit} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card glow className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-plum px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              Drop the trend in here
            </p>
          </div>
          <div className="space-y-4 p-6">
            <Textarea
              placeholder="e.g. 'Mum doing 5am morning routine with toddler interrupting' or paste a TikTok caption…"
              rows={5}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="rounded-2xl bg-secondary/40 text-base"
            />
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((t) => (
                <button
                  key={t}
                  onClick={() => setInput(t)}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground/70 hover:bg-secondary/70"
                >
                  {t}
                </button>
              ))}
            </div>
            <Button
              size="lg"
              className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
              disabled={!input.trim() || m.isPending || outOfQuota}
              onClick={() => m.mutate(input)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {m.isPending ? "Analysing the magic…" : "Break it down"}
            </Button>
            {outOfQuota && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-peach p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  You've used all {limit} free AI generations today. Resets tomorrow — or go unlimited.
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
          <h2 className="mb-4 font-display text-2xl font-black">The breakdown</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Section emoji="🎣" title="Hook breakdown" surface="surface-mint">
              {m.data.hook_breakdown}
            </Section>
            <Section emoji="🧱" title="Structure" surface="surface-sky">
              {m.data.structure}
            </Section>
            <Section emoji="✨" title="Why it works" surface="surface-butter">
              {m.data.why_it_works}
            </Section>
          </div>

          <Card className="mt-6 overflow-hidden rounded-3xl border-0 bg-[image:var(--gradient-sunrise)] p-[2px] shadow-[var(--shadow-glow)]">
            <div className="rounded-[calc(theme(borderRadius.3xl)-2px)] bg-card p-6">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-4 w-4" />
                <p className="text-[11px] font-bold uppercase tracking-widest">
                  Remixed for you
                </p>
              </div>
              <ul className="mt-3 space-y-2.5 text-sm">
                {remixes.map((r, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-2xl bg-secondary/40 p-3"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-warm)] text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="flex-1">{r}</span>
                    <SaveToVaultButton kind="hook" body={r} title={input.slice(0, 80)} />
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </section>
      )}

      {!m.data && (
        <section className="mx-auto max-w-5xl px-5 pb-16">
          <h2 className="mb-4 font-display text-2xl font-black">What you'll get</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Section emoji="🎣" title="Hook breakdown" surface="surface-mint">
              The exact pattern interrupt that stops the scroll, written out so you can copy the formula.
            </Section>
            <Section emoji="🧱" title="Structure" surface="surface-sky">
              A beat-by-beat map of how the video keeps people watching to the end.
            </Section>
            <Section emoji="🪄" title="3–5 remixes" surface="surface-butter">
              Versions of the trend tailored to YOUR niche, voice and audience — copy/paste ready.
            </Section>
          </div>
        </section>
      )}
    </div>
  );
}

function Section({
  emoji,
  title,
  children,
  surface,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
  surface: string;
}) {
  return (
    <Card glow className={cn("rounded-3xl border-0 p-5", surface)}>
      <div className="text-xl">{emoji}</div>
      <p className="mt-2 font-display text-base font-black">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/80">{children}</p>
    </Card>
  );
}
