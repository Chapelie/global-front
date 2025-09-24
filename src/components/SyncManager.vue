<template>
  <div class="sync-manager">
    <!-- Statut de synchronisation -->
    <div class="sync-status">
      <div class="status-indicator" :class="statusClass">
        <div class="status-icon">
          <WifiIcon v-if="syncStatus.isOnline && !syncStatus.isSyncing" class="w-5 h-5" />
          <ExclamationTriangleIcon v-else-if="!syncStatus.isOnline" class="w-5 h-5" />
          <ArrowPathIcon v-else class="w-5 h-5 animate-spin" />
        </div>
        <div class="status-text">
          <p class="status-title">{{ statusTitle }}</p>
          <p class="status-subtitle">{{ statusSubtitle }}</p>
        </div>
      </div>

      <!-- Progression de synchronisation -->
      <div v-if="syncStatus.isSyncing" class="sync-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${syncStatus.syncProgress}%` }"
          ></div>
        </div>
        <p class="progress-text">{{ syncStatus.syncProgress }}% synchronisé</p>
      </div>

      <!-- Dernière synchronisation -->
      <div v-if="syncStatus.lastSync" class="last-sync">
        <ClockIcon class="w-4 h-4" />
        <span>Dernière sync: {{ formatDate(syncStatus.lastSync) }}</span>
      </div>
    </div>

    <!-- Actions de synchronisation -->
    <div class="sync-actions">
      <button 
        @click="startSync" 
        :disabled="!syncStatus.isOnline || syncStatus.isSyncing"
        class="btn btn-primary"
      >
        <ArrowPathIcon class="w-4 h-4" />
        Synchroniser maintenant
      </button>

      <button 
        @click="pullFromSupabase" 
        :disabled="!syncStatus.isOnline || syncStatus.isSyncing"
        class="btn btn-secondary"
      >
        <ArrowDownTrayIcon class="w-4 h-4" />
        Récupérer depuis Supabase
      </button>

      <button 
        @click="syncBidirectional" 
        :disabled="!syncStatus.isOnline || syncStatus.isSyncing"
        class="btn btn-blue"
      >
        <ArrowsRightLeftIcon class="w-4 h-4" />
        Sync bidirectionnelle
      </button>
    </div>

    <!-- Queue de synchronisation -->
    <div v-if="syncQueue.length > 0" class="sync-queue">
      <h3 class="queue-title">
        Changements en attente ({{ syncQueue.length }})
      </h3>
      <div class="queue-list">
        <div 
          v-for="item in syncQueue" 
          :key="item.id"
          class="queue-item"
        >
          <div class="item-info">
            <span class="item-operation" :class="getOperationClass(item.operation)">
              {{ getOperationText(item.operation) }}
            </span>
            <span class="item-table">{{ item.table }}</span>
            <span class="item-time">{{ formatTime(item.timestamp) }}</span>
          </div>
          <div class="item-retry" v-if="item.retryCount > 0">
            Tentative {{ item.retryCount }}/3
          </div>
        </div>
      </div>
    </div>

    <!-- Erreurs de synchronisation -->
    <div v-if="syncStatus.syncErrors.length > 0" class="sync-errors">
      <h3 class="errors-title">
        <ExclamationTriangleIcon class="w-5 h-5" />
        Erreurs de synchronisation ({{ syncStatus.syncErrors.length }})
      </h3>
      <div class="errors-list">
        <div 
          v-for="(error, index) in syncStatus.syncErrors" 
          :key="index"
          class="error-item"
        >
          {{ error }}
        </div>
      </div>
      <button @click="clearErrors" class="btn btn-sm btn-gray">
        Effacer les erreurs
      </button>
    </div>

    <!-- Paramètres de synchronisation -->
    <div class="sync-settings">
      <h3 class="settings-title">Paramètres de synchronisation</h3>
      
      <div class="setting-item">
        <label class="setting-label">
          <input 
            v-model="autoSyncEnabled" 
            type="checkbox" 
            @change="toggleAutoSync"
          />
          Synchronisation automatique
        </label>
        <span class="setting-description">
          Synchronise automatiquement toutes les 30 secondes
        </span>
      </div>

      <div class="setting-item">
        <label class="setting-label">Intervalle de sync (secondes)</label>
        <input 
          v-model.number="syncInterval" 
          type="number" 
          min="10" 
          max="300"
          class="setting-input"
          :disabled="!autoSyncEnabled"
        />
      </div>
    </div>

    <!-- Statistiques -->
    <div class="sync-stats">
      <h3 class="stats-title">Statistiques</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Queue</span>
          <span class="stat-value">{{ syncQueue.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">En ligne</span>
          <span class="stat-value" :class="syncStatus.isOnline ? 'text-green-600' : 'text-red-600'">
            {{ syncStatus.isOnline ? 'Oui' : 'Non' }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Erreurs</span>
          <span class="stat-value" :class="syncStatus.syncErrors.length > 0 ? 'text-red-600' : 'text-green-600'">
            {{ syncStatus.syncErrors.length }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSupabaseSync } from '../services/supabaseSync'
import { storageService } from '../services/storage'
import {
  WifiIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const {
  status: syncStatus,
  queue: syncQueue,
  startSync,
  pullFromSupabase,
  syncBidirectional,
  startAutoSync,
  stopAutoSync,
  clearQueue,
  getStats
} = useSupabaseSync()

const autoSyncEnabled = ref(false)
const syncInterval = ref(30)

// Computed properties
const statusClass = computed(() => {
  if (!syncStatus.isOnline) return 'status-offline'
  if (syncStatus.isSyncing) return 'status-syncing'
  if (syncStatus.syncErrors.length > 0) return 'status-error'
  return 'status-online'
})

const statusTitle = computed(() => {
  if (!syncStatus.isOnline) return 'Hors ligne'
  if (syncStatus.isSyncing) return 'Synchronisation en cours...'
  if (syncStatus.syncErrors.length > 0) return 'Erreurs de synchronisation'
  return 'En ligne'
})

const statusSubtitle = computed(() => {
  if (!syncStatus.isOnline) return 'Connexion requise pour synchroniser'
  if (syncStatus.isSyncing) return `${syncStatus.syncProgress}% terminé`
  if (syncStatus.syncErrors.length > 0) return `${syncStatus.syncErrors.length} erreur(s)`
  if (syncStatus.pendingChanges > 0) return `${syncStatus.pendingChanges} changement(s) en attente`
  return 'Tout est synchronisé'
})

// Méthodes
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(date)
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getOperationClass = (operation: string) => {
  switch (operation) {
    case 'insert': return 'operation-insert'
    case 'update': return 'operation-update'
    case 'delete': return 'operation-delete'
    default: return ''
  }
}

const getOperationText = (operation: string) => {
  switch (operation) {
    case 'insert': return 'Ajouter'
    case 'update': return 'Modifier'
    case 'delete': return 'Supprimer'
    default: return operation
  }
}

const toggleAutoSync = () => {
  if (autoSyncEnabled.value) {
    startAutoSync(syncInterval.value * 1000)
  } else {
    stopAutoSync()
  }
}

const clearErrors = () => {
  // Cette fonction devrait être implémentée dans le service
  console.log('Effacer les erreurs')
}

// Lifecycle
onMounted(() => {
  // Démarrer la synchronisation automatique si configurée
  const savedAutoSync = localStorage.getItem('auto_sync_enabled')
  if (savedAutoSync === 'true') {
    autoSyncEnabled.value = true
    toggleAutoSync()
  }
})

onUnmounted(() => {
  stopAutoSync()
})
</script>

<style scoped>
.sync-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.sync-status {
  margin-bottom: 2rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.status-indicator.status-online {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.status-indicator.status-offline {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.status-indicator.status-syncing {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.status-indicator.status-error {
  background: #fef3c7;
  border: 1px solid #fde68a;
}

.status-icon {
  flex-shrink: 0;
}

.status-text {
  flex: 1;
}

.status-title {
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.status-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.sync-progress {
  margin-top: 1rem;
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
  text-align: center;
  margin: 0;
}

.last-sync {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.sync-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
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

.btn-blue {
  background: #1d4ed8;
  color: white;
}

.btn-blue:hover:not(:disabled) {
  background: #1e40af;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.btn-gray {
  background: #9ca3af;
  color: white;
}

.btn-gray:hover:not(:disabled) {
  background: #6b7280;
}

.sync-queue,
.sync-errors,
.sync-settings,
.sync-stats {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
}

.queue-title,
.errors-title,
.settings-title,
.stats-title {
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.queue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-operation {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.operation-insert {
  background: #d1fae5;
  color: #065f46;
}

.operation-update {
  background: #dbeafe;
  color: #1e40af;
}

.operation-delete {
  background: #fee2e2;
  color: #991b1b;
}

.item-table {
  font-weight: 500;
  color: #374151;
}

.item-time {
  font-size: 0.875rem;
  color: #6b7280;
}

.item-retry {
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 500;
}

.errors-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.error-item {
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #991b1b;
  font-size: 0.875rem;
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.setting-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-left: 1.5rem;
}

.setting-input {
  width: 100%;
  max-width: 200px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.stats-grid {
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

@media (max-width: 640px) {
  .sync-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
