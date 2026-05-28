import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blym.app',
  appName: 'Blym',
  webDir: 'dist',
  server: {
    url: 'https://blym.life',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    appendUserAgent: 'BlymNativeIOS',
  },
};

export default config;