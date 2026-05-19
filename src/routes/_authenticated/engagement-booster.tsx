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
  Heart,
  Sparkles,
  Lock,
  Copy,
  MessageSquare,
  Zap,
  Repeat,
  Wand2,
  CircleDot,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { boostEngagement } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/engagement-booster")({
  component: EngagementBoosterPage,
});

function EngagementBoosterPage() {
  const fn = useServerFn(boostEngagement);
  const fetchUsage = useServerFn(getUsageToday);
  const [topic, setTopic] = useState("");
  const [caption, setCaption] = useState("");

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { topic, current_caption: caption } }),
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
        icon={Heart}
        eyebrow="Engagement Booster"
        title="Stop posting into the void."
        description="Tell us what you're posting. We'll hand you reply starters, story prompts, polls, DM openers, community rituals and caption tweaks that actually get replies."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card glow className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">Your post</p>
          </div>
          <div className="grid gap-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Post topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. real-talk Reel about toddler tantrums"
                maxLength={160}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="caption">Current caption (optional)</Label>
              <Textarea
                id="caption"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Paste it here — we'll tweak it for replies"
                maxLength={1500}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div>
              <Button
                size="lg"
                className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
                disabled={!ready || m.isPending || locked}
                onClick={() => m.mutate()}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {m.isPending ? "Brewing engagement…" : "Boost engagement"}
              </Button>
            </div>
            {locked && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Trial ended. Premium tool.</p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <ListCard icon={MessageSquare} title="Reply starters" subtitle="Drop these as your first comments to seed the thread" items={m.data.reply_starters} />
          <ListCard icon={CircleDot} title="Story prompts" subtitle="Real IG sticker prompts" items={m.data.story_prompts} />

          <Card className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Polls</h3>
            </div>
            <ul className="mt-3 space-y-3">
              {m.data.polls.map((p, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-3">
                  <p className="text-sm font-semibold">{p.question}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.options.map((o, j) => (
                      <span key={j} className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold">{o}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <ListCard icon={Mail} title="DM starters" subtitle="Open conversations on the back of this post" items={m.data.dm_starters} />
          <ListCard icon={Repeat} title="Community rituals" subtitle="Recurring bits that build belonging" items={m.data.community_rituals} />
          <ListCard icon={Wand2} title="Caption tweaks" subtitle="Small rewrites that lift replies" items={m.data.caption_tweaks} />
        </section>
      )}
    </div>
  );
}

function ListCard({
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
    <Card glow className="rounded-3xl p-5">
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
            navigator.clipboard.writeText(items.join("\n"));
            toast.success("Copied!");
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:bg-primary hover:text-primary-foreground"
          aria-label="Copy"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((it, i) => (
          <li key={i} className="rounded-2xl bg-secondary/40 p-3">{it}</li>
        ))}
      </ul>
    </Card>
  );
}