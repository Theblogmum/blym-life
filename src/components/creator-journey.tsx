import { Sparkles, Camera, Flame, Mail, Banknote, Crown } from "lucide-react";

const STOPS = [
  { icon: Sparkles, label: "Beginner",        sub: "day 1, all heart",        tint: "var(--surface-blush)" },
  { icon: Camera,   label: "First post",      sub: "press record",            tint: "var(--surface-peach)" },
  { icon: Flame,    label: "First streak",    sub: "7 days, addicted",        tint: "var(--surface-mint)" },
  { icon: Mail,     label: "First pitch",     sub: "brand inbox energy",      tint: "var(--surface-blush)" },
  { icon: Banknote, label: "First paid collab", sub: "money hits",            tint: "var(--surface-peach)" },
  { icon: Crown,    label: "Booked creator",  sub: "you made it",             tint: "var(--surface-mint)" },
];

// Hand-tuned positions along the SVG path (in %).
const POSITIONS = [
  { x: 6,  y: 70 },
  { x: 22, y: 15 },
  { x: 40, y: 72 },
  { x: 58, y: 26 },
  { x: 76, y: 70 },
  { x: 92, y: 40 },
];

export function CreatorJourney() {
  return (
    <section className="relative overflow-hidden bg-[image:var(--gradient-aurora)] py-16 sm:py-[90px]">
      {/* Drifting backdrop blobs */}
      <div aria-hidden className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-[image:var(--gradient-bloom)] opacity-40 blur-3xl gradient-drift" />
      <div aria-hidden className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-[image:var(--gradient-mint)] opacity-35 blur-3xl gradient-drift" style={{ animationDelay: "5s" }} />

      <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-8">
        <p className="eyebrow">Your journey</p>
        <h2 className="mx-auto mt-3 max-w-3xl font-display text-[34px] font-normal leading-[1.02] tracking-[-0.02em] text-balance sm:text-[56px]">
          From day one to <span className="text-gradient-game">booked creator</span>.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.5] text-muted-foreground">
          Six moments. One path. Yours.
        </p>
      </div>

      {/* Journey path */}
      <div className="relative mx-auto mt-10 max-w-6xl px-3 sm:mt-16 sm:px-8">
        <div className="relative aspect-[3/4] sm:aspect-[2/1]">
          {/* Mobile: vertical dashed spine */}
          <div aria-hidden className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_18%,transparent)_0_6px,transparent_6px_14px)] sm:hidden" />
          {/* Desktop: SVG winding path */}
          <svg
            aria-hidden
            viewBox="0 0 1200 600"
            preserveAspectRatio="none"
            className="absolute inset-0 hidden h-full w-full sm:block"
          >
            <defs>
              <linearGradient id="journey-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"  stopColor="var(--primary)" />
                <stop offset="50%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--primary)" />
              </linearGradient>
            </defs>
            {/* Faint ghost path */}
            <path
              d="M 70,420 C 200,420 220,170 330,170 C 460,170 460,430 600,430 C 740,430 740,160 870,160 C 1000,160 1010,420 1130,420"
              fill="none"
              stroke="color-mix(in oklab, var(--foreground) 12%, transparent)"
              strokeWidth="2"
              strokeDasharray="4 8"
              strokeLinecap="round"
            />
            {/* Animated drawn path */}
            <path
              d="M 70,420 C 200,420 220,170 330,170 C 460,170 460,430 600,430 C 740,430 740,160 870,160 C 1000,160 1010,420 1130,420"
              fill="none"
              stroke="url(#journey-grad)"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength={1}
              className="path-draw"
            />
          </svg>

          {/* Milestone nodes */}
          {STOPS.map((s, i) => {
            const pos = POSITIONS[i];
            // On mobile, stack milestones vertically along a centered axis instead of left→right
            const mobileY = 6 + i * 17; // 6, 23, 40, 57, 74, 91
            const mobileX = i % 2 === 0 ? 28 : 72;
            return (
              <div
                key={s.label}
                className="absolute -translate-x-1/2 -translate-y-1/2 milestone-pop sm:!left-[var(--lx)] sm:!top-[var(--ly)]"
                style={{
                  left: `${mobileX}%`,
                  top: `${mobileY}%`,
                  ['--lx' as string]: `${pos.x}%`,
                  ['--ly' as string]: `${pos.y}%`,
                  ['--i' as string]: i,
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="relative grid h-12 w-12 place-items-center rounded-2xl text-foreground shadow-[var(--shadow-elegant)] ring-4 ring-background sm:h-16 sm:w-16"
                    style={{ background: s.tint, transform: `rotate(${i % 2 === 0 ? -4 : 4}deg)` }}
                  >
                    <s.icon className="h-5 w-5 sm:h-7 sm:w-7" />
                    <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-anchor text-[9px] font-bold text-anchor-foreground shadow-[var(--shadow-soft)] sm:h-6 sm:w-6 sm:text-[10px]">
                      {i + 1}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-[12px] font-semibold leading-tight text-foreground sm:text-[15px]">{s.label}</p>
                    <p className="hidden text-[11px] text-muted-foreground sm:block">{s.sub}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emotional closing line */}
      <p className="relative mx-auto mt-12 max-w-md px-5 text-center font-display text-[20px] leading-snug text-foreground sm:text-[24px]">
        You're closer than you think. 💛
      </p>
    </section>
  );
}
