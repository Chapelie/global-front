<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLaravelApi } from '../services/laravelApiService'
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  TruckIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/vue/24/outline'

// Services
const { 
  getGeneralStats, 
  getProductionStats, 
  getDeliveryStats, 
  generatePdfReport, 
  sendEmailReport 
} = useLaravelApi()

// État réactif
const isLoading = ref(false)
const activeTab = ref<'overview' | 'production' | 'delivery'>('overview')
const selectedPeriod = ref('month')
const startDate = ref('')
const endDate = ref('')
const reportType = ref('production')

// Données
const generalStats = ref<any>({})
const productionStats = ref<any>({})
const deliveryStats = ref<any>({})

// Computed
const periodLabel = computed(() => {
  switch (selectedPeriod.value) {
    case 'day': return 'Aujourd\'hui'
    case 'week': return 'Cette semaine'
    case 'month': return 'Ce mois'
    case 'year': return 'Cette année'
    default: return 'Période personnalisée'
  }
})

// Charger les données
onMounted(async () => {
  await loadGeneralStats()
  await loadProductionStats()
  await loadDeliveryStats()
})

const loadGeneralStats = async () => {
  try {
    isLoading.value = true
    generalStats.value = await getGeneralStats()
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques générales:', error)
  } finally {
    isLoading.value = false
  }
}

const loadProductionStats = async () => {
  try {
    const params: any = { period: selectedPeriod.value }
    if (startDate.value && endDate.value) {
      params.start_date = startDate.value
      params.end_date = endDate.value
    }
    
    productionStats.value = await getProductionStats(params)
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques de production:', error)
  }
}

const loadDeliveryStats = async () => {
  try {
    const params: any = { period: selectedPeriod.value }
    if (startDate.value && endDate.value) {
      params.start_date = startDate.value
      params.end_date = endDate.value
    }
    
    deliveryStats.value = await getDeliveryStats(params)
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques de livraison:', error)
  }
}

// Actions
const refreshData = async () => {
  await Promise.all([
    loadGeneralStats(),
    loadProductionStats(),
    loadDeliveryStats()
  ])
}

const generatePdf = async () => {
  try {
    isLoading.value = true
    
    const params = {
      type: reportType.value,
      period: selectedPeriod.value,
      start_date: startDate.value,
      end_date: endDate.value
    }
    
    const result = await generatePdfReport(params)
    
    if (result.success) {
      // Pour l'instant, afficher les données dans une modal au lieu de télécharger
      console.log('Données du rapport:', result.data)
      
      // Créer un fichier JSON téléchargeable temporairement
      const dataStr = JSON.stringify(result.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert('Rapport généré et téléchargé (format JSON temporaire) !')
    } else {
      alert('Erreur lors de la génération du rapport: ' + result.error)
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    alert('Erreur lors de la génération du PDF')
  } finally {
    isLoading.value = false
  }
}

const sendEmail = async () => {
  try {
    isLoading.value = true
    
    const params = {
      type: selectedPeriod.value === 'week' ? 'weekly' : 'monthly',
      email: 'clemsobonding@gmail.com',
      period: selectedPeriod.value
    }
    
    const result = await sendEmailReport(params)
    
    if (result.success) {
      alert('Rapport envoyé par email avec succès !')
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    alert('Erreur lors de l\'envoi de l\'email')
  } finally {
    isLoading.value = false
  }
}

const changePeriod = () => {
  refreshData()
}

// Fonctions utilitaires
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num)
}

const getTrendIcon = (current: number, previous: number) => {
  if (current > previous) return ArrowTrendingUpIcon
  if (current < previous) return ArrowTrendingDownIcon
  return MinusIcon
}

const getTrendColor = (current: number, previous: number) => {
  if (current > previous) return 'text-green-600'
  if (current < previous) return 'text-red-600'
  return 'text-gray-600'
}
</script>

<template>
  <div class="analyses-container min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="header-content bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center mb-4 sm:mb-0">
            <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg mr-4">
              <ChartBarIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="page-title text-2xl font-bold text-gray-900">Analyses & Rapports</h1>
              <p class="text-sm text-gray-600">Tableaux de bord et analyses détaillées</p>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              @click="generatePdf"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              <DocumentArrowDownIcon class="h-5 w-5 mr-2" />
              PDF
            </button>
            <button
              @click="sendEmail"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              <EnvelopeIcon class="h-5 w-5 mr-2" />
              Email
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Contrôles de période -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">Période:</label>
            <select
              v-model="selectedPeriod"
              @change="changePeriod"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="day">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">Type de rapport:</label>
            <select
              v-model="reportType"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="production">Production</option>
              <option value="delivery">Livraison</option>
              <option value="general">Général</option>
            </select>
          </div>
          
          <button
            @click="refreshData"
            :disabled="isLoading"
            class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
          >
            <ClockIcon class="h-4 w-4 mr-2" />
            Actualiser
          </button>
        </div>
      </div>

      <!-- Onglets -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex">
            <button
              @click="activeTab = 'overview'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-medium text-center transition-all duration-200',
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <ChartBarIcon class="h-5 w-5 mx-auto mb-2" />
              Vue d'ensemble
            </button>
            <button
              @click="activeTab = 'production'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-medium text-center transition-all duration-200',
                activeTab === 'production'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <CubeIcon class="h-5 w-5 mx-auto mb-2" />
              Production
            </button>
            <button
              @click="activeTab = 'delivery'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-medium text-center transition-all duration-200',
                activeTab === 'delivery'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <TruckIcon class="h-5 w-5 mx-auto mb-2" />
              Livraison
            </button>
          </nav>
        </div>

        <!-- Contenu Vue d'ensemble -->
        <div v-if="activeTab === 'overview'" class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Statistiques Générales - {{ periodLabel }}</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Productions -->
            <div class="stat-card bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div class="stat-content p-6">
                <div class="flex items-center">
                  <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <CubeIcon class="h-6 w-6 text-white" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Productions</p>
                    <p class="stat-value text-2xl font-bold text-gray-900">
                      {{ formatNumber(generalStats.productions?.total || 0) }}
                    </p>
                    <p class="text-xs text-gray-500">{{ periodLabel }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Livraisons -->
            <div class="stat-card bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div class="stat-content p-6">
                <div class="flex items-center">
                  <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <TruckIcon class="h-6 w-6 text-white" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Livraisons</p>
                    <p class="stat-value text-2xl font-bold text-gray-900">
                      {{ formatNumber(generalStats.livraisons?.total || 0) }}
                    </p>
                    <p class="text-xs text-gray-500">{{ periodLabel }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Commandes -->
            <div class="stat-card bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div class="stat-content p-6">
                <div class="flex items-center">
                  <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <UserGroupIcon class="h-6 w-6 text-white" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Commandes</p>
                    <p class="stat-value text-2xl font-bold text-gray-900">
                      {{ formatNumber(generalStats.commandes?.total || 0) }}
                    </p>
                    <p class="text-xs text-gray-500">{{ periodLabel }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Articles en Stock Critique -->
            <div class="stat-card bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div class="stat-content p-6">
                <div class="flex items-center">
                  <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <ExclamationTriangleIcon class="h-6 w-6 text-white" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Stock Critique</p>
                    <p class="stat-value text-2xl font-bold text-gray-900">
                      {{ formatNumber(generalStats.articles?.stock_critique || 0) }}
                    </p>
                    <p class="text-xs text-gray-500">articles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenu Production -->
        <div v-if="activeTab === 'production'" class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Analyse de Production - {{ periodLabel }}</h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Statistiques de production -->
            <div class="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Total Productions</span>
                  <span class="font-bold text-lg">{{ formatNumber(productionStats.total_productions || 0) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Terminées</span>
                  <span class="font-bold text-lg text-green-600">{{ formatNumber(productionStats.productions_terminees || 0) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">En cours</span>
                  <span class="font-bold text-lg text-orange-600">{{ formatNumber(productionStats.productions_en_cours || 0) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Ciment utilisé</span>
                  <span class="font-bold text-lg">{{ formatNumber(productionStats.total_ciment_utilise || 0) }} kg</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Adjuvant utilisé</span>
                  <span class="font-bold text-lg">{{ formatNumber(productionStats.total_adjuvant_utilise || 0) }} kg</span>
                </div>
              </div>
            </div>

            <!-- Matériaux utilisés -->
            <div class="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Matériaux</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Moyenne ciment/production</span>
                  <span class="font-bold">{{ Math.round(productionStats.materiaux_utilises?.moyenne_ciment_par_production || 0) }} kg</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Moyenne adjuvant/production</span>
                  <span class="font-bold">{{ Math.round(productionStats.materiaux_utilises?.moyenne_adjuvant_par_production || 0) }} kg</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tableau des productions par jour -->
          <div v-if="productionStats.productions_par_jour?.length > 0" class="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Productions par Jour</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productions</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciment (kg)</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjuvant (kg)</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="jour in productionStats.productions_par_jour" :key="jour.date">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ new Date(jour.date).toLocaleDateString('fr-FR') }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ jour.count }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ jour.ciment_total || 0 }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ jour.adjuvant_total || 0 }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Contenu Livraison -->
        <div v-if="activeTab === 'delivery'" class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Analyse de Livraison - {{ periodLabel }}</h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Statistiques de livraison -->
            <div class="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Total Livraisons</span>
                  <span class="font-bold text-lg">{{ formatNumber(deliveryStats.total_livraisons || 0) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Terminées</span>
                  <span class="font-bold text-lg text-green-600">{{ formatNumber(deliveryStats.livraisons_terminees || 0) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">En cours</span>
                  <span class="font-bold text-lg text-orange-600">{{ formatNumber(deliveryStats.livraisons_en_cours || 0) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Quantité livrée</span>
                  <span class="font-bold text-lg">{{ formatNumber(deliveryStats.total_quantite_livree || 0) }}</span>
                </div>
              </div>
            </div>

            <!-- Top produits livrés -->
            <div class="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Produits Livrés</h3>
              <div class="space-y-3">
                <div
                  v-for="(produit, index) in deliveryStats.top_produits_livres?.slice(0, 5)"
                  :key="produit.nom"
                  class="flex justify-between items-center"
                >
                  <span class="text-sm text-gray-600">{{ index + 1 }}. {{ produit.nom }}</span>
                  <span class="font-bold text-sm">{{ formatNumber(produit.quantite_totale) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tableau des livraisons par jour -->
          <div v-if="deliveryStats.livraisons_par_jour?.length > 0" class="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Livraisons par Jour</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livraisons</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité Totale</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="jour in deliveryStats.livraisons_par_jour" :key="jour.date">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ new Date(jour.date).toLocaleDateString('fr-FR') }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ jour.count }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ jour.total_quantite || 0 }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analyses-container {
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
  transition: all 0.2s;
  transform: scale(1);
}

.stat-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: scale(1.02);
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
</style>