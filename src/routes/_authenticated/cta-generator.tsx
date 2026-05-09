import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MessageCircle,
  Sparkles,
  Lock,
  Copy,
  Check,
  Heart,
  ShoppingBag,
  Bookmark,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { generateCtas } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/cta-generator")({
  component: CtaGeneratorPage,
});

const PLATFORMS = ["Instagram", "TikTok", "YouTube Shorts", "Facebook"];
const GOALS = ["Any", "Build community", "Drive a sale", "Get saves", "Spark comments"];

function CtaGeneratorPage() {
  const fn = useServerFn(generateCtas);
  const fetchUsage = useServerFn(getUsageToday);
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("Any");
  const [platform, setPlatform] = useState("Instagram");

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { topic, goal, platform } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;
  const ready = topic.trim().length > 1;

  return (
    <div>
      <PageHero
        icon={MessageCircle}
        eyebrow="CTA Generator"
        title="The bit that actually gets people to do something."
        description="Tell us your post topic. We'll write engagement CTAs, sales CTAs, save/share lines and comment hooks — all in your voice, all human."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              Your post
            </p>
          </div>
          <div className="grid gap-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Post topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. easy lunchbox ideas for fussy 4-year-olds"
                maxLength={160}
                className="rounded-xl bg-secondary/40"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Goal</Label>
                <div className="flex flex-wrap gap-1.5">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        goal === g
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground/70"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Platform</Label>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        platform === p
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground/70"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Button
                size="lg"
                className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
                disabled={!ready || m.isPending || locked}
                onClick={() => m.mutate()}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {m.isPending ? "Writing CTAs…" : "Generate CTAs"}
              </Button>
            </div>
            {locked && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Trial ended. CTA Generator is a Premium tool.
                </p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <CtaList icon={Heart} title="Engagement CTAs" subtitle="Likes, follows, warmth" items={m.data.engagement} />
          <CtaList icon={ShoppingBag} title="Sales CTAs" subtitle="Move them towards a product or service" items={m.data.sales} />
          <CtaList icon={Bookmark} title="Save & share" subtitle="The algorithm-loving signals" items={m.data.save_share} />
          <CtaList icon={MessageSquare} title="Comment hooks" subtitle="Bait real replies" items={m.data.comment_hooks} />
        </section>
      )}
    </div>
  );
}

function CtaList({
  icon: Icon,
  title,
  subtitle,
  items,
}: {
  icon: typeof Heart;
  title: string;
  subtitle: string;
  items: string[];
}) {
  return (
    <Card className="rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-lg font-black leading-tight">{title}</h3>
            <p className="text-xs text-foreground/60">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(items.map((it, i) => `${i + 1}. ${it}`).join("\n"));
            toast.success("List copied!");
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:bg-primary hover:text-primary-foreground"
          aria-label="Copy all"
          title="Copy all"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <CtaItem key={i} text={it} />
        ))}
      </ul>
    </Card>
  );
}

function CtaItem({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <li className="flex items-start justify-between gap-3 rounded-2xl bg-secondary/40 p-3 text-sm">
      <span className="flex-1 leading-relaxed">{text}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success("Copied!");
          setTimeout(() => setCopied(false), 1500);
        }}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-background text-foreground/60 hover:bg-primary hover:text-primary-foreground"
        aria-label="Copy"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </li>
  );
}