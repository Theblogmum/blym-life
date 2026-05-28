import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'life.blym.app',
  appName: 'Blym',
  webDir: 'native-shell',
  server: {
    allowNavigation: ['www.blym.life', 'blym.life', '*.blym.life'],
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;