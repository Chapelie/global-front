/**
 * Service Laravel API avec Laravel Sanctum
 * Remplace completeHybridService.ts pour utiliser le backend Laravel
 */

import { ref, computed } from 'vue'

// Types Laravel
interface LaravelUser {
  id: number
  name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

interface LaravelArticle {
  id: number
  nom: string
  categorie: string
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
  categorie: string
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
  created_at: string
  updated_at: string
}

interface LaravelLivraison {
  id: number
  numero_bl: string
  date: string
  client: string
  telephone: string
  chauffeur: string
  statut: string
  adresse: string
  code_suivi?: string
  preuve_depot?: string
  preuve_reception?: string
  signature_client?: string
  observations?: string
  heure_livraison?: string
  date_livraison?: string
  total_commande: number
  total_livraison: number
  difference_totale: number
  reste_a_payer_total: number
  user_id: number
  created_at: string
  updated_at: string
}

interface LaravelProduction {
  id: number
  date: string
  statut: string
  lot_id?: string
  heure_debut?: string
  heure_fin?: string
  user_id: number
  created_at: string
  updated_at: string
}

class LaravelApiService {
  private baseURL = 'http://localhost:8000/api'
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
  async getArticles(): Promise<LaravelArticle[]> {
    try {
      const response = await this.get<{ data: LaravelArticle[] }>('/articles')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des articles:', error)
      return []
    }
  }

  async getArticle(id: number): Promise<LaravelArticle | null> {
    try {
      const response = await this.get<{ data: LaravelArticle }>(`/articles/${id}`)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'article ${id}:`, error)
      return null
    }
  }

  async addArticle(articleData: Partial<LaravelArticle>): Promise<LaravelArticle | null> {
    try {
      const response = await this.post<{ data: LaravelArticle }>('/articles', articleData)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'article:', error)
      throw error
    }
  }

  async updateArticle(id: number, articleData: Partial<LaravelArticle>): Promise<LaravelArticle | null> {
    try {
      const response = await this.put<{ data: LaravelArticle }>(`/articles/${id}`, articleData)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'article ${id}:`, error)
      throw error
    }
  }

  async deleteArticle(id: number): Promise<boolean> {
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
  async getCommandes(): Promise<LaravelCommande[]> {
    try {
      const response = await this.get<{ data: LaravelCommande[] }>('/commandes')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return []
    }
  }

  async getCommande(id: number): Promise<LaravelCommande | null> {
    try {
      const response = await this.get<{ data: LaravelCommande }>(`/commandes/${id}`)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la récupération de la commande ${id}:`, error)
      return null
    }
  }

  async addCommande(commandeData: Partial<LaravelCommande>): Promise<LaravelCommande | null> {
    try {
      const response = await this.post<{ data: LaravelCommande }>('/commandes', commandeData)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error)
      throw error
    }
  }

  async updateCommande(id: number, commandeData: Partial<LaravelCommande>): Promise<LaravelCommande | null> {
    try {
      const response = await this.put<{ data: LaravelCommande }>(`/commandes/${id}`, commandeData)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la commande ${id}:`, error)
      throw error
    }
  }

  async deleteCommande(id: number): Promise<boolean> {
    try {
      await this.delete(`/commandes/${id}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression de la commande ${id}:`, error)
      return false
    }
  }

  async getCommandesStats(): Promise<any> {
    try {
      return await this.get('/commandes/stats')
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des commandes:', error)
      return {}
    }
  }

  // ===== LIVRAISONS =====
  async getLivraisons(): Promise<LaravelLivraison[]> {
    try {
      const response = await this.get<{ data: LaravelLivraison[] }>('/livraisons')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des livraisons:', error)
      return []
    }
  }

  async getLivraison(id: number): Promise<LaravelLivraison | null> {
    try {
      const response = await this.get<{ data: LaravelLivraison }>(`/livraisons/${id}`)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la récupération de la livraison ${id}:`, error)
      return null
    }
  }

  async addLivraison(livraisonData: Partial<LaravelLivraison>): Promise<LaravelLivraison | null> {
    try {
      const response = await this.post<{ data: LaravelLivraison }>('/livraisons', livraisonData)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la livraison:', error)
      throw error
    }
  }

  async updateLivraison(id: number, livraisonData: Partial<LaravelLivraison>): Promise<LaravelLivraison | null> {
    try {
      const response = await this.put<{ data: LaravelLivraison }>(`/livraisons/${id}`, livraisonData)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la livraison ${id}:`, error)
      throw error
    }
  }

  async deleteLivraison(id: number): Promise<boolean> {
    try {
      await this.delete(`/livraisons/${id}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression de la livraison ${id}:`, error)
      return false
    }
  }

  async getLivraisonsStats(): Promise<any> {
    try {
      return await this.get('/livraisons/stats')
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des livraisons:', error)
      return {}
    }
  }

  // ===== PRODUCTIONS =====
  async getProductions(): Promise<LaravelProduction[]> {
    try {
      const response = await this.get<{ data: LaravelProduction[] }>('/productions')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des productions:', error)
      return []
    }
  }

  async getProduction(id: number): Promise<LaravelProduction | null> {
    try {
      const response = await this.get<{ data: LaravelProduction }>(`/productions/${id}`)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la récupération de la production ${id}:`, error)
      return null
    }
  }

  async addProduction(productionData: Partial<LaravelProduction>): Promise<LaravelProduction | null> {
    try {
      const response = await this.post<{ data: LaravelProduction }>('/productions', productionData)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la production:', error)
      throw error
    }
  }

  async updateProduction(id: number, productionData: Partial<LaravelProduction>): Promise<LaravelProduction | null> {
    try {
      const response = await this.put<{ data: LaravelProduction }>(`/productions/${id}`, productionData)
      return response.data || null
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la production ${id}:`, error)
      throw error
    }
  }

  async deleteProduction(id: number): Promise<boolean> {
    try {
      await this.delete(`/productions/${id}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression de la production ${id}:`, error)
      return false
    }
  }

  async getProductionsStats(): Promise<any> {
    try {
      return await this.get('/productions/stats')
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des productions:', error)
      return {}
    }
  }

  // ===== DASHBOARD & STATISTIQUES =====
  async getDashboardStats(): Promise<any> {
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

  async getProductionsDuJour(): Promise<LaravelProduction[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await this.get<{ data: LaravelProduction[] }>(`/productions?date=${today}`)
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des productions du jour:', error)
      return []
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
  LaravelProduction
}
