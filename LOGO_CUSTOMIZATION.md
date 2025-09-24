# 🎨 Personnalisation du Logo

## 📁 Emplacement du Logo

Le logo de votre application se trouve dans : `src/assets/logo.jpeg`

## 🔄 Comment Changer le Logo

### 1. **Remplacement Simple**
- Remplacez le fichier `src/assets/logo.jpeg` par votre logo
- Le logo sera automatiquement mis à jour dans toute l'application

### 2. **Format Recommandé**
- **Format** : JPEG, PNG, SVG
- **Taille** : 200x200px minimum (pour une qualité optimale)
- **Nom** : `logo.jpeg` (ou changez l'import dans `useLogo.ts`)

## 🎯 Utilisation du Composable

Le composable `useLogo()` est utilisé dans tous les composants :

```typescript
import { useLogo } from '../composables/useLogo'

const { logo, getLogoAlt, getLogoClass } = useLogo()
```

### Méthodes Disponibles

- `logo` : Chemin vers le logo
- `getLogoAlt()` : Texte alternatif du logo
- `getLogoClass(size)` : Classes CSS selon la taille

### Tailles Disponibles

- `'small'` : 32x32px (sidebar, navbar)
- `'medium'` : 64x64px (pages de connexion)
- `'large'` : 96x96px (pages importantes)

## 📍 Où le Logo Apparaît

1. **App.vue** - Sidebar et navbar (petit)
2. **LoginView.vue** - Page de connexion (moyen)
3. **RegisterView.vue** - Page d'inscription (moyen)
4. **BordereauViewer.vue** - Bordereaux de livraison
5. **LivraisonBordereau.vue** - Bordereaux de livraison

## 🛠️ Personnalisation Avancée

### Changer le Nom du Fichier

Si vous voulez utiliser un nom différent :

```typescript
// src/composables/useLogo.ts
import logoImage from '@/assets/votre-logo.png' // Changez ici
```

### Changer le Texte Alternatif

```typescript
// src/composables/useLogo.ts
getLogoAlt: () => 'Votre Nom d\'Entreprise', // Changez ici
```

### Ajouter de Nouvelles Tailles

```typescript
// src/composables/useLogo.ts
getLogoClass: (size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium') => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-16 w-16', 
    large: 'h-24 w-24',
    xlarge: 'h-32 w-32' // Nouvelle taille
  }
  return `${sizeClasses[size]} rounded-xl object-cover`
}
```

## ✅ Vérification

Après avoir changé le logo :

1. **Rechargez l'application** (Ctrl+F5)
2. **Vérifiez tous les endroits** où le logo apparaît
3. **Testez les différentes tailles** (sidebar, login, etc.)

## 🎨 Conseils de Design

- **Couleurs** : Assurez-vous que le logo fonctionne sur fond clair et sombre
- **Forme** : Logo carré ou rond fonctionne mieux
- **Simplicité** : Évitez les détails trop fins qui ne se voient pas en petit
- **Contraste** : Le logo doit être visible sur tous les arrière-plans
