import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "bloom" | "warm" | "mint" | "ink";

const toneBg: Record<Tone, string> = {
  bloom: "bg-[image:var(--gradient-bloom)]",
  warm: "bg-[image:var(--gradient-warm)]",
  mint: "bg-[image:var(--gradient-mint)]",
  ink: "bg-[image:var(--gradient-ink)]",
};

const sizes = {
  sm: "h-9 w-9 [&_svg]:h-4 [&_svg]:w-4",
  md: "h-12 w-12 [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-16 w-16 [&_svg]:h-7 [&_svg]:w-7",
};

/** Rounded gradient icon bubble with soft glow — the BLYM feature/CTA icon style. */
export function IconBubble({
  icon: Icon,
  tone = "bloom",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl text-primary-foreground shadow-[0_10px_28px_-10px_color-mix(in_oklab,var(--surface-blush)_80%,transparent),0_1px_0_0_oklch(1_0_0/0.35)_inset]",
        toneBg[tone],
        sizes[size],
        className,
      )}
    >
      <Icon strokeWidth={2.25} />
    </span>
  );
}