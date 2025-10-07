# Implémentation du générateur de BL avec signatures et storage Supabase

## ✅ Fonctionnalités implémentées

### 1. Générateur de BL avec signatures (`src/components/BLGenerator.vue`)
- **Composant complet** pour la génération de Bons de Livraison
- **Signatures électroniques** : Livreur et Client
- **Génération PDF** avec html2canvas et jsPDF
- **Sauvegarde automatique** dans Supabase Storage
- **Interface utilisateur** avec canvas pour dessiner les signatures
- **Validation** : Vérification que les deux signatures sont présentes avant génération

### 2. Gestion des documents avec Supabase Storage (`src/services/completeHybridService.ts`)
- **Méthodes CRUD** pour les documents :
  - `getDocuments()` - Récupérer tous les documents
  - `addDocument()` - Ajouter un document avec upload dans Supabase Storage
  - `deleteDocument()` - Supprimer un document (fichier + entrée DB)
- **Mapping automatique** entre camelCase (frontend) et snake_case (Supabase)
- **Gestion des erreurs** avec fallback vers localStorage
- **Storage bucket** : `documents` pour stocker les fichiers PDF

### 3. Page de visualisation des documents (`src/views/DocumentsView.vue`)
- **Liste des documents** avec filtres par type et recherche
- **Statistiques** : Total documents, Bons de livraison, Espace utilisé
- **Actions** : Voir, Télécharger, Supprimer
- **Interface moderne** avec cards et icônes
- **Responsive** et optimisée

### 4. Intégration dans la page Livraisons (`src/views/LivraisonView.vue`)
- **Bouton "Générer BL avec signatures"** dans les livraisons terminées
- **Modal** pour le générateur de BL
- **Gestion des événements** : Ouverture, fermeture, sauvegarde
- **Feedback utilisateur** après sauvegarde

## 📋 Scripts SQL fournis

### 1. Table `documents` (`supabase_documents_setup.sql`)
```sql
CREATE TABLE public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT NOT NULL,
  taille BIGINT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Bucket Storage `documents`
- **Bucket public** pour les documents
- **Politiques RLS** pour isoler les documents par utilisateur
- **Upload, lecture, mise à jour, suppression** sécurisés

## 🚀 Utilisation

### 1. Configurer Supabase
```bash
# Exécuter le script SQL dans Supabase
cat supabase_documents_setup.sql | supabase db sql
```

### 2. Générer un BL
1. Aller sur la page **Livraisons** (`/livraison`)
2. Sélectionner une livraison terminée
3. Cliquer sur **"Générer BL avec signatures"**
4. Signer avec le canvas (livreur et client)
5. Cliquer sur **"Générer PDF"**
6. Cliquer sur **"Sauvegarder dans Documents"**

### 3. Visualiser les documents
1. Aller sur la page **Documents** (`/documents`)
2. Voir la liste des BL générés
3. **Télécharger** ou **Supprimer** les documents

## 📦 Dépendances installées
```json
{
  "html2canvas": "^1.4.1",
  "jspdf": "^2.5.1"
}
```

## 🔧 Configuration

### Interface `CompleteDocument`
```typescript
export interface CompleteDocument {
  id?: string
  nom: string
  type: string
  taille: number
  url: string
  description: string
  user_id?: string
}
```

### Types de documents supportés
- `bon_livraison` - Bon de livraison
- `facture` - Facture
- `devis` - Devis
- `autre` - Autre

## 🎯 Workflow complet

1. **Livraison terminée** → Statut `livre`
2. **Clic sur "Générer BL"** → Ouverture du générateur
3. **Signatures** → Livreur et Client signent
4. **Génération PDF** → Création du document
5. **Sauvegarde Supabase** → Upload dans Storage + Entrée DB
6. **Visualisation** → Page Documents
7. **Téléchargement** → Accès au PDF

## 🔐 Sécurité

- **RLS activé** sur la table `documents`
- **Isolation par utilisateur** via `user_id`
- **Politiques Storage** pour protéger les fichiers
- **Validation des signatures** avant génération

## ⚠️ Notes importantes

### Erreurs de linting à corriger
1. **Property 'notes' manquante** : Ajoutée aux produits
2. **numeroBL vs numeroBl** : Incohérence entre `LivraisonAvecSignature` et `CompleteLivraison`
   - Solution : Mettre à jour `LivraisonAvecSignature` pour utiliser `numeroBl`
   - Ou : Créer un alias dans le service

### Prochaines étapes
1. Corriger l'incohérence `numeroBL` / `numeroBl`
2. Tester l'upload dans Supabase Storage
3. Vérifier les permissions du bucket
4. Ajouter des notifications de succès/erreur
5. Implémenter la prévisualisation des PDF

## 📄 Fichiers créés/modifiés

### Créés
- `src/components/BLGenerator.vue`
- `src/views/DocumentsView.vue`
- `supabase_documents_setup.sql`
- `IMPLEMENTATION_BL_DOCUMENTS.md`

### Modifiés
- `src/services/completeHybridService.ts`
  - Ajout interface `CompleteDocument`
  - Méthodes CRUD documents
  - Mapping Supabase
- `src/views/LivraisonView.vue`
  - Import BLGenerator
  - État pour modal BL
  - Méthodes ouverture/fermeture
  - Bouton dans template
- `package.json`
  - Ajout html2canvas
  - Ajout jsPDF

## 🎨 Interface utilisateur

### Générateur de BL
- **Header** avec logo et informations BL
- **Informations** client et livraison
- **Articles** livrés en tableau
- **Signatures** avec canvas interactifs
- **Actions** : Effacer, Générer, Sauvegarder

### Page Documents
- **Stats** en haut de page
- **Filtres** par type et recherche
- **Cards** pour chaque document
- **Actions** rapides sur chaque card

## 🔄 Synchronisation

- **Supabase actif** : Documents dans Storage + DB
- **Fallback localStorage** : Sauvegarde locale si Supabase indisponible
- **Hybride** : Meilleure expérience utilisateur

## ✅ Tests recommandés

1. **Génération BL** avec signatures
2. **Upload Supabase** vérifier dans Storage
3. **Téléchargement** PDF depuis Documents
4. **Suppression** document (Storage + DB)
5. **Filtres** et recherche
6. **Responsive** mobile/tablette

