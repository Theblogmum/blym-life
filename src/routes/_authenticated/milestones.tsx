import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Lock, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/milestones")({ component: MilestonesPage });

type Milestone = {
  id: string;
  emoji: string;
  title: string;
  hint: string;
  glow: string;
};

const MILESTONES: Milestone[] = [
  { id: "first-post",   emoji: "📱", title: "posted for the first time",        hint: "the scariest one. proud of you.",         glow: "oklch(0.74 0.18 15)"  },
  { id: "week-streak",  emoji: "🔥", title: "7 days in a row",                  hint: "you're building the muscle.",             glow: "oklch(0.78 0.18 45)"  },
  { id: "first-100",    emoji: "🌱", title: "first 100 followers",              hint: "real humans chose you.",                  glow: "oklch(0.74 0.16 150)" },
  { id: "first-viral",  emoji: "🚀", title: "first 1k-view post",               hint: "the algorithm noticed bestie.",           glow: "oklch(0.72 0.18 225)" },
  { id: "first-pitch",  emoji: "💌", title: "sent your first brand pitch",      hint: "even if they say no, you did the thing.", glow: "oklch(0.74 0.16 340)" },
  { id: "first-paid",   emoji: "💸", title: "first paid collab",                hint: "this one we frame. life-changing.",       glow: "oklch(0.72 0.16 320)" },
  { id: "first-1k",     emoji: "👑", title: "made your first £1,000",           hint: "you turned posting into income.",         glow: "oklch(0.7 0.18 295)"  },
  { id: "ten-k",        emoji: "🏆", title: "10,000 followers",                 hint: "officially a creator. it's your job now.", glow: "oklch(0.78 0.16 85)" },
];

const KEY = "blym.milestones";

function MilestonesPage() {
  const [done, setDone] = useState<Record<string, string>>({});
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {}
  }, []);
  const toggle = (m: Milestone) => {
    const next = { ...done };
    if (next[m.id]) { delete next[m.id]; }
    else {
      next[m.id] = new Date().toISOString();
      toast.success(`${m.emoji} ${m.title}`, { description: "logged forever. so proud of you." });
    }
    setDone(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const count = Object.keys(done).length;

  return (
    <div>
      <PageHero
        icon={Crown}
        eyebrow="Your firsts"
        title="the big scary firsts 💛"
        description="tick them off when they happen. no pressure on timing. these are the moments that change everything."
        variant="blush"
      >
        <span className="chip-soft">✨ {count} / {MILESTONES.length} unlocked</span>
      </PageHero>
      <section className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
        <div className="space-y-3">
          {MILESTONES.map((m) => {
            const did = !!done[m.id];
            return (
              <button
                key={m.id}
                onClick={() => toggle(m)}
                className={cn(
                  "group relative flex w-full items-center gap-4 overflow-hidden rounded-[1.4rem] p-4 text-left transition-all duration-500 hover:-translate-y-[2px]",
                  did
                    ? "bg-white/85 backdrop-blur-sm ring-1 ring-white/60"
                    : "bg-foreground/[0.025] ring-1 ring-foreground/[0.06] hover:bg-foreground/[0.04]",
                )}
                style={
                  did
                    ? { boxShadow: `inset 0 1px 0 oklch(1 0 0 / 0.7), 0 1px 2px oklch(0.13 0.012 20 / 0.05), 0 14px 30px -16px ${m.glow}` }
                    : undefined
                }
              >
                {did && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -left-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
                    style={{ background: m.glow }}
                  />
                )}
                <div
                  className={cn(
                    "relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl transition-transform duration-500",
                    did
                      ? "bg-white shadow-[0_8px_22px_-10px_var(--ms-glow)] group-hover:scale-110 group-hover:-rotate-[6deg]"
                      : "bg-foreground/[0.04]",
                  )}
                  style={did ? ({ ["--ms-glow" as any]: m.glow } as React.CSSProperties) : undefined}
                >
                  {did ? m.emoji : <Lock className="h-5 w-5 text-foreground/35" />}
                </div>
                <div className="relative min-w-0 flex-1">
                  <h3 className={cn("font-display text-[16px] font-bold tracking-[-0.01em]", !did && "text-foreground/55")}>{m.title}</h3>
                  <p className="mt-0.5 text-[12.5px] text-foreground/65">{m.hint}</p>
                  {did && <p className="mt-1 text-[11px] font-semibold text-[oklch(0.5_0.14_150)]">logged {new Date(done[m.id]).toLocaleDateString()}</p>}
                </div>
                <div
                  className={cn(
                    "relative grid h-9 w-9 place-items-center rounded-full transition-all duration-300",
                    did
                      ? "bg-[oklch(0.6_0.16_150)] text-white shadow-[0_4px_14px_-4px_oklch(0.6_0.16_150/0.5)]"
                      : "bg-foreground/[0.05] text-foreground/40",
                  )}
                >
                  {did ? <Check className="h-4 w-4" strokeWidth={3} /> : <Sparkles className="h-3.5 w-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
