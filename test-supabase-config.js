// Script de test pour vérifier la configuration Supabase
// Exécuter dans la console du navigateur ou comme script Node.js

console.log('🔍 Test de Configuration Supabase');
console.log('================================');

// Vérifier les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('📋 Variables d\'environnement:');
console.log('  VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configuré' : '❌ Non configuré');
console.log('  VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configuré' : '❌ Non configuré');

// Vérifier les valeurs par défaut
const isDefaultUrl = supabaseUrl === 'https://your-project.supabase.co';
const isDefaultKey = supabaseKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here';

console.log('\n🔧 Configuration:');
console.log('  URL par défaut:', isDefaultUrl ? '❌ Oui (à changer)' : '✅ Personnalisée');
console.log('  Clé par défaut:', isDefaultKey ? '❌ Oui (à changer)' : '✅ Personnalisée');

// Vérifier la configuration complète
const isConfigured = supabaseUrl && supabaseKey && !isDefaultUrl && !isDefaultKey;

console.log('\n🎯 Résultat:');
if (isConfigured) {
  console.log('✅ Configuration Supabase valide');
  console.log('🚀 L\'application devrait fonctionner en mode en ligne');
} else {
  console.log('❌ Configuration Supabase invalide');
  console.log('📱 L\'application fonctionnera en mode hors ligne');
  
  if (!supabaseUrl || isDefaultUrl) {
    console.log('💡 Configurez VITE_SUPABASE_URL dans .env.local');
  }
  if (!supabaseKey || isDefaultKey) {
    console.log('💡 Configurez VITE_SUPABASE_ANON_KEY dans .env.local');
  }
}

console.log('\n📝 Prochaines étapes:');
if (isConfigured) {
  console.log('1. Vérifiez que les tables sont créées dans Supabase');
  console.log('2. Testez la connexion avec le composant SupabaseTest');
  console.log('3. Configurez l\'utilisateur admin');
} else {
  console.log('1. Créez un projet Supabase');
  console.log('2. Configurez les variables d\'environnement');
  console.log('3. Exécutez les scripts SQL fournis');
}

console.log('\n🔗 Liens utiles:');
console.log('- Documentation Supabase: https://supabase.com/docs');
console.log('- Guide de configuration: GUIDE_CONFIGURATION_COMPLET.md');
console.log('- Test de connexion: /test-supabase');
