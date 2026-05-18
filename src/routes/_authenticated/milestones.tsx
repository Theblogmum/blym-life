import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/milestones")({ component: MilestonesPage });

type Milestone = {
  id: string;
  emoji: string;
  title: string;
  hint: string;
  tint: string;
};

const MILESTONES: Milestone[] = [
  { id: "first-post", emoji: "📱", title: "posted for the first time", hint: "the scariest one. proud of you.", tint: "var(--surface-rose)" },
  { id: "week-streak", emoji: "🔥", title: "7 days in a row", hint: "you're building the muscle.", tint: "var(--surface-butter)" },
  { id: "first-100", emoji: "🌱", title: "first 100 followers", hint: "real humans chose you.", tint: "var(--surface-mint)" },
  { id: "first-viral", emoji: "🚀", title: "first 1k-view post", hint: "the algorithm noticed bestie.", tint: "var(--surface-sky)" },
  { id: "first-pitch", emoji: "💌", title: "sent your first brand pitch", hint: "even if they say no, you did the thing.", tint: "var(--surface-blush)" },
  { id: "first-paid", emoji: "💸", title: "first paid collab", hint: "this one we frame. life-changing.", tint: "var(--surface-plum)" },
  { id: "first-1k", emoji: "👑", title: "made your first £1,000", hint: "you turned posting into income.", tint: "var(--surface-grape)" },
  { id: "ten-k", emoji: "🏆", title: "10,000 followers", hint: "officially a creator. it's your job now.", tint: "var(--surface-rose)" },
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="sticker mb-8 p-6 sm:p-7" style={{ background: "var(--gradient-sunrise)" }}>
        <p className="eyebrow">your firsts</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">the big scary firsts 💛</h1>
        <p className="mt-2 text-muted-foreground">tick them off when they happen. no pressure on timing. these are the moments that change everything.</p>
        <div className="mt-4 flex gap-2">
          <span className="streak-chip">✨ {count} / {MILESTONES.length} unlocked</span>
        </div>
      </div>

      <div className="space-y-3">
        {MILESTONES.map((m) => {
          const did = !!done[m.id];
          return (
            <button
              key={m.id}
              onClick={() => toggle(m)}
              className={cn(
                "sticker w-full p-4 text-left flex items-center gap-4 transition-transform hover:-translate-y-0.5",
              )}
              style={did ? { background: m.tint } : undefined}
            >
              <div className={cn(
                "grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-foreground bg-card text-2xl shadow-[0_3px_0_0_var(--foreground)]",
                did && "bounce-in",
              )}>
                {did ? m.emoji : <Lock className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn("font-display text-lg", !did && "text-muted-foreground")}>{m.title}</h3>
                <p className="text-xs text-foreground/70">{m.hint}</p>
                {did && <p className="mt-1 text-[11px] text-success font-bold">logged {new Date(done[m.id]).toLocaleDateString()}</p>}
              </div>
              <div className={cn(
                "grid h-8 w-8 place-items-center rounded-full border-2 border-foreground",
                did ? "bg-success text-white" : "bg-card",
              )}>
                {did ? <Check className="h-4 w-4" /> : <Sparkles className="h-3 w-3 text-muted-foreground" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
