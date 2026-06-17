# Shipping Blym to the App Store

This project is pre-wired with Capacitor so the iOS app opens inside the native
shell and submits cleanly to App Store Connect.

## What you need
- A Mac with Xcode 15+
- Node 20 or 22 installed locally
- An Apple Developer account ($99/year)
- This project cloned locally (Lovable → GitHub → clone)

## One-time setup (on your Mac)

```bash
# 1. Install deps
npm install

# 2. Recreate the native iOS project from the current config
npm run ios:reset

# 3. Open Xcode only after the sync finishes successfully
npm run ios:open
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
Run `npm run ios:sync-native` before opening Xcode so Capacitor copies the latest
web build into the iOS project. Content/UI changes require a new iOS build upload.

If the app ever opens Safari instead of staying in the iOS shell, delete the old
local native folder and run `npm run ios:reset` again so Xcode uses the latest
Capacitor config.

## Apple review fixes (June 2026)

If Apple rejects with "blank white page on iPad":
1. We disabled `limitsNavigationsToAppBoundDomains` in `capacitor.config.ts`.
   That flag requires a matching `WKAppBoundDomains` array in `App/App/Info.plist`;
   without it WKWebView blocks the initial navigation and renders a blank screen.
2. Re-run `npm run ios:reset` on your Mac so the new config is written into the
   native iOS project, then Archive and re-upload.

If Apple rejects with "icon duplicates another app" (Guideline 4.3a):
1. The new unique icon lives at `public/blym-icon.png` (1024×1024).
2. In Xcode open `App/App/Assets.xcassets/AppIcon.appiconset`, replace the
   1024×1024 marketing icon with the new PNG, regenerate the smaller sizes
   (Xcode auto-fills from the 1024 slot in single-size mode), then Archive
   and re-upload.