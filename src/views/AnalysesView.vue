<script setup lang="ts">
import { ref, computed } from 'vue'
import { storageService } from '../services/storage'
import { 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  MinusIcon
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

// KPIs calculés dynamiquement depuis les articles et la production
const kpis = computed(() => {
  const articles = storageService.getStock()
  const articlesActifs = articles.filter(a => a.actif)
  
  // Calculer la production mensuelle totale
  const productionMensuelle = articlesActifs.reduce((total, article) => {
    const stats = storageService.getStatistiquesProductionArticle(article.id, 'mois')
    return total + stats.totalProduit
  }, 0)
  
  // Calculer la valeur totale du stock
  const valeurStock = articles.reduce((total, article) => {
    return total + (article.stock * article.prix)
  }, 0)
  
  // Calculer le taux de rendement moyen
  const tauxRendement = articlesActifs.length > 0 ? 
    articlesActifs.reduce((total, article) => {
      const stats = storageService.getStatistiquesProductionArticle(article.id, 'mois')
      return total + stats.rendementMoyen
    }, 0) / articlesActifs.length : 0
  
  // Calculer les vraies livraisons mensuelles
  const commandes = storageService.getCommandes()
  const moisCourant = new Date().getMonth()
  const anneeCourante = new Date().getFullYear()
  const livraisonsMensuelles = commandes.filter(commande => {
    const dateCommande = new Date(commande.date)
    return dateCommande.getMonth() === moisCourant && 
           dateCommande.getFullYear() === anneeCourante
  }).length
  
  // Calculer l'évolution de la production (comparaison avec le mois précédent)
  const moisPrecedent = new Date()
  moisPrecedent.setMonth(moisPrecedent.getMonth() - 1)
  const productionMoisPrecedent = articlesActifs.reduce((total, article) => {
    const stats = storageService.getStatistiquesProductionArticle(article.id, 'mois')
    return total + stats.totalProduit
  }, 0)
  
  const evolutionProduction = productionMoisPrecedent > 0 ? 
    ((productionMensuelle - productionMoisPrecedent) / productionMoisPrecedent) * 100 : 0
  
  return {
    productionMensuelle,
    evolutionProduction: Math.round(evolutionProduction * 100) / 100,
    livraisonsMensuelles,
    evolutionLivraisons: 0, // À calculer plus tard si nécessaire
    valeurStock,
    evolutionStock: 0, // À calculer plus tard si nécessaire
    tauxRendement: Math.round(tauxRendement * 100) / 100,
    evolutionRendement: 0 // À calculer plus tard si nécessaire
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Analyses & Rapports</h2>
      <p class="mt-2 text-gray-600">Tableaux de bord et analyses détaillées</p>
    </div>

        <!-- KPI Principaux -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Production mensuelle</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpis.productionMensuelle.toLocaleString() }}</p>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">articles</span>
              <span v-if="kpis.evolutionProduction !== 0" 
                    :class="kpis.evolutionProduction > 0 ? 'text-green-600' : 'text-red-600'"
                    class="text-xs font-medium">
                {{ kpis.evolutionProduction > 0 ? '+' : '' }}{{ kpis.evolutionProduction }}%
              </span>
            </div>
          </div>
          <div class="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <PlusIcon class="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Livraisons mensuelles</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpis.livraisonsMensuelles }}</p>
            <p class="text-sm text-gray-500">commandes</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <ArrowUpIcon class="h-6 w-6 text-blue-600" />
          </div>
        </div>

      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Valeur stock</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpis.valeurStock.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
            <p class="text-sm text-gray-500">total</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
            <MinusIcon class="h-6 w-6 text-green-600" />
          </div>
        </div>

      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Taux de rendement</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpis.tauxRendement }}%</p>
            <p class="text-sm text-gray-500">moyen</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <ArrowUpIcon class="h-6 w-6 text-purple-600" />
          </div>
        </div>

      </div>
    </div>

    <!-- Graphiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Production mensuelle -->
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Évolution production mensuelle</h3>
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

      <!-- Performance hebdomadaire -->
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Performance hebdomadaire</h3>
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

    <!-- Répartition stock -->
    <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Répartition de la valeur stock</h3>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart 
          :data="stockData"
          :height="256"
        />
        
        <div class="space-y-4">
          <div v-for="item in stockData" :key="item.label" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <div class="w-4 h-4 rounded-full mr-3" :style="{ backgroundColor: item.color }"></div>
              <span class="font-medium text-gray-900">{{ item.label }}</span>
            </div>
            <span class="font-semibold text-gray-900">{{ item.value.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau récapitulatif -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Récapitulatif mensuel</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Production totale</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livraisons</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rendement</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in productionData" :key="item.mois" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.mois }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.production.toLocaleString() }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.livraisons }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {{ item.production > 0 ? Math.round((item.production / 1000) * 100) / 100 : 0 }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
