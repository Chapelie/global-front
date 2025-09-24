// Types pour les bordereaux de transfert
export interface Transfert {
  id: number
  numeroBordereau: string
  date: string
  client: string
  telephone?: string
  email?: string
  adresse?: string
  produits: Array<{
    designation: string
    quantite: number
    unite: string
    observation?: string
  }>
  chauffeur?: {
    nom: string
    telephone?: string
  }
  statut: 'en_preparation' | 'en_cours' | 'termine'
  dateCreation: string
  dateModification: string
  notes?: string
}

// Interface pour créer un nouveau transfert
export interface NouveauTransfert {
  client: string
  telephone?: string
  email?: string
  adresse?: string
  produits: Array<{
    designation: string
    quantite: number
    unite: string
    observation?: string
  }>
  notes?: string
}

// Interface pour les statistiques de transfert
export interface TransfertStats {
  totalTransferts: number
  transfertsEnCours: number
  transfertsTermines: number
  totalArticles: number
}
