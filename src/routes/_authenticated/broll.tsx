import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clapperboard,
  Sparkles,
  Lock,
  Copy,
  Check,
  Camera,
  Wand2,
  Palette,
  Lightbulb,
  Film,
} from "lucide-react";
import { toast } from "sonner";
import { generateBroll } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/broll")({
  component: BrollPage,
});

function BrollPage() {
  const fn = useServerFn(generateBroll);
  const fetchUsage = useServerFn(getUsageToday);
  const [topic, setTopic] = useState("");

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { topic } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;
  const ready = topic.trim().length > 1;

  const copyShotList = () => {
    if (!m.data) return;
    const text = m.data.shots
      .map((s, i) => `${i + 1}. ${s.shot} (${s.duration_seconds}s) — ${s.why}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Shot list copied!");
  };

  return (
    <div>
      <PageHero
        icon={Clapperboard}
        eyebrow="B-Roll Ideas"
        title="Stop staring at your camera roll."
        description="Tell us your niche or topic. We'll hand you a ready-to-film shot list with angles, transitions and an aesthetic direction — all doable on a phone, at home."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              What are you filming?
            </p>
          </div>
          <div className="grid gap-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Niche or topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. baby-led weaning lunches, tidy-with-me, mum morning routine"
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
                {m.isPending ? "Storyboarding…" : "Generate b-roll"}
              </Button>
            </div>
            {locked && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Trial ended. B-Roll Ideas is a Premium tool.
                </p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-black">Shots to film</h3>
              </div>
              <button
                onClick={copyShotList}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:bg-primary hover:text-primary-foreground"
                aria-label="Copy shot list"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <ol className="mt-3 space-y-2">
              {m.data.shots.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-secondary/40 p-3 text-sm">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-semibold">{s.shot}</p>
                      <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-[10px] font-bold tabular-nums text-foreground/70">
                        {s.duration_seconds}s
                      </span>
                    </div>
                    <p className="mt-1 text-foreground/70">{s.why}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Camera angles</h3>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {m.data.angles.map((a, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-3 text-sm">
                  <p className="font-semibold">{a.name}</p>
                  <p className="mt-1 text-foreground/70">{a.how_to}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Transitions</h3>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {m.data.transitions.map((t, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-3 text-sm">
                  <p className="font-semibold">{t.name}</p>
                  <p className="mt-1 text-foreground/70">{t.how_to}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Aesthetic direction</h3>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary/40 p-3 text-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Mood</p>
                <p className="mt-1">{m.data.aesthetic.mood}</p>
              </div>
              <div className="rounded-2xl bg-secondary/40 p-3 text-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Lighting</p>
                <p className="mt-1">{m.data.aesthetic.lighting}</p>
              </div>
              <div className="rounded-2xl bg-secondary/40 p-3 text-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Music vibe</p>
                <p className="mt-1">{m.data.aesthetic.music_vibe}</p>
              </div>
              <div className="rounded-2xl bg-secondary/40 p-3 text-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Palette</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {m.data.aesthetic.palette.map((c, i) => (
                    <span key={i} className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-secondary/40 p-3 text-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Props at home</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {m.data.aesthetic.props.map((p, i) => (
                  <span key={i} className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <TipCard tip={m.data.shot_list_tip} />
        </section>
      )}
    </div>
  );
}

function TipCard({ tip }: { tip: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card className="rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg font-black">Filming tip</h3>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(tip);
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
      <p className="mt-3 text-sm leading-relaxed">{tip}</p>
    </Card>
  );
}