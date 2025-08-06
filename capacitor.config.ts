import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourapp.id',
  appName: 'Your App Name',
  webDir: 'out', // ✅ Tell Capacitor to use the exported output
  bundledWebRuntime: false,
};

export default config;
