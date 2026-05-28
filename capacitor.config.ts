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
    limitsNavigationsToAppBoundDomains: true,
  },
};

export default config;