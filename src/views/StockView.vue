<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

interface Article {
  id: number
  nom: string
  categorie: string
  stock: number
  seuilCritique: number
  unite: string
  prix: number
  fournisseur: string
  derniereMiseAJour: string
  notes?: string
}

const articles = ref<Article[]>([
  {
    id: 1,
    nom: 'Briques standard',
    categorie: 'Briques',
    stock: 2500,
    seuilCritique: 1000,
    unite: 'pièces',
    prix: 0.85,
    fournisseur: 'Briqueterie du Nord',
    derniereMiseAJour: '2024-01-15',
    notes: 'Stock stable'
  },
  {
    id: 2,
    nom: 'Ciment Portland',
    categorie: 'Matériaux',
    stock: 45,
    seuilCritique: 30,
    unite: 'tonnes',
    prix: 120.00,
    fournisseur: 'Ciments Calcia',
    derniereMiseAJour: '2024-01-14',
    notes: 'Stock critique - commande en cours'
  },
  {
    id: 3,
    nom: 'Granit concassé',
    categorie: 'Matériaux',
    stock: 85,
    seuilCritique: 20,
    unite: 'tonnes',
    prix: 45.00,
    fournisseur: 'Carrières de Bretagne',
    derniereMiseAJour: '2024-01-13'
  },
  {
    id: 4,
    nom: 'Palettes bois',
    categorie: 'Emballage',
    stock: 120,
    seuilCritique: 50,
    unite: 'unités',
    prix: 15.00,
    fournisseur: 'Palettes Express',
    derniereMiseAJour: '2024-01-12'
  }
])

const showModal = ref(false)
const editingArticle = ref<Article | null>(null)
const selectedCategorie = ref('')
const searchTerm = ref('')

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
      a.fournisseur.toLowerCase().includes(searchTerm.value.toLowerCase())
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
      notes: ''
    }
  }
  showModal.value = true
}

const saveArticle = () => {
  if (editingArticle.value) {
    const index = articles.value.findIndex(a => a.id === editingArticle.value!.id)
    articles.value[index] = { 
      ...newArticle.value, 
      id: editingArticle.value.id,
      derniereMiseAJour: new Date().toISOString().split('T')[0]
    }
  } else {
    const newId = Math.max(...articles.value.map(a => a.id)) + 1
    articles.value.push({ 
      ...newArticle.value, 
      id: newId,
      derniereMiseAJour: new Date().toISOString().split('T')[0]
    })
  }
  showModal.value = false
  editingArticle.value = null
}

const deleteArticle = (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
    articles.value = articles.value.filter(a => a.id !== id)
  }
}

const ajusterStock = (article: Article, quantite: number) => {
  const index = articles.value.findIndex(a => a.id === article.id)
  articles.value[index] = {
    ...article,
    stock: Math.max(0, article.stock + quantite),
    derniereMiseAJour: new Date().toISOString().split('T')[0]
  }
}

const getStockStatus = (article: Article) => {
  const ratio = article.stock / article.seuilCritique
  if (ratio <= 1) return { color: 'text-red-600', bg: 'bg-red-100', text: 'Critique' }
  if (ratio <= 2) return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Faible' }
  return { color: 'text-green-600', bg: 'bg-green-100', text: 'Normal' }
}

const getStockBarColor = (article: Article) => {
  const ratio = article.stock / article.seuilCritique
  if (ratio <= 1) return 'bg-red-500'
  if (ratio <= 2) return 'bg-yellow-500'
  return 'bg-green-500'
}
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Gestion du Stock</h2>
        <p class="mt-2 text-gray-600">Suivi des articles et alertes de stock</p>
      </div>
      <button
        @click="openModal()"
        class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Nouvel article
      </button>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <ArchiveBoxIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total articles</p>
            <p class="text-2xl font-bold text-gray-900">{{ articles.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Stock critique</p>
            <p class="text-2xl font-bold text-gray-900">{{ articlesCritiques.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
            <ArrowUpIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Valeur stock</p>
            <p class="text-2xl font-bold text-gray-900">{{ valeurStock.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <EyeIcon class="h-6 w-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Catégories</p>
            <p class="text-2xl font-bold text-gray-900">{{ new Set(articles.map(a => a.categorie)).size }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Alertes stock critique -->
    <div v-if="articlesCritiques.length > 0" class="bg-red-50 border border-red-200 rounded-2xl p-6">
      <div class="flex items-center mb-4">
        <ExclamationTriangleIcon class="h-6 w-6 text-red-600 mr-2" />
        <h3 class="text-lg font-semibold text-red-900">Alertes Stock Critique</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="article in articlesCritiques" 
          :key="article.id"
          class="bg-white rounded-xl p-4 border border-red-200"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-gray-900">{{ article.nom }}</h4>
            <span class="text-sm text-red-600 font-medium">{{ article.stock }} {{ article.unite }}</span>
          </div>
          <p class="text-sm text-gray-600 mb-2">Seuil: {{ article.seuilCritique }} {{ article.unite }}</p>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 bg-red-500 rounded-full"
              :style="{ width: `${Math.min((article.stock / article.seuilCritique) * 100, 100)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Articles en stock</h3>
        <div class="flex items-center space-x-4">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Rechercher un article..."
            class="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
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
      </div>
    </div>

    <!-- Liste des articles -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div 
        v-for="article in articlesFiltres" 
        :key="article.id"
        class="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h4 class="text-lg font-semibold text-gray-900">{{ article.nom }}</h4>
            <p class="text-sm text-gray-600">{{ article.categorie }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <span 
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
              :class="getStockStatus(article).bg + ' ' + getStockStatus(article).color"
            >
              {{ getStockStatus(article).text }}
            </span>
            <div class="flex items-center space-x-1">
              <button
                @click="ajusterStock(article, 10)"
                class="text-green-600 hover:text-green-900"
                title="Ajouter 10"
              >
                <ArrowUpIcon class="h-4 w-4" />
              </button>
              <button
                @click="ajusterStock(article, -10)"
                class="text-red-600 hover:text-red-900"
                title="Retirer 10"
              >
                <ArrowDownIcon class="h-4 w-4" />
              </button>
              <button
                @click="openModal(article)"
                class="text-orange-600 hover:text-orange-900"
                title="Modifier"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                @click="deleteArticle(article.id)"
                class="text-red-600 hover:text-red-900"
                title="Supprimer"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-sm font-medium text-gray-700">Stock actuel</p>
            <p class="text-lg font-bold text-gray-900">{{ article.stock.toLocaleString() }} {{ article.unite }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">Prix unitaire</p>
                            <p class="text-lg font-bold text-gray-900">{{ article.prix.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">Seuil critique</p>
            <p class="text-sm text-gray-900">{{ article.seuilCritique.toLocaleString() }} {{ article.unite }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">Valeur stock</p>
                            <p class="text-sm text-gray-900">{{ (article.stock * article.prix).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
          </div>
        </div>

        <div class="mb-4">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">Niveau de stock</span>
            <span class="text-sm text-gray-500">{{ Math.round((article.stock / article.seuilCritique) * 100) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300"
              :class="getStockBarColor(article)"
              :style="{ width: `${Math.min((article.stock / article.seuilCritique) * 100, 100)}%` }"
            ></div>
          </div>
        </div>

        <div class="border-t border-gray-200 pt-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Fournisseur: {{ article.fournisseur }}</span>
            <span class="text-gray-500">MAJ: {{ new Date(article.derniereMiseAJour).toLocaleDateString('fr-FR') }}</span>
          </div>
          <p v-if="article.notes" class="text-sm text-gray-600 mt-2">{{ article.notes }}</p>
        </div>
      </div>
    </div>

    <!-- Modal pour ajouter/éditer -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-2xl bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ editingArticle ? 'Modifier l\'article' : 'Nouvel article' }}
          </h3>
          
          <form @submit.prevent="saveArticle" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'article</label>
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
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <select
                  v-model="newArticle.unite"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="">Sélectionner une unité</option>
                  <option v-for="unite in unites" :key="unite" :value="unite">
                    {{ unite }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (€)</label>
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
                <select
                  v-model="newArticle.fournisseur"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="">Sélectionner un fournisseur</option>
                  <option v-for="fournisseur in fournisseurs" :key="fournisseur" :value="fournisseur">
                    {{ fournisseur }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="newArticle.notes"
                rows="3"
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Notes optionnelles..."
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
              >
                {{ editingArticle ? 'Modifier' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

