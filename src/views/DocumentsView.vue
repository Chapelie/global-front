<script setup lang="ts">
import { ref } from 'vue'
import { 
  PlusIcon, 
  TrashIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

interface Document {
  id: number
  nom: string
  type: string
  taille: string
  dateUpload: string
  uploader: string
  description?: string
  url?: string
}

const documents = ref<Document[]>([
  {
    id: 1,
    nom: 'Facture_Briqueterie_Janvier_2024.pdf',
    type: 'Facture',
    taille: '2.5 MB',
    dateUpload: '2024-01-15',
    uploader: 'Admin',
    description: 'Facture fournisseur briqueterie'
  },
  {
    id: 2,
    nom: 'Plan_Production_Semaine_3.xlsx',
    type: 'Planification',
    taille: '1.2 MB',
    dateUpload: '2024-01-14',
    uploader: 'Manager',
    description: 'Planning de production semaine 3'
  },
  {
    id: 3,
    nom: 'Certificat_Qualite_2024.pdf',
    type: 'Certificat',
    taille: '3.1 MB',
    dateUpload: '2024-01-13',
    uploader: 'Admin',
    description: 'Certificat qualité ISO 9001'
  }
])

const showUploadModal = ref(false)
const selectedFile = ref<File | null>(null)
const documentType = ref('')
const documentDescription = ref('')

const types = [
  'Facture',
  'Planification',
  'Certificat',
  'Contrat',
  'Rapport',
  'Autre'
]

const uploadDocument = () => {
  if (selectedFile.value) {
    const newDoc: Document = {
      id: Math.max(...documents.value.map(d => d.id)) + 1,
      nom: selectedFile.value.name,
      type: documentType.value,
      taille: `${(selectedFile.value.size / 1024 / 1024).toFixed(1)} MB`,
      dateUpload: new Date().toISOString().split('T')[0],
      uploader: 'Utilisateur',
      description: documentDescription.value
    }
    documents.value.push(newDoc)
    showUploadModal.value = false
    selectedFile.value = null
    documentType.value = ''
    documentDescription.value = ''
  }
}

const deleteDocument = (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
    documents.value = documents.value.filter(d => d.id !== id)
  }
}

const downloadDocument = (document: Document) => {
  // Simulation de téléchargement
  alert(`Téléchargement de ${document.nom}`)
}
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Documents</h2>
        <p class="mt-2 text-gray-600">Gestion des documents et fichiers</p>
      </div>
      <button
        @click="showUploadModal = true"
        class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Upload document
      </button>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <DocumentTextIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total documents</p>
            <p class="text-2xl font-bold text-gray-900">{{ documents.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
            <CalendarIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Ce mois</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ documents.filter(d => new Date(d.dateUpload).getMonth() === new Date().getMonth()).length }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <UserIcon class="h-6 w-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Types</p>
            <p class="text-2xl font-bold text-gray-900">{{ new Set(documents.map(d => d.type)).size }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des documents -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taille
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploader
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="document in documents" :key="document.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <DocumentTextIcon class="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ document.nom }}</div>
                    <div v-if="document.description" class="text-sm text-gray-500">{{ document.description }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ document.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ document.taille }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ new Date(document.dateUpload).toLocaleDateString('fr-FR') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ document.uploader }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="downloadDocument(document)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Télécharger"
                  >
                    <ArrowDownTrayIcon class="h-4 w-4" />
                  </button>
                  <button
                    class="text-gray-600 hover:text-gray-900"
                    title="Voir"
                  >
                    <EyeIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="deleteDocument(document.id)"
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

    <!-- Modal upload -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-2xl bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Upload document</h3>
          
          <form @submit.prevent="uploadDocument" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
              <input
                @change="(e) => selectedFile = (e.target as HTMLInputElement).files?.[0] || null"
                type="file"
                required
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
              <select
                v-model="documentType"
                required
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="">Sélectionner un type</option>
                <option v-for="type in types" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="documentDescription"
                rows="3"
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Description optionnelle..."
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showUploadModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
