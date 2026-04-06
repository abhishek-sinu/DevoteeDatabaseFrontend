import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vaidhi.sadhanabhakti',
  appName: 'VSB',
  webDir: 'build',
  server: {
    url: 'https://vaidhisadhanabhakti.cloud/login',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      androidSplashResourceName: 'splash',
      backgroundColor: '#ffffff',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
