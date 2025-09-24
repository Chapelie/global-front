// Configuration de l'application
export const APP_CONFIG = {
  // Mode de fonctionnement
  mode: 'offline' as 'offline' | 'online',
  
  // Configuration Supabase (optionnel)
  supabase: {
    enabled: false,
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  },
  
  // Synchronisation
  sync: {
    enabled: false,
    interval: 30000, // 30 secondes
    retryAttempts: 3
  }
}

// Vérifier si Supabase est configuré (même logique que supabase.ts)
export const isSupabaseConfigured = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  return supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here'
}

// Initialiser la configuration
export const initAppConfig = () => {
  // Vérifier la configuration Supabase avec la même logique que supabase.ts
  if (isSupabaseConfigured()) {
    APP_CONFIG.mode = 'online'
    APP_CONFIG.supabase.enabled = true
    APP_CONFIG.supabase.url = import.meta.env.VITE_SUPABASE_URL
    APP_CONFIG.supabase.anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    APP_CONFIG.sync.enabled = true
    console.log('✅ Mode en ligne activé (Supabase configuré)')
  } else {
    APP_CONFIG.mode = 'offline'
    APP_CONFIG.supabase.enabled = false
    APP_CONFIG.sync.enabled = false
    console.log('📱 Mode hors ligne activé')
  }
  
  return APP_CONFIG
}
