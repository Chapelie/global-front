<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storageService } from '../services/storage'
import { 
  CubeIcon, 
  ArchiveBoxIcon, 
  TruckIcon, 
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'
import BarChart from '../components/charts/BarChart.vue'

// Données réelles depuis localStorage
const kpiData = computed(() => {
  const productions = storageService.getProductions()
  const livraisons = storageService.getLivraisons()
  const stock = storageService.getStock()
  
  // Calculer la production d'aujourd'hui basée sur les articles
  const productionToday = storageService.getProductionToday()
  
  // Calculer la production d'hier basée sur les articles
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const productionYesterday = productions
    .filter(p => p.date === yesterday && p.statut === 'termine')
    .reduce((sum, p) => {
      if (p.articlesProduits && Array.isArray(p.articlesProduits)) {
        return sum + p.articlesProduits.reduce((articleSum, article) => articleSum + article.quantiteProduite, 0)
      }
      return sum
    }, 0)
  
  const changeProduction = productionYesterday > 0 ? ((productionToday - productionYesterday) / productionYesterday * 100).toFixed(1) : '0'
  
  // Calculer le total des articles produits (remplace les palettes)
  const totalArticlesProduits = productions
    .filter(p => p.statut === 'termine')
    .reduce((sum, p) => {
      if (p.articlesProduits && Array.isArray(p.articlesProduits)) {
        return sum + p.articlesProduits.reduce((articleSum, article) => articleSum + article.quantiteProduite, 0)
      }
      return sum
    }, 0)
  
  const stockCritique = stock.filter(s => s.stock <= s.seuilCritique).length
  
  return {
    production: {
      value: productionToday,
      change: parseFloat(changeProduction),
      trend: productionToday > productionYesterday ? 'up' : productionToday < productionYesterday ? 'down' : 'neutral'
    },
    articlesProduits: {
      value: totalArticlesProduits,
      change: 0,
      trend: 'neutral'
    },
    livraisons: {
      value: livraisons.filter(l => l.statut === 'en_cours').length,
      change: 0,
      trend: 'neutral'
    },
    stockCritique: {
      value: stockCritique,
      change: 0,
      trend: 'neutral'
    }
  }
})

// Données pour les graphiques
const productionData = computed(() => {
  const productions = storageService.getProductions()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()
  
  return last7Days.map(date => {
    const dayProductions = productions.filter(p => p.date === date && p.statut === 'termine')
    return {
      jour: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
      production: dayProductions.reduce((sum, p) => {
        if (p.articlesProduits && Array.isArray(p.articlesProduits)) {
          return sum + p.articlesProduits.reduce((articleSum, article) => articleSum + article.quantiteProduite, 0)
        }
        return sum
      }, 0),
      livraisons: 0 // À calculer plus tard si nécessaire
    }
  })
})

const stockData = computed(() => {
  const stock = storageService.getStock()
  return stock.map(item => ({
    article: item.nom,
    stock: item.stock,
    seuil: item.seuilCritique
  }))
})

// Alertes
const alertes = computed(() => {
  const stock = storageService.getStock()
  const livraisons = storageService.getLivraisons()
  const alertesList: Array<{
    id: string
    type: 'warning' | 'info'
    message: string
    time: string
  }> = []
  
  // Alertes de stock critique
  stock.forEach(item => {
    if (item.stock <= item.seuilCritique) {
      alertesList.push({
        id: `stock-${item.id}`,
        type: 'warning',
        message: `Stock de ${item.nom} critique (${item.stock} ${item.unite} restantes)`,
        time: 'Maintenant'
      })
    }
  })
  
  // Alertes de livraisons récentes
  const recentLivraisons = livraisons.filter(l => l.statut === 'livre').slice(0, 2)
  recentLivraisons.forEach(livraison => {
    alertesList.push({
      id: `livraison-${livraison.id}`,
      type: 'info',
      message: `Livraison ${livraison.numeroBL} confirmée`,
      time: 'Récemment'
    })
  })
  
  return alertesList
})

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up': return 'text-green-600'
    case 'down': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return ArrowUpIcon
    case 'down': return ArrowDownIcon
    default: return null
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête du Dashboard -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Tableau de bord</h2>
      <p class="mt-2 text-gray-600">Vue d'ensemble de votre production et livraisons</p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Production journalière -->
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Production journalière</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpiData.production.value.toLocaleString() }}</p>
            <p class="text-sm text-gray-500">articles</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <CubeIcon class="h-6 w-6 text-orange-600" />
          </div>
        </div>

      </div>

      <!-- Articles produits -->
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Articles produits</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpiData.articlesProduits.value.toLocaleString() }}</p>
            <p class="text-sm text-gray-500">total</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <ArchiveBoxIcon class="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <!-- Livraisons -->
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Livraisons en cours</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpiData.livraisons.value }}</p>
            <p class="text-sm text-gray-500">commandes</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
            <TruckIcon class="h-6 w-6 text-green-600" />
          </div>
        </div>

      </div>

      <!-- Stock critique -->
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Alertes stock</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpiData.stockCritique.value }}</p>
            <p class="text-sm text-gray-500">articles</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm text-gray-500">Seuil critique atteint</span>
        </div>
      </div>
    </div>

    <!-- Graphiques et Alertes -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Graphique de production -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Production de la semaine</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span class="text-sm text-gray-600">Production totale</span>
            </div>
          </div>
        </div>
        <BarChart 
          :data="productionData"
          :labels="productionData.map(item => item.jour)"
          :datasets="[
            {
              label: 'Production totale',
              data: productionData.map(item => item.production),
              backgroundColor: '#f97316'
            }
          ]"
          :height="256"
        />
      </div>

      <!-- Alertes et notifications -->
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Alertes récentes</h3>
        <div class="space-y-4">
          <div 
            v-for="alerte in alertes" 
            :key="alerte.id"
            class="flex items-start space-x-3 p-3 rounded-lg"
            :class="{
              'bg-red-50 border border-red-200': alerte.type === 'warning',
              'bg-blue-50 border border-blue-200': alerte.type === 'info'
            }"
          >
            <div 
              class="w-2 h-2 rounded-full mt-2"
              :class="{
                'bg-red-500': alerte.type === 'warning',
                'bg-blue-500': alerte.type === 'info'
              }"
            ></div>
            <div class="flex-1">
              <p class="text-sm text-gray-900">{{ alerte.message }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ alerte.time }}</p>
            </div>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-gray-200">
          <h4 class="text-sm font-medium text-gray-900 mb-3">État du stock</h4>
          <div class="space-y-3">
            <div 
              v-for="item in stockData" 
              :key="item.article"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-gray-600">{{ item.article }}</span>
              <div class="flex items-center space-x-2">
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full"
                    :class="{
                      'bg-green-500': item.stock > item.seuil * 2,
                      'bg-yellow-500': item.stock <= item.seuil * 2 && item.stock > item.seuil,
                      'bg-red-500': item.stock <= item.seuil
                    }"
                    :style="{ width: `${Math.min((item.stock / item.seuil) * 50, 100)}%` }"
                  ></div>
                </div>
                <span class="text-xs text-gray-500">{{ item.stock }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button class="flex flex-col items-center p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
          <CubeIcon class="h-8 w-8 text-orange-600 mb-2" />
          <span class="text-sm font-medium text-orange-700">Nouvelle production</span>
        </button>
        <button class="flex flex-col items-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
          <TruckIcon class="h-8 w-8 text-blue-600 mb-2" />
          <span class="text-sm font-medium text-blue-700">Nouvelle livraison</span>
        </button>
        <button class="flex flex-col items-center p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
          <ArchiveBoxIcon class="h-8 w-8 text-green-600 mb-2" />
          <span class="text-sm font-medium text-green-700">Gérer le stock</span>
        </button>
        <button class="flex flex-col items-center p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
          <ChartBarIcon class="h-8 w-8 text-purple-600 mb-2" />
          <span class="text-sm font-medium text-purple-700">Voir les analyses</span>
        </button>
      </div>
    </div>
  </div>
</template>
