<template>
  <div class="documents-container">
    <!-- Header moderne -->
    <div class="documents-header">
      <div class="header-content">
        <div class="header-main">
          <div class="flex items-center">
            <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg">
              <DocumentTextIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="page-title">Documents</h1>
              <p class="page-subtitle">Gestion de vos bons de livraison et documents</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- KPI Cards modernisés -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper stat-blue">
              <DocumentTextIcon class="stat-icon" />
            </div>
            <div class="stat-details">
              <dt class="stat-label">Total documents</dt>
              <dd class="stat-value">{{ documents.length }}</dd>
              <dd class="stat-unit">documents</dd>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper stat-green">
              <TruckIcon class="stat-icon" />
            </div>
            <div class="stat-details">
              <dt class="stat-label">Bons de livraison</dt>
              <dd class="stat-value">{{ bonsDeLivraison.length }}</dd>
              <dd class="stat-unit">BL</dd>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper stat-purple">
              <ArrowUpIcon class="stat-icon" />
            </div>
            <div class="stat-details">
              <dt class="stat-label">Espace utilisé</dt>
              <dd class="stat-value">{{ formatSize(totalSize) }}</dd>
              <dd class="stat-unit">stockage</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres modernisés -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">Recherche</label>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Rechercher un document..."
              class="filter-input"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">Type</label>
            <select v-model="selectedType" class="filter-select">
              <option value="">Tous les types</option>
              <option value="bon_livraison">Bon de livraison</option>
              <option value="facture">Facture</option>
              <option value="devis">Devis</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Liste des documents -->
      <div class="documents-grid">
        <div
          v-for="document in filteredDocuments"
          :key="document.id"
          class="document-card"
        >
          <div class="document-header">
            <div class="document-icon-wrapper">
              <DocumentTextIcon class="document-icon" />
            </div>
            <div class="document-info">
              <h3 class="document-title">{{ document.nom }}</h3>
              <p class="document-description">{{ document.description }}</p>
            </div>
          </div>

          <div class="document-meta">
            <span class="document-type">{{ getTypeLabel(document.type) }}</span>
            <span class="document-size">{{ formatSize(document.taille) }}</span>
          </div>

          <div class="document-actions">
            <a
              :href="document.url"
              target="_blank"
              class="action-button action-primary"
            >
              <EyeIcon class="h-4 w-4 mr-2" />
              Voir
            </a>

            <a
              :href="document.url"
              download
              class="action-button action-secondary"
            >
              <ArrowDownIcon class="h-4 w-4 mr-2" />
              Télécharger
            </a>

            <button @click="handleDeleteDocument(document.id!)" class="action-button action-danger">
              <TrashIcon class="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-if="filteredDocuments.length === 0" class="empty-state">
        <div class="empty-icon-wrapper">
          <DocumentTextIcon class="empty-icon" />
        </div>
        <h3 class="empty-title">Aucun document</h3>
        <p class="empty-subtitle">Les documents générés apparaîtront ici</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCompleteHybridService, type CompleteDocument } from '@/services/completeHybridService'
import {
  DocumentTextIcon,
  TruckIcon,
  ArrowUpIcon,
  EyeIcon,
  ArrowDownIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const {
  getDocuments,
  deleteDocument
} = useCompleteHybridService()

// État réactif
const documents = ref<CompleteDocument[]>([])
const searchTerm = ref('')
const selectedType = ref('')

// Computed
const bonsDeLivraison = computed(() =>
  documents.value.filter(d => d.type === 'bon_livraison')
)

const totalSize = computed(() =>
  documents.value.reduce((sum, doc) => sum + doc.taille, 0)
)

const filteredDocuments = computed(() => {
  return documents.value.filter(document => {
    const matchesSearch = document.nom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                         document.description?.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesType = !selectedType.value || document.type === selectedType.value
    
    return matchesSearch && matchesType
  })
})

// Méthodes
const loadDocuments = async () => {
  try {
    console.log('🔍 [DocumentsView] Chargement des documents...')
    documents.value = await getDocuments()
    console.log('✅ [DocumentsView] Documents chargés:', documents.value.length)
  } catch (error) {
    console.error('❌ [DocumentsView] Erreur lors du chargement des documents:', error)
  }
}

const handleDeleteDocument = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
    try {
      console.log('🗑️ [DocumentsView] Suppression du document:', id)
      await deleteDocument(id)
      await loadDocuments()
      console.log('✅ [DocumentsView] Document supprimé')
    } catch (error) {
      console.error('❌ [DocumentsView] Erreur lors de la suppression:', error)
    }
  }
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'bon_livraison': 'Bon de livraison',
    'facture': 'Facture',
    'devis': 'Devis',
    'autre': 'Autre'
  }
  return labels[type] || type
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Lifecycle
onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
/* Container principal */
.documents-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
}

/* Header moderne */
.documents-header {
  margin-bottom: 2rem;
}

.header-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
}

/* Contenu principal */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* Grille des statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon-wrapper {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-blue {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-green {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.stat-details {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0.25rem 0 0 0;
}

.stat-unit {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}

/* Section des filtres */
.filters-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.filter-input,
.filter-select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Grille des documents */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.document-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.document-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

.document-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.document-icon-wrapper {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.document-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #64748b;
}

.document-info {
  flex: 1;
}

.document-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.document-description {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.document-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #64748b;
}

.document-type {
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  border-radius: 9999px;
  font-weight: 500;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.action-primary {
  background: #3b82f6;
  color: white;
}

.action-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-secondary {
  background: #64748b;
  color: white;
}

.action-secondary:hover {
  background: #475569;
  transform: translateY(-1px);
}

.action-danger {
  background: #ef4444;
  color: white;
}

.action-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* État vide */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.empty-icon-wrapper {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.empty-icon {
  width: 2rem;
  height: 2rem;
  color: #94a3b8;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.empty-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}
</style>