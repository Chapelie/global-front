<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storageService, type Article, type EtatProductionArticle } from '../services/storage'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon
} from '@heroicons/vue/24/outline'
import ProductionModal from '../components/ProductionModal.vue'

const articles = ref<Article[]>([])
const showModal = ref(false)
const editingArticle = ref<Article | null>(null)
const selectedCategorie = ref('')
const selectedTypeProduction = ref('')
const showProductionModal = ref(false)
const selectedArticle = ref<Article | null>(null)

// Charger les données depuis localStorage
onMounted(() => {
  loadArticles()
})

const loadArticles = () => {
  articles.value = storageService.getStock()
}

const newArticle = ref({
  nom: '',
  categorie: '',
  stock: 0,
  seuilCritique: 0,
  unite: '',
  prix: 0,
  fournisseur: '',
  notes: '',
  typeProduction: 'brique' as 'brique' | 'palette' | 'ciment' | 'granit' | 'autre',
  capaciteProduction: 0,
  uniteProduction: '',
  coutProduction: 0,
  tempsProduction: 0,
  qualite: 'standard' as 'standard' | 'premium' | 'luxe',
  actif: true
})

const categories = [
  'Briques',
  'Matériaux',
  'Palettes',
  'Outils',
  'Équipements'
]

const typesProduction = [
  { value: 'brique', label: 'Brique' },
  { value: 'palette', label: 'Palette' },
  { value: 'ciment', label: 'Ciment' },
  { value: 'granit', label: 'Granit' },
  { value: 'autre', label: 'Autre' }
]

const qualites = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxe', label: 'Luxe' }
]

const openModal = (article?: Article) => {
  if (article) {
    editingArticle.value = article
    newArticle.value = { 
      ...article,
      notes: article.notes || '' // Assurer que notes n'est jamais undefined
    }
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
      notes: '',
      typeProduction: 'brique',
      capaciteProduction: 0,
      uniteProduction: '',
      coutProduction: 0,
      tempsProduction: 0,
      qualite: 'standard',
      actif: true
    }
  }
  showModal.value = true
}

const saveArticle = () => {
  const articleData = {
    ...newArticle.value,
    derniereMiseAJour: new Date().toISOString().split('T')[0]
  }
  
  if (editingArticle.value) {
    storageService.updateArticle(editingArticle.value.id, articleData)
  } else {
    storageService.addArticle(articleData)
  }
  loadArticles()
  showModal.value = false
}

const deleteArticle = (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
    storageService.deleteArticle(id)
    loadArticles()
  }
}

const openProductionModal = (article: Article | null) => {
  selectedArticle.value = article
  showProductionModal.value = true
}

const articlesFiltres = computed(() => {
  let filtered = articles.value

  if (selectedCategorie.value) {
    filtered = filtered.filter(a => a.categorie === selectedCategorie.value)
  }

  if (selectedTypeProduction.value) {
    filtered = filtered.filter(a => a.typeProduction === selectedTypeProduction.value)
  }

  return filtered.sort((a, b) => a.nom.localeCompare(b.nom))
})

const getStatutStock = (article: Article) => {
  if (article.stock <= article.seuilCritique) {
    return { label: 'Critique', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
  } else if (article.stock <= article.seuilCritique * 2) {
    return { label: 'Faible', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon }
  } else {
    return { label: 'Normal', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon }
  }
}

const getStatutProduction = (article: Article) => {
  if (article.actif) {
    return { label: 'Actif', color: 'bg-blue-100 text-blue-800', icon: CogIcon }
  } else {
    return { label: 'Inactif', color: 'bg-gray-100 text-gray-800', icon: ClockIcon }
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Gestion des Articles</h2>
        <p class="mt-2 text-gray-600">Articles, stock et paramètres de production</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="openProductionModal(null)"
          class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
        >
          <ChartBarIcon class="h-5 w-5 mr-2" />
          Nouvelle production
        </button>
        <button
          @click="openModal()"
          class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Nouvel article
        </button>

      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Articles disponibles</h3>
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <select
              v-model="selectedCategorie"
              class="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="">Toutes les catégories</option>
              <option v-for="categorie in categories" :key="categorie" :value="categorie">
                {{ categorie }}
              </option>
            </select>
          </div>
          <div class="flex items-center">
            <select
              v-model="selectedTypeProduction"
              class="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="">Tous les types</option>
              <option v-for="type in typesProduction" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des articles -->
    <div class="space-y-4">
      <div 
        v-for="article in articlesFiltres" 
        :key="article.id"
        class="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
      >
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="text-lg font-semibold text-gray-900">{{ article.nom }}</h4>
                <p class="text-sm text-gray-600">{{ article.categorie }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatutStock(article).color"
                >
                  <component :is="getStatutStock(article).icon" class="h-3 w-3 mr-1" />
                  {{ getStatutStock(article).label }}
                </span>
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatutProduction(article).color"
                >
                  <component :is="getStatutProduction(article).icon" class="h-3 w-3 mr-1" />
                  {{ getStatutProduction(article).label }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm font-medium text-gray-700">Stock actuel</p>
                <p class="text-sm text-gray-900">{{ article.stock }} {{ article.unite }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Seuil critique</p>
                <p class="text-sm text-gray-900">{{ article.seuilCritique }} {{ article.unite }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Prix unitaire</p>
                <p class="text-sm text-gray-900">{{ article.prix.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Fournisseur</p>
                <p class="text-sm text-gray-900">{{ article.fournisseur }}</p>
              </div>
            </div>

            <!-- Informations de production -->
            <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h5 class="text-sm font-medium text-blue-900 mb-2">Paramètres de production</h5>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span class="text-blue-600">Type:</span>
                  <span class="font-medium text-blue-900 ml-1">{{ typesProduction.find(t => t.value === article.typeProduction)?.label }}</span>
                </div>
                <div>
                  <span class="text-blue-600">Capacité:</span>
                  <span class="font-medium text-blue-900 ml-1">{{ article.capaciteProduction }} {{ article.uniteProduction }}</span>
                </div>
                <div>
                  <span class="text-blue-600">Coût:</span>
                  <span class="font-medium text-blue-900 ml-1">{{ article.coutProduction.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</span>
                </div>
                <div>
                  <span class="text-blue-600">Qualité:</span>
                  <span class="font-medium text-blue-900 ml-1">{{ qualites.find(q => q.value === article.qualite)?.label }}</span>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <p class="text-sm font-medium text-gray-700 mb-2">Notes</p>
              <p class="text-sm text-gray-900">{{ article.notes || 'Aucune note' }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-4 lg:mt-0 lg:ml-4">
            <div class="flex flex-col space-y-2">
              <button
                @click="openProductionModal(article)"
                class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <ChartBarIcon class="h-4 w-4 mr-1 inline" />
                Production
              </button>
              <button
                @click="openModal(article)"
                class="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                <PencilIcon class="h-4 w-4 mr-1 inline" />
                Modifier
              </button>
              <button
                @click="deleteArticle(article.id)"
                class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                <TrashIcon class="h-4 w-4 mr-1 inline" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour ajouter/modifier un article -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ editingArticle ? 'Modifier l\'article' : 'Nouvel article' }}
          </h3>
          
          <form @submit.prevent="saveArticle" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  v-model="newArticle.nom"
                  type="text"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  v-model="newArticle.categorie"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option v-for="categorie in categories" :key="categorie" :value="categorie">
                    {{ categorie }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Stock actuel</label>
                <input
                  v-model.number="newArticle.stock"
                  type="number"
                  required
                  min="0"
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Seuil critique</label>
                <input
                  v-model.number="newArticle.seuilCritique"
                  type="number"
                  required
                  min="0"
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                <input
                  v-model="newArticle.unite"
                  type="text"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prix unitaire</label>
                <input
                  v-model.number="newArticle.prix"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <input
                  v-model="newArticle.fournisseur"
                  type="text"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type de production</label>
                <select
                  v-model="newArticle.typeProduction"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                >
                  <option v-for="type in typesProduction" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Capacité de production</label>
                <input
                  v-model.number="newArticle.capaciteProduction"
                  type="number"
                  required
                  min="0"
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Unité de production</label>
                <input
                  v-model="newArticle.uniteProduction"
                  type="text"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Coût de production</label>
                <input
                  v-model.number="newArticle.coutProduction"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Temps de production (min)</label>
                <input
                  v-model.number="newArticle.tempsProduction"
                  type="number"
                  required
                  min="0"
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Qualité</label>
                <select
                  v-model="newArticle.qualite"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                >
                  <option v-for="qualite in qualites" :key="qualite.value" :value="qualite.value">
                    {{ qualite.label }}
                  </option>
                </select>
              </div>
              <div class="flex items-center">
                <input
                  v-model="newArticle.actif"
                  type="checkbox"
                  class="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label class="ml-2 text-sm font-medium text-gray-700">Actif en production</label>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="newArticle.notes"
                rows="3"
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showModal = false"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {{ editingArticle ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de production -->
    <ProductionModal
      :article="selectedArticle || undefined"
      :visible="showProductionModal"
      @close="showProductionModal = false"
    />
    

  </div>
</template>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>
