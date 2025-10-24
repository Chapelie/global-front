<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useLaravelApi, type LaravelLivraison, type LaravelArticle } from '../services/laravelApiService'
import { useAlert } from '../composables/useAlert'

// Type étendu pour la livraison avec les propriétés supplémentaires utilisées dans la vue
interface ExtendedLivraison extends LaravelLivraison {
  cloturee?: boolean
  dateCloture?: string
  dateClotureManuelle?: string
  notesCloture?: string
  commandeId?: number
}
// LivraisonAvecSignature supprimé - plus nécessaire
import BordereauViewer from '../components/BordereauViewer.vue'
import BLGenerator from '../components/BLGenerator.vue'

// Service Laravel
const { 
  getLivraisons, 
  addLivraison, 
  updateLivraison, 
  deleteLivraison, 
  getArticles,
  mettreAJourQuantitesLivrees,
  commencerLivraisonAPI,
  finaliserLivraisonAvecSignature
} = useLaravelApi()

// Service d'alerte
const { success, error, warning, info, confirmDialog } = useAlert()

// État réactif
const livraisons = ref<ExtendedLivraison[]>([])
const showModal = ref(false)
const showCommencerModal = ref(false)
const showBordereauModal = ref(false)
const showBLGenerator = ref(false)
const showQuantiteModal = ref(false)
const showDocumenterModal = ref(false)
const editingLivraison = ref<LaravelLivraison | null>(null)
const selectedLivraison = ref<LaravelLivraison | null>(null)
const selectedBordereauLivraison = ref<LaravelLivraison | null>(null)
const selectedBLLivraison = ref<LaravelLivraison | null>(null)
const selectedQuantiteLivraison = ref<LaravelLivraison | null>(null)
const selectedDocumenterLivraison = ref<LaravelLivraison | null>(null)
const activeTab = ref<'nonTerminees' | 'terminees'>('nonTerminees')

// Nouvelle livraison
const newLivraison = ref({
  client: '',
  telephone: '',
  chauffeur: 'Camion de livraison',
  produits: [{ nom: '', quantite: 0, unite: 'pièces', quantiteCommandee: 0, quantiteLivree: 0, difference: 0, resteAPayer: 0, notes: '' }],
  statut: 'en_attente' as 'en_attente' | 'en_cours' | 'livre' | 'annule',
  adresse: '',
  numero_bl: '',
  code_suivi: '',
  date: new Date().toISOString(),
  totalCommande: 0,
  totalLivraison: 0,
  differenceTotale: 0,
  resteAPayerTotal: 0
})

// Variables pour le processus de livraison
const quantitesLivraison = ref<{[key: string]: number}>({})
const signatureClient = ref('')
const observationsLivraison = ref('')
const signaturePad = ref<any>(null)

// Computed
const totalLivraisons = computed(() => livraisons.value.length)
const livraisonsEnAttente = computed(() => livraisons.value.filter(l => l.statut === 'en_attente').length)
const livraisonsEnCours = computed(() => livraisons.value.filter(l => l.statut === 'en_cours').length)
const livraisonsLivre = computed(() => livraisons.value.filter(l => l.statut === 'livre').length)

// Les livraisons sont maintenant créées automatiquement lors de la confirmation des commandes

// Computed pour vérifier si une livraison est complètement livrée
const isLivraisonComplete = (livraison: ExtendedLivraison) => {
  return livraison.produits.every(produit => {
    const quantiteCommandee = produit.quantiteCommandee || produit.quantite || 0
    const quantiteLivree = produit.quantiteLivree || 0
    return quantiteLivree >= quantiteCommandee
  })
}

// Computed pour filtrer les livraisons non terminées (en cours ou partielles)
const livraisonsNonTerminees = computed(() => {
  return livraisons.value.filter(l => {
    // Une livraison reste "non terminée" si :
    // 1. Son statut n'est pas 'livre' ou 'annule'
    // 2. OU si elle n'est pas complètement livrée même avec statut 'livre'
    if (l.statut === 'annule') return false
    if (l.statut !== 'livre') return true
    return !l.cloturee && !isLivraisonComplete(l)
  })
})

// Computed pour filtrer les livraisons terminées (complètement livrées ou clôturées)
const livraisonsTerminees = computed(() => {
  return livraisons.value.filter(l => {
    // Une livraison est "terminée" si :
    // 1. Elle est annulée
    // 2. OU elle est marquée comme clôturée
    // 3. OU elle est complètement livrée ET son statut est 'livre'
    return l.statut === 'annule' || l.cloturee || (l.statut === 'livre' && isLivraisonComplete(l))
  })
})

// Computed pour les produits disponibles avec stock
const produitsDisponibles = ref<LaravelArticle[]>([])

const loadProduitsDisponibles = async () => {
  try {
    const { getArticles } = useLaravelApi()
    const articles = await getArticles()
    produitsDisponibles.value = articles.filter(article => article.stock > 0)
  } catch (error) {
    console.error('❌ [LivraisonView] Erreur lors du chargement des articles:', error)
    produitsDisponibles.value = []
  }
}

// Méthodes
const loadLivraisons = async () => {
  try {
    console.log('🔍 [LivraisonView] Chargement des livraisons depuis Laravel')
    livraisons.value = await getLivraisons()
    console.log('✅ [LivraisonView] Livraisons chargées:', livraisons.value.length)
    
    // Debug: Afficher les détails des produits pour chaque livraison
    livraisons.value.forEach((livraison, index) => {
      console.log(`🔍 [LivraisonView] Livraison ${index + 1} (${livraison.numero_bl}):`, {
        statut: livraison.statut,
        produits: livraison.produits?.map(p => ({
          nom: p.nom,
          quantiteCommandee: p.quantiteCommandee,
          quantiteLivree: p.quantiteLivree,
          quantite: p.quantite
        }))
      })
    })
  } catch (err) {
    console.error('❌ [LivraisonView] Erreur lors du chargement des livraisons:', err)
    await error('Erreur lors du chargement des livraisons')
  }
}



const openModal = (livraison?: ExtendedLivraison) => {
  if (livraison) {
    editingLivraison.value = livraison
    newLivraison.value = {
      client: livraison.client,
      telephone: livraison.telephone,
      chauffeur: livraison.chauffeur,
      statut: livraison.statut as 'en_attente' | 'en_cours' | 'livre' | 'annule',
      adresse: livraison.adresse,
      numero_bl: livraison.numero_bl,
      code_suivi: livraison.code_suivi || '',
      date: livraison.date,
      totalCommande: livraison.total_commande || 0,
      totalLivraison: livraison.total_livraison || 0,
      differenceTotale: livraison.difference_totale || 0,
      resteAPayerTotal: livraison.reste_a_payer_total || 0,
      produits: livraison.produits.map(p => ({
        nom: p.nom,
        quantite: p.quantite,
        unite: p.unite,
        quantiteCommandee: p.quantiteCommandee || p.quantite_commandee || p.quantite,
        quantiteLivree: p.quantiteLivree || p.quantite_livree || 0,
        difference: p.difference || 0,
        resteAPayer: p.resteAPayer || p.reste_a_payer || 0,
        notes: (p as any).notes || ''
      }))
    }
  } else {
    editingLivraison.value = null
    newLivraison.value = {
      client: '',
      telephone: '',
      chauffeur: 'Camion de livraison',
      produits: [{ nom: '', quantite: 0, unite: 'pièces', quantiteCommandee: 0, quantiteLivree: 0, difference: 0, resteAPayer: 0, notes: '' }],
      statut: 'en_attente' as 'en_attente' | 'en_cours' | 'livre' | 'annule',
      adresse: '',
      numero_bl: '',
      code_suivi: '',
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
  newLivraison.value.produits.push({ nom: '', quantite: 0, unite: 'pièces', quantiteCommandee: 0, quantiteLivree: 0, difference: 0, resteAPayer: 0, notes: '' })
}

const removeProduit = (index: number) => {
  newLivraison.value.produits.splice(index, 1)
}

const saveLivraison = async () => {
  try {
    // Convertir les produits au format attendu par l'API
    const livraisonData = {
      ...newLivraison.value,
      produits: newLivraison.value.produits.map(produit => ({
        ...produit,
        quantite_commandee: produit.quantiteCommandee || produit.quantite,
        quantite_livree: produit.quantiteLivree || 0,
        reste_a_payer: produit.resteAPayer || 0,
        notes: produit.notes || ''
      }))
    }

    if (editingLivraison.value) {
      await updateLivraison(editingLivraison.value.id!, livraisonData)
      console.log('✅ [LivraisonView] Livraison mise à jour')
    } else {
      await addLivraison(livraisonData)
      console.log('✅ [LivraisonView] Livraison créée')
    }
    
    await loadLivraisons()
    closeModal()
    await success('Livraison enregistrée avec succès!')
  } catch (err) {
    console.error('❌ [LivraisonView] Erreur lors de la sauvegarde:', err)
    await error('Erreur lors de la sauvegarde de la livraison')
  }
}

const commencerLivraison = async (livraison: ExtendedLivraison) => {
  try {
    // Récupérer les articles depuis le service Laravel
    const { getArticles } = useLaravelApi()
    const stock = await getArticles()
    const produitsIndisponibles: string[] = []

    livraison.produits.forEach(produit => {
      const articleStock = stock.find(article => article.nom === produit.nom)
      if (!articleStock) {
        produitsIndisponibles.push(`${produit.nom} (article inexistant)`)
      } else {
        const quantiteDemandee = produit.quantite || produit.quantiteCommandee || 0
        if (articleStock.stock < quantiteDemandee) {
          produitsIndisponibles.push(`${produit.nom} (stock: ${articleStock.stock}, demandé: ${quantiteDemandee})`)
        }
      }
    })

    if (produitsIndisponibles.length > 0) {
      const message = produitsIndisponibles.length === 1 ?
        `Le produit suivant n'est pas disponible en stock pour cette livraison :\n\n${produitsIndisponibles[0]}\n\nVeuillez vérifier les stocks avant de commencer la livraison.` :
        `Les produits suivants ne sont pas disponibles en stock pour cette livraison :\n\n${produitsIndisponibles.join('\n')}\n\nVeuillez vérifier les stocks avant de commencer la livraison.`

      alert(message)
      return
    }

    selectedLivraison.value = livraison
    initialiserQuantitesLivraison(livraison)
    showCommencerModal.value = true

    // Initialiser la signature pad après que le modal soit affiché
    nextTick(() => {
      initialiserSignaturePad()
    })
  } catch (error) {
    console.error('❌ [LivraisonView] Erreur lors de la vérification du stock:', error)
    alert('Erreur lors de la vérification du stock')
  }
}

// Méthodes de signature supprimées - plus nécessaires

// Nouvelle méthode pour clôturer manuellement une livraison
const cloturerLivraison = async (livraison: ExtendedLivraison) => {
  const produitsNonLivres = livraison.produits.filter(produit => {
    const quantiteCommandee = produit.quantiteCommandee || produit.quantite || 0
    const quantiteLivree = produit.quantiteLivree || 0
    return quantiteLivree < quantiteCommandee
  })

  // Vérifier si tous les produits sont complètement livrés
  if (produitsNonLivres.length > 0) {
    let message = `Impossible de clôturer cette livraison.\n\n${produitsNonLivres.length} produit(s) ne sont pas complètement livrés :`
    produitsNonLivres.forEach(produit => {
      const quantiteCommandee = produit.quantiteCommandee || produit.quantite || 0
      const quantiteLivree = produit.quantiteLivree || 0
      const restant = quantiteCommandee - quantiteLivree
      message += `\n- ${produit.nom}: ${restant} ${produit.unite} restant(s)`
    })
    message += '\n\nVeuillez terminer la livraison de tous les produits avant de clôturer.'
    alert(message)
    return
  }

  if (confirm('Êtes-vous sûr de vouloir clôturer cette livraison ?')) {
    try {
      const { updateLivraison } = useLaravelApi()
      
      const livraisonMiseAJour = {
        ...livraison,
        cloturee: true,
        statut: 'livre' as const,
        dateCloture: new Date().toISOString(),
        notesCloture: 'Clôturée manuellement'
      }
      
      await updateLivraison(livraison.id!, livraisonMiseAJour)
      
      // Mettre à jour la liste locale
      const index = livraisons.value.findIndex(l => l.id === livraison.id)
      if (index !== -1) {
        livraisons.value[index] = livraisonMiseAJour
      }
      
      loadLivraisons()
      alert('Livraison clôturée avec succès')
    } catch (error) {
      console.error('❌ [LivraisonView] Erreur lors de la clôture:', error)
      alert('Erreur lors de la clôture de la livraison')
    }
  }
}

// Méthode pour rouvrir une livraison clôturée
const rouvrirLivraison = async (livraison: ExtendedLivraison) => {
  if (confirm('Êtes-vous sûr de vouloir rouvrir cette livraison ?')) {
    try {
      const { updateLivraison } = useLaravelApi()
      
      const livraisonMiseAJour = {
        ...livraison,
        cloturee: false,
        statut: 'en_cours' as const,
        dateCloture: undefined,
        notesCloture: undefined
      }
      
      await updateLivraison(livraison.id!, livraisonMiseAJour)
      
      // Mettre à jour la liste locale
      const index = livraisons.value.findIndex(l => l.id === livraison.id)
      if (index !== -1) {
        livraisons.value[index] = livraisonMiseAJour
      }
      
      loadLivraisons()
      alert('Livraison rouverte avec succès')
    } catch (error) {
      console.error('❌ [LivraisonView] Erreur lors de la réouverture:', error)
      alert('Erreur lors de la réouverture de la livraison')
    }
  }
}

// Méthode pour récupérer les informations client depuis la livraison directement
const getClientInfoFromCommande = (livraison: ExtendedLivraison) => {
  return {
    nom: livraison.client,
    telephone: livraison.telephone,
    adresse: livraison.adresse
  }
}

// Méthode pour calculer le pourcentage de livraison
const getPourcentageLivraison = (livraison: ExtendedLivraison) => {
  if (!livraison.produits.length) return 0

  const totalCommandee = livraison.produits.reduce((sum, produit) => {
    return sum + (produit.quantiteCommandee || produit.quantite || 0)
  }, 0)

  const totalLivree = livraison.produits.reduce((sum, produit) => {
    return sum + (produit.quantiteLivree || 0)
  }, 0)

  return totalCommandee > 0 ? Math.round((totalLivree / totalCommandee) * 100) : 0
}

// Fonction pour obtenir les quantités restantes à livrer
const getQuantitesRestantes = (livraison: ExtendedLivraison) => {
  if (!livraison.produits) return []
  
  return livraison.produits.map(produit => {
    const commandee = produit.quantiteCommandee || produit.quantite || 0
    const livree = produit.quantiteLivree || 0
    const restante = Math.max(0, commandee - livree)
    
    return {
      nom: produit.nom,
      unite: produit.unite,
      commandee,
      livree,
      restante
    }
  }).filter(item => item.restante > 0)
}

const telechargerBL = (livraison: ExtendedLivraison) => {
  // Récupérer les informations client depuis la commande
  const clientInfo = getClientInfoFromCommande(livraison)
  if (clientInfo) {
    livraison.client = clientInfo.nom
    livraison.telephone = clientInfo.telephone
    livraison.adresse = clientInfo.adresse
  }
  
  selectedBordereauLivraison.value = livraison
  showBordereauModal.value = true
}

const telechargerBordereauTransfert = (livraison: ExtendedLivraison) => {
  // Ouvrir une nouvelle fenêtre pour imprimer le bordereau de transfert
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bordereau de Transfert - ${livraison.numero_bl}</title>
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
                  <img src="/logo.jpg" alt="Global Star Distribution" class="logo-image" />
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
                  <p><strong>Date :</strong> ${new Date(livraison.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>N° Bordereau :</strong> ${livraison.numero_bl}</p>
                  ${livraison.code_suivi ? `<p><strong>Code de suivi :</strong> ${livraison.code_suivi}</p>` : ''}
                </div>
              </div>
            </div>

            <div class="client-info">
              <h3>INFORMATIONS CLIENT</h3>
              <div class="client-details">
                <p><strong>Nom :</strong> ${livraison.client}</p>
                ${livraison.telephone ? `<p><strong>Téléphone :</strong> ${livraison.telephone}</p>` : ''}
                ${livraison.adresse ? `<p><strong>Adresse :</strong> ${livraison.adresse}</p>` : ''}
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
                  ${livraison.produits.map(produit => `
                    <tr>
                      <td>${produit.nom}</td>
                      <td style="text-align: center;">${produit.quantite} ${produit.unite}</td>
                      <td>-</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="total-section" style="text-align: right; margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border: 2px solid #f59e0b;">
                <p style="font-size: 16px; color: #92400e; margin: 0;"><strong>TOTAL : ${livraison.produits.reduce((total, produit) => total + produit.quantite, 0)} articles</strong></p>
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

const closeBordereauModal = () => {
  showBordereauModal.value = false
  selectedBordereauLivraison.value = null
}

const closeCommencerModal = () => {
  showCommencerModal.value = false
  selectedLivraison.value = null
  // Réinitialiser les données de livraison
  quantitesLivraison.value = {}
  signatureClient.value = ''
  observationsLivraison.value = ''
}

// Initialiser les quantités pour la livraison
const initialiserQuantitesLivraison = (livraison: ExtendedLivraison) => {
  const quantites: {[key: string]: number} = {}
  livraison.produits.forEach(produit => {
    quantites[produit.nom] = produit.quantiteLivree || 0
  })
  quantitesLivraison.value = quantites
}

// Effacer la signature
const effacerSignature = () => {
  if (signaturePad.value) {
    signaturePad.value.clear()
  }
  signatureClient.value = ''
}

// Initialiser la signature pad
const initialiserSignaturePad = () => {
  const canvas = signaturePad.value
  if (canvas) {
    // Créer un contexte simple pour dessiner
    const ctx = canvas.getContext('2d')
    if (ctx) {
      let isDrawing = false
      let lastX = 0
      let lastY = 0

      const startDrawing = (e: MouseEvent | TouchEvent) => {
        isDrawing = true
        const rect = canvas.getBoundingClientRect()
        if (e instanceof MouseEvent) {
          lastX = e.clientX - rect.left
          lastY = e.clientY - rect.top
        } else {
          lastX = e.touches[0].clientX - rect.left
          lastY = e.touches[0].clientY - rect.top
        }
      }

      const draw = (e: MouseEvent | TouchEvent) => {
        if (!isDrawing) return

        const rect = canvas.getBoundingClientRect()
        let currentX, currentY

        if (e instanceof MouseEvent) {
          currentX = e.clientX - rect.left
          currentY = e.clientY - rect.top
        } else {
          currentX = e.touches[0].clientX - rect.left
          currentY = e.touches[0].clientY - rect.top
        }

        ctx.beginPath()
        ctx.moveTo(lastX, lastY)
        ctx.lineTo(currentX, currentY)
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.stroke()

        lastX = currentX
        lastY = currentY
      }

      const stopDrawing = () => {
        isDrawing = false
      }

      // Events pour souris
      canvas.addEventListener('mousedown', startDrawing)
      canvas.addEventListener('mousemove', draw)
      canvas.addEventListener('mouseup', stopDrawing)
      canvas.addEventListener('mouseout', stopDrawing)

      // Events pour touch
      canvas.addEventListener('touchstart', (e: TouchEvent) => {
        e.preventDefault()
        startDrawing(e)
      })
      canvas.addEventListener('touchmove', (e: TouchEvent) => {
        e.preventDefault()
        draw(e)
      })
      canvas.addEventListener('touchend', (e: TouchEvent) => {
        e.preventDefault()
        stopDrawing()
      })

      // Méthodes pour le canvas
      canvas.clear = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      canvas.isEmpty = () => {
        const pixelBuffer = new Uint32Array(
          ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        )
        return !pixelBuffer.some(color => color !== 0)
      }

      // toDataURL est déjà disponible nativement sur le canvas
    }
  }
}

// Sauvegarder la signature
const sauvegarderSignature = () => {
  if (signaturePad.value && !signaturePad.value.isEmpty()) {
    signatureClient.value = signaturePad.value.toDataURL()
  }
}

const confirmerCommencerLivraison = async () => {
  if (!selectedLivraison.value) return

  try {
    console.log('🚀 [LivraisonView] Finalisation de la livraison:', selectedLivraison.value.id)

    // Validation des quantités
    let hasError = false
    let errorMessage = ''
    
    for (const produit of selectedLivraison.value.produits) {
      const quantiteLivree = quantitesLivraison.value[produit.nom] || 0
      const quantiteCommandee = produit.quantiteCommandee || produit.quantite || 0

      if (quantiteLivree > quantiteCommandee) {
        errorMessage = `Erreur: La quantité livrée pour "${produit.nom}" (${quantiteLivree}) dépasse la quantité commandée (${quantiteCommandee})`
        hasError = true
        break
      }
    }

    if (hasError) {
      await error(errorMessage)
      return
    }

    const produitsLivraison = selectedLivraison.value.produits.map(produit => {
      const quantiteLivree = quantitesLivraison.value[produit.nom] || 0
      const quantiteCommandee = produit.quantiteCommandee || produit.quantite || 0

      return {
        ...produit,
        quantiteLivree,
        difference: quantiteCommandee - quantiteLivree
      }
    })

    // Vérification de la signature
    if (!signatureClient.value) {
      await warning('Veuillez signer avant de finaliser la livraison')
      return
    }

    // Mettre à jour la livraison avec les quantités et la signature
    const livraisonMiseAJour = {
      ...selectedLivraison.value,
      statut: 'livre' as const,
      produits: produitsLivraison,
      signature_client: signatureClient.value,
      observations: observationsLivraison.value,
      heure_livraison: new Date().toTimeString().slice(0, 5),
      date_livraison: new Date().toISOString().split('T')[0]
    }

    // D'abord mettre à jour les quantités via l'API
    const { mettreAJourQuantitesLivrees, finaliserLivraisonAvecSignature } = useLaravelApi()

    // Préparer les quantités pour l'API
    const quantitesForAPI = Object.entries(quantitesLivraison.value).map(([nom, quantite]) => ({
      nom,
      quantite
    }))

    // Mettre à jour les quantités
    await mettreAJourQuantitesLivrees(selectedLivraison.value.id!, { quantites_livrees: quantitesForAPI })

    // Commencer la livraison si elle est encore en attente
    if (selectedLivraison.value.statut === 'en_attente') {
      console.log('🔍 [LivraisonView] Commencement de la livraison...')
      await commencerLivraisonAPI(selectedLivraison.value.id!)
      console.log('✅ [LivraisonView] Livraison commencée')
    }

    // Finaliser avec signature
    const requestData: any = {
      signature_client: signatureClient.value
    }

    // Ajouter les observations seulement si elles ne sont pas vides
    if (observationsLivraison.value && observationsLivraison.value.trim()) {
      requestData.observations = observationsLivraison.value.trim()
    }

    const resultat = await finaliserLivraisonAvecSignature(selectedLivraison.value.id!, requestData)

    console.log('✅ [LivraisonView] Livraison finalisée avec succès')

    // Recharger les livraisons
    await loadLivraisons()

    closeCommencerModal()

    // Afficher un message de succès avec les documents générés
    let message = 'Livraison finalisée avec succès !'

    if (resultat && (resultat as any).documents) {
      const docs = (resultat as any).documents
      message += '\n\nDocuments générés :'
      if (docs.bon_livraison) {
        message += `\n• Bon de livraison (${docs.bon_livraison.numero})`
      }
      if (docs.facture) {
        message += `\n• Facture (${docs.facture.numero})`
      }
    }

    // Afficher les informations sur les livraisons partielles
    if (resultat && (resultat as any).livraison_partielle) {
      const restes = (resultat as any).restes_a_livrer
      const nouvelleLivraison = (resultat as any).nouvelle_livraison

      message += '\n\n⚠️ Livraison partielle détectée !'
      message += '\n\nArticles non livrés :'

      restes.forEach((reste: any) => {
        message += `\n• ${reste.nom}: ${reste.quantite_restante} ${reste.unite} restant(s)`
      })

      if (nouvelleLivraison) {
        message += `\n\n✅ Nouvelle livraison créée automatiquement`
        message += `\n• Numéro BL: ${nouvelleLivraison.numero_bl}`
        message += `\n• Statut: En attente`
      }
    }

    if (resultat && (resultat as any).documents) {
      message += '\n\nVous pouvez consulter tous les documents dans l\'onglet Documents.'
    }

    await success(message)

  } catch (err) {
    console.error('❌ [LivraisonView] Erreur lors de la finalisation de la livraison:', err)
    await error('Erreur lors de la finalisation de la livraison')
  }
}


const getStatusText = (statut: string, livraison?: ExtendedLivraison) => {
  switch (statut) {
    case 'en_attente':
      return 'En attente'
    case 'en_cours':
      return 'En cours'
    case 'livre':
      if (livraison?.cloturee) {
        return 'Clôturée'
      }
      return isLivraisonComplete(livraison!) ? 'Livré complet' : 'Livré partiel'
    case 'annule':
      return 'Annulé'
    default:
      return statut
  }
}

const getStatusClass = (statut: string, livraison?: ExtendedLivraison) => {
  switch (statut) {
    case 'en_attente':
      return 'bg-yellow-100 text-yellow-800'
    case 'en_cours':
      return 'bg-blue-100 text-blue-800'
    case 'livre':
      if (livraison?.cloturee) {
        return 'bg-purple-100 text-purple-800'
      }
      return isLivraisonComplete(livraison!) ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
    case 'annule':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

// Méthodes pour le générateur de BL
const openBLGenerator = (livraison: ExtendedLivraison) => {
  selectedBLLivraison.value = livraison
  showBLGenerator.value = true
}

const closeBLGenerator = () => {
  showBLGenerator.value = false
  selectedBLLivraison.value = null
}

const onBLSaved = () => {
  closeBLGenerator()
  alert('Bon de Livraison généré et sauvegardé avec succès !')
}

// Fonction pour ouvrir la modal de modification des quantités
const openQuantiteModal = (livraison: ExtendedLivraison) => {
  selectedQuantiteLivraison.value = livraison
  showQuantiteModal.value = true
}

// Fonction pour fermer la modal des quantités
const closeQuantiteModal = () => {
  showQuantiteModal.value = false
  selectedQuantiteLivraison.value = null
}

// Fonction pour sauvegarder les quantités modifiées
const saveQuantites = async () => {
  if (!selectedQuantiteLivraison.value) return

  try {
    const updatedLivraison = await updateLivraison(selectedQuantiteLivraison.value.id!, selectedQuantiteLivraison.value)
    
    // Mettre à jour la liste des livraisons
    if (updatedLivraison) {
      const index = livraisons.value.findIndex(l => l.id === updatedLivraison.id)
      if (index !== -1) {
        livraisons.value[index] = updatedLivraison as ExtendedLivraison
      }
    }
    
    closeQuantiteModal()
    await success('Quantités mises à jour avec succès !')
  } catch (err) {
    console.error('Erreur lors de la mise à jour des quantités:', err)
    await error('Erreur lors de la mise à jour des quantités')
  }
}

// Fonction pour ouvrir la modal de documentation des quantités
const openDocumenterModal = (livraison: ExtendedLivraison) => {
  selectedDocumenterLivraison.value = livraison
  
  // Initialiser les quantités avec les valeurs actuelles
  quantitesLivraison.value = {}
  livraison.produits.forEach(produit => {
    quantitesLivraison.value[produit.nom] = produit.quantiteLivree || 0
  })
  
  showDocumenterModal.value = true
}

// Fonction pour fermer la modal de documentation
const closeDocumenterModal = () => {
  showDocumenterModal.value = false
  selectedDocumenterLivraison.value = null
}

// Fonction pour documenter les quantités livrées (sans finaliser)
const documenterQuantites = async () => {
  if (!selectedDocumenterLivraison.value) return

  try {
    // Préparer les quantités pour l'API
    const quantitesForAPI = Object.entries(quantitesLivraison.value).map(([nom, quantite]) => ({
      nom,
      quantite
    }))

    // Mettre à jour les quantités livrées
    await mettreAJourQuantitesLivrees(selectedDocumenterLivraison.value.id!, { quantites_livrees: quantitesForAPI })
    
    // Recharger les livraisons
    await loadLivraisons()
    
    closeDocumenterModal()
    await success('Quantités documentées avec succès !')
  } catch (err) {
    console.error('Erreur lors de la documentation des quantités:', err)
    await error('Erreur lors de la documentation des quantités')
  }
}

// Initialisation
onMounted(async () => {
  console.log('🔍 [LivraisonView] onMounted - Début')
  console.log('🔍 [LivraisonView] Chargement des commandes et livraisons...')
  
  
  try {
    await loadLivraisons()
    console.log('✅ [LivraisonView] Livraisons chargées avec succès')
  } catch (error) {
    console.error('❌ [LivraisonView] Erreur lors du chargement des livraisons:', error)
  }
  
  try {
    await loadProduitsDisponibles()
    console.log('✅ [LivraisonView] Produits disponibles chargés avec succès')
  } catch (error) {
    console.error('❌ [LivraisonView] Erreur lors du chargement des produits:', error)
  }
  
  console.log('🔍 [LivraisonView] onMounted - Fin')
})

// Fonctions utilitaires pour les statuts
const getStatutClass = (statut: string) => {
  switch (statut) {
    case 'en_attente':
      return 'bg-blue-100 text-blue-800'
    case 'en_cours':
      return 'bg-yellow-100 text-yellow-800'
    case 'livre':
      return 'bg-green-100 text-green-800'
    case 'annule':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatutText = (statut: string) => {
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

const getStatutIcon = (statut: string) => {
  switch (statut) {
    case 'en_attente':
      return '⏳'
    case 'en_cours':
      return '🚚'
    case 'livre':
      return '✅'
    case 'annule':
      return '❌'
    default:
      return '❓'
  }
}
</script>

<template>
  <div class="livraison-container">
    <!-- Header amélioré -->
    <div class="livraison-header">
      <div class="header-content">
        <div class="header-main">
          <div class="flex items-center">
            <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-4">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
        </div>
            <div>
              <h1 class="page-title">Gestion des Livraisons</h1>
              <p class="page-subtitle">Suivi des expéditions et gestion des bordereaux</p>
            </div>
          </div>
          <div class="inline-flex items-center px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-2xl cursor-not-allowed" title="Les livraisons sont créées automatiquement depuis les commandes">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Livraisons créées depuis commandes
          </div>
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
                            :class="getStatutClass(livraison.statut)">
                        <span class="mr-1">{{ getStatutIcon(livraison.statut) }}</span>
                        {{ getStatutText(livraison.statut) }}
                      </span>
                      <span class="livraison-number">#{{ livraison.numero_bl }}</span>
                      
                      <!-- Indicateur de clôture -->
                      <span v-if="livraison.cloturee" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        🔒 Clôturée
                      </span>
                      
                      <!-- Pourcentage de livraison -->
                      <div class="flex items-center space-x-2">
                        <div class="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            class="h-2 rounded-full transition-all duration-500"
                            :class="{
                              'bg-green-500': getPourcentageLivraison(livraison) === 100,
                              'bg-orange-500': getPourcentageLivraison(livraison) > 0 && getPourcentageLivraison(livraison) < 100,
                              'bg-gray-400': getPourcentageLivraison(livraison) === 0
                            }"
                            :style="{ width: `${getPourcentageLivraison(livraison)}%` }"
                          ></div>
          </div>
                        <span class="text-xs font-medium text-gray-600">{{ getPourcentageLivraison(livraison) }}%</span>
          </div>
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
                            <span class="quantite-livree" :class="{
                              'text-green-600 font-bold': (produit.quantiteLivree || 0) >= (produit.quantiteCommandee || produit.quantite || 0),
                              'text-orange-600 font-bold': (produit.quantiteLivree || 0) > 0 && (produit.quantiteLivree || 0) < (produit.quantiteCommandee || produit.quantite || 0),
                              'text-red-600': (produit.quantiteLivree || 0) === 0
                            }">
                              {{ produit.quantiteLivree || 0 }} {{ produit.unite }}
                            </span>
                            <!-- Indicateur de statut produit -->
                            <span v-if="(produit.quantiteLivree || 0) >= (produit.quantiteCommandee || produit.quantite || 0)"
                                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Complet
                            </span>
                            <span v-else-if="(produit.quantiteLivree || 0) > 0"
                                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Partiel
                            </span>
                            <span v-else
                                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Non livré
                            </span>
                          </div>
                        </div>
                        </div>
                      </div>
                      
                      <!-- Affichage des quantités restantes -->
                      <div v-if="getQuantitesRestantes(livraison).length > 0" class="quantites-restantes">
                        <h6 class="restantes-title">Quantités restantes à livrer :</h6>
                        <div class="restantes-list">
                          <div v-for="item in getQuantitesRestantes(livraison)" :key="item.nom" class="restante-item">
                            <span class="restante-nom">{{ item.nom }}</span>
                            <span class="restante-quantite">{{ item.restante }} {{ item.unite }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  <div class="livraison-actions">
                    <!-- Actions selon le statut -->
                    <button
                      v-if="livraison.statut === 'en_attente'"
                      @click="commencerLivraison(livraison)"
                      class="btn btn-primary"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {{ getPourcentageLivraison(livraison) > 0 ? 'Continuer' : 'Commencer' }}
                    </button>

                    <button
                      v-if="livraison.statut === 'en_cours'"
                      @click="commencerLivraison(livraison)"
                      class="btn btn-primary"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Continuer livraison
                    </button>

                    <!-- Bouton pour documenter les quantités (disponible pour toutes les livraisons non finalisées) -->
                    <button
                      v-if="livraison.statut !== 'livre' && livraison.statut !== 'annule'"
                      @click="openDocumenterModal(livraison)"
                      class="btn bg-blue-500 hover:bg-blue-600 text-white"
                      title="Documenter les quantités livrées"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documenter quantités
                    </button>

                    <!-- Bouton clôturer si pas complètement livré -->
                    <button
                      v-if="!livraison.cloturee && !isLivraisonComplete(livraison) && livraison.statut !== 'en_attente'"
                      @click="cloturerLivraison(livraison)"
                      class="btn bg-purple-500 hover:bg-purple-600 text-white"
                      title="Clôturer manuellement cette livraison"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Clôturer
                    </button>

                    <!-- Bouton rouvrir si clôturée -->
                    <button
                      v-if="livraison.cloturee"
                      @click="rouvrirLivraison(livraison)"
                      class="btn bg-blue-500 hover:bg-blue-600 text-white"
                      title="Rouvrir cette livraison pour continuer"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Rouvrir livraison
                    </button>

                    <!-- Bouton continuer si clôturée mais pas complète -->
                    <button
                      v-if="livraison.cloturee && !isLivraisonComplete(livraison)"
                      @click="commencerLivraison(livraison)"
                      class="btn bg-green-500 hover:bg-green-600 text-white"
                      title="Continuer la livraison de cette commande"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Continuer livraison
                    </button>

                    <!-- Bouton continuer si statut "livre" mais pas complètement livrée -->
                    <button
                      v-if="livraison.statut === 'livre' && !isLivraisonComplete(livraison) && !livraison.cloturee"
                      @click="commencerLivraison(livraison)"
                      class="btn bg-orange-500 hover:bg-orange-600 text-white"
                      title="Continuer la livraison - certains produits ne sont pas encore livrés"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Continuer livraison
                    </button>

                    <button
                      @click="openBLGenerator(livraison)"
                      class="btn bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Générer BL
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
                            :class="getStatutClass(livraison.statut)">
                        <span class="mr-1">{{ getStatutIcon(livraison.statut) }}</span>
                        {{ getStatutText(livraison.statut) }}
                      </span>
                      <span class="livraison-number">#{{ livraison.numero_bl }}</span>
                      <!-- Affichage spécial pour les livraisons clôturées -->
                      <div v-if="livraison.cloturee" class="text-xs text-purple-600 font-medium">
                        Clôturée le {{ livraison.dateClotureManuelle ? new Date(livraison.dateClotureManuelle).toLocaleDateString('fr-FR') : 'N/A' }}
            </div>
                    </div>
                    
                    <h4 class="livraison-client">{{ livraison.client }}</h4>
                    
                    <div class="livraison-details">
                      <div class="detail-item">
                        <span class="detail-label">Date de livraison:</span>
                        <p class="detail-value">{{ livraison.date_livraison || 'N/A' }}</p>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Heure:</span>
                        <p class="detail-value">{{ livraison.heure_livraison || 'N/A' }}</p>
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
                      @click="telechargerBordereauTransfert(livraison)"
                      class="btn btn-secondary"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Bordereau de Transfert
          </button>

          <button 
                      @click="openBLGenerator(livraison)"
                      class="btn bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Générer BL avec signatures
                    </button>

                    <!-- Bouton pour rouvrir une livraison clôturée -->
                    <button
                      v-if="livraison.cloturee"
                      @click="rouvrirLivraison(livraison)"
                      class="btn bg-blue-500 hover:bg-blue-600 text-white"
                      title="Rouvrir cette livraison"
                    >
                      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Rouvrir
          </button>
        </div>
      </div>
    </div>
            </div>
          </div>
        </div>
      </div>
        </div>

    <!-- Modal de saisie des quantités et signature -->
    <div v-if="showCommencerModal && selectedLivraison" class="modal-overlay">
      <div class="modal-container modal-large">
        <div class="modal-header">
          <div class="modal-header-content">
            <h2 class="modal-title">Finaliser la livraison - {{ selectedLivraison.client }}</h2>
            <button @click="closeCommencerModal" class="modal-close">
              <svg class="modal-close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="modal-body">
          <div class="livraison-process">
            <!-- Informations de la livraison -->
            <div class="livraison-info-section">
              <h3 class="section-title">Informations de livraison</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">N° BL :</span>
                  <span class="info-value">{{ selectedLivraison.numero_bl }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Client :</span>
                  <span class="info-value">{{ selectedLivraison.client }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Téléphone :</span>
                  <span class="info-value">{{ selectedLivraison.telephone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Chauffeur :</span>
                  <span class="info-value">{{ selectedLivraison.chauffeur }}</span>
                </div>
              </div>
            </div>

            <!-- Saisie des quantités -->
            <div class="quantites-section">
              <h3 class="section-title">Quantités livrées</h3>
              <div class="quantites-table">
                <div class="table-header">
                  <div class="col-produit">Produit</div>
                  <div class="col-commandee">Commandée</div>
                  <div class="col-livree">Livrée</div>
                  <div class="col-difference">Différence</div>
                </div>
                <div class="table-body">
                  <div
                    v-for="(produit, index) in selectedLivraison.produits"
                    :key="index"
                    class="table-row"
                  >
                    <div class="col-produit">
                      <span class="produit-nom">{{ produit.nom }}</span>
                      <span class="produit-unite">{{ produit.unite }}</span>
                    </div>
                    <div class="col-commandee">
                      <span class="quantite-commandee">
                        {{ produit.quantiteCommandee || produit.quantite }}
                      </span>
                    </div>
                    <div class="col-livree">
                      <input
                        v-model.number="quantitesLivraison[produit.nom]"
                        type="number"
                        min="0"
                        :max="produit.quantiteCommandee || produit.quantite"
                        class="quantite-input"
                        :class="{
                          'input-warning': (quantitesLivraison[produit.nom] || 0) > (produit.quantiteCommandee || produit.quantite || 0),
                          'input-success': (quantitesLivraison[produit.nom] || 0) === (produit.quantiteCommandee || produit.quantite || 0),
                          'input-partial': (quantitesLivraison[produit.nom] || 0) > 0 && (quantitesLivraison[produit.nom] || 0) < (produit.quantiteCommandee || produit.quantite || 0)
                        }"
                      />
                    </div>
                    <div class="col-difference">
                      <span class="difference-value" :class="{
                        'text-green-600': ((produit.quantiteCommandee || produit.quantite || 0) - (quantitesLivraison[produit.nom] || 0)) === 0,
                        'text-orange-600': ((produit.quantiteCommandee || produit.quantite || 0) - (quantitesLivraison[produit.nom] || 0)) > 0,
                        'text-red-600': ((produit.quantiteCommandee || produit.quantite || 0) - (quantitesLivraison[produit.nom] || 0)) < 0
                      }">
                        {{ (produit.quantiteCommandee || produit.quantite || 0) - (quantitesLivraison[produit.nom] || 0) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Observations -->
            <div class="observations-section">
              <h3 class="section-title">Observations (optionnel)</h3>
              <textarea
                v-model="observationsLivraison"
                rows="3"
                placeholder="Ajoutez des observations sur cette livraison..."
                class="observations-textarea"
              ></textarea>
            </div>

            <!-- Signature client -->
            <div class="signature-section">
              <h3 class="section-title">Signature du client <span class="text-red-500">*</span></h3>
              <div class="signature-container">
                <div class="signature-pad-container">
                  <canvas
                    ref="signaturePad"
                    class="signature-canvas"
                    width="400"
                    height="200"
                  ></canvas>
                  <div class="signature-controls">
                    <button
                      type="button"
                      @click="effacerSignature"
                      class="btn btn-secondary btn-sm"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Effacer
                    </button>
                    <button
                      type="button"
                      @click="sauvegarderSignature"
                      class="btn btn-primary btn-sm"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Sauvegarder
                    </button>
                  </div>
                </div>
                <div v-if="signatureClient" class="signature-preview">
                  <p class="signature-preview-label">Aperçu de la signature :</p>
                  <img :src="signatureClient" alt="Signature client" class="signature-image" />
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button
                @click="closeCommencerModal"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                @click="confirmerCommencerLivraison"
                class="btn btn-primary"
                :disabled="!signatureClient"
              >
                <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Finaliser la livraison
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'affichage du bordereau -->
    <div v-if="showBordereauModal && selectedBordereauLivraison" class="modal-overlay">
      <BordereauViewer
        :livraison="selectedBordereauLivraison"
        @close="closeBordereauModal"
              />
            </div>

    <!-- Modal de documentation des quantités -->
    <div v-if="showDocumenterModal && selectedDocumenterLivraison" class="modal-overlay">
      <div class="modal-container modal-large">
        <div class="modal-header">
          <div class="modal-header-content">
            <h2 class="modal-title">Documenter les quantités - {{ selectedDocumenterLivraison.client }}</h2>
            <button @click="closeDocumenterModal" class="modal-close">
              <svg class="modal-close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="modal-body">
          <div class="livraison-process">
            <!-- Informations de la livraison -->
            <div class="livraison-info-section">
              <h3 class="section-title">Informations de livraison</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">N° BL :</span>
                  <span class="info-value">{{ selectedDocumenterLivraison.numero_bl }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Client :</span>
                  <span class="info-value">{{ selectedDocumenterLivraison.client }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Statut :</span>
                  <span :class="['px-2 py-1 rounded-full text-sm font-medium', getStatutClass(selectedDocumenterLivraison.statut)]">
                    <span class="mr-1">{{ getStatutIcon(selectedDocumenterLivraison.statut) }}</span>
                    {{ getStatutText(selectedDocumenterLivraison.statut) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Saisie des quantités -->
            <div class="quantites-section">
              <h3 class="section-title">Quantités livrées</h3>
              <div class="quantites-table">
                <div class="table-header">
                  <div class="col-produit">Produit</div>
                  <div class="col-commandee">Commandée</div>
                  <div class="col-livree">Livrée</div>
                  <div class="col-difference">Différence</div>
                </div>
                <div v-for="produit in selectedDocumenterLivraison.produits" :key="produit.nom" class="table-row">
                  <div class="col-produit">
                    <span class="produit-nom">{{ produit.nom }}</span>
                    <span class="produit-unite">{{ produit.unite }}</span>
                  </div>
                  <div class="col-commandee">
                    {{ produit.quantiteCommandee || produit.quantite }}
                  </div>
                  <div class="col-livree">
                    <input
                      v-model.number="quantitesLivraison[produit.nom]"
                      type="number"
                      :min="0"
                      :max="produit.quantiteCommandee || produit.quantite"
                      step="0.01"
                      class="quantite-input"
                      :placeholder="(produit.quantiteLivree || 0).toString()"
                    />
                  </div>
                  <div class="col-difference">
                    <span :class="{
                      'text-green-600': (quantitesLivraison[produit.nom] || produit.quantiteLivree || 0) >= (produit.quantiteCommandee || produit.quantite),
                      'text-orange-600': (quantitesLivraison[produit.nom] || produit.quantiteLivree || 0) > 0 && (quantitesLivraison[produit.nom] || produit.quantiteLivree || 0) < (produit.quantiteCommandee || produit.quantite),
                      'text-red-600': (quantitesLivraison[produit.nom] || produit.quantiteLivree || 0) === 0
                    }">
                      {{ ((produit.quantiteCommandee || produit.quantite) - (quantitesLivraison[produit.nom] || produit.quantiteLivree || 0)).toFixed(2) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button type="button" @click="closeDocumenterModal" class="btn btn-secondary">
                Annuler
              </button>
              <button type="button" @click="documenterQuantites" class="btn btn-primary">
                <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documenter quantités
              </button>
            </div>
          </div>
        </div>
      </div>
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
                  <select
                  v-model="produit.nom" 
                    required
                  class="form-input"
                  >
                    <option value="">Sélectionner un produit</option>
                    <option
                      v-for="article in produitsDisponibles"
                      :key="article.id"
                      :value="article.nom"
                    >
                      {{ article.nom }} (Stock: {{ article.stock }})
                    </option>
                  </select>
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

    <!-- Modal BLGenerator -->
    <div v-if="showBLGenerator && selectedBLLivraison" class="modal-overlay" @click="closeBLGenerator">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Génération du Bon de Livraison</h2>
          <button @click="closeBLGenerator" class="modal-close">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <BLGenerator
          :livraison="selectedBLLivraison"
          @close="closeBLGenerator"
          @saved="onBLSaved"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout principal amélioré */
.livraison-container {
  min-height: 100vh;
  background-color: #f9fafb;
  overflow-x: hidden;
}

.livraison-header {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #bbf7d0;
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
}

.header-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

@media (min-width: 640px) {
  .header-content {
    padding: 2rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .header-content {
    padding: 2rem 2rem;
  }
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.main-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .main-content {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .main-content {
    padding: 0 2rem;
  }
}

/* Statistiques améliorées */
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
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 1.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.stat-content {
  padding: 1.5rem;
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

/* Onglets améliorés */
.tabs-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
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

/* Liste des livraisons améliorée */
.livraison-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.livraison-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-width: 100%;
  overflow: hidden;
}

.livraison-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #10b981;
}

.livraison-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .livraison-content {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

@media (min-width: 1024px) {
  .livraison-actions {
    margin-left: 1.5rem;
    width: auto;
    min-width: 200px;
  }
}

/* Boutons améliorés */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.btn-icon {
  height: 1.25rem;
  width: 1.25rem;
  margin-right: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.btn-secondary {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-color: #10b981;
  color: #10b981;
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

/* Styles pour la section des commandes */
.commandes-section {
  margin-bottom: 2rem;
}

.commandes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.commande-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.commande-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.commande-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.commande-info h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.commande-client {
  color: #6b7280;
  margin: 0;
}

.commande-statut {
  display: flex;
  align-items: center;
}

.statut-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.statut-confirmee {
  background-color: #dcfce7;
  color: #166534;
}

.statut-preparation {
  background-color: #fef3c7;
  color: #92400e;
}

.commande-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.commande-produits {
  margin-bottom: 1rem;
}

.produits-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.produits-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.produit-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.produit-nom {
  color: #111827;
  font-weight: 500;
}

.produit-quantite {
  color: #6b7280;
}

.commande-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.action-btn-primary {
  background-color: #3b82f6;
  color: white;
}

.action-btn-primary:hover {
  background-color: #2563eb;
}

/* Styles pour la modal du générateur de BL */
.modal-large {
  max-width: 1200px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
}

/* Styles pour le modal de livraison */
.livraison-process {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.livraison-info-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #bbf7d0;
  border-radius: 1rem;
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}

/* Section quantités */
.quantites-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.5rem;
}

.quantites-table {
  margin-top: 1rem;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.table-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  align-items: center;
  transition: all 0.2s ease;
}

.table-row:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.col-produit {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.produit-nom {
  font-weight: 500;
  color: #111827;
}

.produit-unite {
  font-size: 0.75rem;
  color: #6b7280;
}

.quantite-commandee {
  text-align: center;
  font-weight: 500;
  color: #374151;
}

.quantite-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  text-align: center;
  font-weight: 500;
  transition: all 0.2s ease;
}

.quantite-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-success {
  border-color: #10b981;
  background-color: #f0fdf4;
  color: #059669;
}

.input-partial {
  border-color: #f59e0b;
  background-color: #fffbeb;
  color: #d97706;
}

.input-warning {
  border-color: #ef4444;
  background-color: #fef2f2;
  color: #dc2626;
}

.difference-value {
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Quantités restantes */
.quantites-restantes {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
}

.restantes-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.5rem;
}

.restantes-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.restante-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.restante-nom {
  font-weight: 500;
  color: #92400e;
}

.restante-quantite {
  font-weight: 600;
  color: #b45309;
  background: #fbbf24;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

/* Section observations */
.observations-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.5rem;
}

.observations-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  resize: vertical;
  font-family: inherit;
  margin-top: 0.5rem;
  transition: border-color 0.2s ease;
}

.observations-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Section signature */
.signature-section {
  background: linear-gradient(135deg, #fefbff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
}

.signature-container {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.signature-pad-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.signature-canvas {
  border: 2px solid #d1d5db;
  border-radius: 0.5rem;
  background: #ffffff;
  cursor: crosshair;
  touch-action: none;
}

.signature-controls {
  display: flex;
  gap: 0.75rem;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.signature-preview {
  text-align: center;
}

.signature-preview-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.signature-image {
  max-width: 200px;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: #ffffff;
}

/* Actions du modal */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn:disabled:hover {
  transform: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Responsive design pour le modal de livraison */
@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .col-produit,
  .quantite-commandee,
  .difference-value {
    text-align: left;
  }

  .signature-canvas {
    width: 100%;
    max-width: 300px;
    height: 150px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* Responsive design pour les modals */
@media (max-width: 768px) {
  .modal-large {
    width: 98%;
    max-width: 100%;
    margin: 1%;
    max-height: 95vh;
  }

  .modal-container {
    padding: 0.5rem;
  }

  .modal-header {
    padding: 1rem 0.5rem;
  }

  .modal-body {
    padding: 0.5rem;
  }
}
</style>