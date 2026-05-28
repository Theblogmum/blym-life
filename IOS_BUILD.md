# Shipping Blym to the App Store

This project is pre-wired with Capacitor so you can ship the bundled app assets
inside a native iOS shell and submit it to App Store Connect.

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

# 3. Build local web assets, remove stale remote config, sync plugins into Xcode
npm run ios:sync-native

# 4. Open in Xcode
npx cap open ios
```

## In Xcode
1. Select the `App` target → **Signing & Capabilities** → pick your Team.
2. Set Bundle Identifier to `com.blym.app` (already in `capacitor.config.ts`).
3. Add app icons: drag a 1024×1024 PNG into `Assets.xcassets/AppIcon`.
4. Build → **Any iOS Device** → **Product → Archive** → **Distribute → App Store Connect**.

## App Store Connect
1. Create the app at https://appstoreconnect.apple.com (Bundle ID `com.blym.app`).
2. Fill in: privacy policy (`https://blym.life/privacy`), terms (`https://blym.life/terms`),
   support URL (`https://blym.life/contact`), description, screenshots (6.7" + 6.5" iPhone).
3. Upload the build from Xcode, attach it to your version, submit for review.

## Native iOS launch check
Before opening Xcode, run:

```bash
npm run ios:sync-native
```

This deletes stale `ios/App/App/capacitor.config.json` and `ios/App/App/public`,
rebuilds the local bundle, runs `npx cap sync ios`, then verifies the generated
iOS config has no `server.url`, live reload URL, or `https://blym.life` launch URL.

If the verify step passes, delete Blym from the iPhone, clean the Xcode build
folder, then run the app from Xcode again.

## How updates work
The iOS app now loads bundled local assets from `dist/client`. UI/code changes
must be rebuilt and re-synced into Xcode before testing or submitting a new build.