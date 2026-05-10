import { cn } from "@/lib/utils";

/**
 * Bloom — the in-app AI persona. Use to add a friendly conversational voice
 * to tool pages. Pair with the PageHero or above an input.
 */
export function PersonaBubble({
  children,
  className,
  tone = "peach",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "peach" | "mint" | "sky" | "butter" | "plum" | "blush";
}) {
  const surface =
    tone === "mint" ? "surface-mint" :
    tone === "sky" ? "surface-sky" :
    tone === "butter" ? "surface-butter" :
    tone === "plum" ? "surface-plum" :
    tone === "blush" ? "surface-blush" :
    "surface-peach";
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-base", surface)}>
        🌸
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Bloom · your content bestie
        </p>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/85">{children}</p>
      </div>
    </div>
  );
}
