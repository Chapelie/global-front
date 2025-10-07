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
import { useAuth } from './services/auth'
// syncManager supprimé - plus nécessaire avec 100% Supabase

// Attendre que l'application soit montée avant d'initialiser
setTimeout(async () => {
  try {
    // Initialiser la configuration
    initAppConfig()
    console.log('🚀 Application Global Star Distribution démarrée')
    
    // Initialiser l'authentification Supabase
    const { initAuth } = useAuth()
    await initAuth()
    console.log('✅ Authentification Supabase initialisée')
    
    // Synchronisation automatique via Supabase
    console.log('✅ Mode 100% Supabase - synchronisation automatique')
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
  }
}, 100)