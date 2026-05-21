# BLYM brand components

Single source of truth for navbars, buttons, cards, CTAs, gradients, typography,
and icon styles across the app. Edit a token in `src/styles.css` (or a variant
in `src/components/ui/button.tsx`) and the change propagates everywhere these
components are used.

## Where colors / gradients live

`src/styles.css`

- `--primary`, `--primary-foreground`, `--accent`, `--anchor` — semantic colors
- `--gradient-bloom` — primary pink → purple gradient (buttons, CTAs, highlights)
- `--gradient-warm`, `--gradient-mint`, `--gradient-ink`, `--gradient-aurora`
- `--surface-blush`, `--surface-peach`, `--surface-mint`, `--surface-butter` — soft pastel tints
- `--shadow-soft`, `--shadow-elegant`, `--shadow-xs` — premium layered shadows

Change a value once → every component re-renders with the new look.

## Components

| Component        | Use for                                              |
| ---------------- | ---------------------------------------------------- |
| `LandingNavbar`  | Sticky public marketing header (logo + nav + auth)   |
| `SectionHeading` | Eyebrow + headline + sub on every landing section    |
| `FeatureCard`    | Icon-led feature tiles in grids                      |
| `CTASection`     | Closing CTA band with primary + optional secondary   |
| `GradientText`   | Wrap text in the brand gradient                       |
| `IconBubble`     | Rounded gradient icon chip (the BLYM feature style)  |
| `Button`         | Use `variant="bloom"` (primary) or `"anchor"` (dark) |

## Example

```tsx
import { LandingNavbar, SectionHeading, FeatureCard, CTASection } from "@/components/brand";
import { Rocket, TrendingUp, Star, Heart } from "lucide-react";

<LandingNavbar links={[{ label: "Features", href: "#features" }, { label: "Store", to: "/store" }]} />

<SectionHeading
  eyebrow="why blym"
  title="A creator app that helps you level up."
  highlight="level up"
  description="Every post, hook and tiny win moves you forward."
/>

<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <FeatureCard icon={Rocket} title="Create" description="Fuel your ideas." tone="bloom" />
  <FeatureCard icon={TrendingUp} title="Level up" description="Track. Grow. Win." tone="ink" />
  <FeatureCard icon={Star} title="Earn rewards" description="Show up, get rewarded." tone="warm" />
  <FeatureCard icon={Heart} title="Built for creators" description="By a creator." tone="mint" />
</div>

<CTASection
  title="Ready to level up?"
  highlight="level up"
  description="Join 10,000+ creators showing up daily."
  primary={{ label: "Start free", to: "/signup" }}
  secondary={{ label: "See how it works", to: "/", variant: "outline" }}
/>
```

## Rebrand checklist

1. Open `src/styles.css` and update `--gradient-bloom`, `--primary`, `--accent` etc.
2. Optionally tweak the `bloom` / `anchor` Button variants in `src/components/ui/button.tsx`.
3. Done — no component edits required.