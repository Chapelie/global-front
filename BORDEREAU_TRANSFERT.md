# 📋 Bordereau de Transfert - Global Star Distribution

## 🎯 Description

Le bordereau de transfert est un document professionnel généré lors des livraisons pour formaliser le transfert de marchandises entre Global Star Distribution et ses clients.

## 🏢 Informations de l'Entreprise

- **Nom** : GLOBAL STAR DISTRIBUTION
- **Numéro d'entreprise** : 6201798/51747100
- **Adresse** : Yimdi route de Bobo, 300 m avant le péage
- **Email** : gelil.Savadogo@yahoo.com

## 📄 Contenu du Bordereau

### 1. **En-tête**
- Logo de l'entreprise
- Informations complètes de Global Star Distribution
- Titre "BORDEREAU DE TRANSFERT"
- Date et numéro du bordereau

### 2. **Informations Client**
- Nom du client
- Téléphone (si disponible)
- Adresse (si disponible)

### 3. **Détail du Transfert**
Tableau avec les colonnes :
- **Désignation** : Nom du produit
- **Quantité** : Nombre d'articles
- **Observation** : Notes particulières

### 4. **Total**
- Nombre total d'articles transférés

### 5. **Signatures**
- **Chauffeur** : Nom, signature, date
- **Client** : Nom, signature, date

## 🚀 Comment Utiliser

### Dans l'Application

1. **Accéder à une livraison** :
   - Aller dans la section "Livraisons"
   - Sélectionner une livraison en cours

2. **Générer le bordereau** :
   - Cliquer sur "Bordereau de Transfert"
   - Le bordereau s'affiche dans une fenêtre modale

3. **Actions disponibles** :
   - **Fermer** : Retourner à la livraison
   - **Imprimer** : Imprimer le bordereau

### Fonctionnalités

- ✅ **Affichage professionnel** avec logo et informations complètes
- ✅ **Tableau des produits** avec désignation, quantité et observations
- ✅ **Zones de signature** pour chauffeur et client
- ✅ **Impression directe** depuis l'application
- ✅ **Design responsive** pour tous les écrans

## 🎨 Design Professionnel

### Couleurs
- **Orange principal** : #f97316 (Global Star)
- **Gris foncé** : #1f2937 (Textes)
- **Gris clair** : #f9fafb (Arrière-plans)

### Typographie
- **Police** : Arial, sans-serif
- **Titres** : Gras, majuscules
- **Corps** : Taille 14px, lisible

### Mise en Page
- **Largeur maximale** : 800px
- **Marges** : 20px
- **Espacement** : Cohérent et aéré

## 📱 Responsive Design

Le bordereau s'adapte automatiquement :
- **Desktop** : Affichage complet en deux colonnes
- **Tablet** : Adaptation des colonnes
- **Mobile** : Passage en une colonne

## 🖨️ Impression

### Styles d'Impression
- **Marges optimisées** pour l'impression
- **Couleurs adaptées** (noir et blanc)
- **Format A4** standard

### Conseils d'Impression
1. **Vérifier les marges** avant impression
2. **Utiliser du papier blanc** de qualité
3. **Imprimer en haute qualité** pour les signatures

## 🔧 Personnalisation

### Modifier les Informations de l'Entreprise
Éditer le composant `TransfertBordereau.vue` :

```vue
<div class="company-address">
  <p><strong>Numéro d'entreprise :</strong> VOTRE_NUMERO</p>
  <p><strong>Adresse :</strong> VOTRE_ADRESSE</p>
  <p><strong>Email :</strong> VOTRE_EMAIL</p>
</div>
```

### Modifier le Logo
Le logo est géré par le composable `useLogo()` et s'adapte automatiquement.

## 📋 Exemple d'Utilisation

1. **Livraison de briques** :
   - Client : "Entreprise Martin"
   - Produits : 500 briques standard
   - Observation : "Livraison urgente"

2. **Génération du bordereau** :
   - Clic sur "Bordereau de Transfert"
   - Vérification des informations
   - Impression pour signatures

3. **Finalisation** :
   - Signature du chauffeur
   - Signature du client
   - Conservation du bordereau

## ✅ Avantages

- **Professionnalisme** : Document officiel et soigné
- **Traçabilité** : Numérotation et suivi des transferts
- **Légalité** : Conforme aux exigences commerciales
- **Efficacité** : Génération rapide et automatique
- **Flexibilité** : Adaptable à tous types de livraisons

Le bordereau de transfert garantit une traçabilité complète et un professionnalisme optimal pour toutes les livraisons de Global Star Distribution.
