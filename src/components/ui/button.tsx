import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_4px_0_0_oklch(0.42_0.18_295)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_oklch(0.42_0.18_295)] active:shadow-[0_1px_0_0_oklch(0.42_0.18_295)]",
        destructive: "bg-destructive text-destructive-foreground shadow-[0_4px_0_0_oklch(0.42_0.15_25)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_oklch(0.42_0.15_25)] active:shadow-[0_1px_0_0_oklch(0.42_0.15_25)]",
        outline:
          "border-2 border-foreground/80 bg-card text-foreground shadow-[0_4px_0_0_oklch(0.18_0.02_280)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_oklch(0.18_0.02_280)] active:shadow-[0_1px_0_0_oklch(0.18_0.02_280)]",
        secondary: "bg-secondary text-secondary-foreground shadow-[0_3px_0_0_oklch(0.7_0.1_85)] hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_oklch(0.7_0.1_85)] active:shadow-[0_1px_0_0_oklch(0.7_0.1_85)]",
        ghost: "hover:bg-accent/15 hover:text-accent active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
