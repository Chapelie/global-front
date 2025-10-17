<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCompleteLaravelService, type CompleteLivraison, type CompleteCommande, type CompleteArticle } from '../services/completeLaravelService'
// LivraisonAvecSignature supprimé - plus nécessaire
import BordereauViewer from '../components/BordereauViewer.vue'
import BLGenerator from '../components/BLGenerator.vue'

// Service Laravel
const { getLivraisons, addLivraison, updateLivraison, deleteLivraison, getCommandes, updateCommande } = useCompleteLaravelService()

// État réactif
const livraisons = ref<CompleteLivraison[]>([])
const commandes = ref<CompleteCommande[]>([])
const showModal = ref(false)
// showSignatureModal supprimé - plus nécessaire
const showBordereauModal = ref(false)
const showBLGenerator = ref(false)
const editingLivraison = ref<CompleteLivraison | null>(null)
const selectedLivraison = ref<CompleteLivraison | null>(null)
const selectedBordereauLivraison = ref<CompleteLivraison | null>(null)
const selectedBLLivraison = ref<CompleteLivraison | null>(null)
const activeTab = ref<'nonTerminees' | 'terminees'>('nonTerminees')

// Nouvelle livraison
const newLivraison = ref({
  client: '',
  telephone: '',
  chauffeur: 'Camion de livraison',
  produits: [{ nom: '', quantite: 0, unite: 'pièces', quantiteCommandee: 0, quantiteLivree: 0, difference: 0, resteAPayer: 0, notes: '' }],
  statut: 'en_attente' as 'en_attente' | 'en_cours' | 'livre' | 'annule',
  adresse: '',
  numeroBl: '',
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

// Computed pour les commandes prêtes pour livraison (commandes confirmées et préparées)
const commandesALivrer = computed(() => {
  return commandes.value.filter(c => c.statut === 'confirmee' || c.statut === 'en_preparation')
})

// Computed pour vérifier si une livraison est complètement livrée
const isLivraisonComplete = (livraison: CompleteLivraison) => {
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
const produitsDisponibles = ref<CompleteArticle[]>([])

const loadProduitsDisponibles = async () => {
  try {
    const { getArticles } = useCompleteLaravelService()
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
  } catch (error) {
    console.error('❌ [LivraisonView] Erreur lors du chargement des livraisons:', error)
  }
}

const loadCommandes = async () => {
  try {
    console.log('🔍 [LivraisonView] Chargement des commandes depuis Laravel')
    commandes.value = await getCommandes()
    console.log('✅ [LivraisonView] Commandes chargées:', commandes.value.length)
    
    // Afficher les commandes confirmées et préparées pour livraison
    const commandesPretes = commandes.value.filter(c => c.statut === 'confirmee' || c.statut === 'en_preparation')
    console.log('📦 [LivraisonView] Commandes confirmées et préparées pour livraison:', commandesPretes.length)
  } catch (error) {
    console.error('❌ [LivraisonView] Erreur lors du chargement des commandes:', error)
  }
}

const creerLivraisonDepuisCommande = async (commande: CompleteCommande) => {
  try {
    console.log('🔍 [LivraisonView] Création de livraison pour commande:', commande.numeroCommande)
    
    // Créer la livraison à partir de la commande
    const livraisonData = {
      numeroBl: `BL-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      client: commande.client,
      telephone: commande.telephone,
      chauffeur: '',
      produits: commande.produits.map(p => ({
        nom: p.nom,
        quantite: p.quantite,
        unite: p.unite,
        quantiteCommandee: p.quantite,
        quantiteLivree: 0,
        difference: p.quantite,
        resteAPayer: 0,
        notes: ''
      })),
      statut: 'en_attente' as const,
      adresse: commande.adresse,
      codeSuivi: `CS-${Date.now()}`,
      totalCommande: 0,
      totalLivraison: 0,
      differenceTotale: 0,
      resteAPayerTotal: 0,
      commandeId: commande.id
    }

    // Créer la livraison
    console.log('🔍 [LivraisonView] Création de la livraison...')
    const livraisonCreee = await addLivraison(livraisonData)
    console.log('✅ [LivraisonView] Livraison créée:', livraisonCreee)
    
    // Mettre à jour le statut de la commande vers "livree"
    console.log('🔍 [LivraisonView] Mise à jour du statut de la commande...')
    await updateCommande(commande.id!, { statut: 'livree' })
    console.log('✅ [LivraisonView] Commande mise à jour vers "livree"')
    
    // Recharger les données
    console.log('🔍 [LivraisonView] Rechargement des données...')
    await loadLivraisons()
    await loadCommandes()
    
    console.log('✅ [LivraisonView] Livraison créée et commande mise à jour')
    alert(`Livraison créée pour la commande ${commande.numeroCommande}. La commande est maintenant livrée.`)
  } catch (error) {
    console.error('❌ [LivraisonView] Erreur lors de la création de la livraison:', error)
    alert('Erreur lors de la création de la livraison')
  }
}

const openModal = (livraison?: CompleteLivraison) => {
  if (livraison) {
    editingLivraison.value = livraison
    newLivraison.value = { 
      ...livraison, 
      numeroBl: livraison.numeroBl,
      produits: livraison.produits.map(p => ({
        ...p,
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
      numeroBl: '',
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
  newLivraison.value.produits.push({ nom: '', quantite: 0, unite: 'pièces', quantiteCommandee: 0, quantiteLivree: 0, difference: 0, resteAPayer: 0, notes: '' })
}

const removeProduit = (index: number) => {
  newLivraison.value.produits.splice(index, 1)
}

const saveLivraison = async () => {
  try {
    if (editingLivraison.value) {
      await updateLivraison(editingLivraison.value.id!, newLivraison.value)
      console.log('✅ [LivraisonView] Livraison mise à jour')
    } else {
      await addLivraison(newLivraison.value)
      console.log('✅ [LivraisonView] Livraison créée')
    }
    
    await loadLivraisons()
    closeModal()
    alert('Livraison enregistrée avec succès!')
  } catch (error) {
    console.error('❌ [LivraisonView] Erreur lors de la sauvegarde:', error)
    alert('Erreur lors de la sauvegarde de la livraison')
  }
}

const commencerLivraison = async (livraison: CompleteLivraison) => {
  try {
    // Récupérer les articles depuis le service Laravel
    const { getArticles } = useCompleteLaravelService()
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
    // showSignatureModal supprimé - plus nécessaire
  } catch (error) {
    console.error('❌ [LivraisonView] Erreur lors de la vérification du stock:', error)
    alert('Erreur lors de la vérification du stock')
  }
}

// Méthodes de signature supprimées - plus nécessaires

// Nouvelle méthode pour clôturer manuellement une livraison
const cloturerLivraison = async (livraison: CompleteLivraison) => {
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
      const { updateLivraison } = useCompleteLaravelService()
      
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
const rouvrirLivraison = async (livraison: CompleteLivraison) => {
  if (confirm('Êtes-vous sûr de vouloir rouvrir cette livraison ?')) {
    try {
      const { updateLivraison } = useCompleteLaravelService()
      
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

// Méthode pour récupérer les informations client depuis la commande
const getClientInfoFromCommande = (livraison: CompleteLivraison) => {
  if (!livraison.commandeId) return null
  
  const commande = commandes.value.find(c => c.id === livraison.commandeId)
  if (!commande) return null
  
  return {
    nom: commande.client,
    telephone: commande.telephone,
    adresse: commande.adresse
  }
}

// Méthode pour calculer le pourcentage de livraison
const getPourcentageLivraison = (livraison: CompleteLivraison) => {
  if (!livraison.produits.length) return 0

  const totalCommandee = livraison.produits.reduce((sum, produit) => {
    return sum + (produit.quantiteCommandee || produit.quantite || 0)
  }, 0)

  const totalLivree = livraison.produits.reduce((sum, produit) => {
    return sum + (produit.quantiteLivree || 0)
  }, 0)

  return totalCommandee > 0 ? Math.round((totalLivree / totalCommandee) * 100) : 0
}

const telechargerBL = (livraison: CompleteLivraison) => {
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

const telechargerBordereauTransfert = (livraison: CompleteLivraison) => {
  // Ouvrir une nouvelle fenêtre pour imprimer le bordereau de transfert
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bordereau de Transfert - ${livraison.numeroBl}</title>
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
                  <p><strong>N° Bordereau :</strong> ${livraison.numeroBl}</p>
                  ${livraison.codeSuivi ? `<p><strong>Code de suivi :</strong> ${livraison.codeSuivi}</p>` : ''}
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


const getStatusText = (statut: string, livraison?: CompleteLivraison) => {
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

const getStatusClass = (statut: string, livraison?: CompleteLivraison) => {
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

// Fonctions utilitaires
const getStatutText = (statut: string) => {
  const texts = {
    'en_attente': 'En attente',
    'confirmee': 'Confirmée',
    'en_preparation': 'En préparation',
    'en_cours': 'En cours',
    'livre': 'Livré',
    'annule': 'Annulé'
  }
  return texts[statut as keyof typeof texts] || statut
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

// Méthodes pour le générateur de BL
const openBLGenerator = (livraison: CompleteLivraison) => {
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

// Initialisation
onMounted(async () => {
  console.log('🔍 [LivraisonView] onMounted - Début')
  console.log('🔍 [LivraisonView] Chargement des commandes et livraisons...')
  
  try {
    await loadCommandes()
    console.log('✅ [LivraisonView] Commandes chargées avec succès')
  } catch (error) {
    console.error('❌ [LivraisonView] Erreur lors du chargement des commandes:', error)
  }
  
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
          <button
            @click="openModal()"
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

    <!-- Commandes à livrer -->
      <div v-if="commandesALivrer.length > 0" class="commandes-section">
        <div class="section-header">
          <h3 class="section-title">Commandes à livrer</h3>
          <p class="section-subtitle">Commandes confirmées et préparées prêtes pour la livraison</p>
        </div>
        
      <div class="commandes-grid">
        <div 
          v-for="commande in commandesALivrer" 
          :key="commande.id"
          class="commande-card"
        >
          <div class="commande-header">
            <div class="commande-info">
                <h4 class="commande-numero">{{ commande.numeroCommande }}</h4>
              <p class="commande-client">{{ commande.client }}</p>
            </div>
            <div class="commande-statut">
                <span class="statut-badge statut-preparation">{{ getStatutText(commande.statut) }}</span>
            </div>
          </div>
          
          <div class="commande-details">
            <div class="detail-item">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              <span>{{ commande.telephone }}</span>
            </div>
            <div class="detail-item">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              <span>{{ formatDate(commande.date) }}</span>
            </div>
            <div class="detail-item">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              <span>{{ commande.produits.length }} produits</span>
            </div>
          </div>

          <div class="commande-produits">
              <h5 class="produits-title">Produits ({{ commande.produits.length }})</h5>
            <div class="produits-list">
              <div 
                v-for="produit in commande.produits" 
                :key="produit.nom"
                class="produit-item"
              >
                <span class="produit-nom">{{ produit.nom }}</span>
                <span class="produit-quantite">{{ produit.quantite }} {{ produit.unite }}</span>
              </div>
            </div>
          </div>

          <div class="commande-actions">
            <button 
                @click="creerLivraisonDepuisCommande(commande)" 
              class="action-btn action-btn-primary"
            >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              Créer Livraison
            </button>
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
                v-for="livraison in livraisons"
        :key="livraison.id"
        class="livraison-card"
      >
                <div class="livraison-content">
                  <div class="livraison-main">
                    <div class="livraison-header-info">
                      <span class="status-badge"
                            :class="getStatusClass(livraison.statut, livraison)">
                        {{ getStatusText(livraison.statut, livraison) }}
                      </span>
                      <span class="livraison-number">#{{ livraison.numeroBl }}</span>
                      
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
                            :class="getStatusClass(livraison.statut, livraison)">
                        {{ getStatusText(livraison.statut, livraison) }}
                      </span>
                      <span class="livraison-number">#{{ livraison.numeroBl }}</span>
                      <!-- Affichage spécial pour les livraisons clôturées -->
                      <div v-if="livraison.cloturee" class="text-xs text-purple-600 font-medium">
                        Clôturée le {{ livraison.dateClotureManuelle ? new Date(livraison.dateClotureManuelle).toLocaleDateString('fr-FR') : 'N/A' }}
            </div>
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

    <!-- Modal de livraison avec signature supprimé - plus nécessaire -->

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
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.livraison-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #10b981;
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