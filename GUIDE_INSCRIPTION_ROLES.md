# 🔐 Guide d'Inscription et Gestion des Rôles

## ✅ Fonctionnalités implémentées

### 🎯 **Page d'inscription complète**
- ✅ Formulaire d'inscription avec validation
- ✅ Gestion des rôles utilisateur
- ✅ Informations personnelles et de contact
- ✅ Auto-confirmation des comptes
- ✅ Intégration Supabase complète

### 👥 **Gestion des rôles**
- ✅ 6 rôles définis : superadmin, admin, manager, operator, secretaire, livreur
- ✅ Permissions granulaires par rôle
- ✅ Interface de gestion des utilisateurs
- ✅ Statistiques des utilisateurs

### 🔧 **Configuration Supabase**
- ✅ Scripts SQL pour l'auto-confirmation
- ✅ Triggers automatiques pour les profils
- ✅ Row Level Security (RLS) configuré
- ✅ Gestion des permissions

## 🚀 **Comment utiliser**

### **1. Configuration Supabase**

#### A. Exécuter les scripts SQL
1. Allez dans votre projet Supabase → **SQL Editor**
2. Exécutez le contenu de `supabase-auth-setup.sql`
3. Vérifiez que les tables et triggers sont créés

#### B. Configurer l'auto-confirmation
1. Allez dans **Authentication** → **Settings**
2. Désactivez **"Enable email confirmations"**
3. Sauvegardez les paramètres

#### C. Configurer les URLs de redirection
1. Dans **Authentication** → **Settings**
2. Ajoutez dans **Site URL** : `http://localhost:5173`
3. Ajoutez dans **Redirect URLs** :
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/`

### **2. Tester l'inscription**

#### A. Aller sur la page d'inscription
- URL : `http://localhost:5173/register`
- Remplir le formulaire complet
- Choisir un rôle approprié

#### B. Vérifier la création du compte
- Le compte est créé automatiquement
- Pas de confirmation email requise
- Profil utilisateur créé dans la table `users`

#### C. Se connecter
- Aller sur `/login`
- Utiliser les identifiants créés
- Vérifier que l'utilisateur est connecté

### **3. Gestion des utilisateurs (Admin)**

#### A. Accéder à la gestion
- URL : `http://localhost:5173/users`
- Nécessite un rôle admin ou superadmin

#### B. Fonctionnalités disponibles
- ✅ Voir tous les utilisateurs
- ✅ Modifier les rôles
- ✅ Activer/désactiver les comptes
- ✅ Voir les statistiques
- ✅ Gérer les informations de contact

## 📊 **Rôles et permissions**

### **Super Admin** 👑
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Gestion des utilisateurs
- ✅ Configuration système
- ✅ Toutes les données

### **Administrateur** 🔧
- ✅ Gestion des utilisateurs
- ✅ Accès à toutes les données
- ✅ Configuration des paramètres
- ❌ Pas d'accès super admin

### **Manager** 📋
- ✅ Gestion de la production
- ✅ Gestion des commandes
- ✅ Gestion des livraisons
- ✅ Gestion du personnel
- ❌ Pas de gestion des utilisateurs

### **Opérateur** ⚙️
- ✅ Gestion de la production
- ✅ Gestion du stock
- ✅ Gestion des commandes
- ❌ Pas de gestion du personnel

### **Secrétaire** 📝
- ✅ Gestion des commandes
- ✅ Gestion des livraisons
- ✅ Consultation des données
- ❌ Pas de gestion de la production

### **Livreur** 🚚
- ✅ Gestion des livraisons
- ✅ Consultation des commandes
- ❌ Pas d'accès aux autres modules

## 🔍 **Logs de diagnostic**

### **Inscription**
```
🔐 [Auth] signUp() - Début
📧 [Auth] Email: user@example.com
👤 [Auth] Métadonnées: {role: "manager", first_name: "John"}
📡 [Auth] Appel Supabase: signUp()
✅ [Auth] Inscription réussie: user@example.com
👤 [Auth] User ID: uuid-123
👤 [Auth] createUserProfile() - Début
✅ [Auth] Profil créé: {id: "uuid-123", role: "manager"}
```

### **Connexion**
```
🔐 [Auth] signIn() - Début
📧 [Auth] Email: user@example.com
📡 [Auth] Appel Supabase: signInWithPassword()
✅ [Auth] Connexion réussie: user@example.com
👤 [Auth] User ID: uuid-123
```

### **Gestion des données**
```
🔍 [DataService] getArticles() - Début
🔐 [DataService] isUserAuthenticated(): true
👤 [DataService] User ID: uuid-123
📡 [DataService] Utilisation de Supabase
✅ [SupabaseService] Articles récupérés: 5
```

## 🛠️ **Dépannage**

### **Problème : "Email not confirmed"**
- **Cause** : Auto-confirmation non activée
- **Solution** : Désactiver la confirmation email dans Supabase

### **Problème : "User profile not created"**
- **Cause** : Trigger non créé
- **Solution** : Exécuter `supabase-auth-setup.sql`

### **Problème : "Permission denied"**
- **Cause** : RLS mal configuré
- **Solution** : Vérifier les politiques RLS

### **Problème : "Role not found"**
- **Cause** : Rôle non défini
- **Solution** : Utiliser un rôle valide (voir liste ci-dessus)

## 📋 **Checklist de configuration**

### **Supabase**
- [ ] Scripts SQL exécutés
- [ ] Auto-confirmation activée
- [ ] URLs de redirection configurées
- [ ] RLS activé et configuré

### **Application**
- [ ] Variables d'environnement configurées
- [ ] Page d'inscription accessible
- [ ] Page de gestion des utilisateurs accessible
- [ ] Logs de diagnostic visibles

### **Test**
- [ ] Inscription d'un utilisateur
- [ ] Connexion réussie
- [ ] Création de données avec user_id
- [ ] Gestion des rôles fonctionnelle

## 🎉 **Résultat**

Votre application dispose maintenant d'un système d'authentification complet avec :

- ✅ **Inscription automatique** sans confirmation email
- ✅ **Gestion des rôles** avec permissions granulaires
- ✅ **Interface d'administration** pour gérer les utilisateurs
- ✅ **Sécurité** avec RLS et isolation des données
- ✅ **Logs détaillés** pour le diagnostic

**Votre système d'authentification est maintenant prêt pour la production !** 🚀
