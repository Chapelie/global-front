<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storageService, type Commande } from '../services/storage'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  ShoppingCartIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const commandes = ref<Commande[]>([])
const showModal = ref(false)
const editingCommande = ref<Commande | null>(null)
const selectedDate = ref('')
const selectedStatut = ref('')
const selectedStatutLivraison = ref('')

// Charger les données depuis localStorage
onMounted(() => {
  loadCommandes()
})

const loadCommandes = () => {
  commandes.value = storageService.getCommandes()
}

const newCommande = ref({
  client: '',
  telephone: '',
  email: '',
  adresse: '',
  produits: [{ nom: '', quantite: 0, unite: 'pièces' }],
  statut: 'en_attente' as 'en_attente' | 'confirmee' | 'en_preparation' | 'livree' | 'annulee',
  numeroCommande: '',
  dateLivraisonSouhaitee: '' as string | undefined,
  priorite: 'normale' as 'basse' | 'normale' | 'haute' | 'urgente'
})

const statuts = [
  { value: 'en_attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  { value: 'confirmee', label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
  { value: 'en_preparation', label: 'En préparation', color: 'bg-orange-100 text-orange-800', icon: ShoppingCartIcon },
  { value: 'livree', label: 'Livrée', color: 'bg-green-100 text-green-800', icon: TruckIcon },
  { value: 'annulee', label: 'Annulée', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
]

// Statuts de livraison avec couleurs
const statutsLivraison = [
  { value: 'non_livre', label: 'Non livré', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
  { value: 'partiellement_livre', label: 'Partiellement livré', color: 'bg-orange-100 text-orange-800', icon: ClockIcon },
  { value: 'livre', label: 'Livré', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon }
]

const produits = [
  'Briques standard',
  'Briques creuses',
  'Briques pleines',
  'Ciment Portland',
  'Palettes',
  'Granit'
]

const priorites = [
  { value: 'basse', label: 'Basse', color: 'bg-gray-100 text-gray-800' },
  { value: 'normale', label: 'Normale', color: 'bg-blue-100 text-blue-800' },
  { value: 'haute', label: 'Haute', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800' }
]

const openModal = (commande?: Commande) => {
  if (commande) {
    editingCommande.value = commande
    newCommande.value = { 
      ...commande,
      dateLivraisonSouhaitee: commande.dateLivraisonSouhaitee || '' // Assurer que dateLivraisonSouhaitee n'est jamais undefined
    }
  } else {
    editingCommande.value = null
    newCommande.value = {
      client: '',
      telephone: '',
      email: '',
      adresse: '',
      produits: [{ nom: '', quantite: 0, unite: 'pièces' }],
      statut: 'en_attente',
      numeroCommande: storageService.generateNumeroCommande(),
      dateLivraisonSouhaitee: '',
      priorite: 'normale'
    }
  }
  showModal.value = true
}

const saveCommande = () => {
  const commandeData = {
    ...newCommande.value,
    date: new Date().toISOString().split('T')[0]
  }
  
  if (editingCommande.value) {
    storageService.updateCommande(editingCommande.value.id, commandeData)
  } else {
    storageService.addCommande(commandeData)
  }
  loadCommandes()
  showModal.value = false
  editingCommande.value = null
}

// Fonctions utilitaires pour l'affichage des états de livraison
const getStatutLivraisonColor = (statut: string) => {
  const statutLivraison = statutsLivraison.find(s => s.value === statut)
  return statutLivraison ? statutLivraison.color : 'bg-gray-100 text-gray-800'
}

const getStatutLivraisonLabel = (statut: string) => {
  const statutLivraison = statutsLivraison.find(s => s.value === statut)
  return statutLivraison ? statutLivraison.label : 'Inconnu'
}

const getStatutLivraisonIcon = (statut: string) => {
  const statutLivraison = statutsLivraison.find(s => s.value === statut)
  return statutLivraison ? statutLivraison.icon : ClockIcon
}

const deleteCommande = (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
    storageService.deleteCommande(id)
    loadCommandes()
  }
}

const confirmerCommande = (commande: Commande) => {
  storageService.updateCommande(commande.id, { statut: 'confirmee' })
  loadCommandes()
}

const preparerCommande = (commande: Commande) => {
  storageService.updateCommande(commande.id, { statut: 'en_preparation' })
  loadCommandes()
}

const creerLivraison = (commande: Commande) => {
  // Créer une livraison automatiquement à partir de la commande
  const livraison = {
    numeroBL: storageService.generateNumeroBL(),
    date: new Date().toISOString().split('T')[0],
    client: commande.client,
    telephone: commande.telephone,
    chauffeur: '', // À assigner par le manager
    produits: commande.produits.map(p => ({
      nom: p.nom,
      quantite: p.quantite,
      unite: p.unite,
      quantiteCommandee: p.quantite,
      quantiteLivree: 0,
      difference: p.quantite,
      resteAPayer: 0
    })),
    statut: 'en_attente' as const,
    adresse: commande.adresse,
    codeSuivi: storageService.generateCodeSuivi(),
    totalCommande: 0,
    totalLivraison: 0,
    differenceTotale: 0,
    resteAPayerTotal: 0
  }
  
  storageService.addLivraison(livraison)
  storageService.updateCommande(commande.id, { statut: 'livree' })
  loadCommandes()
  
  alert(`Livraison créée pour la commande ${commande.numeroCommande}`)
}

const addProduit = () => {
  newCommande.value.produits.push({ nom: '', quantite: 0, unite: 'pièces' })
}

const removeProduit = (index: number) => {
  newCommande.value.produits.splice(index, 1)
}

const getStatutInfo = (statut: string) => {
  return statuts.find(s => s.value === statut) || statuts[0]
}

const getPrioriteInfo = (priorite: string) => {
  return priorites.find(p => p.value === priorite) || priorites[1]
}

const commandesFiltrees = computed(() => {
  let filtered = commandes.value
  
  if (selectedDate.value) {
    filtered = filtered.filter(c => c.date === selectedDate.value)
  }
  
  if (selectedStatut.value) {
    filtered = filtered.filter(c => c.statut === selectedStatut.value)
  }
  
  if (selectedStatutLivraison.value) {
    filtered = filtered.filter(c => c.statutGlobalLivraison === selectedStatutLivraison.value)
  }
  
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const totalCommandes = computed(() => commandes.value.length)
const commandesEnAttente = computed(() => commandes.value.filter(c => c.statut === 'en_attente').length)
const commandesConfirmees = computed(() => commandes.value.filter(c => c.statut === 'confirmee').length)
const commandesEnPreparation = computed(() => commandes.value.filter(c => c.statut === 'en_preparation').length)

// Statistiques des états de livraison
const commandesNonLivrees = computed(() => commandes.value.filter(c => c.statutGlobalLivraison === 'non_livre').length)
const commandesPartiellementLivrees = computed(() => commandes.value.filter(c => c.statutGlobalLivraison === 'partiellement_livre').length)
const commandesLivrees = computed(() => commandes.value.filter(c => c.statutGlobalLivraison === 'livre').length)
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Commandes Clients</h2>
        <p class="mt-2 text-gray-600">Gestion des commandes et génération des livraisons</p>
      </div>
      <button
        @click="openModal()"
        class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Nouvelle commande
      </button>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <ShoppingCartIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total commandes</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalCommandes }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
            <ClockIcon class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">En attente</p>
            <p class="text-2xl font-bold text-gray-900">{{ commandesEnAttente }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <CheckCircleIcon class="h-6 w-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Confirmées</p>
            <p class="text-2xl font-bold text-gray-900">{{ commandesConfirmees }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
            <TruckIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">En préparation</p>
            <p class="text-2xl font-bold text-gray-900">{{ commandesEnPreparation }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques des états de livraison -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Non livrées</p>
            <p class="text-2xl font-bold text-gray-900">{{ commandesNonLivrees }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <ClockIcon class="h-6 w-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Partiellement livrées</p>
            <p class="text-2xl font-bold text-gray-900">{{ commandesPartiellementLivrees }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircleIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Livrées</p>
            <p class="text-2xl font-bold text-gray-900">{{ commandesLivrees }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Commandes récentes</h3>
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <CalendarIcon class="h-5 w-5 text-gray-400 mr-2" />
            <input
              v-model="selectedDate"
              type="date"
              class="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div class="flex items-center">
            <select
              v-model="selectedStatut"
              class="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="">Tous les statuts</option>
              <option v-for="statut in statuts" :key="statut.value" :value="statut.value">
                {{ statut.label }}
              </option>
            </select>
          </div>
          <div class="flex items-center">
            <select
              v-model="selectedStatutLivraison"
              class="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="">Tous les états de livraison</option>
              <option v-for="statut in statutsLivraison" :key="statut.value" :value="statut.value">
                {{ statut.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des commandes -->
    <div class="space-y-4">
      <div 
        v-for="commande in commandesFiltrees" 
        :key="commande.id"
        class="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
      >
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="text-lg font-semibold text-gray-900">{{ commande.numeroCommande }}</h4>
                <p class="text-sm text-gray-600">{{ commande.client }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatutInfo(commande.statut).color"
                >
                  <component :is="getStatutInfo(commande.statut).icon" class="h-3 w-3 mr-1" />
                  {{ getStatutInfo(commande.statut).label }}
                </span>
                <span 
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getPrioriteInfo(commande.priorite).color"
                >
                  {{ getPrioriteInfo(commande.priorite).label }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm font-medium text-gray-700">Date de commande</p>
                <p class="text-sm text-gray-900">{{ new Date(commande.date).toLocaleDateString('fr-FR') }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Livraison souhaitée</p>
                <p class="text-sm text-gray-900">{{ commande.dateLivraisonSouhaitee ? new Date(commande.dateLivraisonSouhaitee).toLocaleDateString('fr-FR') : 'Non spécifiée' }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Téléphone</p>
                <p class="text-sm text-gray-900">{{ commande.telephone }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Email</p>
                <p class="text-sm text-gray-900">{{ commande.email }}</p>
              </div>
            </div>

            <div class="mb-4">
              <p class="text-sm font-medium text-gray-700 mb-2">Adresse de livraison</p>
              <p class="text-sm text-gray-900">{{ commande.adresse }}</p>
            </div>

            <div class="mb-4">
              <p class="text-sm font-medium text-gray-700 mb-2">Produits commandés</p>
              <div class="space-y-2">
                <div 
                  v-for="produit in commande.produits" 
                  :key="produit.nom"
                  class="bg-gray-50 rounded-lg p-3"
                >
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-900">{{ produit.nom }}</span>
                    <span 
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="getStatutLivraisonColor(produit.statutLivraison || 'non_livre')"
                    >
                      <component :is="getStatutLivraisonIcon(produit.statutLivraison || 'non_livre')" class="h-3 w-3 mr-1" />
                      {{ getStatutLivraisonLabel(produit.statutLivraison || 'non_livre') }}
                    </span>
                  </div>
                  <div class="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span class="text-gray-600">Commandé:</span>
                      <span class="font-medium text-gray-900 ml-1">{{ produit.quantite }} {{ produit.unite }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Livré:</span>
                      <span class="font-medium text-gray-900 ml-1">{{ produit.quantiteLivree || 0 }} {{ produit.unite }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Reste:</span>
                      <span class="font-medium text-gray-900 ml-1">{{ produit.quantiteRestante || produit.quantite }} {{ produit.unite }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- État global de livraison -->
            <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-blue-900">État global de livraison</p>
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatutLivraisonColor(commande.statutGlobalLivraison || 'non_livre')"
                >
                  <component :is="getStatutLivraisonIcon(commande.statutGlobalLivraison || 'non_livre')" class="h-3 w-3 mr-1" />
                  {{ getStatutLivraisonLabel(commande.statutGlobalLivraison || 'non_livre') }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-blue-600">Total livré:</span>
                  <span class="font-medium text-blue-900 ml-1">{{ commande.totalLivraisons || 0 }}</span>
                </div>
                <div>
                  <span class="text-blue-600">Total restant:</span>
                  <span class="font-medium text-blue-900 ml-1">{{ commande.totalRestant || commande.produits.reduce((sum, p) => sum + p.quantite, 0) }}</span>
                </div>
              </div>
            </div>


          </div>

          <!-- Actions -->
          <div class="mt-4 lg:mt-0 lg:ml-4">
            <div class="flex flex-col space-y-2">
              <button
                v-if="commande.statut === 'en_attente'"
                @click="confirmerCommande(commande)"
                class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Confirmer
              </button>
              <button
                v-if="commande.statut === 'confirmee'"
                @click="preparerCommande(commande)"
                class="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Préparer
              </button>
              <button
                v-if="commande.statut === 'en_preparation'"
                @click="creerLivraison(commande)"
                class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                Créer livraison
              </button>
              <button
                @click="openModal(commande)"
                class="px-3 py-2 text-orange-600 hover:text-orange-900 transition-colors text-sm"
              >
                Modifier
              </button>
              <button
                @click="deleteCommande(commande.id)"
                class="px-3 py-2 text-red-600 hover:text-red-900 transition-colors text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
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
                <ShoppingCartIcon class="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">
                  {{ editingCommande ? 'Modifier la commande' : 'Nouvelle commande' }}
                </h3>
                <p class="text-sm text-gray-500">Gestion des commandes clients</p>
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
          <form id="commande-form" @submit.prevent="saveCommande" class="space-y-6">
            <!-- Informations de suivi -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Informations de suivi</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Numéro de commande</label>
                  <input
                    v-model="newCommande.numeroCommande"
                    type="text"
                    readonly
                    class="w-full rounded-lg border-gray-300 bg-white text-gray-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                  <select
                    v-model="newCommande.priorite"
                    required
                    class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  >
                    <option v-for="priorite in priorites" :key="priorite.value" :value="priorite.value">
                      {{ priorite.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Informations de base -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 rounded-xl p-4">
                <h4 class="font-semibold text-gray-900 mb-3">Informations de base</h4>
                <div class="space-y-4">
                  

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      v-model="newCommande.statut"
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

              <div class="bg-gray-50 rounded-xl p-4">
                <h4 class="font-semibold text-gray-900 mb-3">Informations client</h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <input
                      v-model="newCommande.client"
                      type="text"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                      placeholder="Nom du client"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      v-model="newCommande.telephone"
                      type="tel"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                      placeholder="Numéro de téléphone"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      v-model="newCommande.email"
                      type="email"
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                      placeholder="Adresse email"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Informations de livraison -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Informations de livraison</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Adresse de livraison</label>
                  <input
                    v-model="newCommande.adresse"
                    type="text"
                    required
                    class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                    placeholder="Adresse complète"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Date de livraison souhaitée</label>
                  <input
                    v-model="newCommande.dateLivraisonSouhaitee"
                    type="date"
                    class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <!-- Produits -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Produits commandés</h4>
              <div class="space-y-4">
                <div 
                  v-for="(produit, index) in newCommande.produits" 
                  :key="index"
                  class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
                >
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Produit</label>
                    <select
                      v-model="produit.nom"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                    >
                      <option value="">Sélectionner un produit</option>
                      <option v-for="p in produits" :key="p" :value="p">{{ p }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                    <input
                      v-model.number="produit.quantite"
                      type="number"
                      required
                      min="0"
                      placeholder="0"
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Unité</label>
                    <select
                      v-model="produit.unite"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                    >
                      <option value="pièces">Pièces</option>
                      <option value="tonnes">Tonnes</option>
                      <option value="m³">m³</option>
                      <option value="palettes">Palettes</option>
                    </select>
                  </div>
                  <div class="flex items-center">
                    <button
                      v-if="newCommande.produits.length > 1"
                      type="button"
                      @click="removeProduit(index)"
                      class="text-red-600 hover:text-red-800 p-2"
                      title="Supprimer ce produit"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  @click="addProduit"
                  class="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center"
                >
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter un produit
                </button>
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
              form="commande-form"
              class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {{ editingCommande ? 'Modifier la commande' : 'Créer la commande' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
