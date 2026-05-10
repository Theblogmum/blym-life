import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Copy, Check, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { generateTemplates } from "@/lib/templates.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

const EXAMPLES = [
  "Reply to a brand offering free product (I want paid)",
  "Promo my new sleep guide launching Friday",
  "Story script: surviving the school run",
];

export const Route = createFileRoute("/_authenticated/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const fn = useServerFn(generateTemplates);
  const fetchUsage = useServerFn(getUsageToday);
  const [need, setNeed] = useState("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { need } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;
  const templates = m.data?.templates ?? [];

  return (
    <div>
      <PageHero
        icon={Wand2}
        eyebrow="Template Studio"
        title="Tell me what you need to send."
        description="Brand reply, DM, story script, email — I'll write 4 ready-to-use options you can pick from ✨"
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              What do you need a template for?
            </p>
          </div>
          <div className="space-y-4 p-6">
            <Textarea
              rows={4}
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              placeholder="Tell me in your own words — e.g. 'reply to a brand who sent me a free playmat, I want paid'"
              className="rounded-2xl bg-secondary/40 text-base"
            />
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((t) => (
                <button
                  key={t}
                  onClick={() => setNeed(t)}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground/70 hover:bg-secondary/70"
                >
                  {t}
                </button>
              ))}
            </div>
            <Button
              size="lg"
              className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
              disabled={!need.trim() || m.isPending || locked}
              onClick={() => m.mutate()}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {m.isPending ? "Bloom is drafting…" : "Draft me 4 options ✨"}
            </Button>
            {locked && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Trial ended. Templates are a Premium tool.
                </p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {templates.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-12">
          <h2 className="mb-4 font-display text-2xl font-black">Your 4 templates</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {templates.map((t, i) => (
              <TemplateCard key={i} title={t.title} body={t.body} why={t.why} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TemplateCard({ title, body, why }: { title: string; body: string; why: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card className="rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-black">{title}</h3>
        <button
          onClick={() => {
            navigator.clipboard.writeText(body);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:bg-primary hover:text-primary-foreground"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
      {why && (
        <p className="mt-3 rounded-xl surface-butter p-2 text-xs text-foreground/70">
          <span className="font-semibold">Why this works:</span> {why}
        </p>
      )}
    </Card>
  );
}