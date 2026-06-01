
# Blym UI Philosophy Upgrade — "Magical Creator Playground"

This is a **big** change touching most pages. To keep it manageable (and reviewable), I want to roll it out in **3 phases**, starting with the foundations so every page upgrade is consistent.

---

## Phase 1 — Foundation (shared design system upgrades)

Built once, reused everywhere.

1. **New tokens in `src/styles.css`**
   - Richer gradients (warm sunrise, bloom, aurora, cozy cream)
   - Glassmorphism token: `--glass-bg`, `--glass-border`, `--glass-blur` (standard `backdrop-filter` only — no `-webkit-` prefix, per Tailwind 4 build rules)
   - Soft glow shadows (`--glow-rose`, `--glow-peach`, `--glow-mint`)
   - Lift/hover transitions standardized

2. **New shared components** in `src/components/`
   - `HeroCard` — replaces `PageHero`. A glassy, gradient-edged "experience card" with sparkle icon, eyebrow, headline, subhead, and a slot for a small dopamine widget (streak chip, daily quote, XP pebble).
   - `FloatingCard` — wrapper that adds lift-on-hover, subtle glow, click-pop animation. Replaces flat panels.
   - `CreatorQuote` — rotating creator quotes pulled from a small local list.
   - `DailyNudge` — tiny motivational line ("Post 1 reel today and you keep your streak 🔥").
   - `DopamineMoment` — confetti + sound on key actions (already partly exists via `xpPop` / `celebrate`).

3. **Animations**: add reusable `card-pop`, `float-soft`, `glow-pulse` keyframes.

## Phase 2 — Roll out to high-traffic pages (this turn)

Apply the new system to the pages the user lives in most:

- **My Studio** (`generator.tsx`) — replace `PageHero` with `HeroCard` titled `✨ Welcome to your Studio` / "Let's create something worth posting." Tighten spacing (less whitespace), kind-picker becomes floating glass chips, add a `CreatorQuote` strip + `DailyNudge` near the top, results cards use `FloatingCard`.
- **Daily / App home** (`app.tsx`) — Hero card with streak + daily challenge dopamine moment.
- **Brain Dump** (`brain-dump.tsx`) — Hero card + glass textarea.
- **Vault, Planner, Schedule, Quests, Rewards** — `HeroCard` headers + `FloatingCard` lists.

## Phase 3 — Sweep remaining pages

Same treatment for the long tail (insights, brand hub, media kit, achievements, etc.) — mechanical pass swapping `PageHero` → `HeroCard` and bare panels → `FloatingCard`.

---

## Technical notes

- All colors stay in `src/styles.css` as `oklch` tokens — no hard-coded hex in components.
- Glassmorphism uses **only** the standard `backdrop-filter` property (build prefixes it). Hand-writing `-webkit-backdrop-filter` would break in Chrome production builds.
- `HeroCard` keeps the `PageHero` prop shape (`icon`, `eyebrow`, `title`, `description`, `variant`, `children`) so swap-in is a one-line change per page.
- Respects `prefers-reduced-motion` for all new animations.

---

## What I'd like to confirm before building

Phase 1 + Phase 2 is a meaningful chunk for one turn — visible everywhere you actually use the app. Phase 3 is mechanical and best done as a follow-up so you can react to the new look first.

**Plan: ship Phase 1 + Phase 2 now, then you tell me "keep going" and I do Phase 3.** Sound good?
