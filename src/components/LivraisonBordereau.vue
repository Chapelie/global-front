<script setup lang="ts">
import { ref, computed } from 'vue'
import { storageService, type Livraison } from '../services/storage'
import { useLogo } from '../composables/useLogo'
import TransfertBordereau from './TransfertBordereau.vue'

interface Props {
  livraison: Livraison
  showModal: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [livraison: Livraison]
}>()
const { logo, getLogoAlt } = useLogo()

const preuveDepot = ref('')
const preuveReception = ref('')
const signatureClient = ref('')
const observations = ref('')
const heureLivraison = ref('')
const showTransfertBordereau = ref(false)

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

const totalQuantite = computed(() => {
  return props.livraison.produits.reduce((sum, produit) => sum + produit.quantite, 0)
})

const handleSave = () => {
  const livraisonMiseAJour = {
    ...props.livraison,
    statut: 'livre' as const,
    preuveDepot: preuveDepot.value,
    preuveReception: preuveReception.value,
    signatureClient: signatureClient.value,
    observations: observations.value,
    heureLivraison: heureLivraison.value || currentTime.value,
    dateLivraison: currentDate.value
  }
  
  emit('save', livraisonMiseAJour)
  emit('close')
}

const handleClose = () => {
  emit('close')
}

const telechargerBordereau = () => {
  // Créer le contenu HTML du bordereau pour PDF
  const bordereauHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Bordereau de Livraison - ${props.livraison.numeroBL}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { width: 80px; height: 80px; margin: 0 auto 10px; }
        .title { font-size: 20px; font-weight: bold; margin: 10px 0; }
        .company-name { font-size: 18px; font-weight: bold; color: #f97316; margin: 5px 0; }
        .info-section { margin-bottom: 30px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-item { margin-bottom: 10px; }
        .label { font-weight: bold; color: #374151; }
        .value { color: #111827; }
        .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .products-table th, .products-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        .products-table th { background-color: #f9fafb; font-weight: bold; }
        .signature-section { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .signature-box { border: 1px solid #d1d5db; padding: 20px; text-align: center; }
        .signature-line { border-top: 1px solid #000; margin-top: 40px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <img :src="logo" :alt="getLogoAlt()" class="logo">
        <div class="company-name">GLOBAL STAR DISTRIBUTION</div>
        <div class="title">BORDEREAU DE LIVRAISON</div>
        <div>${props.livraison.numeroBL}</div>
      </div>

      <div class="info-section">
        <div class="info-grid">
          <div>
            <div class="info-item">
              <span class="label">Date de livraison:</span>
              <span class="value">${new Date(props.livraison.date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="info-item">
              <span class="label">Code de suivi:</span>
              <span class="value">${props.livraison.codeSuivi}</span>
            </div>
            <div class="info-item">
              <span class="label">Chauffeur:</span>
              <span class="value">${props.livraison.chauffeur}</span>
            </div>
          </div>
          <div>
            <div class="info-item">
              <span class="label">Client:</span>
              <span class="value">${props.livraison.client}</span>
            </div>
            <div class="info-item">
              <span class="label">Téléphone:</span>
              <span class="value">${props.livraison.telephone}</span>
            </div>
            <div class="info-item">
              <span class="label">Adresse:</span>
              <span class="value">${props.livraison.adresse}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3>Produits livrés</h3>
        <table class="products-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Unité</th>
            </tr>
          </thead>
          <tbody>
            ${props.livraison.produits.map(produit => `
              <tr>
                <td>${produit.nom}</td>
                <td>${produit.quantite}</td>
                <td>${produit.unite}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${preuveDepot.value || preuveReception.value || signatureClient.value ? `
        <div class="info-section">
          <h3>Preuves de livraison</h3>
          ${preuveDepot.value ? `
            <div class="info-item">
              <span class="label">Preuve de dépôt:</span>
              <span class="value">${preuveDepot.value}</span>
            </div>
          ` : ''}
          ${preuveReception.value ? `
            <div class="info-item">
              <span class="label">Preuve de réception:</span>
              <span class="value">${preuveReception.value}</span>
            </div>
          ` : ''}
          ${signatureClient.value ? `
            <div class="info-item">
              <span class="label">Signature du client:</span>
              <span class="value">${signatureClient.value}</span>
            </div>
          ` : ''}
          ${observations.value ? `
            <div class="info-item">
              <span class="label">Observations:</span>
              <span class="value">${observations.value}</span>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div class="signature-section">
        <div class="signature-box">
          <div>Signature du chauffeur</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-box">
          <div>Signature du client</div>
          <div class="signature-line"></div>
        </div>
      </div>

      <div class="footer">
        <p>Bordereau généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        <p>Global Star Distribution - Tous droits réservés</p>
      </div>
    </body>
    </html>
  `

  // Ouvrir dans une nouvelle fenêtre pour impression PDF
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(bordereauHTML)
    printWindow.document.close()
    printWindow.focus()
    
    // Attendre que le contenu soit chargé puis imprimer
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

const generatePDF = () => {
  // Simulation de génération PDF
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bordereau de Livraison - ${props.livraison.numeroBL}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { width: 80px; height: 80px; margin: 0 auto 10px; }
            .company-name { font-size: 18px; font-weight: bold; color: #f97316; margin: 5px 0; }
            .info-section { margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-item { margin-bottom: 15px; }
            .info-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
            .info-value { color: #111827; }
            .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .products-table th, .products-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
            .products-table th { background: #f9fafb; font-weight: bold; }
            .signature-section { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .signature-box { border: 1px solid #d1d5db; padding: 20px; text-align: center; }
            .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 10px; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img :src="logo" :alt="getLogoAlt()" class="logo">
            <div class="company-name">GLOBAL STAR DISTRIBUTION</div>
            <h1>Bordereau de Livraison</h1>
            <p>${props.livraison.numeroBL}</p>
          </div>
          
          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Numéro BL:</div>
                <div class="info-value">${props.livraison.numeroBL}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date de livraison:</div>
                <div class="info-value">${currentDate.value}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Client:</div>
                <div class="info-value">${props.livraison.client}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Téléphone:</div>
                <div class="info-value">${props.livraison.telephone}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Chauffeur:</div>
                <div class="info-value">${props.livraison.chauffeur}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Heure de livraison:</div>
                <div class="info-value">${heureLivraison.value || currentTime.value}</div>
              </div>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Adresse de livraison:</div>
            <div class="info-value">${props.livraison.adresse}</div>
          </div>
          
          <table class="products-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Unité</th>
              </tr>
            </thead>
            <tbody>
              ${props.livraison.produits.map(produit => `
                <tr>
                  <td>${produit.nom}</td>
                  <td>${produit.quantite}</td>
                  <td>${produit.unite}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="signature-section">
            <div class="signature-box">
              <h3>Signature du chauffeur</h3>
              <div class="signature-line">
                ${props.livraison.chauffeur}
              </div>
            </div>
            <div class="signature-box">
              <h3>Signature du client</h3>
              <div class="signature-line">
                ${signatureClient.value || '_________________'}
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Bordereau généré le ${currentDate.value} à ${currentTime.value}</p>
            <p>Code de suivi: ${props.livraison.codeSuivi}</p>
            <p>Global Star Distribution - Tous droits réservés</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

const saveToPhone = () => {
  // Simulation de sauvegarde sur téléphone
  const bordereauData = {
    numeroBL: props.livraison.numeroBL,
    date: currentDate.value,
    client: props.livraison.client,
    produits: props.livraison.produits,
    signature: signatureClient.value,
    heure: heureLivraison.value || currentTime.value
  }
  
  // Sauvegarder dans localStorage comme "téléphone"
  const phoneBordereaux = JSON.parse(localStorage.getItem('phone_bordereaux') || '[]')
  phoneBordereaux.push(bordereauData)
  localStorage.setItem('phone_bordereaux', JSON.stringify(phoneBordereaux))
  
  alert('Bordereau sauvegardé sur le téléphone !')
}

const imprimerTransfert = () => {
  // Ouvrir une nouvelle fenêtre pour imprimer le bordereau de transfert
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bordereau de Transfert - ${props.livraison.numeroBL}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .transfert-bordereau { max-width: 800px; margin: 0 auto; }
            .bl-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
            .company-info { display: flex; align-items: flex-start; gap: 20px; }
            .logo-image { width: 80px; height: 80px; object-fit: contain; border: 2px solid #f97316; border-radius: 8px; }
            .company-name { font-size: 24px; font-weight: bold; color: #f97316; margin: 0 0 15px 0; text-transform: uppercase; }
            .company-address { font-size: 14px; color: #374151; line-height: 1.6; }
            .bordereau-title { font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 0 15px 0; text-transform: uppercase; }
            .client-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #f97316; }
            .products-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #d1d5db; }
            .products-table th { background: #f97316; color: white; padding: 12px; text-align: left; font-weight: bold; }
            .products-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .signatures-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 40px 0; padding: 20px 0; border-top: 2px solid #e5e7eb; }
            .signature-box { text-align: center; }
            .signature-line { border: 1px solid #d1d5db; padding: 20px; min-height: 100px; background: #f9fafb; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="transfert-bordereau">
            <div class="bl-header">
              <div class="company-info">
                <div class="company-logo">
                  <img src="${logo}" alt="Global Star Distribution" class="logo-image" />
                </div>
                <div class="company-details">
                  <h1 class="company-name">GLOBAL STAR DISTRIBUTION</h1>
                  <div class="company-address">
                    <p><strong>Numéro d'entreprise :</strong> 6201798/51747100</p>
                    <p><strong>Adresse :</strong> Yimdi route de Bobo, 300 m avant le péage</p>
                    <p><strong>Email :</strong> gelil.Savadogo@yahoo.com</p>
                  </div>
                </div>
              </div>
              
              <div class="bordereau-info">
                <h2 class="bordereau-title">BORDEREAU DE TRANSFERT</h2>
                <div class="bordereau-details">
                  <p><strong>Date :</strong> ${formatDate(props.livraison.date)}</p>
                  <p><strong>N° Bordereau :</strong> ${props.livraison.numeroBL}</p>
                  ${props.livraison.codeSuivi ? `<p><strong>Code de suivi :</strong> ${props.livraison.codeSuivi}</p>` : ''}
                </div>
              </div>
            </div>

            <div class="client-info">
              <h3>INFORMATIONS CLIENT</h3>
              <div class="client-details">
                <p><strong>Nom :</strong> ${props.livraison.client}</p>
                ${props.livraison.telephone ? `<p><strong>Téléphone :</strong> ${props.livraison.telephone}</p>` : ''}
                ${props.livraison.adresse ? `<p><strong>Adresse :</strong> ${props.livraison.adresse}</p>` : ''}
              </div>
            </div>

            <div class="products-section">
              <h3>DÉTAIL DU TRANSFERT</h3>
              <table class="products-table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th>Quantité</th>
                    <th>Observation</th>
                  </tr>
                </thead>
                <tbody>
                  ${props.livraison.produits.map(produit => `
                    <tr>
                      <td>${produit.nom}</td>
                      <td style="text-align: center;">${produit.quantite} ${produit.unite}</td>
                      <td>${produit.observation || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="total-section" style="text-align: right; margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border: 2px solid #f59e0b;">
                <p style="font-size: 16px; color: #92400e; margin: 0;"><strong>TOTAL : ${props.livraison.produits.reduce((total, produit) => total + produit.quantite, 0)} articles</strong></p>
              </div>
            </div>

            <div class="signatures-section">
              <div class="signature-box">
                <h4>CHAUFFEUR</h4>
                <div class="signature-line">
                  <p>Nom : _________________________</p>
                  <p>Signature : _________________________</p>
                  <p>Date : _________________________</p>
                </div>
              </div>
              
              <div class="signature-box">
                <h4>CLIENT</h4>
                <div class="signature-line">
                  <p>Nom : _________________________</p>
                  <p>Signature : _________________________</p>
                  <p>Date : _________________________</p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <span class="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Bordereau de Livraison</h2>
              <p class="text-sm text-gray-500">{{ livraison.numeroBL }}</p>
            </div>
          </div>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Informations de livraison -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="font-semibold text-gray-900 mb-3">Informations client</h3>
            <div class="space-y-2">
              <div>
                <span class="text-sm font-medium text-gray-600">Client:</span>
                <p class="text-gray-900">{{ livraison.client }}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">Téléphone:</span>
                <p class="text-gray-900">{{ livraison.telephone }}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">Adresse:</span>
                <p class="text-gray-900">{{ livraison.adresse }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="font-semibold text-gray-900 mb-3">Informations livraison</h3>
            <div class="space-y-2">
              <div>
                <span class="text-sm font-medium text-gray-600">Chauffeur:</span>
                <p class="text-gray-900">{{ livraison.chauffeur }}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">Date:</span>
                <p class="text-gray-900">{{ currentDate }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Heure de livraison:</label>
                <input
                  v-model="heureLivraison"
                  type="time"
                  class="mt-1 w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Produits -->
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">Produits livrés</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unité</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="produit in livraison.produits" :key="produit.nom">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ produit.nom }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ produit.quantite }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ produit.unite }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Preuves -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="font-semibold text-gray-900 mb-3">Preuve de dépôt</h3>
            <textarea
              v-model="preuveDepot"
              placeholder="Décrivez les conditions de dépôt, état des produits, etc."
              rows="4"
              class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            ></textarea>
          </div>

          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="font-semibold text-gray-900 mb-3">Preuve de réception</h3>
            <textarea
              v-model="preuveReception"
              placeholder="Confirmation de réception par le client"
              rows="4"
              class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            ></textarea>
          </div>
        </div>

        <!-- Signature -->
        <div class="bg-gray-50 rounded-xl p-4">
          <h3 class="font-semibold text-gray-900 mb-3">Signature du client</h3>
          <input
            v-model="signatureClient"
            placeholder="Nom et signature du client"
            class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <!-- Observations -->
        <div class="bg-gray-50 rounded-xl p-4">
          <h3 class="font-semibold text-gray-900 mb-3">Observations</h3>
          <textarea
            v-model="observations"
            placeholder="Observations supplémentaires..."
            rows="3"
            class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          ></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
        <div class="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            @click="showTransfertBordereau = true"
            class="px-4 py-2 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
          >
            Bordereau de Transfert
          </button>
          <button
            @click="telechargerBordereau"
            class="px-4 py-2 border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors"
          >
            Télécharger BL
          </button>
          <button
            @click="generatePDF"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Générer PDF
          </button>
          <button
            @click="saveToPhone"
            class="px-4 py-2 border border-orange-300 rounded-lg text-orange-700 hover:bg-orange-50 transition-colors"
          >
            Sauvegarder sur téléphone
          </button>
          <button
            @click="handleSave"
            class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Confirmer livraison
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Bordereau de Transfert Modal -->
  <div v-if="showTransfertBordereau" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900">Bordereau de Transfert</h2>
        <button
          @click="showTransfertBordereau = false"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="p-6">
        <TransfertBordereau :livraison="livraison" />
      </div>
      
      <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl flex justify-end gap-3">
        <button
          @click="showTransfertBordereau = false"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Fermer
        </button>
        <button
          @click="imprimerTransfert"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Imprimer
        </button>
      </div>
    </div>
  </div>
</template>
