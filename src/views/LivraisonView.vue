<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storageService, type Livraison } from '../services/storage'
import LivraisonAvecSignature from '../components/LivraisonAvecSignature.vue'
import BordereauViewer from '../components/BordereauViewer.vue'

// État réactif
const livraisons = ref<Livraison[]>([])
const showModal = ref(false)
const showSignatureModal = ref(false)
const showBordereauModal = ref(false)
const editingLivraison = ref<Livraison | null>(null)
const selectedLivraison = ref<Livraison | null>(null)
const selectedBordereauLivraison = ref<Livraison | null>(null)
const activeTab = ref<'nonTerminees' | 'terminees'>('nonTerminees')

// Nouvelle livraison
const newLivraison = ref({
  client: '',
  telephone: '',
  chauffeur: 'Camion de livraison',
  produits: [{ nom: '', quantite: 0, unite: 'pièces', quantiteCommandee: 0, quantiteLivree: 0, difference: 0, resteAPayer: 0 }],
  statut: 'en_attente' as 'en_attente' | 'en_cours' | 'livre' | 'annule',
  adresse: '',
  numeroBL: '',
  codeSuivi: '',
  date: new Date().toISOString(),
  totalCommande: 0,
  totalLivraison: 0,
  differenceTotale: 0,
  resteAPayerTotal: 0
})

// Computed
const totalLivraisons = computed(() => livraisons.value.length)
const livraisonsEnAttente = computed(() => livraisons.value.filter(l => l.statut === 'en_attente').length)
const livraisonsEnCours = computed(() => livraisons.value.filter(l => l.statut === 'en_cours').length)
const livraisonsLivre = computed(() => livraisons.value.filter(l => l.statut === 'livre').length)

// Computed pour filtrer les livraisons non terminées
const livraisonsNonTerminees = computed(() => {
  return livraisons.value.filter(l => l.statut !== 'livre' && l.statut !== 'annule')
})

// Computed pour filtrer les livraisons terminées
const livraisonsTerminees = computed(() => {
  return livraisons.value.filter(l => l.statut === 'livre' || l.statut === 'annule')
})

// Méthodes
const loadLivraisons = () => {
  livraisons.value = storageService.getLivraisons()
}

const openModal = (livraison?: Livraison) => {
  if (livraison) {
    editingLivraison.value = livraison
    newLivraison.value = { ...livraison }
  } else {
    editingLivraison.value = null
    newLivraison.value = {
      client: '',
      telephone: '',
      chauffeur: 'Camion de livraison',
      produits: [{ nom: '', quantite: 0, unite: 'pièces', quantiteCommandee: 0, quantiteLivree: 0, difference: 0, resteAPayer: 0 }],
      statut: 'en_attente' as 'en_attente' | 'en_cours' | 'livre' | 'annule',
      adresse: '',
      numeroBL: '',
      codeSuivi: '',
      date: new Date().toISOString(),
      totalCommande: 0,
      totalLivraison: 0,
      differenceTotale: 0,
      resteAPayerTotal: 0
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingLivraison.value = null
}

const addProduit = () => {
  newLivraison.value.produits.push({ nom: '', quantite: 0, unite: 'pièces', quantiteCommandee: 0, quantiteLivree: 0, difference: 0, resteAPayer: 0 })
}

const removeProduit = (index: number) => {
  newLivraison.value.produits.splice(index, 1)
}

const saveLivraison = () => {
  if (editingLivraison.value) {
    // Modifier une livraison existante
    const index = livraisons.value.findIndex(l => l.id === editingLivraison.value!.id)
    if (index !== -1) {
      livraisons.value[index] = { ...editingLivraison.value, ...newLivraison.value }
      storageService.saveLivraisons(livraisons.value)
    }
  } else {
    // Créer une nouvelle livraison
    const livraison = storageService.addLivraison({
      ...newLivraison.value,
      numeroBL: storageService.generateNumeroBL(),
      codeSuivi: storageService.generateCodeSuivi()
    })
    livraisons.value.push(livraison)
  }
  
  closeModal()
  loadLivraisons()
}

const commencerLivraison = (livraison: Livraison) => {
  selectedLivraison.value = livraison
  showSignatureModal.value = true
}

const closeSignatureModal = () => {
  showSignatureModal.value = false
  selectedLivraison.value = null
}

const saveLivraisonWithSignature = (livraisonMiseAJour: Livraison) => {
  const index = livraisons.value.findIndex(l => l.id === livraisonMiseAJour.id)
  if (index !== -1) {
    livraisons.value[index] = livraisonMiseAJour
    storageService.saveLivraisons(livraisons.value)
  }
  closeSignatureModal()
  loadLivraisons()
}

const telechargerBL = (livraison: Livraison) => {
  selectedBordereauLivraison.value = livraison
  showBordereauModal.value = true
}

const closeBordereauModal = () => {
  showBordereauModal.value = false
  selectedBordereauLivraison.value = null
}

const getStatusClass = (statut: string) => {
  switch (statut) {
    case 'en_attente':
      return 'bg-yellow-100 text-yellow-800'
    case 'en_cours':
      return 'bg-blue-100 text-blue-800'
    case 'livre':
      return 'bg-green-100 text-green-800'
    case 'annule':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (statut: string) => {
  switch (statut) {
    case 'en_attente':
      return 'En attente'
    case 'en_cours':
      return 'En cours'
    case 'livre':
      return 'Livré'
    case 'annule':
      return 'Annulé'
    default:
      return statut
  }
}

// Initialisation
onMounted(() => {
  loadLivraisons()
})
</script>

<template>
  <div class="livraison-container">
    <!-- Header -->
    <div class="livraison-header">
      <div class="header-content">
        <div class="header-main">
          <div>
            <h1 class="page-title">Gestion des Livraisons</h1>
          </div>
          <button
            @click="openModal()"
            class="btn btn-primary"
          >
            <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvelle livraison
          </button>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- Statistiques -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper stat-blue">
              <svg class="stat-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
            <div class="stat-details">
              <dt class="stat-label">Total livraisons</dt>
              <dd class="stat-value">{{ totalLivraisons }}</dd>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper stat-yellow">
              <svg class="stat-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
            <div class="stat-details">
              <dt class="stat-label">En attente</dt>
              <dd class="stat-value">{{ livraisonsEnAttente }}</dd>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper stat-orange">
              <svg class="stat-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
            <div class="stat-details">
              <dt class="stat-label">En cours</dt>
              <dd class="stat-value">{{ livraisonsEnCours }}</dd>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper stat-green">
              <svg class="stat-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
            <div class="stat-details">
              <dt class="stat-label">Livrées</dt>
              <dd class="stat-value">{{ livraisonsLivre }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglets -->
      <div class="tabs-container">
        <div class="tabs-header">
          <nav class="tabs-nav">
            <button
              @click="activeTab = 'nonTerminees'"
              :class="activeTab === 'nonTerminees' ? 'tab-active' : 'tab-inactive'"
              class="tab-button"
            >
              Livraisons en cours ({{ livraisonsNonTerminees.length }})
            </button>
            <button
              @click="activeTab = 'terminees'"
              :class="activeTab === 'terminees' ? 'tab-active' : 'tab-inactive'"
              class="tab-button"
            >
              Livraisons terminées ({{ livraisonsTerminees.length }})
            </button>
          </nav>
        </div>

        <!-- Contenu des onglets -->
        <div class="tabs-content">
          <!-- Livraisons non terminées -->
          <div v-if="activeTab === 'nonTerminees'">
            <div class="section-header">
              <h3 class="section-title">Livraisons à effectuer</h3>
              <p class="section-subtitle">Livraisons en attente ou en cours de préparation</p>
            </div>
            
            <div v-if="livraisonsNonTerminees.length === 0" class="empty-state">
              <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="empty-title">Aucune livraison en cours</h3>
              <p class="empty-subtitle">Toutes les livraisons sont terminées ou annulées.</p>
            </div>

            <div v-else class="livraison-list">
              <div
                v-for="livraison in livraisonsNonTerminees"
                :key="livraison.id"
                class="livraison-card"
              >
                <div class="livraison-content">
                  <div class="livraison-main">
                    <div class="livraison-header-info">
                      <span class="status-badge"
                            :class="getStatusClass(livraison.statut)">
                        {{ getStatusText(livraison.statut) }}
                      </span>
                      <span class="livraison-number">#{{ livraison.numeroBL }}</span>
                    </div>
                    
                    <h4 class="livraison-client">{{ livraison.client }}</h4>
                    
                    <div class="livraison-details">
                      <div class="detail-item">
                        <span class="detail-label">Téléphone:</span>
                        <p class="detail-value">{{ livraison.telephone }}</p>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Adresse:</span>
                        <p class="detail-value">{{ livraison.adresse }}</p>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Chauffeur:</span>
                        <p class="detail-value">{{ livraison.chauffeur }}</p>
                      </div>
                    </div>

                    <!-- Produits -->
                    <div class="produits-section">
                      <h5 class="produits-title">Produits à livrer</h5>
                      <div class="produits-list">
                        <div v-for="(produit, index) in livraison.produits" :key="index" class="produit-item">
                          <span class="produit-nom">{{ produit.nom }}</span>
                          <div class="produit-quantites">
                            <span class="quantite-commandee">
                              {{ produit.quantiteCommandee || produit.quantite }} {{ produit.unite }}
                            </span>
                            <span class="quantite-arrow">→</span>
                            <span class="quantite-livree">
                              {{ produit.quantiteLivree || 0 }} {{ produit.unite }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="livraison-actions">
                    <button
                      @click="commencerLivraison(livraison)"
                      class="btn btn-primary"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Commencer la livraison
                    </button>
                    
                    <button
                      @click="openModal(livraison)"
                      class="btn btn-secondary"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Livraisons terminées -->
          <div v-if="activeTab === 'terminees'">
            <div class="section-header">
              <h3 class="section-title">Historique des livraisons</h3>
              <p class="section-subtitle">Livraisons terminées ou annulées</p>
            </div>
            
            <div v-if="livraisonsTerminees.length === 0" class="empty-state">
              <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="empty-title">Aucune livraison terminée</h3>
              <p class="empty-subtitle">Les livraisons terminées apparaîtront ici.</p>
            </div>

            <div v-else class="livraison-list">
              <div
                v-for="livraison in livraisonsTerminees"
                :key="livraison.id"
                class="livraison-card"
              >
                <div class="livraison-content">
                  <div class="livraison-main">
                    <div class="livraison-header-info">
                      <span class="status-badge"
                            :class="getStatusClass(livraison.statut)">
                        {{ getStatusText(livraison.statut) }}
                      </span>
                      <span class="livraison-number">#{{ livraison.numeroBL }}</span>
                    </div>
                    
                    <h4 class="livraison-client">{{ livraison.client }}</h4>
                    
                    <div class="livraison-details">
                      <div class="detail-item">
                        <span class="detail-label">Date de livraison:</span>
                        <p class="detail-value">{{ livraison.dateLivraison || 'N/A' }}</p>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Heure:</span>
                        <p class="detail-value">{{ livraison.heureLivraison || 'N/A' }}</p>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Chauffeur:</span>
                        <p class="detail-value">{{ livraison.chauffeur }}</p>
                      </div>
                    </div>

                    <!-- Produits livrés -->
                    <div class="produits-section">
                      <h5 class="produits-title">Produits livrés</h5>
                      <div class="produits-list">
                        <div v-for="(produit, index) in livraison.produits" :key="index" class="produit-item">
                          <span class="produit-nom">{{ produit.nom }}</span>
                          <div class="produit-quantites">
                            <span class="quantite-commandee">
                              {{ produit.quantiteCommandee || produit.quantite }} commandé(s)
                            </span>
                            <span class="quantite-arrow">→</span>
                            <span class="quantite-livree">
                              {{ produit.quantiteLivree || 0 }} livré(s)
                            </span>
                            <span v-if="produit.difference && produit.difference > 0" class="difference-badge">
                              -{{ produit.difference }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Signature si disponible -->
                    <div v-if="livraison.signatureClient" class="signature-section">
                      <h5 class="signature-title">✅ Signature enregistrée</h5>
                      <img :src="livraison.signatureClient" alt="Signature du client" class="signature-image" />
                    </div>
                  </div>

                  <div class="livraison-actions">
                    <button
                      @click="telechargerBL(livraison)"
                      class="btn btn-secondary"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Télécharger BL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de livraison avec signature -->
    <LivraisonAvecSignature
      v-if="showSignatureModal && selectedLivraison"
      :livraison="selectedLivraison"
      :show-modal="showSignatureModal"
      @close="closeSignatureModal"
      @save="saveLivraisonWithSignature"
    />

    <!-- Modal d'affichage du bordereau -->
    <div v-if="showBordereauModal && selectedBordereauLivraison" class="modal-overlay">
      <BordereauViewer
        :livraison="selectedBordereauLivraison"
        @close="closeBordereauModal"
      />
    </div>

    <!-- Modal d'édition -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-header-content">
            <h2 class="modal-title">
              {{ editingLivraison ? 'Modifier la livraison' : 'Nouvelle livraison' }}
            </h2>
            <button @click="closeModal" class="modal-close">
              <svg class="modal-close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveLivraison" class="form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Client</label>
                <input
                  v-model="newLivraison.client"
                  type="text"
                  required
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Téléphone</label>
                <input
                  v-model="newLivraison.telephone"
                  type="tel"
                  required
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Adresse</label>
              <textarea
                v-model="newLivraison.adresse"
                rows="3"
                required
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Chauffeur</label>
              <input
                v-model="newLivraison.chauffeur"
                type="text"
                required
                class="form-input"
              />
            </div>

            <!-- Produits -->
            <div class="form-group">
              <div class="produits-header">
                <label class="form-label">Produits</label>
                <button
                  type="button"
                  @click="addProduit"
                  class="add-produit-btn"
                >
                  + Ajouter un produit
                </button>
              </div>
              <div class="produits-form-list">
                <div
                  v-for="(produit, index) in newLivraison.produits"
                  :key="index"
                  class="produit-form-row"
                >
                  <input
                    v-model="produit.nom"
                    type="text"
                    placeholder="Nom du produit"
                    required
                    class="form-input"
                  />
                  <input
                    v-model.number="produit.quantite"
                    type="number"
                    placeholder="Quantité"
                    min="0"
                    required
                    class="form-input"
                  />
                  <input
                    v-model="produit.unite"
                    type="text"
                    placeholder="Unité"
                    required
                    class="form-input"
                  />
                  <button
                    type="button"
                    @click="removeProduit(index)"
                    class="remove-produit-btn"
                  >
                    <svg class="remove-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="button"
                @click="closeModal"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="btn btn-primary"
              >
                {{ editingLivraison ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout principal */
.livraison-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.livraison-header {
  background-color: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .header-content {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .header-content {
    padding: 0 2rem;
  }
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.page-subtitle {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.main-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

@media (min-width: 640px) {
  .main-content {
    padding: 2rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .main-content {
    padding: 2rem 2rem;
  }
}

/* Statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background-color: #ffffff;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
}

.stat-content {
  padding: 1.25rem;
}

.stat-icon-wrapper {
  height: 2rem;
  width: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-blue {
  background-color: #3b82f6;
}

.stat-yellow {
  background-color: #eab308;
}

.stat-orange {
  background-color: #f97316;
}

.stat-green {
  background-color: #10b981;
}

.stat-icon {
  height: 1.25rem;
  width: 1.25rem;
  color: #ffffff;
}

.stat-details {
  margin-left: 1.25rem;
  width: 0;
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
}

/* Onglets */
.tabs-container {
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.tabs-header {
  border-bottom: 1px solid #e5e7eb;
}

.tabs-nav {
  display: flex;
  margin-bottom: -1px;
  padding: 0 1.5rem;
}

.tab-button {
  white-space: nowrap;
  padding: 1rem 0.25rem;
  margin-right: 2rem;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.tab-active {
  border-color: #f97316;
  color: #f97316;
}

.tab-inactive {
  color: #6b7280;
}

.tab-inactive:hover {
  color: #374151;
  border-color: #d1d5db;
}

.tabs-content {
  padding: 1.5rem;
}

/* Sections */
.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

/* État vide */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  margin: 0 auto;
  height: 3rem;
  width: 3rem;
  color: #9ca3af;
}

.empty-title {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.empty-subtitle {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

/* Liste des livraisons */
.livraison-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.livraison-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: box-shadow 0.2s ease-in-out;
}

.livraison-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.livraison-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.livraison-main {
  flex: 1;
}

.livraison-header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.bg-yellow-100 {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.bg-blue-100 {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.bg-green-100 {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.bg-red-100 {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-badge.bg-gray-100 {
  background-color: #f3f4f6;
  color: #374151;
}

.livraison-number {
  font-size: 0.875rem;
  color: #6b7280;
}

.livraison-client {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.livraison-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .livraison-details {
    grid-template-columns: repeat(3, 1fr);
  }
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.detail-value {
  color: #111827;
}

/* Produits */
.produits-section {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.produits-title {
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.75rem;
}

.produits-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.produit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.produit-nom {
  font-size: 0.875rem;
  color: #111827;
}

.produit-quantites {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantite-commandee {
  font-size: 0.875rem;
  color: #6b7280;
}

.quantite-arrow {
  font-size: 0.75rem;
  color: #9ca3af;
}

.quantite-livree {
  font-size: 0.875rem;
  font-weight: 500;
  color: #f97316;
}

.difference-badge {
  font-size: 0.75rem;
  color: #dc2626;
  background-color: #fee2e2;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

/* Signature */
.signature-section {
  margin-top: 1rem;
  background-color: #f0fdf4;
  border-radius: 0.5rem;
  padding: 1rem;
}

.signature-title {
  font-weight: 500;
  color: #166534;
  margin-bottom: 0.5rem;
}

.signature-image {
  max-width: 20rem;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
}

/* Actions */
.livraison-actions {
  margin-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-icon {
  height: 1.25rem;
  width: 1.25rem;
  margin-right: 0.5rem;
}

.btn-primary {
  background-color: #f97316;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #ea580c;
}

.btn-secondary {
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 42rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  position: sticky;
  top: 0;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

.modal-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.modal-close {
  color: #9ca3af;
  transition: color 0.2s ease-in-out;
}

.modal-close:hover {
  color: #6b7280;
}

.modal-close-icon {
  height: 1.5rem;
  width: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

/* Formulaire */
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.produits-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.add-produit-btn {
  font-size: 0.875rem;
  color: #f97316;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
}

.add-produit-btn:hover {
  color: #ea580c;
}

.produits-form-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.produit-form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .produit-form-row {
    grid-template-columns: repeat(4, 1fr);
  }
}

.remove-produit-btn {
  color: #dc2626;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-produit-btn:hover {
  color: #b91c1c;
}

.remove-icon {
  height: 1.25rem;
  width: 1.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Responsive */
@media (max-width: 640px) {
  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .livraison-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .livraison-actions {
    margin-left: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
