<template>
  <div class="dashboard-container">
    <!-- Debug info -->
    <div style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
      <strong>Debug Dashboard:</strong> Composant chargé - {{ new Date().toLocaleTimeString() }}
      <br>
      <strong>Données chargées:</strong>
      <ul>
        <li>Commandes: {{ commandes.length }}</li>
        <li>Livraisons: {{ livraisons.length }}</li>
        <li>Stats: {{ JSON.stringify(stats) }}</li>
      </ul>
      <div v-if="commandes.length > 0">
        <strong>Première commande:</strong> {{ JSON.stringify(commandes[0]) }}
      </div>
      <div v-if="livraisons.length > 0">
        <strong>Première livraison:</strong> {{ JSON.stringify(livraisons[0]) }}
      </div>
    </div>
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div>
          <h1 class="dashboard-title">Tableau de bord</h1>
          <p class="dashboard-subtitle">Vue d'ensemble de votre activité</p>
        </div>
        <div class="header-actions">
          <button 
            @click="refreshData" 
            :disabled="loading"
            class="refresh-button"
            title="Actualiser les données"
          >
            <svg v-if="!loading" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else class="animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats principales -->
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalArticles || 0 }}</div>
          <div class="stat-label">Articles en stock</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalCommandes || 0 }}</div>
          <div class="stat-label">Commandes</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalLivraisons || 0 }}</div>
          <div class="stat-label">Livraisons</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalProductions || 0 }}</div>
          <div class="stat-label">Productions</div>
        </div>
      </div>
    </div>

    <!-- Nouvelles statistiques détaillées -->
    <div class="dashboard-stats">
      <!-- Stock critique -->
      <div class="stat-card bg-red-50 border-red-200">
        <div class="stat-icon text-red-600">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value text-red-600">{{ stockInfo.stockCritique || 0 }}</div>
          <div class="stat-label text-red-700">Stock Critique</div>
        </div>
      </div>

      <!-- Valeur totale du stock -->
      <div class="stat-card bg-green-50 border-green-200">
        <div class="stat-icon text-green-600">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value text-green-600">{{ (stockInfo.valeurTotale || 0).toLocaleString() }} FCFA</div>
          <div class="stat-label text-green-700">Valeur Stock</div>
        </div>
      </div>

      <!-- Productions du jour -->
      <div class="stat-card bg-blue-50 border-blue-200">
        <div class="stat-icon text-blue-600">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value text-blue-600">{{ productionsDuJour.total || 0 }}</div>
          <div class="stat-label text-blue-700">Productions Aujourd'hui</div>
        </div>
      </div>

      <!-- Livraisons récentes -->
      <div class="stat-card bg-purple-50 border-purple-200">
        <div class="stat-icon text-purple-600">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value text-purple-600">{{ livraisonsRecentes.total || 0 }}</div>
          <div class="stat-label text-purple-700">Livraisons Récentes</div>
        </div>
      </div>

      <!-- Production par semaine -->
      <div class="stat-card bg-orange-50 border-orange-200">
        <div class="stat-icon text-orange-600">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value text-orange-600">{{ productionParSemaine.totalSemaine || 0 }}</div>
          <div class="stat-label text-orange-700">Production Semaine</div>
        </div>
      </div>
    </div>

    <!-- Détails de la production par semaine -->
    <div v-if="productionParSemaine.parJour" class="dashboard-section">
      <h2 class="section-title">Production par jour de la semaine</h2>
      <div class="week-production-grid">
        <div class="day-card">
          <div class="day-name">Lundi</div>
          <div class="day-count">{{ productionParSemaine.parJour.lundi || 0 }}</div>
        </div>
        <div class="day-card">
          <div class="day-name">Mardi</div>
          <div class="day-count">{{ productionParSemaine.parJour.mardi || 0 }}</div>
        </div>
        <div class="day-card">
          <div class="day-name">Mercredi</div>
          <div class="day-count">{{ productionParSemaine.parJour.mercredi || 0 }}</div>
        </div>
        <div class="day-card">
          <div class="day-name">Jeudi</div>
          <div class="day-count">{{ productionParSemaine.parJour.jeudi || 0 }}</div>
        </div>
        <div class="day-card">
          <div class="day-name">Vendredi</div>
          <div class="day-count">{{ productionParSemaine.parJour.vendredi || 0 }}</div>
        </div>
        <div class="day-card">
          <div class="day-name">Samedi</div>
          <div class="day-count">{{ productionParSemaine.parJour.samedi || 0 }}</div>
        </div>
        <div class="day-card">
          <div class="day-name">Dimanche</div>
          <div class="day-count">{{ productionParSemaine.parJour.dimanche || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="error-message">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
      <button @click="refreshData" class="retry-button">Réessayer</button>
    </div>

    <!-- Graphiques et détails -->
    <div v-if="!error" class="dashboard-content">
      <!-- Commandes récentes -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Commandes récentes</h2>
          <router-link to="/commandes" class="section-link">Voir toutes</router-link>
        </div>
        <div class="section-content">
          <div v-if="recentCommandes.length === 0" class="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Aucune commande récente</p>
          </div>
          <div v-else class="commande-list">
            <div
              v-for="commande in recentCommandes"
              :key="commande.id"
              class="commande-item"
            >
              <div class="commande-info">
                <div class="commande-numero">{{ commande.numero_commande || commande.numeroCommande }}</div>
                <div class="commande-client">{{ commande.client }}</div>
              </div>
              <div class="commande-details">
                <span :class="`statut-badge statut-${commande.statut}`">
                  {{ getStatutLabel(commande.statut) }}
                </span>
                <div class="commande-date">{{ formatDate(commande.date) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Livraisons en cours -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Livraisons en cours</h2>
          <router-link to="/livraisons" class="section-link">Voir toutes</router-link>
        </div>
        <div class="section-content">
          <div v-if="livraisonsEnCours.length === 0" class="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p>Aucune livraison en cours</p>
          </div>
          <div v-else class="livraison-list">
            <div
              v-for="livraison in livraisonsEnCours"
              :key="livraison.id"
              class="livraison-item"
            >
              <div class="livraison-info">
                <div class="livraison-numero">{{ livraison.numero_bl || livraison.numeroBl }}</div>
                <div class="livraison-client">{{ livraison.client }}</div>
              </div>
              <div class="livraison-details">
                <span :class="`statut-badge statut-${livraison.statut}`">
                  {{ getStatutLabel(livraison.statut) }}
                </span>
                <div class="livraison-date">{{ formatDate(livraison.date) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analyses récentes -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Analyses récentes</h2>
          <router-link to="/analyses" class="section-link">Voir toutes</router-link>
        </div>
        <div class="section-content">
          <div v-if="recentAnalyses.length === 0" class="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Aucune analyse récente</p>
          </div>
          <div v-else class="analyse-list">
            <div
              v-for="analyse in recentAnalyses"
              :key="analyse.id"
              class="analyse-item"
            >
              <div class="analyse-info">
                <div class="analyse-nom">{{ analyse.nom }}</div>
                <div class="analyse-type">{{ getTypeLabel(analyse.type) }}</div>
              </div>
              <div class="analyse-details">
                <span :class="`statut-badge statut-${analyse.statut}`">
                  {{ getStatutLabel(analyse.statut) }}
                </span>
                <div class="analyse-date">{{ formatDate(analyse.dateDebut) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLaravelApi, type LaravelCommande, type LaravelLivraison } from '@/services/laravelApiService'

const {
  getDashboardStats,
  getCommandes,
  getLivraisons
} = useLaravelApi()

console.log('🔧 [DashboardView] Service Laravel importé:', {
  getDashboardStats: !!getDashboardStats,
  getCommandes: !!getCommandes,
  getLivraisons: !!getLivraisons,
  getAnalyses: !!getAnalyses
})

// État réactif
const stats = ref<any>({})
const commandes = ref<LaravelCommande[]>([])
const livraisons = ref<LaravelLivraison[]>([])
const analyses = ref<any[]>([])
const stockInfo = ref<any>({})
const productionsDuJour = ref<any>({})
const livraisonsRecentes = ref<any>({})
const productionParSemaine = ref<any>({})
const loading = ref(false)
const error = ref<string | null>(null)

// Computed
const recentCommandes = computed(() => 
  commandes.value
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
)

const livraisonsEnCours = computed(() => 
  livraisons.value
    .filter(l => l.statut === 'en_cours' || l.statut === 'en_attente' || l.statut === 'en_preparation')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
)

const recentAnalyses = computed(() => 
  analyses.value
    .sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
    .slice(0, 5)
)

// Méthodes
const loadDashboardData = async () => {
  console.log('🚀 [DashboardView] loadDashboardData() - FONCTION APPELÉE')
  loading.value = true
  error.value = null
  
  try {
    console.log('🔍 [DashboardView] Chargement des données du dashboard...')
    console.log('🔍 [DashboardView] Vérification du mode Supabase...')
    
    // Mode Laravel - plus besoin de test Supabase
    console.log('📡 [DashboardView] Mode Laravel activé - Connexion au backend Laravel')
    
    // Charger les statistiques du dashboard
    console.log('🔍 [DashboardView] Appel de getDashboardStats()...')
    const dashboardStats = await getDashboardStats()
    console.log('📊 [DashboardView] Réponse de getDashboardStats:', dashboardStats)
    
    stats.value = {
      totalArticles: dashboardStats.totalArticles || 0,
      totalCommandes: dashboardStats.totalCommandes || 0,
      totalLivraisons: dashboardStats.totalLivraisons || 0,
      totalProductions: dashboardStats.totalProductions || 0
    }
    console.log('✅ [DashboardView] Stats mappées:', stats.value)
    
    // Charger les commandes récentes
    console.log('🔍 [DashboardView] Appel de getCommandes()...')
    const allCommandes = await getCommandes()
    commandes.value = allCommandes
    console.log('✅ [DashboardView] Commandes chargées:', commandes.value.length)
    console.log('📋 [DashboardView] Première commande:', allCommandes[0])
    console.log('📋 [DashboardView] Structure commande:', allCommandes[0] ? Object.keys(allCommandes[0]) : 'Aucune commande')
    
    // Charger les livraisons
    console.log('🔍 [DashboardView] Appel de getLivraisons()...')
    const allLivraisons = await getLivraisons()
    livraisons.value = allLivraisons
    console.log('✅ [DashboardView] Livraisons chargées:', livraisons.value.length)
    console.log('📦 [DashboardView] Première livraison:', allLivraisons[0])
    console.log('📦 [DashboardView] Structure livraison:', allLivraisons[0] ? Object.keys(allLivraisons[0]) : 'Aucune livraison')
    
           // Analyses - pour l'instant vide car pas d'endpoint spécifique
           console.log('🔍 [DashboardView] Analyses non disponibles pour le moment')
           analyses.value = []
           
           // Stock - calculé à partir des articles
           console.log('🔍 [DashboardView] Calcul du stock à partir des articles...')
           stockInfo.value = {
             totalArticles: stats.value.totalArticles,
             stockCritique: 0 // Sera calculé plus tard
           }
           
           // Productions du jour - pour l'instant vide car pas d'endpoint spécifique
           console.log('🔍 [DashboardView] Productions du jour non disponibles pour le moment')
           productionsDuJour.value = {}
           console.log('✅ [DashboardView] Productions du jour initialisées')
           
           // Calculer les livraisons récentes depuis les données chargées
           console.log('🔍 [DashboardView] Calcul des livraisons récentes...')
           const recentLivraisons = livraisons.value
             .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
             .slice(0, 5)
           livraisonsRecentes.value = { total: recentLivraisons.length }
           console.log('✅ [DashboardView] Livraisons récentes calculées:', livraisonsRecentes.value)
           
           // Calculer la production par semaine depuis les données chargées
           console.log('🔍 [DashboardView] Calcul de la production par semaine...')
           const allProductions = await getProductions()
           const now = new Date()
           const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1))
           const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7))
           
           const productionsSemaine = allProductions.filter(p => {
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
           
           productionParSemaine.value = {
             totalSemaine: productionsSemaine.length,
             parJour
           }
           console.log('✅ [DashboardView] Production par semaine calculée:', productionParSemaine.value)
           
         } catch (err) {
    console.error('❌ [DashboardView] Erreur lors du chargement des données:', err)
    error.value = 'Erreur lors du chargement des données'
    
    // En cas d'erreur, initialiser avec des valeurs par défaut
    stats.value = {
      totalArticles: 0,
      totalCommandes: 0,
      totalLivraisons: 0,
      totalProductions: 0
    }
    commandes.value = []
    livraisons.value = []
    analyses.value = []
  } finally {
    loading.value = false
  }
}

// Fonction de rafraîchissement
const refreshData = async () => {
  console.log('🔄 [DashboardView] Rafraîchissement des données...')
  await loadDashboardData()
}

const getStatutLabel = (statut: string) => {
  const labels: Record<string, string> = {
    'en_attente': 'En attente',
    'confirmee': 'Confirmée',
    'en_preparation': 'En préparation',
    'livree': 'Livrée',
    'annulee': 'Annulée',
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'annule': 'Annulé'
  }
  return labels[statut] || statut
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'qualite': 'Qualité',
    'performance': 'Performance',
    'cout': 'Coût',
    'rendement': 'Rendement',
    'autre': 'Autre'
  }
  return labels[type] || type
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

// Lifecycle
onMounted(() => {
  console.log('🚀 [DashboardView] onMounted - Début du chargement du dashboard')
  console.log('🚀 [DashboardView] Appel de loadDashboardData()')
  loadDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.refresh-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.week-production-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.day-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: all 0.2s;
}

.day-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.day-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.day-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #991b1b;
  margin-bottom: 2rem;
}

.error-message svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.retry-button {
  margin-left: auto;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #b91c1c;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.dashboard-section {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.section-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.section-link:hover {
  text-decoration: underline;
}

.section-content {
  padding: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-state svg {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: #d1d5db;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.commande-list,
.livraison-list,
.analyse-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.commande-item,
.livraison-item,
.analyse-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.commande-info,
.livraison-info,
.analyse-info {
  flex: 1;
}

.commande-numero,
.livraison-numero,
.analyse-nom {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.commande-client,
.livraison-client,
.analyse-type {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.commande-details,
.livraison-details,
.analyse-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.statut-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.statut-en_attente {
  background: #fef3c7;
  color: #92400e;
}

.statut-confirmee {
  background: #dbeafe;
  color: #1e40af;
}

.statut-en_preparation {
  background: #fef3c7;
  color: #92400e;
}

.statut-livree {
  background: #d1fae5;
  color: #065f46;
}

.statut-annulee,
.statut-annule {
  background: #fee2e2;
  color: #991b1b;
}

.statut-en_cours {
  background: #dbeafe;
  color: #1e40af;
}

.statut-termine {
  background: #d1fae5;
  color: #065f46;
}

.commande-date,
.livraison-date,
.analyse-date {
  color: #6b7280;
  font-size: 0.75rem;
}
</style>