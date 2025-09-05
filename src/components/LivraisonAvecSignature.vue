<template>
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-container">
      <!-- Header avec étapes -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-left">
            <div class="bl-icon">
              <span class="bl-text">B</span>
            </div>
            <div>
              <h2 class="modal-title">Livraison avec Signature</h2>
              <p class="bl-number">{{ livraison.numeroBL }}</p>
            </div>
          </div>
          <button @click="handleClose" class="close-button">
            <svg class="close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Indicateur d'étapes -->
        <div class="steps-indicator">
          <div class="step-item">
            <div class="step-number" :class="currentStep === 'details' ? 'step-active' : 'step-inactive'">
              1
            </div>
            <span class="step-label" :class="currentStep === 'details' ? 'step-label-active' : 'step-label-inactive'">
              Détails
            </span>
          </div>
          
          <div class="step-connector"></div>
          
          <div class="step-item">
            <div class="step-number" :class="currentStep === 'signature' ? 'step-active' : 'step-inactive'">
              2
            </div>
            <span class="step-label" :class="currentStep === 'signature' ? 'step-label-active' : 'step-label-inactive'">
              Signature
            </span>
          </div>
          
          <div class="step-connector"></div>
          
          <div class="step-item">
            <div class="step-number" :class="currentStep === 'preuves' ? 'step-active' : 'step-inactive'">
              3
            </div>
            <span class="step-label" :class="currentStep === 'preuves' ? 'step-label-active' : 'step-label-inactive'">
              Preuves
            </span>
          </div>
          
          <div class="step-connector"></div>
          
          <div class="step-item">
            <div class="step-number" :class="currentStep === 'confirmation' ? 'step-active' : 'step-inactive'">
              4
            </div>
            <span class="step-label" :class="currentStep === 'confirmation' ? 'step-label-active' : 'step-label-inactive'">
              Confirmation
            </span>
          </div>
        </div>
      </div>

      <!-- Contenu des étapes -->
      <div class="modal-body">
        <!-- ÉTAPE 1: Détails de la livraison -->
        <div v-if="currentStep === 'details'">
          <div class="details-grid">
            <div class="info-card">
              <h3 class="info-title">Informations client</h3>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Client:</span>
                  <p class="info-value">{{ livraison.client }}</p>
                </div>
                <div class="info-item">
                  <span class="info-label">Téléphone:</span>
                  <p class="info-value">{{ livraison.telephone }}</p>
                </div>
                <div class="info-item">
                  <span class="info-label">Adresse:</span>
                  <p class="info-value">{{ livraison.adresse }}</p>
                </div>
              </div>
            </div>

            <div class="info-card">
              <h3 class="info-title">Informations livraison</h3>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Chauffeur:</span>
                  <p class="info-value">{{ livraison.chauffeur }}</p>
                </div>
                <div class="info-item">
                  <span class="info-label">Date:</span>
                  <p class="info-value">{{ currentDate }}</p>
                </div>
                            <div class="info-item">
              <span class="info-label">Heure de livraison:</span>
              <span class="info-value">{{ currentTime }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Produits -->
          <div class="produits-section">
            <h3 class="section-title">Produits à livrer</h3>
            <div class="produits-table">
              <div class="table-header">
                <div class="header-cell">Produit</div>
                <div class="header-cell">Commandé</div>
                <div class="header-cell">À livrer</div>
                <div class="header-cell">Livré</div>
                <div class="header-cell">Différence</div>
            </div>
              <div class="table-body">
                <div v-for="(produit, index) in livraison.produits" :key="index" class="table-row">
                  <div class="table-cell">{{ produit.nom }}</div>
                  <div class="table-cell">{{ produit.quantiteCommandee || produit.quantite }} {{ produit.unite }}</div>
                  <div class="table-cell">
                      <input
                      v-model.number="produit.quantiteLivree"
                        type="number"
                      min="0"
                        :max="produit.quantiteCommandee || produit.quantite"
                      class="quantity-input"
                      @input="updateProduitDifference(index)"
                    />
                    <span class="unite-text">{{ produit.unite }}</span>
            </div>
                  <div class="table-cell">{{ produit.quantiteLivree || 0 }} {{ produit.unite }}</div>
                  <div class="table-cell">
                    <span v-if="produit.difference !== 0" class="difference-badge" :class="produit.difference > 0 ? 'difference-positive' : 'difference-negative'">
                      {{ produit.difference > 0 ? '+' : '' }}{{ produit.difference }}
                </span>
                    <span v-else class="difference-zero">0</span>
              </div>
            </div>
          </div>
            </div>
          </div>

          <!-- Boutons de navigation -->
          <div class="step-actions">
            <button @click="nextStep" class="btn btn-primary">
              Continuer
              <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- ÉTAPE 2: Signature -->
        <div v-if="currentStep === 'signature'">
          <div class="signature-step">
            <h3 class="section-title">Signature du client</h3>
            <p class="section-description">Demandez au client de signer ci-dessous pour confirmer la réception</p>
          
          <SignaturePad
              title="Signature du client"
              description="Veuillez signer dans la zone ci-dessous"
              :required="true"
            @signature="handleSignature"
          />
        </div>

          <!-- Boutons de navigation -->
          <div class="step-actions">
            <button @click="previousStep" class="btn btn-secondary">
              <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <button @click="nextStep" :disabled="!signatureData" class="btn btn-primary" :class="{ 'btn-disabled': !signatureData }">
              Continuer
              <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            </div>
          </div>

        <!-- ÉTAPE 3: Preuves -->
        <div v-if="currentStep === 'preuves'">
          <div class="preuves-step">
            <h3 class="section-title">Preuves de livraison</h3>
            <p class="section-description">Ajoutez des photos ou vidéos pour documenter la livraison</p>
            
            <!-- Preuve de dépôt -->
            <div class="preuve-section">
              <h4 class="preuve-title">📸 Preuve de dépôt</h4>
              <p class="preuve-description">Photo/vidéo des produits déposés et de l'état général</p>
              
              <div class="media-upload">
                <input
                  ref="depotFileInput"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  class="file-input"
                  @change="handleDepotFiles"
                />
                <button @click="triggerDepotUpload" class="upload-btn">
                  <svg class="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Ajouter des médias
                </button>
              </div>
              
              <!-- Aperçu des médias -->
              <div v-if="preuvesDepot.length > 0" class="media-preview">
                <h5 class="preview-title">Médias ajoutés ({{ preuvesDepot.length }})</h5>
                <div class="media-grid">
                  <div v-for="(media, index) in preuvesDepot" :key="index" class="media-item">
                    <img v-if="media.type === 'image'" :src="media.url" :alt="media.name" class="media-thumbnail" />
                    <video v-else-if="media.type === 'video'" :src="media.url" class="media-thumbnail" controls></video>
                    <div class="media-overlay">
                      <button @click="removeDepotMedia(index)" class="remove-media-btn">
                        <svg class="remove-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
              </div>
              </div>
              </div>
            </div>
          </div>

            <!-- Preuve de réception -->
            <div class="preuve-section">
              <h4 class="preuve-title">✅ Preuve de réception</h4>
              <p class="preuve-description">Photo/vidéo de la réception par le client</p>
              
              <div class="media-upload">
                <input
                  ref="receptionFileInput"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  class="file-input"
                  @change="handleReceptionFiles"
                />
                <button @click="triggerReceptionUpload" class="upload-btn">
                  <svg class="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Ajouter des médias
                </button>
              </div>
              
              <!-- Aperçu des médias -->
              <div v-if="preuvesReception.length > 0" class="media-preview">
                <h5 class="preview-title">Médias ajoutés ({{ preuvesReception.length }})</h5>
                <div class="media-grid">
                  <div v-for="(media, index) in preuvesReception" :key="index" class="media-item">
                    <img v-if="media.type === 'image'" :src="media.url" :alt="media.name" class="media-thumbnail" />
                    <video v-else-if="media.type === 'video'" :src="media.url" class="media-thumbnail" controls></video>
                    <div class="media-overlay">
                      <button @click="removeReceptionMedia(index)" class="remove-media-btn">
                        <svg class="remove-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
            </div>
          </div>
        </div>
      </div>

            <!-- Observations -->
            <div class="observations-section">
              <h4 class="preuve-title">📝 Observations</h4>
              <textarea
                v-model="observations"
                placeholder="Observations supplémentaires sur la livraison..."
                rows="3"
                class="observations-input"
              ></textarea>
            </div>
          </div>

          <!-- Boutons de navigation -->
          <div class="step-actions">
            <button @click="previousStep" class="btn btn-secondary">
              <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <button @click="nextStep" class="btn btn-primary">
              Continuer
              <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          </div>

        <!-- ÉTAPE 3: Confirmation -->
        <div v-if="currentStep === 'confirmation'">
          <div class="confirmation-step">
            <div class="success-icon">
              <svg class="check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 class="confirmation-title">Livraison terminée avec succès !</h3>
            <p class="confirmation-description">La livraison a été enregistrée et la signature du client a été sauvegardée.</p>
            
            <!-- Résumé de la livraison -->
            <div class="delivery-summary">
              <h4 class="summary-title">Résumé de la livraison</h4>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-label">Client:</span>
                  <span class="summary-value">{{ livraison.client }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Date:</span>
                  <span class="summary-value">{{ currentDate }}</span>
                </div>
                                 <div class="summary-item">
                   <span class="summary-label">Heure:</span>
                   <span class="summary-value">{{ currentTime }}</span>
                 </div>
                <div class="summary-item">
                  <span class="summary-label">Chauffeur:</span>
                  <span class="summary-value">{{ livraison.chauffeur }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons de navigation -->
          <div class="step-actions">
            <button @click="previousStep" class="btn btn-secondary">
              <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <button @click="saveLivraison" class="btn btn-success">
              <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Finaliser la livraison
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storageService, type Livraison } from '../services/storage'
import SignaturePad from './SignaturePad.vue'

interface Props {
  livraison: Livraison
  showModal: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [livraison: Livraison]
}>()

const preuveDepot = ref('')
const preuveReception = ref('')
const signatureClient = ref('')
const observations = ref('')
const currentStep = ref<'details' | 'signature' | 'preuves' | 'confirmation'>('details')

// Références pour les inputs de fichiers
const depotFileInput = ref<HTMLInputElement>()
const receptionFileInput = ref<HTMLInputElement>()

// Tableaux pour stocker les preuves
const preuvesDepot = ref<Array<{ file: File; url: string; name: string; type: 'image' | 'video' }>>([])
const preuvesReception = ref<Array<{ file: File; url: string; name: string; type: 'image' | 'video' }>>([])

const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
})

const currentTime = computed(() => {
  return new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Vérifier si on peut passer à la signature
const canProceedToSignature = computed(() => {
  return props.livraison.produits.some(p => (p.quantiteLivree || p.quantite || 0) > 0)
})

// Vérifier s'il y a des différences
const hasDifferences = computed(() => {
  return props.livraison.produits.some((produit) => {
    const quantiteCommandee = produit.quantiteCommandee || produit.quantite || 0
    const quantiteLivree = produit.quantiteLivree || 0
    return quantiteCommandee !== quantiteLivree
  })
})

// Cette fonction sera remplacée par la nouvelle version ci-dessous

const handleSignatureClear = () => {
  signatureClient.value = ''
}

const nextStep = () => {
  if (currentStep.value === 'details') {
    currentStep.value = 'signature'
  } else if (currentStep.value === 'signature') {
    currentStep.value = 'preuves'
  } else if (currentStep.value === 'preuves') {
    currentStep.value = 'confirmation'
  }
}

const previousStep = () => {
  if (currentStep.value === 'signature') {
    currentStep.value = 'details'
  } else if (currentStep.value === 'preuves') {
    currentStep.value = 'signature'
  } else if (currentStep.value === 'confirmation') {
    currentStep.value = 'preuves'
  }
}

  // Les différences sont calculées automatiquement via les computed

// Cette fonction a été remplacée par le composant BordereauViewer

const finaliserLivraison = async () => {
  // Récupérer la date et l'heure actuelles au moment de la finalisation
  const now = new Date()
  const dateLivraison = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  const heureLivraison = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  // Convertir les fichiers en base64
  const preuvesDepotBase64 = await Promise.all(
    preuvesDepot.value.map(async (p) => {
      const base64 = await fileToBase64(p.file)
      return `${p.name}|${p.type}|${base64}`
    })
  )
  
  const preuvesReceptionBase64 = await Promise.all(
    preuvesReception.value.map(async (p) => {
      const base64 = await fileToBase64(p.file)
      return `${p.name}|${p.type}|${base64}`
    })
  )
  
  // Mettre à jour la livraison avec les nouvelles données
  const livraisonMiseAJour = {
    ...props.livraison,
    statut: 'livre' as const,
    preuveDepot: preuvesDepotBase64.join(';;'),
    preuveReception: preuvesReceptionBase64.join(';;'),
    signatureClient: signatureClient.value,
    observations: observations.value,
    heureLivraison: heureLivraison,
    dateLivraison: dateLivraison,
    // Mettre à jour les quantités livrées
    produits: props.livraison.produits.map((produit, index) => ({
      ...produit,
      quantiteLivree: produit.quantiteLivree || 0,
      difference: produit.difference || 0
    }))
  }
  
  // Mettre à jour automatiquement l'état de la commande associée
  storageService.mettreAJourEtatCommandeApresLivraison(livraisonMiseAJour)
  
  emit('save', livraisonMiseAJour)
  emit('close')
}

// Fonction utilitaire pour convertir un fichier en base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Erreur lors de la conversion du fichier'))
      }
    }
    reader.onerror = error => reject(error)
  })
}

// Méthodes pour la nouvelle interface
const updateProduitDifference = (index: number) => {
  const produit = props.livraison.produits[index]
  const quantiteCommandee = produit.quantiteCommandee || produit.quantite || 0
  const quantiteLivree = produit.quantiteLivree || 0
  produit.difference = quantiteCommandee - quantiteLivree
}

const saveLivraison = () => {
  finaliserLivraison()
}

// Variable pour stocker la signature
const signatureData = ref('')

const handleSignature = (signatureDataValue: string) => {
  signatureData.value = signatureDataValue
  signatureClient.value = signatureDataValue
  currentStep.value = 'preuves'
}

// Méthodes pour la gestion des preuves
const triggerDepotUpload = () => {
  depotFileInput.value?.click()
}

const triggerReceptionUpload = () => {
  receptionFileInput.value?.click()
}

const handleDepotFiles = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    Array.from(target.files).forEach(file => {
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith('image/') ? 'image' : 'video'
      preuvesDepot.value.push({
        file,
        url,
        name: file.name,
        type
      })
    })
  }
}

const handleReceptionFiles = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    Array.from(target.files).forEach(file => {
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith('image/') ? 'image' : 'video'
      preuvesReception.value.push({
        file,
        url,
        name: file.name,
        type
      })
    })
  }
}

const removeDepotMedia = (index: number) => {
  const media = preuvesDepot.value[index]
  URL.revokeObjectURL(media.url)
  preuvesDepot.value.splice(index, 1)
}

const removeReceptionMedia = (index: number) => {
  const media = preuvesReception.value[index]
  URL.revokeObjectURL(media.url)
  preuvesReception.value.splice(index, 1)
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
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
  max-width: 64rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

/* Header */
.modal-header {
  position: sticky;
  top: 0;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bl-icon {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 0.75rem;
  background-color: #f97316;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bl-text {
  color: #ffffff;
  font-weight: 700;
  font-size: 1.125rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.bl-number {
  font-size: 0.875rem;
  color: #6b7280;
}

.close-button {
  color: #9ca3af;
  transition: color 0.2s ease-in-out;
  background: none;
  border: none;
  cursor: pointer;
}

.close-button:hover {
  color: #6b7280;
}

.close-icon {
  height: 1.5rem;
  width: 1.5rem;
}

/* Steps indicator */
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  height: 2rem;
  width: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.step-active {
  background-color: #f97316;
  color: #ffffff;
}

.step-inactive {
  background-color: #e5e7eb;
  color: #6b7280;
}

.step-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.step-label-active {
  color: #f97316;
}

.step-label-inactive {
  color: #6b7280;
}

.step-connector {
  height: 0.25rem;
  width: 2rem;
  background-color: #e5e7eb;
  border-radius: 0.125rem;
}

/* Body */
.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Details step */
.details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.info-card {
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 1rem;
}

.info-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  color: #111827;
}

.time-input {
  margin-top: 0.25rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.time-input:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

/* Produits section */
.produits-section {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.produits-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
}

.table-cell {
  color: #111827;
  font-size: 0.875rem;
}

.header-cell {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.quantity-input {
  width: 4rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  text-align: center;
  transition: border-color 0.2s ease-in-out;
}

.quantity-input:focus {
  outline: none;
  border-color: #f97316;
}

.unite-text {
  margin-left: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.difference-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.difference-positive {
  background-color: #dcfce7;
  color: #166534;
}

.difference-negative {
  background-color: #fee2e2;
  color: #991b1b;
}

.difference-zero {
  color: #6b7280;
  font-size: 0.75rem;
}

/* Signature step */
.signature-step {
  text-align: center;
}

.section-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Preuves step */
.preuves-step {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.preuve-section {
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.preuve-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.preuve-description {
  color: #6b7280;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.media-upload {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.file-input {
  display: none;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f97316;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.upload-btn:hover {
  background-color: #ea580c;
}

.upload-icon {
  height: 1.25rem;
  width: 1.25rem;
}

.media-preview {
  margin-top: 1rem;
}

.preview-title {
  font-weight: 500;
  color: #374151;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.media-item {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.media-thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.media-overlay {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
}

.remove-media-btn {
  background-color: rgba(239, 68, 68, 0.9);
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.remove-media-btn:hover {
  background-color: rgba(220, 38, 38, 1);
}

.remove-icon {
  height: 0.875rem;
  width: 0.875rem;
}

.observations-section {
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.observations-input {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.75rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease-in-out;
}

.observations-input:focus {
  outline: none;
  border-color: #f97316;
}

/* Confirmation step */
.confirmation-step {
  text-align: center;
}

.success-icon {
  height: 4rem;
  width: 4rem;
  background-color: #d1fae5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.check-icon {
  height: 2rem;
  width: 2rem;
  color: #10b981;
}

.confirmation-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.confirmation-description {
  color: #6b7280;
  margin-bottom: 2rem;
}

.delivery-summary {
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.summary-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.summary-item {
  display: flex;
  justify-content: space-between;
}

.summary-label {
  font-weight: 500;
  color: #6b7280;
}

.summary-value {
  color: #111827;
}

/* Step actions */
.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* Buttons */
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

.btn:hover:not(.btn-disabled) {
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

.btn-primary:hover:not(.btn-disabled) {
  background-color: #ea580c;
}

.btn-secondary {
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(.btn-disabled) {
  background-color: #f9fafb;
}

.btn-success {
  background-color: #10b981;
  color: #ffffff;
}

.btn-success:hover:not(.btn-disabled) {
  background-color: #059669;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-disabled:hover {
  transform: none;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .steps-indicator {
    gap: 1rem;
  }
  
  .step-connector {
    width: 1rem;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .header-cell,
  .table-cell {
    padding: 0.25rem 0;
  }
  
  .step-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
