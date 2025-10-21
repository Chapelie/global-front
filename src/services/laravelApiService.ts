/**
 * Service Laravel API avec Laravel Sanctum
 * Remplace completeHybridService.ts pour utiliser le backend Laravel
 */

import { ref, computed } from 'vue'
import { mapCommandeData, mapLivraisonData, mapProductionData, mapArticleData, mapArrayData } from '../utils/dataMapper'

// Types Laravel
interface LaravelUser {
  id: number
  name: string
  email: string
  phone?: string
  department?: string
  position?: string
  first_name?: string
  last_name?: string
  role?: string
  actif?: boolean
  user_metadata?: {
    full_name?: string
    department?: string
    [key: string]: any
  }
  roles: Array<{
    id: number
    name: string
    display_name?: string
  }>
  created_at: string
  updated_at: string
}

interface LaravelArticle {
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

interface LaravelConsommable {
  id: number
  nom: string
  stock: number
  seuil_critique: number
  unite: string
  prix_unitaire: number
  derniere_mise_a_jour: string
  notes?: string
  type_consommable: string
  date_peremption?: string
  actif: boolean
  user_id: number
  created_at: string
  updated_at: string
}

interface LaravelCommande {
  id: number
  numero_commande: string
  numeroCommande?: string
  date: string
  client: string
  telephone: string
  adresse: string
  statut: string
  date_livraison_souhaitee?: string
  priorite: string
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

interface LaravelLivraison {
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

interface LaravelProduction {
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
  // Propriétés étendues pour compatibilité
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

interface LaravelDocument {
  id: number
  titre: string
  type: string
  numero: string
  chemin_fichier: string
  date_creation: string
  cree_par?: number
  donnees_document?: any
  statut: string
  createur?: LaravelUser
  file_url: string
  file_size: string
  formatted_date_creation: string
  created_at: string
  updated_at: string
}

class LaravelApiService {
  private baseURL = import.meta.env.VITE_LARAVEL_API_BASE_URL || 'http://localhost:8000/api'
  private token = ref<string | null>(localStorage.getItem('token'))

  constructor() {
    this.token.value = localStorage.getItem('token')
  }

  // Headers avec authentification
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    
    if (this.token.value) {
      headers['Authorization'] = `Bearer ${this.token.value}`
    }
    
    return headers
  }

  // Méthodes HTTP de base
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  private async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  private async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  private async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  private async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  private async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Authentification
  setToken(token: string | null) {
    this.token.value = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  isAuthenticated = computed(() => !!this.token.value)

  // ===== ARTICLES =====
  getArticles = async (): Promise<LaravelArticle[]> => {
    try {
      const response = await this.get<{ data: LaravelArticle[] }>('/articles')
      console.log('🔍 [LaravelApiService] Réponse articles brute:', response)
      const mappedData = mapArrayData(response.data || [], mapArticleData)
      console.log('✅ [LaravelApiService] Articles mappés:', mappedData)
      return mappedData
    } catch (error) {
      console.error('Erreur lors de la récupération des articles:', error)
      return []
    }
  }

  getArticle = async (id: number): Promise<LaravelArticle | null> => {
    try {
      const response = await this.get<{ data: LaravelArticle }>(`/articles/${id}`)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'article ${id}:`, error)
      return null
    }
  }

  addArticle = async (articleData: Partial<LaravelArticle>): Promise<LaravelArticle | null> => {
    try {
      const response = await this.post<{ data: LaravelArticle }>('/articles', articleData)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'article:', error)
      throw error
    }
  }

  updateArticle = async (id: number, articleData: Partial<LaravelArticle>): Promise<LaravelArticle | null> => {
    try {
      const response = await this.put<{ data: LaravelArticle }>(`/articles/${id}`, articleData)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'article ${id}:`, error)
      throw error
    }
  }

  deleteArticle = async (id: number): Promise<boolean> => {
    try {
      await this.delete(`/articles/${id}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'article ${id}:`, error)
      return false
    }
  }

  async updateArticleStock(id: number, stock: number): Promise<LaravelArticle | null> {
    try {
      const response = await this.patch<{ data: LaravelArticle }>(`/articles/${id}/stock`, { stock })
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du stock de l'article ${id}:`, error)
      throw error
    }
  }

  async getArticlesStats(): Promise<any> {
    try {
      return await this.get('/articles/stats')
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des articles:', error)
      return {}
    }
  }

  async getArticlesStockCritique(): Promise<LaravelArticle[]> {
    try {
      const response = await this.get<{ data: LaravelArticle[] }>('/articles/stock-critique')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des articles en stock critique:', error)
      return []
    }
  }

  async getArticlesActifs(): Promise<LaravelArticle[]> {
    try {
      const response = await this.get<{ data: LaravelArticle[] }>('/articles/actifs')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des articles actifs:', error)
      return []
    }
  }



  // ===== CONSOMMABLES =====
  async getConsommables(): Promise<LaravelConsommable[]> {
    try {
      const response = await this.get<{ data: LaravelConsommable[] }>('/consommables')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des consommables:', error)
      return []
    }
  }

  async getConsommable(id: number): Promise<LaravelConsommable | null> {
    try {
      const response = await this.get<{ data: LaravelConsommable }>(`/consommables/${id}`)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la récupération du consommable ${id}:`, error)
      return null
    }
  }

  async addConsommable(consommableData: Partial<LaravelConsommable>): Promise<LaravelConsommable | null> {
    try {
      const response = await this.post<{ data: LaravelConsommable }>('/consommables', consommableData)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de l\'ajout du consommable:', error)
      throw error
    }
  }

  async updateConsommable(id: number, consommableData: Partial<LaravelConsommable>): Promise<LaravelConsommable | null> {
    try {
      const response = await this.put<{ data: LaravelConsommable }>(`/consommables/${id}`, consommableData)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du consommable ${id}:`, error)
      throw error
    }
  }

  async deleteConsommable(id: number): Promise<boolean> {
    try {
      await this.delete(`/consommables/${id}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression du consommable ${id}:`, error)
      return false
    }
  }

  async updateConsommableStock(id: number, stock: number): Promise<LaravelConsommable | null> {
    try {
      const response = await this.patch<{ data: LaravelConsommable }>(`/consommables/${id}/stock`, { stock })
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du stock du consommable ${id}:`, error)
      throw error
    }
  }

  async getConsommablesStats(): Promise<any> {
    try {
      return await this.get('/consommables/stats')
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des consommables:', error)
      return {}
    }
  }

  async getConsommablesStockCritique(): Promise<LaravelConsommable[]> {
    try {
      const response = await this.get<{ data: LaravelConsommable[] }>('/consommables/stock-critique')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des consommables en stock critique:', error)
      return []
    }
  }

  async getConsommablesPerimes(): Promise<LaravelConsommable[]> {
    try {
      const response = await this.get<{ data: LaravelConsommable[] }>('/consommables/perimes')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des consommables périmés:', error)
      return []
    }
  }

  async getConsommablesVaPerimer(days: number = 30): Promise<LaravelConsommable[]> {
    try {
      const response = await this.get<{ data: LaravelConsommable[] }>(`/consommables/va-perimer?days=${days}`)
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des consommables qui vont périmer:', error)
      return []
    }
  }

  // ===== COMMANDES =====
  getCommandes = async (): Promise<LaravelCommande[]> => {
    try {
      const response = await this.get<LaravelCommande[]>('/orders')
      console.log('🔍 [LaravelApiService] Réponse commandes brute:', response)
      const mappedData = mapArrayData(response || [], mapCommandeData)
      console.log('✅ [LaravelApiService] Commandes mappées:', mappedData)
      return mappedData
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return []
    }
  }

  getCommande = async (id: number): Promise<LaravelCommande | null> => {
    try {
      const response = await this.get<{ data: LaravelCommande }>(`/orders/${id}`)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la récupération de la commande ${id}:`, error)
      return null
    }
  }

  addCommande = async (commandeData: Partial<LaravelCommande>): Promise<LaravelCommande | null> => {
    try {
      const response = await this.post<LaravelCommande>('/orders', commandeData)
      return response || null
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error)
      throw error
    }
  }

  updateCommande = async (id: number, commandeData: Partial<LaravelCommande>): Promise<LaravelCommande | null> => {
    try {
      const response = await this.put<{ data: LaravelCommande }>(`/orders/${id}`, commandeData)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la commande ${id}:`, error)
      throw error
    }
  }

  deleteCommande = async (id: number): Promise<boolean> => {
    try {
      await this.delete(`/orders/${id}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression de la commande ${id}:`, error)
      return false
    }
  }

  async getCommandesStats(): Promise<any> {
    try {
      return await this.get('/orders/stats')
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des commandes:', error)
      return {}
    }
  }

  // ===== LIVRAISONS =====
  getLivraisons = async (): Promise<LaravelLivraison[]> => {
    try {
      const response = await this.get<LaravelLivraison[]>('/storage/livraisons')
      console.log('🔍 [LaravelApiService] Réponse livraisons brute:', response)
      const mappedData = mapArrayData(response || [], mapLivraisonData)
      console.log('✅ [LaravelApiService] Livraisons mappées:', mappedData)
      return mappedData
    } catch (error) {
      console.error('Erreur lors de la récupération des livraisons:', error)
      return []
    }
  }

  getLivraison = async (id: number): Promise<LaravelLivraison | null> => {
    try {
      const response = await this.get<{ data: LaravelLivraison }>(`/deliveries/${id}`)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la récupération de la livraison ${id}:`, error)
      return null
    }
  }

  addLivraison = async (livraisonData: Partial<LaravelLivraison>): Promise<LaravelLivraison | null> => {
    try {
      const response = await this.post<LaravelLivraison>('/storage/livraisons/add', livraisonData)
      return response || null
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la livraison:', error)
      throw error
    }
  }

  updateLivraison = async (id: number, livraisonData: Partial<LaravelLivraison>): Promise<LaravelLivraison | null> => {
    try {
      const response = await this.put<LaravelLivraison>(`/storage/livraisons/${id}`, livraisonData)
      return response || null
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la livraison ${id}:`, error)
      throw error
    }
  }

  deleteLivraison = async (id: number): Promise<boolean> => {
    try {
      await this.delete(`/storage/livraisons/${id}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression de la livraison ${id}:`, error)
      return false
    }
  }

  getLivraisonsStats = async (): Promise<any> => {
    try {
      return await this.get('/deliveries/stats')
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des livraisons:', error)
      return {}
    }
  }

  // Mettre à jour les quantités livrées
  mettreAJourQuantitesLivrees = async (id: number, data: { quantites_livrees: Array<{ nom: string, quantite: number }> }): Promise<LaravelLivraison | null> => {
    try {
      const response = await this.put<LaravelLivraison>(`/storage/livraisons/${id}/quantites-livrees`, data)
      return response
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des quantités livrées ${id}:`, error)
      return null
    }
  }

  // Finaliser une livraison avec signature
  finaliserLivraisonAvecSignature = async (id: number, data: { signature_client: string, observations?: string }): Promise<LaravelLivraison | null> => {
    try {
      const response = await this.post<LaravelLivraison>(`/storage/livraisons/${id}/finaliser-avec-signature`, data)
      return response
    } catch (error) {
      console.error(`Erreur lors de la finalisation de la livraison ${id}:`, error)
      return null
    }
  }

  // Commencer une livraison
  commencerLivraisonAPI = async (id: number): Promise<LaravelLivraison | null> => {
    try {
      const response = await this.post<LaravelLivraison>(`/storage/livraisons/${id}/commencer`, {})
      return response
    } catch (error) {
      console.error(`Erreur lors du commencement de la livraison ${id}:`, error)
      return null
    }
  }

  // ===== PRODUCTIONS =====
  getProductions = async (): Promise<LaravelProduction[]> => {
    try {
      const response = await this.get<{ data: LaravelProduction[] }>('/production/batches')
      console.log('🔍 [LaravelApiService] Réponse productions brute:', response)
      const mappedData = mapArrayData(response.data || [], mapProductionData)
      console.log('✅ [LaravelApiService] Productions mappées:', mappedData)
      return mappedData
    } catch (error) {
      console.error('Erreur lors de la récupération des productions:', error)
      return []
    }
  }

  getProduction = async (id: number): Promise<LaravelProduction | null> => {
    try {
      const response = await this.get<{ data: LaravelProduction }>(`/production/batches/${id}`)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la récupération de la production ${id}:`, error)
      return null
    }
  }

  addProduction = async (productionData: Partial<LaravelProduction>): Promise<LaravelProduction | null> => {
    try {
      const response = await this.post<{ data: LaravelProduction }>('/production/batches', productionData)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la production:', error)
      throw error
    }
  }

  updateProduction = async (id: number, productionData: Partial<LaravelProduction>): Promise<LaravelProduction | null> => {
    try {
      const response = await this.put<{ data: LaravelProduction }>(`/production/batches/${id}`, productionData)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la production ${id}:`, error)
      throw error
    }
  }

  deleteProduction = async (id: number): Promise<boolean> => {
    try {
      await this.delete(`/production/batches/${id}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression de la production ${id}:`, error)
      return false
    }
  }

  getProductionsStats = async (): Promise<any> => {
    try {
      return await this.get('/production/batches/stats')
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des productions:', error)
      return {}
    }
  }

  // ===== UTILISATEURS =====
  getUsers = async (): Promise<LaravelUser[]> => {
    try {
      const response = await this.get<{ data: LaravelUser[] }>('/users')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      return []
    }
  }

  createUser = async (userData: Omit<LaravelUser, 'id' | 'created_at' | 'updated_at'> & { password: string }): Promise<LaravelUser | null> => {
    try {
      const response = await this.post<{ data: LaravelUser }>('/users', userData)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error)
      throw error
    }
  }

  updateUser = async (id: number, userData: Partial<LaravelUser>): Promise<LaravelUser | null> => {
    try {
      const response = await this.put<{ data: LaravelUser }>(`/users/${id}`, userData)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
      throw error
    }
  }

  deleteUser = async (id: number): Promise<boolean> => {
    try {
      await this.delete(`/users/${id}`)
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      return false
    }
  }

  // ===== DOCUMENTS =====
  getDocuments = async (): Promise<LaravelDocument[]> => {
    try {
      const response = await this.get<{ data: LaravelDocument[] }>('/documents')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error)
      return []
    }
  }

  getDocument = async (id: number): Promise<LaravelDocument | null> => {
    try {
      const response = await this.get<{ data: LaravelDocument }>(`/documents/${id}`)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la récupération du document ${id}:`, error)
      return null
    }
  }

  generateDeliveryNote = async (data: any): Promise<LaravelDocument | null> => {
    try {
      const response = await this.post<{ data: LaravelDocument }>('/documents/delivery-note', data)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de la génération du bordereau de livraison:', error)
      throw error
    }
  }

  generateInvoice = async (data: any): Promise<LaravelDocument | null> => {
    try {
      const response = await this.post<{ data: LaravelDocument }>('/documents/invoice', data)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error)
      throw error
    }
  }

  downloadDocument = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${this.baseURL}/documents/${id}/download`, {
        headers: this.getHeaders()
      })

      if (!response.ok) throw new Error('Erreur lors du téléchargement')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `document-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error(`Erreur lors du téléchargement du document ${id}:`, error)
      throw error
    }
  }

  archiveDocument = async (id: number): Promise<boolean> => {
    try {
      await this.patch(`/documents/${id}/archive`, {})
      return true
    } catch (error) {
      console.error(`Erreur lors de l'archivage du document ${id}:`, error)
      return false
    }
  }

  deleteDocument = async (id: number): Promise<boolean> => {
    try {
      await this.delete(`/documents/${id}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression du document ${id}:`, error)
      return false
    }
  }

  getDocumentTypes = async (): Promise<{ value: string; label: string }[]> => {
    try {
      const response = await this.get<{ data: { value: string; label: string }[] }>('/documents/types')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des types de documents:', error)
      return []
    }
  }

  // ===== DASHBOARD & STATISTIQUES =====
  getDashboardStats = async (): Promise<any> => {
    try {
      const [articlesStats, consommablesStats, commandesStats, livraisonsStats, productionsStats] = await Promise.all([
        this.getArticlesStats(),
        this.getConsommablesStats(),
        this.getCommandesStats(),
        this.getLivraisonsStats(),
        this.getProductionsStats()
      ])

      return {
        articles: articlesStats,
        consommables: consommablesStats,
        commandes: commandesStats,
        livraisons: livraisonsStats,
        productions: productionsStats
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du dashboard:', error)
      return {}
    }
  }

  async getStockInfo(): Promise<any> {
    try {
      const [articlesStockCritique, consommablesStockCritique, consommablesPerimes] = await Promise.all([
        this.getArticlesStockCritique(),
        this.getConsommablesStockCritique(),
        this.getConsommablesPerimes()
      ])

      return {
        articlesStockCritique,
        consommablesStockCritique,
        consommablesPerimes,
        totalArticlesStockCritique: articlesStockCritique.length,
        totalConsommablesStockCritique: consommablesStockCritique.length,
        totalConsommablesPerimes: consommablesPerimes.length
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de stock:', error)
      return {
        articlesStockCritique: [],
        consommablesStockCritique: [],
        consommablesPerimes: [],
        totalArticlesStockCritique: 0,
        totalConsommablesStockCritique: 0,
        totalConsommablesPerimes: 0
      }
    }
  }

  getProductionsDuJour = async (): Promise<LaravelProduction[]> => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await this.get<{ data: LaravelProduction[] }>(`/productions?date=${today}`)
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des productions du jour:', error)
      return []
    }
  }

  // Méthodes manquantes pour compatibilité
  getAnalyses = async (): Promise<any[]> => {
    try {
      const response = await this.get<{ data: any[] }>('/analyses')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses:', error)
      return []
    }
  }

  addDocument = async (data: any): Promise<any> => {
    try {
      const response = await this.post<{ data: any }>('/documents', data)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error)
      throw error
    }
  }
}

// Instance singleton
const laravelApiService = new LaravelApiService()

// Composable pour Vue
export function useLaravelApi() {
  return laravelApiService
}

// Export de l'instance pour utilisation directe
export default laravelApiService

// Export des types
export type {
  LaravelUser,
  LaravelArticle,
  LaravelConsommable,
  LaravelCommande,
  LaravelLivraison,
  LaravelProduction,
  LaravelDocument
}
