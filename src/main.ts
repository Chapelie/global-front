import { createApp } from 'vue'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './initGlobals'

// Initialiser l'application
const app = createApp(App)

// Router
app.use(router)

// Monter l'application
app.mount('#app')

// Initialiser la configuration et l'authentification après le montage
import { initAppConfig } from './config/app-config'
import { useLaravelAuth } from './services/laravelAuth'

// Attendre que l'application soit montée avant d'initialiser
setTimeout(async () => {
  try {
    // Configuration Capacitor pour mobile
    if (Capacitor.isNativePlatform()) {
      // Configuration de la status bar
      await StatusBar.setStyle({ style: Style.Default })
      await StatusBar.setBackgroundColor({ color: '#C98B3B' })

      // Masquer le splash screen
      await SplashScreen.hide()

      console.log('📱 Configuration Capacitor activée pour', Capacitor.getPlatform())
    }

    // Initialiser la configuration
    initAppConfig()
    console.log('🚀 Application Global Star Distribution démarrée')

    // Initialiser l'authentification Laravel
    const { init } = useLaravelAuth()
    await init()
    console.log('✅ Authentification Laravel initialisée')

    // Initialiser les notifications push
    try {
      const { useNotificationService } = await import('./services/notificationService')
      const notificationService = useNotificationService()
      await notificationService.initialize()
      console.log('✅ Service de notifications initialisé')
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des notifications:', error)
    }

    // Mode Laravel avec Sanctum
    console.log('✅ Mode Laravel avec Sanctum - authentification par token')
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
  }
}, 100)