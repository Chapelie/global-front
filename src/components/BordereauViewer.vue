<template>
  <div class="bordereau-viewer">
    <div class="viewer-header">
      <h2 class="viewer-title">Bordereau de Livraison</h2>
      <div class="viewer-actions">
        <button @click="telechargerPDF" class="btn btn-primary">
          <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Télécharger PDF
        </button>
        <button @click="imprimer" class="btn btn-secondary">
          <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimer
        </button>
        <button @click="$emit('close')" class="btn btn-outline">
          <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Fermer
        </button>
      </div>
    </div>

    <div class="bordereau-content" ref="bordereauContent">
      <!-- En-tête du bordereau -->
      <div class="bl-header">
        <div class="company-info">
          <div class="company-logo">
            <img src="/logo.jpg" alt="Global Star Distribution" class="logo-image" />
          </div>
          <div class="company-details">
            <h1 class="company-name">GLOBAL STAR DISTRIBUTION</h1>
            <p class="company-address">123 Rue de la Distribution, 75001 Paris</p>
            <p class="company-contact">Tél: +33 1 23 45 67 89 | Email: contact@globalstar.com</p>
          </div>
        </div>
        <div class="bl-info">
          <h2 class="bl-title">BORDEREAU DE LIVRAISON</h2>
          <div class="bl-number">N° {{ livraison.numeroBL }}</div>
          <div class="bl-date">Date: {{ formatDate(livraison.dateLivraison || livraison.date) }}</div>
        </div>
      </div>

      <!-- Informations client et livraison -->
      <div class="info-sections">
        <div class="info-section">
          <h3 class="section-title">Informations Client</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Client:</span>
              <span class="info-value">{{ livraison.client }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Téléphone:</span>
              <span class="info-value">{{ livraison.telephone }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Adresse:</span>
              <span class="info-value">{{ livraison.adresse }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3 class="section-title">Informations Livraison</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Chauffeur:</span>
              <span class="info-value">{{ livraison.chauffeur }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date de livraison:</span>
              <span class="info-value">{{ formatDate(livraison.dateLivraison || livraison.date) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Heure:</span>
              <span class="info-value">{{ livraison.heureLivraison || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tableau des produits -->
      <div class="products-section">
        <h3 class="section-title">Produits Livrés</h3>
        <div class="products-table">
          <div class="table-header">
            <div class="header-cell">Produit</div>
            <div class="header-cell">Quantité commandée</div>
            <div class="header-cell">Quantité livrée</div>
            <div class="header-cell">Différence</div>
            <div class="header-cell">Unité</div>
          </div>
          <div class="table-body">
            <div v-for="(produit, index) in livraison.produits" :key="index" class="table-row">
              <div class="table-cell">{{ produit.nom }}</div>
              <div class="table-cell">{{ produit.quantiteCommandee || produit.quantite }}</div>
              <div class="table-cell">{{ produit.quantiteLivree || 0 }}</div>
              <div class="table-cell">
                <span v-if="produit.difference !== 0" class="difference-badge" :class="produit.difference > 0 ? 'difference-positive' : 'difference-negative'">
                  {{ produit.difference > 0 ? '+' : '' }}{{ produit.difference }}
                </span>
                <span v-else>0</span>
              </div>
              <div class="table-cell">{{ produit.unite }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preuves et observations -->
      <div v-if="livraison.preuveDepot || livraison.preuveReception || livraison.observations" class="proofs-section">
        <h3 class="section-title">Preuves et Observations</h3>
        
        <div v-if="livraison.preuveDepot" class="proof-item">
          <h4 class="proof-title">📸 Preuves de dépôt</h4>
          <div class="proof-content">
            <div v-for="(preuve, index) in parsePreuves(livraison.preuveDepot)" :key="index" class="proof-media">
              <img v-if="preuve.type === 'image'" :src="preuve.data" :alt="preuve.name" class="proof-image" />
              <video v-else-if="preuve.type === 'video'" :src="preuve.data" class="proof-video" controls></video>
              <div class="proof-name">{{ preuve.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="livraison.preuveReception" class="proof-item">
          <h4 class="proof-title">✅ Preuves de réception</h4>
          <div class="proof-content">
            <div v-for="(preuve, index) in parsePreuves(livraison.preuveReception)" :key="index" class="proof-media">
              <img v-if="preuve.type === 'image'" :src="preuve.data" :alt="preuve.name" class="proof-image" />
              <video v-else-if="preuve.type === 'video'" :src="preuve.data" class="proof-video" controls></video>
              <div class="proof-name">{{ preuve.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="livraison.observations" class="proof-item">
          <h4 class="proof-title">📝 Observations</h4>
          <p class="proof-text">{{ livraison.observations }}</p>
        </div>
      </div>

      <!-- Signatures -->
      <div class="signatures-section">
        <div class="signature-item">
          <div class="signature-label">Signature du chauffeur</div>
          <div class="signature-line"></div>
          <div class="signature-name">{{ livraison.chauffeur }}</div>
        </div>
        
        <div class="signature-item">
          <div class="signature-label">Signature du client</div>
          <div class="signature-line"></div>
          <div class="signature-name">{{ livraison.client }}</div>
          <div v-if="livraison.signatureClient" class="signature-image">
            <img :src="livraison.signatureClient" alt="Signature du client" />
          </div>
        </div>
      </div>

      <!-- Pied de page -->
      <div class="bl-footer">
        <p>Bordereau généré le {{ formatDate(new Date()) }} à {{ formatTime(new Date()) }}</p>
        <p>Global Star Distribution - Tous droits réservés</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type Livraison } from '../services/storage'

interface Props {
  livraison: Livraison
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const bordereauContent = ref<HTMLElement>()

// Fonctions utilitaires
const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const parsePreuves = (preuvesString: string) => {
  if (!preuvesString) return []
  
  return preuvesString.split(';;').map(preuve => {
    const [name, type, data] = preuve.split('|')
    return { name, type: type as 'image' | 'video', data }
  })
}

// Téléchargement et impression
const telechargerPDF = async () => {
  try {
    if (!bordereauContent.value) return
    
    // Essayer d'utiliser html2pdf via CDN si l'import local échoue
    let html2pdf
    
    try {
      // Méthode 1: Import dynamique local
      const module = await import('html2pdf.js')
      html2pdf = module.default || module
    } catch (importError) {
      console.log('Import local échoué, essai avec CDN:', importError)
      
      // Méthode 2: Charger depuis CDN
      await loadHtml2PdfFromCDN()
      html2pdf = (window as any).html2pdf
    }
    
    // Vérifier que html2pdf est bien une fonction
    if (typeof html2pdf !== 'function') {
      throw new Error('html2pdf n\'est pas une fonction valide')
    }
    
    const opt = {
      margin: 1,
      filename: `BL-${props.livraison.numeroBL}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    
    html2pdf().set(opt).from(bordereauContent.value).save()
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    console.log('Détails de l\'erreur:', error)
    // Fallback: télécharger en HTML
    telechargerHTML()
  }
}

// Fonction pour charger html2pdf depuis CDN
const loadHtml2PdfFromCDN = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).html2pdf) {
      resolve()
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Impossible de charger html2pdf depuis CDN'))
    document.head.appendChild(script)
  })
}

const telechargerHTML = () => {
  if (!bordereauContent.value) return
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>BL-${props.livraison.numeroBL}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .bordereau-content { max-width: 800px; margin: 0 auto; }
        .bl-header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #f97316; margin: 10px 0; }
        .bl-title { font-size: 20px; font-weight: bold; margin: 10px 0; }
        .info-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .info-section { margin-bottom: 20px; }
        .section-title { font-weight: bold; color: #374151; margin-bottom: 15px; }
        .info-grid { display: grid; gap: 10px; }
        .info-item { display: flex; justify-content: space-between; }
        .info-label { font-weight: bold; color: #6b7280; }
        .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .products-table th, .products-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        .products-table th { background-color: #f9fafb; font-weight: bold; }
        .signatures-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
        .signature-item { text-align: center; }
        .signature-line { border-top: 1px solid #000; margin-top: 40px; }
        .bl-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      ${bordereauContent.value.innerHTML}
    </body>
    </html>
  `
  
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `BL-${props.livraison.numeroBL}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const imprimer = () => {
  window.print()
}
</script>

<style scoped>
.bordereau-viewer {
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 80rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.viewer-header {
  position: sticky;
  top: 0;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.viewer-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.viewer-actions {
  display: flex;
  gap: 0.75rem;
}

.bordereau-content {
  padding: 2rem;
  background-color: #ffffff;
}

/* En-tête du bordereau */
.bl-header {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f97316;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.company-logo {
  width: 80px;
  height: 80px;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.company-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f97316;
  margin: 0.25rem 0;
}

.company-address,
.company-contact {
  color: #6b7280;
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.bl-info {
  text-align: center;
}

.bl-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0.5rem 0;
}

.bl-number {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0.5rem 0;
}

.bl-date {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Sections d'information */
.info-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-section {
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.section-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.info-grid {
  display: grid;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  color: #111827;
  font-weight: 500;
}

/* Tableau des produits */
.products-section {
  margin-bottom: 2rem;
}

.products-table {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.header-cell {
  padding: 1rem;
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
  border-bottom: 1px solid #e5e7eb;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 1rem;
  color: #111827;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
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

/* Section des preuves */
.proofs-section {
  margin-bottom: 2rem;
}

.proof-item {
  margin-bottom: 1.5rem;
}

.proof-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.proof-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.proof-media {
  text-align: center;
}

.proof-image,
.proof-video {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  margin-bottom: 0.5rem;
}

.proof-name {
  font-size: 0.75rem;
  color: #6b7280;
  word-break: break-word;
}

.proof-text {
  color: #111827;
  line-height: 1.5;
}

/* Signatures */
.signatures-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

.signature-item {
  text-align: center;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}

.signature-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.signature-line {
  border-top: 1px solid #000;
  margin: 2rem 0 1rem;
}

.signature-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 1rem;
}

.signature-image img {
  max-width: 200px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

/* Pied de page */
.bl-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
}

.bl-footer p {
  margin: 0.25rem 0;
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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
}

.btn-primary {
  background-color: #f97316;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #ea580c;
}

.btn-secondary {
  background-color: #3b82f6;
  color: #ffffff;
}

.btn-secondary:hover {
  background-color: #2563eb;
}

.btn-outline {
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background-color: #f9fafb;
}

/* Responsive */
@media (max-width: 768px) {
  .viewer-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .viewer-actions {
    justify-content: center;
  }
  
  .bl-header {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .info-sections {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
  }
  
  .signatures-section {
    grid-template-columns: 1fr;
  }
}

@media print {
  .viewer-header {
    display: none;
  }
  
  .bordereau-content {
    padding: 0;
  }
  
  .bordereau-viewer {
    box-shadow: none;
    border-radius: 0;
  }
}
</style>
