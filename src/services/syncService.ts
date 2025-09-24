import { ref, computed } from 'vue'
import { storageService } from './storage'
import { supabaseService } from './supabaseService'
import { supabase } from '../lib/supabase'

// État de la synchronisation
const syncState = ref({
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSync: null as Date | null,
  pendingChanges: 0,
  syncErrors: [] as string[]
})

// Queue des opérations en attente de synchronisation
const syncQueue = ref<Array<{
  id: string
  operation: 'create' | 'update' | 'delete'
  table: string
  data: any
  timestamp: Date
}>>([])

// Composable pour la synchronisation
export const useSync = () => {
  // Vérifier l'authentification directement avec Supabase
  const isAuthenticated = computed(() => {
    try {
      return supabase && supabase.auth.getSession()
    } catch {
      return false
    }
  })

  // État de la synchronisation
  const isOnline = computed(() => syncState.value.isOnline)
  const isSyncing = computed(() => syncState.value.isSyncing)
  const lastSync = computed(() => syncState.value.lastSync)
  const pendingChanges = computed(() => syncState.value.pendingChanges)
  const syncErrors = computed(() => syncState.value.syncErrors)

  // Détection de la connexion réseau
  const setupNetworkDetection = () => {
    window.addEventListener('online', () => {
      syncState.value.isOnline = true
      console.log('🌐 Connexion rétablie - Synchronisation en cours...')
      syncAll()
    })

    window.addEventListener('offline', () => {
      syncState.value.isOnline = false
      console.log('📡 Connexion perdue - Mode hors ligne activé')
    })
  }

  // Ajouter une opération à la queue de synchronisation
  const addToSyncQueue = async (operation: 'create' | 'update' | 'delete', table: string, data: any) => {
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
    
    // Tenter une synchronisation immédiate si en ligne
    if (isOnline.value && isAuthenticated.value) {
      await syncItemFunction(syncItem)
    }
  }

  // Synchroniser un élément spécifique
  const syncItemFunction = async (item: typeof syncQueue.value[0]) => {
    try {
      syncState.value.isSyncing = true

      switch (item.table) {
        case 'articles':
          await syncArticle(item)
          break
        case 'commandes':
          await syncCommande(item)
          break
        case 'livraisons':
          await syncLivraison(item)
          break
        case 'production':
          await syncProduction(item)
          break
        case 'personnel':
          await syncPersonnel(item)
          break
        default:
          console.warn(`Table non supportée: ${item.table}`)
      }

      // Retirer de la queue
      const index = syncQueue.value.findIndex(q => q.id === item.id)
      if (index > -1) {
        syncQueue.value.splice(index, 1)
        syncState.value.pendingChanges = syncQueue.value.length
      }

    } catch (error) {
      console.error(`❌ Erreur de synchronisation pour ${item.table}:`, error)
      syncState.value.syncErrors.push(`${item.table}: ${error}`)
    } finally {
      syncState.value.isSyncing = false
    }
  }

  // Synchronisation des articles
  const syncArticle = async (item: any) => {
    switch (item.operation) {
      case 'create':
        await supabaseService.addArticle(item.data)
        break
      case 'update':
        await supabaseService.updateArticle(item.data.id, item.data)
        break
      case 'delete':
        await supabaseService.deleteArticle(item.data.id)
        break
    }
  }

  // Synchronisation des commandes
  const syncCommande = async (item: any) => {
    switch (item.operation) {
      case 'create':
        await supabaseService.addCommande(item.data)
        break
      case 'update':
        await supabaseService.updateCommande(item.data.id, item.data)
        break
      case 'delete':
        await supabaseService.deleteCommande(item.data.id)
        break
    }
  }

  // Synchronisation des livraisons
  const syncLivraison = async (item: any) => {
    switch (item.operation) {
      case 'create':
        await supabaseService.addLivraison(item.data)
        break
      case 'update':
        await supabaseService.updateLivraison(item.data.id, item.data)
        break
      case 'delete':
        await supabaseService.deleteLivraison(item.data.id)
        break
    }
  }

  // Synchronisation de la production
  const syncProduction = async (item: any) => {
    switch (item.operation) {
      case 'create':
        await supabaseService.addProduction(item.data)
        break
      case 'update':
        await supabaseService.updateProduction(item.data.id, item.data)
        break
      case 'delete':
        await supabaseService.deleteProduction(item.data.id)
        break
    }
  }

  // Synchronisation du personnel
  const syncPersonnel = async (item: any) => {
    switch (item.operation) {
      case 'create':
        await supabaseService.addPersonnel(item.data)
        break
      case 'update':
        await supabaseService.updatePersonnel(item.data.id, item.data)
        break
      case 'delete':
        await supabaseService.deletePersonnel(item.data.id)
        break
    }
  }

  // Synchronisation complète
  const syncAll = async () => {
    if (!isOnline.value) {
      console.log('⏸️ Synchronisation impossible (hors ligne)')
      return
    }

    if (!supabase) {
      console.log('⏸️ Synchronisation impossible (Supabase non configuré)')
      return
    }

    console.log('🔄 Début de la synchronisation complète...')
    syncState.value.isSyncing = true

    try {
      // Synchroniser tous les éléments en queue
      const itemsToSync = [...syncQueue.value]
      for (const item of itemsToSync) {
        await syncItemFunction(item)
      }

      syncState.value.lastSync = new Date()
      syncState.value.syncErrors = []
      console.log('✅ Synchronisation terminée avec succès')

    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error)
      syncState.value.syncErrors.push(`Synchronisation: ${error}`)
    } finally {
      syncState.value.isSyncing = false
    }
  }

  // Synchronisation périodique
  const startPeriodicSync = () => {
    // Synchroniser toutes les 30 secondes si en ligne
    setInterval(() => {
      if (isOnline.value && syncQueue.value.length > 0) {
        syncAll()
      }
    }, 30000)
  }

  // Initialiser la synchronisation
  const initSync = () => {
    setupNetworkDetection()
    startPeriodicSync()
    console.log('🔄 Service de synchronisation initialisé')
  }

  return {
    // État
    isOnline,
    isSyncing,
    lastSync,
    pendingChanges,
    syncErrors,

    // Actions
    initSync,
    syncAll,
    addToSyncQueue
  }
}

// Wrapper pour storageService avec synchronisation automatique
export const createSyncedStorageService = () => {
  const { addToSyncQueue } = useSync()

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
