# 🧪 Guide de Test - Gestion des Articles

## ✅ **Système hybride simple implémenté !**

Le système utilise maintenant un service hybride simple qui :
- ✅ **Détecte automatiquement** si Supabase est configuré
- ✅ **Utilise Supabase** si l'utilisateur est connecté
- ✅ **Utilise localStorage** sinon
- ✅ **Fallback automatique** en cas d'erreur

## 🚀 **Test de la création d'articles**

### **1. Aller sur la page de stock**
- URL : `http://localhost:5173/stock`
- Vérifier que la page se charge sans erreur

### **2. Tester la création d'un article**

#### **Mode connecté (Supabase) :**
1. Se connecter avec un compte Supabase
2. Cliquer sur **"Nouvel article"**
3. Remplir les informations :
   - Nom : "Test Article"
   - Catégorie : "Briques"
   - Stock : 100
   - Seuil critique : 10
   - Unité : "pièces"
   - Prix : 500
   - Fournisseur : "Test Fournisseur"
4. Cliquer sur **"Sauvegarder"**

#### **Mode hors ligne (localStorage) :**
1. Se déconnecter ou désactiver Supabase
2. Répéter les étapes ci-dessus
3. L'article sera sauvegardé localement

### **3. Logs attendus**

#### **Mode Supabase :**
```
🔍 [SimpleHybridService] addArticle() - Début
📦 [SimpleHybridService] Article à créer: {nom: "Test Article", ...}
📡 [SimpleHybridService] Utilisation de Supabase
✅ [SimpleHybridService] Article créé dans Supabase: {id: "uuid", ...}
```

#### **Mode localStorage :**
```
🔍 [SimpleHybridService] addArticle() - Début
📦 [SimpleHybridService] Article à créer: {nom: "Test Article", ...}
💾 [SimpleHybridService] Utilisation de localStorage
✅ [SimpleHybridService] Article créé dans localStorage: {id: "1234567890", ...}
```

### **4. Vérifications**

#### **Mode Supabase :**
- ✅ L'article apparaît dans la liste
- ✅ L'article est visible dans Supabase
- ✅ L'ID est un UUID
- ✅ Le `user_id` est défini

#### **Mode localStorage :**
- ✅ L'article apparaît dans la liste
- ✅ L'article est visible dans localStorage
- ✅ L'ID est un timestamp
- ✅ Le `user_id` est défini

### **5. Test de la modification**

1. Cliquer sur l'icône **modifier** d'un article
2. Modifier le stock ou le prix
3. Sauvegarder
4. Vérifier que les modifications sont appliquées

### **6. Test de la suppression**

1. Cliquer sur l'icône **supprimer** d'un article
2. Confirmer la suppression
3. Vérifier que l'article disparaît de la liste

## 🔧 **Dépannage**

### **Erreur "getArticles is not a function"**
- ✅ **Résolu** : Utilisation du service hybride simple

### **Erreur de types**
- ✅ **Résolu** : Interfaces simplifiées et cohérentes

### **Problème de synchronisation**
- Le système fonctionne en mode hybride
- Pas de synchronisation automatique pour le moment
- Focus sur la fonctionnalité de base

## 📊 **Résultat attendu**

**Votre système de gestion d'articles fonctionne maintenant :**
- ✅ **Mode intelligent** : Détecte automatiquement la configuration
- ✅ **Mode robuste** : Fallback automatique en cas d'erreur
- ✅ **Mode simple** : Pas de complexité inutile
- ✅ **Mode testable** : Logs détaillés pour le diagnostic

**Testez maintenant sur `/stock` !** 🎉
