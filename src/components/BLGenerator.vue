<template>
  <div class="bl-generator">
    <div class="bl-container pdf-compatible" ref="blContainer">
      <!-- En-tête professionnel -->
      <div class="bl-header-pro">
        <div class="bl-header-left">
          <div class="bl-logo">
            <img :src="logo" :alt="getLogoAlt()" class="logo-image" />
          </div>
          <div class="bl-company">
            <h1 class="company-name">GLOBAL STAR DISTRIBUTION</h1>
            <p class="company-tagline">Distribution de matériaux de construction</p>
            <p class="company-contact">contact@globalstar.com</p>
          </div>
        </div>
        <div class="bl-header-right">
          <div class="bl-doc-type">BON DE LIVRAISON</div>
          <div class="bl-number">N° {{ livraison.numeroBl || livraison.numero_bl }}</div>
          <div class="bl-date">Date : {{ formatDate(livraison.date) }}</div>
        </div>
      </div>

      <!-- Bloc client / livraison -->
      <div class="bl-info-pro">
        <div class="bl-info-block client-block">
          <div class="block-label">DESTINATAIRE</div>
          <div class="block-content">
            <div class="client-name">{{ livraison.client }}</div>
            <div class="client-address">{{ livraison.adresse }}</div>
            <div class="client-phone">{{ livraison.telephone || '—' }}</div>
          </div>
        </div>
        <div class="bl-info-block delivery-block">
          <div class="block-label">DÉTAILS LIVRAISON</div>
          <div class="block-content">
            <div class="info-row"><span class="info-label">Date :</span> {{ formatDate(livraison.date) }}</div>
            <div class="info-row"><span class="info-label">Heure :</span> {{ livraison.heureLivraison || livraison.heure_livraison || '—' }}</div>
            <div class="info-row"><span class="info-label">Statut :</span> {{ getStatutLabel(livraison.statut) }}</div>
          </div>
        </div>
      </div>

      <!-- Tableau des articles -->
      <div class="bl-articles-pro">
        <table class="articles-table-pro">
          <thead>
            <tr>
              <th class="col-desc">Désignation</th>
              <th class="col-qty">Qté</th>
              <th class="col-unit">Unité</th>
              <th class="col-price">Prix unit. HT</th>
              <th class="col-total">Total HT</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(article, idx) in livraison.produits" :key="article.nom" :class="{ 'row-alt': idx % 2 === 1 }">
              <td class="col-desc">{{ article.nom }}</td>
              <td class="col-qty">{{ article.quantiteLivree ?? article.quantite_livree ?? article.quantite }}</td>
              <td class="col-unit">{{ article.unite }}</td>
              <td class="col-price">{{ formatPrice((article as any).prixUnitaire ?? (article as any).prix_unitaire ?? 0) }}</td>
              <td class="col-total">{{ formatPrice((article.quantiteLivree ?? article.quantite_livree ?? article.quantite) * ((article as any).prixUnitaire ?? (article as any).prix_unitaire ?? 0)) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row-pro">
              <td colspan="4"><strong>TOTAL HT</strong></td>
              <td class="col-total"><strong>{{ formatPrice(totalAmount) }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Notes -->
      <div v-if="livraison.notes" class="bl-notes-pro">
        <div class="notes-label">OBSERVATIONS</div>
        <div class="notes-content">{{ livraison.notes }}</div>
      </div>

      <!-- Signatures -->
      <div class="bl-signatures-pro">
        <div class="signature-info">
          <p class="signature-note">Les signatures sont optionnelles pour la génération du BL.</p>
        </div>
        <div class="signature-grid">
          <div class="signature-block">
            <div class="signature-label">LIVREUR</div>
            <div class="signature-canvas-wrap">
              <canvas
                ref="livreurCanvas"
                @mousedown="startDrawing"
                @mousemove="draw"
                @mouseup="stopDrawing"
                @mouseleave="stopDrawing"
                class="signature-canvas"
              />
            </div>
            <div class="signature-meta">{{ currentUser?.user_metadata?.first_name }} {{ currentUser?.user_metadata?.last_name }} — {{ new Date().toLocaleDateString('fr-FR') }}</div>
          </div>
          <div class="signature-block">
            <div class="signature-label">CLIENT</div>
            <div class="signature-canvas-wrap">
              <canvas
                ref="clientCanvas"
                @mousedown="startDrawingClient"
                @mousemove="drawClient"
                @mouseup="stopDrawingClient"
                @mouseleave="stopDrawingClient"
                class="signature-canvas"
              />
            </div>
            <div class="signature-meta">{{ livraison.client }} — {{ new Date().toLocaleDateString('fr-FR') }}</div>
          </div>
        </div>
      </div>

      <!-- Pied de page -->
      <div class="bl-footer-pro">
        <div class="footer-line">Document établi par Global Star Distribution — Bon de livraison non fiscal</div>
      </div>

      <!-- Actions (hors PDF) -->
      <div class="bl-actions">
        <button @click="clearSignature('livreur')" class="btn btn-secondary">Effacer livreur</button>
        <button @click="clearSignature('client')" class="btn btn-secondary">Effacer client</button>
        <button @click="generatePDF" class="btn btn-primary">Générer PDF</button>
        <button @click="saveToDocuments" class="btn btn-success" :disabled="!pdfGenerated">Sauvegarder</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuth } from '@/services/auth'
import { useLaravelApi, type LaravelLivraison } from '@/services/laravelApiService'
import { useLogo } from '@/composables/useLogo'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const props = defineProps<{
  livraison: LaravelLivraison
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { user: currentUser } = useAuth()
const { addDocument } = useLaravelApi()
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
    const qty = article.quantiteLivree ?? article.quantite_livree ?? article.quantite ?? 0
    const price = article.prixUnitaire ?? article.prix_unitaire ?? 0
    return total + (qty * price)
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
    'livre': 'Livré',
    'livree': 'Livrée',
    'annule': 'Annulé',
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
        if (element.classList.contains('oklch-color')) return true
        if (element.classList.contains('bl-actions')) return true
        return false
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

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // Retirer le préfixe data:...;base64, pour n'envoyer que la chaîne base64
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

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
    
    // Convertir le Blob en base64 (le backend attend une chaîne, pas un Blob)
    const contenuBase64 = await blobToBase64(pdfBlob.value)
    
    // Ajouter le document
    const documentData = {
      nom: `Bon de Livraison ${props.livraison.numeroBl}`,
      type: 'bon_livraison',
      description: `Bon de livraison pour la commande ${props.livraison.numeroBl}`,
      taille: pdfBlob.value.size,
      url: '',
      contenu: contenuBase64,
      fileName: fileName
    }
    
    console.log('📤 [BLGenerator] Envoi vers l\'API...', { ...documentData, contenu: '[base64...]' })
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
  max-width: 210mm;
  margin: 0 auto;
  padding: 1.5rem;
}

.bl-container {
  background: #ffffff;
  padding: 0;
  max-width: 100%;
  overflow-x: auto;
}

.pdf-compatible {
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
}

.pdf-compatible * {
  color: #1a1a1a !important;
  border-color: #d1d5db !important;
}

/* En-tête professionnel */
.bl-header-pro {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 0;
  border-bottom: 3px solid #1e3a5f;
  margin-bottom: 1.5rem;
}

.bl-header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.bl-logo {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.bl-company {
  flex: 1;
}

.company-name {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #1e3a5f !important;
  margin: 0 0 0.25rem 0;
}

.company-tagline {
  font-size: 0.75rem;
  color: #64748b !important;
  margin: 0 0 0.25rem 0;
}

.company-contact {
  font-size: 0.75rem;
  color: #64748b !important;
  margin: 0;
}

.bl-header-right {
  text-align: right;
}

.bl-doc-type {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #1e3a5f !important;
  margin-bottom: 0.5rem;
}

.bl-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a5f !important;
  margin-bottom: 0.25rem;
}

.bl-date {
  font-size: 0.8rem;
  color: #64748b !important;
}

/* Blocs info */
.bl-info-pro {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.bl-info-block {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.block-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #ffffff !important;
  background: #1e3a5f !important;
  padding: 0.4rem 0.75rem;
}

.block-content {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
}

.client-name {
  font-weight: 600;
  color: #1a1a1a !important;
  margin-bottom: 0.35rem;
}

.client-address,
.client-phone {
  color: #475569 !important;
  font-size: 0.85rem;
  line-height: 1.4;
}

.info-row {
  margin-bottom: 0.25rem;
  color: #1a1a1a !important;
}

.info-label {
  display: inline-block;
  width: 4rem;
  color: #64748b !important;
}

/* Tableau articles */
.bl-articles-pro {
  margin-bottom: 1.5rem;
}

.articles-table-pro {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.articles-table-pro thead tr {
  background: #1e3a5f !important;
}

.articles-table-pro th {
  padding: 0.6rem 0.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  color: #ffffff !important;
}

.articles-table-pro td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #1a1a1a !important;
  background: #ffffff !important;
}

.articles-table-pro .row-alt td {
  background: #f8fafc !important;
}

.col-desc { width: 40%; }
.col-qty { width: 10%; text-align: center; }
.col-unit { width: 12%; text-align: center; }
.col-price { width: 18%; text-align: right; }
.col-total { width: 20%; text-align: right; }

.articles-table-pro .col-price,
.articles-table-pro .col-total {
  font-variant-numeric: tabular-nums;
}

.total-row-pro {
  background: #f1f5f9 !important;
  font-weight: 700;
}

.total-row-pro td {
  padding: 0.75rem !important;
  border-top: 2px solid #1e3a5f;
  border-bottom: none !important;
}

/* Notes */
.bl-notes-pro {
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.notes-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #ffffff !important;
  background: #64748b !important;
  padding: 0.4rem 0.75rem;
}

.notes-content {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #475569 !important;
}

/* Signatures */
.bl-signatures-pro {
  margin-bottom: 1.5rem;
}

.signature-note {
  font-size: 0.75rem;
  color: #64748b !important;
  margin: 0 0 1rem 0;
}

.signature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.signature-block {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.signature-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #ffffff !important;
  background: #475569 !important;
  padding: 0.4rem 0.75rem;
}

.signature-canvas-wrap {
  padding: 0.5rem;
  background: #ffffff !important;
}

.signature-canvas {
  width: 100%;
  height: 100px;
  border: 1px dashed #cbd5e1;
  border-radius: 2px;
  cursor: crosshair;
  background: #ffffff !important;
  display: block;
}

.signature-meta {
  font-size: 0.75rem;
  color: #64748b !important;
  padding: 0.4rem 0.75rem;
  border-top: 1px solid #e2e8f0;
}

/* Pied de page */
.bl-footer-pro {
  padding: 0.75rem 0;
  border-top: 1px solid #e2e8f0;
}

.footer-line {
  font-size: 0.7rem;
  color: #94a3b8 !important;
  text-align: center;
}

/* Actions */
.bl-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  padding-top: 1.5rem;
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #1e3a5f;
  color: #ffffff !important;
}

.btn-primary:hover:not(:disabled) {
  background: #2d4a6f;
}

.btn-secondary {
  background: #64748b;
  color: #ffffff !important;
}

.btn-secondary:hover {
  background: #475569;
}

.btn-success {
  background: #0d9488;
  color: #ffffff !important;
}

.btn-success:hover:not(:disabled) {
  background: #0f766e;
}

@media (max-width: 640px) {
  .bl-header-pro { flex-direction: column; gap: 1rem; }
  .bl-header-right { text-align: left; }
  .bl-info-pro { grid-template-columns: 1fr; }
  .signature-grid { grid-template-columns: 1fr; }
  .bl-actions { flex-direction: column; }
  .btn { width: 100%; }
}
</style>
