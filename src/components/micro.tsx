import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function TypingDots({ className }: { className?: string }) {
  return (
    <span className={cn("typing-dots", className)} aria-hidden>
      <i /><i /><i />
    </span>
  );
}

export function IdeaGeneratedBadge({
  label = "Idea generated",
  className,
}: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "sparkle-pop inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary",
        className,
      )}
    >
      <Sparkles className="h-3 w-3" />
      {label} ✨
    </span>
  );
}
