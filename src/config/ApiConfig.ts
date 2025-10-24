/**
 * Classe de configuration centralisée pour toutes les connexions API
 * Gère la configuration, l'authentification et les requêtes HTTP
 */

export interface ApiEndpoint {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  requiresAuth?: boolean
  timeout?: number
}

export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

export class ApiConfig {
  private static instance: ApiConfig | null = null
  private baseURL: string
  private token: string | null = null
  private defaultTimeout: number = 30000
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }

  constructor() {
    this.baseURL = import.meta.env.VITE_LARAVEL_API_BASE_URL || 'http://localhost:8000/api'
    this.loadTokenFromStorage()
  }

  /**
   * Singleton pattern - une seule instance de configuration
   */
  public static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig()
    }
    return ApiConfig.instance
  }

  /**
   * Configuration de base
   */
  public getBaseURL(): string {
    return this.baseURL
  }

  public setBaseURL(url: string): void {
    this.baseURL = url
  }

  public getTimeout(): number {
    return this.defaultTimeout
  }

  public setTimeout(timeout: number): void {
    this.defaultTimeout = timeout
  }

  /**
   * Gestion des tokens d'authentification
   */
  public setToken(token: string | null): void {
    this.token = token
    if (token) {
      localStorage.setItem('api_token', token)
    } else {
      localStorage.removeItem('api_token')
    }
  }

  public getToken(): string | null {
    return this.token
  }

  public isAuthenticated(): boolean {
    return !!this.token
  }

  private loadTokenFromStorage(): void {
    this.token = localStorage.getItem('api_token')
  }

  /**
   * Construction des headers
   */
  public getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  public setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value
  }

  /**
   * Construction des URLs complètes
   */
  public buildURL(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${this.baseURL}${cleanEndpoint}`
  }

  /**
   * Méthodes HTTP de base
   */
  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint)

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw {
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          errors: data.errors
        } as ApiError
      }

      return {
        data: data.data || data,
        success: true,
        message: data.message
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error as ApiError
      }

      throw {
        message: 'Erreur de connexion réseau',
        status: 0
      } as ApiError
    }
  }

  public async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    return this.request<T>(url, { method: 'GET' })
  }

  public async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  public async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  public async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  public async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * Upload de fichiers
   */
  public async upload<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Laisser le navigateur définir le Content-Type pour FormData
        ...this.getHeaders(),
        'Content-Type': undefined as any
      }
    })
  }

  /**
   * Endpoints prédéfinis pour l'application
   */
  public readonly endpoints = {
    // Authentification
    auth: {
      login: '/login',
      register: '/register',
      logout: '/logout',
      me: '/user',
      forgotPassword: '/forgot-password',
      resetPassword: '/reset-password',
      updatePassword: '/update-password',
      updateProfile: '/profile'
    },

    // Articles
    articles: {
      index: '/articles',
      store: '/articles',
      show: (id: number) => `/articles/${id}`,
      update: (id: number) => `/articles/${id}`,
      destroy: (id: number) => `/articles/${id}`,
      updateStock: (id: number) => `/articles/${id}/stock`,
      stats: '/articles/stats',
      stockCritique: '/articles/stock-critique',
      actifs: '/articles/actifs'
    },

    // Consommables
    consommables: {
      index: '/consommables',
      store: '/consommables',
      show: (id: number) => `/consommables/${id}`,
      update: (id: number) => `/consommables/${id}`,
      destroy: (id: number) => `/consommables/${id}`,
      updateStock: (id: number) => `/consommables/${id}/stock`,
      stats: '/consommables/stats',
      stockCritique: '/consommables/stock-critique',
      perimes: '/consommables/perimes',
      vaPerimer: '/consommables/va-perimer'
    },

    // Commandes
    commandes: {
      index: '/orders',
      store: '/orders',
      show: (id: number) => `/orders/${id}`,
      update: (id: number) => `/orders/${id}`,
      destroy: (id: number) => `/orders/${id}`,
      stats: '/orders/stats',
      marquerPret: (id: number) => `/storage/commandes/${id}/marquer-pret`
    },

    // Livraisons
    livraisons: {
      index: '/storage/livraisons',
      store: '/storage/livraisons/add',
      show: (id: number) => `/deliveries/${id}`,
      update: (id: number) => `/storage/livraisons/${id}`,
      destroy: (id: number) => `/storage/livraisons/${id}`,
      stats: '/deliveries/stats',
      updateQuantites: (id: number) => `/storage/livraisons/${id}/quantites-livrees`,
      finaliserAvecSignature: (id: number) => `/storage/livraisons/${id}/finaliser-avec-signature`,
      commencer: (id: number) => `/storage/livraisons/${id}/commencer`
    },

    // Productions
    productions: {
      index: '/production/batches',
      store: '/production/batches',
      show: (id: number) => `/production/batches/${id}`,
      update: (id: number) => `/production/batches/${id}`,
      destroy: (id: number) => `/production/batches/${id}`,
      stats: '/production/batches/stats'
    },

    // Utilisateurs
    users: {
      index: '/users',
      store: '/users',
      show: (id: number) => `/users/${id}`,
      update: (id: number) => `/users/${id}`,
      destroy: (id: number) => `/users/${id}`,
      updateRole: (id: number) => `/users/${id}/role`,
      authUsers: '/auth/users'
    },

    // Documents
    documents: {
      index: '/documents',
      store: '/documents',
      show: (id: number) => `/documents/${id}`,
      destroy: (id: number) => `/documents/${id}`,
      download: (id: number) => `/documents/${id}/download`,
      archive: (id: number) => `/documents/${id}/archive`,
      types: '/documents/types',
      deliveryNote: '/documents/delivery-note',
      invoice: '/documents/invoice'
    }
  }

  /**
   * Méthodes utilitaires
   */
  public handleError(error: ApiError): string {
    switch (error.status) {
      case 401:
        // Ne pas déconnecter automatiquement
        return 'Session expirée. Veuillez vous reconnecter.'
      case 403:
        return 'Accès interdit. Permissions insuffisantes.'
      case 404:
        return 'Ressource non trouvée.'
      case 422:
        return 'Erreur de validation des données.'
      case 500:
        return 'Erreur interne du serveur.'
      default:
        return error.message || 'Une erreur est survenue.'
    }
  }

  public debug(message: string, data?: any): void {
    if (import.meta.env.DEV) {
      console.log(`[ApiConfig] ${message}`, data)
    }
  }

  public debugError(message: string, error?: any): void {
    console.error(`[ApiConfig] ${message}`, error)
  }

  /**
   * Reset de la configuration (utile pour les tests)
   */
  public reset(): void {
    this.token = null
    localStorage.removeItem('api_token')
    ApiConfig.instance = null
  }
}

// Export de l'instance singleton
export const apiConfig = ApiConfig.getInstance()

// Export du composable pour Vue
export function useApiConfig() {
  return ApiConfig.getInstance()
}

// Export par défaut
export default ApiConfig