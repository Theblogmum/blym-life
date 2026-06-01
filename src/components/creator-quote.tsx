import { useMemo } from "react";
import { Sparkles } from "lucide-react";

// Rotates quietly by day so the page feels alive on every visit without spam.
const QUOTES: { q: string; by: string }[] = [
  { q: "Done is the new perfect.", by: "every booked creator, ever" },
  { q: "Post the thing. The algorithm rewards courage.", by: "the universe" },
  { q: "Your boring is someone else's first time seeing it.", by: "Bloom 🌸" },
  { q: "Consistency beats virality. Always.", by: "the data" },
  { q: "If it makes you cringe a little — post it twice.", by: "Bloom 🌸" },
  { q: "One reel today > a perfect plan next Monday.", by: "your future booked self" },
  { q: "You're not behind. You're early in your own story.", by: "Bloom 🌸" },
  { q: "The hook is a promise. Keep it.", by: "every viral creator" },
];

export function CreatorQuote({ className = "" }: { className?: string }) {
  const quote = useMemo(() => {
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return QUOTES[day % QUOTES.length];
  }, []);
  return (
    <div className={`glass-chip relative flex items-start gap-2.5 rounded-2xl px-4 py-3 ${className}`}>
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[13px] font-semibold leading-snug text-foreground/85">"{quote.q}"</p>
        <p className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.18em] text-foreground/45">
          — {quote.by}
        </p>
      </div>
    </div>
  );
}

const NUDGES = [
  "Post 1 reel today and you keep your streak 🔥",
  "5 mins of filming = 3 posts. Promise.",
  "Your camera roll is full of gold. Mine it.",
  "One hook a day keeps the slump away ✨",
  "Batch 3 ideas now — thank yourself Sunday.",
  "Done > perfect. Hit publish, queen.",
];

export function DailyNudge({ className = "" }: { className?: string }) {
  const nudge = useMemo(() => {
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return NUDGES[day % NUDGES.length];
  }, []);
  return (
    <p className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground/70 ${className}`}>
      <span aria-hidden>💫</span> {nudge}
    </p>
  );
}