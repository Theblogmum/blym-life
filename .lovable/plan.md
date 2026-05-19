
# Global Premium Elevation — Blym

Goal: make the whole internal app feel as premium, emotional, and cohesive as the landing page — without redesigning layouts or breaking functionality.

Strategy: edit at the **system layer** (tokens + shared components) so improvements cascade across ~80 internal pages automatically. Then polish the two pages explicitly called out.

---

## Phase 1 — Design System Layer (cascades app-wide)

**`src/styles.css`**
- Soften corner radii globally (`--radius` +2px, premium cards +4px)
- Layered shadow system: `--shadow-soft`, `--shadow-elegant`, `--shadow-bloom-glow` (warm rose-tinted)
- New gradient tokens: `--gradient-page-warm` (subtle background wash), `--gradient-card-premium` (faint blush sheen)
- Tighten typography rhythm: heading line-height, paragraph max-width default
- Premium motion timing tokens: `--ease-soft`, `--duration-page`

**`src/components/ui/card.tsx`**
- Default to softer radius + layered shadow
- Add `premium` variant with gradient sheen + warm border tint
- Hover lift micro-interaction (translate-y + shadow grow)

**`src/components/ui/button.tsx`**
- Already has lift — add `soft` variant with blush tint for secondary CTAs
- Refine focus ring to warm rose

**`src/components/ui/input.tsx` + `textarea.tsx`**
- Softer borders, warm focus glow, premium padding rhythm

**`src/components/empty-state.tsx`**
- Add subtle animated breathing on icon
- Add `aspirational` variant (blurred preview ghost behind)
- Warm gradient backing

**`src/components/page-hero.tsx`**
- Gentle fade-in on mount, layered glow blobs (already partial)
- Tighter type scale rhythm

## Phase 2 — Motion Layer

- Add `.premium-card` utility (hover lift + shadow morph)
- Add `.fade-up-in` page-mount animation, applied via root layout
- Soft loading state: replace bare spinners with breathing blush pulse component
- Save interactions: subtle scale+glow flash on successful mutations (toast already exists — enhance with rose accent)

## Phase 3 — Targeted Page Lifts

**`src/routes/_authenticated/motivation.tsx` (Daily Pep Talk)**
- Mood-based gradient hero (rotates by day-of-week affirmation tone)
- Favourite/save heart on each card (localStorage first, can wire to DB later)
- Streak chip pulled into hero
- Smoother card stagger fade-in
- Premium card elevation

**`src/routes/_authenticated/rejection-recovery.tsx`**
- Calmer hero gradient (bloom→blush)
- Result cards reformat as conversation-style bubbles (Bloom speaking)
- Add "tiny next step" CTA buttons that feel actionable
- Soft entry animations
- Comforting microcopy pass

## Phase 4 — Microcopy Pass (high-leverage only)

Touch the most-visited surfaces only (avoid 80-page rewrite):
- App dashboard empty states & section headers
- Common button labels in shared components ("Save" → "Save it ✨" where it fits)
- Toast success messages (warmer, creator-voice)

## What I'm NOT doing
- Landing page — untouched
- Brand colors / identity — untouched
- Layout restructures — untouched
- Adding new widgets/charts
- Full 80-page microcopy rewrite (out of scope for one pass — flag follow-ups instead)

---

## Technical notes
- All token changes in `src/styles.css` via `oklch()` (matches existing system)
- Shared component edits use `cn()` + `cva` patterns already in repo
- No DB / server function changes
- No new dependencies
- Estimated files touched: ~10 (system) + 2 (pages) = ~12 files, cascading to 80+ pages visually

Ready to ship Phase 1 → 4 in that order. Approve and I'll start.
