import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.globalstar.distribution',
  appName: 'Global Star Distribution',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#ffffff',
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: false,
    backgroundColor: '#ffffff',
    allowsLinkPreview: false,
    handleApplicationURL: false
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#ffffff',
    webContentsDebuggingEnabled: false
  },

  // 👇 Section pour les assets (logo et splash)
  assets: {
    android: {
      iconBackgroundColor: '#ffffff',
      iconBackgroundColorDark: '#000000',
      splashBackgroundColor: '#ffffff',
      splashBackgroundColorDark: '#000000',
      icon: {
        source: 'src/assets/logo.jpeg'
      },
      splash: {
        source: 'src/assets/logo.jpeg'
      }
    },
    ios: {
      icon: {
        source: 'src/assets/logo.jpeg'
      },
      splash: {
        source: 'src/assets/logo.jpeg'
      }
    }
  }
};

export default config;
