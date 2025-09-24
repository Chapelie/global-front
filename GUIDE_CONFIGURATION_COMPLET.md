# 🚀 Guide de Configuration Complète

## 📋 **Étapes de Configuration Supabase**

### 1. **Créer les Tables**
Exécutez dans l'éditeur SQL de Supabase :
```sql
-- Copiez et exécutez le contenu de supabase-schema.sql
```

### 2. **Configurer la Sécurité (RLS)**
Exécutez dans l'éditeur SQL de Supabase :
```sql
-- Copiez et exécutez le contenu de supabase-rls.sql
```

### 3. **Créer l'Utilisateur Admin**
Exécutez dans l'éditeur SQL de Supabase :
```sql
-- Copiez et exécutez le contenu de supabase-admin-setup.sql
```

### 4. **Insérer les Données de Démonstration (Optionnel)**
Exécutez dans l'éditeur SQL de Supabase :
```sql
-- Copiez et exécutez le contenu de supabase-init-data.sql
```

## 🔧 **Configuration de l'Application**

### 1. **Variables d'Environnement**
Créez un fichier `.env.local` :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

### 2. **Tester la Connexion**
Ajoutez dans `main.ts` :
```typescript
import { supabase } from './lib/supabase'

// Test de connexion
supabase.from('articles').select('count').then(({ data, error }) => {
  if (error) {
    console.error('❌ Erreur de connexion Supabase:', error)
  } else {
    console.log('✅ Connexion Supabase réussie')
  }
})
```

## 🎛️ **Utilisation des Composants**

### 1. **SyncManager - Gestion de Synchronisation**
```vue
<template>
  <div>
    <!-- Votre contenu existant -->
    <SyncManager />
  </div>
</template>

<script setup>
import SyncManager from './components/SyncManager.vue'
</script>
```

### 2. **SyncAndDeleteManager - Synchronisation et Suppression**
```vue
<template>
  <div>
    <!-- Votre contenu existant -->
    <SyncAndDeleteManager />
  </div>
</template>

<script setup>
import SyncAndDeleteManager from './components/SyncAndDeleteManager.vue'
</script>
```

## 🔄 **Fonctionnalités de Synchronisation**

### 1. **Synchronisation Automatique**
```typescript
import { storageService } from './services/storage'

// Démarrer la synchronisation automatique (toutes les 30 secondes)
storageService.startAutoSync(30000)
```

### 2. **Synchronisation Manuelle**
```typescript
import { useSyncManager } from './services/syncManager'

const { syncAndDelete } = useSyncManager()

// Synchroniser et supprimer les données locales
await syncAndDelete()
```

### 3. **Vérifier le Statut**
```typescript
import { useSyncManager } from './services/syncManager'

const { getSyncStats } = useSyncManager()
const stats = getSyncStats()

console.log('Éléments locaux:', stats.totalLocalItems)
console.log('Synchronisés:', stats.syncedItems)
console.log('En queue:', stats.queueSize)
```

## 📊 **Gestion des Données**

### 1. **Ajouter des Données**
```typescript
// Les données sont automatiquement ajoutées à la queue de sync
const article = storageService.addArticle({
  nom: 'Nouvel article',
  categorie: 'Briques',
  stock: 100
})
```

### 2. **Modifier des Données**
```typescript
// Les modifications sont automatiquement synchronisées
storageService.updateArticle(articleId, {
  stock: 150
})
```

### 3. **Supprimer des Données**
```typescript
// Les suppressions sont automatiquement synchronisées
storageService.deleteArticle(articleId)
```

## 🎯 **Fonctionnalités Avancées**

### 1. **Synchronisation Conditionnelle**
```typescript
// Synchroniser seulement si en ligne
if (navigator.onLine) {
  await storageService.syncAllToSupabase()
} else {
  console.log('Synchronisation différée (hors ligne)')
}
```

### 2. **Gestion des Erreurs**
```typescript
const syncStatus = storageService.getSyncStatus()

if (syncStatus.syncErrors.length > 0) {
  console.error('Erreurs de synchronisation:', syncStatus.syncErrors)
}
```

### 3. **Configuration Personnalisée**
```typescript
// Changer l'intervalle de synchronisation
storageService.startAutoSync(60000) // Toutes les minutes

// Arrêter la synchronisation automatique
storageService.stopAutoSync()
```

## 🔐 **Gestion des Utilisateurs**

### 1. **Créer un Utilisateur Admin**
```sql
-- Dans l'éditeur SQL de Supabase
SELECT create_admin_user(
  'uuid-de-l-utilisateur',
  'admin',
  'admin@globalstar.com'
);
```

### 2. **Modifier le Rôle d'un Utilisateur**
```sql
-- Dans l'éditeur SQL de Supabase
SELECT update_user_role(
  'uuid-de-l-utilisateur',
  'admin'
);
```

### 3. **Obtenir les Permissions**
```sql
-- Dans l'éditeur SQL de Supabase
SELECT * FROM get_user_permissions('uuid-de-l-utilisateur');
```

## 📱 **Mode Hors Ligne**

### 1. **Fonctionnalités Offline**
- ✅ **Données locales** : Toutes les données restent accessibles
- ✅ **Queue de synchronisation** : Les changements sont mis en queue
- ✅ **Synchronisation automatique** : Dès le retour en ligne

### 2. **Gestion des Conflits**
```typescript
// Récupérer les données depuis Supabase
await supabaseSyncService.pullFromSupabase()

// Les données locales sont mises à jour avec les dernières versions
```

## 🚨 **Dépannage**

### 1. **Problèmes Courants**

#### Erreur de connexion
```bash
# Vérifiez vos clés Supabase
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### Erreurs de permissions
```sql
-- Vérifiez que RLS est configuré
SELECT * FROM pg_policies WHERE tablename = 'articles';
```

#### Synchronisation bloquée
```typescript
// Videz la queue de synchronisation
syncManager.clearSyncedItems()
```

### 2. **Logs de Débogage**
```typescript
// Activer les logs détaillés
localStorage.setItem('debug_sync', 'true')

// Voir l'état de synchronisation
console.log('Statut sync:', syncManager.getSyncStats())
```

## ✅ **Checklist de Configuration**

- [ ] Tables créées dans Supabase
- [ ] RLS configuré
- [ ] Utilisateur admin créé
- [ ] Variables d'environnement définies
- [ ] Connexion testée
- [ ] Synchronisation fonctionnelle
- [ ] Mode hors ligne testé
- [ ] Suppression automatique testée

## 🎯 **Avantages de cette Configuration**

- ✅ **Synchronisation automatique** en arrière-plan
- ✅ **Mode hors ligne** complet
- ✅ **Suppression automatique** des données synchronisées
- ✅ **Gestion des conflits** intelligente
- ✅ **Interface de gestion** intégrée
- ✅ **Sécurité** avec RLS
- ✅ **Performance** optimisée
- ✅ **Fiabilité** avec retry automatique

## 🚀 **Prochaines Étapes**

1. **Testez** la connexion Supabase
2. **Configurez** l'utilisateur admin
3. **Ajoutez** des données de test
4. **Testez** la synchronisation
5. **Vérifiez** la suppression automatique
6. **Configurez** les utilisateurs finaux

Votre application est maintenant prête pour une synchronisation professionnelle avec Supabase ! 🎉
