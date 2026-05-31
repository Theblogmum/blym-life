import { useRouterState } from "@tanstack/react-router";

type Tool = { emoji: string; title: string; sub: string; xp: number; tint: string };

const TOOLS: Record<string, Tool> = {
  "/generator":            { emoji: "💡", title: "give me an idea",      sub: "ok let's cook something 🍳",            xp: 10, tint: "var(--surface-butter)" },
  "/app":            { emoji: "🎬", title: "today's brief",        sub: "tiny clip > no clip. press record bestie", xp: 15, tint: "var(--surface-rose)" },
  "/viral-lab":            { emoji: "🪝", title: "hook lab",             sub: "scroll-stopping in 3, 2, 1…",            xp: 10, tint: "var(--surface-mint)" },
  "/recycler":             { emoji: "♻️", title: "recycle old posts",    sub: "your old wins still slap",               xp: 10, tint: "var(--surface-sky)" },
  "/cta-generator":        { emoji: "📣", title: "CTA lines",            sub: "say the thing. tell them what to do.",   xp: 5,  tint: "var(--surface-blush)" },
  "/broll":                { emoji: "🎥", title: "b-roll ideas",         sub: "boring shots > no shots. trust.",        xp: 10, tint: "var(--surface-plum)" },
  "/series-builder":       { emoji: "📚", title: "build a series",       sub: "one idea, five posts. genius.",          xp: 25, tint: "var(--surface-grape)" },
  "/response-writer":      { emoji: "💬", title: "DM replies",           sub: "don't leave them on read 👀",            xp: 5,  tint: "var(--surface-rose)" },
  "/seo-keywords":         { emoji: "🔎", title: "SEO keywords",         sub: "be findable not invisible",              xp: 10, tint: "var(--surface-mint)" },
  "/bio-optimiser":        { emoji: "🪞", title: "fix my bio",           sub: "first impression > everything",          xp: 10, tint: "var(--surface-butter)" },
  "/post-timing":          { emoji: "⏰", title: "when to post",         sub: "stop guessing bestie",                   xp: 5,  tint: "var(--surface-sky)" },
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
  
  "/growth-coach":         { emoji: "🌱", title: "pep talk",             sub: "real coach energy, zero guru vibes",     xp: 5,  tint: "var(--surface-mint)" },
};

export function ToolBanner() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const tool = TOOLS[path];
  if (!tool) return null;
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-5">
      <div className="flex items-center gap-3 rounded-2xl border-2 border-foreground bg-card px-4 py-3 shadow-[0_3px_0_0_var(--foreground)]" style={{ background: tool.tint }}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-foreground bg-card text-xl">
          {tool.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-lg sm:text-xl leading-tight truncate">{tool.title}</h1>
          <p className="text-xs text-foreground/70 truncate">{tool.sub}</p>
        </div>
        <span className="xp-pill shrink-0 hidden sm:inline-flex text-xs">+{tool.xp} XP</span>
      </div>
    </div>
  );
}
