<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLaravelApi } from '@/services/laravelApiService'

// Service Laravel
const {
  getArticles,
  getProductions,
  getLivraisons,
  getCommandes
} = useLaravelApi()

import {
  CubeIcon,
  ArchiveBoxIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  Cog6ToothIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'
import BarChart from '../components/charts/BarChart.vue'

// Variables réactives pour les données Laravel
const laravelData = ref({
  articles: [] as any[],
  productions: [] as any[],
  livraisons: [] as any[],
  commandes: [] as any[],
  stockInfo: {} as any,
  productionsDuJour: {} as any,
  livraisonsRecentes: {} as any,
  productionParSemaine: {} as any
})

const loading = ref(false)
const error = ref<string | null>(null)

// Fonction pour charger les données Laravel
const loadLaravelData = async () => {
  console.log('🔍 [HomeView] Chargement des données Laravel...')
  loading.value = true
  error.value = null
  
  try {
    // Charger toutes les données en parallèle
    const [
      articles,
      productions,
      livraisons,
      commandes
    ] = await Promise.all([
      getArticles(),
      getProductions(),
      getLivraisons(),
      getCommandes()
    ])
    
    // Calculer les livraisons récentes
    const recentLivraisons = livraisons
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
    const livraisonsRecentes = { total: recentLivraisons.length }
    
    // Calculer la production par semaine
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7))
    
    const productionsSemaine = productions.filter(p => {
      const prodDate = new Date(p.date)
      return prodDate >= startOfWeek && prodDate <= endOfWeek
    })
    
    const parJour = {
      lundi: productionsSemaine.filter(p => new Date(p.date).getDay() === 1).length,
      mardi: productionsSemaine.filter(p => new Date(p.date).getDay() === 2).length,
      mercredi: productionsSemaine.filter(p => new Date(p.date).getDay() === 3).length,
      jeudi: productionsSemaine.filter(p => new Date(p.date).getDay() === 4).length,
      vendredi: productionsSemaine.filter(p => new Date(p.date).getDay() === 5).length,
      samedi: productionsSemaine.filter(p => new Date(p.date).getDay() === 6).length,
      dimanche: productionsSemaine.filter(p => new Date(p.date).getDay() === 0).length
    }
    
    const productionParSemaine = {
      totalSemaine: productionsSemaine.length,
      parJour
    }
    
    // Mettre à jour les données
    laravelData.value = {
      articles,
      productions,
      livraisons,
      commandes,
      stockInfo: {},
      productionsDuJour: {},
      livraisonsRecentes,
      productionParSemaine
    }
    
    console.log('✅ [HomeView] Données Laravel chargées:', {
      articles: articles.length,
      productions: productions.length,
      livraisons: livraisons.length,
      commandes: commandes.length
    })
    
  } catch (err) {
    console.error('❌ [HomeView] Erreur lors du chargement Laravel:', err)
    error.value = 'Erreur lors du chargement des données'
    // En cas d'erreur, les données localStorage seront utilisées via le fallback
  } finally {
    loading.value = false
  }
}

// Données réelles depuis Laravel
const kpiData = computed(() => {
  // Utiliser les données Laravel
  const productions = laravelData.value.productions
  const livraisons = laravelData.value.livraisons
  const stock = laravelData.value.articles
  
  // Date d'aujourd'hui
  const today = new Date().toISOString().split('T')[0]
  
  // Calculer la production d'aujourd'hui basée sur les articles
  const productionToday = productions
    .filter((p: any) => p.date === today && p.statut === 'termine')
    .reduce((sum: any, p: any) => {
      if (p.articlesProduits && Array.isArray(p.articlesProduits)) {
        return sum + p.articlesProduits.reduce((articleSum: any, article: any) => articleSum + article.quantiteProduite, 0)
      }
      return sum
    }, 0)
  
  // Calculer la production d'hier basée sur les articles
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const productionYesterday = productions
    .filter((p: any) => p.date === yesterday && p.statut === 'termine')
    .reduce((sum: any, p: any) => {
      if (p.articlesProduits && Array.isArray(p.articlesProduits)) {
        return sum + p.articlesProduits.reduce((articleSum: any, article: any) => articleSum + article.quantiteProduite, 0)
      }
      return sum
    }, 0)
  
  const changeProduction = productionYesterday > 0 ? ((productionToday - productionYesterday) / productionYesterday * 100).toFixed(1) : '0'
  
  // Calculer le total des articles produits (remplace les palettes)
  const totalArticlesProduits = productions
    .filter((p: any) => p.statut === 'termine')
    .reduce((sum: any, p: any) => {
      if (p.articlesProduits && Array.isArray(p.articlesProduits)) {
        return sum + p.articlesProduits.reduce((articleSum: any, article: any) => articleSum + article.quantiteProduite, 0)
      }
      return sum
    }, 0)
  
  const stockCritique = stock.filter((s: any) => s.stock <= s.seuilCritique).length
  
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
  const productions = laravelData.value.productions
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  return last7Days.map(date => {
    const dayProductions = productions.filter((p: any) => p.date === date && p.statut === 'termine')
    return {
      jour: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
      production: dayProductions.reduce((sum: any, p: any) => {
        if (p.articlesProduits && Array.isArray(p.articlesProduits)) {
          return sum + p.articlesProduits.reduce((articleSum: any, article: any) => articleSum + article.quantiteProduite, 0)
        }
        return sum
      }, 0),
      livraisons: 0 // À calculer plus tard si nécessaire
    }
  })
})

const stockData = computed(() => {
  const stock = laravelData.value.articles
  return stock.map((item: any) => ({
    article: item.nom,
    stock: item.stock,
    seuil: item.seuilCritique
  }))
})

// Alertes
const alertes = computed(() => {
  const stock = laravelData.value.articles
  const livraisons = laravelData.value.livraisons
  const alertesList: Array<{
    id: string
    type: 'warning' | 'info'
    message: string
    time: string
  }> = []

  // Alertes de stock critique
  stock.forEach((item: any) => {
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
  const recentLivraisons = livraisons.filter((l: any) => l.statut === 'livre').slice(0, 2)
  recentLivraisons.forEach(livraison => {
    alertesList.push({
      id: `livraison-${(livraison as any).id}`,
      type: 'info',
      message: `Livraison ${(livraison as any).numeroBL} confirmée`,
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

// Données détaillées pour les vues d'ensemble
const productionOverview = computed(() => {
  const productions = laravelData.value.productions
  const today = new Date().toISOString().split('T')[0]

  const productionsToday = productions.filter((p: any) => p.date === today)
  const productionsEnCours = productionsToday.filter((p: any) => p.statut === 'en_cours')
  const productionsTerminees = productionsToday.filter((p: any) => p.statut === 'termine')

  return {
    total: productions.length,
    enCours: productionsEnCours.length,
    terminees: productionsTerminees.length,
    aujourdhui: productionsToday.length,
    productionsRecentes: productions.slice(-5).reverse()
  }
})

const articlesOverview = computed(() => {
  const stock = laravelData.value.articles
  const totalArticles = stock.length
  const articlesActifs = stock.filter((a: any) => a.actif).length
  const articlesCritiques = stock.filter((a: any) => a.stock <= a.seuilCritique).length
  const stockTotal = stock.reduce((sum: any, a: any) => sum + a.stock, 0)

  return {
    total: totalArticles,
    actifs: articlesActifs,
    critiques: articlesCritiques,
    stockTotal,
    topArticles: stock.sort((a: any, b: any) => b.stock - a.stock).slice(0, 5)
  }
})

const livraisonsOverview = computed(() => {
  const livraisons = laravelData.value.livraisons
  const commandes = laravelData.value.commandes

  const livraisonsEnAttente = livraisons.filter((l: any) => l.statut === 'en_attente').length
  const livraisonsEnCours = livraisons.filter((l: any) => l.statut === 'en_cours').length
  const livraisonsTerminees = livraisons.filter((l: any) => l.statut === 'livre').length

  const commandesEnAttente = commandes.filter((c: any) => c.statut === 'en_attente').length
  const commandesConfirmees = commandes.filter((c: any) => c.statut === 'confirmee').length

  return {
    livraisons: {
      total: livraisons.length,
      enAttente: livraisonsEnAttente,
      enCours: livraisonsEnCours,
      terminees: livraisonsTerminees,
      recentes: livraisons.slice(-5).reverse()
    },
    commandes: {
      total: commandes.length,
      enAttente: commandesEnAttente,
      confirmees: commandesConfirmees,
      recentes: commandes.slice(-5).reverse()
    }
  }
})

// Lifecycle
onMounted(() => {
  console.log('🚀 [HomeView] onMounted - Chargement des données Laravel')
  loadLaravelData()
})

</script>

<template>
  <div class="dashboard-container">
    <!-- Header moderne -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-main">
          <div class="flex items-center">
            <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 class="page-title">Tableau de Bord</h1>
              <p class="page-subtitle">Vue d'ensemble de votre production et livraisons</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <div class="flex items-center">
                <div class="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span>Système opérationnel</span>
              </div>
              <div v-if="loading" class="flex items-center">
                <div class="h-2 w-2 bg-blue-500 rounded-full mr-2 animate-spin"></div>
                <span>Chargement Laravel...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">

    <!-- KPI Cards améliorés -->
    <div class="stats-grid">
      <!-- Production journalière -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-wrapper stat-orange">
            <CubeIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">Production journalière</dt>
            <dd class="stat-value">{{ kpiData.production.value.toLocaleString() }}</dd>
            <dd class="stat-unit">articles</dd>
          </div>
          <div v-if="kpiData.production.change !== 0" class="stat-trend">
            <component
              :is="getTrendIcon(kpiData.production.trend)"
              v-if="getTrendIcon(kpiData.production.trend)"
              class="h-4 w-4"
              :class="getTrendColor(kpiData.production.trend)"
            />
            <span class="text-xs font-medium" :class="getTrendColor(kpiData.production.trend)">
              {{ Math.abs(kpiData.production.change) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Articles produits -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-wrapper stat-blue">
            <ArchiveBoxIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">Articles produits</dt>
            <dd class="stat-value">{{ kpiData.articlesProduits.value.toLocaleString() }}</dd>
            <dd class="stat-unit">total</dd>
          </div>
        </div>
      </div>

      <!-- Livraisons -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-wrapper stat-green">
            <TruckIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">Livraisons en cours</dt>
            <dd class="stat-value">{{ kpiData.livraisons.value }}</dd>
            <dd class="stat-unit">commandes</dd>
          </div>
        </div>
      </div>

      <!-- Stock critique -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-wrapper stat-red">
            <ExclamationTriangleIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">Alertes stock</dt>
            <dd class="stat-value">{{ kpiData.stockCritique.value }}</dd>
            <dd class="stat-unit">articles</dd>
          </div>
          <div class="stat-badge">
            <span class="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
              Seuil critique
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques et Alertes -->
    <div class="charts-section">
      <!-- Graphique de production -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="flex items-center">
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mr-3 shadow-lg">
              <ChartBarIcon class="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 class="chart-title">Production de la semaine</h3>
              <p class="chart-subtitle">Évolution des volumes produits</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-orange-500 rounded-full mr-2 shadow-sm"></div>
              <span class="text-sm text-gray-600 font-medium">Production totale</span>
            </div>
          </div>
        </div>
        <div class="chart-content">
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
      </div>

      <!-- Alertes et notifications -->
      <div class="alerts-card">
        <div class="alerts-header">
          <div class="flex items-center">
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
              <ExclamationTriangleIcon class="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 class="chart-title">Alertes récentes</h3>
              <p class="chart-subtitle">Notifications système</p>
            </div>
          </div>
        </div>

        <div class="alerts-content">
          <div
            v-for="alerte in alertes"
            :key="alerte.id"
            class="alert-item"
            :class="{
              'alert-warning': alerte.type === 'warning',
              'alert-info': alerte.type === 'info'
            }"
          >
            <div
              class="alert-indicator"
              :class="{
                'bg-red-500': alerte.type === 'warning',
                'bg-blue-500': alerte.type === 'info'
              }"
            ></div>
            <div class="alert-content">
              <p class="alert-message">{{ alerte.message }}</p>
              <p class="alert-time">{{ alerte.time }}</p>
            </div>
          </div>
        </div>

        <div class="stock-section">
          <h4 class="stock-title">État du stock</h4>
          <div class="stock-list">
            <div
              v-for="item in stockData"
              :key="item.article"
              class="stock-item"
            >
              <span class="stock-name">{{ item.article }}</span>
              <div class="stock-progress">
                <div class="stock-bar">
                  <div
                    class="stock-fill"
                    :class="{
                      'stock-good': item.stock > item.seuil * 2,
                      'stock-warning': item.stock <= item.seuil * 2 && item.stock > item.seuil,
                      'stock-critical': item.stock <= item.seuil
                    }"
                    :style="{ width: `${Math.min((item.stock / item.seuil) * 50, 100)}%` }"
                  ></div>
                </div>
                <span class="stock-value">{{ item.stock }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vues d'ensemble détaillées -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Vue d'ensemble Production -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <CubeIcon class="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Production</h3>
                <p class="text-sm text-gray-500">Vue d'ensemble des productions</p>
              </div>
            </div>
            <button class="text-orange-600 hover:text-orange-800 p-2">
              <EyeIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ productionOverview.enCours }}</p>
              <p class="text-sm text-gray-600">En cours</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ productionOverview.terminees }}</p>
              <p class="text-sm text-gray-600">Terminées aujourd'hui</p>
            </div>
          </div>
          <div class="space-y-3">
            <h4 class="font-medium text-gray-900 text-sm">Productions récentes</h4>
            <div class="space-y-2">
              <div v-for="production in productionOverview.productionsRecentes.slice(0, 3)" :key="(production as any).id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">Production {{ (production as any).lotId }}</p>
                  <p class="text-xs text-gray-500">{{ new Date((production as any).date).toLocaleDateString('fr-FR') }}</p>
                </div>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full" :class="{
                  'bg-green-100 text-green-800': (production as any).statut === 'termine',
                  'bg-blue-100 text-blue-800': (production as any).statut === 'en_cours',
                  'bg-yellow-100 text-yellow-800': (production as any).statut === 'en_attente'
                }">
                  {{ (production as any).statut === 'termine' ? 'Terminé' : (production as any).statut === 'en_cours' ? 'En cours' : 'En attente' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue d'ensemble Articles/Stock -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ArchiveBoxIcon class="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Articles & Stock</h3>
                <p class="text-sm text-gray-500">Gestion des inventaires</p>
              </div>
            </div>
            <button class="text-blue-600 hover:text-blue-800 p-2">
              <EyeIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ articlesOverview.actifs }}</p>
              <p class="text-sm text-gray-600">Articles actifs</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-red-600">{{ articlesOverview.critiques }}</p>
              <p class="text-sm text-gray-600">Stock critique</p>
            </div>
          </div>
          <div class="space-y-3">
            <h4 class="font-medium text-gray-900 text-sm">Articles en stock</h4>
            <div class="space-y-2">
              <div v-for="article in articlesOverview.topArticles.slice(0, 3)" :key="(article as any).id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ (article as any).nom }}</p>
                  <p class="text-xs text-gray-500">{{ (article as any).unite }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold" :class="{
                    'text-red-600': (article as any).stock <= (article as any).seuilCritique,
                    'text-yellow-600': (article as any).stock <= (article as any).seuilCritique * 2 && (article as any).stock > (article as any).seuilCritique,
                    'text-green-600': (article as any).stock > (article as any).seuilCritique * 2
                  }">{{ (article as any).stock }}</p>
                  <p class="text-xs text-gray-500">{{ (article as any).unite }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue d'ensemble Livraisons -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                <TruckIcon class="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Livraisons</h3>
                <p class="text-sm text-gray-500">Suivi des expéditions</p>
              </div>
            </div>
            <button class="text-green-600 hover:text-green-800 p-2">
              <EyeIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ livraisonsOverview.livraisons.enCours }}</p>
              <p class="text-sm text-gray-600">En cours</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ livraisonsOverview.livraisons.enAttente }}</p>
              <p class="text-sm text-gray-600">En attente</p>
            </div>
          </div>
          <div class="space-y-3">
            <h4 class="font-medium text-gray-900 text-sm">Livraisons récentes</h4>
            <div class="space-y-2">
              <div v-for="livraison in livraisonsOverview.livraisons.recentes.slice(0, 3)" :key="(livraison as any).id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ (livraison as any).client }}</p>
                  <p class="text-xs text-gray-500">#{{ (livraison as any).numeroBL }}</p>
                </div>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full" :class="{
                  'bg-green-100 text-green-800': (livraison as any).statut === 'livre',
                  'bg-blue-100 text-blue-800': (livraison as any).statut === 'en_cours',
                  'bg-yellow-100 text-yellow-800': (livraison as any).statut === 'en_attente'
                }">
                  {{ (livraison as any).statut === 'livre' ? 'Livré' : (livraison as any).statut === 'en_cours' ? 'En cours' : 'En attente' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue d'ensemble Commandes -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <ShoppingCartIcon class="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Commandes</h3>
                <p class="text-sm text-gray-500">Gestion des commandes</p>
              </div>
            </div>
            <button class="text-purple-600 hover:text-purple-800 p-2">
              <EyeIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ livraisonsOverview.commandes.enAttente }}</p>
              <p class="text-sm text-gray-600">En attente</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ livraisonsOverview.commandes.confirmees }}</p>
              <p class="text-sm text-gray-600">Confirmées</p>
            </div>
          </div>
          <div class="space-y-3">
            <h4 class="font-medium text-gray-900 text-sm">Commandes récentes</h4>
            <div class="space-y-2">
              <div v-for="commande in livraisonsOverview.commandes.recentes.slice(0, 3)" :key="(commande as any).id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ (commande as any).client }}</p>
                  <p class="text-xs text-gray-500">#{{ (commande as any).numeroCommande }}</p>
                </div>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full" :class="{
                  'bg-green-100 text-green-800': (commande as any).statut === 'livree',
                  'bg-orange-100 text-orange-800': (commande as any).statut === 'en_preparation',
                  'bg-blue-100 text-blue-800': (commande as any).statut === 'confirmee',
                  'bg-yellow-100 text-yellow-800': (commande as any).statut === 'en_attente'
                }">
                  {{ (commande as any).statut === 'livree' ? 'Livrée' : (commande as any).statut === 'en_preparation' ? 'Préparation' : (commande as any).statut === 'confirmee' ? 'Confirmée' : 'En attente' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="actions-card">
      <div class="actions-header">
        <div class="flex items-center">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mr-3 shadow-lg">
            <Cog6ToothIcon class="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 class="chart-title">Actions rapides</h3>
            <p class="chart-subtitle">Accès direct aux fonctionnalités</p>
          </div>
        </div>
      </div>
      <div class="actions-grid">
        <router-link to="/production" class="action-item action-orange">
          <CubeIcon class="action-icon" />
          <span class="action-label">Nouvelle production</span>
        </router-link>
        <router-link to="/livraison" class="action-item action-green">
          <TruckIcon class="action-icon" />
          <span class="action-label">Gérer livraisons</span>
        </router-link>
        <router-link to="/stock" class="action-item action-blue">
          <ArchiveBoxIcon class="action-icon" />
          <span class="action-label">Gérer le stock</span>
        </router-link>
        <router-link to="/commandes" class="action-item action-purple">
          <ShoppingCartIcon class="action-icon" />
          <span class="action-label">Nouvelle commande</span>
        </router-link>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout principal harmonisé avec LivraisonView */
.dashboard-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.dashboard-header {
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  border: 1px solid #bfdbfe;
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
}

.header-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

@media (min-width: 640px) {
  .header-content {
    padding: 2rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .header-content {
    padding: 2rem 2rem;
  }
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.main-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 640px) {
  .main-content {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .main-content {
    padding: 0 2rem;
  }
}

/* KPI Cards harmonisés */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 1.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.stat-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.stat-icon-wrapper {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stat-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.stat-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-icon {
  height: 1.25rem;
  width: 1.25rem;
  color: #ffffff;
}

.stat-details {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.stat-unit {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
  margin-top: 0.25rem;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.stat-badge {
  margin-top: 0.75rem;
}

/* Graphiques et Alertes */
.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .charts-section {
    grid-template-columns: 2fr 1fr;
  }
}

.chart-card,
.alerts-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-card:hover,
.alerts-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.chart-header,
.alerts-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.chart-content {
  padding: 1.5rem;
}

.alerts-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.alert-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
}

.alert-info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.alert-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-top: 0.5rem;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.alert-content {
  flex: 1;
}

.alert-message {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}

.alert-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.stock-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.stock-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.stock-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stock-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stock-name {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.stock-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-bar {
  width: 4rem;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.stock-good {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stock-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stock-critical {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stock-value {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 2rem;
  text-align: right;
}

/* Actions rapides */
.actions-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.actions-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.actions-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.actions-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .actions-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
  text-decoration: none;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.action-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.action-orange {
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  border-color: #fb923c;
}

.action-orange:hover {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
}

.action-green {
  background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
  border-color: #4ade80;
}

.action-green:hover {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
}

.action-blue {
  background: linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%);
  border-color: #60a5fa;
}

.action-blue:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
}

.action-purple {
  background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%);
  border-color: #c084fc;
}

.action-purple:hover {
  background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
}

.action-icon {
  height: 2rem;
  width: 2rem;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
}

.action-orange .action-icon {
  color: #ea580c;
}

.action-green .action-icon {
  color: #059669;
}

.action-blue .action-icon {
  color: #2563eb;
}

.action-purple .action-icon {
  color: #9333ea;
}

.action-label {
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
}

.action-orange .action-label {
  color: #c2410c;
}

.action-green .action-label {
  color: #047857;
}

.action-blue .action-label {
  color: #1e40af;
}

.action-purple .action-label {
  color: #7c2d12;
}

/* Responsive */
@media (max-width: 640px) {
  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.875rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0 0.75rem;
  }

  .header-content {
    padding: 1.5rem 0.75rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
