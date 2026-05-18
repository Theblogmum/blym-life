import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Sparkles, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/feed")({ component: FeedPage });

type Post = {
  id: string;
  who: string;
  emoji: string;
  what: string;
  when: string;
  tint: string;
  cheers: number;
};

const SEED: Post[] = [
  { id: "1", who: "lana 🌷", emoji: "🔥", what: "posted day 14 in a row even tho i felt like trash", when: "2m", tint: "var(--surface-rose)", cheers: 42 },
  { id: "2", who: "mum-of-3-mode", emoji: "💼", what: "sent my FIRST EVER brand pitch help me i'm shaking", when: "11m", tint: "var(--surface-butter)", cheers: 88 },
  { id: "3", who: "soft.era.amy", emoji: "✨", what: "hit 100 followers and i cried in the car park", when: "26m", tint: "var(--surface-mint)", cheers: 134 },
  { id: "4", who: "becca.tries", emoji: "🎬", what: "filmed 3 reels in 20 mins and now i'm taking a nap", when: "44m", tint: "var(--surface-sky)", cheers: 27 },
  { id: "5", who: "tasha rebuilds", emoji: "💌", what: "got my first paid collab £50 but it's mine", when: "1h", tint: "var(--surface-plum)", cheers: 201 },
  { id: "6", who: "quietly.kate", emoji: "🫶", what: "posted thru anxiety. didn't delete it. growth.", when: "2h", tint: "var(--surface-blush)", cheers: 73 },
];

const KEY = "blym.feed.cheers";

function FeedPage() {
  const [cheered, setCheered] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try { setCheered(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {}
  }, []);
  const cheer = (id: string) => {
    const next = { ...cheered, [id]: !cheered[id] };
    setCheered(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="sticker mb-6 p-6" style={{ background: "var(--gradient-sunrise)" }}>
        <p className="eyebrow">the wins wall</p>
        <h1 className="mt-2 font-display text-3xl">tiny wins from the community 💛</h1>
        <p className="mt-2 text-muted-foreground">no metrics. no flexing. just real little wins from other women doing the scary thing.</p>
      </div>

      <div className="space-y-4">
        {SEED.map((p) => {
          const did = !!cheered[p.id];
          const count = p.cheers + (did ? 1 : 0);
          return (
            <article key={p.id} className="sticker p-5" style={{ background: p.tint }}>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-foreground bg-card text-xl shadow-[0_3px_0_0_var(--foreground)]">
                  {p.emoji}
                </div>
                <div>
                  <p className="font-display text-base">{p.who}</p>
                  <p className="text-xs text-muted-foreground">{p.when} ago</p>
                </div>
              </div>
              <p className="mt-3 text-base leading-snug">{p.what}</p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => cheer(p.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-card px-3 py-1 text-sm font-bold shadow-[0_2px_0_0_var(--foreground)] transition-transform active:translate-y-0.5 active:shadow-none",
                    did && "bg-primary text-primary-foreground",
                  )}
                >
                  <Heart className={cn("h-4 w-4", did && "fill-current")} /> {count}
                </button>
                <button className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-card px-3 py-1 text-sm font-bold shadow-[0_2px_0_0_var(--foreground)]">
                  <MessageCircle className="h-4 w-4" /> hype her
                </button>
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" /> +5 XP for showing up
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">posting your own win is coming soon 💌</p>
    </div>
  );
}
