// Service de synchronisation avancé avec Supabase
import { supabase } from '../lib/supabase'
import { storageService } from './storage'

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSync: Date | null
  pendingChanges: number
  syncErrors: string[]
  syncProgress: number
}

export interface SyncQueueItem {
  id: string
  operation: 'insert' | 'update' | 'delete'
  table: string
  data: any
  timestamp: Date
  retryCount: number
}

class SupabaseSyncService {
  private syncQueue: SyncQueueItem[] = []
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,
    syncErrors: [],
    syncProgress: 0
  }
  private syncInterval: NodeJS.Timeout | null = null
  private maxRetries = 3

  constructor() {
    this.setupNetworkDetection()
    this.loadSyncQueue()
  }

  // Getters pour l'état de synchronisation
  getStatus(): SyncStatus {
    return { ...this.syncStatus }
  }

  getQueue(): SyncQueueItem[] {
    return [...this.syncQueue]
  }

  // Détection de la connexion réseau
  private setupNetworkDetection() {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true
      this.startSync()
    })

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false
      this.stopSync()
    })
  }

  // Charger la queue depuis localStorage
  private loadSyncQueue() {
    try {
      const saved = localStorage.getItem('sync_queue')
      if (saved) {
        this.syncQueue = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        this.syncStatus.pendingChanges = this.syncQueue.length
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la queue:', error)
    }
  }

  // Sauvegarder la queue dans localStorage
  private saveSyncQueue() {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue))
      this.syncStatus.pendingChanges = this.syncQueue.length
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la queue:', error)
    }
  }

  // Ajouter un élément à la queue de synchronisation
  addToQueue(operation: 'insert' | 'update' | 'delete', table: string, data: any) {
    const item: SyncQueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operation,
      table,
      data,
      timestamp: new Date(),
      retryCount: 0
    }

    this.syncQueue.push(item)
    this.saveSyncQueue()

    // Démarrer la synchronisation si en ligne
    if (this.syncStatus.isOnline && !this.syncStatus.isSyncing) {
      this.startSync()
    }
  }

  // Démarrer la synchronisation
  async startSync() {
    if (!this.syncStatus.isOnline || this.syncStatus.isSyncing || this.syncQueue.length === 0) {
      return
    }

    this.syncStatus.isSyncing = true
    this.syncStatus.syncProgress = 0
    this.syncStatus.syncErrors = []

    try {
      const itemsToSync = [...this.syncQueue]
      const totalItems = itemsToSync.length

      for (let i = 0; i < itemsToSync.length; i++) {
        const item = itemsToSync[i]
        this.syncStatus.syncProgress = Math.round((i / totalItems) * 100)

        try {
          await this.syncItem(item)
          this.removeFromQueue(item.id)
        } catch (error) {
          console.error(`Erreur de synchronisation pour ${item.table}:`, error)
          item.retryCount++
          
          if (item.retryCount >= this.maxRetries) {
            this.syncStatus.syncErrors.push(`${item.table}: ${error}`)
            this.removeFromQueue(item.id)
          }
        }
      }

      this.syncStatus.lastSync = new Date()
      this.syncStatus.syncProgress = 100

    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error)
      this.syncStatus.syncErrors.push(`Synchronisation générale: ${error}`)
    } finally {
      this.syncStatus.isSyncing = false
      this.saveSyncQueue()
    }
  }

  // Synchroniser un élément spécifique
  private async syncItem(item: SyncQueueItem) {
    if (!supabase) {
      throw new Error('Supabase non configuré')
    }

    const { table, operation, data } = item

    switch (operation) {
      case 'insert':
        const { error: insertError } = await supabase
          .from(table)
          .insert(data)
        if (insertError) throw insertError
        break

      case 'update':
        const { error: updateError } = await supabase
          .from(table)
          .update(data)
          .eq('id', data.id)
        if (updateError) throw updateError
        break

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id)
        if (deleteError) throw deleteError
        break
    }
  }

  // Supprimer un élément de la queue
  private removeFromQueue(itemId: string) {
    this.syncQueue = this.syncQueue.filter(item => item.id !== itemId)
    this.saveSyncQueue()
  }

  // Arrêter la synchronisation
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    this.syncStatus.isSyncing = false
  }

  // Synchronisation complète (pull depuis Supabase)
  async pullFromSupabase() {
    if (!supabase || !this.syncStatus.isOnline) {
      return
    }

    try {
      this.syncStatus.isSyncing = true

      // Synchroniser les articles
      await this.pullTable('articles', 'stock')
      
      // Synchroniser les productions
      await this.pullTable('productions', 'production')
      
      // Synchroniser les commandes
      await this.pullTable('commandes', 'commandes')
      
      // Synchroniser les livraisons
      await this.pullTable('livraisons', 'livraisons')
      
      // Synchroniser les transferts
      await this.pullTable('transferts', 'transferts')

      this.syncStatus.lastSync = new Date()
      console.log('✅ Synchronisation complète terminée')

    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error)
      this.syncStatus.syncErrors.push(`Pull: ${error}`)
    } finally {
      this.syncStatus.isSyncing = false
    }
  }

  // Synchroniser une table spécifique
  private async pullTable(tableName: string, storageKey: string) {
    if (!supabase) return

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Erreur lors de la récupération de ${tableName}: ${error.message}`)
    }

    if (data) {
      // Mettre à jour le localStorage avec les données de Supabase
      localStorage.setItem(`briqueapp_${storageKey}`, JSON.stringify(data))
      console.log(`✅ ${tableName} synchronisé: ${data.length} éléments`)
    }
  }

  // Synchronisation bidirectionnelle
  async syncBidirectional() {
    if (!this.syncStatus.isOnline) {
      console.log('⏸️ Synchronisation impossible (hors ligne)')
      return
    }

    try {
      // 1. Pousser les changements locaux vers Supabase
      await this.startSync()
      
      // 2. Récupérer les changements depuis Supabase
      await this.pullFromSupabase()
      
      console.log('✅ Synchronisation bidirectionnelle terminée')
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation bidirectionnelle:', error)
    }
  }

  // Démarrer la synchronisation automatique
  startAutoSync(intervalMs: number = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(() => {
      if (this.syncStatus.isOnline && this.syncQueue.length > 0) {
        this.syncBidirectional()
      }
    }, intervalMs)
  }

  // Arrêter la synchronisation automatique
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Vider la queue de synchronisation
  clearQueue() {
    this.syncQueue = []
    this.saveSyncQueue()
    console.log('🗑️ Queue de synchronisation vidée')
  }

  // Obtenir les statistiques de synchronisation
  getSyncStats() {
    return {
      queueLength: this.syncQueue.length,
      lastSync: this.syncStatus.lastSync,
      isOnline: this.syncStatus.isOnline,
      isSyncing: this.syncStatus.isSyncing,
      errors: this.syncStatus.syncErrors.length
    }
  }
}

// Instance singleton
export const supabaseSyncService = new SupabaseSyncService()

// Composable Vue pour utiliser le service
export const useSupabaseSync = () => {
  return {
    status: supabaseSyncService.getStatus(),
    queue: supabaseSyncService.getQueue(),
    startSync: () => supabaseSyncService.startSync(),
    pullFromSupabase: () => supabaseSyncService.pullFromSupabase(),
    syncBidirectional: () => supabaseSyncService.syncBidirectional(),
    startAutoSync: (interval?: number) => supabaseSyncService.startAutoSync(interval),
    stopAutoSync: () => supabaseSyncService.stopAutoSync(),
    clearQueue: () => supabaseSyncService.clearQueue(),
    getStats: () => supabaseSyncService.getSyncStats()
  }
}
