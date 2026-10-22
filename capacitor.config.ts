import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mybudget.app',
  appName: 'My Budget',
  webDir: 'dist',
  server: {
    url: 'https://my-budget-app-sandy.vercel.app',
    androidScheme: 'https',
    cleartext: false
  }
};

export default config;
