import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'life.blym.app',
  appName: 'Blym',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
  },
};

export default config;