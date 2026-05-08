import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Folder, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { recycleClip } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "10 sec of toddler dropping cereal everywhere, me sighing",
  "Quick clip of me folding endless laundry on the sofa",
  "Pram walk through the park, autumn leaves",
];

export const Route = createFileRoute("/_authenticated/recycler")({
  component: RecyclerPage,
});

function RecyclerPage() {
  const fn = useServerFn(recycleClip);
  const fetchUsage = useServerFn(getUsageToday);
  const [desc, setDesc] = useState("");
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { description: desc } }),
    onSuccess: () => usage.refetch(),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const ideas = Array.isArray(m.data?.ideas) ? m.data.ideas : [];
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const isCaptionPage = false;
  const outOfQuota = !premium && !inTrial && !isCaptionPage;

  return (
    <div>
      <PageHero
        icon={Folder}
        eyebrow="Clip Recycler"
        title="One clip. Five posts. Zero re-filming."
        description="Describe footage you've already filmed — we'll spin it into 5 totally different post angles."
        variant="mint"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} freeAllowed={isCaptionPage} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              Describe the clip
            </p>
          </div>
          <div className="space-y-4 p-6">
            <Textarea
              rows={5}
              placeholder="The more detail, the better the ideas — what happens, the vibe, who's in it."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="rounded-2xl bg-secondary/40 text-base"
            />
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((t) => (
                <button
                  key={t}
                  onClick={() => setDesc(t)}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground/70 hover:bg-secondary/70"
                >
                  {t}
                </button>
              ))}
            </div>
            <Button
              size="lg"
              className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
              disabled={!desc.trim() || m.isPending || outOfQuota}
              onClick={() => m.mutate()}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {m.isPending ? "Brainstorming…" : "Get 5 fresh ideas"}
            </Button>
            {outOfQuota && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-peach p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Your 3-day trial has ended. Upgrade to keep using Recycler.
                </p>
                <Link to="/settings">
                  <Button size="sm" className="rounded-full">
                    Go unlimited
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {ideas.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-16">
          <h2 className="mb-4 font-display text-2xl font-black">5 ways to post it</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {ideas.map((i, idx) => {
              const surface = ["surface-peach", "surface-mint", "surface-sky", "surface-plum", "surface-butter"][idx % 5];
              return (
                <Card
                  key={idx}
                  className={cn(
                    "rounded-3xl border-0 p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5",
                    surface,
                  )}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/60">
                    Idea {idx + 1}
                  </p>
                  <p className="mt-1 font-display text-xl font-black leading-tight">
                    {i.title}
                  </p>
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">Hook:</span> "{i.hook}"
                  </p>
                  <p className="mt-2 text-sm text-foreground/80">{i.angle}</p>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
