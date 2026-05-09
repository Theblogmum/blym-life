import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Copy, Check, Sparkles, Lock, MessageCircle, Reply } from "lucide-react";
import { toast } from "sonner";
import { generatePitch } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

const TONES = ["Warm & friendly", "Confident & direct", "Playful", "Professional"];
const PLATFORMS = ["Instagram DM", "TikTok DM", "Email"];

export const Route = createFileRoute("/_authenticated/pitch-generator")({
  component: PitchGeneratorPage,
});

function PitchGeneratorPage() {
  const fn = useServerFn(generatePitch);
  const fetchUsage = useServerFn(getUsageToday);
  const [brand, setBrand] = useState("");
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { brand, niche, tone, platform } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;
  const ready = brand.trim() && niche.trim();

  return (
    <div>
      <PageHero
        icon={Mail}
        eyebrow="AI Pitch Generator"
        title="Pitch any brand. In your voice."
        description="Tell us the brand, your niche, the tone and where you'll send it. We'll write the email, the DM, the follow-up and 4 subject lines."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              Pitch details
            </p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Ella's Kitchen"
                maxLength={80}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="niche">Your niche</Label>
              <Input
                id="niche"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. weaning + toddler meals"
                maxLength={120}
                className="rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <div className="flex flex-wrap gap-1.5">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      tone === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground/70 hover:bg-secondary/70"
                    }`}
                  >
                    {t}
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
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      platform === p
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground/70 hover:bg-secondary/70"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button
                size="lg"
                className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
                disabled={!ready || m.isPending || locked}
                onClick={() => m.mutate()}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {m.isPending ? "Writing your pitch pack…" : "Generate pitch pack"}
              </Button>
            </div>
            {locked && (
              <div className="sm:col-span-2 flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Trial ended. Pitch Generator is a Premium tool.
                </p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <h2 className="font-display text-2xl font-black">Your pitch pack</h2>

          <Card className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Subject lines</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {m.data.email_subject_lines.map((s, i) => (
                <li key={i} className="flex items-start justify-between gap-3 rounded-2xl bg-secondary/40 p-3 text-sm">
                  <span className="flex-1">{s}</span>
                  <CopyBtn text={s} />
                </li>
              ))}
            </ul>
          </Card>

          <ResultCard icon={Mail} title="Email pitch" body={m.data.email_pitch} />
          <ResultCard icon={MessageCircle} title={`${platform} pitch`} body={m.data.dm_pitch} />
          <ResultCard icon={Reply} title="Follow-up message" body={m.data.follow_up} />
        </section>
      )}
    </div>
  );
}

function ResultCard({ icon: Icon, title, body }: { icon: typeof Mail; title: string; body: string }) {
  return (
    <Card className="rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg font-black">{title}</h3>
        </div>
        <CopyBtn text={body} />
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
    </Card>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied!");
        setTimeout(() => setCopied(false), 1500);
      }}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:bg-primary hover:text-primary-foreground"
      aria-label="Copy"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}
