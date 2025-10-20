<template>
  <div class="analyses-container">
    <!-- Header -->
    <div class="analyses-header">
      <h1 class="analyses-title">Analyses</h1>
      <p class="analyses-subtitle">Gestion des analyses de qualité, performance et coûts</p>
    </div>

    <!-- Stats -->
    <div class="analyses-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ analyses.length }}</div>
          <div class="stat-label">Total analyses</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ analysesEnCours }}</div>
          <div class="stat-label">En cours</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ analysesTerminees }}</div>
          <div class="stat-label">Terminées</div>
          </div>
          </div>
          </div>

    <!-- Filtres -->
    <div class="analyses-filters">
      <div class="filter-group">
        <label class="filter-label">Recherche</label>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Rechercher une analyse..."
          class="filter-input"
        />
        </div>

      <div class="filter-group">
        <label class="filter-label">Type</label>
        <select v-model="selectedType" class="filter-select">
          <option value="">Tous les types</option>
          <option value="qualite">Qualité</option>
          <option value="performance">Performance</option>
          <option value="cout">Coût</option>
          <option value="rendement">Rendement</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Statut</label>
        <select v-model="selectedStatut" class="filter-select">
          <option value="">Tous les statuts</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
        </select>
          </div>
          </div>

    <!-- Actions -->
    <div class="analyses-actions">
      <button @click="openModal()" class="btn btn-primary">
        <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Nouvelle analyse
      </button>
    </div>

    <!-- Liste des analyses -->
    <div class="analyses-grid">
      <div
        v-for="analyse in filteredAnalyses"
        :key="analyse.id"
        class="analyse-card"
      >
        <div class="analyse-header">
          <h3 class="analyse-title">{{ analyse.nom }}</h3>
          <span :class="`statut-badge statut-${analyse.statut}`">
            {{ getStatutLabel(analyse.statut) }}
          </span>
      </div>

        <div class="analyse-content">
          <div class="analyse-info">
            <div class="info-item">
              <span class="info-label">Type:</span>
              <span class="info-value">{{ getTypeLabel(analyse.type) }}</span>
          </div>
            <div class="info-item">
              <span class="info-label">Début:</span>
              <span class="info-value">{{ formatDate(analyse.dateDebut) }}</span>
          </div>
            <div v-if="analyse.dateFin" class="info-item">
              <span class="info-label">Fin:</span>
              <span class="info-value">{{ formatDate(analyse.dateFin) }}</span>
        </div>
      </div>

          <div v-if="analyse.description" class="analyse-description">
            {{ analyse.description }}
        </div>
      </div>

        <div class="analyse-actions">
          <button @click="openModal(analyse)" class="btn btn-secondary">
            <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </button>

          <button @click="deleteAnalyse(analyse.id!)" class="btn btn-danger">
            <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ editingAnalyse ? 'Modifier l\'analyse' : 'Nouvelle analyse' }}</h2>
          <button @click="closeModal" class="modal-close">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
            </div>

        <form @submit.prevent="saveAnalyse" class="modal-form">
          <div class="form-group">
            <label class="form-label">Nom de l'analyse *</label>
            <input
              v-model="newAnalyse.nom"
              type="text"
              required
              class="form-input"
              placeholder="Ex: Analyse qualité Q1 2024"
          />
        </div>

          <div class="form-group">
            <label class="form-label">Type *</label>
            <select v-model="newAnalyse.type" required class="form-select">
              <option value="qualite">Qualité</option>
              <option value="performance">Performance</option>
              <option value="cout">Coût</option>
              <option value="rendement">Rendement</option>
              <option value="autre">Autre</option>
            </select>
      </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              v-model="newAnalyse.description"
              class="form-textarea"
              rows="3"
              placeholder="Description de l'analyse..."
            ></textarea>
            </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date de début *</label>
              <input
                v-model="newAnalyse.dateDebut"
                type="date"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Date de fin</label>
              <input
                v-model="newAnalyse.dateFin"
                type="date"
                class="form-input"
          />
        </div>
      </div>

          <div class="form-group">
            <label class="form-label">Statut *</label>
            <select v-model="newAnalyse.statut" required class="form-select">
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
            </select>
    </div>

          <div class="form-group">
            <label class="form-label">Résultats</label>
            <textarea
              v-model="newAnalyse.resultats"
              class="form-textarea"
              rows="4"
              placeholder="Résultats de l'analyse..."
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Observations</label>
            <textarea
              v-model="newAnalyse.observations"
              class="form-textarea"
              rows="3"
              placeholder="Observations..."
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Recommandations</label>
            <textarea
              v-model="newAnalyse.recommandations"
              class="form-textarea"
              rows="3"
              placeholder="Recommandations..."
            ></textarea>
    </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingAnalyse ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </form>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLaravelApi } from '@/services/laravelApiService'

const { getAnalyses } = useLaravelApi()

// État réactif
const analyses = ref<any[]>([])
const showModal = ref(false)
const editingAnalyse = ref<any | null>(null)
const searchTerm = ref('')
const selectedType = ref('')
const selectedStatut = ref('')

const newAnalyse = ref<any>({
  nom: '',
  type: 'qualite',
  description: '',
  dateDebut: new Date().toISOString().split('T')[0],
  dateFin: '',
  statut: 'en_cours',
  resultats: '',
  observations: '',
  recommandations: '',
  donnees: {},
  dateAnalyse: new Date().toISOString()
})

// Computed
const analysesEnCours = computed(() => 
  analyses.value.filter(a => a.statut === 'en_cours').length
)

const analysesTerminees = computed(() => 
  analyses.value.filter(a => a.statut === 'termine').length
)

const filteredAnalyses = computed(() => {
  return analyses.value.filter(analyse => {
    const matchesSearch = analyse.nom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                         analyse.description?.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesType = !selectedType.value || analyse.type === selectedType.value
    const matchesStatut = !selectedStatut.value || analyse.statut === selectedStatut.value
    
    return matchesSearch && matchesType && matchesStatut
  })
})

// Méthodes
const loadAnalyses = async () => {
  try {
    console.log('🔍 [AnalysesView] Chargement des analyses...')
    analyses.value = await getAnalyses()
    console.log('✅ [AnalysesView] Analyses chargées:', analyses.value.length)
  } catch (error) {
    console.error('❌ [AnalysesView] Erreur lors du chargement des analyses:', error)
  }
}

const openModal = (analyse?: any) => {
  if (analyse) {
    editingAnalyse.value = analyse
    newAnalyse.value = {
      nom: analyse.nom,
      type: analyse.type,
      description: analyse.description || '',
      dateDebut: analyse.dateDebut,
      dateFin: analyse.dateFin || '',
      statut: analyse.statut,
      resultats: analyse.resultats || '',
      observations: analyse.observations || '',
      recommandations: analyse.recommandations || '',
      donnees: analyse.donnees || {},
      dateAnalyse: analyse.dateAnalyse || new Date().toISOString()
    }
  } else {
    editingAnalyse.value = null
    newAnalyse.value = {
      nom: '',
      type: 'qualite',
      description: '',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: '',
      statut: 'en_cours',
      resultats: '',
      observations: '',
      recommandations: '',
      donnees: {},
      dateAnalyse: new Date().toISOString()
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingAnalyse.value = null
}

const saveAnalyse = async () => {
  try {
    console.log('💾 [AnalysesView] Sauvegarde de l\'analyse...')
    
    if (editingAnalyse.value) {
      await updateAnalyse(editingAnalyse.value.id!, newAnalyse.value)
      console.log('✅ [AnalysesView] Analyse mise à jour')
    } else {
      await addAnalyse(newAnalyse.value)
      console.log('✅ [AnalysesView] Analyse créée')
    }
    
    await loadAnalyses()
    closeModal()
  } catch (error) {
    console.error('❌ [AnalysesView] Erreur lors de la sauvegarde:', error)
  }
}

const deleteAnalyse = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette analyse ?')) {
    try {
      console.log('🗑️ [AnalysesView] Suppression de l\'analyse:', id)
      await deleteAnalyseService(Number(id))
      await loadAnalyses()
      console.log('✅ [AnalysesView] Analyse supprimée')
    } catch (error) {
      console.error('❌ [AnalysesView] Erreur lors de la suppression:', error)
    }
  }
}

const getStatutLabel = (statut: string) => {
  const labels: Record<string, string> = {
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'annule': 'Annulé'
  }
  return labels[statut] || statut
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'qualite': 'Qualité',
    'performance': 'Performance',
    'cout': 'Coût',
    'rendement': 'Rendement',
    'autre': 'Autre'
  }
  return labels[type] || type
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

// Lifecycle
onMounted(() => {
  loadAnalyses()
})
</script>

<style scoped>
.analyses-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.analyses-header {
  margin-bottom: 2rem;
}

.analyses-title {
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
}

.analyses-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
}

.analyses-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.analyses-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.filter-input,
.filter-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.analyses-actions {
  margin-bottom: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.analyses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.analyse-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.analyse-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.analyse-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.analyse-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.statut-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.statut-en_cours {
  background: #fef3c7;
  color: #92400e;
}

.statut-termine {
  background: #d1fae5;
  color: #065f46;
}

.statut-annule {
  background: #fee2e2;
  color: #991b1b;
}

.analyse-content {
  margin-bottom: 1.5rem;
}

.analyse-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-value {
  color: #111827;
  font-size: 0.875rem;
}

.analyse-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.analyse-actions {
  display: flex;
  gap: 0.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;
}

.modal-close:hover {
  color: #374151;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>