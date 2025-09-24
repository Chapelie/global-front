// Script pour vider toutes les données de test
// Exécuter dans la console du navigateur si nécessaire

console.log('🗑️ Suppression de toutes les données de test...')

// Supprimer toutes les clés de l'application
const keys = [
  'briqueapp_production',
  'briqueapp_commandes', 
  'briqueapp_livraisons',
  'briqueapp_stock',
  'briqueapp_documents',
  'briqueapp_employes',
  'briqueapp_rapports_quotidiens'
]

keys.forEach(key => {
  localStorage.removeItem(key)
  console.log(`✅ Supprimé: ${key}`)
})

// Garder seulement les utilisateurs
console.log('✅ Données de test supprimées')
console.log('👤 Les utilisateurs de connexion sont conservés')
console.log('🔄 Rechargez la page pour voir l\'application vide')
