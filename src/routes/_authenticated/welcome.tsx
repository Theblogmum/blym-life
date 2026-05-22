import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NotifyOptIn } from "@/components/notify-opt-in";

export const Route = createFileRoute("/_authenticated/welcome")({ component: WelcomePage });

const AVATARS = ["🌸","🦋","🍓","🌙","🔥","💖","✨","🍯","🌷","🪩","🧸","🌻"];

const TYPES = [
  { id: "storyteller", emoji: "📖", title: "The Storyteller", vibe: "long captions, soft voice, deep dives", tint: "var(--surface-rose)" },
  { id: "entertainer", emoji: "🎬", title: "The Entertainer", vibe: "skits, trends, chaotic edits", tint: "var(--surface-butter)" },
  { id: "teacher",     emoji: "🧠", title: "The Teacher",     vibe: "tips, how-tos, value bombs", tint: "var(--surface-mint)" },
  { id: "aesthete",    emoji: "🌸", title: "The Aesthete",    vibe: "moodboards, soft lifestyle", tint: "var(--surface-blush)" },
  { id: "hustler",     emoji: "💼", title: "The Hustler",     vibe: "money talk, brand deals", tint: "var(--surface-plum)" },
  { id: "softie",      emoji: "🫶", title: "The Soft Mum Era", vibe: "real life, slow days, honest", tint: "var(--surface-sky)" },
];

const GOALS = [
  { id: "consistent", emoji: "🌱", title: "just be consistent", sub: "show up, no pressure on numbers" },
  { id: "first-1k",   emoji: "🚀", title: "hit my first 1k followers", sub: "build a real little community" },
  { id: "paid",       emoji: "💸", title: "get paid in 90 days", sub: "first collab, first invoice, first £" },
  { id: "rebuild",    emoji: "🌷", title: "rebuild my confidence", sub: "post through the fear era" },
];

const ERAS = [
  { id: "soft",  emoji: "🫧", title: "soft girl era",  tint: "var(--surface-blush)" },
  { id: "hot",   emoji: "💋", title: "hot girl era",   tint: "var(--surface-rose)" },
  { id: "mum",   emoji: "🍼", title: "mum-of-chaos era", tint: "var(--surface-butter)" },
  { id: "boss",  emoji: "👑", title: "ceo era",        tint: "var(--surface-plum)" },
  { id: "quiet", emoji: "🌙", title: "quiet rebuild era", tint: "var(--surface-sky)" },
  { id: "main",  emoji: "✨", title: "main character era", tint: "var(--surface-grape)" },
];

type State = { avatar?: string; type?: string; goal?: string; era?: string };

function WelcomePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [s, setS] = useState<State>({});

  const finish = () => {
    localStorage.setItem("blym.creatorType", s.type ?? "");
    localStorage.setItem("blym.goal", s.goal ?? "");
    localStorage.setItem("blym.avatar", s.avatar ?? "🌸");
    localStorage.setItem("blym.era", s.era ?? "soft");
    localStorage.setItem("blym.onboarded", "1");
    toast.success("welcome to BLYM bestie 💛", { description: "your journey just unlocked." });
    navigate({ to: "/quests" });
  };

  const steps = [
    {
      eyebrow: "step 1 of 5",
      title: "hi bestie, what should we call you?",
      sub: "pick your character. (you can change it anytime, no pressure)",
      content: (
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {AVATARS.map((a) => (
            <button key={a} onClick={() => setS({ ...s, avatar: a })}
              className={cn(
                "sticker aspect-square grid place-items-center text-2xl sm:text-3xl transition-transform hover:-translate-y-1",
                s.avatar === a && "ring-4 ring-primary",
              )}>
              {a}
            </button>
          ))}
        </div>
      ),
      canNext: !!s.avatar,
    },
    {
      eyebrow: "step 2 of 5",
      title: "what kind of creator are you?",
      sub: "this tunes your tools and ideas. pick the one that feels most you.",
      content: (
        <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
          {TYPES.map((t) => (
            <button key={t.id} onClick={() => setS({ ...s, type: t.id })}
              className={cn(
                "sticker p-3 sm:p-4 text-left flex gap-3 transition-transform hover:-translate-y-1",
                s.type === t.id && "ring-4 ring-primary",
              )}
              style={{ background: t.tint }}>
              <div className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl border-2 border-foreground bg-card text-xl sm:text-2xl shadow-[0_3px_0_0_var(--foreground)]">{t.emoji}</div>
              <div className="min-w-0">
                <p className="font-display text-sm sm:text-base leading-tight">{t.title}</p>
                <p className="mt-0.5 text-[11px] sm:text-xs text-foreground/80 leading-snug">{t.vibe}</p>
              </div>
            </button>
          ))}
        </div>
      ),
      canNext: !!s.type,
    },
    {
      eyebrow: "step 3 of 5",
      title: "what era are you in rn?",
      sub: "we'll theme your home around it. it's giving lore.",
      content: (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {ERAS.map((e) => (
            <button key={e.id} onClick={() => setS({ ...s, era: e.id })}
              className={cn(
                "sticker p-3 sm:p-4 text-left transition-transform hover:-translate-y-1",
                s.era === e.id && "ring-4 ring-primary",
              )}
              style={{ background: e.tint }}>
              <div className="text-2xl sm:text-3xl">{e.emoji}</div>
              <p className="mt-1.5 font-display text-[13px] sm:text-base leading-tight">{e.title}</p>
            </button>
          ))}
        </div>
      ),
      canNext: !!s.era,
    },
    {
      eyebrow: "step 4 of 5",
      title: "what's the dream?",
      sub: "pick the one that makes your chest a little tight. that's the one.",
      content: (
        <div className="space-y-2.5 sm:space-y-3">
          {GOALS.map((g) => (
            <button key={g.id} onClick={() => setS({ ...s, goal: g.id })}
              className={cn(
                "sticker p-3 sm:p-4 w-full text-left flex items-center gap-3 transition-transform hover:-translate-y-1",
                s.goal === g.id && "ring-4 ring-primary",
              )}>
              <div className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl border-2 border-foreground bg-card text-xl sm:text-2xl shadow-[0_3px_0_0_var(--foreground)]">{g.emoji}</div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm sm:text-base leading-tight">{g.title}</p>
                <p className="mt-0.5 text-[11px] sm:text-xs text-foreground/70 leading-snug">{g.sub}</p>
              </div>
              {s.goal === g.id && <Check className="h-5 w-5 text-success" />}
            </button>
          ))}
        </div>
      ),
      canNext: !!s.goal,
    },
    {
      eyebrow: "step 5 of 5",
      title: "your first quest is ready 💛",
      sub: "no pressure. just one tiny thing to start the streak.",
      content: (
        <div className="sticker p-6 text-center" style={{ background: "var(--gradient-sunrise)" }}>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl border-2 border-foreground bg-card text-5xl shadow-[0_4px_0_0_var(--foreground)] bounce-in">
            {s.avatar}
          </div>
          <p className="eyebrow mt-4">your starter quest</p>
          <h3 className="mt-1 font-display text-2xl">grab 1 content idea today</h3>
          <p className="mt-2 text-sm text-foreground/80">+10 XP. that's it. that's the whole quest. you got this.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="xp-pill">⚡ +25 XP welcome bonus</span>
            <span className="streak-chip">🔥 day 1 unlocked</span>
          </div>
          <div className="mt-5 text-left">
            <NotifyOptIn />
          </div>
        </div>
      ),
      canNext: true,
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-start sm:items-center justify-center px-3 sm:px-4 py-4 sm:py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full border-2 border-foreground bg-card">
          <div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>

        <div className="sticker p-4 sm:p-8">
          <p className="eyebrow">{current.eyebrow}</p>
          <h1 className="mt-2 font-display text-2xl sm:text-4xl leading-tight">{current.title}</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">{current.sub}</p>

          <div className="mt-5 sm:mt-6">{current.content}</div>

          <div className="mt-6 sm:mt-7 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="text-sm font-bold text-muted-foreground disabled:opacity-30"
            >
              ← back
            </button>
            {!isLast ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!current.canNext}
                className="btn-chunky btn-chunky--primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={finish} className="btn-chunky btn-chunky--primary">
                <Sparkles className="h-4 w-4" /> let's go
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
