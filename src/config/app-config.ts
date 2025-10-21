// Configuration de l'application Laravel
export const APP_CONFIG = {
  // Mode de fonctionnement
  mode: 'online' as 'offline' | 'online',
  
  // Configuration Laravel
  laravel: {
    enabled: true,
    baseUrl: import.meta.env.VITE_LARAVEL_API_BASE_URL || 'http://localhost:8000/api',
    timeout: 30000
  },
  
  // Synchronisation
  sync: {
    enabled: true,
    interval: 30000, // 30 secondes
    retryAttempts: 3
  }
}

// Initialiser la configuration
export const initAppConfig = () => {
  APP_CONFIG.mode = 'online'
  APP_CONFIG.laravel.enabled = true
  APP_CONFIG.sync.enabled = true
  console.log('✅ Mode Laravel activé')
  
  return APP_CONFIG
}
