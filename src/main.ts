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

// Initialiser la configuration après le montage
import { initAppConfig } from './config/app-config'

// Attendre que l'application soit montée avant d'initialiser la config
setTimeout(() => {
  initAppConfig()
  console.log('🚀 Application Global Star Distribution démarrée')
}, 100)