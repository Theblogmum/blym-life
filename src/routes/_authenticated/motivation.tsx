import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <section className="mx-auto max-w-3xl space-y-4 px-5 py-10">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="rounded-full" disabled={q.isFetching} onClick={() => q.refetch()}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${q.isFetching ? "animate-spin" : ""}`} /> New prompt
          </Button>
        </div>
        {q.isLoading && <Card className="rounded-3xl p-8 text-center text-sm text-muted-foreground"><Sparkles className="mx-auto mb-2 h-5 w-5 animate-pulse" />Brewing your prompt…</Card>}
        {q.data && (
          <>
            <Block icon={Heart} label="Today's affirmation" body={q.data.affirmation} tone="warm" big />
            <div className="grid gap-4 sm:grid-cols-2">
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
  return (
    <Card className={`rounded-3xl p-5 ${tone === "warm" ? "bg-[image:var(--gradient-sunrise)] text-white border-0" : ""}`}>
      <div className="flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-xl ${tone === "warm" ? "bg-white/25 text-white" : "bg-secondary text-primary"}`}><Icon className="h-4 w-4" /></span>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${tone === "warm" ? "text-white/80" : "text-muted-foreground"}`}>{label}</p>
      </div>
      <p className={`mt-3 ${big ? "font-display text-2xl font-black leading-tight sm:text-3xl" : "text-sm leading-relaxed"}`}>{body}</p>
    </Card>
  );
}