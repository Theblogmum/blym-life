# Shipping Blym to the App Store

This project is pre-wired with Capacitor so you can wrap the live web app
(`https://blym.life`) in a native iOS shell and submit it to App Store Connect.

## What you need
- A Mac with Xcode 15+
- An Apple Developer account ($99/year)
- This project cloned locally (Lovable → GitHub → clone)

## One-time setup (on your Mac)

```bash
# 1. Install deps
npm install

# 2. Add the native iOS project (creates /ios folder)
npx cap add ios

# 3. Sync the Capacitor config + plugins into Xcode
npx cap sync ios

# 4. Open in Xcode
npx cap open ios
```

## In Xcode
1. Select the `App` target → **Signing & Capabilities** → pick your Team.
2. Set Bundle Identifier to `life.blym.app` (already in `capacitor.config.ts`).
3. Add app icons: drag a 1024×1024 PNG into `Assets.xcassets/AppIcon`.
4. Build → **Any iOS Device** → **Product → Archive** → **Distribute → App Store Connect**.

## App Store Connect
1. Create the app at https://appstoreconnect.apple.com (Bundle ID `life.blym.app`).
2. Fill in: privacy policy (`https://blym.life/privacy`), terms (`https://blym.life/terms`),
   support URL (`https://blym.life/contact`), description, screenshots (6.7" + 6.5" iPhone).
3. Upload the build from Xcode, attach it to your version, submit for review.

## How updates work
Because `capacitor.config.ts` points `server.url` at the live site, **any change
you publish from Lovable shows up in the iOS app instantly** — no resubmission
needed for content/UI tweaks. You only need to resubmit when:
- You change native config (icons, splash, plugins, permissions)
- Apple requires a metadata update

## If you want a fully offline build later
1. Remove `server.url` from `capacitor.config.ts`.
2. Run `npm run build` then `npx cap sync ios`.
3. The app will ship the bundled `dist/` folder instead of loading from the web.
   Note: TanStack Start is SSR by default — for a true offline bundle you'd need
   to switch to static export. The hosted approach above is the recommended path.