import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blym.app',
  appName: 'Blym',
  webDir: 'native-shell',
  server: {
    url: 'https://www.blym.life',
    cleartext: false,
    allowNavigation: [
      'www.blym.life',
      'blym.life',
      '*.blym.life',
      '*.supabase.co',
      '*.lovable.app',
      '*.lovable.dev',
    ],
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'com.blym.app',
    // App-Bound Domains requires a matching WKAppBoundDomains entry in Info.plist.
    // Leaving this on without that entry causes WKWebView to block navigation and
    // render a blank white screen on iPad (Apple review rejection).
    limitsNavigationsToAppBoundDomains: false,
  },
};

export default config;