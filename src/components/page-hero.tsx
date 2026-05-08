import type { LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "warm" | "bloom" | "mint" | "sunrise";

const VARIANT_BG: Record<Variant, string> = {
  warm: "bg-[image:var(--gradient-warm)]",
  bloom: "bg-[image:var(--gradient-bloom)]",
  mint: "bg-[image:var(--gradient-mint)]",
  sunrise: "bg-[image:var(--gradient-sunrise)]",
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
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border/40",
        VARIANT_BG[variant],
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-white/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-white/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-5xl px-5 py-12 lg:py-16">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/30 text-white backdrop-blur">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 text-white">
            {eyebrow && (
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-1 font-display text-4xl font-black leading-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-2 max-w-xl text-white/90">{description}</p>
          </div>
        </div>
        {children && <div className="relative mt-6">{children}</div>}
      </div>
    </section>
  );
}

export function UsageChip({
  used,
  limit,
  premium,
}: {
  used: number;
  limit: number | null;
  premium: boolean;
}) {
  if (premium) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
        ✨ Premium · unlimited
      </span>
    );
  }
  const remaining = Math.max(0, (limit ?? 0) - used);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
      {remaining} of {limit} free runs left today
    </span>
  );
}