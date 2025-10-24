<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLaravelApi } from '../services/laravelApiService'
import {
  ChartBarIcon,
  TruckIcon,
  CubeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon
} from '@heroicons/vue/24/outline'

// Services
const { 
  getCommandes, 
  getLivraisons, 
  getProductions, 
  getGeneralStats,
  getProductionStats,
  getDeliveryStats
} = useLaravelApi()

// État réactif
const isLoading = ref(false)
const commandes = ref<any[]>([])
const livraisons = ref<any[]>([])
const productions = ref<any[]>([])
const generalStats = ref<any>({})
const productionStats = ref<any>({})
const deliveryStats = ref<any>({})

// Computed properties
const recentLivraisons = computed(() => 
  livraisons.value
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
)

const recentProductions = computed(() => 
  productions.value
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
)

const totalCommandes = computed(() => commandes.value.length)
const totalLivraisons = computed(() => livraisons.value.length)
const totalProductions = computed(() => productions.value.length)

const livraisonsEnCours = computed(() => 
  livraisons.value.filter(l => l.statut === 'en_cours').length
)

const livraisonsTerminees = computed(() => 
  livraisons.value.filter(l => l.statut === 'livre').length
)

const productionsEnCours = computed(() => 
  productions.value.filter(p => p.statut === 'en_cours').length
)

const productionsTerminees = computed(() => 
  productions.value.filter(p => p.statut === 'termine').length
)

const chiffreAffaires = computed(() => {
  return livraisons.value
    .filter(l => l.statut === 'livre')
    .reduce((total, l) => total + (l.total_livraison || 0), 0)
})

const chiffreAffairesMois = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return livraisons.value
    .filter(l => {
      const livraisonDate = new Date(l.date)
      return l.statut === 'livre' && livraisonDate >= startOfMonth
    })
    .reduce((total, l) => total + (l.total_livraison || 0), 0)
})

// Charger les données
onMounted(async () => {
  await loadDashboardData()
})

const loadDashboardData = async () => {
  try {
    isLoading.value = true
    
    // Charger toutes les données en parallèle
    const [commandesData, livraisonsData, productionsData, generalStatsData, productionStatsData, deliveryStatsData] = await Promise.all([
      getCommandes(),
      getLivraisons(),
      getProductions(),
      getGeneralStats(),
      getProductionStats({ period: 'month' }),
      getDeliveryStats({ period: 'month' })
    ])
    
    commandes.value = commandesData
    livraisons.value = livraisonsData
    productions.value = productionsData
    generalStats.value = generalStatsData
    productionStats.value = productionStatsData
    deliveryStats.value = deliveryStatsData
    
  } catch (error) {
    console.error('Erreur lors du chargement des données du dashboard:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshData = async () => {
  await loadDashboardData()
}

// Fonctions utilitaires
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'livre':
    case 'termine':
      return 'bg-green-100 text-green-800'
    case 'en_cours':
      return 'bg-yellow-100 text-yellow-800'
    case 'en_attente':
      return 'bg-blue-100 text-blue-800'
    case 'annule':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'livre':
    case 'termine':
      return CheckCircleIcon
    case 'en_cours':
      return ClockIcon
    case 'en_attente':
      return ClockIcon
    case 'annule':
      return ExclamationTriangleIcon
    default:
      return ClockIcon
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'livre':
      return 'Livré'
    case 'termine':
      return 'Terminé'
    case 'en_cours':
      return 'En cours'
    case 'en_attente':
      return 'En attente'
    case 'annule':
      return 'Annulé'
    default:
      return status
  }
}

const getTrendIcon = (current: number, previous: number) => {
  if (current > previous) return ArrowTrendingUpIcon
  if (current < previous) return ArrowTrendingDownIcon
  return ClockIcon
}

const getTrendColor = (current: number, previous: number) => {
  if (current > previous) return 'text-green-600'
  if (current < previous) return 'text-red-600'
  return 'text-gray-600'
}
</script>

<template>
  <div class="dashboard-container min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="header-content bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center mb-4 sm:mb-0">
            <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg mr-4">
              <ChartBarIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="page-title text-2xl font-bold text-gray-900">Dashboard</h1>
              <p class="text-sm text-gray-600">Vue d'ensemble de votre activité</p>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="refreshData"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              <ClockIcon class="h-5 w-5 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Statistiques principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Commandes -->
        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <ShoppingCartIcon class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Commandes</p>
                <p class="stat-value text-2xl font-bold text-gray-900">{{ totalCommandes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Livraisons -->
        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <TruckIcon class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Livraisons</p>
                <p class="stat-value text-2xl font-bold text-gray-900">{{ totalLivraisons }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Productions -->
        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <CubeIcon class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Productions</p>
                <p class="stat-value text-2xl font-bold text-gray-900">{{ totalProductions }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Chiffre d'Affaires -->
        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <CurrencyDollarIcon class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">CA Total</p>
                <p class="stat-value text-2xl font-bold text-gray-900">{{ formatCurrency(chiffreAffaires) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques détaillées -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Statut des Livraisons -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TruckIcon class="h-5 w-5 mr-2 text-green-600" />
            Statut des Livraisons
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <span class="text-sm text-gray-600">Livrées</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ livraisonsTerminees }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="h-3 w-3 rounded-full bg-yellow-500 mr-3"></div>
                <span class="text-sm text-gray-600">En cours</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ livraisonsEnCours }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="h-3 w-3 rounded-full bg-blue-500 mr-3"></div>
                <span class="text-sm text-gray-600">En attente</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ livraisons.filter(l => l.statut === 'en_attente').length }}</span>
            </div>
          </div>
        </div>

        <!-- Statut des Productions -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CubeIcon class="h-5 w-5 mr-2 text-purple-600" />
            Statut des Productions
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <span class="text-sm text-gray-600">Terminées</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ productionsTerminees }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="h-3 w-3 rounded-full bg-yellow-500 mr-3"></div>
                <span class="text-sm text-gray-600">En cours</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ productionsEnCours }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="h-3 w-3 rounded-full bg-blue-500 mr-3"></div>
                <span class="text-sm text-gray-600">En attente</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ productions.filter(p => p.statut === 'en_attente').length }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphiques et données récentes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Bons de Livraison Récents -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon class="h-5 w-5 mr-2 text-orange-600" />
              Bons de Livraison Récents
            </h3>
          </div>
          <div class="p-6">
            <div v-if="recentLivraisons.length === 0" class="text-center py-8">
              <DocumentTextIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-600">Aucune livraison récente</p>
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="livraison in recentLivraisons" 
                :key="livraison.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg mr-4">
                    <DocumentTextIcon class="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ livraison.numero_bl || `BL-${livraison.id}` }}</div>
                    <div class="text-sm text-gray-500">{{ livraison.client || 'Client non défini' }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold text-green-600">{{ formatCurrency(livraison.total_livraison || 0) }}</div>
                  <span :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(livraison.statut)
                  ]">
                    <component
                      :is="getStatusIcon(livraison.statut)"
                      class="h-3 w-3 mr-1"
                    />
                    {{ getStatusLabel(livraison.statut) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Productions Récentes -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <CubeIcon class="h-5 w-5 mr-2 text-purple-600" />
              Productions Récentes
            </h3>
          </div>
          <div class="p-6">
            <div v-if="recentProductions.length === 0" class="text-center py-8">
              <CubeIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-600">Aucune production récente</p>
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="production in recentProductions" 
                :key="production.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg mr-4">
                    <CubeIcon class="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ production.lot_id || `Lot-${production.id}` }}</div>
                    <div class="text-sm text-gray-500">{{ formatDate(production.date) }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold text-gray-900">
                    {{ production.quantite_ciment || 0 }}kg ciment
                  </div>
                  <span :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(production.statut)
                  ]">
                    <component
                      :is="getStatusIcon(production.statut)"
                      class="h-3 w-3 mr-1"
                    />
                    {{ getStatusLabel(production.statut) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques avancées -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <ChartBarIcon class="h-5 w-5 mr-2 text-orange-600" />
          Statistiques Avancées
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Chiffre d'Affaires du Mois -->
          <div class="text-center">
            <div class="h-16 w-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg mx-auto mb-4">
              <CurrencyDollarIcon class="h-8 w-8 text-white" />
            </div>
            <h4 class="text-lg font-semibold text-gray-900">CA du Mois</h4>
            <p class="text-2xl font-bold text-orange-600">{{ formatCurrency(chiffreAffairesMois) }}</p>
          </div>

          <!-- Taux de Livraison -->
          <div class="text-center">
            <div class="h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg mx-auto mb-4">
              <TruckIcon class="h-8 w-8 text-white" />
            </div>
            <h4 class="text-lg font-semibold text-gray-900">Taux de Livraison</h4>
            <p class="text-2xl font-bold text-green-600">
              {{ totalLivraisons > 0 ? Math.round((livraisonsTerminees / totalLivraisons) * 100) : 0 }}%
            </p>
          </div>

          <!-- Taux de Production -->
          <div class="text-center">
            <div class="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg mx-auto mb-4">
              <CubeIcon class="h-8 w-8 text-white" />
            </div>
            <h4 class="text-lg font-semibold text-gray-900">Taux de Production</h4>
            <p class="text-2xl font-bold text-purple-600">
              {{ totalProductions > 0 ? Math.round((productionsTerminees / totalProductions) * 100) : 0 }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles de base */
.dashboard-container {
  min-height: 100vh;
}

.page-title {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 700;
  color: #111827;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.stat-content {
  padding: 1.5rem;
}

.stat-value {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: #111827;
}

/* Responsive design */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .stat-content {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .stat-content {
    padding: 0.75rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: slideIn 0.3s ease-out;
}

/* Améliorer l'espacement des touches sur mobile */
button {
  min-height: 44px;
}
</style>