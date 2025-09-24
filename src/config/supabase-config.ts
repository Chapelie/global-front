// Configuration Supabase - Global Star Distribution
// ⚠️ REMPLACEZ CES VALEURS PAR VOS VRAIES CLÉS SUPABASE

export const SUPABASE_CONFIG = {
  // URL de votre projet Supabase (ex: https://your-project.supabase.co)
  url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  
  // Clé publique anonyme de votre projet Supabase
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here',
  
  // Configuration des notifications push (optionnel)
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || 'your_vapid_public_key'
}

// Vérification de la configuration
export const validateSupabaseConfig = () => {
  const { url, anonKey } = SUPABASE_CONFIG
  
  if (!url || url === 'https://your-project.supabase.co') {
    throw new Error(`
🚨 CONFIGURATION SUPABASE MANQUANTE !

Pour corriger cette erreur :

1. Créez un projet sur https://supabase.com
2. Récupérez vos clés dans Settings > API
3. Créez un fichier .env.local avec :
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
4. Redémarrez le serveur : npm run dev

Ou modifiez directement ce fichier avec vos vraies valeurs.
    `)
  }
  
  if (!anonKey || anonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here') {
    throw new Error(`
🚨 CLÉ SUPABASE MANQUANTE !

Veuillez configurer VITE_SUPABASE_ANON_KEY dans votre fichier .env.local
    `)
  }
  
  return true
}
