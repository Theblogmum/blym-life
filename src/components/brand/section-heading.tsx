import { cn } from "@/lib/utils";
import { GradientText } from "./gradient-text";

/** Eyebrow + headline + optional sub. Use on every landing section for consistent typography. */
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  /** Optional substring of `title` to wrap in the brand gradient. */
  highlight?: string;
  description?: string;
  align?: "center" | "left";
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
    <header
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="font-display text-[34px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground text-balance sm:text-[52px]">
        {renderTitle()}
      </h2>
      {description ? (
        <p className="max-w-2xl text-[16px] leading-[1.5] text-muted-foreground text-pretty sm:text-[18px]">
          {description}
        </p>
      ) : null}
    </header>
  );
}