<script setup lang="ts">
import { ref, computed } from 'vue'
import { storageService } from '../services/storage'
import {
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CubeIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BanknotesIcon,
  ChartPieIcon,
  CalendarDaysIcon
} from '@heroicons/vue/24/outline'
import BarChart from '../components/charts/BarChart.vue'
import LineChart from '../components/charts/LineChart.vue'
import PieChart from '../components/charts/PieChart.vue'

// Données de production calculées dynamiquement depuis les articles
const productionData = computed(() => {
  const articles = storageService.getStock()
  const articlesActifs = articles.filter(a => a.actif)
  
  // Générer les 6 derniers mois
  const mois = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const moisLabel = date.toLocaleDateString('fr-FR', { month: 'short' })
    
    const donneesMois = {
      mois: moisLabel,
      production: 0,
      livraisons: 0
    }
    
    // Calculer la production totale pour tous les articles actifs
    articlesActifs.forEach(article => {
      const stats = storageService.getStatistiquesProductionArticle(article.id, 'mois')
      donneesMois.production += stats.totalProduit
    })
    
    // Calculer les vraies livraisons du mois
    const commandes = storageService.getCommandes()
    const livraisonsMois = commandes.filter(commande => {
      const dateCommande = new Date(commande.date)
      return dateCommande.getMonth() === date.getMonth() && 
             dateCommande.getFullYear() === date.getFullYear()
    }).length
    
    donneesMois.livraisons = livraisonsMois
    
    mois.push(donneesMois)
  }
  
  return mois
})

// Données de stock calculées dynamiquement depuis les articles
const stockData = computed(() => {
  const articles = storageService.getStock()
  const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4']
  
  return articles.map((article, index) => ({
    label: article.nom,
    value: article.stock * article.prix,
    color: colors[index % colors.length]
  }))
})

const performanceData = ref([
  { jour: 'Lun', production: 1200, objectif: 1000 },
  { jour: 'Mar', production: 1350, objectif: 1000 },
  { jour: 'Mer', production: 1100, objectif: 1000 },
  { jour: 'Jeu', production: 1400, objectif: 1000 },
  { jour: 'Ven', production: 1300, objectif: 1000 },
  { jour: 'Sam', production: 800, objectif: 600 },
  { jour: 'Dim', production: 600, objectif: 600 }
])

// KPIs calculés avec des données exactes et précises
const kpis = computed(() => {
  const articles = storageService.getStock()
  const productions = storageService.getProductions()
  const livraisons = storageService.getLivraisons()
  const commandes = storageService.getCommandes()

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const lastMonth = new Date(currentYear, currentMonth - 1, 1)

  // 1. Production mensuelle exacte
  const productionsCurrentMonth = productions.filter(p => {
    const prodDate = new Date(p.date)
    return prodDate.getMonth() === currentMonth && prodDate.getFullYear() === currentYear
  })

  const productionMensuelle = productionsCurrentMonth.reduce((total, prod) => {
    return total + prod.articlesProduits.reduce((sum, art) => sum + art.quantiteProduite, 0)
  }, 0)

  const productionsLastMonth = productions.filter(p => {
    const prodDate = new Date(p.date)
    return prodDate.getMonth() === lastMonth.getMonth() && prodDate.getFullYear() === lastMonth.getFullYear()
  })

  const productionMoisPrecedent = productionsLastMonth.reduce((total, prod) => {
    return total + prod.articlesProduits.reduce((sum, art) => sum + art.quantiteProduite, 0)
  }, 0)

  const evolutionProduction = productionMoisPrecedent > 0 ?
    ((productionMensuelle - productionMoisPrecedent) / productionMoisPrecedent) * 100 : 0

  // 2. Livraisons mensuelles exactes
  const livraisonsCurrentMonth = livraisons.filter(l => {
    const livrDate = new Date(l.date)
    return livrDate.getMonth() === currentMonth && livrDate.getFullYear() === currentYear
  })

  const livraisonsMensuelles = livraisonsCurrentMonth.length
  const livraisonsTerminees = livraisonsCurrentMonth.filter(l => l.statut === 'livre').length
  const tauxReussiteLivraison = livraisonsMensuelles > 0 ? (livraisonsTerminees / livraisonsMensuelles) * 100 : 0

  // 3. Valeur stock exacte
  const valeurStock = articles.reduce((total, article) => {
    return total + (article.stock * article.prix)
  }, 0)

  // 4. Chiffre d'affaires mensuel
  const chiffreAffairesMensuel = livraisonsCurrentMonth
    .filter(l => l.statut === 'livre')
    .reduce((total, livraison) => total + (livraison.totalLivraison || 0), 0)

  // 5. Rendement moyen exact
  const productionsTerminees = productionsCurrentMonth.filter(p => p.statut === 'termine')
  const rendementMoyen = productionsTerminees.length > 0 ?
    productionsTerminees.reduce((sum, p) => sum + (p.rendement || 0), 0) / productionsTerminees.length : 0

  // 6. Coût de production mensuel
  const coutProductionMensuel = productionsCurrentMonth.reduce((total, prod) => {
    return total + (prod.coutProduction || 0)
  }, 0)

  // 7. Articles critiques
  const articlesCritiques = articles.filter(a => a.stock <= a.seuilCritique).length

  // 8. Temps de production moyen
  const tempsProductionMoyen = productionsTerminees.length > 0 ?
    productionsTerminees.reduce((sum, p) => sum + (p.tempsEffectif || 0), 0) / productionsTerminees.length : 0

  return {
    productionMensuelle,
    evolutionProduction: Math.round(evolutionProduction * 100) / 100,
    livraisonsMensuelles,
    tauxReussiteLivraison: Math.round(tauxReussiteLivraison * 100) / 100,
    valeurStock,
    chiffreAffairesMensuel,
    rendementMoyen: Math.round(rendementMoyen * 100) / 100,
    coutProductionMensuel,
    articlesCritiques,
    tempsProductionMoyen: Math.round(tempsProductionMoyen / 60 * 100) / 100, // en heures
    margeNette: chiffreAffairesMensuel - coutProductionMensuel,
    productiviteJournaliere: productionsTerminees.length > 0 ? Math.round(productionMensuelle / productionsTerminees.length) : 0
  }
})
</script>

<template>
  <div class="analyses-container">
    <!-- Header moderne -->
    <div class="analyses-header">
      <div class="header-content">
        <div class="header-main">
          <div class="flex items-center">
            <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg">
              <ChartBarIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="page-title">Analyses & Rapports</h1>
              <p class="page-subtitle">Tableaux de bord et métriques avancées</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <div class="flex items-center">
                <CalendarDaysIcon class="h-4 w-4 mr-2" />
                <span>{{ new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">

    <!-- KPI Principaux modernisés -->
    <div class="stats-grid">
      <!-- Production mensuelle -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-wrapper stat-orange">
            <CubeIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">Production mensuelle</dt>
            <dd class="stat-value">{{ kpis.productionMensuelle.toLocaleString() }}</dd>
            <dd class="stat-unit">articles</dd>
          </div>
          <div v-if="kpis.evolutionProduction !== 0" class="stat-trend">
            <component
              :is="kpis.evolutionProduction > 0 ? ArrowUpIcon : ArrowDownIcon"
              class="h-4 w-4"
              :class="kpis.evolutionProduction > 0 ? 'text-green-600' : 'text-red-600'"
            />
            <span class="text-xs font-medium" :class="kpis.evolutionProduction > 0 ? 'text-green-600' : 'text-red-600'">
              {{ Math.abs(kpis.evolutionProduction) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Chiffre d'affaires -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-wrapper stat-green">
            <CurrencyDollarIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">Chiffre d'affaires</dt>
            <dd class="stat-value">{{ kpis.chiffreAffairesMensuel.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</dd>
            <dd class="stat-unit">ce mois</dd>
          </div>
        </div>
      </div>

      <!-- Livraisons -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-wrapper stat-blue">
            <TruckIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">Livraisons</dt>
            <dd class="stat-value">{{ kpis.livraisonsMensuelles }}</dd>
            <dd class="stat-unit">{{ kpis.tauxReussiteLivraison }}% réussies</dd>
          </div>
          <div class="stat-badge">
            <CheckCircleIcon class="h-4 w-4 text-green-600" />
          </div>
        </div>
      </div>

      <!-- Rendement moyen -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-wrapper stat-purple">
            <ChartPieIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">Rendement moyen</dt>
            <dd class="stat-value">{{ kpis.rendementMoyen }}%</dd>
            <dd class="stat-unit">efficacité</dd>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Secondaires -->
    <div class="secondary-stats-grid">
      <!-- Valeur stock -->
      <div class="secondary-stat-card">
        <div class="secondary-stat-content">
          <div class="secondary-stat-icon stat-indigo">
            <BanknotesIcon class="h-5 w-5 text-white" />
          </div>
          <div>
            <p class="secondary-stat-label">Valeur stock</p>
            <p class="secondary-stat-value">{{ kpis.valeurStock.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
          </div>
        </div>
      </div>

      <!-- Articles critiques -->
      <div class="secondary-stat-card">
        <div class="secondary-stat-content">
          <div class="secondary-stat-icon stat-red">
            <ExclamationTriangleIcon class="h-5 w-5 text-white" />
          </div>
          <div>
            <p class="secondary-stat-label">Articles critiques</p>
            <p class="secondary-stat-value">{{ kpis.articlesCritiques }}</p>
          </div>
        </div>
      </div>

      <!-- Temps production -->
      <div class="secondary-stat-card">
        <div class="secondary-stat-content">
          <div class="secondary-stat-icon stat-yellow">
            <ClockIcon class="h-5 w-5 text-white" />
          </div>
          <div>
            <p class="secondary-stat-label">Temps moyen</p>
            <p class="secondary-stat-value">{{ kpis.tempsProductionMoyen }}h</p>
          </div>
        </div>
      </div>

      <!-- Marge nette -->
      <div class="secondary-stat-card">
        <div class="secondary-stat-content">
          <div class="secondary-stat-icon" :class="kpis.margeNette >= 0 ? 'stat-green' : 'stat-red'">
            <CurrencyDollarIcon class="h-5 w-5 text-white" />
          </div>
          <div>
            <p class="secondary-stat-label">Marge nette</p>
            <p class="secondary-stat-value" :class="kpis.margeNette >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ kpis.margeNette.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques modernisés -->
    <div class="charts-section">
      <!-- Production mensuelle -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="flex items-center">
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mr-3 shadow-lg">
              <ChartBarIcon class="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 class="chart-title">Évolution production mensuelle</h3>
              <p class="chart-subtitle">Comparaison production vs livraisons</p>
            </div>
          </div>
        </div>
        <div class="chart-content">
          <BarChart
            :data="productionData"
            :labels="productionData.map(item => item.mois)"
            :datasets="[
              {
                label: 'Production totale',
                data: productionData.map(item => item.production),
                backgroundColor: '#f97316'
              },
              {
                label: 'Livraisons',
                data: productionData.map(item => item.livraisons),
                backgroundColor: '#3b82f6'
              }
            ]"
            :height="256"
          />
        </div>
      </div>

      <!-- Performance hebdomadaire -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="flex items-center">
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-lg">
              <ChartPieIcon class="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 class="chart-title">Performance hebdomadaire</h3>
              <p class="chart-subtitle">Production vs objectifs</p>
            </div>
          </div>
        </div>
        <div class="chart-content">
          <LineChart
            :data="performanceData"
            :labels="performanceData.map(item => item.jour)"
            :datasets="[
              {
                label: 'Production',
                data: performanceData.map(item => item.production),
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderWidth: 3,
                fill: true
              },
              {
                label: 'Objectif',
                data: performanceData.map(item => item.objectif),
                borderColor: '#6b7280',
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                borderWidth: 2,
                fill: false
              }
            ]"
            :height="256"
          />
        </div>
      </div>
    </div>

    <!-- Répartition stock modernisée -->
    <div class="chart-card">
      <div class="chart-header">
        <div class="flex items-center">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-3 shadow-lg">
            <ChartPieIcon class="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 class="chart-title">Répartition de la valeur stock</h3>
            <p class="chart-subtitle">Distribution par articles</p>
          </div>
        </div>
      </div>
      <div class="chart-content">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChart
            :data="stockData"
            :height="256"
          />

          <div class="stock-legend">
            <div v-for="item in stockData" :key="item.label" class="stock-legend-item">
              <div class="flex items-center">
                <div class="stock-legend-color" :style="{ backgroundColor: item.color }"></div>
                <span class="stock-legend-label">{{ item.label }}</span>
              </div>
              <span class="stock-legend-value">{{ item.value.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau récapitulatif modernisé -->
    <div class="table-card">
      <div class="table-header">
        <div class="flex items-center">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center mr-3 shadow-lg">
            <CalendarDaysIcon class="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 class="chart-title">Récapitulatif mensuel</h3>
            <p class="chart-subtitle">Évolution des performances</p>
          </div>
        </div>
      </div>
      <div class="table-content">
        <table class="performance-table">
          <thead class="table-head">
            <tr>
              <th class="table-header-cell">Mois</th>
              <th class="table-header-cell">Production totale</th>
              <th class="table-header-cell">Livraisons</th>
              <th class="table-header-cell">Taux réussite</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr v-for="item in productionData" :key="item.mois" class="table-row">
              <td class="table-cell table-cell-primary">{{ item.mois }}</td>
              <td class="table-cell">{{ item.production.toLocaleString() }}</td>
              <td class="table-cell">{{ item.livraisons }}</td>
              <td class="table-cell">
                <span class="performance-badge" :class="{
                  'performance-badge-excellent': (item.livraisons / Math.max(item.production, 1)) * 100 >= 90,
                  'performance-badge-good': (item.livraisons / Math.max(item.production, 1)) * 100 >= 70 && (item.livraisons / Math.max(item.production, 1)) * 100 < 90,
                  'performance-badge-average': (item.livraisons / Math.max(item.production, 1)) * 100 < 70
                }">
                  {{ item.production > 0 ? Math.round((item.livraisons / item.production) * 100) : 0 }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout principal harmonisé */
.analyses-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.analyses-header {
  background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%);
  border: 1px solid #d8b4fe;
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

/* KPI Cards principaux */
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

.stat-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* KPI Secondaires */
.secondary-stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .secondary-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .secondary-stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.secondary-stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.secondary-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.secondary-stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.secondary-stat-icon {
  height: 2rem;
  width: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.stat-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.stat-red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-yellow {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.secondary-stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.secondary-stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-top: 0.25rem;
}

/* Graphiques */
.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .charts-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

.chart-card,
.table-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-card:hover,
.table-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.chart-header,
.table-header {
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

.chart-content,
.table-content {
  padding: 1.5rem;
}

/* Légende du stock */
.stock-legend {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stock-legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.stock-legend-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stock-legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  margin-right: 0.75rem;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.stock-legend-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.stock-legend-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #059669;
}

/* Tableau des performances */
.performance-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table-head {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.table-header-cell {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
}

.table-header-cell:first-child {
  border-top-left-radius: 0.5rem;
}

.table-header-cell:last-child {
  border-top-right-radius: 0.5rem;
}

.table-body {
  background-color: #ffffff;
}

.table-row {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.table-row:hover {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: #374151;
  white-space: nowrap;
}

.table-cell-primary {
  font-weight: 600;
  color: #111827;
}

.performance-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
}

.performance-badge-excellent {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #34d399;
}

.performance-badge-good {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #f59e0b;
}

.performance-badge-average {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #f87171;
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

  .secondary-stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .table-content {
    overflow-x: auto;
  }

  .performance-table {
    min-width: 600px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0 0.75rem;
  }

  .header-content {
    padding: 1.5rem 0.75rem;
  }

  .secondary-stat-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .chart-content,
  .table-content {
    padding: 1rem;
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

.stat-card,
.secondary-stat-card,
.chart-card,
.table-card {
  animation: slideIn 0.3s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }
</style>
