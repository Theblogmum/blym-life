import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ListOrdered,
  Sparkles,
  Lock,
  Copy,
  Camera,
  Film,
  Layers,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { buildSeries } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/series-builder")({
  component: SeriesBuilderPage,
});

function SeriesBuilderPage() {
  const fn = useServerFn(buildSeries);
  const fetchUsage = useServerFn(getUsageToday);
  const [topic, setTopic] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [pillarFilter, setPillarFilter] = useState<string | null>(null);

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { topic } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
    onSuccess: () => {
      setOpenIdx(0);
      setPillarFilter(null);
    },
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;
  const ready = topic.trim().length > 1;

  const filteredEpisodes = useMemo(() => {
    if (!m.data) return [];
    if (!pillarFilter) return m.data.episodes;
    return m.data.episodes.filter((e) => e.pillar === pillarFilter);
  }, [m.data, pillarFilter]);

  const copyAll = () => {
    if (!m.data) return;
    const text = [
      `${m.data.series_title}`,
      m.data.premise,
      "",
      `Cadence: ${m.data.posting_cadence}`,
      "",
      ...m.data.episodes.map(
        (e) =>
          `#${e.number} — ${e.title} [${e.pillar}]\nHook: ${e.hook}\nFilm: ${e.what_to_film.join(" / ")}\nHow: ${e.how_to_film}\nCaption: ${e.caption}\nCTA: ${e.cta}\n`,
      ),
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Whole series copied!");
  };

  return (
    <div>
      <PageHero
        icon={ListOrdered}
        eyebrow="Content Series Builder"
        title="A whole month of content. Done."
        description="Tell us a niche or topic. Get a named series, recurring themes, content pillars and 30 fully briefed episodes — hook, what to film, how to film it, caption and CTA."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              Your series
            </p>
          </div>
          <div className="grid gap-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Niche or topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. fussy eater dinners, postpartum fitness, real motherhood diaries"
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
                {m.isPending ? "Plotting 30 episodes…" : "Build my 30-part series"}
              </Button>
              <p className="mt-2 text-xs text-foreground/60">
                This one takes ~30 seconds — we're writing 30 full briefs.
              </p>
            </div>
            {locked && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Trial ended. Series Builder is a Premium tool.
                </p>
                <Link to="/settings">
                  <Button size="sm" className="rounded-full">Upgrade</Button>
                </Link>
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
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Series</p>
                <h2 className="mt-1 font-display text-2xl font-black leading-tight">
                  {m.data.series_title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">{m.data.premise}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                  <CalendarDays className="h-3.5 w-3.5" /> {m.data.posting_cadence}
                </p>
              </div>
              <button
                onClick={copyAll}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:bg-primary hover:text-primary-foreground"
                aria-label="Copy whole series"
                title="Copy whole series"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </Card>

          <Card className="rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-black">Content pillars</h3>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {m.data.pillars.map((p, i) => (
                <li key={i} className="rounded-2xl bg-secondary/40 p-3 text-sm">
                  <p className="font-semibold">{p.name}</p>
                  <p className="mt-1 text-foreground/70">{p.purpose}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-3xl p-5">
            <h3 className="font-display text-lg font-black">Recurring themes</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {m.data.recurring_themes.map((t, i) => (
                <span key={i} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold">
                  {t}
                </span>
              ))}
            </div>
          </Card>

          <Card className="rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-black">
                  Episodes ({filteredEpisodes.length}/30)
                </h3>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setPillarFilter(null)}
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  pillarFilter === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground/70"
                }`}
              >
                All
              </button>
              {m.data.pillars.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPillarFilter(p.name)}
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    pillarFilter === p.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground/70"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <ol className="mt-4 space-y-2">
              {filteredEpisodes.map((e, i) => {
                const open = openIdx === i;
                return (
                  <li key={`${e.number}-${i}`} className="rounded-2xl bg-secondary/40">
                    <button
                      onClick={() => setOpenIdx(open ? null : i)}
                      className="flex w-full items-center gap-3 p-3 text-left"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground tabular-nums">
                        {e.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{e.title}</p>
                        <p className="truncate text-xs text-foreground/60">{e.pillar}</p>
                      </div>
                      {open ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-foreground/60" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-foreground/60" />
                      )}
                    </button>
                    {open && (
                      <div className="space-y-3 border-t border-border/40 p-4 text-sm">
                        <Field label="Hook">{e.hook}</Field>
                        <div>
                          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/60">
                            <Camera className="h-3 w-3" /> What to film
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {e.what_to_film.map((s, j) => (
                              <li key={j} className="flex gap-2">
                                <span className="text-primary">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Field label="How to film it">{e.how_to_film}</Field>
                        <Field label="Caption">{e.caption}</Field>
                        <Field label="CTA">{e.cta}</Field>
                        <button
                          onClick={() => {
                            const text = `${e.title}\n\nHook: ${e.hook}\n\nWhat to film:\n- ${e.what_to_film.join(
                              "\n- ",
                            )}\n\nHow to film: ${e.how_to_film}\n\nCaption: ${e.caption}\n\nCTA: ${e.cta}`;
                            navigator.clipboard.writeText(text);
                            toast.success("Episode copied!");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground"
                        >
                          <Copy className="h-3 w-3" /> Copy episode
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </Card>
        </section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">{label}</p>
      <p className="mt-1 leading-relaxed">{children}</p>
    </div>
  );
}