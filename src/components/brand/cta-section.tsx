import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GradientText } from "./gradient-text";

type CTA = { label: string; to: string; variant?: "bloom" | "anchor" | "outline" };

/** Reusable CTA band — heading + sub + 1–2 buttons. Use to close any page. */
export function CTASection({
  eyebrow,
  title,
  highlight,
  description,
  primary,
  secondary,
  className,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  primary: CTA;
  secondary?: CTA;
  className?: string;
}) {
  const renderTitle = () => {
    if (!highlight || !title.includes(highlight)) return title;
    const [before, after] = title.split(highlight);
    return (
      <>
        {before}
        <GradientText>{highlight}</GradientText>
        {after}
      </>
    );
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-border/40 bg-card p-8 text-center shadow-[var(--shadow-soft)] sm:p-14",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: "var(--gradient-aurora)" }}
      />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2 className="font-display text-[28px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground text-balance sm:text-[44px]">
          {renderTitle()}
        </h2>
        {description ? (
          <p className="text-[16px] leading-[1.5] text-muted-foreground text-pretty sm:text-[18px]">
            {description}
          </p>
        ) : null}
        <div className="mt-3 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          <Link to={primary.to} className="w-full sm:w-auto">
            <Button size="lg" variant={primary.variant ?? "bloom"} className="w-full sm:w-auto">
              {primary.label} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          {secondary ? (
            <Link to={secondary.to} className="w-full sm:w-auto">
              <Button size="lg" variant={secondary.variant ?? "outline"} className="w-full sm:w-auto">
                {secondary.label}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}