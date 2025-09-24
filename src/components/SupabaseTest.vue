<template>
  <div class="supabase-test">
    <div class="test-header">
      <h2 class="test-title">
        <WifiIcon class="w-6 h-6" />
        Test de Configuration Supabase
      </h2>
    </div>

    <div class="test-content">
      <!-- Statut de connexion -->
      <div class="status-section">
        <div class="status-card" :class="statusClass">
          <div class="status-header">
            <div class="status-icon">
              <CheckCircleIcon v-if="isConnected" class="w-6 h-6" />
              <XCircleIcon v-else class="w-6 h-6" />
            </div>
            <div class="status-text">
              <h3 class="status-title">{{ statusTitle }}</h3>
              <p class="status-subtitle">{{ statusSubtitle }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Détails de configuration -->
      <div class="config-section">
        <h3 class="section-title">Configuration</h3>
        <div class="config-details">
          <div class="config-item">
            <span class="config-label">URL Supabase:</span>
            <span class="config-value" :class="urlStatus">
              {{ supabaseUrl || 'Non configuré' }}
            </span>
          </div>
          <div class="config-item">
            <span class="config-label">Clé Anonyme:</span>
            <span class="config-value" :class="keyStatus">
              {{ supabaseKey ? 'Configurée' : 'Non configurée' }}
            </span>
          </div>
          <div class="config-item">
            <span class="config-label">Mode:</span>
            <span class="config-value" :class="modeStatus">
              {{ appMode }}
            </span>
          </div>
        </div>
      </div>

      <!-- Test de connexion -->
      <div class="test-section">
        <h3 class="section-title">Test de Connexion</h3>
        <div class="test-actions">
          <button 
            @click="testConnection" 
            :disabled="isTesting"
            class="btn btn-primary"
          >
            <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': isTesting }" />
            {{ isTesting ? 'Test en cours...' : 'Tester la Connexion' }}
          </button>
          
          <button 
            @click="testTables" 
            :disabled="isTesting || !isConnected"
            class="btn btn-secondary"
          >
            <TableCellsIcon class="w-5 h-5" />
            Tester les Tables
          </button>
        </div>
      </div>

      <!-- Résultats des tests -->
      <div v-if="testResults.length > 0" class="results-section">
        <h3 class="section-title">Résultats des Tests</h3>
        <div class="results-list">
          <div 
            v-for="(result, index) in testResults" 
            :key="index"
            class="result-item"
            :class="result.success ? 'success' : 'error'"
          >
            <div class="result-icon">
              <CheckCircleIcon v-if="result.success" class="w-5 h-5" />
              <XCircleIcon v-else class="w-5 h-5" />
            </div>
            <div class="result-content">
              <h4 class="result-title">{{ result.title }}</h4>
              <p class="result-message">{{ result.message }}</p>
              <p v-if="result.details" class="result-details">{{ result.details }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions de synchronisation -->
      <div v-if="isConnected" class="sync-section">
        <h3 class="section-title">Synchronisation</h3>
        <div class="sync-actions">
          <button 
            @click="startSync" 
            :disabled="isSyncing"
            class="btn btn-blue"
          >
            <ArrowsRightLeftIcon class="w-5 h-5" />
            {{ isSyncing ? 'Synchronisation...' : 'Démarrer la Sync' }}
          </button>
          
          <button 
            @click="pullData" 
            :disabled="isSyncing"
            class="btn btn-green"
          >
            <ArrowDownTrayIcon class="w-5 h-5" />
            Récupérer les Données
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { APP_CONFIG } from '../config/app-config'
import { storageService } from '../services/storage'
import {
  WifiIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  TableCellsIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

// État local
const isConnected = ref(false)
const isTesting = ref(false)
const isSyncing = ref(false)
const testResults = ref<Array<{
  success: boolean
  title: string
  message: string
  details?: string
}>>([])

// Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const appMode = APP_CONFIG.mode

// Computed
const statusClass = computed(() => {
  if (isConnected.value) return 'status-connected'
  if (isTesting.value) return 'status-testing'
  return 'status-disconnected'
})

const statusTitle = computed(() => {
  if (isConnected.value) return 'Connecté à Supabase'
  if (isTesting.value) return 'Test en cours...'
  return 'Non connecté'
})

const statusSubtitle = computed(() => {
  if (isConnected.value) return 'Prêt pour la synchronisation'
  if (isTesting.value) return 'Vérification de la connexion...'
  return 'Vérifiez votre configuration'
})

const urlStatus = computed(() => {
  return supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' ? 'text-green-600' : 'text-red-600'
})

const keyStatus = computed(() => {
  return supabaseKey && supabaseKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here' ? 'text-green-600' : 'text-red-600'
})

const modeStatus = computed(() => {
  return appMode === 'online' ? 'text-green-600' : 'text-orange-600'
})

// Méthodes
const testConnection = async () => {
  isTesting.value = true
  testResults.value = []

  try {
    // Test de connexion basique
    const { data, error } = await supabase.from('articles').select('count').limit(1)
    
    if (error) {
      throw new Error(error.message)
    }

    isConnected.value = true
    testResults.value.push({
      success: true,
      title: 'Connexion Supabase',
      message: 'Connexion réussie à la base de données',
      details: `Tables accessibles: ${data ? 'Oui' : 'Non'}`
    })

  } catch (error) {
    isConnected.value = false
    testResults.value.push({
      success: false,
      title: 'Connexion Supabase',
      message: 'Échec de la connexion',
      details: error instanceof Error ? error.message : String(error)
    })
  } finally {
    isTesting.value = false
  }
}

const testTables = async () => {
  if (!isConnected.value) return

  isTesting.value = true

  try {
    const tables = ['articles', 'productions', 'commandes', 'livraisons', 'transferts']
    const results = []

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1)
        
        if (error) {
          results.push({
            success: false,
            title: `Table ${table}`,
            message: 'Erreur d\'accès',
            details: error.message
          })
        } else {
          results.push({
            success: true,
            title: `Table ${table}`,
            message: 'Accessible',
            details: `Données: ${data ? 'Oui' : 'Non'}`
          })
        }
      } catch (error) {
        results.push({
          success: false,
          title: `Table ${table}`,
          message: 'Erreur de connexion',
          details: error instanceof Error ? error.message : String(error)
        })
      }
    }

    testResults.value.push(...results)

  } catch (error) {
    testResults.value.push({
      success: false,
      title: 'Test des Tables',
      message: 'Erreur générale',
      details: error instanceof Error ? error.message : String(error)
    })
  } finally {
    isTesting.value = false
  }
}

const startSync = async () => {
  if (!isConnected.value) return

  isSyncing.value = true

  try {
    // Synchroniser les données locales vers Supabase
    await storageService.syncAllToSupabase()
    
    testResults.value.push({
      success: true,
      title: 'Synchronisation',
      message: 'Synchronisation réussie',
      details: 'Données locales synchronisées vers Supabase'
    })

  } catch (error) {
    testResults.value.push({
      success: false,
      title: 'Synchronisation',
      message: 'Échec de la synchronisation',
      details: error instanceof Error ? error.message : String(error)
    })
  } finally {
    isSyncing.value = false
  }
}

const pullData = async () => {
  if (!isConnected.value) return

  isSyncing.value = true

  try {
    // Récupérer les données depuis Supabase
    const { data, error } = await supabase.from('articles').select('*')
    
    if (error) {
      throw new Error(error.message)
    }

    testResults.value.push({
      success: true,
      title: 'Récupération des Données',
      message: 'Données récupérées avec succès',
      details: `${data?.length || 0} articles récupérés`
    })

  } catch (error) {
    testResults.value.push({
      success: false,
      title: 'Récupération des Données',
      message: 'Échec de la récupération',
      details: error instanceof Error ? error.message : String(error)
    })
  } finally {
    isSyncing.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Vérifier automatiquement la connexion au montage
  setTimeout(() => {
    testConnection()
  }, 1000)
})
</script>

<style scoped>
.supabase-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.test-header {
  text-align: center;
  margin-bottom: 2rem;
}

.test-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.status-section {
  margin-bottom: 2rem;
}

.status-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 2px solid;
}

.status-card.status-connected {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.status-card.status-testing {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.status-card.status-disconnected {
  background: #fef2f2;
  border-color: #fecaca;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  color: #6b7280;
  margin: 0;
}

.config-section,
.test-section,
.results-section,
.sync-section {
  margin-bottom: 2rem;
}

.section-title {
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.config-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.config-label {
  font-weight: 500;
  color: #374151;
}

.config-value {
  font-weight: 600;
}

.test-actions,
.sync-actions {
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

.btn-blue {
  background: #1d4ed8;
  color: white;
}

.btn-blue:hover:not(:disabled) {
  background: #1e40af;
}

.btn-green {
  background: #059669;
  color: white;
}

.btn-green:hover:not(:disabled) {
  background: #047857;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid;
}

.result-item.success {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.result-item.error {
  background: #fef2f2;
  border-color: #fecaca;
}

.result-icon {
  flex-shrink: 0;
}

.result-content {
  flex: 1;
}

.result-title {
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.result-message {
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.result-details {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

@media (max-width: 640px) {
  .test-actions,
  .sync-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
