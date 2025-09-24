# Configuration - Global Star Distribution

## 🎯 Architecture Hybride

L'application fonctionne avec une **architecture hybride** :
- **localStorage en priorité** (fonctionne hors ligne)
- **Synchronisation Supabase** en arrière-plan (optionnel)

## 📱 Mode Hors Ligne (Par Défaut)

L'application fonctionne **immédiatement** sans configuration :
- ✅ Toutes les fonctionnalités disponibles
- ✅ Données stockées localement
- ✅ Pas de connexion internet requise
- ✅ Synchronisation automatique quand Supabase est configuré

## 🔄 Synchronisation Supabase (Optionnel)

Pour activer la synchronisation cloud :

### 1. Créer un Projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Donnez un nom : `global-star-distribution`
5. Choisissez une région proche
6. Créez un mot de passe fort
7. Cliquez sur "Create new project"

### 2. Récupérer les Clés

1. Dans votre projet Supabase → **Settings** → **API**
2. Copiez :
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configurer l'Application

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre-cle-ici

# Notifications push (optionnel)
VITE_VAPID_PUBLIC_KEY=votre_cle_vapid
```

### 4. Exécuter les Scripts SQL

1. Dans Supabase → **SQL Editor**
2. Copiez le contenu de `supabase-schema.sql`
3. Cliquez sur "Run"

### 5. Redémarrer l'Application

```bash
npm run dev
```

## 🔄 Fonctionnement de la Synchronisation

### Automatique
- **En ligne** : Synchronisation automatique toutes les 30 secondes
- **Hors ligne** : Les changements sont mis en queue
- **Reconnexion** : Synchronisation immédiate des changements en attente

### Indicateurs Visuels
- 🟢 **Synchronisé** : Tout est à jour
- 🟡 **En attente** : Changements en queue
- 🔴 **Hors ligne** : Mode hors ligne
- 🔄 **Synchronisation** : En cours de sync

### Types de Données Synchronisées
- ✅ Articles/Stock
- ✅ Commandes
- ✅ Livraisons
- ✅ Production
- ✅ Personnel
- ✅ Documents

## 🛠️ Dépannage

### Erreur "Invalid supabaseUrl"
```bash
# Solution : Créer le fichier .env.local
echo "VITE_SUPABASE_URL=https://votre-projet.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=votre-cle-ici" >> .env.local
```

### L'application ne se connecte pas
- Vérifiez que `.env.local` existe
- Vérifiez que les clés sont correctes
- Redémarrez le serveur : `npm run dev`

### Synchronisation ne fonctionne pas
- Vérifiez la connexion internet
- Vérifiez que vous êtes connecté (authentification)
- Regardez la console pour les erreurs

## 📊 Avantages de l'Architecture

### Mode Hors Ligne
- ✅ Fonctionne sans internet
- ✅ Données toujours disponibles
- ✅ Performance optimale
- ✅ Pas de dépendance externe

### Mode Synchronisé
- ✅ Sauvegarde cloud automatique
- ✅ Accès multi-appareils
- ✅ Collaboration en équipe
- ✅ Historique des modifications

## 🎯 Utilisation

### Pour les Utilisateurs
1. **Lancez l'application** → Fonctionne immédiatement
2. **Utilisez normalement** → Toutes les fonctionnalités disponibles
3. **Configurez Supabase** (optionnel) → Synchronisation automatique

### Pour les Administrateurs
1. **Configurez Supabase** → Synchronisation cloud
2. **Gérez les utilisateurs** → Authentification centralisée
3. **Surveillez la synchronisation** → Indicateurs visuels

## 🚀 Prochaines Étapes

1. **Testez l'application** en mode hors ligne
2. **Configurez Supabase** si nécessaire
3. **Vérifiez la synchronisation** avec les indicateurs
4. **Formez votre équipe** sur l'utilisation

L'application est **prête à l'emploi** dès maintenant ! 🎉
