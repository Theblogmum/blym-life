export type RewardItem = { title: string; body: string };
export type RewardContent = {
  id: string;
  xp: number;
  emoji: string;
  title: string;
  loot: string;
  glow: string;
  kind: "snippets" | "theme" | "lessons" | "bundle";
  intro: string;
  items: RewardItem[];
};

export const REWARDS: RewardContent[] = [
  {
    id: "starter",
    xp: 25,
    emoji: "🎁",
    title: "Starter Pack",
    loot: "10 scroll-stopping hooks",
    glow: "oklch(0.78 0.16 150)",
    kind: "snippets",
    intro: "Drop one of these at second 0 to stop the scroll. Swap [niche] / [thing] for your own.",
    items: [
      { title: "Hook 1 — POV", body: "POV: you just figured out the [niche] thing nobody told you." },
      { title: "Hook 2 — Confession", body: "I'm a [your role] and I'll never [common thing] again. Here's why." },
      { title: "Hook 3 — Number", body: "3 things I wish I knew before starting [thing]." },
      { title: "Hook 4 — Mistake", body: "Stop doing [common habit]. Do this instead." },
      { title: "Hook 5 — Curiosity gap", body: "Nobody talks about this part of [topic], so I will." },
      { title: "Hook 6 — Before/after", body: "6 months ago vs now — same girl, completely different [thing]." },
      { title: "Hook 7 — Hot take", body: "Unpopular opinion: [belief everyone has] is actually wrong." },
      { title: "Hook 8 — Storytime", body: "Storytime: the day I almost quit [thing] and what changed." },
      { title: "Hook 9 — Tutorial bait", body: "If you only learn one [niche] thing this week, make it this." },
      { title: "Hook 10 — Relatable", body: "Tell me you're a [your audience] without telling me you're a [your audience]." },
    ],
  },
  {
    id: "caption",
    xp: 100,
    emoji: "💌",
    title: "Caption Vault",
    loot: "25 caption templates",
    glow: "oklch(0.82 0.16 80)",
    kind: "snippets",
    intro: "Plug-and-play captions. Pick a vibe, fill in the blanks, post.",
    items: [
      { title: "Soft launch", body: "a quiet little update from my corner of the internet 🤍\n\n[what you're sharing]\n\nsave this if it speaks to you." },
      { title: "Storytime opener", body: "ok storytime — [one-line setup].\n\nit started when [moment].\n\nand by the end of this i had [outcome].\n\nthe lesson? [takeaway]." },
      { title: "Value-stack carousel", body: "5 things i wish someone told me about [topic]:\n\n1. [tip]\n2. [tip]\n3. [tip]\n4. [tip]\n5. [tip]\n\nwhich one do you needed to hear today? 👇" },
      { title: "Vulnerability post", body: "i don't usually share this side but —\n\n[honest thing].\n\nif you've ever felt the same, you're not alone." },
      { title: "Behind the scenes", body: "what you see: [final thing].\nwhat actually happened: [messy reality].\n\ncreating is rarely the linear thing we pretend it is." },
      { title: "Hot take", body: "controversial opinion: [take].\n\nhere's why →\n\n[2–3 sentences].\n\nagree or absolutely not?" },
      { title: "Tutorial recap", body: "how to [thing] in 4 steps 👇\n\n1. [step]\n2. [step]\n3. [step]\n4. [step]\n\nsave this for later 🤝" },
      { title: "Reframe", body: "stop calling it [old word]. start calling it [new word].\n\n[short why]." },
      { title: "Question hook", body: "quick question — does anyone else [niche behavior]?\n\nor am i the only one 😭" },
      { title: "Win post", body: "small win to share:\n\n[the win].\n\nposting this as a reminder that [bigger truth]." },
      { title: "Loss + lesson", body: "this didn't go to plan.\n\n[what happened].\n\nhere's what i'm taking from it →\n[lesson]." },
      { title: "Listicle", body: "[topic] starter pack:\n\n• [item]\n• [item]\n• [item]\n• [item]\n\ntag a friend who needs this." },
      { title: "Mini-manifesto", body: "i'm done with [old way].\n\ni'm choosing [new way] because [reason].\n\nthis is your sign to do the same." },
      { title: "Day-in-the-life", body: "a real day in my life as a [your role]:\n\nmorning — [thing]\nmidday — [thing]\nevening — [thing]\n\nnot glamorous. very real." },
      { title: "Q&A invite", body: "answering the [#] most-asked question i get:\n\n\"[question]\"\n\nshort answer: [answer].\nlong answer: [next slide / comments]." },
      { title: "Trend with a twist", body: "everyone's doing [trend]. here's my version 👇" },
      { title: "Before / after", body: "6 months ago: [where you were].\nnow: [where you are].\n\nproof that [encouraging truth]." },
      { title: "Permission slip", body: "this is your permission to:\n\n• [thing]\n• [thing]\n• [thing]\n\nyou don't need anyone else's." },
      { title: "Soft sell", body: "if you've been thinking about [thing] — this is your sign.\n\n[1 line about the offer].\n\nlink in bio 🤍" },
      { title: "Community ask", body: "help me decide → [option A] or [option B]?\n\ngenuinely cannot pick. drop your vote below." },
      { title: "Reflection", body: "things i'm learning lately:\n\n— [lesson]\n— [lesson]\n— [lesson]\n\nwhat's one thing you're learning?" },
      { title: "Recommendation", body: "if you liked [thing], you'll love [thing].\n\nhere's why 👇\n\n[2 sentences]." },
      { title: "Mini-tutorial", body: "the 3-step [thing] that actually works:\n\n1. [step]\n2. [step]\n3. [step]\n\nthat's it. that's the post." },
      { title: "Gratitude", body: "a tiny thank-you post 🤍\n\nfor [thing], for [person], for [moment].\n\nwhat are you grateful for today?" },
      { title: "Closing the loop", body: "you asked, so — here's the update on [thing].\n\n[result].\n\nthank you for following along." },
    ],
  },
  {
    id: "viral",
    xp: 250,
    emoji: "🔥",
    title: "Viral Hook Box",
    loot: "Pro hook formulas",
    glow: "oklch(0.74 0.2 25)",
    kind: "snippets",
    intro: "Repeatable hook structures the best creators rotate. Pick a formula, fill the slots.",
    items: [
      { title: "The Contrarian", body: "Everyone says [common advice]. Here's why they're wrong." },
      { title: "The Specific Promise", body: "How I [specific result] in [specific timeframe] without [common pain]." },
      { title: "The Curiosity Loop", body: "The [niche] trick nobody is using — and it's the reason [outcome]." },
      { title: "The Confession", body: "I've been a [role] for [time]. I'm finally admitting [truth]." },
      { title: "The Mistake", body: "I wasted [time/money] doing [thing]. Don't do what I did." },
      { title: "The Demo", body: "Watch me [do thing] in real time — then I'll tell you why it works." },
      { title: "The List Tease", body: "5 things [audience] should stop doing in [year]. #3 will sting." },
      { title: "The Status Flip", body: "You don't need [thing people chase] to [outcome]. You need this." },
      { title: "The Trend Hijack", body: "Everyone's using [trend] wrong. Here's the version that actually converts." },
      { title: "The Authority Drop", body: "I [credibility marker]. Here's the one thing I'd tell my younger self." },
      { title: "The Pattern Break", body: "Stop. Don't post anything else until you've seen this." },
      { title: "The Cliffhanger", body: "This [thing] changed everything for me — and I almost didn't try it." },
    ],
  },
  {
    id: "pitch",
    xp: 500,
    emoji: "💼",
    title: "Pitch Power-up",
    loot: "5 brand pitch templates",
    glow: "oklch(0.7 0.18 320)",
    kind: "snippets",
    intro: "Cold-pitch templates that actually get replies. Personalize the [brackets], keep the structure.",
    items: [
      {
        title: "The Warm Intro",
        body: "Subject: loved your [recent campaign]\n\nHi [Name],\n\nI've been a quiet fan of [Brand] for a while — [specific detail showing you actually know them].\n\nI'm [your name], a [niche] creator with [audience size] on [platform]. My audience is [1-sentence description] and they consistently engage with [related content].\n\nI'd love to put together a [deliverable] for [specific product]. Happy to send my media kit if there's any interest.\n\nEither way, keep doing what you're doing.\n\n[Your name]",
      },
      {
        title: "The Value-First",
        body: "Subject: a free idea for [Brand]\n\nHi [Name],\n\nNo ask in this email — just an idea.\n\nI was watching [their last launch / page] and noticed [observation]. A simple [content format] like \"[concept]\" would slot in really well with how [target audience] is searching right now.\n\nIf you ever want a creator partner to test something like that, I'd be a great fit. My audience: [1 line]. Reach: [1 line].\n\nEither way — thought it was worth sending.\n\n[Your name]",
      },
      {
        title: "The Results Pitch",
        body: "Subject: [number]% engagement on my last [niche] post\n\nHi [Name],\n\nQuick one. My last [product type] post hit [stat] and pulled [DMs / saves / link clicks].\n\nI'd love to do something similar for [Brand]. Quick idea: [1-line concept tied to their product].\n\nDeliverables I'd suggest: [1 reel + 3 stories], usage: [organic, 30 days], rate: [£/$X].\n\nMedia kit attached. Open to a call if helpful.\n\n[Your name]",
      },
      {
        title: "The Gifted → Paid Bridge",
        body: "Subject: following up on [gifted product]\n\nHi [Name],\n\nThank you again for sending [product]. The [reel / post] I shared pulled [stat] and the comments were genuinely full of \"where is this from.\"\n\nGiven how well it landed, I'd love to chat about a small paid partnership for [next launch / season]. I think a [format] would do really well.\n\nRough scope: [1 line]. Investment: [£/$X].\n\nLet me know if it's worth a quick call.\n\n[Your name]",
      },
      {
        title: "The Follow-up",
        body: "Subject: bumping this up — [original subject]\n\nHi [Name],\n\nBumping this up in case it got buried. No worries if the timing isn't right.\n\nQuick recap: [one sentence on the original pitch].\n\nIf [Brand] isn't the right fit right now, I'd love to be considered for [season / quarter / next launch].\n\nThanks for your time either way.\n\n[Your name]",
      },
    ],
  },
  {
    id: "theme",
    xp: 800,
    emoji: "✨",
    title: "Soft Theme Unlock",
    loot: "Exclusive app theme",
    glow: "oklch(0.74 0.18 350)",
    kind: "theme",
    intro: "A softer, dreamier coat of paint for your dashboard. Toggle it on whenever you want a vibe shift.",
    items: [
      { title: "Soft Sunset", body: "A warmer pink-peach palette across cards, buttons and accents. Toggle below to apply." },
    ],
  },
  {
    id: "lesson",
    xp: 1250,
    emoji: "🎓",
    title: "Creator Lessons",
    loot: "3 mini-courses",
    glow: "oklch(0.72 0.16 225)",
    kind: "lessons",
    intro: "Three short, no-fluff lessons. Read one with a coffee.",
    items: [
      {
        title: "Lesson 1 — Posting cadence that doesn't burn you out",
        body: "The truth: 3 great posts a week beats 7 mid ones. Plan in batches — one filming day, one editing day. Use the rest of the week to live (so you have something to post about). Repurpose: every long-form idea becomes 1 reel + 1 carousel + 1 story poll. Done.",
      },
      {
        title: "Lesson 2 — Hooks: the only 3 seconds that matter",
        body: "Stop introducing yourself. Lead with the result, the contradiction, or the question. Test 3 hooks for the same body — same content, three thumbnails / first frames. Whichever wins, double down. Hooks are a skill, not a vibe.",
      },
      {
        title: "Lesson 3 — Pitching brands without sounding desperate",
        body: "Brands aren't paying you for follower count, they're paying for trust + fit. Lead the email with what you've noticed about them, not what you want. State deliverables and rate in plain numbers. Always include one specific idea. Send 5 a week. Track replies, not feelings.",
      },
    ],
  },
  {
    id: "deal",
    xp: 2000,
    emoji: "👑",
    title: "Brand Deal Bundle",
    loot: "Media kit + invoice templates",
    glow: "oklch(0.7 0.18 290)",
    kind: "bundle",
    intro: "Everything you need the moment a brand says yes.",
    items: [
      {
        title: "Media Kit (1-pager)",
        body: "[Your Name] — [Niche] creator\n\nAbout me: [2 sentences. Who you are, who you serve, what makes you different.]\n\nAudience snapshot:\n• Instagram: [followers] · [avg reach] · [avg engagement %]\n• TikTok: [followers] · [avg views]\n• Newsletter / other: [size]\n\nAudience profile: [age range], [gender split], [top 3 locations], [3 core interests].\n\nPast partners: [Brand], [Brand], [Brand]\n\nResults highlight: \"[1-sentence case study — brand + result + number].\"\n\nServices & starting rates:\n• 1x Reel (organic, 30d usage): [£/$X]\n• 1x Reel + 3 stories: [£/$X]\n• UGC package (3 raw clips): [£/$X]\n• Static carousel: [£/$X]\n\nContact: [email] · [@handle]",
      },
      {
        title: "Rate Card",
        body: "Standard rates (organic, 30 days usage, no paid amplification):\n\n— 1 Reel: [£/$X]\n— 1 Reel + 3 Stories: [£/$X]\n— Story-only set (5 frames): [£/$X]\n— Static post / carousel: [£/$X]\n— UGC raw clips (per clip): [£/$X]\n— Bundle: 3 Reels over 30 days: [£/$X]\n\nAdd-ons:\n— Paid usage rights (90 days): +50%\n— Whitelisting / dark posting: +30%\n— Exclusivity in category (30 days): +25%\n— Rush turnaround (<5 days): +20%\n\nAll rates exclude VAT/tax. 50% deposit before filming, 50% on delivery.",
      },
      {
        title: "Invoice template",
        body: "INVOICE\n\nFrom: [Your name / business name]\n[Your address]\n[Your email]\n\nTo: [Brand legal name]\n[Brand billing address]\n\nInvoice #: [0001]\nIssue date: [date]\nDue date: [date + 30 days]\n\nLine items:\n— [Deliverable], usage [X], rights [X] ......... [£/$X]\n— [Add-on if any] .................................. [£/$X]\n\nSubtotal: [£/$X]\nTax / VAT ([X]%): [£/$X]\nTotal due: [£/$X]\n\nPayment to:\nBank: [bank name]\nAccount name: [name]\nSort / IBAN / routing: [details]\n\nThank you 🤍",
      },
      {
        title: "Contract essentials checklist",
        body: "Before you film, your agreement should state:\n\n• Deliverables (count, platform, format)\n• Usage rights (organic only? paid? whitelisting? duration?)\n• Exclusivity (category + duration)\n• Approval rounds (1 round of feedback is standard)\n• Posting window (date range, not a fixed day)\n• Payment terms (50/50 split, NET 30 max)\n• Kill fee (25–50% if cancelled after concept approved)\n• Content ownership after usage window expires\n• FTC / ASA disclosure language (#ad, paid partnership tool)\n\nIf any of these are missing — reply asking for them in writing before filming.",
      },
    ],
  },
];