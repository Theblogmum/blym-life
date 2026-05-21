import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IdCard, Sparkles, Lock, Copy, Check, Link as LinkIcon, Tag } from "lucide-react";
import { toast } from "sonner";
import { optimiseBio } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/bio-optimiser")({
  component: BioOptimiserPage,
});

type Platform = "instagram" | "tiktok";
const PLATFORMS: { id: Platform; label: string; limit: number }[] = [
  { id: "instagram", label: "Instagram", limit: 150 },
  { id: "tiktok", label: "TikTok", limit: 80 },
];
const STYLE_TONE: Record<string, string> = {
  clear: "bg-primary text-primary-foreground",
  playful: "bg-amber-100 text-amber-900",
  bold: "bg-rose-100 text-rose-900",
};

function BioOptimiserPage() {
  const fn = useServerFn(optimiseBio);
  const fetchUsage = useServerFn(getUsageToday);
  const [bio, setBio] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [goal, setGoal] = useState("");

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { current_bio: bio, platform, goal } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;
  const ready = bio.trim().length > 5 && goal.trim().length > 1;
  const limit = PLATFORMS.find((p) => p.id === platform)?.limit ?? 150;

  return (
    <div>
      <PageHero
        icon={IdCard}
        eyebrow="Bio Optimiser"
        title="Your bio decides if they follow."
        description="Paste your current bio, pick a platform and a goal. Get a clarity score, what's missing, target keywords and 3 ready-to-paste rewrites."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-6">
        <Card glow className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">Your bio</p>
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
                    {p.label} <span className="opacity-70">· {p.limit}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Current bio</Label>
              <Textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Paste your bio exactly as it reads"
                maxLength={500}
                className="rounded-xl bg-secondary/40"
              />
              <p className="text-xs text-foreground/60">{bio.length} / {limit} for {platform}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal">Goal of your bio</Label>
              <Input
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. get email signups for weaning guide / drive UGC enquiries"
                maxLength={200}
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
                {m.isPending ? "Polishing your bio…" : "Optimise my bio"}
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Diagnosis</p>
                <p className="mt-2 text-sm leading-relaxed">{m.data.diagnosis}</p>
              </div>
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-secondary text-center">
                <div>
                  <div className="text-xl font-black tabular-nums">{m.data.score}</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">/10</div>
                </div>
              </div>
            </div>
          </Card>

          <Card glow className="rounded-3xl p-5">
            <h3 className="font-display text-lg font-black">What's missing</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {m.data.missing.map((it, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-3">{it}</li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Target keywords</h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.data.keywords.map((k, i) => (
                <span key={i} className="rounded-full bg-secondary/60 px-3 py-1.5 text-sm font-semibold">{k}</span>
              ))}
            </div>
          </Card>

          {m.data.options.map((o, i) => (
            <BioOption key={i} style={o.style} bio={o.bio} limit={limit} />
          ))}

          <Card glow className="rounded-3xl p-5">
            <h3 className="font-display text-lg font-black">Searchable name field</h3>
            <p className="text-xs text-foreground/60">The IG/TikTok name field is searchable — load it with keywords.</p>
            <ul className="mt-3 space-y-2 text-sm">
              {m.data.name_suggestions.map((n, i) => (
                <li key={i} className="flex items-center justify-between gap-2 rounded-2xl bg-secondary/40 p-3">
                  <span>{n}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(n); toast.success("Copied!"); }}
                    className="grid h-7 w-7 place-items-center rounded-full bg-background text-foreground/60 hover:bg-primary hover:text-primary-foreground"
                    aria-label="Copy"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Link-in-bio advice</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{m.data.link_advice}</p>
          </Card>
        </section>
      )}
    </div>
  );
}

function BioOption({ style, bio, limit }: { style: string; bio: string; limit: number }) {
  const [copied, setCopied] = useState(false);
  const overLimit = bio.length > limit;
  return (
    <Card glow className="rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STYLE_TONE[style] ?? STYLE_TONE.clear}`}>
          {style}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(bio);
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
      <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed">{bio}</p>
      <p className={`mt-2 text-xs ${overLimit ? "text-rose-600" : "text-foreground/60"}`}>
        {bio.length} / {limit}{overLimit ? " — over the limit" : ""}
      </p>
    </Card>
  );
}