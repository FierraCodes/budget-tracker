import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fierracodes.moneymanager',
  appName: 'Money Manager',
  webDir: 'out', // ✅ Tell Capacitor to use the exported output
  bundledWebRuntime: false,
};

export default config;
