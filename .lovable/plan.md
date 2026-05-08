
This is a big scope so I'm staging it across two database migrations and four feature areas. Everything here will go in one delivery unless you'd rather split it.

## 1. Free model → strict 3-day trial

Today the system gives free users 3 runs/day forever on every premium tool. I'll change it to:

- **Day 0–3 from signup** (`profiles.trial_started_at`): full unlimited access to generator, viral lab, recycler, UGC pitch, templates, brand outreach.
- **Day 4+** (free, no subscription): only **basic captions** in the Content Generator. Every other tool, plus hooks/scripts/hashtags inside the generator, shows a hard upgrade card.
- Premium subscribers (monthly / yearly / lifetime): unchanged, unlimited everything.
- A trial countdown chip ("2 days left of your trial") appears in the top nav while active; switches to "Captions free · upgrade for the rest" once expired.

I'll add a `trialStatus()` server helper used by every feature gate, replacing the current `enforceQuota` per-day counter. The `usage_events` table stays for analytics but no longer blocks.

## 2. Landing page — visual, not text-heavy

Rework `src/routes/index.tsx`:
- Big hero with a generated lifestyle image (mum filming on phone) + bold headline, sub-line, two CTAs.
- Three feature tiles with icons + 1 sentence each (no paragraphs).
- "How it works" — 3 steps as illustrated cards.
- Social-proof strip (placeholder testimonials you can edit).
- Pricing teaser → links to /settings.
- FAQ accordion at the bottom (collapsed = visually light).
- Generated supporting images via the image tool, kept in `src/assets/`.

App pages also get more breathing room: wider max-width on desktop, more vertical rhythm, a sticky "secondary nav" strip on tool pages with anchors (Generate / Tips / Saved).

## 3. New: Template Studio (smart templates)

New route `/_authenticated/templates` + nav entry under "Create".

- One textarea: "What do you need?" (e.g. *"reply to a brand offering free product"* or *"promo my new sleep guide"*).
- AI classifies intent → returns 3–5 ready-to-use options.
- Each option shows: title, full body (post script OR email/DM), 1-line "why this works", copy/save buttons.
- Server fn: `generateTemplates` in `src/lib/templates.functions.ts`.
- Gated behind 3-day trial; basic captions remain the free fallback.

## 4. New: Brand Hub — directory + Gmail outreach + tracking

New route `/_authenticated/brand-hub` with three tabs: **Discover**, **My Outreach**, **Inbox status**.

### Database (migration 1)
- `brands` (public read, admin write): name, website, category, hq_country, description, logo_url, contact_email, instagram, notes, is_seeded.
- `user_brands` (private add): user_id, name, website, contact_email, notes — a creator's own additions.
- `brand_pitches`: id, user_id, brand_id (nullable), user_brand_id (nullable), recipient_email, subject, body, status (`draft|sent|followed_up|replied|bounced|cancelled`), gmail_message_id, gmail_thread_id, sent_at, follow_up_due_at, follow_up_sent_at, replied_at, created_at.
- Unique partial index on `(user_id, lower(recipient_email))` where status in (`sent`,`followed_up`) → prevents double-sending.
- RLS: `brands` public-readable; `user_brands` & `brand_pitches` owner-only.

### Seed data
~50 UK mum-friendly brands (baby/toddler/beauty/home/food) inserted with public PR/marketing emails. You'll get an admin "Add brand" form that uses the `admin` role (already in `app_role`) for adding more.

### Gmail OAuth (per creator)

This is the **biggest external dependency** — and I need to be transparent: the Lovable "Gmail" connector links **your** Gmail, not each creator's. To send pitches from each creator's own address, we need a custom Google OAuth app that each user authorises.

That means **before I can build the send/reply path**, you'll need to:
1. Create a Google Cloud project (free).
2. Enable the Gmail API.
3. Create OAuth 2.0 Web credentials with redirect URI `https://theblogmumstudio.com/api/public/google/callback`.
4. Submit the consent screen for verification with the `gmail.send` and `gmail.readonly` scopes (Google review takes ~1–4 weeks; in test mode you can add up to 100 testers immediately).
5. Add `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` as secrets.

I'll build everything around it now. Until those secrets are added, the "Connect Gmail" button will show a friendly "Coming soon — admin setup needed" state, and pitches save as **drafts** (subject + body + recipient) so creators can copy/paste in the meantime.

### Once Gmail is wired
- `/api/public/google/callback` — OAuth handler, stores refresh token in new `google_tokens` table (RLS owner-only, encrypted column).
- `sendPitch` server fn → uses creator's refresh token to send via Gmail API → records `gmail_message_id`, `gmail_thread_id`, sets `follow_up_due_at = now() + 4 days`, status `sent`.
- `checkReplies` cron (pg_cron + new public route, runs every 6h) → for each `sent`/`followed_up` pitch, hits Gmail `users.messages.list?q=rfc822msgid:<id>` on its thread; if any inbound message exists, marks `replied`.
- `sendFollowUps` cron (daily 9am) → for each pitch where `status='sent'` AND `follow_up_due_at <= now()` AND `replied_at IS NULL`, sends the follow-up template, sets `status='followed_up'` and `follow_up_sent_at`.
- Double-send guard: before insert/send, query existing pitch to same `(user_id, lower(email))` not in `cancelled`/`replied` → blocks with toast "You've already pitched this brand."

### UI
- **Discover**: searchable grid of brand cards with "Pitch" button. Opens a side-panel with AI-generated pitch (existing `generatePitch` fn) prefilled, editable, with "Send" or "Save draft".
- **My Outreach**: table of all pitches with status badges, sent/follow-up dates, brand name, subject preview, "View thread" link.
- **Inbox status**: simple counters — sent / awaiting reply / replied / follow-ups due.

## 5. Top-nav additions

Adds two items to the "Create" dropdown: **Template Studio**, **Brand Hub**. Trial countdown chip top-right. Mobile menu mirrors.

## Files (new + edited)

**New**
- `src/routes/_authenticated/templates.tsx`
- `src/routes/_authenticated/brand-hub.tsx`
- `src/routes/api/public/google/callback.ts`
- `src/routes/api/public/cron/follow-ups.ts`
- `src/routes/api/public/cron/check-replies.ts`
- `src/lib/templates.functions.ts`
- `src/lib/brands.functions.ts`
- `src/lib/pitches.functions.ts`
- `src/lib/gmail.server.ts`
- `src/lib/trial.server.ts`
- `src/components/trial-chip.tsx`
- `src/components/brand-card.tsx`
- `src/components/pitch-composer.tsx`
- `src/assets/landing-hero.jpg` (generated)
- `src/assets/landing-step-*.jpg` (generated)

**Edited**
- `src/routes/index.tsx` (full landing rewrite)
- `src/components/app-shell.tsx` (nav + trial chip)
- `src/lib/generator-helpers.server.ts` (replace quota with trial)
- `src/lib/generator.functions.ts`, `viral-lab`, `recycler`, `ugc-hub` routes (gate change)
- `src/lib/usage.functions.ts` → `src/lib/trial.functions.ts`

**Migrations**
1. Add `trial_started_at` to `profiles` (default `now()`, backfill existing users), then enable on signup trigger.
2. Create `brands`, `user_brands`, `brand_pitches`, `google_tokens` with RLS, indexes, and seed insert for ~50 brands.

## What I need from you to start

- **Confirm the plan** as a whole.
- **Confirm**: do I proceed building the Brand Hub UI + drafts flow now, with the Gmail connect button stubbed until you complete the Google Cloud OAuth setup? Or wait on everything until you have the OAuth credentials?
