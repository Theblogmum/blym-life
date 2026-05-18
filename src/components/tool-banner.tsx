import { useRouterState } from "@tanstack/react-router";

type Tool = { emoji: string; title: string; sub: string; xp: number; tint: string };

const TOOLS: Record<string, Tool> = {
  "/generator":            { emoji: "💡", title: "give me an idea",      sub: "ok let's cook something 🍳",            xp: 10, tint: "var(--surface-butter)" },
  "/film-this":            { emoji: "🎬", title: "film this now",        sub: "tiny clip > no clip. press record bestie", xp: 15, tint: "var(--surface-rose)" },
  "/viral-lab":            { emoji: "🪝", title: "hook lab",             sub: "scroll-stopping in 3, 2, 1…",            xp: 10, tint: "var(--surface-mint)" },
  "/recycler":             { emoji: "♻️", title: "recycle old posts",    sub: "your old wins still slap",               xp: 10, tint: "var(--surface-sky)" },
  "/cta-generator":        { emoji: "📣", title: "CTA lines",            sub: "say the thing. tell them what to do.",   xp: 5,  tint: "var(--surface-blush)" },
  "/broll":                { emoji: "🎥", title: "b-roll ideas",         sub: "boring shots > no shots. trust.",        xp: 10, tint: "var(--surface-plum)" },
  "/series-builder":       { emoji: "📚", title: "build a series",       sub: "one idea, five posts. genius.",          xp: 25, tint: "var(--surface-grape)" },
  "/response-writer":      { emoji: "💬", title: "DM replies",           sub: "don't leave them on read 👀",            xp: 5,  tint: "var(--surface-rose)" },
  "/seo-keywords":         { emoji: "🔎", title: "SEO keywords",         sub: "be findable not invisible",              xp: 10, tint: "var(--surface-mint)" },
  "/bio-optimiser":        { emoji: "🪞", title: "fix my bio",           sub: "first impression > everything",          xp: 10, tint: "var(--surface-butter)" },
  "/post-timing":          { emoji: "⏰", title: "when to post",         sub: "stop guessing bestie",                   xp: 5,  tint: "var(--surface-sky)" },
  "/pin-optimiser":        { emoji: "📌", title: "pinterest pin",        sub: "the long-tail traffic glow up",          xp: 10, tint: "var(--surface-blush)" },
  "/insights":             { emoji: "📊", title: "what worked",          sub: "your top hits, no math required",        xp: 5,  tint: "var(--surface-mint)" },
  "/brand-hub":            { emoji: "💼", title: "brands to pitch",      sub: "sliding in professionally",              xp: 25, tint: "var(--surface-plum)" },
  "/profile-audit":        { emoji: "🔍", title: "audit my profile",     sub: "soft truth, no roast",                   xp: 10, tint: "var(--surface-rose)" },
  "/flop-analyser":        { emoji: "🪦", title: "why it flopped",       sub: "data, not drama. you're fine.",          xp: 10, tint: "var(--surface-butter)" },
  "/deliverables-builder": { emoji: "📦", title: "deliverables",         sub: "what they get for what they pay",        xp: 15, tint: "var(--surface-grape)" },
  "/usage-rights":         { emoji: "📜", title: "usage rights",         sub: "know what you're giving away",           xp: 10, tint: "var(--surface-sky)" },
  "/media-kit":            { emoji: "🎀", title: "media kit",            sub: "look booked, get booked",                xp: 25, tint: "var(--surface-blush)" },
  "/portfolio":            { emoji: "🖼️", title: "portfolio",            sub: "your work, but make it sparkle",         xp: 20, tint: "var(--surface-plum)" },
  "/passive-ideas":        { emoji: "💸", title: "passive income",       sub: "earn while you nap. dreamy.",            xp: 15, tint: "var(--surface-mint)" },
  "/engagement-booster":   { emoji: "🚀", title: "boost engagement",     sub: "wake the algorithm up",                  xp: 10, tint: "var(--surface-rose)" },
  "/business":             { emoji: "🏪", title: "business mode",        sub: "real CEO behaviour",                     xp: 15, tint: "var(--surface-grape)" },
  "/invoices":             { emoji: "🧾", title: "send an invoice",      sub: "get paid like a girlboss",               xp: 10, tint: "var(--surface-butter)" },
  "/income-tracker":       { emoji: "💰", title: "track the money",      sub: "every £ counts, log it",                 xp: 5,  tint: "var(--surface-mint)" },
  "/affiliates":           { emoji: "🔗", title: "affiliate links",      sub: "passive coins drop here",                xp: 10, tint: "var(--surface-sky)" },
  "/motivation":           { emoji: "🫶", title: "daily pep talk",       sub: "your hype girl is here",                 xp: 5,  tint: "var(--surface-blush)" },
  "/rejection-recovery":   { emoji: "🩹", title: "rejection recovery",   sub: "not for you, on to the next",            xp: 5,  tint: "var(--surface-rose)" },
  "/planner":              { emoji: "🗓️", title: "plan my week",         sub: "future you says thanks",                 xp: 15, tint: "var(--surface-plum)" },
  "/schedule":             { emoji: "📆", title: "schedule",             sub: "post-it but make it digital",            xp: 10, tint: "var(--surface-grape)" },
  "/library":              { emoji: "🗃️", title: "saved stuff",          sub: "your hoard of good ideas",               xp: 5,  tint: "var(--surface-sky)" },
  "/growth-coach":         { emoji: "🌱", title: "pep talk",             sub: "real coach energy, zero guru vibes",     xp: 5,  tint: "var(--surface-mint)" },
};

export function ToolBanner() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const tool = TOOLS[path];
  if (!tool) return null;
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6">
      <div className="sticker p-5 sm:p-6" style={{ background: tool.tint }}>
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-2xl border-2 border-foreground bg-card text-3xl shadow-[0_4px_0_0_var(--foreground)]">
            {tool.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="eyebrow">tool unlocked</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl leading-tight">{tool.title}</h1>
            <p className="mt-1 text-sm text-foreground/80">{tool.sub}</p>
          </div>
          <span className="xp-pill shrink-0 hidden sm:inline-flex">⚡ +{tool.xp} XP</span>
        </div>
      </div>
    </div>
  );
}
