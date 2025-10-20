<template>
  <div class="flex flex-col">
    <!-- Header moderne -->
    <div class="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-8 mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold mb-2">Gestion de la Production</h1>
          <p class="text-green-100 text-lg">Planifiez et suivez vos productions</p>
        </div>
        <div>
          <button @click="openModal()" class="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center">
            <PlusIcon class="h-5 w-5 mr-2" />
            Nouvelle Production
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="mb-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="h-12 w-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
            <CogIcon class="h-8 w-8" />
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-600 mb-2">Total Productions</h3>
            <p class="text-3xl font-bold text-gray-900">{{ productions.length }}</p>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="h-12 w-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
            <ClockIcon class="h-8 w-8" />
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-600 mb-2">En Attente</h3>
            <p class="text-3xl font-bold text-gray-900">{{ productionsEnAttente }}</p>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="h-12 w-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
            <ArrowUpIcon class="h-8 w-8" />
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-600 mb-2">En Cours</h3>
            <p class="text-3xl font-bold text-gray-900">{{ productionsEnCours }}</p>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div class="h-12 w-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
            <CheckCircleIcon class="h-8 w-8" />
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-600 mb-2">Terminées</h3>
            <p class="text-3xl font-bold text-gray-900">{{ productionsTerminees }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
          <select v-model="selectedStatut" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="annule">Annulé</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
          <div class="relative">
            <MagnifyingGlassIcon class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              v-model="searchTerm" 
              type="text" 
              placeholder="Rechercher par lot, article..." 
              class="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input 
            v-model="selectedDate" 
            type="date" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- Liste des productions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div 
        v-for="production in filteredProductions" 
        :key="production.id"
        class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900">{{ production.lotId || production.lot_id }}</h3>
            <p class="text-gray-600">{{ formatDate(production.date) }}</p>
          </div>
          <div :class="['px-3 py-1 rounded-full text-sm font-medium', getStatutClass(production.statut)]">
            {{ getStatutText(production.statut) }}
          </div>
        </div>
        
        <div class="flex flex-col mb-4">
          <div class="flex items-center text-sm text-gray-600 mb-2">
            <CalendarIcon class="h-4 w-4 mr-2" />
            <span>{{ formatDate(production.date) }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600 mb-2">
            <ClockIcon class="h-4 w-4 mr-2" />
            <span>{{ production.tempsEffectif || 0 }}h</span>
          </div>
          <div class="flex items-center text-sm text-gray-600 mb-2">
            <CogIcon class="h-4 w-4 mr-2" />
            <span>{{ production.articlesProduits?.length || 0 }} articles</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon class="h-4 w-4 mr-2" />
            <span>{{ formatCurrency(production.coutProduction || 0) }}</span>
          </div>
        </div>

        <div class="mb-4">
          <h4 class="font-semibold text-gray-900 mb-2">Articles produits ({{ production.articlesProduits?.length || 0 }})</h4>
          <div class="flex flex-col">
            <div
              v-for="(article, index) in production.articlesProduits || []"
              :key="article.nom || index"
              class="flex justify-between text-sm mb-1"
            >
              <span class="text-gray-900">{{ article.nom }}</span>
              <span class="text-gray-600">{{ article.quantiteProduite }} {{ article.unite }}</span>
            </div>
          </div>
        </div>

        <div class="mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Rendement:</span>
            <span class="font-semibold text-gray-900">{{ production.rendement || 0 }}%</span>
          </div>
        </div>

        <div class="flex gap-2">
          <button 
            @click="openModal(production)" 
            class="px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            <PencilIcon class="h-4 w-4 mr-2" />
            Modifier
          </button>
          <button 
            @click="handleDeleteProduction(production.id)" 
            class="px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center bg-red-600 text-white hover:bg-red-700"
          >
            <TrashIcon class="h-4 w-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de création/édition -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">{{ editingProduction ? 'Modifier la production' : 'Nouvelle production' }}</h2>
          <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="saveProduction" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input 
                v-model="newProduction.date" 
                type="date" 
                required 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

         

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select v-model="newProduction.statut" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="en_attente">En attente</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Temps effectif (heures)</label>
              <input 
                v-model.number="newProduction.tempsEffectif" 
                type="number" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rendement (%)</label>
              <input 
                v-model.number="newProduction.rendement" 
                type="number" 
                min="0" 
                max="100" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Coût de production</label>
              <input 
                v-model.number="newProduction.coutProduction" 
                type="number" 
                step="0.01" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Articles produits</label>
            <div class="flex flex-col">
              <div 
                v-for="(article, index) in newProduction.articlesProduits" 
                :key="index"
                class="flex gap-2 items-center mb-3"
              >
                <select v-model="article.nom" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Sélectionner un article</option>
                  <option 
                    v-for="art in articlesDisponibles" 
                    :key="art.nom" 
                    :value="art.nom"
                  >
                    {{ art.nom }} (Stock: {{ art.stock }} {{ art.unite }})
                  </option>
                </select>
                <input 
                  v-model.number="article.quantiteProduite" 
                  type="number" 
                  placeholder="Quantité produite" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input 
                  v-model="article.unite" 
                  placeholder="Unité" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button 
                  type="button" 
                  @click="removeArticle(index)" 
                  class="px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
              <button 
                type="button" 
                @click="addArticle" 
                class="px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                <PlusIcon class="h-4 w-4" />
                Ajouter un article
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button type="button" @click="closeModal" class="px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300">
              Annuler
            </button>
            <button type="submit" class="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center">
              {{ editingProduction ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'
import { useLaravelApi, type LaravelProduction } from '../services/laravelApiService'

const { getProductions, addProduction, updateProduction, deleteProduction, getArticles } = useLaravelApi()

const productions = ref<LaravelProduction[]>([])
const articlesDisponibles = ref<any[]>([])
const showModal = ref(false)
const editingProduction = ref<LaravelProduction | null>(null)
const selectedStatut = ref('')
const selectedDate = ref('')
const searchTerm = ref('')

const newProduction = ref({
  date: new Date().toISOString().split('T')[0],
  lotId: '',
  statut: 'en_attente' as 'en_attente' | 'en_cours' | 'termine' | 'annule',
  articlesProduits: [{ nom: '', quantiteProduite: 0, unite: '' }],
  tempsEffectif: 0,
  rendement: 0,
  coutProduction: 0
})

const filteredProductions = computed(() => {
  let filtered = productions.value

  if (selectedStatut.value) {
    filtered = filtered.filter(p => p.statut === selectedStatut.value)
  }

  if (selectedDate.value) {
    filtered = filtered.filter(p => p.date === selectedDate.value)
  }

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.articlesProduits?.some((article: any) => article.nom.toLowerCase().includes(term)) || false
    )
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Fonction pour parser les notes de production
const parseProductionNotes = (notes: string) => {
  const defaultValues = {
    tempsEffectif: 0,
    rendement: 0,
    coutProduction: 0,
    statut: 'en_attente',
    lotId: ''
  }

  if (!notes) return defaultValues

  try {
    // Parser le format: "Statut: termine, Temps effectif: 12h, Rendement: 10%, Lot ID: 123, Coût: 10€"
    const parts = notes.split(', ')
    const data: typeof defaultValues & { lotId: string } = { ...defaultValues }

    parts.forEach(part => {
      if (part.includes('Statut:')) {
        data.statut = part.split('Statut: ')[1]?.trim() || 'en_attente'
      } else if (part.includes('Temps effectif:')) {
        const temps = part.split('Temps effectif: ')[1]?.replace('h', '').trim()
        data.tempsEffectif = parseInt(temps) || 0
      } else if (part.includes('Rendement:')) {
        const rendement = part.split('Rendement: ')[1]?.replace('%', '').trim()
        data.rendement = parseInt(rendement) || 0
      } else if (part.includes('Lot ID:')) {
        data.lotId = part.split('Lot ID: ')[1]?.trim() || ''
      } else if (part.includes('Coût:')) {
        const cout = part.split('Coût: ')[1]?.replace('€', '').trim()
        data.coutProduction = parseFloat(cout) || 0
      }
    })

    return data
  } catch (error) {
    console.error('Erreur lors du parsing des notes:', error)
    return defaultValues
  }
}

const productionsEnAttente = computed(() => productions.value.filter(p => p.statut === 'en_attente').length)
const productionsEnCours = computed(() => productions.value.filter(p => p.statut === 'en_cours').length)
const productionsTerminees = computed(() => productions.value.filter(p => p.statut === 'termine').length)

const loadProductions = async () => {
  try {
    console.log('🔍 [ProductionView] Chargement des productions')
    productions.value = await getProductions()
    console.log('✅ [ProductionView] Productions chargées:', productions.value.length)
  } catch (error) {
    console.error('❌ [ProductionView] Erreur lors du chargement des productions:', error)
    alert('Erreur lors du chargement des productions')
  }
}

const loadArticlesDisponibles = async () => {
  try {
    console.log('🔍 [ProductionView] Chargement des articles')
    const articles = await getArticles()
    articlesDisponibles.value = articles.map(article => ({
      id: article.id,
      nom: article.nom,
      stock: article.stock,
      unite: article.unite,
      prix: article.prix
    }))
    console.log('✅ [ProductionView] Articles chargés:', articlesDisponibles.value.length)
  } catch (error) {
    console.error('❌ [ProductionView] Erreur lors du chargement des articles:', error)
    articlesDisponibles.value = []
  }
}

const openModal = (production?: LaravelProduction) => {
  if (production) {
    editingProduction.value = production
    newProduction.value = {
      date: production.date,
      lotId: production.lotId || production.lot_id || '',
      statut: production.statut as 'en_attente' | 'en_cours' | 'termine' | 'annule',
      articlesProduits: production.articlesProduits || [],
      tempsEffectif: production.tempsEffectif || 0,
      rendement: production.rendement || 0,
      coutProduction: production.coutProduction || 0
    }
  } else {
    editingProduction.value = null
    newProduction.value = {
      date: new Date().toISOString().split('T')[0],
      lotId: '',
      statut: 'en_attente' as 'en_attente' | 'en_cours' | 'termine' | 'annule',
      articlesProduits: [{ nom: '', quantiteProduite: 0, unite: '' }],
      tempsEffectif: 0,
      rendement: 0,
      coutProduction: 0
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProduction.value = null
}

const saveProduction = async () => {
  try {
    console.log('🔍 [ProductionView] Sauvegarde de la production')

    // Valider qu'il y a au moins un article sélectionné
    if (!newProduction.value.articlesProduits || newProduction.value.articlesProduits.length === 0 || !newProduction.value.articlesProduits[0]?.nom) {
      alert('Veuillez sélectionner au moins un article à produire')
      return
    }

    // Trouver l'article sélectionné pour obtenir son ID
    const selectedArticle = articlesDisponibles.value.find(art => art.nom === newProduction.value.articlesProduits[0].nom)
    if (!selectedArticle) {
      alert('Article sélectionné non trouvé')
      return
    }

    // Mapper les données frontend vers le format backend
    const productionData = {
      product_id: selectedArticle.id,
      quantity: newProduction.value.articlesProduits[0].quantiteProduite,
      production_date: newProduction.value.date,
      notes: `Statut: ${newProduction.value.statut}, Temps effectif: ${newProduction.value.tempsEffectif}h, Rendement: ${newProduction.value.rendement}%, Lot ID: ${newProduction.value.lotId}, Coût: ${newProduction.value.coutProduction}€`
    }

    console.log('🔍 [ProductionView] Données mappées:', productionData)

    if (editingProduction.value) {
      await updateProduction(editingProduction.value.id, productionData)
      console.log('✅ [ProductionView] Production mise à jour')
    } else {
      await addProduction(productionData)
      console.log('✅ [ProductionView] Production créée')
    }

    await loadProductions()
    closeModal()
    alert('Production enregistrée avec succès!')
  } catch (error) {
    console.error('❌ [ProductionView] Erreur lors de la sauvegarde:', error)
    alert('Erreur lors de la sauvegarde de la production')
  }
}

const handleDeleteProduction = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette production ?')) {
    try {
      console.log('🔍 [ProductionView] Suppression de la production:', id)
      await deleteProduction(id)
      await loadProductions()
      console.log('✅ [ProductionView] Production supprimée')
    } catch (error) {
      console.error('❌ [ProductionView] Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la production')
    }
  }
}

const addArticle = () => {
  newProduction.value.articlesProduits.push({ 
    nom: '', 
    quantiteProduite: 0, 
    unite: '' 
  })
}

const removeArticle = (index: number) => {
  newProduction.value.articlesProduits.splice(index, 1)
}

const getStatutClass = (statut: string) => {
  const classes = {
    'en_attente': 'bg-yellow-100 text-yellow-800',
    'en_cours': 'bg-blue-100 text-blue-800',
    'termine': 'bg-green-100 text-green-800',
    'annule': 'bg-red-100 text-red-800'
  }
  return classes[statut as keyof typeof classes] || 'bg-yellow-100 text-yellow-800'
}

const getStatutText = (statut: string) => {
  const texts = {
    'en_attente': 'En attente',
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'annule': 'Annulé'
  }
  return texts[statut as keyof typeof texts] || statut
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

onMounted(async () => {
  await loadProductions()
  await loadArticlesDisponibles()
})
</script>

<style scoped>
/* Styles supprimés pour respecter votre demande de ne pas modifier les styles */
</style>
