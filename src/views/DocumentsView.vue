<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storageService, type Livraison } from '../services/storage'
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  TruckIcon,
  ClipboardDocumentIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/vue/24/outline'

interface Document {
  id: number | string
  nom: string
  type: 'BL' | 'Facture' | 'Planification' | 'Certificat' | 'Contrat' | 'Rapport' | 'Autre'
  taille: string
  dateCreation: string
  createur: string
  description?: string
  url?: string
  livraisonId?: number
  statut?: 'draft' | 'genere' | 'envoye' | 'signe'
  client?: string
}

const livraisons = ref<Livraison[]>([])
const documentsUploades = ref<Document[]>([
  {
    id: 'doc_1',
    nom: 'Facture_Briqueterie_Janvier_2024.pdf',
    type: 'Facture',
    taille: '2.5 MB',
    dateCreation: '2024-01-15',
    createur: 'Admin',
    description: 'Facture fournisseur briqueterie',
    statut: 'genere'
  },
  {
    id: 'doc_2',
    nom: 'Plan_Production_Semaine_3.xlsx',
    type: 'Planification',
    taille: '1.2 MB',
    dateCreation: '2024-01-14',
    createur: 'Manager',
    description: 'Planning de production semaine 3',
    statut: 'genere'
  }
])

// Documents générés automatiquement depuis les livraisons (BL)
const documentsGeneres = computed(() => {
  return livraisons.value
    .filter(l => l.statut === 'livre' || l.statut === 'en_cours')
    .map(livraison => ({
      id: `bl_${livraison.id}`,
      nom: `BL_${livraison.numeroBL}_${livraison.client.replace(/\s+/g, '_')}.pdf`,
      type: 'BL' as const,
      taille: '0.8 MB',
      dateCreation: livraison.dateLivraison || livraison.date,
      createur: 'Système',
      description: `Bordereau de livraison pour ${livraison.client}`,
      livraisonId: livraison.id,
      statut: livraison.signatureClient ? ('signe' as const) : ('genere' as const),
      client: livraison.client
    }))
})

// Tous les documents (uploadés + générés)
const tousLesDocuments = computed(() => {
  return [...documentsUploades.value, ...documentsGeneres.value]
    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
})

const showUploadModal = ref(false)
const selectedFile = ref<File | null>(null)
const documentType = ref('')
const documentDescription = ref('')
const searchTerm = ref('')
const selectedTypeFilter = ref('')
const selectedStatutFilter = ref('')
const activeTab = ref<'tous' | 'bl' | 'uploads'>('tous')

const types = [
  'Facture',
  'Planification',
  'Certificat',
  'Contrat',
  'Rapport',
  'Autre'
]

const statuts = [
  { value: 'draft', label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
  { value: 'genere', label: 'Généré', color: 'bg-blue-100 text-blue-800' },
  { value: 'envoye', label: 'Envoyé', color: 'bg-orange-100 text-orange-800' },
  { value: 'signe', label: 'Signé', color: 'bg-green-100 text-green-800' }
]

// Documents filtrés
const documentsFiltres = computed(() => {
  let docs = tousLesDocuments.value

  // Filtrage par onglet
  if (activeTab.value === 'bl') {
    docs = docs.filter(d => d.type === 'BL')
  } else if (activeTab.value === 'uploads') {
    docs = docs.filter(d => d.type !== 'BL')
  }

  // Filtrage par recherche
  if (searchTerm.value) {
    docs = docs.filter(d =>
      d.nom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      d.client?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  // Filtrage par type
  if (selectedTypeFilter.value) {
    docs = docs.filter(d => d.type === selectedTypeFilter.value)
  }

  // Filtrage par statut
  if (selectedStatutFilter.value) {
    docs = docs.filter(d => d.statut === selectedStatutFilter.value)
  }

  return docs
})

const loadLivraisons = () => {
  livraisons.value = storageService.getLivraisons()
}

const uploadDocument = () => {
  if (selectedFile.value) {
    const newDoc: Document = {
      id: `upload_${Date.now()}`,
      nom: selectedFile.value.name,
      type: documentType.value as Document['type'],
      taille: `${(selectedFile.value.size / 1024 / 1024).toFixed(1)} MB`,
      dateCreation: new Date().toISOString().split('T')[0],
      createur: 'Utilisateur',
      description: documentDescription.value,
      statut: 'genere'
    }
    documentsUploades.value.push(newDoc)
    showUploadModal.value = false
    selectedFile.value = null
    documentType.value = ''
    documentDescription.value = ''
    alert('Document uploadé avec succès!')
  }
}

const deleteDocument = (id: number | string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
    if (typeof id === 'string' && id.startsWith('bl_')) {
      alert('Les bordereaux de livraison ne peuvent pas être supprimés')
      return
    }
    documentsUploades.value = documentsUploades.value.filter(d => d.id !== id)
  }
}

const downloadDocument = (document: Document) => {
  if (document.type === 'BL' && document.livraisonId) {
    const livraison = livraisons.value.find(l => l.id === document.livraisonId)
    if (livraison) {
      // Ici on peut appeler la même logique que dans LivraisonView
      alert(`Génération du BL pour ${livraison.client}...`)
      // Implementation réelle du téléchargement BL
      return
    }
  }

  // Simulation de téléchargement pour autres documents
  alert(`Téléchargement de ${document.nom}`)
}

const getStatutInfo = (statut?: string) => {
  return statuts.find(s => s.value === statut) || statuts[0]
}

// Initialisation
onMounted(() => {
  loadLivraisons()
})
</script>

<template>
  <div class="space-y-8">
    <!-- En-tête amélioré -->
    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div class="mb-6 lg:mb-0">
          <div class="flex items-center mb-3">
            <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-4">
              <FolderIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Gestion des Documents</h1>
              <p class="text-gray-600 font-medium">BL générés et documents uploadés</p>
            </div>
          </div>
          <div class="flex items-center space-x-6 text-sm">
            <div class="flex items-center text-gray-600">
              <ClipboardDocumentIcon class="h-4 w-4 mr-1" />
              <span>{{ documentsGeneres.length }} BL générés</span>
            </div>
            <div class="flex items-center text-gray-600">
              <DocumentTextIcon class="h-4 w-4 mr-1" />
              <span>{{ documentsUploades.length }} documents uploadés</span>
            </div>
          </div>
        </div>
        <button
          @click="showUploadModal = true"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Upload document
        </button>
      </div>
    </div>

    <!-- Statistiques améliorées -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <DocumentTextIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total documents</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ tousLesDocuments.length }}</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-blue-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style="width: 100%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <TruckIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">BL générés</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ documentsGeneres.length }}</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-green-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" :style="{ width: `${Math.round((documentsGeneres.length / Math.max(tousLesDocuments.length, 1)) * 100)}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-orange-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <CalendarIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Ce mois</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">
              {{ tousLesDocuments.filter(d => new Date(d.dateCreation).getMonth() === new Date().getMonth()).length }}
            </p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-orange-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" style="width: 70%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <UserIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Types</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ new Set(tousLesDocuments.map(d => d.type)).size }}</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-purple-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style="width: 85%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Onglets et filtres -->
    <div class="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      <!-- Navigation par onglets -->
      <div class="mb-6">
        <nav class="flex space-x-8 border-b border-gray-200">
          <button
            @click="activeTab = 'tous'"
            :class="activeTab === 'tous' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          >
            Tous les documents ({{ tousLesDocuments.length }})
          </button>
          <button
            @click="activeTab = 'bl'"
            :class="activeTab === 'bl' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          >
            Bordereaux de livraison ({{ documentsGeneres.length }})
          </button>
          <button
            @click="activeTab = 'uploads'"
            :class="activeTab === 'uploads' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          >
            Documents uploadés ({{ documentsUploades.length }})
          </button>
        </nav>
      </div>

      <!-- Filtres -->
      <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
        <div class="relative w-full sm:w-auto flex-1">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Rechercher un document..."
            class="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
          />
        </div>
        <div class="relative w-full sm:w-auto">
          <FunnelIcon class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <select
            v-model="selectedTypeFilter"
            class="w-full sm:w-48 pl-10 pr-8 py-3 rounded-2xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 appearance-none bg-white"
          >
            <option value="">Tous les types</option>
            <option value="BL">Bordereaux de livraison</option>
            <option v-for="type in types" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="relative w-full sm:w-auto">
          <select
            v-model="selectedStatutFilter"
            class="w-full sm:w-40 pl-4 pr-8 py-3 rounded-2xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 appearance-none bg-white"
          >
            <option value="">Tous les statuts</option>
            <option v-for="statut in statuts" :key="statut.value" :value="statut.value">
              {{ statut.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Liste des documents -->
      <div class="overflow-hidden rounded-2xl border border-gray-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Document
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type / Statut
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Taille
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Créateur
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="document in documentsFiltres" :key="document.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-xl flex items-center justify-center mr-3" :class="{
                      'bg-green-100': document.type === 'BL',
                      'bg-blue-100': document.type !== 'BL'
                    }">
                      <TruckIcon v-if="document.type === 'BL'" class="h-5 w-5 text-green-600" />
                      <DocumentTextIcon v-else class="h-5 w-5 text-blue-600" />
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-semibold text-gray-900">{{ document.nom }}</div>
                      <div v-if="document.client" class="text-sm text-gray-600 font-medium">Client: {{ document.client }}</div>
                      <div v-if="document.description" class="text-xs text-gray-500 mt-1">{{ document.description }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="space-y-1">
                    <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full" :class="{
                      'bg-green-100 text-green-800': document.type === 'BL',
                      'bg-blue-100 text-blue-800': document.type === 'Facture',
                      'bg-purple-100 text-purple-800': document.type === 'Planification',
                      'bg-orange-100 text-orange-800': document.type === 'Certificat',
                      'bg-gray-100 text-gray-800': !['BL', 'Facture', 'Planification', 'Certificat'].includes(document.type)
                    }">
                      {{ document.type }}
                    </span>
                    <div v-if="document.statut">
                      <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full" :class="getStatutInfo(document.statut).color">
                        {{ getStatutInfo(document.statut).label }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                  {{ document.taille }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ new Date(document.dateCreation).toLocaleDateString('fr-FR') }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <div class="flex items-center">
                    <div class="h-6 w-6 rounded-full flex items-center justify-center mr-2" :class="{
                      'bg-green-100': document.createur === 'Système',
                      'bg-blue-100': document.createur !== 'Système'
                    }">
                      <span class="text-xs font-semibold" :class="{
                        'text-green-600': document.createur === 'Système',
                        'text-blue-600': document.createur !== 'Système'
                      }">
                        {{ document.createur.charAt(0) }}
                      </span>
                    </div>
                    {{ document.createur }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3">
                    <button
                      @click="downloadDocument(document)"
                      class="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="Télécharger"
                    >
                      <ArrowDownTrayIcon class="h-4 w-4" />
                    </button>
                    <button
                      class="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Voir"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </button>
                    <button
                      v-if="document.type !== 'BL'"
                      @click="deleteDocument(document.id)"
                      class="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
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
    </div>

    <!-- Modal upload amélioré -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="relative mx-auto border w-full max-w-lg shadow-2xl rounded-3xl bg-white animate-in zoom-in-95 duration-200">
        <!-- Header modal -->
        <div class="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-t-3xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
                <DocumentTextIcon class="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">Upload Document</h3>
                <p class="text-indigo-100 text-sm">Ajouter un nouveau document</p>
              </div>
            </div>
            <button
              @click="showUploadModal = false"
              class="text-white hover:text-indigo-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-20"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content modal -->
        <div class="p-6">
          <form @submit.prevent="uploadDocument" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Fichier</label>
              <div class="relative">
                <input
                  @change="(e) => selectedFile = (e.target as HTMLInputElement).files?.[0] || null"
                  type="file"
                  required
                  class="w-full rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Type de document</label>
              <select
                v-model="documentType"
                required
                class="w-full rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3 bg-white"
              >
                <option value="">Sélectionner un type</option>
                <option v-for="type in types" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                v-model="documentDescription"
                rows="3"
                class="w-full rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3 resize-none"
                placeholder="Description optionnelle du document..."
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="showUploadModal = false"
                class="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Upload Document
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
