import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { saveCreatorProfile } from "@/lib/profile.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up — The Blog Mum Studio" }] }),
  component: OnboardingPage,
});

const NICHES = ["Relatable mum", "Aesthetic mum", "Working mum", "Fitness mum", "Crunchy mum", "Budget mum", "Toddler mum", "Newborn mum", "SAHM"];
const PLATFORMS = ["TikTok", "Instagram"];
const FREQ = ["Daily", "Few times a week", "Weekly"];
const WORK = [
  { v: "sahm", l: "SAHM" },
  { v: "wfh", l: "Work from home" },
  { v: "office", l: "Office" },
  { v: "self-employed", l: "Self-employed" },
];

function OnboardingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const save = useServerFn(saveCreatorProfile);

  const [step, setStep] = useState(1);
  const [niches, setNiches] = useState<string[]>([]);
  const [vibe, setVibe] = useState("");
  const [kids, setKids] = useState("");
  const [work, setWork] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [freq, setFreq] = useState("");
  const [knownFor, setKnownFor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const submit = async () => {
    setSubmitting(true);
    try {
      await save({
        data: {
          niches,
          vibe: vibe || undefined,
          kids_ages: kids || undefined,
          work_status: work || undefined,
          platforms: platforms.map((p) => p.toLowerCase()),
          follower_goal: goal ? parseInt(goal, 10) : undefined,
          posting_frequency: freq || undefined,
          known_for: knownFor || undefined,
        },
      });
      toast.success("All set! Let's go.");
      navigate({ to: "/app" });
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-10">
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn("h-1.5 flex-1 rounded-full", s <= step ? "bg-primary" : "bg-secondary")}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h1 className="font-display text-3xl font-black">Your niche & vibe</h1>
          <p className="mt-1 text-muted-foreground">Tap all that feel like you.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNiches((x) => toggle(x, n))}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  niches.includes(n)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-secondary",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <Label htmlFor="vibe" className="mt-6 block">Three words that describe your vibe</Label>
          <Input id="vibe" placeholder="warm, chaotic, real" value={vibe} onChange={(e) => setVibe(e.target.value)} />
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="font-display text-3xl font-black">Your life right now</h1>
          <p className="mt-1 text-muted-foreground">So we make briefs you can actually film today.</p>
          <Label htmlFor="kids" className="mt-6 block">Kids' ages</Label>
          <Input id="kids" placeholder="2 and 5" value={kids} onChange={(e) => setKids(e.target.value)} />

          <Label className="mt-5 block">Work situation</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {WORK.map((w) => (
              <button
                key={w.v}
                type="button"
                onClick={() => setWork(w.v)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm",
                  work === w.v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-secondary",
                )}
              >
                {w.l}
              </button>
            ))}
          </div>

          <Label className="mt-5 block">You post on</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatforms((x) => toggle(x, p))}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm",
                  platforms.includes(p)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-secondary",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="font-display text-3xl font-black">Your goals</h1>
          <p className="mt-1 text-muted-foreground">Last bit, promise.</p>

          <Label htmlFor="goal" className="mt-6 block">Follower goal (optional)</Label>
          <Input id="goal" type="number" placeholder="10000" value={goal} onChange={(e) => setGoal(e.target.value)} />

          <Label className="mt-5 block">How often do you want to post?</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {FREQ.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFreq(f)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm",
                  freq === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-secondary",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <Label htmlFor="known" className="mt-5 block">What do you want to be known for?</Label>
          <Textarea id="known" rows={3} placeholder="Honest mum life, no perfect highlight reels" value={knownFor} onChange={(e) => setKnownFor(e.target.value)} />
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
          Back
        </Button>
        {step < 3 ? (
          <Button className="rounded-full px-6" onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button className="rounded-full px-6" onClick={submit} disabled={submitting}>
            {submitting ? "Saving…" : "Take me in"}
          </Button>
        )}
      </div>
    </div>
  );
}