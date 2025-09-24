# Système de Rôles - Global Star Distribution

## 🎯 Vue d'ensemble

Le système de rôles est maintenant **complètement implémenté** dans l'application avec Supabase. Chaque utilisateur a un rôle qui détermine ses permissions d'accès aux différentes fonctionnalités.

## 👥 Rôles Disponibles

### 1. **Super Administrateur** (`super_admin`)
- **Accès complet** à toutes les fonctionnalités
- Peut gérer les utilisateurs
- Peut modifier les paramètres système
- Peut voir toutes les données

**Permissions :**
- ✅ Production (lecture/écriture)
- ✅ Commandes (lecture/écriture)
- ✅ Livraisons (lecture/écriture)
- ✅ Stock (lecture/écriture)
- ✅ Personnel (lecture/écriture)
- ✅ Analyses (lecture)
- ✅ Paramètres (lecture/écriture)
- ✅ Gestion des utilisateurs

### 2. **Administrateur** (`admin`)
- **Accès étendu** à la plupart des fonctionnalités
- Ne peut pas gérer les utilisateurs
- Ne peut pas modifier les paramètres système

**Permissions :**
- ✅ Production (lecture/écriture)
- ✅ Commandes (lecture/écriture)
- ✅ Livraisons (lecture/écriture)
- ✅ Stock (lecture/écriture)
- ✅ Personnel (lecture/écriture)
- ✅ Analyses (lecture)
- ❌ Paramètres (lecture uniquement)
- ❌ Gestion des utilisateurs

### 3. **Secrétaire** (`secretaire`)
- **Accès standard** pour la gestion quotidienne
- Peut gérer les commandes et livraisons
- Peut consulter le stock

**Permissions :**
- ✅ Production (lecture uniquement)
- ✅ Commandes (lecture/écriture)
- ✅ Livraisons (lecture/écriture)
- ✅ Stock (lecture/écriture)
- ✅ Personnel (lecture uniquement)
- ✅ Analyses (lecture)
- ❌ Paramètres
- ❌ Gestion des utilisateurs

### 4. **Livreur** (`livreur`)
- **Accès limité** pour les livraisons uniquement
- Peut consulter les commandes et gérer les livraisons

**Permissions :**
- ❌ Production
- ✅ Commandes (lecture uniquement)
- ✅ Livraisons (lecture/écriture)
- ❌ Stock
- ❌ Personnel
- ❌ Analyses
- ❌ Paramètres
- ❌ Gestion des utilisateurs

## 🔧 Utilisation dans le Code

### 1. **Vérification des Rôles**

```typescript
import { useRoles } from '@/services/roles'

const { currentRole, hasRole, hasAnyRole } = useRoles()

// Vérifier un rôle spécifique
if (hasRole('admin')) {
  // Code pour les administrateurs
}

// Vérifier plusieurs rôles
if (hasAnyRole(['admin', 'super_admin'])) {
  // Code pour les admins et super admins
}
```

### 2. **Vérification des Permissions**

```typescript
import { useRoles } from '@/services/roles'

const { hasPermission, canEditProduction } = useRoles()

// Vérifier une permission spécifique
if (hasPermission('canEditProduction')) {
  // Code pour éditer la production
}

// Utiliser les computed properties
if (canEditProduction.value) {
  // Code pour éditer la production
}
```

### 3. **Composant PermissionGuard**

```vue
<template>
  <!-- Contenu visible uniquement aux administrateurs -->
  <PermissionGuard required-roles="['admin', 'super_admin']">
    <button>Action Admin</button>
  </PermissionGuard>

  <!-- Contenu avec permission spécifique -->
  <PermissionGuard required-permissions="['canEditProduction']">
    <button>Éditer Production</button>
  </PermissionGuard>
</template>
```

### 4. **Gardes de Route**

```typescript
// Dans router/guards.ts
export const ROUTE_PERMISSIONS = {
  '/parametres': {
    requiredRoles: ['super_admin', 'admin'],
    requiredPermissions: ['canViewParametres']
  }
}
```

## 🗄️ Base de Données

### Table `user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'secretaire' 
    CHECK (role IN ('super_admin', 'admin', 'secretaire', 'livreur')),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Politiques RLS
- Chaque utilisateur peut voir son propre profil
- Les super admins peuvent voir tous les profils
- Les autres utilisateurs ne peuvent pas voir les profils des autres

## 🎨 Interface Utilisateur

### 1. **Affichage du Rôle**
```vue
<template>
  <UserInfo />
</template>
```

Le composant `UserInfo` affiche :
- Nom de l'utilisateur
- Email
- Badge coloré du rôle
- Bouton de déconnexion

### 2. **Sélection de Rôle lors de l'Inscription**
- Les nouveaux utilisateurs peuvent choisir entre `secretaire` et `livreur`
- Les rôles `admin` et `super_admin` sont attribués manuellement

## 🔒 Sécurité

### 1. **Row Level Security (RLS)**
- Chaque utilisateur ne voit que ses propres données
- Les super admins ont accès à toutes les données
- Les politiques sont définies au niveau de la base de données

### 2. **Gardes de Route**
- Vérification automatique des permissions lors de la navigation
- Redirection vers la page d'accueil si accès refusé
- Messages d'erreur explicites

### 3. **Composants Protégés**
- Utilisation de `PermissionGuard` pour masquer/afficher du contenu
- Vérification côté client ET côté serveur

## 📋 Configuration

### 1. **Attribution des Rôles**
```typescript
import { useAuth } from '@/services/auth'

const { updateUserRole } = useAuth()

// Changer le rôle d'un utilisateur (admin seulement)
await updateUserRole(userId, 'admin')
```

### 2. **Création d'Utilisateurs avec Rôle**
```typescript
import { useAuth } from '@/services/auth'

const { signUp } = useAuth()

// Inscription avec rôle
await signUp('user@example.com', 'password', {
  first_name: 'John',
  last_name: 'Doe',
  role: 'secretaire'
})
```

## 🚀 Migration depuis l'Ancien Système

### Ancien Système (localStorage)
```typescript
// Ancien
const user = storageService.getCurrentUser()
if (user.role === 'admin') {
  // Code admin
}
```

### Nouveau Système (Supabase)
```typescript
// Nouveau
const { hasRole } = useRoles()
if (hasRole('admin')) {
  // Code admin
}
```

## 🎯 Avantages du Nouveau Système

1. **Sécurité renforcée** : RLS + authentification Supabase
2. **Permissions granulaires** : Contrôle fin des accès
3. **Interface réactive** : Mise à jour automatique des permissions
4. **Scalabilité** : Facile d'ajouter de nouveaux rôles/permissions
5. **Audit** : Traçabilité des accès et modifications

## 🔧 Personnalisation

### Ajouter un Nouveau Rôle
1. Modifier le type `UserRole` dans `src/lib/supabase.ts`
2. Ajouter les permissions dans `src/services/roles.ts`
3. Mettre à jour le schéma SQL
4. Ajouter les politiques RLS

### Ajouter une Nouvelle Permission
1. Ajouter à l'interface `UserPermissions`
2. Définir les permissions par rôle
3. Utiliser dans les composants avec `PermissionGuard`

Le système de rôles est maintenant **complètement fonctionnel** et prêt à l'emploi ! 🎉
