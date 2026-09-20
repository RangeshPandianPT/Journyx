import type { CapacitorConfig } from '@capacitor/cli';
import { networkInterfaces } from 'os';

const getIpAddress = () => {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

const config: CapacitorConfig = {
  appId: 'com.rangesh.journyx',
  appName: 'Journyx',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff'
    }
  }
};

// Enable live reload when LIVE_RELOAD env variable is set
if (process.env.LIVE_RELOAD === 'true') {
  const ip = getIpAddress();
  console.log(`\n⚡️ [Capacitor] Live Reload enabled. Server URL: http://${ip}:5173 ⚡️\n`);
  config.server = {
    url: `http://${ip}:5173`,
    cleartext: true
  };
}

export default config;

