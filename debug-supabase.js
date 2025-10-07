// Script de diagnostic Supabase
// Exécuter avec: node debug-supabase.js

console.log('🔍 DIAGNOSTIC SUPABASE - Global Star Distribution');
console.log('==================================================');

// Vérifier les variables d'environnement
const fs = require('fs');
const path = require('path');

// Lire le fichier .env.local s'il existe
const envPath = path.join(__dirname, '.env.local');
let envContent = '';

try {
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Fichier .env.local trouvé');
  } else {
    console.log('❌ Fichier .env.local non trouvé');
  }
} catch (error) {
  console.log('❌ Erreur lors de la lecture de .env.local:', error.message);
}

// Analyser le contenu
const lines = envContent.split('\n');
let supabaseUrl = '';
let supabaseKey = '';
let vapidKey = '';

lines.forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1];
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1];
  }
  if (line.startsWith('VITE_VAPID_PUBLIC_KEY=')) {
    vapidKey = line.split('=')[1];
  }
});

console.log('\n📋 Configuration détectée:');
console.log('  VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configuré' : '❌ Non configuré');
console.log('  VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configuré' : '❌ Non configuré');
console.log('  VITE_VAPID_PUBLIC_KEY:', vapidKey ? '✅ Configuré' : '❌ Non configuré');

// Vérifier les valeurs par défaut
const isDefaultUrl = supabaseUrl === 'https://your-project.supabase.co' || !supabaseUrl;
const isDefaultKey = supabaseKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here' || !supabaseKey;

console.log('\n🔧 Validation:');
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
  
  console.log('\n💡 Actions requises:');
  if (!supabaseUrl || isDefaultUrl) {
    console.log('1. Configurez VITE_SUPABASE_URL avec votre vraie URL Supabase');
  }
  if (!supabaseKey || isDefaultKey) {
    console.log('2. Configurez VITE_SUPABASE_ANON_KEY avec votre vraie clé anonyme');
  }
}

console.log('\n📝 Prochaines étapes:');
if (isConfigured) {
  console.log('1. Vérifiez que les tables sont créées dans Supabase');
  console.log('2. Testez la connexion avec le composant SupabaseTest');
  console.log('3. Configurez l\'utilisateur admin');
} else {
  console.log('1. Créez un projet sur https://supabase.com');
  console.log('2. Récupérez vos clés dans Settings > API');
  console.log('3. Mettez à jour le fichier .env.local');
  console.log('4. Exécutez les scripts SQL fournis');
}

console.log('\n🔗 Liens utiles:');
console.log('- Supabase Dashboard: https://supabase.com/dashboard');
console.log('- Documentation: https://supabase.com/docs');
console.log('- Guide de configuration: GUIDE_CONFIGURATION_COMPLET.md');

console.log('\n📊 Fichiers de configuration:');
const configFiles = [
  'supabase-schema.sql',
  'supabase-rls.sql', 
  'supabase-init-data.sql',
  'supabase-admin-setup.sql'
];

configFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${file}: ${exists ? '✅ Trouvé' : '❌ Manquant'}`);
});

console.log('\n✨ Diagnostic terminé !');
