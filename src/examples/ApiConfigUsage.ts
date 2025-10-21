/**
 * Exemples d'utilisation de la classe ApiConfig centralisée
 * Ce fichier montre comment utiliser la nouvelle architecture API
 */

import { useApiConfig, type ApiError } from '../config/ApiConfig'

// Exemple 1: Utilisation basique dans un composable Vue
export function useExampleApi() {
  const api = useApiConfig()

  // Récupérer des articles
  const getArticles = async () => {
    try {
      const response = await api.get(api.endpoints.articles.index)
      return response.data
    } catch (error) {
      console.error('Erreur:', api.handleError(error as ApiError))
      return []
    }
  }

  // Créer un article
  const createArticle = async (articleData: any) => {
    try {
      const response = await api.post(api.endpoints.articles.store, articleData)
      return response.data
    } catch (error) {
      throw new Error(api.handleError(error as ApiError))
    }
  }

  // Authentification
  const login = async (credentials: { email?: string; phone?: string; password: string }) => {
    try {
      const response = await api.post(api.endpoints.auth.login, credentials)

      // Le token est automatiquement sauvegardé par ApiConfig
      api.setToken(response.data.token)

      return response.data.user
    } catch (error) {
      throw new Error(api.handleError(error as ApiError))
    }
  }

  return {
    getArticles,
    createArticle,
    login
  }
}

// Exemple 2: Utilisation directe de l'instance singleton
export class ExampleService {
  private api = useApiConfig()

  async getUser(id: number) {
    const response = await this.api.get(this.api.endpoints.users.show(id))
    return response.data
  }

  async updateUser(id: number, userData: any) {
    const response = await this.api.put(this.api.endpoints.users.update(id), userData)
    return response.data
  }

  async uploadFile(file: File) {
    const response = await this.api.upload('/upload', file, {
      type: 'document',
      category: 'user-files'
    })
    return response.data
  }
}

// Exemple 3: Configuration personnalisée
export function configureApi() {
  const api = useApiConfig()

  // Changer l'URL de base si nécessaire
  if (window.location.hostname === 'localhost') {
    api.setBaseURL('http://localhost:8000/api')
  } else {
    api.setBaseURL('https://production-api.example.com/api')
  }

  // Définir un header personnalisé
  api.setDefaultHeader('X-App-Version', '1.0.0')

  // Configurer le timeout
  api.setTimeout(45000) // 45 secondes

  return api
}

// Exemple 4: Gestion des erreurs centralisée
export function handleApiError(error: any) {
  const api = useApiConfig()

  const message = api.handleError(error)

  // Afficher l'erreur à l'utilisateur
  console.error('Erreur API:', message)

  // Rediriger vers la page de login si non authentifié
  if (error.status === 401) {
    window.location.href = '/login'
  }

  return message
}

// Exemple 5: Utilisation avec des params de requête
export async function searchArticles(searchTerm: string, filters: any = {}) {
  const api = useApiConfig()

  const params = {
    search: searchTerm,
    ...filters
  }

  const response = await api.get(api.endpoints.articles.index, params)
  return response.data
}

// Exemple 6: Requête avec headers personnalisés
export async function exportData(format: 'json' | 'csv' | 'excel') {
  const api = useApiConfig()

  const response = await api.request('/export/data', {
    method: 'GET',
    headers: {
      'Accept': `application/${format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'}`
    }
  })

  return response.data
}