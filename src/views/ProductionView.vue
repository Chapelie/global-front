<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storageService, type Production, type Article, type RapportProductionQuotidien } from '../services/storage'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  CubeIcon,
  ArchiveBoxIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  BeakerIcon,
  ChartBarIcon,
  FireIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'

const productions = ref<Production[]>([])
const showModal = ref(false)
const showRapportModal = ref(false)
const editingProduction = ref<Production | null>(null)
const selectedDate = ref('')
const searchTerm = ref('')
const rapportQuotidien = ref<RapportProductionQuotidien | null>(null)

// Obtenir les articles disponibles pour la production
const articlesDisponibles = computed(() => {
  return storageService.getStock().filter(article => article.actif)
})

// Obtenir les articles consommables
const articlesConsommables = computed(() => {
  return storageService.getArticlesConsommables()
})

// Charger les données depuis localStorage
onMounted(() => {
  loadProductions()
})

const loadProductions = () => {
  productions.value = storageService.getProductions()
}

const newProduction = ref({
  date: '',
  articlesProduits: [] as Array<{
    articleId: number
    quantiteProduite: number
    quantitePlanifiee: number
    unite: string
  }>,
  consommables: [] as Array<{
    articleId: number
    quantiteUtilisee: number
    unite: string
  }>,
  statut: 'en_attente' as 'en_attente' | 'en_cours' | 'termine',
  lotId: '',
  heureDebut: '',
  heureFin: '',
  operateur: '',
  qualiteProduite: 'bonne' as 'excellente' | 'bonne' | 'moyenne' | 'defectueuse',
  notes: '',
  tempsEffectif: 0,
  rendement: 100,
  coutProduction: 0
})

const statuts = [
  { value: 'en_attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  { value: 'en_cours', label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: PlayIcon },
  { value: 'termine', label: 'Terminé', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon }
]

const qualites = [
  { value: 'excellente', label: 'Excellente', color: 'text-green-600' },
  { value: 'bonne', label: 'Bonne', color: 'text-blue-600' },
  { value: 'moyenne', label: 'Moyenne', color: 'text-yellow-600' },
  { value: 'defectueuse', label: 'Défectueuse', color: 'text-red-600' }
]

const operateurs = ['Jean Dupont', 'Marie Martin', 'Pierre Durand', 'Sophie Moreau']

// Calculer les totaux de production par type d'article
const totalProductionParType = computed(() => {
  const totaux: Record<string, number> = {}

  productions.value.forEach(production => {
    if (production.articlesProduits && Array.isArray(production.articlesProduits)) {
      production.articlesProduits.forEach(article => {
        const articleStock = articlesDisponibles.value.find(a => a.id === article.articleId)
        if (articleStock) {
          const type = articleStock.typeProduction
          totaux[type] = (totaux[type] || 0) + article.quantiteProduite
        }
      })
    }
  })

  return totaux
})

const productionAujourdhui = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return productions.value
    .filter(p => p.date === today && p.statut === 'termine')
    .reduce((sum, p) => {
      if (p.articlesProduits && Array.isArray(p.articlesProduits)) {
        const totalArticles = p.articlesProduits.reduce((articleSum, article) =>
          articleSum + article.quantiteProduite, 0)
        return sum + totalArticles
      }
      return sum
    }, 0)
})

const productionsEnCours = computed(() => {
  return productions.value.filter(p => p.statut === 'en_cours')
})

const productionsFiltrees = computed(() => {
  let filtered = productions.value

  if (selectedDate.value) {
    filtered = filtered.filter(p => p.date === selectedDate.value)
  }

  if (searchTerm.value) {
    filtered = filtered.filter(p =>
      p.lotId.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      p.operateur?.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  return filtered
})

const openModal = (production?: Production) => {
  if (production) {
    editingProduction.value = production
    newProduction.value = {
      date: production.date,
      articlesProduits: [...production.articlesProduits],
      consommables: [...(production.consommables || [])],
      statut: production.statut,
      lotId: production.lotId,
      heureDebut: production.heureDebut || '',
      heureFin: production.heureFin || '',
      operateur: production.operateur || '',
      qualiteProduite: production.qualiteProduite || 'bonne',
      notes: production.notes || '',
      tempsEffectif: production.tempsEffectif || 0,
      rendement: production.rendement || 100,
      coutProduction: production.coutProduction || 0
    }
  } else {
    editingProduction.value = null
    newProduction.value = {
      date: new Date().toISOString().split('T')[0],
      articlesProduits: [],
      consommables: [],
      statut: 'en_attente',
      lotId: storageService.generateLotId(),
      heureDebut: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      heureFin: '',
      operateur: '',
      qualiteProduite: 'bonne',
      notes: '',
      tempsEffectif: 0,
      rendement: 100,
      coutProduction: 0
    }
  }
  showModal.value = true
}

const saveProduction = () => {
  if (newProduction.value.articlesProduits.length === 0) {
    alert('Veuillez ajouter au moins un article à produire')
    return
  }

  // Vérifier la disponibilité des consommables
  if (newProduction.value.consommables.length > 0) {
    const verification = storageService.verifierDisponibiliteConsommables(newProduction.value.consommables)
    if (!verification.disponible) {
      const manquants = verification.manquants.map(m => `${m.nom}: ${m.quantiteManquante}`).join(', ')
      alert(`Consommables insuffisants: ${manquants}`)
      return
    }
  }

  const productionData = {
    ...newProduction.value,
    date: newProduction.value.date || new Date().toISOString().split('T')[0]
  }

  try {
    if (editingProduction.value) {
      storageService.updateProduction(editingProduction.value.id, productionData)
    } else {
      storageService.addProduction(productionData)
    }

    loadProductions()
    showModal.value = false
    editingProduction.value = null
  } catch (error) {
    alert(`Erreur lors de la sauvegarde: ${error}`)
  }
}

const deleteProduction = (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette production ?')) {
    storageService.deleteProduction(id)
    loadProductions()
  }
}

const startProduction = (production: Production) => {
  storageService.updateProduction(production.id, {
    statut: 'en_cours',
    heureDebut: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  })
  loadProductions()
}

const stopProduction = (production: Production) => {
  try {
    storageService.terminerProduction(production.id)
    loadProductions()
    alert('Production terminée avec succès! Le stock a été mis à jour.')
  } catch (error) {
    alert(`Erreur: ${error}`)
  }
}

const getStatutInfo = (statut: string) => {
  return statuts.find(s => s.value === statut) || statuts[0]
}

const getQualiteInfo = (qualite: string) => {
  return qualites.find(q => q.value === qualite) || qualites[1]
}

const getArticleInfo = (articleId: number) => {
  return storageService.getStock().find(a => a.id === articleId)
}

// Fonctions pour gérer les articles dans le modal
const addArticleToProduction = () => {
  newProduction.value.articlesProduits.push({
    articleId: 0,
    quantiteProduite: 0,
    quantitePlanifiee: 0,
    unite: ''
  })
}

const removeArticleFromProduction = (index: number) => {
  newProduction.value.articlesProduits.splice(index, 1)
}

const addConsommableToProduction = () => {
  newProduction.value.consommables.push({
    articleId: 0,
    quantiteUtilisee: 0,
    unite: ''
  })
}

const removeConsommableFromProduction = (index: number) => {
  newProduction.value.consommables.splice(index, 1)
}

const onArticleChange = (index: number) => {
  const article = articlesDisponibles.value.find(a => a.id === newProduction.value.articlesProduits[index].articleId)
  if (article) {
    newProduction.value.articlesProduits[index].unite = article.unite
    newProduction.value.articlesProduits[index].quantitePlanifiee = article.capaciteProduction
    newProduction.value.articlesProduits[index].quantiteProduite = 0
  }
}

const onConsommableChange = (index: number) => {
  const article = articlesConsommables.value.find(a => a.id === newProduction.value.consommables[index].articleId)
  if (article) {
    newProduction.value.consommables[index].unite = article.unite
  }
}

// Gestion des rapports quotidiens
const genererRapport = async (date: string) => {
  try {
    const rapport = storageService.genererRapportQuotidien(date)
    rapportQuotidien.value = rapport
    showRapportModal.value = true
  } catch (error) {
    alert(`Erreur lors de la génération du rapport: ${error}`)
  }
}

const voirRapport = (date: string) => {
  const rapport = storageService.getRapportQuotidien(date)
  if (rapport) {
    rapportQuotidien.value = rapport
    showRapportModal.value = true
  } else {
    if (confirm('Aucun rapport disponible pour cette date. Voulez-vous le générer ?')) {
      genererRapport(date)
    }
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- En-tête amélioré -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div class="mb-6 lg:mb-0">
          <div class="flex items-center mb-3">
            <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-4">
              <CubeIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Gestion de la Production</h1>
              <p class="text-gray-600 font-medium">Reporting quotidien et suivi des consommables</p>
            </div>
          </div>
          <div class="flex items-center space-x-6 text-sm">
            <div class="flex items-center text-gray-600">
              <ClockIcon class="h-4 w-4 mr-1" />
              <span>{{ new Date().toLocaleDateString('fr-FR') }}</span>
            </div>
            <div class="flex items-center text-gray-600">
              <FireIcon class="h-4 w-4 mr-1" />
              <span>{{ productionsEnCours.length }} production(s) en cours</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="voirRapport(new Date().toISOString().split('T')[0])"
            class="inline-flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-xl transition-colors"
          >
            <DocumentTextIcon class="h-5 w-5 mr-2" />
            Rapport du jour
          </button>
          <button
            @click="openModal()"
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Nouvelle production
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques améliorées -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-orange-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <CubeIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Prod. aujourd'hui</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ productionAujourdhui.toLocaleString() }}</p>
            <p class="text-xs text-gray-500 mt-1">articles</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-orange-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style="width: 75%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <ArchiveBoxIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total briques</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ totalProductionParType.brique || 0 }}</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-blue-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style="width: 85%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <PlayIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">En cours</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ productionsEnCours.length }}</p>
            <p class="text-xs text-gray-500 mt-1">lots</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-green-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" :style="{ width: `${Math.min((productionsEnCours.length / 5) * 100, 100)}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <ChartBarIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Efficacité</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">87%</p>
            <p class="text-xs text-gray-500 mt-1">moyenne</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-purple-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style="width: 87%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres et recherche améliorés -->
    <div class="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div class="mb-4 lg:mb-0">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Productions récentes</h3>
          <p class="text-gray-600">{{ productionsFiltrees.length }} production(s) affichée(s)</p>
        </div>
        <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div class="relative w-full sm:w-auto">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Rechercher par lot, opérateur..."
              class="w-full sm:w-64 pl-10 pr-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>
          <div class="relative w-full sm:w-auto">
            <CalendarIcon class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              v-model="selectedDate"
              type="date"
              class="w-full sm:w-48 pl-10 pr-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>
        </div>
      </div>
      <div v-if="searchTerm || selectedDate" class="flex items-center space-x-2 mb-4">
        <span class="text-sm text-gray-600">Filtres actifs:</span>
        <span v-if="searchTerm" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          "{{ searchTerm }}"
          <button @click="searchTerm = ''" class="ml-1 text-blue-600 hover:text-blue-800">×</button>
        </span>
        <span v-if="selectedDate" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {{ new Date(selectedDate).toLocaleDateString('fr-FR') }}
          <button @click="selectedDate = ''" class="ml-1 text-green-600 hover:text-green-800">×</button>
        </span>
      </div>
    </div>

    <!-- Liste des productions améliorée -->
    <div class="grid grid-cols-1 gap-6">
      <div
        v-for="production in productionsFiltrees"
        :key="production.id"
        class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-8 group hover:-translate-y-1"
      >
        <!-- En-tête de production -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h4 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ production.lotId }}</h4>
              <span
                class="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full"
                :class="getStatutInfo(production.statut).color"
              >
                <component :is="getStatutInfo(production.statut).icon" class="h-3 w-3 mr-1" />
                {{ getStatutInfo(production.statut).label }}
              </span>
            </div>
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <span class="flex items-center">
                <CalendarIcon class="h-4 w-4 mr-1" />
                {{ new Date(production.date).toLocaleDateString('fr-FR') }}
              </span>
              <span v-if="production.operateur" class="flex items-center">
                <UsersIcon class="h-4 w-4 mr-1" />
                {{ production.operateur }}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="production.statut === 'en_attente'"
              @click="startProduction(production)"
              class="h-10 w-10 rounded-xl bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Démarrer"
            >
              <PlayIcon class="h-5 w-5" />
            </button>
            <button
              v-if="production.statut === 'en_cours'"
              @click="stopProduction(production)"
              class="h-10 w-10 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Terminer"
            >
              <StopIcon class="h-5 w-5" />
            </button>
            <button
              @click="openModal(production)"
              class="h-10 w-10 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Modifier"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
            <button
              @click="deleteProduction(production.id)"
              class="h-10 w-10 rounded-xl bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Supprimer"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Articles produits -->
        <div class="mb-6">
          <h5 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Articles produits</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="article in production.articlesProduits"
              :key="article.articleId"
              class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-blue-900">{{ getArticleInfo(article.articleId)?.nom }}</span>
                <span class="text-xs font-bold text-blue-600 bg-blue-200 px-2 py-1 rounded-full">{{ article.unite }}</span>
              </div>
              <div class="text-sm text-blue-700">
                <div class="flex justify-between">
                  <span>Produit:</span>
                  <span class="font-bold">{{ article.quantiteProduite.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Planifié:</span>
                  <span>{{ article.quantitePlanifiee.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Consommables (si présents) -->
        <div v-if="production.consommables && production.consommables.length > 0" class="mb-6">
          <h5 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Consommables utilisés</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="consommable in production.consommables"
              :key="consommable.articleId"
              class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-orange-900">{{ getArticleInfo(consommable.articleId)?.nom }}</span>
                <span class="text-xs font-bold text-orange-600 bg-orange-200 px-2 py-1 rounded-full">{{ consommable.unite }}</span>
              </div>
              <div class="text-sm text-orange-700">
                <div class="flex justify-between">
                  <span>Utilisé:</span>
                  <span class="font-bold">{{ consommable.quantiteUtilisee.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations complémentaires -->
        <div v-if="production.statut === 'termine'" class="border-t border-gray-200 pt-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div v-if="production.tempsEffectif">
              <span class="text-gray-600">Temps effectif:</span>
              <p class="font-semibold text-gray-900">{{ production.tempsEffectif }} min</p>
            </div>
            <div v-if="production.rendement">
              <span class="text-gray-600">Rendement:</span>
              <p class="font-semibold" :class="getQualiteInfo(production.qualiteProduite || 'bonne').color">{{ production.rendement }}%</p>
            </div>
            <div v-if="production.qualiteProduite">
              <span class="text-gray-600">Qualité:</span>
              <p class="font-semibold" :class="getQualiteInfo(production.qualiteProduite).color">{{ getQualiteInfo(production.qualiteProduite).label }}</p>
            </div>
            <div v-if="production.coutProduction">
              <span class="text-gray-600">Coût:</span>
              <p class="font-semibold text-gray-900">{{ production.coutProduction.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
            </div>
          </div>
          <div v-if="production.notes" class="mt-3 p-3 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-700 italic">{{ production.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Message si aucune production -->
    <div v-if="productions.length === 0" class="text-center py-16">
      <div class="max-w-md mx-auto">
        <div class="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <CubeIcon class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucune production enregistrée</h3>
        <p class="text-gray-600 mb-6">Commencez par planifier votre première production.</p>
        <button
          @click="openModal()"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Nouvelle production
        </button>
      </div>
    </div>

    <!-- Message si aucun résultat de recherche -->
    <div v-else-if="productionsFiltrees.length === 0" class="text-center py-16">
      <div class="max-w-md mx-auto">
        <div class="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <MagnifyingGlassIcon class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
        <p class="text-gray-600 mb-6">Essayez de modifier vos critères de recherche.</p>
        <button
          @click="searchTerm = ''; selectedDate = ''"
          class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>

    <!-- Modal pour ajouter/éditer production -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl transform transition-all duration-300 max-h-[95vh] overflow-y-auto">
        <div class="p-8">
          <!-- En-tête du modal -->
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-4">
                <CubeIcon class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">
                  {{ editingProduction ? 'Modifier la production' : 'Nouvelle production' }}
                </h3>
                <p class="text-gray-600">{{ editingProduction ? 'Mettre à jour les informations' : 'Planifier une nouvelle production' }}</p>
              </div>
            </div>
            <button
              @click="showModal = false"
              class="h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 flex items-center justify-center transition-all duration-200"
            >
              ×
            </button>
          </div>

          <!-- Formulaire amélioré -->
          <form @submit.prevent="saveProduction" class="space-y-6">
            <!-- Section 1: Informations de base -->
            <div class="bg-gray-50 rounded-2xl p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Informations de base</h4>
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Date de production *</label>
                  <input
                    v-model="newProduction.date"
                    type="date"
                    required
                    class="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 px-4 py-3"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Statut *</label>
                  <select
                    v-model="newProduction.statut"
                    required
                    class="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 px-4 py-3"
                  >
                    <option v-for="statut in statuts" :key="statut.value" :value="statut.value">
                      {{ statut.label }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Lot ID</label>
                  <input
                    v-model="newProduction.lotId"
                    type="text"
                    readonly
                    class="w-full rounded-xl border-gray-300 bg-gray-100 px-4 py-3 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Section 2: Articles à produire -->
            <div class="bg-blue-50 rounded-2xl p-6">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-semibold text-gray-900">Articles à produire</h4>
                <button
                  type="button"
                  @click="addArticleToProduction"
                  class="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  + Ajouter un article
                </button>
              </div>

              <div v-if="newProduction.articlesProduits.length === 0" class="text-center py-8 text-gray-500">
                <CubeIcon class="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p class="font-medium">Aucun article ajouté</p>
                <p class="text-sm">Cliquez sur "Ajouter un article" pour commencer</p>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="(article, index) in newProduction.articlesProduits"
                  :key="index"
                  class="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-blue-200"
                >
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Article *</label>
                    <select
                      v-model="article.articleId"
                      @change="onArticleChange(index)"
                      required
                      class="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 px-4 py-3"
                    >
                      <option value="">Sélectionner un article</option>
                      <option
                        v-for="articleStock in articlesDisponibles"
                        :key="articleStock.id"
                        :value="articleStock.id"
                      >
                        {{ articleStock.nom }} ({{ articleStock.typeProduction }})
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Quantité planifiée *</label>
                    <input
                      v-model.number="article.quantitePlanifiee"
                      type="number"
                      required
                      min="0"
                      class="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 px-4 py-3"
                      placeholder="1000"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Quantité produite *</label>
                    <input
                      v-model.number="article.quantiteProduite"
                      type="number"
                      required
                      min="0"
                      class="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 px-4 py-3"
                      placeholder="950"
                    />
                  </div>

                  <div class="flex items-end space-x-2">
                    <div class="flex-1">
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Unité</label>
                      <input
                        v-model="article.unite"
                        type="text"
                        readonly
                        class="w-full rounded-xl border-gray-300 bg-gray-100 px-4 py-3"
                      />
                    </div>
                    <button
                      type="button"
                      @click="removeArticleFromProduction(index)"
                      class="h-12 w-12 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors flex items-center justify-center"
                      title="Supprimer cet article"
                    >
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Consommables -->
            <div class="bg-orange-50 rounded-2xl p-6">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-semibold text-gray-900">Consommables utilisés</h4>
                <button
                  type="button"
                  @click="addConsommableToProduction"
                  class="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  + Ajouter un consommable
                </button>
              </div>

              <div v-if="newProduction.consommables.length === 0" class="text-center py-6 text-gray-500">
                <BeakerIcon class="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p class="text-sm">Aucun consommable ajouté (optionnel)</p>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="(consommable, index) in newProduction.consommables"
                  :key="index"
                  class="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-orange-200"
                >
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Consommable *</label>
                    <select
                      v-model="consommable.articleId"
                      @change="onConsommableChange(index)"
                      required
                      class="w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 px-4 py-3"
                    >
                      <option value="">Sélectionner un consommable</option>
                      <option
                        v-for="articleStock in articlesConsommables"
                        :key="articleStock.id"
                        :value="articleStock.id"
                      >
                        {{ articleStock.nom }} (Stock: {{ articleStock.stock }} {{ articleStock.unite }})
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Quantité utilisée *</label>
                    <input
                      v-model.number="consommable.quantiteUtilisee"
                      type="number"
                      required
                      min="0"
                      class="w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 px-4 py-3"
                      placeholder="50"
                    />
                  </div>

                  <div class="flex items-end space-x-2">
                    <div class="flex-1">
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Unité</label>
                      <input
                        v-model="consommable.unite"
                        type="text"
                        readonly
                        class="w-full rounded-xl border-gray-300 bg-gray-100 px-4 py-3"
                      />
                    </div>
                    <button
                      type="button"
                      @click="removeConsommableFromProduction(index)"
                      class="h-12 w-12 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors flex items-center justify-center"
                      title="Supprimer ce consommable"
                    >
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 4: Détails production -->
            <div class="bg-green-50 rounded-2xl p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Détails de production</h4>
              <div class="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Opérateur</label>
                  <select
                    v-model="newProduction.operateur"
                    class="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 px-4 py-3"
                  >
                    <option value="">Sélectionner un opérateur</option>
                    <option v-for="operateur in operateurs" :key="operateur" :value="operateur">
                      {{ operateur }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Heure début</label>
                  <input
                    v-model="newProduction.heureDebut"
                    type="time"
                    class="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 px-4 py-3"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Heure fin</label>
                  <input
                    v-model="newProduction.heureFin"
                    type="time"
                    class="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 px-4 py-3"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Rendement (%)</label>
                  <input
                    v-model.number="newProduction.rendement"
                    type="number"
                    min="0"
                    max="100"
                    class="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 px-4 py-3"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Qualité</label>
                  <select
                    v-model="newProduction.qualiteProduite"
                    class="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 px-4 py-3"
                  >
                    <option v-for="qualite in qualites" :key="qualite.value" :value="qualite.value">
                      {{ qualite.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Section 5: Notes -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Notes et observations</label>
              <textarea
                v-model="newProduction.notes"
                rows="4"
                class="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 px-4 py-3"
                placeholder="Ajoutez des notes sur cette production..."
              ></textarea>
            </div>

            <!-- Boutons d'action -->
            <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="showModal = false"
                class="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-105"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                {{ editingProduction ? 'Modifier la production' : 'Créer la production' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal rapport quotidien -->
    <div v-if="showRapportModal && rapportQuotidien" class="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl transform transition-all duration-300 max-h-[95vh] overflow-y-auto">
        <div class="p-8">
          <!-- En-tête du rapport -->
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mr-4">
                <DocumentTextIcon class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">Rapport de Production</h3>
                <p class="text-gray-600">{{ new Date(rapportQuotidien.date).toLocaleDateString('fr-FR') }}</p>
              </div>
            </div>
            <button
              @click="showRapportModal = false"
              class="h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 flex items-center justify-center transition-all duration-200"
            >
              ×
            </button>
          </div>

          <!-- Résumé -->
          <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Résumé de la production</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-green-600">{{ rapportQuotidien.resumeProduction.totalArticlesProduits.toLocaleString() }}</p>
                <p class="text-sm text-gray-600">Articles produits</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-orange-600">{{ rapportQuotidien.resumeProduction.totalConsommablesUtilises.toLocaleString() }}</p>
                <p class="text-sm text-gray-600">Consommables</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-blue-600">{{ Math.round(rapportQuotidien.resumeProduction.rendementMoyen) }}%</p>
                <p class="text-sm text-gray-600">Rendement moyen</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-purple-600">{{ Math.round(rapportQuotidien.resumeProduction.tempsProductionTotal / 60) }}h</p>
                <p class="text-sm text-gray-600">Temps total</p>
              </div>
            </div>
          </div>

          <!-- Détails par article -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Production par article</h4>
            <div class="space-y-3">
              <div
                v-for="detail in rapportQuotidien.detailsParArticle"
                :key="detail.articleId"
                class="bg-blue-50 rounded-xl p-4"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="font-medium text-gray-900">{{ getArticleInfo(detail.articleId)?.nom }}</h5>
                    <p class="text-sm text-gray-600">{{ detail.quantiteProduite }} / {{ detail.quantitePlanifiee }} ({{ Math.round(detail.tauxRealisation) }}%)</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-blue-600">{{ detail.coutProduction.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Détails consommables -->
          <div v-if="rapportQuotidien.detailsConsommables.length > 0" class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Consommables utilisés</h4>
            <div class="space-y-3">
              <div
                v-for="detail in rapportQuotidien.detailsConsommables"
                :key="detail.articleId"
                class="bg-orange-50 rounded-xl p-4"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="font-medium text-gray-900">{{ getArticleInfo(detail.articleId)?.nom }}</h5>
                    <p class="text-sm text-gray-600">{{ detail.quantiteUtilisee }} {{ getArticleInfo(detail.articleId)?.unite }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-orange-600">{{ detail.coutTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Équipe -->
          <div class="grid grid-cols-1 gap-6">
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-3">Opérateurs</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="operateur in rapportQuotidien.operateurs"
                  :key="operateur"
                  class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {{ operateur }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animations personnalisées */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Transitions fluides pour les survols */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:text-blue-600 {
  color: #2563eb;
}

/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>