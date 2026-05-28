import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCheck, Sparkles, Lock, ThumbsUp, AlertCircle, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { auditProfile } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/profile-audit")({
  component: ProfileAuditPage,
});

type Platform = "instagram" | "tiktok";
const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
];
const TONE: Record<string, string> = {
  high: "bg-primary text-primary-foreground",
  medium: "bg-amber-100 text-amber-900",
  low: "bg-rose-100 text-rose-900",
};

function ProfileAuditPage() {
  const fn = useServerFn(auditProfile);
  const fetchUsage = useServerFn(getUsageToday);
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [bio, setBio] = useState("");
  const [grid, setGrid] = useState("");
  const [pinned, setPinned] = useState("");

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () =>
      fn({ data: { handle, platform, bio, grid_summary: grid, pinned_hooks: pinned } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;
  const ready = handle.trim() && bio.trim() && grid.trim().length > 20;

  return (
    <div>
      <PageHero
        icon={ClipboardCheck}
        eyebrow="Profile Glow-Up™"
        title="A proper, honest review of your account."
        description="Tell us your handle, paste your bio, and describe your last 9 posts in a couple of sentences. Get scores, strengths, weaknesses, quick wins and a 30-day plan."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card glow className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">Your profile</p>
          </div>
          <div className="grid gap-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
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
                <Label htmlFor="handle">Handle</Label>
                <Input
                  id="handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
                  placeholder="yourhandle"
                  maxLength={60}
                  className="rounded-xl bg-secondary/40"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Paste your bio exactly"
                maxLength={500}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="grid">Grid / recent posts (describe the last 9)</Label>
              <Textarea
                id="grid"
                rows={4}
                value={grid}
                onChange={(e) => setGrid(e.target.value)}
                placeholder="e.g. 4 weaning recipe Reels, 2 'day in the life' vlogs, 1 carousel of nursery photos, 2 brand-gifted product flat-lays"
                maxLength={1500}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pinned">Pinned posts / top hooks (optional)</Label>
              <Textarea
                id="pinned"
                rows={2}
                value={pinned}
                onChange={(e) => setPinned(e.target.value)}
                placeholder="e.g. 'I wish someone told me this before weaning' (38k views)"
                maxLength={500}
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
                {m.isPending ? "Auditing your profile…" : "Run profile audit"}
              </Button>
            </div>
            {locked && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Unlock with Studio.</p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Verdict</p>
                <h2 className="mt-1 font-display text-xl font-black leading-tight">{m.data.one_line_verdict}</h2>
                <p className="mt-2 text-sm text-foreground/80">{m.data.first_impression}</p>
              </div>
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-[image:var(--gradient-warm)] text-center text-white shadow-[var(--shadow-soft)]">
                <div>
                  <div className="text-2xl font-black tabular-nums">{m.data.overall_score}</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider opacity-90">/10</div>
                </div>
              </div>
            </div>
          </Card>

          <Card glow className="rounded-3xl p-5">
            <h3 className="font-display text-lg font-black">Scorecard</h3>
            <div className="mt-3 grid gap-2">
              {Object.entries(m.data.scores).map(([k, v]) => (
                <ScoreBar key={k} label={k.replace(/_/g, " ")} value={v} />
              ))}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-3xl p-5">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-black">Strengths</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {m.data.strengths.map((s, i) => (
                  <li key={i} className="rounded-2xl bg-secondary/40 p-3">{s}</li>
                ))}
              </ul>
            </Card>
            <Card glow className="rounded-3xl p-5">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <h3 className="font-display text-lg font-black">Weaknesses</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {m.data.weaknesses.map((w, i) => (
                  <li key={i} className="rounded-2xl bg-amber-100/60 p-3 text-amber-900">{w}</li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="rounded-3xl p-5">
            <h3 className="font-display text-lg font-black">Quick wins</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {m.data.quick_wins.map((q, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-3">
                  <p className="font-semibold">{q.action}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TONE[q.impact] ?? TONE.medium}`}>
                      Impact: {q.impact}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TONE[q.effort] ?? TONE.medium}`}>
                      Effort: {q.effort}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card glow className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">30-day growth plan</h3>
            </div>
            <ol className="mt-3 space-y-3">
              {m.data.thirty_day_plan.map((w, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Week {w.week}</p>
                  <p className="mt-1 font-semibold">{w.focus}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {w.actions.map((a, j) => (
                      <li key={j} className="flex gap-2"><span className="text-primary">•</span><span>{a}</span></li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Card>
        </section>
      )}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value * 10));
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold capitalize">{label}</span>
        <span className="font-black tabular-nums">{value}/10</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-[image:var(--gradient-warm)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}