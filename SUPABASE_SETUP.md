# Configuration Supabase - Global Star Distribution

## 🎯 Intégration Supabase Complète

L'application a été migrée vers Supabase pour l'authentification et la gestion des données. Voici les étapes pour finaliser la configuration.

## 📋 Étapes de Configuration

### 1. Créer un Projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez votre organisation
5. Donnez un nom à votre projet : `global-star-distribution`
6. Choisissez une région proche de vous
7. Créez un mot de passe fort pour la base de données
8. Cliquez sur "Create new project"

### 2. Récupérer les Clés API

1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez les valeurs suivantes :
   - **Project URL** (ex: `https://your-project.supabase.co`)
   - **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configurer les Variables d'Environnement

Mettez à jour le fichier `.env.local` avec vos vraies valeurs :

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuration des notifications push (optionnel)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 4. Créer les Tables dans Supabase

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez et exécutez le contenu du fichier `supabase-schema.sql`
3. Cliquez sur "Run" pour exécuter le script

### 5. Configurer l'Authentification

1. Dans Supabase, allez dans **Authentication** > **Settings**
2. Configurez les **Site URL** : `http://localhost:5173` (pour le développement)
3. Ajoutez les **Redirect URLs** :
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/` (pour la production)

### 6. Configurer Google OAuth (Optionnel)

1. Allez dans **Authentication** > **Providers**
2. Activez **Google**
3. Configurez avec vos clés Google OAuth :
   - **Client ID** : Votre Google Client ID
   - **Client Secret** : Votre Google Client Secret

### 7. Configurer les Notifications Push (Optionnel)

1. Allez dans **Authentication** > **Settings**
2. Activez les **Push Notifications**
3. Configurez VAPID keys si nécessaire

## 🚀 Fonctionnalités Intégrées

### ✅ Authentification
- ✅ Connexion email/mot de passe
- ✅ Inscription avec confirmation email
- ✅ Connexion Google OAuth
- ✅ Déconnexion sécurisée
- ✅ Gestion des sessions

### ✅ Gestion des Données
- ✅ Articles/Stock
- ✅ Commandes
- ✅ Livraisons
- ✅ Production
- ✅ Personnel
- ✅ Documents
- ✅ Analyses

### ✅ Sécurité
- ✅ Row Level Security (RLS) activé
- ✅ Chaque utilisateur ne voit que ses données
- ✅ Authentification obligatoire
- ✅ Gardes de route sécurisés

### ✅ Notifications Push
- ✅ Demande d'autorisations
- ✅ Abonnement VAPID
- ✅ Sauvegarde des abonnements

## 📁 Fichiers Créés/Modifiés

### Nouveaux Fichiers
- `src/lib/supabase.ts` - Configuration Supabase
- `src/services/auth.ts` - Service d'authentification
- `src/services/supabaseService.ts` - Service de données Supabase
- `src/views/RegisterView.vue` - Page d'inscription
- `supabase-schema.sql` - Scripts SQL pour les tables

### Fichiers Modifiés
- `src/views/LoginView.vue` - Migré vers Supabase
- `src/router/index.ts` - Gardes de route mis à jour
- `.env.local` - Variables d'environnement

## 🔧 Utilisation

### Connexion
```typescript
import { useAuth } from '@/services/auth'

const { signIn, signOut, user, isAuthenticated } = useAuth()

// Connexion
await signIn('email@example.com', 'password')

// Déconnexion
await signOut()
```

### Gestion des Données
```typescript
import { supabaseService } from '@/services/supabaseService'

// Récupérer les articles
const articles = await supabaseService.getArticles()

// Ajouter un article
const newArticle = await supabaseService.addArticle({
  nom: 'Nouvel Article',
  stock: 100,
  unite: 'pièces',
  prix: 10.50,
  seuilCritique: 20,
  actif: true
})
```

## 🐛 Dépannage

### Erreur "Variables d'environnement Supabase manquantes"
- Vérifiez que `.env.local` contient les bonnes valeurs
- Redémarrez le serveur de développement

### Erreur "User not found"
- Vérifiez que l'utilisateur est bien créé dans Supabase
- Vérifiez que l'email est confirmé

### Erreur de permissions
- Vérifiez que les politiques RLS sont bien créées
- Vérifiez que l'utilisateur est authentifié

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs de la console
2. Vérifiez les logs Supabase dans le dashboard
3. Consultez la documentation Supabase

## 🎉 Prochaines Étapes

1. **Tester l'authentification** - Créez un compte et connectez-vous
2. **Migrer les données existantes** - Si vous avez des données dans localStorage
3. **Configurer la production** - Mettre à jour les URLs pour la production
4. **Tester les notifications push** - Configurer VAPID si nécessaire

L'intégration Supabase est maintenant complète ! 🚀
