import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.globalstar.app',
  appName: 'Global Star',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#C98B3B',
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFFFFF',
      showSpinner: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: false,
    backgroundColor: '#FFFFFF',
    allowsLinkPreview: false,
    handleApplicationURL: false
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#FFFFFF',
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
