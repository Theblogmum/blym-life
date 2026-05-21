import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Sparkles, Lock, Sun, Moon, CalendarDays, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { suggestPostTiming } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/post-timing")({
  component: PostTimingPage,
});

type Platform = "instagram" | "tiktok" | "facebook";
const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
];

function PostTimingPage() {
  const fn = useServerFn(suggestPostTiming);
  const fetchUsage = useServerFn(getUsageToday);
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [tz, setTz] = useState("GMT/BST (UK)");
  const [notes, setNotes] = useState("");

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () =>
      fn({ data: { platform, audience_timezone: tz, audience_notes: notes } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;

  return (
    <div>
      <PageHero
        icon={Clock}
        eyebrow="Post Timing"
        title="Post when your people are actually scrolling."
        description="Pick a platform and tell us a bit about your audience. We'll give you the best windows, what to avoid, a 7-day schedule and timing per content type."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-6">
        <Card glow className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">Your audience</p>
          </div>
          <div className="grid gap-4 p-6">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      platform === p.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground/70"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tz">Audience timezone</Label>
              <Input
                id="tz"
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                placeholder="e.g. GMT/BST (UK), EST (US East)"
                maxLength={120}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Audience notes (optional)</Label>
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. mostly mums of toddlers, work part-time, scroll after 8pm bedtime"
                maxLength={500}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div>
              <Button
                size="lg"
                className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
                disabled={m.isPending || locked}
                onClick={() => m.mutate()}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {m.isPending ? "Reading the rhythm…" : "Get post timing"}
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
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-8">
          <Card className="rounded-3xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Summary</p>
            <p className="mt-2 text-sm leading-relaxed">{m.data.summary}</p>
          </Card>

          <Card glow className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Best posting windows</h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {m.data.best_windows.map((w, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold">{w.day}</p>
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground tabular-nums">
                      {w.window}
                    </span>
                  </div>
                  <p className="mt-1 text-foreground/70">{w.why}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-rose-600" />
              <h3 className="font-display text-lg font-black">Avoid these windows</h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {m.data.avoid_windows.map((a, i) => (
                <li key={i} className="rounded-2xl bg-rose-100/60 p-3 text-rose-900">{a}</li>
              ))}
            </ul>
          </Card>

          <Card glow className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Your 7-day schedule</h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {m.data.schedule.map((s, i) => (
                <li key={i} className="grid grid-cols-[80px_1fr] gap-3 rounded-2xl bg-secondary/40 p-3 sm:grid-cols-[100px_120px_1fr]">
                  <span className="font-bold">{s.day}</span>
                  <span className="font-semibold tabular-nums text-primary">{s.time}</span>
                  <span>
                    <span className="font-semibold">{s.content_type}</span>
                    <span className="ml-2 text-foreground/70">— {s.rationale}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-3xl p-5">
            <h3 className="font-display text-lg font-black">By content type</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {m.data.content_type_timing.map((c, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-3 text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold">{c.content_type}</p>
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground tabular-nums">
                      {c.best_time}
                    </span>
                  </div>
                  <p className="mt-1 text-foreground/70">{c.why}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card glow className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Timing tips</h3>
            </div>
            <ol className="mt-3 space-y-2 text-sm">
              {m.data.tips.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-secondary/40 p-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </Card>
        </section>
      )}
    </div>
  );
}
