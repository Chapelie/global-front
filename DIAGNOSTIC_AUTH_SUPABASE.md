# 🔍 Diagnostic de l'Authentification Supabase

## 🚨 **Problème identifié**
Les logs de Supabase ne s'affichent pas lors de la connexion, ce qui indique que l'authentification n'est pas correctement connectée.

## 🔍 **Étapes de diagnostic**

### **1. Vérifier les logs de la console**

Ouvrez la console du navigateur (F12) et regardez les logs au démarrage :

#### **Logs attendus :**
```
🔍 [Supabase] Variables d'environnement:
🔍 [Supabase] VITE_SUPABASE_URL: https://votre-projet.supabase.co
🔍 [Supabase] VITE_SUPABASE_ANON_KEY: Défini
✅ [Supabase] Client créé avec succès
✅ [Supabase] URL: https://votre-projet.supabase.co
🚀 Application Global Star Distribution démarrée
🔐 [Auth] initAuth() - Début
🔍 [Auth] Supabase client: Disponible
📡 [Auth] Récupération de la session actuelle
✅ [Auth] Session récupérée: Aucune session
👂 [Auth] Configuration du listener d'authentification
✅ [Auth] Initialisation terminée
✅ Authentification Supabase initialisée
```

#### **Si vous voyez des erreurs :**
- ❌ `VITE_SUPABASE_URL: undefined` → Variables d'environnement manquantes
- ❌ `Supabase client: Non disponible` → Configuration échouée
- ❌ `❌ [Auth] Supabase client non disponible` → Client non créé

### **2. Vérifier le fichier .env.local**

Créez ou vérifiez le fichier `.env.local` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **3. Vérifier la configuration Supabase**

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### **4. Tester la connexion**

1. Allez sur `/test-supabase`
2. Regardez le composant **"Test d'authentification Supabase"**
3. Vérifiez que :
   - ✅ **Initialisé** : Oui
   - ✅ **Chargement** : Non
   - ✅ **Authentifié** : Non (si pas connecté)

### **5. Tester la connexion**

1. Allez sur `/login`
2. Entrez des identifiants valides
3. Regardez les logs dans la console :

#### **Logs attendus lors de la connexion :**
```
🔐 [Auth] signIn() - Début
📧 [Auth] Email: user@example.com
📡 [Auth] Appel Supabase: signInWithPassword()
✅ [Auth] Connexion réussie: user@example.com
👤 [Auth] User ID: uuid-123
🔄 [Auth] Auth state changed: SIGNED_IN user@example.com
✅ [Auth] Utilisateur connecté: user@example.com
```

## 🛠️ **Solutions selon le problème**

### **Problème 1 : Variables d'environnement manquantes**

**Symptômes :**
- `VITE_SUPABASE_URL: undefined`
- `VITE_SUPABASE_ANON_KEY: Non défini`

**Solution :**
1. Créer le fichier `.env.local`
2. Ajouter les variables Supabase
3. Redémarrer le serveur de développement

### **Problème 2 : Configuration Supabase invalide**

**Symptômes :**
- `⚠️ [Supabase] Configuration manquante ou invalide`
- `❌ [Auth] Supabase client non disponible`

**Solution :**
1. Vérifier que l'URL commence par `https://`
2. Vérifier que la clé commence par `eyJ`
3. Vérifier qu'il n'y a pas d'espaces dans les variables

### **Problème 3 : Erreur de connexion**

**Symptômes :**
- `❌ [Auth] Erreur de connexion: ...`
- Pas de logs de connexion

**Solution :**
1. Vérifier que l'utilisateur existe dans Supabase
2. Vérifier que l'email est confirmé
3. Vérifier le mot de passe

### **Problème 4 : Base de données non configurée**

**Symptômes :**
- `Database error saving new user`
- `duplicate key value violates unique constraint`

**Solution :**
1. Exécuter le script `supabase-fix-duplicate-user.sql`
2. Vérifier que les tables existent
3. Vérifier que les triggers sont créés

## 🚀 **Test complet**

### **1. Redémarrer l'application**
```bash
npm run dev
```

### **2. Ouvrir la console**
- F12 → Console
- Vider la console (Ctrl+L)

### **3. Recharger la page**
- F5 ou Ctrl+R
- Regarder les logs de démarrage

### **4. Tester la connexion**
- Aller sur `/login`
- Se connecter avec des identifiants valides
- Regarder les logs de connexion

### **5. Vérifier l'état**
- Aller sur `/test-supabase`
- Vérifier que l'utilisateur est connecté

## 📞 **Si le problème persiste**

1. **Copier tous les logs** de la console
2. **Vérifier le fichier** `.env.local`
3. **Tester la connexion** sur `/test-supabase`
4. **Partager les logs** pour diagnostic

## ✅ **Résultat attendu**

Après correction, vous devriez voir :
- ✅ Logs de configuration Supabase au démarrage
- ✅ Logs d'initialisation de l'authentification
- ✅ Logs de connexion lors du login
- ✅ Utilisateur connecté dans l'interface
