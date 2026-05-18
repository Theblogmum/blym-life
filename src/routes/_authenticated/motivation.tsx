import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Sunrise, Lightbulb, Heart, NotebookPen, ScrollText, RefreshCw } from "lucide-react";
import { dailyMotivation } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/motivation")({ component: Page });

function Page() {
  const fn = useServerFn(dailyMotivation);
  const fetchUsage = useServerFn(getUsageToday);
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const q = useQuery({ queryKey: ["motivation", new Date().toISOString().slice(0, 10)], queryFn: () => fn() });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  return (
    <div>
      <PageHero icon={Sunrise} eyebrow="Daily motivation" title="A small lift, every day." description="One affirmation, one truth, one tiny action, one journal prompt, one permission slip — refreshed for today." variant="sunrise">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} freeAllowed />
      </PageHero>
      <section className="mx-auto max-w-3xl space-y-4 px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="group rounded-full transition hover:-translate-y-[1px]" disabled={q.isFetching} onClick={() => q.refetch()}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 transition-transform group-hover:rotate-180 ${q.isFetching ? "animate-spin" : ""}`} /> New prompt
          </Button>
        </div>
        {q.isLoading && (
          <div className="soft-card p-10 text-center text-[13px] text-muted-foreground/90">
            <Sparkles className="mx-auto mb-2 h-5 w-5 animate-pulse text-primary" />
            Brewing your prompt…
          </div>
        )}
        {q.data && (
          <>
            <Block icon={Heart} label="Today's affirmation" body={q.data.affirmation} tone="warm" big />
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5">
              <Block icon={Lightbulb} label="Truth bomb" body={q.data.truth_bomb} />
              <Block icon={Sparkles} label="Tiny action (under 5 min)" body={q.data.tiny_action} />
              <Block icon={NotebookPen} label="Journal prompt" body={q.data.journal_prompt} />
              <Block icon={ScrollText} label="Permission slip" body={q.data.permission_slip} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Block({ icon: Icon, label, body, big, tone }: { icon: typeof Heart; label: string; body: string; big?: boolean; tone?: "warm" }) {
  const isWarm = tone === "warm";
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-500 ease-out hover:-translate-y-[2px] hover:shadow-[var(--shadow-elegant)] ${
        isWarm
          ? "border border-white/20 text-white shadow-[var(--shadow-soft)]"
          : "soft-card"
      }`}
      style={isWarm ? { background: "linear-gradient(135deg, oklch(0.86 0.1 60) 0%, oklch(0.82 0.13 30) 55%, oklch(0.78 0.13 350) 100%)" } : undefined}
    >
      {isWarm && (
        <>
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
        </>
      )}
      <div className="relative flex items-center gap-2">
        <span className={`icon-tile h-8 w-8 ${isWarm ? "bg-white/30 text-white" : "bg-white/75 text-primary"}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isWarm ? "text-white/85" : "text-foreground/55"}`}>{label}</p>
      </div>
      <p className={`relative mt-3 ${big ? "font-display text-[24px] font-bold leading-[1.15] tracking-[-0.018em] sm:text-[30px]" : "text-[14px] leading-relaxed text-foreground/90"}`}>{body}</p>
    </div>
  );
}