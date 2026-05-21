import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { IconBubble } from "./icon-bubble";

/** Reusable feature card — icon bubble + title + body in a soft floating card. */
export function FeatureCard({
  icon,
  title,
  description,
  tone = "bloom",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "bloom" | "warm" | "mint" | "ink";
  className?: string;
}) {
  return (
    <article
      className={cn(
        "soft-card group flex flex-col gap-3 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)] sm:p-6",
        className,
      )}
    >
      <IconBubble icon={icon} tone={tone} size="md" />
      <h3 className="font-display text-lg font-bold tracking-tight text-foreground">{title}</h3>
      <p className="text-[14px] leading-[1.55] text-muted-foreground text-pretty sm:text-[15px]">
        {description}
      </p>
    </article>
  );
}