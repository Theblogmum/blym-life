import type { LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "warm" | "bloom" | "mint" | "sunrise" | "peach" | "sky" | "plum" | "butter" | "blush";

// Per-variant tints: a halo gradient behind the icon + an accent eyebrow color.
// The base .experience-hero card already provides the glassy gradient body —
// these add personality without going back to flat "page header" land.
const VARIANT_ACCENT: Record<Variant, { halo: string; chip: string; eyebrow: string }> = {
  warm:    { halo: "var(--gradient-warm)",    chip: "surface-peach",  eyebrow: "text-[oklch(0.5_0.22_350)]" },
  bloom:   { halo: "var(--gradient-bloom)",   chip: "surface-plum",   eyebrow: "text-[oklch(0.5_0.22_350)]" },
  mint:    { halo: "var(--gradient-mint)",    chip: "surface-mint",   eyebrow: "text-[oklch(0.45_0.18_295)]" },
  sunrise: { halo: "var(--gradient-sunrise)", chip: "surface-butter", eyebrow: "text-[oklch(0.5_0.18_60)]" },
  peach:   { halo: "var(--gradient-warm)",    chip: "surface-peach",  eyebrow: "text-[oklch(0.5_0.22_350)]" },
  sky:     { halo: "var(--gradient-bloom)",   chip: "surface-sky",    eyebrow: "text-[oklch(0.5_0.22_295)]" },
  plum:    { halo: "var(--gradient-bloom)",   chip: "surface-plum",   eyebrow: "text-[oklch(0.5_0.22_320)]" },
  butter:  { halo: "var(--gradient-sunrise)", chip: "surface-butter", eyebrow: "text-[oklch(0.5_0.18_60)]" },
  blush:   { halo: "var(--gradient-bloom)",   chip: "surface-blush",  eyebrow: "text-[oklch(0.5_0.22_350)]" },
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
    <section className="page-enter relative bg-background">
      <div className="relative mx-auto max-w-5xl px-4 pt-5 pb-3 sm:px-6 sm:pt-7">
        <div className="experience-hero p-5 sm:p-7">
          {/* Floating decorative blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full opacity-60 blur-3xl"
            style={{ background: v.halo }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full opacity-40 blur-3xl"
            style={{ background: "var(--gradient-mint)" }}
          />

          <div className="relative flex items-start gap-4 sm:gap-5">
            {/* Icon tile with pulsing halo */}
            <div className="relative shrink-0">
              <div
                aria-hidden
                className="hero-halo absolute inset-0 -m-3 rounded-3xl blur-xl"
                style={{ background: v.halo, opacity: 0.55 }}
              />
              <div className={cn(
                "relative grid h-14 w-14 place-items-center rounded-2xl text-foreground/85 ring-1 ring-white/60",
                "shadow-[inset_0_1px_0_oklch(1_0_0/0.7),0_10px_24px_-10px_oklch(0.65_0.27_350/0.45)]",
                v.chip,
              )}>
                <Icon className="h-6 w-6" strokeWidth={2.2} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {eyebrow && (
                <p className={cn("text-[10.5px] font-extrabold uppercase tracking-[0.22em]", v.eyebrow)}>
                  ✨ {eyebrow}
                </p>
              )}
              <h1
                className="mt-2 font-display text-[28px] font-bold leading-[1.04] tracking-[-0.022em] sm:text-[38px]"
                style={{
                  maxWidth: "26ch",
                  textShadow: "0 1px 0 oklch(1 0 0 / 0.5)",
                }}
              >
                {title}
              </h1>
              <p className="mt-2.5 max-w-[58ch] text-[13.5px] leading-relaxed text-foreground/70 sm:text-[15px]">
                {description}
              </p>
              {children && <div className="mt-4">{children}</div>}
            </div>
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
  else label = "🔒 Unlock with Studio";
  return (
    <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-foreground/80">
      {label}
    </span>
  );
}