<template>
  <div class="dashboard-stats">
    <div class="stats-grid">
      <!-- Articles -->
      <div class="stat-card">
        <div class="stat-icon">
          <ArchiveBoxIcon class="h-8 w-8" />
        </div>
        <div class="stat-content">
          <h3>Articles</h3>
          <div class="stat-number">{{ stats.articles.total }}</div>
          <div class="stat-details">
            <span class="text-red-600">{{ stats.articles.stockCritique }} critiques</span>
            <span class="text-green-600">{{ formatCurrency(stats.articles.valeurTotale) }}</span>
          </div>
        </div>
      </div>

      <!-- Commandes -->
      <div class="stat-card">
        <div class="stat-icon">
          <DocumentTextIcon class="h-8 w-8" />
        </div>
        <div class="stat-content">
          <h3>Commandes</h3>
          <div class="stat-number">{{ stats.commandes.total }}</div>
          <div class="stat-details">
            <span class="text-yellow-600">{{ stats.commandes.enAttente }} en attente</span>
            <span class="text-blue-600">{{ stats.commandes.confirmees }} confirmées</span>
          </div>
        </div>
      </div>

      <!-- Livraisons -->
      <div class="stat-card">
        <div class="stat-icon">
          <TruckIcon class="h-8 w-8" />
        </div>
        <div class="stat-content">
          <h3>Livraisons</h3>
          <div class="stat-number">{{ stats.livraisons.total }}</div>
          <div class="stat-details">
            <span class="text-orange-600">{{ stats.livraisons.enCours }} en cours</span>
            <span class="text-green-600">{{ stats.livraisons.livrees }} livrées</span>
          </div>
        </div>
      </div>

      <!-- Production -->
      <div class="stat-card">
        <div class="stat-icon">
          <CogIcon class="h-8 w-8" />
        </div>
        <div class="stat-content">
          <h3>Production</h3>
          <div class="stat-number">{{ stats.productions.total }}</div>
          <div class="stat-details">
            <span class="text-blue-600">{{ stats.productions.enCours }} en cours</span>
            <span class="text-green-600">{{ stats.productions.terminees }} terminées</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode de fonctionnement -->
    <div class="mode-indicator">
      <div :class="['mode-badge', mode === 'online' ? 'online' : 'offline']">
        <span class="mode-icon">{{ mode === 'online' ? '🌐' : '📱' }}</span>
        <span class="mode-text">{{ mode === 'online' ? 'Mode en ligne' : 'Mode hors ligne' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArchiveBoxIcon, DocumentTextIcon, TruckIcon, CogIcon } from '@heroicons/vue/24/outline'
import { useLaravelApi } from '../services/laravelApiService'

const { getDashboardStats } = useLaravelApi()

const stats = ref({
  articles: { total: 0, stockCritique: 0, valeurTotale: 0 },
  commandes: { total: 0, enAttente: 0, confirmees: 0, livrees: 0 },
  livraisons: { total: 0, enCours: 0, livrees: 0 },
  productions: { total: 0, enCours: 0, terminees: 0 }
})

const mode = ref<'online' | 'offline'>('offline')

const loadStats = async () => {
  try {
    console.log('🔍 [DashboardStats] Chargement des statistiques')
    const data = await getDashboardStats()
    stats.value = data
    mode.value = getMode() as "online" | "offline"
    console.log('✅ [DashboardStats] Statistiques chargées:', data)
  } catch (error) {
    console.error('❌ [DashboardStats] Erreur lors du chargement des statistiques:', error)
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard-stats {
  @apply flex flex-col;
}

.dashboard-stats > * + * {
  @apply mt-6;
}

.stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4;
}

.stats-grid > * {
  @apply mb-6;
}

.stats-grid > *:nth-child(4n) {
  @apply mb-0;
}

.stat-card {
  @apply bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100;
}

.stat-icon {
  @apply h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4;
}

.stat-content h3 {
  @apply text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2;
}

.stat-number {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.stat-details {
  @apply flex flex-col text-sm;
}

.stat-details > * + * {
  @apply mt-1;
}

.mode-indicator {
  @apply flex justify-center;
}

.mode-badge {
  @apply inline-flex items-center px-4 py-2 rounded-full text-sm font-medium;
}

.mode-badge.online {
  @apply bg-green-100 text-green-800;
}

.mode-badge.offline {
  @apply bg-gray-100 text-gray-800;
}

.mode-icon {
  @apply mr-2;
}

.mode-text {
  @apply font-medium;
}
</style>
