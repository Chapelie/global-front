# 🚀 Configuration Complète Supabase

## 📋 **Étapes de Configuration**

### 1. **Créer les Tables dans Supabase**

1. **Connectez-vous** à votre projet Supabase
2. **Allez dans l'éditeur SQL** (SQL Editor)
3. **Copiez et exécutez** le contenu de `supabase-schema.sql`
4. **Vérifiez** que toutes les tables sont créées

### 2. **Configurer Row Level Security (RLS)**

1. **Exécutez** le contenu de `supabase-rls.sql`
2. **Vérifiez** que les politiques sont appliquées
3. **Testez** l'accès avec un utilisateur connecté

### 3. **Configurer les Variables d'Environnement**

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici

# Configuration des notifications push (optionnel)
VITE_VAPID_PUBLIC_KEY=votre_cle_vapid_ici
```

### 4. **Tester la Connexion**

Ajoutez ce code dans `main.ts` pour tester :

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

## 🔄 **Synchronisation des Données**

### **Synchronisation Automatique**

```typescript
import { storageService } from './services/storage'

// Démarrer la synchronisation automatique (toutes les 30 secondes)
storageService.startAutoSync(30000)

// Synchroniser manuellement
await storageService.syncAllToSupabase()
```

### **Synchronisation Bidirectionnelle**

```typescript
import { useSupabaseSync } from './services/supabaseSync'

const { syncBidirectional } = useSupabaseSync()

// Synchroniser dans les deux sens
await syncBidirectional()
```

## 📊 **Gestion des Données**

### **Ajouter des Données**

```typescript
// Les données sont automatiquement ajoutées à la queue de sync
const article = storageService.addArticle({
  nom: 'Nouvel article',
  categorie: 'Briques',
  stock: 100,
  // ... autres propriétés
})
```

### **Modifier des Données**

```typescript
// Les modifications sont automatiquement synchronisées
storageService.updateArticle(articleId, {
  stock: 150
})
```

### **Supprimer des Données**

```typescript
// Les suppressions sont automatiquement synchronisées
storageService.deleteArticle(articleId)
```

## 🎛️ **Interface de Gestion**

### **Composant SyncManager**

Ajoutez le composant `SyncManager.vue` à votre application :

```vue
<template>
  <div>
    <!-- Votre contenu existant -->
    
    <!-- Gestionnaire de synchronisation -->
    <SyncManager />
  </div>
</template>

<script setup>
import SyncManager from './components/SyncManager.vue'
</script>
```

### **Statut de Synchronisation**

```vue
<template>
  <div class="sync-status">
    <div v-if="syncStatus.isOnline" class="status-online">
      ✅ En ligne
    </div>
    <div v-else class="status-offline">
      ❌ Hors ligne
    </div>
    
    <div v-if="syncStatus.isSyncing" class="sync-progress">
      Synchronisation en cours... {{ syncStatus.syncProgress }}%
    </div>
  </div>
</template>

<script setup>
import { useSupabaseSync } from './services/supabaseSync'

const { status: syncStatus } = useSupabaseSync()
</script>
```

## 🔧 **Configuration Avancée**

### **Synchronisation Personnalisée**

```typescript
import { supabaseSyncService } from './services/supabaseSync'

// Ajouter un élément à la queue
supabaseSyncService.addToQueue('insert', 'articles', {
  nom: 'Article personnalisé',
  stock: 50
})

// Synchroniser immédiatement
await supabaseSyncService.startSync()
```

### **Gestion des Erreurs**

```typescript
const syncStatus = supabaseSyncService.getStatus()

if (syncStatus.syncErrors.length > 0) {
  console.error('Erreurs de synchronisation:', syncStatus.syncErrors)
  
  // Réessayer la synchronisation
  await supabaseSyncService.startSync()
}
```

### **Synchronisation Conditionnelle**

```typescript
// Synchroniser seulement si en ligne
if (navigator.onLine) {
  await storageService.syncAllToSupabase()
} else {
  console.log('Synchronisation différée (hors ligne)')
}
```

## 📱 **Fonctionnalités Offline**

### **Mode Hors Ligne**

- ✅ **Données locales** : Toutes les données restent accessibles
- ✅ **Queue de synchronisation** : Les changements sont mis en queue
- ✅ **Synchronisation automatique** : Dès le retour en ligne

### **Gestion des Conflits**

```typescript
// Récupérer les données depuis Supabase
await supabaseSyncService.pullFromSupabase()

// Les données locales sont mises à jour avec les dernières versions
```

## 🚨 **Dépannage**

### **Problèmes Courants**

1. **Erreur de connexion** :
   - Vérifiez vos clés Supabase
   - Vérifiez l'URL du projet

2. **Erreurs de permissions** :
   - Vérifiez que RLS est configuré
   - Vérifiez que l'utilisateur est connecté

3. **Synchronisation bloquée** :
   - Videz la queue : `supabaseSyncService.clearQueue()`
   - Redémarrez la synchronisation

### **Logs de Débogage**

```typescript
// Activer les logs détaillés
localStorage.setItem('debug_sync', 'true')

// Voir l'état de synchronisation
console.log('Statut sync:', supabaseSyncService.getStatus())
console.log('Queue:', supabaseSyncService.getQueue())
```

## ✅ **Vérification**

### **Checklist de Configuration**

- [ ] Tables créées dans Supabase
- [ ] RLS configuré
- [ ] Variables d'environnement définies
- [ ] Connexion testée
- [ ] Synchronisation fonctionnelle
- [ ] Mode hors ligne testé

### **Test Complet**

1. **Ajoutez des données** en mode hors ligne
2. **Reconnectez-vous** à Internet
3. **Vérifiez** que les données apparaissent dans Supabase
4. **Modifiez** des données dans Supabase
5. **Vérifiez** que les changements apparaissent localement

## 🎯 **Avantages de cette Configuration**

- ✅ **Synchronisation automatique** en arrière-plan
- ✅ **Mode hors ligne** complet
- ✅ **Gestion des conflits** intelligente
- ✅ **Interface de gestion** intégrée
- ✅ **Sécurité** avec RLS
- ✅ **Performance** optimisée
- ✅ **Fiabilité** avec retry automatique

Votre application est maintenant prête pour une synchronisation complète avec Supabase ! 🚀
