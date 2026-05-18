import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Sparkles, MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/page-hero";

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
    <div>
      <PageHero
        icon={Users}
        eyebrow="The wins wall"
        title="tiny wins from the community 💛"
        description="no metrics. no flexing. just real little wins from other women doing the scary thing."
        variant="sunrise"
      />
      <section className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
        <div className="space-y-4">
          {SEED.map((p) => {
            const did = !!cheered[p.id];
            const count = p.cheers + (did ? 1 : 0);
            return (
              <article
                key={p.id}
                className="relative overflow-hidden rounded-[1.6rem] p-5 transition-all duration-500 hover:-translate-y-[2px]"
                style={{
                  background: `color-mix(in oklab, ${p.tint} 72%, oklch(1 0 0))`,
                  boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.6), 0 1px 2px oklch(0.13 0.012 20 / 0.04), 0 14px 32px -18px oklch(0.13 0.012 20 / 0.16)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/85 text-xl ring-1 ring-white/60 shadow-[0_4px_12px_-6px_oklch(0.13_0.012_20/0.18)]">
                    {p.emoji}
                  </div>
                  <div>
                    <p className="font-display text-[15px] font-semibold tracking-[-0.005em]">{p.who}</p>
                    <p className="text-[11.5px] text-muted-foreground">{p.when} ago</p>
                  </div>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">{p.what}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => cheer(p.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-all duration-300 active:scale-95",
                      did
                        ? "bg-foreground text-background shadow-[0_6px_18px_-8px_oklch(0.13_0.012_20/0.4)]"
                        : "bg-white/75 text-foreground/80 ring-1 ring-white/60 hover:bg-white",
                    )}
                  >
                    <Heart className={cn("h-3.5 w-3.5", did && "fill-current")} /> {count}
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-[12.5px] font-semibold text-foreground/75 ring-1 ring-white/60 hover:bg-white">
                    <MessageCircle className="h-3.5 w-3.5" /> hype her
                  </button>
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-foreground/55">
                    <Sparkles className="h-3 w-3" /> +5 XP for showing up
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[12px] text-muted-foreground">posting your own win is coming soon 💌</p>
      </section>
    </div>
  );
}
