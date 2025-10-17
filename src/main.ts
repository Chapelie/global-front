import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

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
    // Initialiser la configuration
    initAppConfig()
    console.log('🚀 Application Global Star Distribution démarrée')
    
    // Initialiser l'authentification Laravel
    const { initAuth } = useLaravelAuth()
    await initAuth()
    console.log('✅ Authentification Laravel initialisée')
    
    // Mode Laravel avec Sanctum
    console.log('✅ Mode Laravel avec Sanctum - authentification par token')
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
  }
}, 100)