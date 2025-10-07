// Service pour gérer le localStorage (fallback uniquement)
// Plus de synchronisation nécessaire avec 100% Supabase

export interface User {
  id: number
  username: string
  email: string
  role: 'super_admin' | 'admin' | 'secretaire' | 'livreur'
  password: string
  isLoggedIn: boolean
}

// Service de stockage local simplifié
class StorageService {
  // Méthodes de base pour localStorage
  private getItem<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : []
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error)
      return []
    }
  }

  private setItem<T>(key: string, value: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Erreur lors de l'écriture de ${key}:`, error)
    }
  }

  // Méthodes vides - plus utilisées avec 100% Supabase
  getArticles() { return [] }
  addArticle() { return {} }
  updateArticle() { return {} }
  deleteArticle() { return {} }
  
  getCommandes() { return [] }
  addCommande() { return {} }
  updateCommande() { return {} }
  deleteCommande() { return {} }
  
  getLivraisons() { return [] }
  addLivraison() { return {} }
  updateLivraison() { return {} }
  deleteLivraison() { return {} }
  
  getProductions() { return [] }
  getProductionToday() { return [] }
  addProduction() { return {} }
  updateProduction() { return {} }
  deleteProduction() { return {} }
  
  getStock() { return [] }
  
  getPersonnel() { return [] }
  addPersonnel() { return {} }
  updatePersonnel() { return {} }
  deletePersonnel() { return {} }
  
  getDocuments() { return [] }
  addDocument() { return {} }
  updateDocument() { return {} }
  deleteDocument() { return {} }
  
  getAnalyses() { return [] }
  addAnalyse() { return {} }
  updateAnalyse() { return {} }
  deleteAnalyse() { return {} }
  
  getTransferts() { return [] }
  addTransfert() { return {} }
  updateTransfert() { return {} }
  deleteTransfert() { return {} }
  
  getStats() { return {} }
}

// Instance singleton
export const storageService = new StorageService()