<template>
  <div class="bl-generator">
    <div class="bl-container pdf-compatible" ref="blContainer">
      <!-- En-tête du BL -->
      <div class="bl-header">
        <div class="bl-title">
          <h1>BON DE LIVRAISON</h1>
          <div class="bl-number">N° {{ livraison.numeroBl }}</div>
        </div>
        <div class="bl-logo">
          <img 
            :src="logo" 
            :alt="getLogoAlt()" 
            :class="getLogoClass('large')"
            class="logo-image"
          />
        </div>
      </div>

      <!-- Informations de la livraison -->
      <div class="bl-info">
        <div class="info-section">
          <h3>Informations de livraison</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Date de livraison :</span>
              <span class="value">{{ formatDate(livraison.date) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Heure de livraison :</span>
              <span class="value">{{ livraison.heureLivraison || 'Non spécifiée' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Statut :</span>
              <span class="value">{{ getStatutLabel(livraison.statut) }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>Client</h3>
          <div class="client-info">
            <div class="info-item">
              <span class="label">Nom :</span>
              <span class="value">{{ livraison.client }}</span>
            </div>
            <div class="info-item">
              <span class="label">Adresse :</span>
              <span class="value">{{ livraison.adresse }}</span>
            </div>
            <div class="info-item">
              <span class="label">Téléphone :</span>
              <span class="value">{{ livraison.telephone || 'Non spécifié' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Articles livrés -->
      <div class="bl-articles">
        <h3>Articles livrés</h3>
        <table class="articles-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Quantité</th>
              <th>Unité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in livraison.produits" :key="article.nom">
              <td>{{ article.nom }}</td>
              <td>{{ article.quantite }}</td>
              <td>{{ article.unite }}</td>
              <td>{{ formatPrice((article as any).prixUnitaire || 0) }}</td>
              <td>{{ formatPrice(article.quantite * ((article as any).prixUnitaire || 0)) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="4"><strong>Total</strong></td>
              <td><strong>{{ formatPrice(totalAmount) }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Notes et observations -->
      <div v-if="livraison.notes" class="bl-notes">
        <h3>Notes et observations</h3>
        <p>{{ livraison.notes }}</p>
      </div>

      <!-- Signatures -->
      <div class="bl-signatures">
        <div class="signature-info">
          <p class="text-sm text-gray-600 mb-4">
            <strong>Note :</strong> Les signatures sont optionnelles. Vous pouvez générer le BL même sans signatures complètes.
          </p>
        </div>
        <div class="signature-section">
          <h3>Signature du livreur</h3>
          <div class="signature-container">
            <canvas
              ref="livreurCanvas"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              class="signature-canvas"
            ></canvas>
            <div class="signature-info">
              <p><strong>Nom du livreur :</strong> {{ currentUser?.user_metadata?.first_name }} {{ currentUser?.user_metadata?.last_name }}</p>
              <p><strong>Date :</strong> {{ new Date().toLocaleDateString('fr-FR') }}</p>
            </div>
          </div>
        </div>

        <div class="signature-section">
          <h3>Signature du client</h3>
          <div class="signature-container">
            <canvas
              ref="clientCanvas"
              @mousedown="startDrawingClient"
              @mousemove="drawClient"
              @mouseup="stopDrawingClient"
              @mouseleave="stopDrawingClient"
              class="signature-canvas"
            ></canvas>
            <div class="signature-info">
              <p><strong>Nom du client :</strong> {{ livraison.client }}</p>
              <p><strong>Date :</strong> {{ new Date().toLocaleDateString('fr-FR') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="bl-actions">
        <button @click="clearSignature('livreur')" class="btn btn-secondary">
          Effacer signature livreur
        </button>
        <button @click="clearSignature('client')" class="btn btn-secondary">
          Effacer signature client
        </button>
        <button @click="generatePDF" class="btn btn-primary">
          Générer PDF
        </button>
        <button @click="saveToDocuments" class="btn btn-success" :disabled="!pdfGenerated">
          Sauvegarder dans Documents
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuth } from '@/services/auth'
import { useCompleteHybridService, type CompleteLivraison } from '@/services/completeHybridService'
import { useLogo } from '@/composables/useLogo'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const props = defineProps<{
  livraison: CompleteLivraison
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { user: currentUser } = useAuth()
const { addDocument } = useCompleteHybridService()
const { logo, getLogoAlt, getLogoClass } = useLogo()

// Refs
const blContainer = ref<HTMLElement>()
const livreurCanvas = ref<HTMLCanvasElement>()
const clientCanvas = ref<HTMLCanvasElement>()

// État des signatures
const isDrawing = ref(false)
const isDrawingClient = ref(false)
const pdfGenerated = ref(false)
const pdfBlob = ref<Blob | null>(null)

// Contexte des canvas
let livreurCtx: CanvasRenderingContext2D | null = null
let clientCtx: CanvasRenderingContext2D | null = null

// Computed
const totalAmount = computed(() => {
  return props.livraison.produits.reduce((total: number, article: any) => {
    return total + (article.quantite * (article.prixUnitaire || 0))
  }, 0)
})

const isSignaturesComplete = computed(() => {
  return livreurCtx && clientCtx && 
         !isCanvasEmpty(livreurCtx) && 
         !isCanvasEmpty(clientCtx)
})

// Méthodes
const getStatutLabel = (statut: string) => {
  const labels: Record<string, string> = {
    'en_attente': 'En attente',
    'en_cours': 'En cours',
    'livree': 'Livrée',
    'annulee': 'Annulée'
  }
  return labels[statut] || statut
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const initCanvas = () => {
  if (livreurCanvas.value && clientCanvas.value) {
    livreurCtx = livreurCanvas.value.getContext('2d')
    clientCtx = clientCanvas.value.getContext('2d')
    
    if (livreurCtx && clientCtx) {
      // Configuration du canvas
      const setupCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        // Redimensionner le canvas
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
      
      setupCanvas(livreurCtx, livreurCanvas.value)
      setupCanvas(clientCtx, clientCanvas.value)
    }
  }
}

const startDrawing = (e: MouseEvent) => {
  if (!livreurCtx) return
  isDrawing.value = true
  const rect = livreurCanvas.value!.getBoundingClientRect()
  livreurCtx.beginPath()
  livreurCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !livreurCtx) return
  const rect = livreurCanvas.value!.getBoundingClientRect()
  livreurCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
  livreurCtx.stroke()
}

const stopDrawing = () => {
  isDrawing.value = false
}

const startDrawingClient = (e: MouseEvent) => {
  if (!clientCtx) return
  isDrawingClient.value = true
  const rect = clientCanvas.value!.getBoundingClientRect()
  clientCtx.beginPath()
  clientCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
}

const drawClient = (e: MouseEvent) => {
  if (!isDrawingClient.value || !clientCtx) return
  const rect = clientCanvas.value!.getBoundingClientRect()
  clientCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
  clientCtx.stroke()
}

const stopDrawingClient = () => {
  isDrawingClient.value = false
}

const clearSignature = (type: 'livreur' | 'client') => {
  if (type === 'livreur' && livreurCtx) {
    livreurCtx.clearRect(0, 0, livreurCanvas.value!.width, livreurCanvas.value!.height)
  } else if (type === 'client' && clientCtx) {
    clientCtx.clearRect(0, 0, clientCanvas.value!.width, clientCanvas.value!.height)
  }
}

const isCanvasEmpty = (ctx: CanvasRenderingContext2D) => {
  const canvas = ctx.canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 0) { // Alpha channel
      return false
    }
  }
  return true
}

const generatePDF = async () => {
  if (!blContainer.value) return
  
  try {
    console.log('🖨️ [BLGenerator] Génération du PDF...')
    
    // Capturer le contenu du BL avec options compatibles
    const canvas = await html2canvas(blContainer.value, {
      scale: 1.5,
      useCORS: false,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: blContainer.value.scrollWidth,
      height: blContainer.value.scrollHeight,
      ignoreElements: (element) => {
        // Ignorer les éléments avec des couleurs oklch
        return element.classList.contains('oklch-color')
      }
    })
    
    // Créer le PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    
    let position = 0
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    // Générer le blob
    const pdfBlobGenerated = pdf.output('blob')
    pdfGenerated.value = true
    pdfBlob.value = pdfBlobGenerated
    
    console.log('✅ [BLGenerator] PDF généré avec succès')
  } catch (error) {
    console.error('❌ [BLGenerator] Erreur lors de la génération du PDF:', error)
  }
}

const saveToDocuments = async () => {
  if (!pdfBlob.value) {
    console.error('❌ [BLGenerator] Aucun PDF à sauvegarder')
    return
  }
  
  try {
    console.log('💾 [BLGenerator] Sauvegarde du BL dans les documents...')
    console.log('📄 [BLGenerator] Taille du PDF:', pdfBlob.value.size, 'bytes')
    
    // Créer un nom de fichier unique
    const fileName = `BL_${props.livraison.numeroBl}_${new Date().toISOString().split('T')[0]}.pdf`
    console.log('📁 [BLGenerator] Nom du fichier:', fileName)
    
    // Ajouter le document
    const documentData = {
      nom: `Bon de Livraison ${props.livraison.numeroBl}`,
      type: 'bon_livraison',
      description: `Bon de livraison pour la commande ${props.livraison.numeroBl}`,
      taille: pdfBlob.value.size,
      url: '',
      contenu: pdfBlob.value,
      fileName: fileName
    }
    
    console.log('📤 [BLGenerator] Envoi vers Supabase...', documentData)
    const result = await addDocument(documentData)
    console.log('✅ [BLGenerator] BL sauvegardé dans les documents:', result)
    
    emit('saved')
  } catch (error) {
    console.error('❌ [BLGenerator] Erreur lors de la sauvegarde:', error)
    console.error('❌ [BLGenerator] Détails de l\'erreur:', (error as Error).message)
  }
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initCanvas()
  })
})
</script>

<style scoped>
.bl-generator {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.bl-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  overflow-x: auto;
}

/* Styles compatibles avec html2canvas - éviter oklch */
.pdf-compatible {
  font-family: Arial, sans-serif !important;
}

.pdf-compatible * {
  color: #000000 !important;
  background-color: #ffffff !important;
  border-color: #000000 !important;
}

.pdf-compatible .text-gray-600 {
  color: #6b7280 !important;
}

.pdf-compatible .text-gray-900 {
  color: #111827 !important;
}

.pdf-compatible .bg-gray-50 {
  background-color: #f9fafb !important;
}

.pdf-compatible .bg-gray-100 {
  background-color: #f3f4f6 !important;
}

.bl-generator .bl-header {
  background-color: #f8f9fa !important;
  border-bottom-color: #dee2e6 !important;
}

.bl-generator .bl-table th {
  background-color: #e9ecef !important;
  color: #000000 !important;
}

.bl-generator .bl-table td {
  background-color: #ffffff !important;
  color: #000000 !important;
  border-color: #dee2e6 !important;
}

.bl-generator .btn {
  background-color: #007bff !important;
  color: #ffffff !important;
  border-color: #007bff !important;
}

.bl-generator .btn:hover {
  background-color: #0056b3 !important;
}

.bl-generator .btn-secondary {
  background-color: #6c757d !important;
  color: #ffffff !important;
  border-color: #6c757d !important;
}

.bl-generator .btn-success {
  background-color: #28a745 !important;
  color: #ffffff !important;
  border-color: #28a745 !important;
}

.bl-generator .signature-container {
  background-color: #ffffff !important;
  border-color: #000000 !important;
}

.bl-generator .logo-image {
  background-color: #ffffff !important;
  border: 1px solid #000000 !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .bl-container {
    padding: 0.5rem;
    margin: 0.5rem;
  }
  
  .bl-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .bl-info {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .bl-table {
    font-size: 0.875rem;
  }
  
  .bl-table th,
  .bl-table td {
    padding: 0.5rem;
  }
  
  .bl-signatures {
    flex-direction: column;
    gap: 1rem;
  }
  
  .signature-section {
    width: 100%;
  }
  
  .signature-container {
    width: 100%;
    height: 150px;
  }
  
  .bl-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}

.bl-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.bl-title h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
}

.bl-number {
  font-size: 1rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.bl-logo {
  width: 120px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 0.5rem;
  padding: 0.5rem;
}

.logo-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0.25rem;
}

.bl-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: 500;
  color: #6b7280;
}

.value {
  color: #111827;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bl-articles {
  margin-bottom: 2rem;
}

.bl-articles h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.articles-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
}

.articles-table th,
.articles-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.articles-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.total-row {
  background: #f9fafb;
  font-weight: bold;
}

.bl-notes {
  margin-bottom: 2rem;
}

.bl-notes h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.bl-notes p {
  color: #6b7280;
  line-height: 1.5;
}

.bl-signatures {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.signature-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.signature-container {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 1rem;
}

.signature-canvas {
  width: 100%;
  height: 120px;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  cursor: crosshair;
  background: white;
}

.signature-info {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.signature-info p {
  margin: 0.25rem 0;
}

.bl-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}
</style>
