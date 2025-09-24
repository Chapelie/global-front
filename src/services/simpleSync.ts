import { ref } from 'vue'
import { storageService } from './storage'

// État de la synchronisation simplifié
const syncState = ref({
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSync: null as Date | null,
  pendingChanges: 0,
  syncErrors: [] as string[]
})

// Queue des opérations en attente
const syncQueue = ref<Array<{
  id: string
  operation: 'create' | 'update' | 'delete'
  table: string
  data: any
  timestamp: Date
}>>([])

// Service de synchronisation simplifié
export const useSimpleSync = () => {
  // Détection de la connexion réseau
  const setupNetworkDetection = () => {
    window.addEventListener('online', () => {
      syncState.value.isOnline = true
      console.log('🌐 Connexion rétablie')
    })

    window.addEventListener('offline', () => {
      syncState.value.isOnline = false
      console.log('📡 Mode hors ligne')
    })
  }

  // Ajouter une opération à la queue
  const addToSyncQueue = (operation: 'create' | 'update' | 'delete', table: string, data: any) => {
    const syncItem = {
      id: `${table}_${Date.now()}_${Math.random()}`,
      operation,
      table,
      data,
      timestamp: new Date()
    }
    
    syncQueue.value.push(syncItem)
    syncState.value.pendingChanges = syncQueue.value.length
    
    console.log(`📝 Opération ajoutée à la queue: ${operation} ${table}`)
  }

  // Initialiser la synchronisation
  const initSync = () => {
    setupNetworkDetection()
    console.log('🔄 Service de synchronisation initialisé (mode hors ligne)')
  }

  return {
    // État
    isOnline: () => syncState.value.isOnline,
    isSyncing: () => syncState.value.isSyncing,
    lastSync: () => syncState.value.lastSync,
    pendingChanges: () => syncState.value.pendingChanges,
    syncErrors: () => syncState.value.syncErrors,

    // Actions
    initSync,
    addToSyncQueue
  }
}

// Wrapper pour storageService avec synchronisation
export const createSyncedStorageService = () => {
  const { addToSyncQueue } = useSimpleSync()

  return {
    // Articles
    addArticle: (article: any) => {
      const result = storageService.addArticle(article)
      addToSyncQueue('create', 'articles', result)
      return result
    },

    updateArticle: (id: number, updates: any) => {
      storageService.updateArticle(id, updates)
      addToSyncQueue('update', 'articles', { id, ...updates })
    },

    deleteArticle: (id: number) => {
      storageService.deleteArticle(id)
      addToSyncQueue('delete', 'articles', { id })
    },

    // Commandes
    addCommande: (commande: any) => {
      const result = storageService.addCommande(commande)
      addToSyncQueue('create', 'commandes', result)
      return result
    },

    updateCommande: (id: number, updates: any) => {
      storageService.updateCommande(id, updates)
      addToSyncQueue('update', 'commandes', { id, ...updates })
    },

    deleteCommande: (id: number) => {
      storageService.deleteCommande(id)
      addToSyncQueue('delete', 'commandes', { id })
    },

    // Livraisons
    addLivraison: (livraison: any) => {
      const result = storageService.addLivraison(livraison)
      addToSyncQueue('create', 'livraisons', result)
      return result
    },

    updateLivraison: (id: number, updates: any) => {
      storageService.updateLivraison(id, updates)
      addToSyncQueue('update', 'livraisons', { id, ...updates })
    },

    deleteLivraison: (id: number) => {
      storageService.deleteLivraison(id)
      addToSyncQueue('delete', 'livraisons', { id })
    },

    // Production
    addProduction: (production: any) => {
      const result = storageService.addProduction(production)
      addToSyncQueue('create', 'production', result)
      return result
    },

    updateProduction: (id: number, updates: any) => {
      storageService.updateProduction(id, updates)
      addToSyncQueue('update', 'production', { id, ...updates })
    },

    deleteProduction: (id: number) => {
      storageService.deleteProduction(id)
      addToSyncQueue('delete', 'production', { id })
    },

    // Personnel
    addPersonnel: (personnel: any) => {
      const result = storageService.addPersonnel(personnel)
      addToSyncQueue('create', 'personnel', result)
      return result
    },

    updatePersonnel: (id: number, updates: any) => {
      storageService.updatePersonnel(id, updates)
      addToSyncQueue('update', 'personnel', { id, ...updates })
    },

    deletePersonnel: (id: number) => {
      storageService.deletePersonnel(id)
      addToSyncQueue('delete', 'personnel', { id })
    },

    // Méthodes de lecture (pas de synchronisation)
    getArticles: () => storageService.getStock(),
    getCommandes: () => storageService.getCommandes(),
    getLivraisons: () => storageService.getLivraisons(),
    getProductions: () => storageService.getProductions(),
    getPersonnel: () => storageService.getEmployes()
  }
}

// Instance du service synchronisé
export const syncedStorageService = createSyncedStorageService()
