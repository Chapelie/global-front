# 🔍 Guide de Diagnostic Supabase

## 📊 Logs ajoutés pour le diagnostic

J'ai ajouté des logs détaillés dans tous les services pour diagnostiquer les problèmes :

### 🔐 **Service d'Authentification** (`auth.ts`)
```typescript
console.log('🔐 [Auth] signIn() - Début')
console.log('📧 [Auth] Email:', email)
console.log('📡 [Auth] Appel Supabase: signInWithPassword()')
console.log('✅ [Auth] Connexion réussie:', data.user?.email)
console.log('👤 [Auth] User ID:', data.user?.id)
```

### 📡 **Service Supabase** (`supabaseService.ts`)
```typescript
console.log('🔍 [SupabaseService] getArticles() - Début')
console.log('👤 [SupabaseService] User ID:', userId)
console.log('📡 [SupabaseService] Appel Supabase: articles.select()')
console.log('✅ [SupabaseService] Articles récupérés:', data?.length || 0)
```

### 🔄 **Service de Données** (`dataService.ts`)
```typescript
console.log('🔍 [DataService] getArticles() - Début')
console.log('🔐 [DataService] isUserAuthenticated():', this.isUserAuthenticated())
console.log('👤 [DataService] User ID:', this.getCurrentUserId())
console.log('📡 [DataService] Utilisation de Supabase')
console.log('✅ [DataService] Supabase réussi:', result.length, 'articles')
```

## 🧪 **Comment diagnostiquer**

### **1. Ouvrir la console du navigateur**
- Appuyez sur `F12` ou `Ctrl+Shift+I`
- Allez dans l'onglet "Console"

### **2. Aller sur la page de test**
- Allez sur `/test-supabase`
- Regardez les logs dans la console

### **3. Tester la connexion**
- Cliquez sur "Tester la connexion Supabase"
- Observez les logs qui apparaissent

### **4. Tester l'authentification**
- Cliquez sur "Se connecter" si vous n'êtes pas connecté
- Regardez les logs d'authentification

### **5. Tester la création d'article**
- Cliquez sur "Tester la création d'article"
- Vérifiez le flux complet

## 🔍 **Logs à surveiller**

### **✅ Logs normaux (connexion réussie)**
```
🚀 [AuthStatus] Initialisation de l'authentification
✅ [AuthStatus] Authentification initialisée
🔐 [Auth] signIn() - Début
📧 [Auth] Email: user@example.com
📡 [Auth] Appel Supabase: signInWithPassword()
✅ [Auth] Connexion réussie: user@example.com
👤 [Auth] User ID: uuid-123
🔍 [DataService] getArticles() - Début
🔐 [DataService] isUserAuthenticated(): true
👤 [DataService] User ID: uuid-123
📡 [DataService] Utilisation de Supabase
🔍 [SupabaseService] getArticles() - Début
👤 [SupabaseService] User ID: uuid-123
📡 [SupabaseService] Appel Supabase: articles.select()
✅ [SupabaseService] Articles récupérés: 0
✅ [DataService] Supabase réussi: 0 articles
```

### **❌ Logs d'erreur (problèmes à identifier)**

#### **Problème 1 : Supabase non configuré**
```
❌ [DataService] isUserAuthenticated(): false
💾 [DataService] Utilisation de localStorage
```
**Solution** : Vérifiez les variables d'environnement

#### **Problème 2 : Erreur de connexion Supabase**
```
❌ [Auth] Erreur de connexion: Invalid login credentials
```
**Solution** : Vérifiez les identifiants de connexion

#### **Problème 3 : Erreur d'authentification**
```
❌ [SupabaseService] Utilisateur non authentifié
🔄 [DataService] Fallback localStorage
```
**Solution** : L'utilisateur n'est pas connecté

#### **Problème 4 : Erreur de base de données**
```
❌ [SupabaseService] Erreur Supabase: relation "articles" does not exist
```
**Solution** : Exécutez les scripts SQL dans Supabase

## 🛠️ **Tests disponibles**

### **1. Test de connexion de base**
- Teste la connexion à Supabase
- Vérifie que les clés sont correctes

### **2. Test d'authentification**
- Vérifie l'état de connexion de l'utilisateur
- Affiche les informations utilisateur

### **3. Test de création d'article**
- Teste le flux complet de création
- Vérifie l'authentification et la sauvegarde

## 📋 **Checklist de diagnostic**

### **Étape 1 : Vérifier la configuration**
- [ ] Variables d'environnement configurées
- [ ] Clés Supabase correctes
- [ ] Projet Supabase créé

### **Étape 2 : Vérifier la base de données**
- [ ] Tables créées dans Supabase
- [ ] Scripts SQL exécutés
- [ ] RLS activé

### **Étape 3 : Vérifier l'authentification**
- [ ] Utilisateur peut se connecter
- [ ] Session persistante
- [ ] User ID récupéré

### **Étape 4 : Vérifier les opérations**
- [ ] Lecture des données
- [ ] Création de données
- [ ] Mise à jour des données

## 🚨 **Problèmes courants et solutions**

### **"Utilisateur non authentifié"**
- **Cause** : L'utilisateur n'est pas connecté
- **Solution** : Se connecter via le composant AuthStatus

### **"relation does not exist"**
- **Cause** : Tables non créées dans Supabase
- **Solution** : Exécuter `supabase-schema.sql`

### **"Invalid login credentials"**
- **Cause** : Identifiants incorrects
- **Solution** : Vérifier email/mot de passe

### **"Configuration non configuré"**
- **Cause** : Variables d'environnement manquantes
- **Solution** : Configurer `.env.local`

## 📞 **Support**

Si vous voyez des erreurs dans les logs :
1. Copiez les logs d'erreur
2. Vérifiez la checklist
3. Testez chaque étape individuellement

**Les logs vous donneront toutes les informations nécessaires pour diagnostiquer le problème !** 🔍
