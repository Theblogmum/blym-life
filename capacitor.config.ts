import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blym.app',
  appName: 'Blym',
  webDir: 'dist/client',
  server: {
    hostname: 'localhost',
    iosScheme: 'capacitor',
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    appendUserAgent: 'BlymNativeIOS',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;