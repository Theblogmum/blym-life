import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/creator-type")({ component: CreatorTypePage });

type Type = {
  id: string;
  emoji: string;
  title: string;
  vibe: string;
  power: string;
  tint: string;
};

const TYPES: Type[] = [
  { id: "storyteller", emoji: "📖", title: "The Storyteller", vibe: "long captions, soft voice, deep dives", power: "+10% on carousel & blog ideas", tint: "var(--surface-rose)" },
  { id: "entertainer", emoji: "🎬", title: "The Entertainer", vibe: "skits, trends, chaotic edits", power: "+10% on hook lab & viral lab", tint: "var(--surface-butter)" },
  { id: "teacher", emoji: "🧠", title: "The Teacher", vibe: "tips, how-tos, value bombs", power: "+10% on SEO & series builder", tint: "var(--surface-mint)" },
  { id: "aesthete", emoji: "🌸", title: "The Aesthete", vibe: "moodboards, soft lifestyle, vibes", power: "+10% on moodboards & b-roll", tint: "var(--surface-blush)" },
  { id: "hustler", emoji: "💼", title: "The Hustler", vibe: "money talk, brand deals, business", power: "+10% on pitches & income", tint: "var(--surface-plum)" },
  { id: "softie", emoji: "🫶", title: "The Soft Mum Era", vibe: "real life, slow days, honesty", power: "+10% on motivation & pep talks", tint: "var(--surface-sky)" },
];

const KEY = "blym.creatorType";

function CreatorTypePage() {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => { setPicked(localStorage.getItem(KEY)); }, []);

  const choose = (t: Type) => {
    localStorage.setItem(KEY, t.id);
    setPicked(t.id);
    toast.success(`${t.emoji} you're a ${t.title}`, { description: t.power });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="sticker mb-8 p-6 sm:p-7" style={{ background: "var(--gradient-sunrise)" }}>
        <p className="eyebrow">choose your character</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">what kind of creator are you? 🎮</h1>
        <p className="mt-2 text-muted-foreground">pick the vibe that feels most like you. your tools will tune themselves around it. (you can change anytime, no pressure bestie)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TYPES.map((t) => {
          const selected = picked === t.id;
          return (
            <button
              key={t.id}
              onClick={() => choose(t)}
              className={cn(
                "sticker p-5 text-left transition-transform hover:-translate-y-1",
                selected && "ring-4 ring-primary",
              )}
              style={{ background: t.tint }}
            >
              <div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-foreground bg-card text-3xl shadow-[0_4px_0_0_var(--foreground)]">
                {t.emoji}
              </div>
              <h3 className="mt-3 font-display text-xl">{t.title}</h3>
              <p className="mt-1 text-sm text-foreground/80">{t.vibe}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                <Sparkles className="h-3 w-3" /> {t.power}
              </p>
              {selected && <p className="mt-2 text-xs font-bold text-success">✓ that's you</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
