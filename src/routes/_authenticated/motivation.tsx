import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Sunrise, Lightbulb, Heart, NotebookPen, ScrollText, RefreshCw, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { dailyMotivation } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/motivation")({ component: Page });

const MOOD_CLASS = [
  "mood-sunday",
  "mood-monday",
  "mood-tuesday",
  "mood-wednesday",
  "mood-thursday",
  "mood-friday",
  "mood-saturday",
] as const;

const FAVES_KEY = "blym.pep.favourites.v1";
function loadFaves(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(FAVES_KEY) ?? "[]"); } catch { return []; }
}
function saveFaves(list: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVES_KEY, JSON.stringify(list));
}

function Page() {
  const fn = useServerFn(dailyMotivation);
  const fetchUsage = useServerFn(getUsageToday);
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const q = useQuery({ queryKey: ["motivation", new Date().toISOString().slice(0, 10)], queryFn: () => fn() });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const moodClass = MOOD_CLASS[new Date().getDay()];
  const [faves, setFaves] = useState<string[]>([]);
  useEffect(() => { setFaves(loadFaves()); }, []);
  const toggleFave = (key: string, body: string) => {
    setFaves((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      saveFaves(next);
      toast.success(prev.includes(key) ? "Removed from saved" : "Saved to your pocket 💛", { description: body.slice(0, 80) });
      return next;
    });
  };
  return (
    <div>
      <PageHero icon={Sunrise} eyebrow="Daily motivation" title="A small lift, every day." description="One affirmation, one truth, one tiny action, one journal prompt, one permission slip — refreshed for today." variant="sunrise">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} freeAllowed />
      </PageHero>
      <section className="mx-auto max-w-3xl space-y-4 px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <Button variant="outline" size="sm" className="group rounded-full transition hover:-translate-y-[1px]" disabled={q.isFetching} onClick={() => q.refetch()}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 transition-transform group-hover:rotate-180 ${q.isFetching ? "animate-spin" : ""}`} /> New prompt
          </Button>
        </div>
        {q.isLoading && (
          <div className="premium-card p-12 text-center text-[13px] text-muted-foreground/90">
            <Sparkles className="mx-auto mb-2 h-5 w-5 breathe text-primary" />
            Brewing your prompt with love…
          </div>
        )}
        {q.data && (
          <div className="stagger space-y-3.5">
            <div className="card-pop" style={{ ["--i" as string]: 0 }}>
              <Block icon={Heart} label="Today's affirmation" body={q.data.affirmation} tone="warm" big moodClass={moodClass} faved={faves.includes("affirmation:" + q.data.affirmation)} onFave={() => toggleFave("affirmation:" + q.data.affirmation, q.data.affirmation)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5">
              <div className="card-pop" style={{ ["--i" as string]: 1 }}>
                <Block icon={Lightbulb} label="Truth bomb" body={q.data.truth_bomb} faved={faves.includes("truth:" + q.data.truth_bomb)} onFave={() => toggleFave("truth:" + q.data.truth_bomb, q.data.truth_bomb)} />
              </div>
              <div className="card-pop" style={{ ["--i" as string]: 2 }}>
                <Block icon={Sparkles} label="Tiny action (under 5 min)" body={q.data.tiny_action} faved={faves.includes("action:" + q.data.tiny_action)} onFave={() => toggleFave("action:" + q.data.tiny_action, q.data.tiny_action)} />
              </div>
              <div className="card-pop" style={{ ["--i" as string]: 3 }}>
                <Block icon={NotebookPen} label="Journal prompt" body={q.data.journal_prompt} faved={faves.includes("journal:" + q.data.journal_prompt)} onFave={() => toggleFave("journal:" + q.data.journal_prompt, q.data.journal_prompt)} />
              </div>
              <div className="card-pop" style={{ ["--i" as string]: 4 }}>
                <Block icon={ScrollText} label="Permission slip" body={q.data.permission_slip} faved={faves.includes("permission:" + q.data.permission_slip)} onFave={() => toggleFave("permission:" + q.data.permission_slip, q.data.permission_slip)} />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Block({ icon: Icon, label, body, big, tone, moodClass, faved, onFave }: { icon: typeof Heart; label: string; body: string; big?: boolean; tone?: "warm"; moodClass?: string; faved?: boolean; onFave?: () => void }) {
  const isWarm = tone === "warm";
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all duration-500 ease-out hover:-translate-y-[3px] hover:shadow-[var(--shadow-elegant)] ${
        isWarm
          ? `border border-white/20 text-white shadow-[var(--shadow-layered)] ${moodClass ?? ""}`
          : "premium-card"
      }`}
    >
      {isWarm && (
        <>
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
        </>
      )}
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`icon-tile h-8 w-8 ${isWarm ? "bg-white/30 text-white" : "bg-white/75 text-primary"}`}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isWarm ? "text-white/85" : "text-foreground/55"}`}>{label}</p>
        </div>
        {onFave && (
          <button
            onClick={onFave}
            aria-label={faved ? "Remove from saved" : "Save for later"}
            className={`grid h-8 w-8 place-items-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${
              isWarm ? "bg-white/25 text-white hover:bg-white/40" : "bg-secondary/60 text-foreground/60 hover:bg-primary/15 hover:text-primary"
            } ${faved ? "save-flash" : ""}`}
          >
            {faved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        )}
      </div>
      <p className={`relative mt-3 ${big ? "font-display text-[24px] font-bold leading-[1.15] tracking-[-0.018em] sm:text-[30px]" : "text-[14px] leading-relaxed text-foreground/90"}`}>{body}</p>
    </div>
  );
}