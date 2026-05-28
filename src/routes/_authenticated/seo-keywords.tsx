import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Sparkles,
  Lock,
  Copy,
  Check,
  Hash,
  HelpCircle,
  CalendarDays,
  Lightbulb,
  Music2,
  CircleDot,
} from "lucide-react";
import { toast } from "sonner";
import { generateSeoKeywords } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/seo-keywords")({
  component: SeoKeywordsPage,
});

type Platform = "tiktok" | "instagram";

const PLATFORMS: { id: Platform; label: string; icon: typeof Music2 }[] = [
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "instagram", label: "Instagram", icon: CircleDot },
];

const SIZE_TONE: Record<string, string> = {
  niche: "bg-primary text-primary-foreground",
  mid: "bg-amber-100 text-amber-900",
  broad: "bg-rose-100 text-rose-900",
};

function SeoKeywordsPage() {
  const fn = useServerFn(generateSeoKeywords);
  const fetchUsage = useServerFn(getUsageToday);
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("tiktok");

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { topic, platform } }),
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
        icon={Search}
        eyebrow="Search Boost™"
        title="Get found in search — not just the feed."
        description="Pick a platform and a topic. We'll hand you primary keywords, long-tail searches, sized hashtags, real questions mums type, seasonal angles and exactly where to put them."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card glow className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              Your search
            </p>
          </div>
          <div className="grid gap-4 p-6">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORMS.map((p) => {
                  const isActive = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                          : "bg-secondary text-foreground/70"
                      }`}
                    >
                      <p.icon className="h-3.5 w-3.5" /> {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. weaning meals, toddler activities at home, postpartum anxiety"
                maxLength={160}
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
                {m.isPending ? "Researching keywords…" : "Get SEO keywords"}
              </Button>
            </div>
            {locked && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Included in Creator — unlock SEO Keywords.
                </p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <ChipList icon={Search} title="Primary keywords" subtitle="The core terms" items={m.data.primary} />
          <ChipList
            icon={Sparkles}
            title="Long-tail keywords"
            subtitle="Conversational, intent-led"
            items={m.data.long_tail}
          />

          <Card className="rounded-3xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
                  <Hash className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-black leading-tight">Hashtags</h3>
                  <p className="text-xs text-foreground/60">Mix of niche, mid &amp; broad</p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    m.data!.hashtags.map((h) => `#${h.tag}`).join(" "),
                  );
                  toast.success("Hashtags copied!");
                }}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:bg-primary hover:text-primary-foreground"
                aria-label="Copy hashtags"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {m.data.hashtags.map((h, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 rounded-full bg-secondary/60 py-1 pl-3 pr-1 text-sm font-semibold"
                >
                  <span>#{h.tag}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      SIZE_TONE[h.size] ?? SIZE_TONE.mid
                    }`}
                  >
                    {h.size}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <ChipList
            icon={HelpCircle}
            title="Questions mums search"
            subtitle="Use as hooks, captions or video answers"
            items={m.data.questions}
            asList
          />
          <ChipList
            icon={CalendarDays}
            title="Seasonal & timely"
            subtitle="Hook into what's happening now"
            items={m.data.seasonal}
          />

          <Card glow className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Placement tips</h3>
            </div>
            <ol className="mt-3 space-y-2 text-sm">
              {m.data.placement_tips.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-secondary/40 p-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </Card>

          <CopyCard title="Ready-to-paste keyword caption" body={m.data.ready_to_paste_caption} />
        </section>
      )}
    </div>
  );
}

function ChipList({
  icon: Icon,
  title,
  subtitle,
  items,
  asList,
}: {
  icon: typeof Hash;
  title: string;
  subtitle: string;
  items: string[];
  asList?: boolean;
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
            navigator.clipboard.writeText(items.join("\n"));
            toast.success("Copied!");
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:bg-primary hover:text-primary-foreground"
          aria-label="Copy"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      {asList ? (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((it, i) => (
            <li key={i} className="rounded-2xl bg-secondary/40 p-3">{it}</li>
          ))}
        </ul>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <li key={i} className="rounded-full bg-secondary/60 px-3 py-1.5 text-sm font-semibold">
              {it}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function CopyCard({ title, body }: { title: string; body: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card glow className="rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-black">{title}</h3>
        <button
          onClick={() => {
            navigator.clipboard.writeText(body);
            setCopied(true);
            toast.success("Copied!");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:bg-primary hover:text-primary-foreground"
          aria-label="Copy"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
    </Card>
  );
}