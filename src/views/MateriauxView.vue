<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLaravelApi } from '../services/laravelApiService'
import { useAlert } from '../composables/useAlert'
import { useRoles } from '../services/roles'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  TruckIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  TagIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

// Types pour les ciments et adjuvants
interface Ciment {
  id?: number
  nom: string
  type: string
  marque: string
  classe_resistance?: string
  prix_unitaire: number
  unite: string
  stock_actuel: number
  seuil_critique: number
  fournisseur?: string
  numero_lot?: string
  date_reception?: string
  date_expiration?: string
  specifications?: any
  notes?: string
  actif: boolean
  user_id?: number
  created_at?: string
  updated_at?: string
}

interface Adjuvant {
  id?: number
  nom: string
  type: string
  marque: string
  fonction?: string
  dosage_recommandee?: number
  prix_unitaire: number
  unite: string
  stock_actuel: number
  seuil_critique: number
  fournisseur?: string
  numero_lot?: string
  date_reception?: string
  date_expiration?: string
  specifications?: any
  notes?: string
  actif: boolean
  user_id?: number
  created_at?: string
  updated_at?: string
}

const { getCiments, addCiment, updateCiment, deleteCiment, getAdjuvants, addAdjuvant, updateAdjuvant, deleteAdjuvant, updateCimentStock, updateAdjuvantStock } = useLaravelApi()
const { success, error, warning, info, confirmDialog } = useAlert()

// Permissions
const { canDeleteStock } = useRoles()

// État réactif
const activeTab = ref<'ciments' | 'adjuvants'>('ciments')
const ciments = ref<Ciment[]>([])
const adjuvants = ref<Adjuvant[]>([])
const showModal = ref(false)
const editingItem = ref<Ciment | Adjuvant | null>(null)
const isEditing = ref(false)

// Modal de réception de stock
const showReceptionModal = ref(false)
const receptionItem = ref<Ciment | Adjuvant | null>(null)
const receptionData = ref({
  quantite: 0,
  motif: 'Réception de stock',
  notes: ''
})

// Filtres
const searchQuery = ref('')
const selectedType = ref('')
const stockFilter = ref('all')

// Nouveau ciment (simplifié)
const newCiment = ref<Ciment>({
  nom: '',
  type: 'ciment', // Valeur par défaut
  marque: '', // Pas requis mais gardé pour compatibilité
  prix_unitaire: 0, // Pas requis mais gardé pour compatibilité
  unite: 'sac',
  stock_actuel: 0,
  seuil_critique: 100,
  actif: true
})

// Nouvel adjuvant
const newAdjuvant = ref<Adjuvant>({
  nom: '',
  type: 'plastifiant',
  marque: '',
  fonction: '',
  dosage_recommandee: 0,
  prix_unitaire: 0,
  unite: 'kg',
  stock_actuel: 0,
  seuil_critique: 50,
  fournisseur: '',
  numero_lot: '',
  date_reception: '',
  date_expiration: '',
  specifications: {},
  notes: '',
  actif: true
})

// Types de ciments
const typesCiment = [
  { value: 'portland', label: 'Portland' },
  { value: 'composite', label: 'Composite' },
  { value: 'pouzzolanique', label: 'Pouzzolanique' },
  { value: 'cendres_volantes', label: 'Cendres volantes' },
  { value: 'laitier', label: 'Laitier' }
]

// Types d'adjuvants
const typesAdjuvant = [
  { value: 'plastifiant', label: 'Plastifiant' },
  { value: 'accelerateur', label: 'Accélérateur' },
  { value: 'retardateur', label: 'Retardateur' },
  { value: 'superplastifiant', label: 'Superplastifiant' },
  { value: 'hydrofuge', label: 'Hydrofuge' },
  { value: 'colorant', label: 'Colorant' },
  { value: 'fibre', label: 'Fibre' }
]

// Fonctions de chargement
onMounted(async () => {
  await loadCiments()
  await loadAdjuvants()
})

const loadCiments = async () => {
  try {
    console.log('🔍 [MateriauxView] Chargement des ciments')
    ciments.value = await getCiments()
    console.log('✅ [MateriauxView] Ciments chargés:', ciments.value.length)
  } catch (err) {
    console.error('❌ [MateriauxView] Erreur lors du chargement des ciments:', err)
    await error('Erreur lors du chargement des ciments')
  }
}

const loadAdjuvants = async () => {
  try {
    console.log('🔍 [MateriauxView] Chargement des adjuvants')
    adjuvants.value = await getAdjuvants()
    console.log('✅ [MateriauxView] Adjuvants chargés:', adjuvants.value.length)
  } catch (err) {
    console.error('❌ [MateriauxView] Erreur lors du chargement des adjuvants:', err)
    await error('Erreur lors du chargement des adjuvants')
  }
}

// Fonctions de gestion des modals
const openModal = (item?: Ciment | Adjuvant) => {
  if (item) {
    editingItem.value = { ...item }
    isEditing.value = true
  } else {
    editingItem.value = activeTab.value === 'ciments' ? { ...newCiment.value } : { ...newAdjuvant.value }
    isEditing.value = false
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
  isEditing.value = false
}

// Fonctions CRUD
const saveItem = async () => {
  if (!editingItem.value) return

  // Validation selon le type
  if (activeTab.value === 'ciments') {
    if (!editingItem.value.nom || editingItem.value.stock_actuel < 0 || editingItem.value.seuil_critique < 0) {
      await warning('Veuillez remplir tous les champs requis pour le ciment')
      return
    }
  } else {
    if (!editingItem.value.nom || !editingItem.value.type || !editingItem.value.marque || 
        editingItem.value.prix_unitaire < 0 || editingItem.value.stock_actuel < 0 || editingItem.value.seuil_critique < 0) {
      await warning('Veuillez remplir tous les champs requis pour l\'adjuvant')
      return
    }
  }

  try {
    if (isEditing.value) {
      if (activeTab.value === 'ciments') {
        await updateCiment(editingItem.value.id!, editingItem.value as Ciment)
        await loadCiments()
      } else {
        await updateAdjuvant(editingItem.value.id!, editingItem.value as Adjuvant)
        await loadAdjuvants()
      }
    } else {
      if (activeTab.value === 'ciments') {
        await addCiment(editingItem.value as Ciment)
        await loadCiments()
      } else {
        await addAdjuvant(editingItem.value as Adjuvant)
        await loadAdjuvants()
      }
    }
    closeModal()
  } catch (err) {
    console.error('❌ [MateriauxView] Erreur lors de la sauvegarde:', err)
    await error('Erreur lors de la sauvegarde')
  }
}

const deleteItem = async (item: Ciment | Adjuvant) => {
  const confirmed = await confirmDialog('Êtes-vous sûr de vouloir supprimer cet élément ?')
  if (!confirmed) return

  try {
    if (activeTab.value === 'ciments') {
      await deleteCiment(item.id!)
      await loadCiments()
    } else {
      await deleteAdjuvant(item.id!)
      await loadAdjuvants()
    }
  } catch (err) {
    console.error('❌ [MateriauxView] Erreur lors de la suppression:', err)
    await error('Erreur lors de la suppression')
  }
}

// Réception de stock
const openReceptionModal = (item: Ciment | Adjuvant) => {
  receptionItem.value = item
  receptionData.value = {
    quantite: 0,
    motif: 'Réception de stock',
    notes: ''
  }
  showReceptionModal.value = true
}

const closeReceptionModal = () => {
  showReceptionModal.value = false
  receptionItem.value = null
  receptionData.value = {
    quantite: 0,
    motif: 'Réception de stock',
    notes: ''
  }
}

const saveReception = async () => {
  if (!receptionItem.value || receptionData.value.quantite <= 0) {
    await warning('Veuillez saisir une quantité valide')
    return
  }

  try {
    if (activeTab.value === 'ciments') {
      await updateCimentStock(
        receptionItem.value.id!,
        'ajout',
        receptionData.value.quantite,
        receptionData.value.motif,
        receptionData.value.notes
      )
      await success(`Stock de ${receptionItem.value.nom} mis à jour avec succès (+${receptionData.value.quantite} ${receptionItem.value.unite})`)
      await loadCiments()
    } else {
      await updateAdjuvantStock(
        receptionItem.value.id!,
        'ajout',
        receptionData.value.quantite,
        receptionData.value.motif,
        receptionData.value.notes
      )
      await success(`Stock de ${receptionItem.value.nom} mis à jour avec succès (+${receptionData.value.quantite} ${receptionItem.value.unite})`)
      await loadAdjuvants()
    }
    closeReceptionModal()
  } catch (err: any) {
    console.error('❌ [MateriauxView] Erreur lors de la réception:', err)
    await error(err.response?.data?.error || 'Erreur lors de la réception de stock')
  }
}

// Computed properties pour les filtres
const filteredCiments = computed(() => {
  let filtered = ciments.value

  if (searchQuery.value) {
    filtered = filtered.filter(ciment => 
      ciment.nom.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ciment.marque.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ciment.fournisseur?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter(ciment => ciment.type === selectedType.value)
  }

  if (stockFilter.value !== 'all') {
    filtered = filtered.filter(ciment => {
      switch (stockFilter.value) {
        case 'critique':
          return ciment.stock_actuel <= ciment.seuil_critique
        case 'rupture':
          return ciment.stock_actuel === 0
        case 'normal':
          return ciment.stock_actuel > ciment.seuil_critique
        default:
          return true
      }
    })
  }

  return filtered
})

const filteredAdjuvants = computed(() => {
  let filtered = adjuvants.value

  if (searchQuery.value) {
    filtered = filtered.filter(adjuvant => 
      adjuvant.nom.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      adjuvant.marque.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      adjuvant.fournisseur?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter(adjuvant => adjuvant.type === selectedType.value)
  }

  if (stockFilter.value !== 'all') {
    filtered = filtered.filter(adjuvant => {
      switch (stockFilter.value) {
        case 'critique':
          return adjuvant.stock_actuel <= adjuvant.seuil_critique
        case 'rupture':
          return adjuvant.stock_actuel === 0
        case 'normal':
          return adjuvant.stock_actuel > adjuvant.seuil_critique
        default:
          return true
      }
    })
  }

  return filtered
})

// Statistiques
const cimentStats = computed(() => {
  const total = ciments.value.length
  const stockCritique = ciments.value.filter(c => c.stock_actuel <= c.seuil_critique).length
  const rupture = ciments.value.filter(c => c.stock_actuel === 0).length
  const valeurTotale = ciments.value.reduce((sum, c) => sum + (c.stock_actuel * c.prix_unitaire), 0)

  return { total, stockCritique, rupture, valeurTotale }
})

const adjuvantStats = computed(() => {
  const total = adjuvants.value.length
  const stockCritique = adjuvants.value.filter(a => a.stock_actuel <= a.seuil_critique).length
  const rupture = adjuvants.value.filter(a => a.stock_actuel === 0).length
  const valeurTotale = adjuvants.value.reduce((sum, a) => sum + (a.stock_actuel * a.prix_unitaire), 0)

  return { total, stockCritique, rupture, valeurTotale }
})

// Fonctions utilitaires
const getStockStatus = (stock: number, seuil: number) => {
  if (stock === 0) return { label: 'Rupture', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
  if (stock <= seuil) return { label: 'Critique', color: 'bg-orange-100 text-orange-800', icon: ClockIcon }
  return { label: 'Normal', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Non définie'
  return new Date(dateString).toLocaleDateString('fr-FR')
}
</script>

<template>
  <div class="materiaux-container min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="header-content bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center mb-4 sm:mb-0">
            <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg mr-4">
              <CubeIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="page-title text-2xl font-bold text-gray-900">Gestion des Matériaux</h1>
              <p class="text-sm text-gray-600">Ciments et adjuvants de production</p>
            </div>
          </div>
          
          <button
            @click="openModal()"
            class="action-button inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Ajouter {{ activeTab === 'ciments' ? 'Ciment' : 'Adjuvant' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex">
            <button
              @click="activeTab = 'ciments'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-medium text-center transition-all duration-200',
                activeTab === 'ciments'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <CubeIcon class="h-5 w-5 mx-auto mb-2" />
              Ciments
            </button>
            <button
              @click="activeTab = 'adjuvants'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-medium text-center transition-all duration-200',
                activeTab === 'adjuvants'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <TagIcon class="h-5 w-5 mx-auto mb-2" />
              Adjuvants
            </button>
          </nav>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Total -->
        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <ArchiveBoxIcon class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total {{ activeTab === 'ciments' ? 'Ciments' : 'Adjuvants' }}</p>
                <p class="stat-value text-2xl font-bold text-gray-900">
                  {{ activeTab === 'ciments' ? cimentStats.total : adjuvantStats.total }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Critique -->
        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <ExclamationTriangleIcon class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Stock Critique</p>
                <p class="stat-value text-2xl font-bold text-gray-900">
                  {{ activeTab === 'ciments' ? cimentStats.stockCritique : adjuvantStats.stockCritique }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Rupture -->
        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <ExclamationTriangleIcon class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Rupture</p>
                <p class="stat-value text-2xl font-bold text-gray-900">
                  {{ activeTab === 'ciments' ? cimentStats.rupture : adjuvantStats.rupture }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Valeur Totale -->
        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <CurrencyDollarIcon class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Valeur Totale</p>
                <p class="stat-value text-2xl font-bold text-gray-900">
                  {{ formatCurrency(activeTab === 'ciments' ? cimentStats.valeurTotale : adjuvantStats.valeurTotale) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-card bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div class="filters-header px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Filtres</h3>
        </div>
        <div class="filters-content p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Recherche -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Nom, marque, fournisseur..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <!-- Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                v-model="selectedType"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Tous les types</option>
                <option
                  v-for="type in (activeTab === 'ciments' ? typesCiment : typesAdjuvant)"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </option>
              </select>
            </div>

            <!-- Stock -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">État du Stock</label>
              <select
                v-model="stockFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tous</option>
                <option value="normal">Normal</option>
                <option value="critique">Critique</option>
                <option value="rupture">Rupture</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des matériaux -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- Ciments -->
        <div
          v-if="activeTab === 'ciments'"
          v-for="ciment in filteredCiments"
          :key="ciment.id"
          class="materiau-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <div class="materiau-content p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ ciment.nom }}</h3>
                <p class="text-sm text-gray-600">{{ ciment.marque }}</p>
                <p class="text-xs text-gray-500">{{ ciment.type }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="openReceptionModal(ciment)"
                  class="p-2 text-gray-400 hover:text-green-500 transition-colors"
                  title="Réceptionner du stock"
                >
                  <ArrowDownTrayIcon class="h-4 w-4" />
                </button>
                <button
                  @click="openModal(ciment)"
                  class="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                  title="Modifier"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button
                  v-if="canDeleteStock"
                  @click="deleteItem(ciment)"
                  class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Supprimer"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <!-- Stock -->
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Stock</span>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-gray-900">{{ ciment.stock_actuel }} {{ ciment.unite }}</span>
                  <span
                    :class="getStockStatus(ciment.stock_actuel, ciment.seuil_critique).color"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  >
                    <component
                      :is="getStockStatus(ciment.stock_actuel, ciment.seuil_critique).icon"
                      class="h-3 w-3 mr-1"
                    />
                    {{ getStockStatus(ciment.stock_actuel, ciment.seuil_critique).label }}
                  </span>
                </div>
              </div>

              <!-- Prix -->
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Prix unitaire</span>
                <span class="text-sm font-medium text-gray-900">{{ formatCurrency(ciment.prix_unitaire) }}</span>
              </div>

              <!-- Fournisseur -->
              <div v-if="ciment.fournisseur" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Fournisseur</span>
                <span class="text-sm font-medium text-gray-900">{{ ciment.fournisseur }}</span>
              </div>

              <!-- Date d'expiration -->
              <div v-if="ciment.date_expiration" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Expiration</span>
                <span class="text-sm font-medium text-gray-900">{{ formatDate(ciment.date_expiration) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Adjuvants -->
        <div
          v-if="activeTab === 'adjuvants'"
          v-for="adjuvant in filteredAdjuvants"
          :key="adjuvant.id"
          class="materiau-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <div class="materiau-content p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ adjuvant.nom }}</h3>
                <p class="text-sm text-gray-600">{{ adjuvant.marque }}</p>
                <p class="text-xs text-gray-500">{{ adjuvant.type }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="openReceptionModal(adjuvant)"
                  class="p-2 text-gray-400 hover:text-green-500 transition-colors"
                  title="Réceptionner du stock"
                >
                  <ArrowDownTrayIcon class="h-4 w-4" />
                </button>
                <button
                  @click="openModal(adjuvant)"
                  class="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                  title="Modifier"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button
                  v-if="canDeleteStock"
                  @click="deleteItem(adjuvant)"
                  class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Supprimer"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <!-- Stock -->
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Stock</span>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-gray-900">{{ adjuvant.stock_actuel }} {{ adjuvant.unite }}</span>
                  <span
                    :class="getStockStatus(adjuvant.stock_actuel, adjuvant.seuil_critique).color"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  >
                    <component
                      :is="getStockStatus(adjuvant.stock_actuel, adjuvant.seuil_critique).icon"
                      class="h-3 w-3 mr-1"
                    />
                    {{ getStockStatus(adjuvant.stock_actuel, adjuvant.seuil_critique).label }}
                  </span>
                </div>
              </div>

              <!-- Prix -->
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Prix unitaire</span>
                <span class="text-sm font-medium text-gray-900">{{ formatCurrency(adjuvant.prix_unitaire) }}</span>
              </div>

              <!-- Dosage -->
              <div v-if="adjuvant.dosage_recommandee" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Dosage</span>
                <span class="text-sm font-medium text-gray-900">{{ adjuvant.dosage_recommandee }}%</span>
              </div>

              <!-- Fournisseur -->
              <div v-if="adjuvant.fournisseur" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Fournisseur</span>
                <span class="text-sm font-medium text-gray-900">{{ adjuvant.fournisseur }}</span>
              </div>

              <!-- Date d'expiration -->
              <div v-if="adjuvant.date_expiration" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Expiration</span>
                <span class="text-sm font-medium text-gray-900">{{ formatDate(adjuvant.date_expiration) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message si aucun résultat -->
      <div v-if="(activeTab === 'ciments' ? filteredCiments.length === 0 : filteredAdjuvants.length === 0)" class="text-center py-12">
        <CubeIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun {{ activeTab === 'ciments' ? 'ciment' : 'adjuvant' }} trouvé</h3>
        <p class="text-gray-600">Essayez de modifier vos filtres ou ajoutez un nouveau {{ activeTab === 'ciments' ? 'ciment' : 'adjuvant' }}.</p>
      </div>
    </div>

    <!-- Modal pour ajouter/modifier -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="closeModal"
    >
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="closeModal"></div>

        <div class="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <!-- Header -->
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="modal-title text-lg font-semibold text-white">
                  {{ isEditing ? 'Modifier' : 'Ajouter' }} {{ activeTab === 'ciments' ? 'Ciment' : 'Adjuvant' }}
                </h3>
                <p class="modal-subtitle text-sm text-orange-100">
                  {{ isEditing ? 'Modifiez les informations' : 'Renseignez les informations' }}
                </p>
              </div>
              <button
                @click="closeModal"
                class="text-orange-200 hover:text-white transition-colors"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Contenu -->
          <div class="px-6 py-6 max-h-96 overflow-y-auto bg-white">
            <form v-if="editingItem" @submit.prevent="saveItem" class="space-y-4">
              <!-- Nom -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  v-model="editingItem.nom"
                  type="text"
                  required
                  placeholder="Ex: Ciment Portland, Superplastifiant"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <!-- Type et Marque (seulement pour les adjuvants) -->
              <div v-if="activeTab === 'adjuvants'">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <input
                    v-model="editingItem.type"
                    type="text"
                    required
                    placeholder="Ex: Plastifiant"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Marque *</label>
                  <input
                    v-model="editingItem.marque"
                    type="text"
                    required
                    placeholder="Ex: Sika"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>


              <!-- Prix unitaire (seulement pour les adjuvants) -->
              <div v-if="activeTab === 'adjuvants'">
                <label class="block text-sm font-medium text-gray-700 mb-2">Prix unitaire (FCFA) *</label>
                <input
                  v-model="editingItem.prix_unitaire"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="Ex: 50000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <!-- Unité -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Unité *</label>
                <select
                  v-model="editingItem.unite"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="kg">kg</option>
                  <option value="tonne">tonne</option>
                  <option value="L">L</option>
                  <option value="m³">m³</option>
                </select>
              </div>

              <!-- Stock actuel -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stock actuel *</label>
                <input
                  v-model="editingItem.stock_actuel"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <!-- Seuil critique -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Seuil critique *</label>
                <input
                  v-model="editingItem.seuil_critique"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <!-- Fournisseur (seulement pour les adjuvants) -->
              <div v-if="activeTab === 'adjuvants'">
                <label class="block text-sm font-medium text-gray-700 mb-2">Fournisseur</label>
                <input
                  v-model="editingItem.fournisseur"
                  type="text"
                  placeholder="Ex: Sika"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <!-- Notes (seulement pour les adjuvants) -->
              <div v-if="activeTab === 'adjuvants'">
                <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  v-model="editingItem.notes"
                  rows="2"
                  placeholder="Informations supplémentaires..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                ></textarea>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              @click="closeModal"
              class="btn-cancel px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Annuler
            </button>
            <button
              @click="saveItem"
              class="btn-submit px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {{ isEditing ? 'Modifier' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de réception de stock -->
    <div
      v-if="showReceptionModal && receptionItem"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="closeReceptionModal"
    >
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="closeReceptionModal"></div>

        <div class="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <!-- Header -->
          <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h3 class="text-lg font-semibold text-white">
              Réceptionner du stock - {{ receptionItem.nom }}
            </h3>
            <p class="text-sm text-green-100 mt-1">
              Stock actuel: {{ receptionItem.stock_actuel }} {{ receptionItem.unite }}
            </p>
          </div>

          <!-- Contenu -->
          <div class="px-6 py-6 bg-white">
            <form @submit.prevent="saveReception" class="space-y-4">
              <!-- Quantité -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Quantité à réceptionner ({{ receptionItem.unite }}) *
                </label>
                <input
                  v-model.number="receptionData.quantite"
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Ex: 100"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p class="mt-1 text-sm text-gray-500">
                  Nouveau stock après réception: {{ (receptionItem.stock_actuel || 0) + (receptionData.quantite || 0) }} {{ receptionItem.unite }}
                </p>
              </div>

              <!-- Motif -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Motif</label>
                <input
                  v-model="receptionData.motif"
                  type="text"
                  placeholder="Ex: Réception de stock, Commande fournisseur"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
                <textarea
                  v-model="receptionData.notes"
                  rows="3"
                  placeholder="Informations supplémentaires..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                ></textarea>
              </div>

              <!-- Actions -->
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeReceptionModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
                >
                  Réceptionner
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles de base */
.materiaux-container {
  min-height: 100vh;
}

.page-title {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 700;
  color: #111827;
}

.action-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(to right, #f97316, #ea580c);
  color: white;
  font-weight: 500;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  transform: scale(1);
}

.action-button:hover {
  background: linear-gradient(to right, #ea580c, #dc2626);
  transform: scale(1.05);
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.stat-content {
  padding: 1.5rem;
}

.stat-value {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: #111827;
}

.filters-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filters-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.filters-content {
  padding: 1.5rem;
}

.materiau-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;
  transform: scale(1);
}

.materiau-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: scale(1.05);
}

.materiau-content {
  padding: 1.5rem;
}

/* Modal responsive pour mobile */
.mobile-modal-container {
  padding: 0;
  margin: 0;
}

.modal-container {
  margin: 0.5rem;
  max-height: calc(100vh - 1rem);
  width: calc(100% - 1rem);
  max-width: 32rem;
}

.modal-header-content {
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #f97316, #ea580c);
}

.modal-title {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  color: white;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #fed7aa;
}

.modal-body-content {
  padding: 1.5rem;
  max-height: 24rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-footer-content {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel,
.btn-submit {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.btn-cancel {
  color: #374151;
  background: white;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-submit {
  color: white;
  background: linear-gradient(to right, #f97316, #ea580c);
}

.btn-submit:hover {
  background: linear-gradient(to right, #ea580c, #dc2626);
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-container {
    margin: 0.25rem;
    max-height: calc(100vh - 0.5rem);
    width: calc(100% - 0.5rem);
  }

  .modal-body-content {
    max-height: calc(100vh - 12rem);
    padding: 1rem;
  }

  .modal-header-content {
    padding: 0.75rem 1rem;
  }

  .modal-footer-content {
    padding: 0.75rem 1rem;
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }

  .page-title {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .action-button {
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
  }

  .stat-content {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .filters-content {
    padding: 1rem;
  }

  .materiau-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .modal-container {
    margin: 0.125rem;
    max-height: calc(100vh - 0.25rem);
    width: calc(100% - 0.25rem);
  }

  .modal-body-content {
    max-height: calc(100vh - 10rem);
    padding: 0.75rem;
  }

  .modal-header-content {
    padding: 0.5rem 0.75rem;
  }

  .modal-footer-content {
    padding: 0.5rem 0.75rem;
  }

  .page-title {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .stat-content {
    padding: 0.75rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }

  .filters-content {
    padding: 0.75rem;
  }

  .materiau-content {
    padding: 0.75rem;
  }
}

/* Améliorations pour le scroll sur mobile */
.modal-body-content {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.modal-body-content::-webkit-scrollbar {
  width: 6px;
}

.modal-body-content::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.modal-body-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.modal-body-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Assurer que les inputs sont accessibles sur mobile */
input, select, textarea {
  font-size: 16px; /* Évite le zoom automatique sur iOS */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* Améliorer l'espacement des touches sur mobile */
button {
  min-height: 44px; /* Taille minimale recommandée pour les touches tactiles */
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

.materiau-card {
  animation: slideIn 0.3s ease-out;
}
</style>
