## What I found

I checked the auth logs, network traffic and the relevant code without modifying anything:

- **Lovable Cloud backend is healthy** — database + auth responding normally.
- **Google login is actually working.** Auth logs show a successful Google login for your account (`theblogmum@gmail.com`) at 13:30 UK today, and the live network requests show your valid session token being attached to backend calls. You are signed in right now.
- **Wiring is correct**: `attachSupabaseAuth` is registered in `src/start.ts`, `requireSupabaseAuth` is present, `auth-attacher` reads the session and adds the bearer token, and `_authenticated` has a proper `beforeLoad` guard.
- **The login/signup pages** use the correct `lovable.auth.signInWithOAuth("google", ...)` broker path and clean email/password fallback — no monkey-patched `window.fetch`, no leaked secrets, no broken imports.

## Why login "looks broken" in the preview

This is a known preview-only issue, not a code bug:

> The Lovable preview iframe injects a fetch proxy that can break Supabase auth POST requests. Auth that works on the live site still fails in the preview window. **The fix is to test on the published URL, not to change app code.**

If I "fix" code based on the preview symptom, I will almost certainly introduce real bugs on the live site (which is what happened during the earlier migration). So the plan below is verification-first, code-changes only if a real bug shows up.

## Plan (credit-light)

1. **You test the published site first**, in a normal browser tab (not the Lovable preview):
   - https://www.blym.life/login
   - https://blym-life.lovable.app/login
   Try both Google login and email/password.

2. **If login works on the published site** → there is nothing to fix. The preview-only failure is expected and harmless. Close the loop here.

3. **If login fails on the published site**, tell me:
   - which URL,
   - which method (Google or email/password),
   - the exact error message or what happens (redirect loop, blank page, toast text),
   - ideally a screenshot.
   I will then look at server function logs + auth logs for that specific failure and patch only what's actually broken — no speculative rewrites.

4. **No code changes in this turn.** This saves credits and avoids breaking anything that currently works (you are signed in right now, per the live network trace).

## Technical notes

- `src/start.ts` already registers `[attachSupabaseAuth]` as `functionMiddleware`. Bearer tokens are attached to server-fn RPCs.
- `src/routes/_authenticated.tsx` gates with `supabase.auth.getUser()` before the loader runs, so authenticated server functions get a valid token on first paint.
- `src/integrations/lovable/index.ts` is the auto-generated Google broker. `login.tsx` and `signup.tsx` call it correctly with `redirect_uri = ${window.location.origin}/app` (or `/onboarding`).
- The earlier migration's trigger restores and brace fixes (dashboard.functions.ts, business.functions.ts, xp.functions.ts) are still in place — I re-read them.
- No `.env`, no `supabase/config.toml`, and no auto-generated client file is being touched.
