import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'life.blym.app',
  appName: 'Blym',
  webDir: 'dist',
  server: {
    // Point at the published Lovable site so the iOS shell loads the live app.
    // Change to a local build path or remove `url` to ship a fully offline bundle.
    url: 'https://blym.life',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;