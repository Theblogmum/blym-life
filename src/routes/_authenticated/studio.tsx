import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Lightbulb, Fish, MessageSquare, Clapperboard, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/studio")({
  component: StudioPage,
});

type Tool = {
  to: string;
  search?: Record<string, string>;
  label: string;
  tagline: string;
  desc: string;
  icon: typeof Lightbulb;
  glow: string;
  accent: string;
  emoji: string;
};

const TOOLS: Tool[] = [
  {
    to: "/generator",
    search: { kind: "hook" },
    label: "Hook Studio™",
    tagline: "Stop the scroll in 2 seconds",
    desc: "Punchy first-line hooks engineered to halt thumbs and lift watch time.",
    icon: Fish,
    glow: "oklch(0.72 0.18 30)",
    accent: "from-orange-400/30 to-rose-400/20",
    emoji: "🎣",
  },
  {
    to: "/generator",
    search: { kind: "caption" },
    label: "Caption Studio™",
    tagline: "Conversational, save-worthy",
    desc: "Captions that sound like you and earn comments, shares and saves.",
    icon: MessageSquare,
    glow: "oklch(0.74 0.16 200)",
    accent: "from-sky-400/30 to-cyan-400/20",
    emoji: "💬",
  },
  {
    to: "/generator",
    search: { kind: "hook" },
    label: "Idea Lab™",
    tagline: "Endless ideas, zero blank pages",
    desc: "Fresh, on-brand content ideas matched to your niche and audience.",
    icon: Lightbulb,
    glow: "oklch(0.82 0.15 90)",
    accent: "from-amber-300/30 to-yellow-300/20",
    emoji: "💡",
  },
  {
    to: "/series-builder",
    label: "Script Studio™",
    tagline: "Beat-by-beat reel scripts",
    desc: "Full multi-part series and scripts mapped out shot-by-shot.",
    icon: Clapperboard,
    glow: "oklch(0.7 0.18 320)",
    accent: "from-fuchsia-400/30 to-purple-400/20",
    emoji: "🎬",
  },
];

function StudioPage() {
  return (
    <div>
      <PageHero
        eyebrow="Create"
        title="My Studio™"
        subtitle="Your creative command centre — hooks, captions, ideas and scripts in one beautiful place."
        icon={<Sparkles className="h-5 w-5" />}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.label}
                to={t.to}
                search={t.search as never}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-border hover:shadow-[0_20px_60px_-25px_var(--tool-glow)]"
                style={{ ["--tool-glow" as never]: t.glow }}
              >
                {/* Premium colored glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
                  style={{ background: t.glow }}
                />
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />

                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-border/60 bg-background/80 text-xl shadow-sm"
                      style={{ boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${t.glow} 25%, transparent)` }}
                    >
                      <span aria-hidden>{t.emoji}</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">{t.label}</h2>
                      <p className="text-xs text-muted-foreground">{t.tagline}</p>
                    </div>
                  </div>
                  <Icon className="h-5 w-5 text-muted-foreground/70 transition-colors group-hover:text-foreground" />
                </div>

                <p className="relative mt-5 text-sm leading-relaxed text-muted-foreground">
                  {t.desc}
                </p>

                <div className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/90">
                  Open studio
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-foreground/70" />
            <span>
              Tip — start in <span className="text-foreground">Idea Lab</span>, polish in{" "}
              <span className="text-foreground">Hook</span> &{" "}
              <span className="text-foreground">Caption Studio</span>, then film with{" "}
              <span className="text-foreground">Script Studio</span>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}