// Services manquants pour compatibilité

import { useLaravelApi } from './laravelApiService'

const api = useLaravelApi()

// Fonctions de transformation
export function CompleteArticle(article: any): any {
  return {
    ...article,
    // Mapping des propriétés si nécessaire
  }
}

export function CompleteProduction(production: any): any {
  return {
    ...production,
    lotId: production.lot_id,
    articlesProduits: production.articlesProduits || [],
    tempsEffectif: production.tempsEffectif || 0,
    rendement: production.rendement || 0,
    coutProduction: production.coutProduction || 0,
    notes: production.notes || ''
  }
}

export function CompleteLivraison(livraison: any): any {
  return {
    ...livraison,
    numeroBl: livraison.numero_bl,
    codeSuivi: livraison.code_suivi,
    preuveDepot: livraison.preuve_depot,
    preuveReception: livraison.preuve_reception,
    signatureClient: livraison.signature_client,
    signatureChauffeur: livraison.signatureChauffeur,
    notes: livraison.notes || livraison.observations,
    heureLivraison: livraison.heure_livraison,
    produits: livraison.produits?.map((p: any) => ({
      ...p,
      quantiteCommandee: p.quantite_commandee,
      quantiteLivree: p.quantite_livree,
      resteAPayer: p.reste_a_payer
    })) || []
  }
}

export function CompleteCommande(commande: any): any {
  return {
    ...commande,
    numeroCommande: commande.numero_commande,
    statut: commande.statut as "en_attente" | "confirmee" | "livree" | "en_preparation" | "annulee",
    priorite: commande.priorite as "normale" | "urgente" | "critique"
  }
}

// Fonctions de service manquantes
export async function updateAnalyse(id: number, data: any): Promise<any> {
  try {
    return await (api as any).put(`/analyses/${id}`, data)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'analyse:', error)
    throw error
  }
}

export async function addAnalyse(data: any): Promise<any> {
  try {
    return await (api as any).post('/analyses', data)
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'analyse:', error)
    throw error
  }
}

export async function deleteAnalyseService(id: number): Promise<boolean> {
  try {
    return await (api as any).delete(`/analyses/${id}`)
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'analyse:', error)
    return false
  }
}

export async function updateUser(id: number, data: any): Promise<any> {
  try {
    return await api.updateUser(id, data)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    throw error
  }
}

export async function createUser(data: any): Promise<any> {
  try {
    return await api.createUser(data)
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    throw error
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    return await api.deleteUser(id)
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    return false
  }
}

// Fonction utilitaire manquante
export function getMode(): string {
  return import.meta.env.MODE || 'development'
}
