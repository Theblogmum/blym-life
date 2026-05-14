
# Bloom Growth Coach — full build

Five connected pieces, one new top-nav entry **"Growth Coach"**, plus a Pinterest connection in Settings. Gated behind the existing 3-day trial / paid tier.

## 1. Growth Coach chat (`/_authenticated/growth-coach`)

Streaming chat with **Bloom**, your strategist persona. Pulls live context every turn:
- Creator profile (niche, vibe, platforms, audience, goals)
- Last 14 days of `posts_logged` (likes, views, saves, hook style)
- Last 7 `daily_briefs` (filmed vs not)
- Active `creator_goals`
- Day of week + time of day

System prompt frames Bloom as a UK mum-creator strategist: spots patterns ("your last 3 sub-2k reels all opened with a question — try POV"), suggests next move, can call internal tools to draft a hook, generate a caption, or open the scheduler.

Stored in new `coach_messages` (user_id, role, content, created_at) so chat history persists.

## 2. In-app scheduler + reminders (`/_authenticated/schedule`)

The honest version of "auto-posting" — because IG/TikTok/YouTube don't allow real third-party publishing for personal accounts.

- New table `scheduled_posts`: id, user_id, platform, caption, hook, media_url (optional), scheduled_for, status (`scheduled|reminded|posted|skipped`), reminded_at, posted_at.
- Calendar + list view of upcoming posts.
- "Compose" drawer pre-fills from any saved hook/caption/brief in one click.
- **Cron** (`/api/public/cron/post-reminders`, runs every 10 min via pg_cron): finds due posts, sends a Resend email with the caption + media link ready to copy/paste, marks `status=reminded`. Optional browser push later.
- One-click "Mark as posted" → auto-creates a `posts_logged` row to start tracking.

## 3. Audience-fit scoring

A small panel inside the Generator + Coach + Scheduler.
- Paste a hook or caption → server fn scores 0–100 against the creator's profile + recent best performers, returns: score, the one weakest line, one rewritten alternative.
- Pure AI call, no extra storage.

## 4. Weekly growth report

Every Monday 8am cron emails a 1-screen report:
- Followers delta (from a tiny `growth_snapshots` table the user fills weekly — 30-sec form in-app)
- Best post of the week (from `posts_logged`)
- AI verdict: "Carousels outperformed reels 3:1 — lean carousel next week"
- 3 ready-to-film hooks for the coming week
- Stored as a row in `growth_reports` + emailed via Resend.

## 5. Pinterest auto-pin (the only platform that legitimately allows it)

- Settings → "Connect Pinterest" → OAuth.
- New table `pinterest_tokens` (user_id, access_token encrypted, refresh_token, expires_at, board_id).
- Compose a Pin in-app (image upload, title, description, link, board) → stored in `scheduled_posts` with `platform='pinterest'`.
- Same cron above, when a Pinterest pin is due → call Pinterest API, mark `status=posted`. **Real auto-publishing.**

### What I need from you for Pinterest

1. Go to https://developers.pinterest.com → create an app (free, ~5 min).
2. Set OAuth redirect URI to: `https://blym.life/api/public/pinterest/callback`
3. Copy **App ID** and **App secret** — I'll prompt for them via the secrets tool when the rest is built.

Until those secrets are added, the "Connect Pinterest" button will say "Coming soon — admin setup needed" and the scheduler will work for IG/TikTok/YouTube reminders only.

## What I will NOT build (and why)

- Auto-posting to Instagram / TikTok / YouTube. Their APIs don't permit it for personal/creator accounts without Marketing Partner approval (months of review, business accounts only). Anyone who claims otherwise is using brittle reminder hacks. We'll do reminders honestly.
- "Audience targeting" / boosting. That's paid ads, not organic — out of scope and not what you asked for.

## Files (new)

- `src/routes/_authenticated/growth-coach.tsx`
- `src/routes/_authenticated/schedule.tsx`
- `src/routes/api/public/cron/post-reminders.ts`
- `src/routes/api/public/cron/weekly-report.ts`
- `src/routes/api/public/pinterest/callback.ts`
- `src/lib/coach.functions.ts` (streaming chat fn)
- `src/lib/schedule.functions.ts`
- `src/lib/audience-fit.functions.ts`
- `src/lib/growth-report.functions.ts`
- `src/lib/pinterest.server.ts`
- `src/components/growth-snapshot-form.tsx`

## Files (edited)

- `src/components/app-shell.tsx` — add "Growth Coach" + "Schedule" nav items
- `src/routes/_authenticated/settings.tsx` — add "Connect Pinterest" card

## Migrations (one)

- `coach_messages`, `scheduled_posts`, `growth_snapshots`, `growth_reports`, `pinterest_tokens` — all with owner-only RLS.
- pg_cron schedules for the two cron routes.

## Build order

1. Migration + Coach chat (#1) — biggest "wow" on day one.
2. Scheduler + reminder cron (#2).
3. Audience-fit + weekly report (#3, #4).
4. Pinterest UI stubbed → I ping you for App ID/secret → wire OAuth + publish (#5).

---

**Confirm and I'll start with the migration + Coach chat.** Or tell me to drop/swap any piece.
