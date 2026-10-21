import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mybudget.app',
  appName: 'My Budget',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
