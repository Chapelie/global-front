<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'
import { useCompleteHybridService, type CompleteArticle } from '../services/completeHybridService'
// import SyncStatus from '../components/SyncStatus.vue'

const articles = ref<CompleteArticle[]>([])
const { getArticles, addArticle, updateArticle, deleteArticle } = useCompleteHybridService()

const showModal = ref(false)
const editingArticle = ref<CompleteArticle | null>(null)
const selectedCategorie = ref('')
const searchTerm = ref('')
// const syncStatus = ref(getSyncStatus())

const newArticle = ref({
  nom: '',
  categorie: '',
  stock: 0,
  seuilCritique: 0,
  unite: '',
  prix: 0,
  fournisseur: '',
  notes: ''
})

const categories = [
  'Briques',
  'Matériaux',
  'Emballage',
  'Outillage',
  'Consommables'
]

const unites = [
  'pièces',
  'tonnes',
  'kg',
  'unités',
  'mètres',
  'litres'
]

const fournisseurs = [
  'Briqueterie du Nord',
  'Ciments Calcia',
  'Carrières de Bretagne',
  'Palettes Express',
  'Matériaux Plus',
  'Fournitures Pro'
]

const articlesFiltres = computed(() => {
  let filtered = articles.value
  
  if (selectedCategorie.value) {
    filtered = filtered.filter(a => a.categorie === selectedCategorie.value)
  }
  
  if (searchTerm.value) {
    filtered = filtered.filter(a => 
      a.nom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (a.fournisseur || '').toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }
  
  return filtered
})

const articlesCritiques = computed(() => {
  return articles.value.filter(a => a.stock <= a.seuilCritique)
})

const valeurStock = computed(() => {
  return articles.value.reduce((sum, a) => sum + (a.stock * a.prix), 0)
})

const openModal = (article?: CompleteArticle) => {
  if (article) {
    editingArticle.value = article
    newArticle.value = { 
      ...article,
      notes: article.notes || '', // Assurer que notes n'est jamais undefined
      fournisseur: article.fournisseur || '' // Assurer que fournisseur n'est jamais undefined
    } as any
  } else {
    editingArticle.value = null
    newArticle.value = {
      nom: '',
      categorie: '',
      stock: 0,
      seuilCritique: 0,
      unite: '',
      prix: 0,
      fournisseur: '',
      notes: ''
    }
  }
  showModal.value = true
}

const saveArticle = async () => {
  try {
    if (editingArticle.value) {
      await updateArticle(editingArticle.value.id!, {
        nom: newArticle.value.nom,
        categorie: newArticle.value.categorie,
        stock: newArticle.value.stock,
        seuilCritique: newArticle.value.seuilCritique,
        unite: newArticle.value.unite,
        prix: newArticle.value.prix,
        fournisseur: newArticle.value.fournisseur,
        notes: newArticle.value.notes
      })
    } else {
      await addArticle({
        nom: newArticle.value.nom,
        categorie: newArticle.value.categorie,
        stock: newArticle.value.stock,
        seuilCritique: newArticle.value.seuilCritique,
        unite: newArticle.value.unite,
        prix: newArticle.value.prix,
        fournisseur: newArticle.value.fournisseur,
        notes: newArticle.value.notes,
        typeProduction: 'autre',
        capaciteProduction: 0,
        uniteProduction: 'unités/jour',
        coutProduction: 0,
        tempsProduction: 0,
        qualite: 'standard',
        actif: true
      })
    }
    await loadArticles()
    showModal.value = false
    editingArticle.value = null
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    alert('Erreur lors de la sauvegarde de l\'article')
  }
}

const handleDeleteArticle = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
    try {
      await deleteArticle(id)
      await loadArticles()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de l\'article')
    }
  }
}

const ajusterStock = async (article: CompleteArticle, quantite: number) => {
  try {
    const newStock = Math.max(0, article.stock + quantite)
    await updateArticle(article.id!, { stock: newStock })
    await loadArticles()
  } catch (error) {
    console.error('Erreur lors de l\'ajustement du stock:', error)
    alert('Erreur lors de l\'ajustement du stock')
  }
}

const getStockStatus = (article: CompleteArticle) => {
  const ratio = article.stock / article.seuilCritique
  if (ratio <= 1) return { color: 'text-red-600', bg: 'bg-red-100', text: 'Critique' }
  if (ratio <= 2) return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Faible' }
  return { color: 'text-green-600', bg: 'bg-green-100', text: 'Normal' }
}

const getStockBarColor = (article: CompleteArticle) => {
  const ratio = article.stock / article.seuilCritique
  if (ratio <= 1) return 'bg-red-500'
  if (ratio <= 2) return 'bg-yellow-500'
  return 'bg-green-500'
}

const loadArticles = async () => {
  articles.value = await getArticles()
}

onMounted(() => {
  loadArticles()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Statut de synchronisation -->
    <!-- <SyncStatus /> -->
    
    <!-- En-tête amélioré -->
    <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-100">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div class="mb-6 lg:mb-0">
          <div class="flex items-center mb-3">
            <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mr-4">
              <ArchiveBoxIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Gestion du Stock</h1>
              <p class="text-gray-600 font-medium">Suivi des articles et alertes de stock</p>
            </div>
          </div>
          <div class="flex items-center space-x-6 text-sm">
            <div class="flex items-center text-gray-600">
              <ClockIcon class="h-4 w-4 mr-1" />
              <span>Dernière MAJ: {{ new Date().toLocaleDateString('fr-FR') }}</span>
            </div>
            <div class="flex items-center text-gray-600">
              <CurrencyDollarIcon class="h-4 w-4 mr-1" />
              <span>Valeur totale: {{ valeurStock.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</span>
            </div>
          </div>
        </div>
        <button
          @click="openModal()"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Nouvel article
        </button>
      </div>
    </div>

    <!-- Statistiques améliorées -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <ArchiveBoxIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total articles</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ articles.length }}</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-blue-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style="width: 100%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-red-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <ExclamationTriangleIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Stock critique</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ articlesCritiques.length }}</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-red-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full" :style="{ width: `${Math.min((articlesCritiques.length / articles.length) * 100, 100)}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <CurrencyDollarIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Valeur stock</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ (valeurStock / 1000).toFixed(0) }}K XOF</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-green-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style="width: 85%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-orange-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <EyeIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Catégories</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ new Set(articles.map(a => a.categorie)).size }}</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-orange-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" style="width: 60%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alertes stock critique améliorées -->
    <div v-if="articlesCritiques.length > 0" class="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-3xl p-8 shadow-lg">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mr-4">
            <ExclamationTriangleIcon class="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-red-900">Alertes Stock Critique</h3>
            <p class="text-red-700 font-medium">{{ articlesCritiques.length }} article(s) nécessite(nt) une attention</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <div class="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
          <span class="text-sm font-medium text-red-600">Action requise</span>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="article in articlesCritiques"
          :key="article.id"
          class="bg-white rounded-2xl p-6 border border-red-200 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="font-bold text-gray-900 text-lg">{{ article.nom }}</h4>
              <p class="text-sm text-gray-600">{{ article.categorie }}</p>
            </div>
            <div class="text-right">
              <span class="text-2xl font-bold text-red-600">{{ article.stock }}</span>
              <p class="text-xs text-gray-500">{{ article.unite }}</p>
            </div>
          </div>
          <div class="mb-3">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Seuil critique</span>
              <span class="font-medium">{{ article.seuilCritique }} {{ article.unite }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                class="h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min((article.stock / article.seuilCritique) * 100, 100)}%` }"
              ></div>
            </div>
            <p class="text-xs text-red-600 mt-1 font-medium">
              {{ Math.round((article.stock / article.seuilCritique) * 100) }}% du seuil critique
            </p>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">{{ article.fournisseur }}</span>
            <div class="flex space-x-1">
              <button
                @click="ajusterStock(article, 10)"
                class="h-8 w-8 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center transition-colors"
                title="Ajouter 10"
              >
                <ArrowUpIcon class="h-4 w-4" />
              </button>
              <button
                @click="openModal(article)"
                class="h-8 w-8 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-600 flex items-center justify-center transition-colors"
                title="Modifier"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres et recherche améliorés -->
    <div class="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div class="mb-4 lg:mb-0">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Articles en stock</h3>
          <p class="text-gray-600">{{ articlesFiltres.length }} article(s) affiché(s)</p>
        </div>
        <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div class="relative w-full sm:w-auto">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Rechercher un article..."
              class="w-full sm:w-64 pl-10 pr-4 py-3 rounded-2xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
            />
          </div>
          <div class="relative w-full sm:w-auto">
            <FunnelIcon class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              v-model="selectedCategorie"
              class="w-full sm:w-48 pl-10 pr-8 py-3 rounded-2xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 appearance-none bg-white"
            >
              <option value="">Toutes les catégories</option>
              <option v-for="categorie in categories" :key="categorie" :value="categorie">
                {{ categorie }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div v-if="searchTerm || selectedCategorie" class="flex items-center space-x-2 mb-4">
        <span class="text-sm text-gray-600">Filtres actifs:</span>
        <span v-if="searchTerm" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          "{{ searchTerm }}"
          <button @click="searchTerm = ''" class="ml-1 text-orange-600 hover:text-orange-800">
            ×
          </button>
        </span>
        <span v-if="selectedCategorie" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {{ selectedCategorie }}
          <button @click="selectedCategorie = ''" class="ml-1 text-blue-600 hover:text-blue-800">
            ×
          </button>
        </span>
      </div>
    </div>

    <!-- Liste des articles améliorée -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div
        v-for="article in articlesFiltres"
        :key="article.id"
        class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-8 group hover:-translate-y-1"
      >
        <!-- En-tête de l'article -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h4 class="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{{ article.nom }}</h4>
              <span
                class="inline-flex px-3 py-1 text-xs font-bold rounded-full"
                :class="getStockStatus(article).bg + ' ' + getStockStatus(article).color"
              >
                {{ getStockStatus(article).text }}
              </span>
            </div>
            <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">{{ article.categorie }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <div class="flex items-center space-x-1">
              <button
                @click="ajusterStock(article, 10)"
                class="h-10 w-10 rounded-xl bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="Ajouter 10"
              >
                <ArrowUpIcon class="h-5 w-5" />
              </button>
              <button
                @click="ajusterStock(article, -10)"
                class="h-10 w-10 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="Retirer 10"
              >
                <ArrowDownIcon class="h-5 w-5" />
              </button>
              <button
                @click="openModal(article)"
                class="h-10 w-10 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-600 hover:text-orange-700 flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="Modifier"
              >
                <PencilIcon class="h-5 w-5" />
              </button>
              <button
                @click="deleteArticle(article.id!)"
                class="h-10 w-10 rounded-xl bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="Supprimer"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Informations principales -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
            <p class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">Stock actuel</p>
            <p class="text-2xl font-bold text-blue-900">{{ article.stock.toLocaleString() }}</p>
            <p class="text-xs text-blue-600 font-medium">{{ article.unite }}</p>
          </div>
          <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
            <p class="text-sm font-semibold text-green-600 uppercase tracking-wide mb-1">Prix unitaire</p>
            <p class="text-lg font-bold text-green-900">{{ article.prix.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
          </div>
        </div>

        <!-- Informations secondaires -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p class="text-sm font-semibold text-gray-600 mb-1">Seuil critique</p>
            <p class="text-base font-bold text-gray-900">{{ article.seuilCritique.toLocaleString() }} {{ article.unite }}</p>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-600 mb-1">Valeur stock</p>
            <p class="text-base font-bold text-gray-900">{{ (article.stock * article.prix).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
          </div>
        </div>

        <!-- Barre de progression du stock -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Niveau de stock</span>
            <span class="text-sm font-bold text-gray-900">{{ Math.round((article.stock / article.seuilCritique) * 100) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              class="h-3 rounded-full transition-all duration-500"
              :class="getStockBarColor(article)"
              :style="{ width: `${Math.min((article.stock / article.seuilCritique) * 100, 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Pied de carte -->
        <div class="border-t border-gray-200 pt-4">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-600 font-medium">Fournisseur:</span>
            <span class="font-semibold text-gray-900">{{ article.fournisseur }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 font-medium">Dernière MAJ:</span>
            <span class="font-semibold text-gray-700">{{ new Date(article.derniereMiseAJour || new Date()).toLocaleDateString('fr-FR') }}</span>
          </div>
          <div v-if="article.notes" class="mt-3 p-3 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-700 italic">{{ article.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal amélioré pour ajouter/éditer -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl transform transition-all duration-300">
        <div class="p-8">
          <!-- En-tête du modal -->
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mr-4">
                <ArchiveBoxIcon class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">
                  {{ editingArticle ? 'Modifier l\'article' : 'Nouvel article' }}
                </h3>
                <p class="text-gray-600">{{ editingArticle ? 'Mettre à jour les informations' : 'Ajouter un nouvel article au stock' }}</p>
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
          <form @submit.prevent="saveArticle" class="space-y-6">
            <!-- Section 1: Informations de base -->
            <div class="bg-gray-50 rounded-2xl p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Informations de base</h4>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Nom de l'article *</label>
                  <input
                    v-model="newArticle.nom"
                    type="text"
                    required
                    class="w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 px-4 py-3"
                    placeholder="Ex: Briques standard"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                  <select
                    v-model="newArticle.categorie"
                    required
                    class="w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 px-4 py-3"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option v-for="categorie in categories" :key="categorie" :value="categorie">
                      {{ categorie }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Section 2: Stock et seuils -->
            <div class="bg-blue-50 rounded-2xl p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Stock et seuils</h4>
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Stock actuel *</label>
                  <input
                    v-model.number="newArticle.stock"
                    type="number"
                    required
                    min="0"
                    class="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 px-4 py-3"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Seuil critique *</label>
                  <input
                    v-model.number="newArticle.seuilCritique"
                    type="number"
                    required
                    min="0"
                    class="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 px-4 py-3"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Unité *</label>
                  <select
                    v-model="newArticle.unite"
                    required
                    class="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 px-4 py-3"
                  >
                    <option value="">Sélectionner une unité</option>
                    <option v-for="unite in unites" :key="unite" :value="unite">
                      {{ unite }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Section 3: Prix et fournisseur -->
            <div class="bg-green-50 rounded-2xl p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Prix et fournisseur</h4>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Prix unitaire (XOF) *</label>
                  <input
                    v-model.number="newArticle.prix"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    class="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 px-4 py-3"
                    placeholder="1500.00"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Fournisseur *</label>
                  <select
                    v-model="newArticle.fournisseur"
                    required
                    class="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 px-4 py-3"
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    <option v-for="fournisseur in fournisseurs" :key="fournisseur" :value="fournisseur">
                      {{ fournisseur }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Section 4: Notes -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Notes (optionnel)</label>
              <textarea
                v-model="newArticle.notes"
                rows="4"
                class="w-full rounded-xl border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 px-4 py-3"
                placeholder="Ajoutez des notes sur cet article..."
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
                class="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                {{ editingArticle ? 'Modifier l\'article' : 'Ajouter l\'article' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Message si aucun article -->
    <div v-if="articles.length === 0" class="text-center py-16">
      <div class="max-w-md mx-auto">
        <div class="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <ArchiveBoxIcon class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucun article en stock</h3>
        <p class="text-gray-600 mb-6">Commencez par ajouter votre premier article au stock.</p>
        <button
          @click="openModal()"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Ajouter un article
        </button>
      </div>
    </div>

    <!-- Message si aucun résultat de recherche -->
    <div v-else-if="articlesFiltres.length === 0" class="text-center py-16">
      <div class="max-w-md mx-auto">
        <div class="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <MagnifyingGlassIcon class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
        <p class="text-gray-600 mb-6">Essayez de modifier vos critères de recherche.</p>
        <button
          @click="searchTerm = ''; selectedCategorie = ''"
          class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
        >
          Réinitialiser les filtres
        </button>
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

.group:hover .group-hover\:text-orange-600 {
  color: #ea580c;
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

