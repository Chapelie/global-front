/**
 * Service Laravel complet
 * Remplace completeHybridService.ts pour utiliser exclusivement le backend Laravel
 */

import { ref, computed } from 'vue'
import { useLaravelApi, type LaravelArticle, type LaravelConsommable, type LaravelCommande, type LaravelLivraison, type LaravelProduction } from './laravelApiService'
import { useLaravelAuth } from './laravelAuth'
import { LARAVEL_CONFIG, debugLog, debugError } from '../config/laravel'

// Types compatibles avec l'ancien service
export interface CompleteArticle extends Omit<LaravelArticle, 'prix'> {
  prix: number
  typeProduction: string
  capaciteProduction: number
  uniteProduction: string
  coutProduction: number
  tempsProduction: number
  qualite: string
  actif: boolean
  derniereMiseAJour: string
  seuilCritique: number
}

export interface CompleteConsommable extends Omit<LaravelConsommable, 'prix_unitaire'> {
  prixUnitaire: number
  typeConsommable: string
  datePeremption?: string
  actif: boolean
  derniereMiseAJour: string
  seuilCritique: number
}

export interface CompleteCommande extends Omit<LaravelCommande, 'numero_commande' | 'date_livraison_souhaitee'> {
  numeroCommande: string
  dateLivraisonSouhaitee?: string
  produits: Array<{
    nom: string
    quantite: number
    unite: string
  }>
  statut: 'en_attente' | 'confirmee' | 'en_preparation' | 'livree' | 'annulee'
  priorite: 'basse' | 'normale' | 'haute' | 'urgente'
}

export interface CompleteLivraison extends Omit<LaravelLivraison, 'numero_bl' | 'code_suivi' | 'preuve_depot' | 'preuve_reception' | 'signature_client' | 'observations' | 'heure_livraison' | 'date_livraison'> {
  numeroBL: string
  codeSuivi?: string
  preuveDepot?: string
  preuveReception?: string
  signatureClient?: string
  observations?: string
  heureLivraison?: string
  dateLivraison?: string
  produits: Array<{
    nom: string
    quantite: number
    unite: string
    quantiteCommandee: number
    quantiteLivree: number
    difference: number
    resteAPayer: number
  }>
  statut: 'en_attente' | 'en_cours' | 'livree' | 'annulee'
  totalCommande: number
  totalLivraison: number
  differenceTotale: number
  resteAPayerTotal: number
}

export interface CompleteProduction extends Omit<LaravelProduction, 'lot_id' | 'heure_debut' | 'heure_fin'> {
  lotId?: string
  heureDebut?: string
  heureFin?: string
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee'
}

export interface CompleteUser {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface CompleteAnalyse {
  id: number
  type: string
  date: string
  resultat: string
  observations?: string
  userId: number
  createdAt: string
  updatedAt: string
}

export interface CompleteDocument {
  id: number
  nom: string
  type: string
  chemin: string
  taille: number
  userId: number
  createdAt: string
  updatedAt: string
}

class CompleteLaravelService {
  private api = useLaravelApi()
  private auth = useLaravelAuth()
  
  // État du service
  private loading = ref(false)
  private error = ref<string | null>(null)
  private lastSync = ref<Date | null>(null)

  // Getters
  get isLoading() {
    return computed(() => this.loading.value)
  }

  get hasError() {
    return computed(() => !!this.error.value)
  }

  get errorMessage() {
    return computed(() => this.error.value)
  }

  get isAuthenticated() {
    return computed(() => this.auth.isAuthenticated.value)
  }

  get currentUser() {
    return computed(() => this.auth.currentUser.value)
  }

  // ===== MAPPING DES DONNÉES =====

  // Mapping Article Laravel -> CompleteArticle
  private mapArticleFromLaravel(laravelArticle: LaravelArticle): CompleteArticle {
    return {
      id: laravelArticle.id,
      nom: laravelArticle.nom,
      categorie: laravelArticle.categorie,
      stock: laravelArticle.stock,
      seuilCritique: laravelArticle.seuil_critique,
      unite: laravelArticle.unite,
      prix: laravelArticle.prix,
      derniereMiseAJour: laravelArticle.derniere_mise_a_jour,
      notes: laravelArticle.notes,
      typeProduction: laravelArticle.type_production,
      capaciteProduction: laravelArticle.capacite_production,
      uniteProduction: laravelArticle.unite_production,
      coutProduction: laravelArticle.cout_production,
      tempsProduction: laravelArticle.temps_production,
      qualite: laravelArticle.qualite,
      actif: laravelArticle.actif,
      user_id: laravelArticle.user_id,
      created_at: laravelArticle.created_at,
      updated_at: laravelArticle.updated_at
    }
  }

  // Mapping CompleteArticle -> Laravel Article
  private mapArticleToLaravel(completeArticle: Partial<CompleteArticle>): Partial<LaravelArticle> {
    return {
      nom: completeArticle.nom,
      categorie: completeArticle.categorie,
      stock: completeArticle.stock,
      seuil_critique: completeArticle.seuilCritique,
      unite: completeArticle.unite,
      prix: completeArticle.prix,
      derniere_mise_a_jour: completeArticle.derniereMiseAJour,
      notes: completeArticle.notes,
      type_production: completeArticle.typeProduction,
      capacite_production: completeArticle.capaciteProduction,
      unite_production: completeArticle.uniteProduction,
      cout_production: completeArticle.coutProduction,
      temps_production: completeArticle.tempsProduction,
      qualite: completeArticle.qualite,
      actif: completeArticle.actif,
      user_id: completeArticle.user_id
    }
  }

  // Mapping Consommable Laravel -> CompleteConsommable
  private mapConsommableFromLaravel(laravelConsommable: LaravelConsommable): CompleteConsommable {
    return {
      id: laravelConsommable.id,
      nom: laravelConsommable.nom,
      categorie: laravelConsommable.categorie,
      stock: laravelConsommable.stock,
      seuilCritique: laravelConsommable.seuil_critique,
      unite: laravelConsommable.unite,
      prixUnitaire: laravelConsommable.prix_unitaire,
      derniereMiseAJour: laravelConsommable.derniere_mise_a_jour,
      notes: laravelConsommable.notes,
      typeConsommable: laravelConsommable.type_consommable,
      datePeremption: laravelConsommable.date_peremption,
      actif: laravelConsommable.actif,
      user_id: laravelConsommable.user_id,
      created_at: laravelConsommable.created_at,
      updated_at: laravelConsommable.updated_at
    }
  }

  // Mapping CompleteConsommable -> Laravel Consommable
  private mapConsommableToLaravel(completeConsommable: Partial<CompleteConsommable>): Partial<LaravelConsommable> {
    return {
      nom: completeConsommable.nom,
      categorie: completeConsommable.categorie,
      stock: completeConsommable.stock,
      seuil_critique: completeConsommable.seuilCritique,
      unite: completeConsommable.unite,
      prix_unitaire: completeConsommable.prixUnitaire,
      derniere_mise_a_jour: completeConsommable.derniereMiseAJour,
      notes: completeConsommable.notes,
      type_consommable: completeConsommable.typeConsommable,
      date_peremption: completeConsommable.datePeremption,
      actif: completeConsommable.actif,
      user_id: completeConsommable.user_id
    }
  }

  // Mapping Commande Laravel -> CompleteCommande
  private mapCommandeFromLaravel(laravelCommande: LaravelCommande): CompleteCommande {
    return {
      id: laravelCommande.id,
      numeroCommande: laravelCommande.numero_commande,
      date: laravelCommande.date,
      client: laravelCommande.client,
      telephone: laravelCommande.telephone,
      adresse: laravelCommande.adresse,
      statut: laravelCommande.statut as any,
      dateLivraisonSouhaitee: laravelCommande.date_livraison_souhaitee,
      priorite: laravelCommande.priorite as any,
      statutGlobalLivraison: laravelCommande.statut_global_livraison,
      totalLivraisons: laravelCommande.total_livraisons,
      totalRestant: laravelCommande.total_restant,
      user_id: laravelCommande.user_id,
      created_at: laravelCommande.created_at,
      updated_at: laravelCommande.updated_at,
      // Produits par défaut (à adapter selon votre structure)
      produits: []
    }
  }

  // Mapping CompleteCommande -> Laravel Commande
  private mapCommandeToLaravel(completeCommande: Partial<CompleteCommande>): Partial<LaravelCommande> {
    return {
      numero_commande: completeCommande.numeroCommande,
      date: completeCommande.date,
      client: completeCommande.client,
      telephone: completeCommande.telephone,
      adresse: completeCommande.adresse,
      statut: completeCommande.statut,
      date_livraison_souhaitee: completeCommande.dateLivraisonSouhaitee,
      priorite: completeCommande.priorite,
      statut_global_livraison: completeCommande.statutGlobalLivraison,
      total_livraisons: completeCommande.totalLivraisons,
      total_restant: completeCommande.totalRestant,
      user_id: completeCommande.user_id
    }
  }

  // Mapping Livraison Laravel -> CompleteLivraison
  private mapLivraisonFromLaravel(laravelLivraison: LaravelLivraison): CompleteLivraison {
    return {
      id: laravelLivraison.id,
      numeroBL: laravelLivraison.numero_bl,
      date: laravelLivraison.date,
      client: laravelLivraison.client,
      telephone: laravelLivraison.telephone,
      chauffeur: laravelLivraison.chauffeur,
      statut: laravelLivraison.statut as any,
      adresse: laravelLivraison.adresse,
      codeSuivi: laravelLivraison.code_suivi,
      preuveDepot: laravelLivraison.preuve_depot,
      preuveReception: laravelLivraison.preuve_reception,
      signatureClient: laravelLivraison.signature_client,
      observations: laravelLivraison.observations,
      heureLivraison: laravelLivraison.heure_livraison,
      dateLivraison: laravelLivraison.date_livraison,
      totalCommande: laravelLivraison.total_commande,
      totalLivraison: laravelLivraison.total_livraison,
      differenceTotale: laravelLivraison.difference_totale,
      resteAPayerTotal: laravelLivraison.reste_a_payer_total,
      user_id: laravelLivraison.user_id,
      created_at: laravelLivraison.created_at,
      updated_at: laravelLivraison.updated_at,
      // Produits par défaut (à adapter selon votre structure)
      produits: []
    }
  }

  // Mapping CompleteLivraison -> Laravel Livraison
  private mapLivraisonToLaravel(completeLivraison: Partial<CompleteLivraison>): Partial<LaravelLivraison> {
    return {
      numero_bl: completeLivraison.numeroBL,
      date: completeLivraison.date,
      client: completeLivraison.client,
      telephone: completeLivraison.telephone,
      chauffeur: completeLivraison.chauffeur,
      statut: completeLivraison.statut,
      adresse: completeLivraison.adresse,
      code_suivi: completeLivraison.codeSuivi,
      preuve_depot: completeLivraison.preuveDepot,
      preuve_reception: completeLivraison.preuveReception,
      signature_client: completeLivraison.signatureClient,
      observations: completeLivraison.observations,
      heure_livraison: completeLivraison.heureLivraison,
      date_livraison: completeLivraison.dateLivraison,
      total_commande: completeLivraison.totalCommande,
      total_livraison: completeLivraison.totalLivraison,
      difference_totale: completeLivraison.differenceTotale,
      reste_a_payer_total: completeLivraison.resteAPayerTotal,
      user_id: completeLivraison.user_id
    }
  }

  // Mapping Production Laravel -> CompleteProduction
  private mapProductionFromLaravel(laravelProduction: LaravelProduction): CompleteProduction {
    return {
      id: laravelProduction.id,
      date: laravelProduction.date,
      statut: laravelProduction.statut as any,
      lotId: laravelProduction.lot_id,
      heureDebut: laravelProduction.heure_debut,
      heureFin: laravelProduction.heure_fin,
      user_id: laravelProduction.user_id,
      created_at: laravelProduction.created_at,
      updated_at: laravelProduction.updated_at
    }
  }

  // Mapping CompleteProduction -> Laravel Production
  private mapProductionToLaravel(completeProduction: Partial<CompleteProduction>): Partial<LaravelProduction> {
    return {
      date: completeProduction.date,
      statut: completeProduction.statut,
      lot_id: completeProduction.lotId,
      heure_debut: completeProduction.heureDebut,
      heure_fin: completeProduction.heureFin,
      user_id: completeProduction.user_id
    }
  }

  // ===== MÉTHODES PUBLIQUES =====

  // Articles
  async getArticles(): Promise<CompleteArticle[]> {
    try {
      debugLog('Récupération des articles')
      this.loading.value = true
      this.error.value = null

      const laravelArticles = await this.api.getArticles()
      const completeArticles = laravelArticles.map(article => this.mapArticleFromLaravel(article))
      
      this.lastSync.value = new Date()
      debugLog('Articles récupérés', completeArticles.length)
      
      return completeArticles
    } catch (error) {
      debugError('Erreur lors de la récupération des articles', error)
      this.error.value = 'Erreur lors de la récupération des articles'
      return []
    } finally {
      this.loading.value = false
    }
  }

  async addArticle(article: Partial<CompleteArticle>): Promise<CompleteArticle | null> {
    try {
      debugLog('Ajout d\'un article', article)
      this.loading.value = true
      this.error.value = null

      const laravelArticle = this.mapArticleToLaravel(article)
      const newLaravelArticle = await this.api.addArticle(laravelArticle)
      
      if (newLaravelArticle) {
        const completeArticle = this.mapArticleFromLaravel(newLaravelArticle)
        debugLog('Article ajouté', completeArticle)
        return completeArticle
      }
      
      return null
    } catch (error) {
      debugError('Erreur lors de l\'ajout de l\'article', error)
      this.error.value = 'Erreur lors de l\'ajout de l\'article'
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async updateArticle(id: number, article: Partial<CompleteArticle>): Promise<CompleteArticle | null> {
    try {
      debugLog('Mise à jour de l\'article', { id, article })
      this.loading.value = true
      this.error.value = null

      const laravelArticle = this.mapArticleToLaravel(article)
      const updatedLaravelArticle = await this.api.updateArticle(id, laravelArticle)
      
      if (updatedLaravelArticle) {
        const completeArticle = this.mapArticleFromLaravel(updatedLaravelArticle)
        debugLog('Article mis à jour', completeArticle)
        return completeArticle
      }
      
      return null
    } catch (error) {
      debugError('Erreur lors de la mise à jour de l\'article', error)
      this.error.value = 'Erreur lors de la mise à jour de l\'article'
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async deleteArticle(id: number): Promise<boolean> {
    try {
      debugLog('Suppression de l\'article', id)
      this.loading.value = true
      this.error.value = null

      const success = await this.api.deleteArticle(id)
      debugLog('Article supprimé', success)
      
      return success
    } catch (error) {
      debugError('Erreur lors de la suppression de l\'article', error)
      this.error.value = 'Erreur lors de la suppression de l\'article'
      return false
    } finally {
      this.loading.value = false
    }
  }

  // Consommables
  async getConsommables(): Promise<CompleteConsommable[]> {
    try {
      debugLog('Récupération des consommables')
      this.loading.value = true
      this.error.value = null

      const laravelConsommables = await this.api.getConsommables()
      const completeConsommables = laravelConsommables.map(consommable => this.mapConsommableFromLaravel(consommable))
      
      this.lastSync.value = new Date()
      debugLog('Consommables récupérés', completeConsommables.length)
      
      return completeConsommables
    } catch (error) {
      debugError('Erreur lors de la récupération des consommables', error)
      this.error.value = 'Erreur lors de la récupération des consommables'
      return []
    } finally {
      this.loading.value = false
    }
  }

  async addConsommable(consommable: Partial<CompleteConsommable>): Promise<CompleteConsommable | null> {
    try {
      debugLog('Ajout d\'un consommable', consommable)
      this.loading.value = true
      this.error.value = null

      const laravelConsommable = this.mapConsommableToLaravel(consommable)
      const newLaravelConsommable = await this.api.addConsommable(laravelConsommable)
      
      if (newLaravelConsommable) {
        const completeConsommable = this.mapConsommableFromLaravel(newLaravelConsommable)
        debugLog('Consommable ajouté', completeConsommable)
        return completeConsommable
      }
      
      return null
    } catch (error) {
      debugError('Erreur lors de l\'ajout du consommable', error)
      this.error.value = 'Erreur lors de l\'ajout du consommable'
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async updateConsommable(id: number, consommable: Partial<CompleteConsommable>): Promise<CompleteConsommable | null> {
    try {
      debugLog('Mise à jour du consommable', { id, consommable })
      this.loading.value = true
      this.error.value = null

      const laravelConsommable = this.mapConsommableToLaravel(consommable)
      const updatedLaravelConsommable = await this.api.updateConsommable(id, laravelConsommable)
      
      if (updatedLaravelConsommable) {
        const completeConsommable = this.mapConsommableFromLaravel(updatedLaravelConsommable)
        debugLog('Consommable mis à jour', completeConsommable)
        return completeConsommable
      }
      
      return null
    } catch (error) {
      debugError('Erreur lors de la mise à jour du consommable', error)
      this.error.value = 'Erreur lors de la mise à jour du consommable'
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async deleteConsommable(id: number): Promise<boolean> {
    try {
      debugLog('Suppression du consommable', id)
      this.loading.value = true
      this.error.value = null

      const success = await this.api.deleteConsommable(id)
      debugLog('Consommable supprimé', success)
      
      return success
    } catch (error) {
      debugError('Erreur lors de la suppression du consommable', error)
      this.error.value = 'Erreur lors de la suppression du consommable'
      return false
    } finally {
      this.loading.value = false
    }
  }

  // Commandes
  async getCommandes(): Promise<CompleteCommande[]> {
    try {
      debugLog('Récupération des commandes')
      this.loading.value = true
      this.error.value = null

      const laravelCommandes = await this.api.getCommandes()
      const completeCommandes = laravelCommandes.map(commande => this.mapCommandeFromLaravel(commande))
      
      this.lastSync.value = new Date()
      debugLog('Commandes récupérées', completeCommandes.length)
      
      return completeCommandes
    } catch (error) {
      debugError('Erreur lors de la récupération des commandes', error)
      this.error.value = 'Erreur lors de la récupération des commandes'
      return []
    } finally {
      this.loading.value = false
    }
  }

  async addCommande(commande: Partial<CompleteCommande>): Promise<CompleteCommande | null> {
    try {
      debugLog('Ajout d\'une commande', commande)
      this.loading.value = true
      this.error.value = null

      const laravelCommande = this.mapCommandeToLaravel(commande)
      const newLaravelCommande = await this.api.addCommande(laravelCommande)
      
      if (newLaravelCommande) {
        const completeCommande = this.mapCommandeFromLaravel(newLaravelCommande)
        debugLog('Commande ajoutée', completeCommande)
        return completeCommande
      }
      
      return null
    } catch (error) {
      debugError('Erreur lors de l\'ajout de la commande', error)
      this.error.value = 'Erreur lors de l\'ajout de la commande'
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async updateCommande(id: number, commande: Partial<CompleteCommande>): Promise<CompleteCommande | null> {
    try {
      debugLog('Mise à jour de la commande', { id, commande })
      this.loading.value = true
      this.error.value = null

      const laravelCommande = this.mapCommandeToLaravel(commande)
      const updatedLaravelCommande = await this.api.updateCommande(id, laravelCommande)
      
      if (updatedLaravelCommande) {
        const completeCommande = this.mapCommandeFromLaravel(updatedLaravelCommande)
        debugLog('Commande mise à jour', completeCommande)
        return completeCommande
      }
      
      return null
    } catch (error) {
      debugError('Erreur lors de la mise à jour de la commande', error)
      this.error.value = 'Erreur lors de la mise à jour de la commande'
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async deleteCommande(id: number): Promise<boolean> {
    try {
      debugLog('Suppression de la commande', id)
      this.loading.value = true
      this.error.value = null

      const success = await this.api.deleteCommande(id)
      debugLog('Commande supprimée', success)
      
      return success
    } catch (error) {
      debugError('Erreur lors de la suppression de la commande', error)
      this.error.value = 'Erreur lors de la suppression de la commande'
      return false
    } finally {
      this.loading.value = false
    }
  }

  // Livraisons
  async getLivraisons(): Promise<CompleteLivraison[]> {
    try {
      debugLog('Récupération des livraisons')
      this.loading.value = true
      this.error.value = null

      const laravelLivraisons = await this.api.getLivraisons()
      const completeLivraisons = laravelLivraisons.map(livraison => this.mapLivraisonFromLaravel(livraison))
      
      this.lastSync.value = new Date()
      debugLog('Livraisons récupérées', completeLivraisons.length)
      
      return completeLivraisons
    } catch (error) {
      debugError('Erreur lors de la récupération des livraisons', error)
      this.error.value = 'Erreur lors de la récupération des livraisons'
      return []
    } finally {
      this.loading.value = false
    }
  }

  async addLivraison(livraison: Partial<CompleteLivraison>): Promise<CompleteLivraison | null> {
    try {
      debugLog('Ajout d\'une livraison', livraison)
      this.loading.value = true
      this.error.value = null

      const laravelLivraison = this.mapLivraisonToLaravel(livraison)
      const newLaravelLivraison = await this.api.addLivraison(laravelLivraison)
      
      if (newLaravelLivraison) {
        const completeLivraison = this.mapLivraisonFromLaravel(newLaravelLivraison)
        debugLog('Livraison ajoutée', completeLivraison)
        return completeLivraison
      }
      
      return null
    } catch (error) {
      debugError('Erreur lors de l\'ajout de la livraison', error)
      this.error.value = 'Erreur lors de l\'ajout de la livraison'
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async updateLivraison(id: number, livraison: Partial<CompleteLivraison>): Promise<CompleteLivraison | null> {
    try {
      debugLog('Mise à jour de la livraison', { id, livraison })
      this.loading.value = true
      this.error.value = null

      const laravelLivraison = this.mapLivraisonToLaravel(livraison)
      const updatedLaravelLivraison = await this.api.updateLivraison(id, laravelLivraison)
      
      if (updatedLaravelLivraison) {
        const completeLivraison = this.mapLivraisonFromLaravel(updatedLaravelLivraison)
        debugLog('Livraison mise à jour', completeLivraison)
        return completeLivraison
      }
      
      return null
    } catch (error) {
      debugError('Erreur lors de la mise à jour de la livraison', error)
      this.error.value = 'Erreur lors de la mise à jour de la livraison'
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async deleteLivraison(id: number): Promise<boolean> {
    try {
      debugLog('Suppression de la livraison', id)
      this.loading.value = true
      this.error.value = null

      const success = await this.api.deleteLivraison(id)
      debugLog('Livraison supprimée', success)
      
      return success
    } catch (error) {
      debugError('Erreur lors de la suppression de la livraison', error)
      this.error.value = 'Erreur lors de la suppression de la livraison'
      return false
    } finally {
      this.loading.value = false
    }
  }

  // Productions
  async getProductions(): Promise<CompleteProduction[]> {
    try {
      debugLog('Récupération des productions')
      this.loading.value = true
      this.error.value = null

      const laravelProductions = await this.api.getProductions()
      const completeProductions = laravelProductions.map(production => this.mapProductionFromLaravel(production))
      
      this.lastSync.value = new Date()
      debugLog('Productions récupérées', completeProductions.length)
      
      return completeProductions
    } catch (error) {
      debugError('Erreur lors de la récupération des productions', error)
      this.error.value = 'Erreur lors de la récupération des productions'
      return []
    } finally {
      this.loading.value = false
    }
  }

  async addProduction(production: Partial<CompleteProduction>): Promise<CompleteProduction | null> {
    try {
      debugLog('Ajout d\'une production', production)
      this.loading.value = true
      this.error.value = null

      const laravelProduction = this.mapProductionToLaravel(production)
      const newLaravelProduction = await this.api.addProduction(laravelProduction)
      
      if (newLaravelProduction) {
        const completeProduction = this.mapProductionFromLaravel(newLaravelProduction)
        debugLog('Production ajoutée', completeProduction)
        return completeProduction
      }
      
      return null
    } catch (error) {
      debugError('Erreur lors de l\'ajout de la production', error)
      this.error.value = 'Erreur lors de l\'ajout de la production'
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async updateProduction(id: number, production: Partial<CompleteProduction>): Promise<CompleteProduction | null> {
    try {
      debugLog('Mise à jour de la production', { id, production })
      this.loading.value = true
      this.error.value = null

      const laravelProduction = this.mapProductionToLaravel(production)
      const updatedLaravelProduction = await this.api.updateProduction(id, laravelProduction)
      
      if (updatedLaravelProduction) {
        const completeProduction = this.mapProductionFromLaravel(updatedLaravelProduction)
        debugLog('Production mise à jour', completeProduction)
        return completeProduction
      }
      
      return null
    } catch (error) {
      debugError('Erreur lors de la mise à jour de la production', error)
      this.error.value = 'Erreur lors de la mise à jour de la production'
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async deleteProduction(id: number): Promise<boolean> {
    try {
      debugLog('Suppression de la production', id)
      this.loading.value = true
      this.error.value = null

      const success = await this.api.deleteProduction(id)
      debugLog('Production supprimée', success)
      
      return success
    } catch (error) {
      debugError('Erreur lors de la suppression de la production', error)
      this.error.value = 'Erreur lors de la suppression de la production'
      return false
    } finally {
      this.loading.value = false
    }
  }

  // ===== MÉTHODES UTILITAIRES =====

  // Dashboard et statistiques
  async getDashboardStats(): Promise<any> {
    try {
      debugLog('Récupération des statistiques du dashboard')
      this.loading.value = true
      this.error.value = null

      const stats = await this.api.getDashboardStats()
      debugLog('Statistiques récupérées', stats)
      
      return stats
    } catch (error) {
      debugError('Erreur lors de la récupération des statistiques', error)
      this.error.value = 'Erreur lors de la récupération des statistiques'
      return {}
    } finally {
      this.loading.value = false
    }
  }

  async getStockInfo(): Promise<any> {
    try {
      debugLog('Récupération des informations de stock')
      this.loading.value = true
      this.error.value = null

      const stockInfo = await this.api.getStockInfo()
      debugLog('Informations de stock récupérées', stockInfo)
      
      return stockInfo
    } catch (error) {
      debugError('Erreur lors de la récupération des informations de stock', error)
      this.error.value = 'Erreur lors de la récupération des informations de stock'
      return {
        articlesStockCritique: [],
        consommablesStockCritique: [],
        consommablesPerimes: [],
        totalArticlesStockCritique: 0,
        totalConsommablesStockCritique: 0,
        totalConsommablesPerimes: 0
      }
    } finally {
      this.loading.value = false
    }
  }

  async getProductionsDuJour(): Promise<CompleteProduction[]> {
    try {
      debugLog('Récupération des productions du jour')
      this.loading.value = true
      this.error.value = null

      const laravelProductions = await this.api.getProductionsDuJour()
      const completeProductions = laravelProductions.map(production => this.mapProductionFromLaravel(production))
      
      debugLog('Productions du jour récupérées', completeProductions.length)
      
      return completeProductions
    } catch (error) {
      debugError('Erreur lors de la récupération des productions du jour', error)
      this.error.value = 'Erreur lors de la récupération des productions du jour'
      return []
    } finally {
      this.loading.value = false
    }
  }

  // Méthodes de compatibilité (pour les vues existantes)
  async getUsers(): Promise<CompleteUser[]> {
    // TODO: Implémenter quand l'API users sera disponible
    return []
  }

  async getAnalyses(): Promise<CompleteAnalyse[]> {
    // TODO: Implémenter quand l'API analyses sera disponible
    return []
  }

  async getDocuments(): Promise<CompleteDocument[]> {
    // TODO: Implémenter quand l'API documents sera disponible
    return []
  }

  // Nettoyage des erreurs
  clearError(): void {
    this.error.value = null
  }

  // Informations de synchronisation
  getLastSync(): Date | null {
    return this.lastSync.value
  }
}

// Instance singleton
const completeLaravelService = new CompleteLaravelService()

// Composable pour Vue
export function useCompleteLaravelService() {
  return completeLaravelService
}

// Export de l'instance pour utilisation directe
export default completeLaravelService

// Export des types
export type {
  CompleteArticle,
  CompleteConsommable,
  CompleteCommande,
  CompleteLivraison,
  CompleteProduction,
  CompleteUser,
  CompleteAnalyse,
  CompleteDocument
}
