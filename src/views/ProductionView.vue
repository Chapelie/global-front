<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storageService, type Production, type Article } from '../services/storage'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  CubeIcon,
  ArchiveBoxIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/vue/24/outline'

const productions = ref<Production[]>([])
const showModal = ref(false)
const editingProduction = ref<Production | null>(null)
const selectedDate = ref('')

// Obtenir les articles disponibles pour la production
const articlesDisponibles = computed(() => {
  const stock = storageService.getStock()
  console.log('Stock complet:', stock)
  const articlesActifs = stock.filter(article => article.actif)
  console.log('Articles actifs:', articlesActifs)
  return articlesActifs
})

// Charger les données depuis localStorage
onMounted(() => {
  loadProductions()
})

const loadProductions = () => {
  const productionsData = storageService.getProductions()
  
  // Migrer les anciennes productions vers la nouvelle structure
  const productionsMigrees = productionsData.map(production => {
    // Si la production a déjà la nouvelle structure, la laisser telle quelle
    if (production.articlesProduits && Array.isArray(production.articlesProduits)) {
      return production
    }
    
    // Sinon, migrer vers la nouvelle structure
    // Note: Cette migration est temporaire pour la compatibilité
    console.log('Migration de la production:', production.id)
    return {
      ...production,
      articlesProduits: [
        {
          articleId: 1, // Article par défaut (briques)
          quantiteProduite: (production as any).briquesProduites || 0,
          quantitePlanifiee: (production as any).briquesProduites || 0,
          unite: 'pièces'
        }
      ]
    }
  })
  
  productions.value = productionsMigrees
}

const newProduction = ref({
  date: '',
  articlesProduits: [] as Array<{
    articleId: number
    quantiteProduite: number
    quantitePlanifiee: number
    unite: string
  }>,
  statut: 'en_attente' as 'en_attente' | 'en_cours' | 'termine',
  lotId: '',
  heureDebut: '',
  heureFin: ''
})

const statuts = [
  { value: 'en_attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'en_cours', label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  { value: 'termine', label: 'Terminé', color: 'bg-green-100 text-green-800' }
]

// Calculer les totaux de production par type d'article
const totalProductionParType = computed(() => {
  const totaux: Record<string, number> = {}
  
  productions.value.forEach(production => {
    // Vérifier que la production a la nouvelle structure
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
      // Vérifier que la production a la nouvelle structure
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
  if (!selectedDate.value) return productions.value
  return productions.value.filter(p => p.date === selectedDate.value)
})

const openModal = (production?: Production) => {
  if (production) {
    editingProduction.value = production
    newProduction.value = { 
      date: production.date,
      articlesProduits: [...production.articlesProduits],
      statut: production.statut,
      lotId: production.lotId,
      heureDebut: production.heureDebut || '',
      heureFin: production.heureFin || ''
    }
  } else {
    editingProduction.value = null
    newProduction.value = {
      date: new Date().toISOString().split('T')[0],
      articlesProduits: [],
      statut: 'en_attente',
      lotId: storageService.generateLotId(),
      heureDebut: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      heureFin: ''
    }
  }
  showModal.value = true
}

const saveProduction = () => {
  if (newProduction.value.articlesProduits.length === 0) {
    alert('Veuillez ajouter au moins un article à produire')
    return
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
  storageService.updateProduction(production.id, {
    statut: 'termine',
    heureFin: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  })
  loadProductions()
}

const getStatutInfo = (statut: string) => {
  return statuts.find(s => s.value === statut) || statuts[0]
}

const getArticleInfo = (articleId: number) => {
  return articlesDisponibles.value.find(a => a.id === articleId)
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

const onArticleChange = (index: number) => {
  console.log('onArticleChange appelé avec index:', index)
  console.log('Article sélectionné:', newProduction.value.articlesProduits[index].articleId)
  const article = articlesDisponibles.value.find(a => a.id === newProduction.value.articlesProduits[index].articleId)
  console.log('Article trouvé:', article)
  if (article) {
    newProduction.value.articlesProduits[index].unite = article.unite
    newProduction.value.articlesProduits[index].quantitePlanifiee = article.capaciteProduction
    newProduction.value.articlesProduits[index].quantiteProduite = 0
    console.log('Article mis à jour:', newProduction.value.articlesProduits[index])
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Production</h2>
        <p class="mt-2 text-gray-600">Gestion de la production d'articles</p>
      </div>
      <button
        @click="openModal()"
        class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Nouvelle production
      </button>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <CubeIcon class="h-6 w-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Production aujourd'hui</p>
            <p class="text-2xl font-bold text-gray-900">{{ productionAujourdhui.toLocaleString() }}</p>
            <p class="text-sm text-gray-500">articles</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <ArchiveBoxIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total briques</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalProductionParType.brique || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
            <ClockIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">En cours</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ productionsEnCours.length }}
            </p>
            <p class="text-sm text-gray-500">lots</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Production récente</h3>
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <CalendarIcon class="h-5 w-5 text-gray-400 mr-2" />
            <input
              v-model="selectedDate"
              type="date"
              class="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des productions -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Articles
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantités
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lot ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="production in productionsFiltrees" :key="production.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ new Date(production.date).toLocaleDateString('fr-FR') }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div v-if="production.articlesProduits && Array.isArray(production.articlesProduits)" class="space-y-1">
                  <div v-for="article in production.articlesProduits" :key="article.articleId" class="flex items-center space-x-2">
                    <span class="font-medium">{{ getArticleInfo(article.articleId)?.nom || 'Article inconnu' }}</span>
                    <span class="text-gray-500">({{ article.quantiteProduite }} {{ article.unite }})</span>
                  </div>
                </div>
                <div v-else class="text-gray-400 italic">
                  Ancienne structure - à migrer
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div v-if="production.articlesProduits && Array.isArray(production.articlesProduits)" class="space-y-1">
                  <div v-for="article in production.articlesProduits" :key="article.articleId">
                    <span class="font-medium">{{ article.quantiteProduite }}</span>
                    <span class="text-gray-500">/ {{ article.quantitePlanifiee }} {{ article.unite }}</span>
                  </div>
                </div>
                <div v-else class="text-gray-400 italic">
                  -
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                {{ production.lotId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getStatutInfo(production.statut).color"
                >
                  {{ getStatutInfo(production.statut).label }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    v-if="production.statut === 'en_attente'"
                    @click="startProduction(production)"
                    class="text-green-600 hover:text-green-900"
                    title="Démarrer"
                  >
                    <PlayIcon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="production.statut === 'en_cours'"
                    @click="stopProduction(production)"
                    class="text-red-600 hover:text-red-900"
                    title="Arrêter"
                  >
                    <StopIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="openModal(production)"
                    class="text-orange-600 hover:text-orange-900"
                    title="Modifier"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="deleteProduction(production.id)"
                    class="text-red-600 hover:text-red-900"
                    title="Supprimer"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal pour ajouter/éditer -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                <CubeIcon class="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">
                  {{ editingProduction ? 'Modifier la production' : 'Nouvelle production' }}
                </h3>
                <p class="text-sm text-gray-500">Gestion des lots de production d'articles</p>
              </div>
            </div>
            <button
              @click="showModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
          
        <!-- Content -->
        <div class="p-6">
          <form id="production-form" @submit.prevent="saveProduction" class="space-y-6">
            <!-- Informations de base -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Informations de base</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Date de production</label>
                  <input
                    v-model="newProduction.date"
                    type="date"
                    required
                    class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Statut du lot</label>
                  <select
                    v-model="newProduction.statut"
                    required
                    class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  >
                    <option v-for="statut in statuts" :key="statut.value" :value="statut.value">
                      {{ statut.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Articles à produire -->
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-gray-900">Articles à produire</h4>
                <button
                  type="button"
                  @click="addArticleToProduction"
                  class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  + Ajouter un article
                </button>
              </div>
              
              <div v-if="newProduction.articlesProduits.length === 0" class="text-center py-8 text-gray-500">
                <p>Aucun article ajouté</p>
                <p class="text-sm">Cliquez sur "Ajouter un article" pour commencer</p>
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="(article, index) in newProduction.articlesProduits" 
                  :key="index"
                  class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Article</label>
                    <select
                      v-model="article.articleId"
                      @change="onArticleChange(index)"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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
                    <!-- Debug: afficher le nombre d'articles disponibles -->
                    <p class="text-xs text-gray-500 mt-1">
                      {{ articlesDisponibles.length }} articles disponibles
                    </p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Quantité planifiée</label>
                    <input
                      v-model.number="article.quantitePlanifiee"
                      type="number"
                      required
                      min="0"
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Quantité produite</label>
                    <input
                      v-model.number="article.quantiteProduite"
                      type="number"
                      required
                      min="0"
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div class="flex items-end space-x-2">
                    <div class="flex-1">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                      <input
                        v-model="article.unite"
                        type="text"
                        readonly
                        class="w-full rounded-lg border-gray-300 bg-gray-100"
                      />
                    </div>
                    
                    <button
                      type="button"
                      @click="removeArticleFromProduction(index)"
                      class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Supprimer cet article"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Horaires -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Horaires de production</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Heure de début</label>
                  <input
                    v-model="newProduction.heureDebut"
                    type="time"
                    class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Heure de fin</label>
                  <input
                    v-model="newProduction.heureFin"
                    type="time"
                    class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>
            </div>


          </form>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div class="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="production-form"
              class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {{ editingProduction ? 'Modifier la production' : 'Créer la production' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
