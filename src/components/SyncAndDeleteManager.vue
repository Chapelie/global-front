<template>
  <div class="sync-delete-manager">
    <div class="header">
      <h2 class="title">
        <ArrowsRightLeftIcon class="w-6 h-6" />
        Gestionnaire de Synchronisation
      </h2>
      <p class="subtitle">
        Synchronisez vos données locales vers Supabase et supprimez-les automatiquement
      </p>
    </div>

    <!-- Statut de synchronisation -->
    <div class="status-section">
      <div class="status-card">
        <div class="status-header">
          <WifiIcon v-if="isOnline" class="w-5 h-5 text-green-500" />
          <WifiSlashIcon v-else class="w-5 h-5 text-red-500" />
          <span class="status-text">
            {{ isOnline ? 'En ligne' : 'Hors ligne' }}
          </span>
        </div>
        <div class="status-details">
          <div class="stat-item">
            <span class="stat-label">Éléments locaux:</span>
            <span class="stat-value">{{ syncStats.totalLocalItems }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Synchronisés:</span>
            <span class="stat-value">{{ syncStats.syncedItems }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">En queue:</span>
            <span class="stat-value">{{ syncStats.queueSize }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions principales -->
    <div class="actions-section">
      <div class="action-buttons">
        <button
          @click="startSyncAndDelete"
          :disabled="!isOnline || isSyncing"
          class="btn btn-primary"
        >
          <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': isSyncing }" />
          {{ isSyncing ? 'Synchronisation...' : 'Synchroniser et Supprimer' }}
        </button>

        <button
          @click="pullFromSupabase"
          :disabled="!isOnline || isSyncing"
          class="btn btn-secondary"
        >
          <ArrowDownTrayIcon class="w-5 h-5" />
          Récupérer depuis Supabase
        </button>

        <button
          @click="clearSyncedItems"
          class="btn btn-danger"
        >
          <TrashIcon class="w-5 h-5" />
          Vider les éléments synchronisés
        </button>
      </div>
    </div>

    <!-- Progression de synchronisation -->
    <div v-if="isSyncing" class="progress-section">
      <div class="progress-header">
        <h3 class="progress-title">Synchronisation en cours...</h3>
        <span class="progress-percentage">{{ syncProgress }}%</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${syncProgress}%` }"
        ></div>
      </div>
      <div class="progress-details">
        <p class="progress-text">
          {{ syncedCount }} éléments synchronisés sur {{ totalItems }}
        </p>
      </div>
    </div>

    <!-- Résultats de synchronisation -->
    <div v-if="lastSyncResult" class="results-section">
      <div class="results-header">
        <h3 class="results-title">
          <CheckCircleIcon v-if="lastSyncResult.success" class="w-5 h-5 text-green-500" />
          <XCircleIcon v-else class="w-5 h-5 text-red-500" />
          Dernière synchronisation
        </h3>
        <span class="results-time">
          {{ formatTime(lastSyncResult.timestamp) }}
        </span>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <span class="result-label">Synchronisés:</span>
          <span class="result-value text-green-600">{{ lastSyncResult.syncedItems }}</span>
        </div>
        <div class="result-stat">
          <span class="result-label">Supprimés:</span>
          <span class="result-value text-blue-600">{{ lastSyncResult.deletedItems }}</span>
        </div>
        <div class="result-stat">
          <span class="result-label">Erreurs:</span>
          <span class="result-value text-red-600">{{ lastSyncResult.errors.length }}</span>
        </div>
      </div>

      <!-- Erreurs détaillées -->
      <div v-if="lastSyncResult.errors.length > 0" class="errors-section">
        <h4 class="errors-title">Erreurs rencontrées:</h4>
        <div class="errors-list">
          <div 
            v-for="(error, index) in lastSyncResult.errors" 
            :key="index"
            class="error-item"
          >
            <ExclamationTriangleIcon class="w-4 h-4 text-red-500" />
            <span class="error-text">{{ error }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Éléments synchronisés -->
    <div v-if="syncedItems.length > 0" class="synced-items-section">
      <div class="synced-header">
        <h3 class="synced-title">
          <CheckCircleIcon class="w-5 h-5 text-green-500" />
          Éléments synchronisés ({{ syncedItems.length }})
        </h3>
        <button @click="showSyncedItems = !showSyncedItems" class="toggle-btn">
          {{ showSyncedItems ? 'Masquer' : 'Afficher' }}
        </button>
      </div>

      <div v-if="showSyncedItems" class="synced-list">
        <div 
          v-for="item in syncedItems" 
          :key="item"
          class="synced-item"
        >
          <CheckCircleIcon class="w-4 h-4 text-green-500" />
          <span class="item-text">{{ item }}</span>
          <button 
            @click="removeSyncedItem(item)"
            class="remove-btn"
            title="Supprimer de la liste"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Configuration -->
    <div class="config-section">
      <h3 class="config-title">Configuration</h3>
      <div class="config-options">
        <label class="config-option">
          <input 
            v-model="autoDeleteEnabled" 
            type="checkbox"
            @change="toggleAutoDelete"
          />
          <span class="option-text">Suppression automatique après synchronisation</span>
        </label>
        
        <label class="config-option">
          <input 
            v-model="confirmBeforeDelete" 
            type="checkbox"
          />
          <span class="option-text">Demander confirmation avant suppression</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSyncManager } from '../services/syncManager'
import {
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  WifiIcon,
  WifiSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const {
  syncAndDelete,
  getSyncStats,
  clearSyncedItems,
  getSyncedItems,
  isSynced,
  markAsSynced
} = useSyncManager()

// État local
const isOnline = ref(navigator.onLine)
const isSyncing = ref(false)
const syncProgress = ref(0)
const syncedCount = ref(0)
const totalItems = ref(0)
const lastSyncResult = ref<any>(null)
const showSyncedItems = ref(false)
const autoDeleteEnabled = ref(false)
const confirmBeforeDelete = ref(true)

// Computed
const syncStats = computed(() => getSyncStats())
const syncedItems = computed(() => getSyncedItems())

// Méthodes
const startSyncAndDelete = async () => {
  if (!isOnline.value) {
    alert('Vous devez être en ligne pour synchroniser')
    return
  }

  if (confirmBeforeDelete.value) {
    const confirmed = confirm(
      'Êtes-vous sûr de vouloir synchroniser et supprimer les données locales ?\n\n' +
      'Cette action est irréversible et supprimera définitivement les données locales après synchronisation.'
    )
    if (!confirmed) return
  }

  isSyncing.value = true
  syncProgress.value = 0
  syncedCount.value = 0

  try {
    // Calculer le nombre total d'éléments
    totalItems.value = syncStats.value.totalLocalItems
    
    // Simuler la progression
    const progressInterval = setInterval(() => {
      if (syncProgress.value < 90) {
        syncProgress.value += Math.random() * 10
      }
    }, 200)

    // Effectuer la synchronisation
    const result = await syncAndDelete()
    
    clearInterval(progressInterval)
    syncProgress.value = 100
    
    // Enregistrer le résultat
    lastSyncResult.value = {
      ...result,
      timestamp: new Date()
    }

    // Afficher le résultat
    if (result.success) {
      alert(`✅ Synchronisation réussie !\n\n${result.syncedItems} éléments synchronisés\n${result.deletedItems} éléments supprimés`)
    } else {
      alert(`⚠️ Synchronisation partielle\n\n${result.syncedItems} éléments synchronisés\n${result.deletedItems} éléments supprimés\n${result.errors.length} erreurs`)
    }

  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error)
    alert('❌ Erreur lors de la synchronisation: ' + error)
  } finally {
    isSyncing.value = false
    syncProgress.value = 0
  }
}

const pullFromSupabase = async () => {
  if (!isOnline.value) {
    alert('Vous devez être en ligne pour récupérer les données')
    return
  }

  try {
    // Implémenter la récupération depuis Supabase
    alert('Fonctionnalité de récupération en cours de développement')
  } catch (error) {
    console.error('Erreur lors de la récupération:', error)
    alert('❌ Erreur lors de la récupération: ' + error)
  }
}

const clearSyncedItems = () => {
  if (confirm('Êtes-vous sûr de vouloir vider la liste des éléments synchronisés ?')) {
    clearSyncedItems()
    alert('✅ Liste des éléments synchronisés vidée')
  }
}

const removeSyncedItem = (item: string) => {
  // Implémenter la suppression d'un élément spécifique
  console.log('Supprimer l\'élément:', item)
}

const toggleAutoDelete = () => {
  localStorage.setItem('auto_delete_enabled', autoDeleteEnabled.value.toString())
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(date)
}

// Lifecycle
onMounted(() => {
  // Détection de la connexion
  window.addEventListener('online', () => {
    isOnline.value = true
  })

  window.addEventListener('offline', () => {
    isOnline.value = false
  })

  // Charger la configuration
  const savedAutoDelete = localStorage.getItem('auto_delete_enabled')
  if (savedAutoDelete === 'true') {
    autoDeleteEnabled.value = true
  }

  const savedConfirm = localStorage.getItem('confirm_before_delete')
  if (savedConfirm === 'false') {
    confirmBeforeDelete.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('online', () => {})
  window.removeEventListener('offline', () => {})
})
</script>

<style scoped>
.sync-delete-manager {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.status-section {
  margin-bottom: 2rem;
}

.status-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.status-text {
  font-weight: 600;
  color: #374151;
}

.status-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value {
  font-weight: 600;
  color: #111827;
}

.actions-section {
  margin-bottom: 2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.progress-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-title {
  font-weight: 600;
  color: #1e40af;
  margin: 0;
}

.progress-percentage {
  font-weight: 600;
  color: #1e40af;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.results-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.results-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.results-time {
  font-size: 0.875rem;
  color: #6b7280;
}

.results-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.result-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.result-value {
  font-weight: 600;
}

.errors-section {
  margin-top: 1rem;
}

.errors-title {
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 0.5rem 0;
}

.errors-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
}

.error-text {
  font-size: 0.875rem;
  color: #991b1b;
}

.synced-items-section {
  margin-bottom: 2rem;
}

.synced-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.synced-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #e5e7eb;
}

.synced-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.synced-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
}

.item-text {
  flex: 1;
  font-size: 0.875rem;
  color: #166534;
}

.remove-btn {
  padding: 0.25rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.25rem;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fee2e2;
}

.config-section {
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}

.config-title {
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.config-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.option-text {
  font-size: 0.875rem;
  color: #374151;
}

@media (max-width: 640px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
