import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'life.blym.app',
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
      'accounts.google.com',
      '*.google.com',
      '*.googleusercontent.com',
      'appleid.apple.com',
      '*.apple.com',
      'oauth.lovable.app',
    ],
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'life.blym.app',
    limitsNavigationsToAppBoundDomains: false,
  },
};

export default config;