import type { LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "warm" | "bloom" | "mint" | "sunrise" | "peach" | "sky" | "plum" | "butter" | "blush";

// Compact accent strip + icon chip per variant. No more giant gradient panels.
const VARIANT_ACCENT: Record<Variant, { strip: string; chip: string; eyebrow: string }> = {
  warm:    { strip: "bg-[image:var(--gradient-warm)]",    chip: "surface-peach",  eyebrow: "text-[oklch(0.55_0.15_18)]" },
  bloom:   { strip: "bg-[image:var(--gradient-bloom)]",   chip: "surface-plum",   eyebrow: "text-[oklch(0.5_0.14_350)]" },
  mint:    { strip: "bg-[image:var(--gradient-mint)]",    chip: "surface-mint",   eyebrow: "text-[oklch(0.45_0.12_155)]" },
  sunrise: { strip: "bg-[image:var(--gradient-sunrise)]", chip: "surface-butter", eyebrow: "text-[oklch(0.5_0.13_60)]" },
  peach:   { strip: "bg-[image:var(--gradient-warm)]",    chip: "surface-peach",  eyebrow: "text-[oklch(0.55_0.15_18)]" },
  sky:     { strip: "bg-[oklch(0.78_0.09_220)]",          chip: "surface-sky",    eyebrow: "text-[oklch(0.45_0.12_220)]" },
  plum:    { strip: "bg-[image:var(--gradient-bloom)]",   chip: "surface-plum",   eyebrow: "text-[oklch(0.5_0.14_350)]" },
  butter:  { strip: "bg-[oklch(0.85_0.09_80)]",           chip: "surface-butter", eyebrow: "text-[oklch(0.5_0.13_60)]" },
  blush:   { strip: "bg-[image:var(--gradient-bloom)]",   chip: "surface-blush",  eyebrow: "text-[oklch(0.55_0.15_10)]" },
};

export function PageHero({
  icon: Icon,
  eyebrow,
  title,
  description,
  variant = "warm",
  children,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  variant?: Variant;
  children?: ReactNode;
}) {
  const v = VARIANT_ACCENT[variant];
  return (
    <section className="relative border-b border-border/50 bg-background">
      {/* Slim accent bar instead of giant gradient panel */}
      <div aria-hidden className={cn("absolute inset-x-0 top-0 h-1", v.strip)} />
      <div className="relative mx-auto max-w-5xl px-5 py-6 sm:py-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl text-foreground/80", v.chip)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            {eyebrow && (
              <p className={cn("text-[10px] font-bold uppercase tracking-[0.18em]", v.eyebrow)}>
                {eyebrow}
              </p>
            )}
            <h1 className="mt-0.5 font-display text-2xl font-black leading-tight sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
            {children && <div className="mt-3">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function UsageChip({
  premium,
  freeAllowed,
  used,
  limit,
}: {
  premium: boolean;
  inTrial?: boolean;
  daysLeft?: number | null;
  freeAllowed?: boolean;
  used?: number;
  limit?: number;
}) {
  let label = "";
  if (premium) label = "✨ Premium · unlimited";
  else if (typeof used === "number" && typeof limit === "number")
    label = `🌸 Free · ${Math.max(0, limit - used)}/${limit} left this month`;
  else if (freeAllowed) label = "🌸 Free forever on this tool";
  else label = "🔒 Premium tool · upgrade to unlock";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/50 px-2.5 py-0.5 text-[11px] font-semibold text-foreground/75">
      {label}
    </span>
  );
}