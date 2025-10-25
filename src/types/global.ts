// Types globaux pour les fonctions manquantes

export interface CompleteArticle {
  id: number
  nom: string
  stock: number
  seuil_critique: number
  unite: string
  prix: number
  derniere_mise_a_jour: string
  notes?: string
  type_production: string
  capacite_production: number
  unite_production: string
  cout_production: number
  temps_production: number
  qualite: string
  actif: boolean
  user_id: number
  created_at: string
  updated_at: string
}

export interface CompleteProduction {
  id: number
  date: string
  statut: string
  lot_id?: string
  lotId?: string
  heure_debut?: string
  heure_fin?: string
  user_id: number
  created_at: string
  updated_at: string
  articlesProduits?: Array<{
    nom: string
    quantiteProduite: number
    unite: string
  }>
  tempsEffectif?: number
  rendement?: number
  coutProduction?: number
  notes?: string
}

export interface CompleteLivraison {
  id: number
  numero_bl: string
  numeroBl?: string
  date: string
  client: string
  telephone: string
  chauffeur: string
  statut: string
  adresse: string
  code_suivi?: string
  codeSuivi?: string
  preuve_depot?: string
  preuveDepot?: string
  preuve_reception?: string
  preuveReception?: string
  signature_client?: string
  signatureClient?: string
  signatureChauffeur?: string
  observations?: string
  notes?: string
  heure_livraison?: string
  heureLivraison?: string
  date_livraison?: string
  total_commande: number
  total_livraison: number
  difference_totale: number
  reste_a_payer_total: number
  user_id: number
  produits: Array<{
    nom: string
    quantite: number
    unite: string
    quantite_commandee: number
    quantiteCommandee?: number
    quantite_livree: number
    quantiteLivree?: number
    difference: number
    reste_a_payer: number
    resteAPayer?: number
    notes?: string
  }>
  created_at: string
  updated_at: string
}

export interface CompleteCommande {
  id: number
  numero_commande: string
  numeroCommande?: string
  date: string
  client: string
  telephone: string
  adresse: string
  statut: "en_attente" | "confirmee" | "livree" | "en_preparation" | "annulee"
  date_livraison_souhaitee?: string
  priorite: "normale" | "urgente" | "critique"
  statut_global_livraison: string
  total_livraisons: number
  total_restant: number
  user_id: number
  produits: Array<{
    nom: string
    quantite: number
    unite: string
  }>
  created_at: string
  updated_at: string
}

// Fonctions globales manquantes
export declare function CompleteArticle(article: any): CompleteArticle
export declare function CompleteProduction(production: any): CompleteProduction
export declare function CompleteLivraison(livraison: any): CompleteLivraison
export declare function CompleteCommande(commande: any): CompleteCommande

// Fonctions de service manquantes
export declare function updateAnalyse(id: number, data: any): Promise<any>
export declare function addAnalyse(data: any): Promise<any>
export declare function deleteAnalyseService(id: number): Promise<boolean>
export declare function updateUser(id: number, data: any): Promise<any>
export declare function createUser(data: any): Promise<any>
export declare function deleteUser(id: number): Promise<boolean>

// Fonction utilitaire manquante
export declare function getMode(): string







