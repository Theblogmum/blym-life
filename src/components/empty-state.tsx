import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "warm" | "bloom" | "mint" | "sky" | "butter" | "blush";

const TONE: Record<Tone, { chip: string; ring: string }> = {
  warm:   { chip: "surface-peach",  ring: "ring-[oklch(0.85_0.08_30)]" },
  bloom:  { chip: "surface-plum",   ring: "ring-[oklch(0.85_0.07_340)]" },
  mint:   { chip: "surface-mint",   ring: "ring-[oklch(0.85_0.07_155)]" },
  sky:    { chip: "surface-sky",    ring: "ring-[oklch(0.85_0.06_220)]" },
  butter: { chip: "surface-butter", ring: "ring-[oklch(0.88_0.08_80)]" },
  blush:  { chip: "surface-blush",  ring: "ring-[oklch(0.85_0.08_10)]" },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  tone = "warm",
  action,
  hint,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  tone?: Tone;
  action?: ReactNode;
  hint?: string;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-dashed border-border/70 bg-card p-9 text-center shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {/* Warm aspirational backing — keeps even an empty state feeling like an opportunity */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, color-mix(in oklab, var(--surface-blush) 40%, transparent), transparent 65%), radial-gradient(60% 70% at 100% 100%, color-mix(in oklab, var(--surface-butter) 30%, transparent), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className={cn(
          "relative mx-auto grid h-14 w-14 place-items-center rounded-2xl ring-4 ring-offset-2 ring-offset-card breathe sparkle-pop",
          t.chip,
          t.ring,
        )}
      >
        <Icon className="h-6 w-6 text-foreground/75" />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-1 -right-1 text-[11px] leading-none opacity-80"
          style={{ filter: "drop-shadow(0 0 6px color-mix(in oklab, var(--primary) 40%, transparent))" }}
        >
          ✨
        </span>
      </div>
      <p className="relative mt-4 font-display text-lg font-black leading-tight">{title}</p>
      {description && (
        <p className="relative mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="relative mt-5 flex justify-center">{action}</div>}
      {hint && (
        <p className="relative mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          {hint}
        </p>
      )}
    </div>
  );
}
