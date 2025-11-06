<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLaravelApi } from '../services/laravelApiService'
import { useApiConfig } from '../config/ApiConfig'
import {
  DocumentTextIcon,
  TruckIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// Services
const { getDocuments, downloadDocument: downloadDoc, getDocument } = useLaravelApi()

// État réactif
const documents = ref<any[]>([])
const isLoading = ref(false)
const searchTerm = ref('')
const selectedStatus = ref('all')
const selectedType = ref('all')
const selectedPeriod = ref('all')
const showFilters = ref(false)
const selectedDocument = ref<any | null>(null)
const showDocumentModal = ref(false)
const documentViewerUrl = ref<string | null>(null)

// Computed
const filteredDocuments = computed(() => {
  let filtered = documents.value

  // Filtre par recherche
  if (searchTerm.value) {
    filtered = filtered.filter(doc => 
      doc.numero?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      doc.titre?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      doc.numero_bl?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      doc.client?.nom?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      doc.client?.email?.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  // Filtre par type
  if (selectedType.value !== 'all') {
    filtered = filtered.filter(doc => doc.type === selectedType.value)
  }

  // Filtre par statut
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(doc => doc.statut === selectedStatus.value)
  }

  // Filtre par période
  if (selectedPeriod.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    filtered = filtered.filter(doc => {
      const docDate = new Date(doc.date || doc.date_creation || doc.created_at)
      
      switch (selectedPeriod.value) {
        case 'today':
          return docDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return docDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return docDate >= monthAgo
        default:
          return true
      }
    })
  }

  return filtered.sort((a, b) => {
    const dateA = new Date(a.date || a.date_creation || a.created_at).getTime()
    const dateB = new Date(b.date || b.date_creation || b.created_at).getTime()
    return dateB - dateA
  })
})

const totalDocuments = computed(() => documents.value.length)
const totalBL = computed(() => documents.value.filter(doc => 
  doc.type === 'delivery_note' || doc.type === 'bon_livraison' || doc.type === 'bl'
).length)
const totalFactures = computed(() => documents.value.filter(doc => 
  doc.type === 'invoice' || doc.type === 'facture'
).length)
const totalAutres = computed(() => documents.value.filter(doc => 
  doc.type !== 'delivery_note' && doc.type !== 'bon_livraison' && doc.type !== 'bl' && 
  doc.type !== 'invoice' && doc.type !== 'facture'
).length)

// Charger les données
onMounted(async () => {
  await loadDocuments()
})

const loadDocuments = async () => {
  try {
    isLoading.value = true
    
    // Charger les documents réels depuis l'API
    const docs = await getDocuments()
    
    // Mapper les documents pour l'affichage
    documents.value = docs.map(doc => ({
      ...doc,
      numero_bl: doc.numero || doc.titre,
      date: doc.date_creation || doc.created_at,
      statut: doc.statut || 'actif',
      type: doc.type || 'document',
      client: extractClientFromDocument(doc),
      montant_total: extractMontantFromDocument(doc),
      file_url: doc.file_url || (doc.chemin_fichier ? `storage/${doc.chemin_fichier}` : null)
    }))
    
    console.log('✅ [DocumentsView] Documents chargés:', documents.value.length)
  } catch (error) {
    console.error('❌ [DocumentsView] Erreur lors du chargement des documents:', error)
    alert('Erreur lors du chargement des documents')
  } finally {
    isLoading.value = false
  }
}

// Extraire les infos client depuis les données du document
const extractClientFromDocument = (doc: any) => {
  if (doc.donnees_document?.client_nom) {
    return {
      nom: doc.donnees_document.client_nom,
      email: doc.donnees_document.telephone_client || '',
      adresse: doc.donnees_document.adresse_livraison || ''
    }
  }
  // Extraire depuis le titre si possible
  const titreMatch = doc.titre.match(/-\s*(.+)$/)
  if (titreMatch) {
    return { nom: titreMatch[1], email: '', adresse: '' }
  }
  return { nom: 'N/A', email: '', adresse: '' }
}

// Extraire le montant depuis les données du document
const extractMontantFromDocument = (doc: any) => {
  if (doc.donnees_document?.items) {
    return doc.donnees_document.items.reduce((total: number, item: any) => {
      return total + ((item.quantite || 0) * (item.prix_unitaire || 0))
    }, 0)
  }
  return 0
}

// Actions
const viewDocument = async (document: any) => {
  try {
    console.log('📄 [DocumentsView] Ouverture du document:', document.id)
    
    // Utiliser l'endpoint de téléchargement qui gère l'authentification
    const apiConfig = useApiConfig()
    const pdfUrl = `${apiConfig.getBaseURL()}/documents/${document.id}/download`
    
    // Télécharger le PDF puis l'ouvrir dans un nouvel onglet
    const response = await fetch(pdfUrl, {
      headers: apiConfig.getHeaders()
    })
    
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      // Nettoyer l'URL après un délai
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } else {
      throw new Error('Erreur lors du chargement du document')
    }
    
  } catch (error) {
    console.error('❌ [DocumentsView] Erreur lors de l\'ouverture du document:', error)
    alert('Erreur lors de l\'ouverture du document. Vérifiez que le document existe.')
  }
}

const downloadDocument = async (document: any) => {
  try {
    console.log('📥 [DocumentsView] Téléchargement du document:', document.id)
    await downloadDoc(document.id)
    console.log('✅ [DocumentsView] Document téléchargé avec succès')
  } catch (error) {
    console.error('❌ [DocumentsView] Erreur lors du téléchargement:', error)
    alert('Erreur lors du téléchargement du document')
  }
}

const printDocument = async (document: any) => {
  try {
    console.log('🖨️ [DocumentsView] Impression du document:', document.id)
    
    const apiConfig = useApiConfig()
    const pdfUrl = `${apiConfig.getBaseURL()}/documents/${document.id}/download`
    
    // Télécharger le PDF puis l'ouvrir pour impression
    const response = await fetch(pdfUrl, {
      headers: apiConfig.getHeaders()
    })
    
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Créer une iframe pour l'impression
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = url
      
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print()
          // Retirer l'iframe et nettoyer l'URL après impression
          setTimeout(() => {
            if (iframe.parentNode) {
              document.body.removeChild(iframe)
            }
            window.URL.revokeObjectURL(url)
          }, 1000)
        }, 500)
      }
      
      document.body.appendChild(iframe)
    } else {
      throw new Error('Erreur lors du chargement du document')
    }
    
  } catch (error) {
    console.error('❌ [DocumentsView] Erreur lors de l\'impression:', error)
    alert('Erreur lors de l\'impression du document')
  }
}

const closeDocumentModal = () => {
  showDocumentModal.value = false
  selectedDocument.value = null
  documentViewerUrl.value = null
}

const refreshDocuments = async () => {
  await loadDocuments()
}

// Fonctions utilitaires
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'actif':
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'archive':
    case 'archived':
      return 'bg-gray-100 text-gray-800'
    case 'delete':
    case 'deleted':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'livre':
    case 'termine':
      return CheckCircleIcon
    case 'en_cours':
    case 'en_attente':
      return ClockIcon
    case 'annule':
      return ExclamationTriangleIcon
    default:
      return ClockIcon
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'livre':
      return 'Livré'
    case 'termine':
      return 'Terminé'
    case 'en_cours':
      return 'En cours'
    case 'en_attente':
      return 'En attente'
    case 'annule':
      return 'Annulé'
    default:
      return status
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'delivery_note':
    case 'bon_livraison':
    case 'bl':
      return 'bg-blue-100 text-blue-800'
    case 'invoice':
    case 'facture':
      return 'bg-green-100 text-green-800'
    case 'receipt':
    case 'reçu':
      return 'bg-purple-100 text-purple-800'
    case 'report':
    case 'rapport':
      return 'bg-orange-100 text-orange-800'
    case 'commande':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'delivery_note':
    case 'bon_livraison':
    case 'bl':
      return 'Bon de Livraison'
    case 'invoice':
    case 'facture':
      return 'Facture'
    case 'receipt':
    case 'reçu':
      return 'Reçu'
    case 'report':
    case 'rapport':
      return 'Rapport'
    case 'commande':
      return 'Commande'
    default:
      return type || 'Document'
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'delivery_note':
    case 'bon_livraison':
    case 'bl':
      return TruckIcon
    case 'invoice':
    case 'facture':
      return DocumentTextIcon
    default:
      return DocumentTextIcon
  }
}
</script>

<template>
  <div class="documents-container min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="header-content bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center mb-4 sm:mb-0">
            <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg mr-4">
              <DocumentTextIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="page-title text-2xl font-bold text-gray-900">Documents</h1>
              <p class="text-sm text-gray-600">Bons de livraison et documents générés</p>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="showFilters = !showFilters"
              class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              <FunnelIcon class="h-5 w-5 mr-2" />
              Filtres
            </button>
            <button
              @click="refreshDocuments"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              <ArrowDownTrayIcon class="h-5 w-5 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <DocumentTextIcon class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total documents</p>
                <p class="stat-value text-2xl font-bold text-gray-900">{{ totalDocuments }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <TruckIcon class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Bons de livraison</p>
                <p class="stat-value text-2xl font-bold text-gray-900">{{ totalBL }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <DocumentArrowDownIcon class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Factures</p>
                <p class="stat-value text-2xl font-bold text-gray-900">{{ totalFactures }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div v-if="showFilters" class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Recherche -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <div class="relative">
              <MagnifyingGlassIcon class="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Numéro BL, client..."
                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <!-- Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              v-model="selectedType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tous les types</option>
              <option value="delivery_note">Bon de Livraison</option>
              <option value="invoice">Facture</option>
              <option value="receipt">Reçu</option>
              <option value="report">Rapport</option>
            </select>
          </div>

          <!-- Statut -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              v-model="selectedStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          <!-- Période -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select
              v-model="selectedPeriod"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Liste des documents -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">
            Documents ({{ filteredDocuments.length }})
          </h2>
        </div>

        <!-- Tableau des documents -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="document in filteredDocuments" :key="document.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg mr-4">
                      <component :is="getTypeIcon(document.type)" class="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ document.numero || document.numero_bl || document.titre }}</div>
                      <span :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1',
                        getTypeColor(document.type)
                      ]">
                        {{ getTypeLabel(document.type) }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ document.client?.nom || 'N/A' }}</div>
                  <div class="text-sm text-gray-500">{{ document.client?.email || '' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(document.date || document.date_creation || document.created_at) }}</div>
                  <div v-if="document.createur" class="text-xs text-gray-500">
                    Par: {{ document.createur?.name || 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="document.montant_total > 0" class="text-sm font-bold text-green-600">
                    {{ formatCurrency(document.montant_total) }}
                  </div>
                  <div v-else class="text-sm text-gray-400">-</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(document.statut)
                  ]">
                    <component
                      :is="document.statut === 'active' || document.statut === 'actif' ? CheckCircleIcon : ClockIcon"
                      class="h-3 w-3 mr-1"
                    />
                    {{ document.statut === 'active' ? 'Actif' : 
                       document.statut === 'archived' ? 'Archivé' : 
                       document.statut === 'deleted' ? 'Supprimé' : 
                       document.statut || 'N/A' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="viewDocument(document)"
                      class="text-orange-600 hover:text-orange-900 transition-colors"
                      title="Voir"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click="downloadDocument(document)"
                      class="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Télécharger"
                    >
                      <ArrowDownTrayIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click="printDocument(document)"
                      class="text-green-600 hover:text-green-900 transition-colors"
                      title="Imprimer"
                    >
                      <PrinterIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Message si aucun document -->
        <div v-if="filteredDocuments.length === 0" class="text-center py-12">
          <DocumentTextIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
          <p class="text-gray-600">
            {{ searchTerm || selectedStatus !== 'all' || selectedPeriod !== 'all' 
              ? 'Aucun document ne correspond aux critères de recherche.' 
              : 'Commencez par générer vos premiers documents.' 
            }}
          </p>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="inline-flex items-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span class="ml-3 text-gray-600">Chargement des documents...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour visualiser le document -->
    <div v-if="showDocumentModal && documentViewerUrl" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ selectedDocument?.titre || 'Document' }}
          </h3>
          <button
            @click="closeDocumentModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-hidden">
          <iframe
            :src="documentViewerUrl"
            class="w-full h-full border-0"
            title="Visualisation du document"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles de base */
.documents-container {
  min-height: 100vh;
}

.page-title {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 700;
  color: #111827;
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

/* Responsive design */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .stat-content {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .overflow-x-auto {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
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

.stat-card {
  animation: slideIn 0.3s ease-out;
}

/* Améliorer l'espacement des touches sur mobile */
button {
  min-height: 44px;
}

/* Assurer que les inputs sont accessibles sur mobile */
input, select {
  font-size: 16px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>