import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Variant = "game" | "warm" | "bloom";

const map: Record<Variant, string> = {
  game: "text-gradient-game",
  warm: "text-gradient-warm",
  bloom: "bg-[image:var(--gradient-bloom)] bg-clip-text text-transparent",
};

/** Brand gradient text. Edit the underlying CSS vars in styles.css to rebrand everywhere. */
export function GradientText({
  variant = "game",
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return <span className={cn(map[variant], className)} {...rest} />;
}