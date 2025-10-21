<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLaravelApi, type LaravelCommande, type LaravelArticle } from '../services/laravelApiService'
import { useApiConfig } from '../config/ApiConfig'
import type { CompleteCommande } from '../types/global'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  ShoppingCartIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/vue/24/outline'

const { getCommandes, addCommande, updateCommande, deleteCommande, getArticles, addLivraison } = useLaravelApi()
const apiConfig = useApiConfig()
const commandes = ref<LaravelCommande[]>([])
const showModal = ref(false)
const editingCommande = ref<LaravelCommande | null>(null)
const selectedDate = ref('')
const selectedStatut = ref('')
const selectedStatutLivraison = ref('')

// Charger les données depuis Supabase/localStorage
onMounted(async () => {
  await loadCommandes()
  await loadProduitsDisponibles()
})

const loadCommandes = async () => {
  try {
    console.log('🔍 [CommandesView] Chargement des commandes')
    commandes.value = await getCommandes()
    console.log('✅ [CommandesView] Commandes chargées:', commandes.value.length)
  } catch (error) {
    console.error('❌ [CommandesView] Erreur lors du chargement des commandes:', error)
    alert('Erreur lors du chargement des commandes')
  }
}

const newCommande = ref({
  client: '',
  telephone: '',
  adresse: '',
  produits: [{ nom: '', quantite: 0, unite: 'pièces' }],
  statut: 'en_attente' as 'en_attente' | 'confirmee' | 'en_preparation' | 'pret' | 'livree' | 'annulee',
  numero_commande: '',
  date: new Date().toISOString().split('T')[0],
      date_livraison_souhaitee: '' as string | undefined,
  priorite: 'normale' as 'basse' | 'normale' | 'haute' | 'urgente'
})

const statuts = [
  { value: 'en_attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  { value: 'confirmee', label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
  { value: 'en_preparation', label: 'En préparation', color: 'bg-orange-100 text-orange-800', icon: ShoppingCartIcon },
  { value: 'pret', label: 'Prêt', color: 'bg-purple-100 text-purple-800', icon: DocumentTextIcon },
  { value: 'livree', label: 'Livrée', color: 'bg-green-100 text-green-800', icon: TruckIcon },
  { value: 'annulee', label: 'Annulée', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
]

// Statuts de livraison avec couleurs
const statutsLivraison = [
  { value: 'non_livre', label: 'Non livré', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
  { value: 'partiellement_livre', label: 'Partiellement livré', color: 'bg-orange-100 text-orange-800', icon: ClockIcon },
  { value: 'livre', label: 'Livré', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon }
]

// Obtenir les produits disponibles depuis le stock
const produitsDisponibles = ref<any[]>([])

const loadProduitsDisponibles = async () => {
  try {
    const { getArticles } = useLaravelApi()
    const articles = await getArticles()
    produitsDisponibles.value = articles.map(article => ({
      nom: article.nom,
      stock: article.stock,
      unite: article.unite,
      prix: article.prix
    }))
  } catch (error) {
    console.error('Erreur lors du chargement du stock:', error)
    produitsDisponibles.value = []
  }
}

const priorites = [
  { value: 'basse', label: 'Basse', color: 'bg-gray-100 text-gray-800' },
  { value: 'normale', label: 'Normale', color: 'bg-blue-100 text-blue-800' },
  { value: 'haute', label: 'Haute', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800' }
]

const openModal = (commande?: LaravelCommande) => {
  if (commande) {
    editingCommande.value = commande
    newCommande.value = { 
      ...commande,
      statut: commande.statut as "en_attente" | "confirmee" | "livree" | "en_preparation" | "annulee",
      priorite: commande.priorite as "normale" | "urgente" | "basse" | "haute",
      date_livraison_souhaitee: commande.date_livraison_souhaitee || '' // Assurer que dateLivraisonSouhaitee n'est jamais undefined
    }
  } else {
    editingCommande.value = null
    newCommande.value = {
      client: '',
      telephone: '',
      adresse: '',
      produits: [{ nom: '', quantite: 0, unite: 'pièces' }],
      statut: 'en_attente' as 'en_attente' | 'confirmee' | 'en_preparation' | 'pret' | 'livree' | 'annulee',
      numero_commande: `CMD-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      date_livraison_souhaitee: '',
      priorite: 'normale' as 'basse' | 'normale' | 'haute' | 'urgente'
    }
  }
  showModal.value = true
}

const saveCommande = async () => {
  try {
    console.log('🔍 [CommandesView] Sauvegarde de la commande')
    
    // Filtrer les produits vides
    const produitsValides = newCommande.value.produits.filter(p => 
      p.nom.trim() && p.quantite > 0 && p.unite.trim()
    )

    const commandeData = {
      ...newCommande.value,
      produits: produitsValides,
      numero_commande: newCommande.value.numero_commande || `CMD-${Date.now()}`,
      date: newCommande.value.date || new Date().toISOString().split('T')[0]
    }

    if (editingCommande.value) {
      await updateCommande(editingCommande.value.id, commandeData)
      console.log('✅ [CommandesView] Commande mise à jour')
    } else {
      await addCommande(commandeData)
      console.log('✅ [CommandesView] Commande créée')
    }

    await loadCommandes()
    showModal.value = false
    editingCommande.value = null
    alert('Commande enregistrée avec succès!')
  } catch (error) {
    console.error('❌ [CommandesView] Erreur lors de la sauvegarde:', error)
    alert('Erreur lors de la sauvegarde de la commande')
  }
}

// Fonctions utilitaires pour l'affichage des états de livraison
const getStatutLivraisonColor = (statut: string) => {
  const statutLivraison = statutsLivraison.find(s => s.value === statut)
  return statutLivraison ? statutLivraison.color : 'bg-gray-100 text-gray-800'
}

const getStatutLivraisonLabel = (statut: string) => {
  const statutLivraison = statutsLivraison.find(s => s.value === statut)
  return statutLivraison ? statutLivraison.label : 'Inconnu'
}

const getStatutLivraisonIcon = (statut: string) => {
  const statutLivraison = statutsLivraison.find(s => s.value === statut)
  return statutLivraison ? statutLivraison.icon : ClockIcon
}

const handleDeleteCommande = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
    try {
      console.log('🔍 [CommandesView] Suppression de la commande:', id)
      await deleteCommande(id)
      await loadCommandes()
      console.log('✅ [CommandesView] Commande supprimée')
    } catch (error) {
      console.error('❌ [CommandesView] Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la commande')
    }
  }
}

const confirmerCommande = async (commande: CompleteCommande) => {
  // Vérifier le stock avant de confirmer
  const stock = produitsDisponibles.value
  const produitsIndisponibles: string[] = []

  commande.produits.forEach((produit: { nom: string; quantite: number; unite: string }) => {
    const articleStock = stock.find(article => article.nom === produit.nom)
    if (!articleStock) {
      produitsIndisponibles.push(`${produit.nom} (article inexistant)`)
    } else if (articleStock.stock < produit.quantite) {
      produitsIndisponibles.push(`${produit.nom} (stock: ${articleStock.stock}, demandé: ${produit.quantite})`)
    }
  })

  if (produitsIndisponibles.length > 0) {
    alert(`Impossible de confirmer la commande. Stock insuffisant pour:\n${produitsIndisponibles.join('\n')}`)
    return
  }

  try {
    console.log('🔍 [CommandesView] Confirmation de la commande:', commande.numero_commande)

    // 1. Confirmer la commande
    await updateCommande(commande.id!, { statut: 'confirmee' })
    console.log('✅ [CommandesView] Commande confirmée')

    // 2. Créer automatiquement la livraison
    console.log('🔍 [CommandesView] Création automatique de la livraison...')
    const livraisonData = {
      numero_bl: `BL-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      client: commande.client,
      telephone: commande.telephone,
      chauffeur: '', // À assigner plus tard
      produits: commande.produits.map((p: { nom: string; quantite: number; unite: string }) => ({
        nom: p.nom,
        quantite: p.quantite,
        unite: p.unite,
        quantite_commandee: p.quantite,
        quantite_livree: 0,
        difference: p.quantite,
        reste_a_payer: 0,
        notes: ''
      })),
      statut: 'en_attente' as const,
      adresse: commande.adresse,
      code_suivi: `CS-${Date.now()}`,
      total_commande: 0,
      total_livraison: 0,
      difference_totale: 0,
      reste_a_payer_total: 0
    }

    const livraisonCreee = await addLivraison(livraisonData)
    console.log('✅ [CommandesView] Livraison créée automatiquement:', livraisonCreee)

    await loadCommandes()
    alert(`Commande confirmée avec succès!\nLivraison ${livraisonData.numero_bl} créée automatiquement.`)
  } catch (error) {
    console.error('❌ [CommandesView] Erreur lors de la confirmation:', error)
    alert('Erreur lors de la confirmation de la commande ou création de la livraison')
  }
}

// Obtenir les informations de stock pour un produit
const getStockInfo = (nomProduit: string) => {
  return produitsDisponibles.value.find(article => article.nom === nomProduit)
}

const preparerCommande = async (commande: CompleteCommande) => {
  // Vérifier le stock avant de préparer
  const stock = produitsDisponibles.value
  const produitsIndisponibles: string[] = []

  commande.produits.forEach((produit: { nom: string; quantite: number; unite: string }) => {
    const articleStock = stock.find(article => article.nom === produit.nom)
    if (!articleStock) {
      produitsIndisponibles.push(`${produit.nom} (article inexistant)`)
    } else if (articleStock.stock < produit.quantite) {
      produitsIndisponibles.push(`${produit.nom} (stock: ${articleStock.stock}, demandé: ${produit.quantite})`)
    }
  })

  if (produitsIndisponibles.length > 0) {
    alert(`Impossible de préparer la commande. Stock insuffisant pour:\n${produitsIndisponibles.join('\n')}`)
    return
  }

  try {
    await updateCommande(commande.id!, { statut: 'en_preparation' })
    await loadCommandes()
    alert('Commande mise en préparation!')
  } catch (error) {
    console.error('Erreur lors de la préparation:', error)
    alert('Erreur lors de la préparation de la commande')
  }
}

const marquerPret = async (commande: CompleteCommande) => {
  // Vérifier le stock avant de marquer comme prêt
  const stock = produitsDisponibles.value
  const produitsIndisponibles: string[] = []

  commande.produits.forEach((produit: { nom: string; quantite: number; unite: string }) => {
    const articleStock = stock.find(article => article.nom === produit.nom)
    if (!articleStock) {
      produitsIndisponibles.push(`${produit.nom} (article inexistant)`)
    } else if (articleStock.stock < produit.quantite) {
      produitsIndisponibles.push(`${produit.nom} (stock: ${articleStock.stock}, demandé: ${produit.quantite})`)
    }
  })

  if (produitsIndisponibles.length > 0) {
    alert(`Impossible de marquer la commande comme prête. Stock insuffisant pour:\n${produitsIndisponibles.join('\n')}`)
    return
  }

  try {
    console.log('🔍 [CommandesView] Marquage de la commande comme prête:', commande.numero_commande)

    // Utiliser l'endpoint backend qui gère automatiquement la création de livraison
    const response = await apiConfig.post(apiConfig.endpoints.commandes.marquerPret(commande.id))
    apiConfig.debug('Commande marquée comme prête et livraison créée:', response)

    await loadCommandes()
    alert(response.message || 'Commande marquée comme prête et livraison créée automatiquement!')
  } catch (error) {
    console.error('❌ [CommandesView] Erreur lors du marquage comme prêt:', error)
    alert('Erreur lors du marquage de la commande comme prête: ' + (error as Error).message)
  }
}

const creerLivraison = async (commande: CompleteCommande) => {
  // Créer une livraison automatiquement à partir de la commande
  const livraison = {
    numeroBL: `BL-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    client: commande.client,
    telephone: commande.telephone,
    chauffeur: '', // À assigner par le manager
    produits: commande.produits.map((p: { nom: string; quantite: number; unite: string }) => ({
      nom: p.nom,
      quantite: p.quantite,
      unite: p.unite,
      quantiteCommandee: p.quantite,
      quantiteLivree: 0,
      difference: p.quantite,
      resteAPayer: 0
    })),
    statut: 'en_attente' as const,
    adresse: commande.adresse,
    codeSuivi: `CS-${Date.now()}`,
    totalCommande: 0,
    totalLivraison: 0,
    differenceTotale: 0,
    resteAPayerTotal: 0
  }
  
  try {
    // Note: Pour l'instant, on ne peut que marquer la commande comme livrée
    // La création de livraison nécessiterait le service de livraison
    await updateCommande(commande.id, { statut: 'livree' })
    await loadCommandes()
    alert(`Commande ${commande.numero_commande} marquée comme livrée!`)
  } catch (error) {
    console.error('Erreur lors de la création de livraison:', error)
    alert('Erreur lors de la création de livraison')
  }
}

const addProduit = () => {
  newCommande.value.produits.push({ nom: '', quantite: 0, unite: 'pièces' })
}

const removeProduit = (index: number) => {
  newCommande.value.produits.splice(index, 1)
}

const getStatutInfo = (statut: string) => {
  return statuts.find(s => s.value === statut) || statuts[0]
}

const getPrioriteInfo = (priorite: string) => {
  return priorites.find(p => p.value === priorite) || priorites[1]
}

const commandesFiltrees = computed(() => {
  let filtered = commandes.value
  
  if (selectedDate.value) {
    filtered = filtered.filter(c => c.date === selectedDate.value)
  }
  
  if (selectedStatut.value) {
    filtered = filtered.filter(c => c.statut === selectedStatut.value)
  }
  
  if (selectedStatutLivraison.value) {
    // Note: statutGlobalLivraison n'existe pas dans CompleteCommande
    // filtered = filtered.filter(c => c.statutGlobalLivraison === selectedStatutLivraison.value)
  }
  
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const totalCommandes = computed(() => commandes.value.length)
const commandesEnAttente = computed(() => commandes.value.filter(c => c.statut === 'en_attente').length)
const commandesConfirmees = computed(() => commandes.value.filter(c => c.statut === 'confirmee').length)
const commandesEnPreparation = computed(() => commandes.value.filter(c => c.statut === 'en_preparation').length)
const commandesPrets = computed(() => commandes.value.filter(c => c.statut === 'pret').length)

// Statistiques des états de livraison
// Note: Ces propriétés n'existent pas dans CompleteCommande
const commandesNonLivrees = computed(() => 0)
const commandesPartiellementLivrees = computed(() => 0)
const commandesLivrees = computed(() => 0)
</script>

<template>
  <div class="commandes-container">
    <!-- Header moderne -->
    <div class="commandes-header">
      <div class="header-content">
        <div class="header-main">
          <div class="flex items-center">
            <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mr-4 shadow-lg">
              <ShoppingCartIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="page-title">Commandes Clients</h1>
              <p class="page-subtitle">Gestion des commandes et génération des livraisons</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="openModal()"
              class="action-button"
            >
              <PlusIcon class="h-5 w-5 mr-2" />
              Nouvelle commande
            </button>
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
            <ShoppingCartIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">Total commandes</dt>
            <dd class="stat-value">{{ totalCommandes }}</dd>
            <dd class="stat-unit">commandes</dd>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-wrapper stat-yellow">
            <ClockIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">En attente</dt>
            <dd class="stat-value">{{ commandesEnAttente }}</dd>
            <dd class="stat-unit">à traiter</dd>
          </div>
          <div v-if="commandesEnAttente > 0" class="stat-badge">
            <ExclamationTriangleIcon class="h-4 w-4 text-yellow-600" />
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-wrapper stat-orange">
            <CheckCircleIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">Confirmées</dt>
            <dd class="stat-value">{{ commandesConfirmees }}</dd>
            <dd class="stat-unit">validées</dd>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-wrapper stat-green">
            <TruckIcon class="stat-icon" />
          </div>
          <div class="stat-details">
            <dt class="stat-label">En préparation</dt>
            <dd class="stat-value">{{ commandesEnPreparation }}</dd>
            <dd class="stat-unit">actives</dd>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques des états de livraison -->
    <div class="secondary-stats-grid">
      <div class="secondary-stat-card">
        <div class="secondary-stat-content">
          <div class="secondary-stat-icon stat-red">
            <ExclamationTriangleIcon class="h-5 w-5 text-white" />
          </div>
          <div>
            <p class="secondary-stat-label">Non livrées</p>
            <p class="secondary-stat-value">{{ commandesNonLivrees }}</p>
          </div>
        </div>
      </div>

      <div class="secondary-stat-card">
        <div class="secondary-stat-content">
          <div class="secondary-stat-icon stat-orange">
            <ClockIcon class="h-5 w-5 text-white" />
          </div>
          <div>
            <p class="secondary-stat-label">Partiellement livrées</p>
            <p class="secondary-stat-value">{{ commandesPartiellementLivrees }}</p>
          </div>
        </div>
      </div>

      <div class="secondary-stat-card">
        <div class="secondary-stat-content">
          <div class="secondary-stat-icon stat-green">
            <CheckCircleIcon class="h-5 w-5 text-white" />
          </div>
          <div>
            <p class="secondary-stat-label">Livrées complètement</p>
            <p class="secondary-stat-value">{{ commandesLivrees }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres modernisés -->
    <div class="filters-card">
      <div class="filters-header">
        <div class="flex items-center">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-3 shadow-lg">
            <DocumentTextIcon class="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 class="chart-title">Commandes récentes</h3>
            <p class="chart-subtitle">Filtres et recherche avancée</p>
          </div>
        </div>
      </div>
      <div class="filters-content">
        <div class="filters-row">
          <div class="filter-item">
            <CalendarIcon class="filter-icon" />
            <input
              v-model="selectedDate"
              type="date"
              class="filter-input"
              placeholder="Filtrer par date"
            />
          </div>
          <div class="filter-item">
            <select
              v-model="selectedStatut"
              class="filter-select"
            >
              <option value="">Tous les statuts</option>
              <option v-for="statut in statuts" :key="statut.value" :value="statut.value">
                {{ statut.label }}
              </option>
            </select>
          </div>
          <div class="filter-item">
            <select
              v-model="selectedStatutLivraison"
              class="filter-select"
            >
              <option value="">Tous les états de livraison</option>
              <option v-for="statut in statutsLivraison" :key="statut.value" :value="statut.value">
                {{ statut.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des commandes modernisée -->
    <div class="commandes-list">
      <div
        v-for="commande in commandesFiltrees"
        :key="commande.id"
        class="commande-card"
      >
        <div class="commande-content">
          <div class="commande-main">
            <div class="commande-header">
              <div class="commande-info">
                <div class="flex items-center space-x-3 mb-2">
                  <div class="commande-icon">
                    <component :is="getStatutInfo(commande.statut).icon" class="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 class="commande-title">{{ commande.numero_commande }}</h4>
                    <p class="commande-client">{{ commande.client }}</p>
                  </div>
                </div>
              </div>
              <div class="commande-badges">
                <span
                  class="status-badge"
                  :class="getStatutInfo(commande.statut).color"
                >
                  <component :is="getStatutInfo(commande.statut).icon" class="h-3 w-3 mr-1" />
                  {{ getStatutInfo(commande.statut).label }}
                </span>
                <span
                  class="priority-badge"
                  :class="getPrioriteInfo(commande.priorite).color"
                >
                  {{ getPrioriteInfo(commande.priorite).label }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm font-medium text-gray-700">Date de commande</p>
                <p class="text-sm text-gray-900">{{ new Date(commande.date).toLocaleDateString('fr-FR') }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Livraison souhaitée</p>
                <p class="text-sm text-gray-900">{{ commande.date_livraison_souhaitee ? new Date(commande.date_livraison_souhaitee).toLocaleDateString('fr-FR') : 'Non spécifiée' }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Téléphone</p>
                <p class="text-sm text-gray-900">{{ commande.telephone }}</p>
              </div>
            </div>

            <div class="mb-4">
              <p class="text-sm font-medium text-gray-700 mb-2">Adresse de livraison</p>
              <p class="text-sm text-gray-900">{{ commande.adresse }}</p>
            </div>

            <div class="mb-4">
              <p class="text-sm font-medium text-gray-700 mb-2">Produits commandés</p>
              <div class="space-y-2">
                <div 
                  v-for="produit in commande.produits" 
                  :key="produit.nom"
                  class="bg-gray-50 rounded-lg p-3"
                >
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-900">{{ produit.nom }}</span>
                    <span 
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      <ClockIcon class="h-3 w-3 mr-1" />
                      Non livré
                    </span>
                  </div>
                  <div class="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span class="text-gray-600">Commandé:</span>
                      <span class="font-medium text-gray-900 ml-1">{{ produit.quantite }} {{ produit.unite }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Livré:</span>
                      <span class="font-medium text-gray-900 ml-1">0 {{ produit.unite }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Reste:</span>
                      <span class="font-medium text-gray-900 ml-1">{{ produit.quantite }} {{ produit.unite }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- État global de livraison -->
            <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-blue-900">État global de livraison</p>
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  <ClockIcon class="h-3 w-3 mr-1" />
                  Non livré
                </span>
              </div>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-blue-600">Total livré:</span>
                  <span class="font-medium text-blue-900 ml-1">0</span>
                </div>
                <div>
                  <span class="text-blue-600">Total restant:</span>
                  <span class="font-medium text-blue-900 ml-1">{{ commande.produits.reduce((sum, p) => sum + p.quantite, 0) }}</span>
                </div>
              </div>
            </div>


          </div>

          <!-- Actions modernisées -->
          <div class="commande-actions">
            <div class="actions-grid">
              <button
                v-if="commande.statut === 'en_attente'"
                @click="confirmerCommande(commande as CompleteCommande)"
                class="action-btn action-btn-primary"
              >
                <CheckCircleIcon class="h-4 w-4 mr-2" />
                Confirmer
              </button>
              <button
                v-if="commande.statut === 'confirmee'"
                @click="preparerCommande(commande as CompleteCommande)"
                class="action-btn action-btn-orange"
              >
                <ShoppingCartIcon class="h-4 w-4 mr-2" />
                Préparer
              </button>
              <button
                v-if="commande.statut === 'en_preparation'"
                @click="marquerPret(commande as CompleteCommande)"
                class="action-btn action-btn-purple"
              >
                <DocumentTextIcon class="h-4 w-4 mr-2" />
                Marquer prêt
              </button>
              <button
                @click="openModal(commande)"
                class="action-btn action-btn-secondary"
              >
                <PencilIcon class="h-4 w-4 mr-2" />
                Modifier
              </button>
              <button
                @click="handleDeleteCommande(commande.id!)"
                class="action-btn action-btn-danger"
              >
                <TrashIcon class="h-4 w-4 mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal modernisé -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-container">
        <!-- Header moderne -->
        <div class="modal-header">
          <div class="modal-header-content">
            <div class="flex items-center space-x-3">
              <div class="modal-icon">
                <ShoppingCartIcon class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="modal-title">
                  {{ editingCommande ? 'Modifier la commande' : 'Nouvelle commande' }}
                </h3>
                <p class="modal-subtitle">Gestion des commandes clients</p>
              </div>
            </div>
            <button
              @click="showModal = false"
              class="modal-close"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <form id="commande-form" @submit.prevent="saveCommande" class="space-y-6">
            <!-- Informations de suivi -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Informations de suivi</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Numéro de commande</label>
                  <input
                    v-model="newCommande.numero_commande"
                    type="text"
                    readonly
                    class="w-full rounded-lg border-gray-300 bg-white text-gray-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                  <select
                    v-model="newCommande.priorite"
                    required
                    class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  >
                    <option v-for="priorite in priorites" :key="priorite.value" :value="priorite.value">
                      {{ priorite.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Informations de base -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 rounded-xl p-4">
                <h4 class="font-semibold text-gray-900 mb-3">Informations de base</h4>
                <div class="space-y-4">
                  

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      v-model="newCommande.statut"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                    >
                      <option v-for="statut in statuts" :key="statut.value" :value="statut.value">
                        {{ statut.label }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-4">
                <h4 class="font-semibold text-gray-900 mb-3">Informations client</h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <input
                      v-model="newCommande.client"
                      type="text"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                      placeholder="Nom du client"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      v-model="newCommande.telephone"
                      type="tel"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Informations de livraison -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Informations de livraison</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Adresse de livraison</label>
                  <input
                    v-model="newCommande.adresse"
                    type="text"
                    required
                    class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                    placeholder="Adresse complète"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Date de livraison souhaitée</label>
                  <input
                    v-model="newCommande.date_livraison_souhaitee"
                    type="date"
                    class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <!-- Produits -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Produits commandés</h4>
              <div class="space-y-4">
                <div 
                  v-for="(produit, index) in newCommande.produits" 
                  :key="index"
                  class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
                >
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Produit</label>
                    <select
                      v-model="produit.nom"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                    >
                      <option value="">Sélectionner un produit</option>
                      <option v-for="p in produitsDisponibles" :key="p.nom" :value="p.nom">
                        {{ p.nom }} (Stock: {{ p.stock }} {{ p.unite }})
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                    <input
                      v-model.number="produit.quantite"
                      type="number"
                      required
                      min="0"
                      placeholder="0"
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Unité</label>
                    <select
                      v-model="produit.unite"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                    >
                      <option value="pièces">Pièces</option>
                      <option value="tonnes">Tonnes</option>
                      <option value="m³">m³</option>
                      <option value="palettes">Palettes</option>
                    </select>
                  </div>
                  <div class="flex items-center">
                    <button
                      v-if="newCommande.produits.length > 1"
                      type="button"
                      @click="removeProduit(index)"
                      class="text-red-600 hover:text-red-800 p-2"
                      title="Supprimer ce produit"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  @click="addProduit"
                  class="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center"
                >
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter un produit
                </button>
              </div>
            </div>


          </form>
        </div>

        <!-- Footer moderne -->
        <div class="modal-footer">
          <div class="modal-footer-content">
            <button
              type="button"
              @click="showModal = false"
              class="btn-cancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="commande-form"
              class="btn-submit"
            >
              {{ editingCommande ? 'Modifier la commande' : 'Créer la commande' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout principal harmonisé */
.commandes-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.commandes-header {
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  border: 1px solid #fb923c;
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

.action-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  font-weight: 600;
  border-radius: 1rem;
  border: 1px solid #ea580c;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.action-button:hover {
  background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.main-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

/* KPI Cards principaux */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
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
  position: relative;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.stat-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.stat-icon-wrapper {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stat-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-yellow {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.stat-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon {
  height: 1.25rem;
  width: 1.25rem;
  color: #ffffff;
}

.stat-details {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.stat-unit {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
  margin-top: 0.25rem;
}

.stat-badge {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* KPI Secondaires */
.secondary-stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .secondary-stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.secondary-stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.secondary-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.secondary-stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.secondary-stat-icon {
  height: 2rem;
  width: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.stat-red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.secondary-stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.secondary-stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-top: 0.25rem;
}

/* Filtres */
.filters-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.filters-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.filters-content {
  padding: 1.5rem;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-icon {
  height: 1.25rem;
  width: 1.25rem;
  color: #6b7280;
}

.filter-input,
.filter-select {
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  border-color: #f97316;
  ring: 2px;
  ring-color: rgba(249, 115, 22, 0.2);
  outline: none;
}

/* Liste des commandes */
.commandes-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.commande-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.commande-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.commande-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .commande-content {
    flex-direction: row;
    align-items: flex-start;
  }
}

.commande-main {
  flex: 1;
}

.commande-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .commande-header {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
}

.commande-icon {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.commande-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.commande-client {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.commande-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.status-badge,
.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
}

/* Actions */
.commande-actions {
  margin-top: 1rem;
}

@media (min-width: 1024px) {
  .commande-actions {
    margin-top: 0;
    margin-left: 1.5rem;
  }
}

.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  min-width: 140px;
}

.action-btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: #2563eb;
}

.action-btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

.action-btn-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  border-color: #ea580c;
}

.action-btn-orange:hover {
  background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
  transform: translateY(-1px);
}

.action-btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border-color: #059669;
}

.action-btn-success:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
}

.action-btn-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: #ffffff;
  border-color: #7c3aed;
}

.action-btn-purple:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-1px);
}

.action-btn-secondary {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #f97316;
  border-color: #e2e8f0;
}

.action-btn-secondary:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #ea580c;
  transform: translateY(-1px);
}

.action-btn-danger {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #ef4444;
  border-color: #e2e8f0;
}

.action-btn-danger:hover {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border-color: #fca5a5;
  transform: translateY(-1px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}

.modal-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 64rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
}

.modal-header {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e2e8f0;
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
  z-index: 10;
}

.modal-header-content {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-icon {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.modal-close {
  color: #9ca3af;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.modal-footer {
  position: sticky;
  bottom: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-top: 1px solid #e2e8f0;
  border-bottom-left-radius: 1.5rem;
  border-bottom-right-radius: 1.5rem;
  z-index: 10;
}

.modal-footer-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (min-width: 640px) {
  .modal-footer-content {
    flex-direction: row;
  }
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  color: #374151;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-color: #9ca3af;
}

.btn-submit {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid #ea580c;
}

.btn-submit:hover {
  background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Responsive */
@media (max-width: 768px) {
  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.75rem;
    line-height: 1.2;
    word-break: break-word;
  }

  .page-subtitle {
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .secondary-stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .secondary-stat-label {
    font-size: 0.75rem;
    line-height: 1.3;
  }

  .secondary-stat-value {
    font-size: 1rem;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .filter-item {
    width: 100%;
  }

  .filter-input,
  .filter-select {
    width: 100%;
    min-width: 0;
  }

  .commande-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .commande-title {
    font-size: 1.125rem;
    line-height: 1.3;
    word-break: break-word;
  }

  .commande-client {
    font-size: 0.8125rem;
    line-height: 1.3;
    word-break: break-word;
  }

  .commande-badges {
    align-self: flex-start;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .status-badge,
  .priority-badge {
    font-size: 0.6875rem;
    padding: 0.1875rem 0.5rem;
  }

  .actions-grid {
    flex-direction: column;
    gap: 0.375rem;
  }

  .action-btn {
    min-width: auto;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 0 0.75rem;
  }

  .header-content {
    padding: 1.25rem 0.75rem;
  }

  .chart-title {
    font-size: 1rem;
    line-height: 1.3;
  }

  .chart-subtitle {
    font-size: 0.8125rem;
    line-height: 1.3;
  }

  .stat-label {
    font-size: 0.8125rem;
    line-height: 1.3;
  }

  .stat-value {
    font-size: 1.625rem;
    line-height: 1.2;
  }

  .stat-unit {
    font-size: 0.6875rem;
    line-height: 1.2;
  }

  .secondary-stat-content {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .modal-container {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }

  .modal-header-content {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.125rem;
    line-height: 1.3;
  }

  .modal-subtitle {
    font-size: 0.8125rem;
    line-height: 1.3;
  }

  .modal-footer-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .commandes-container {
    overflow-x: hidden;
  }

  .main-content {
    padding: 0 0.5rem;
    max-width: 100vw;
  }

  .header-content {
    padding: 1rem 0.5rem;
  }

  .page-title {
    font-size: 1.5rem;
    line-height: 1.2;
  }

  .action-button {
    width: 100%;
    justify-content: center;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }

  .stat-content {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .secondary-stat-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    text-align: left;
  }

  .secondary-stat-label {
    font-size: 0.6875rem;
  }

  .secondary-stat-value {
    font-size: 0.875rem;
  }

  .filters-header {
    padding: 1rem;
  }

  .filters-content {
    padding: 1rem;
  }

  .commande-content {
    padding: 1rem;
  }

  .commande-info {
    width: 100%;
    min-width: 0;
  }

  .commande-title {
    font-size: 1rem;
    word-break: break-all;
    hyphens: auto;
  }

  .commande-client {
    font-size: 0.75rem;
    word-break: break-all;
    hyphens: auto;
  }

  .status-badge,
  .priority-badge {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
    white-space: nowrap;
  }

  .modal-container {
    margin: 0.25rem;
    max-height: calc(100vh - 0.5rem);
    min-width: 0;
  }

  .modal-header-content {
    padding: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .modal-title {
    font-size: 1rem;
    word-break: break-word;
    hyphens: auto;
  }

  .modal-subtitle {
    font-size: 0.75rem;
    word-break: break-word;
  }

  .modal-footer-content {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .btn-cancel,
  .btn-submit {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    width: 100%;
  }

  /* Correction spécifique des débordements */
  * {
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .commande-card {
    min-width: 0;
    max-width: 100%;
  }

  .filters-card {
    min-width: 0;
    max-width: 100%;
  }

  .stat-card {
    min-width: 0;
    max-width: 100%;
  }

  /* Tables et contenus longs */
  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* Éviter les débordements sur les éléments flex */
  .flex {
    min-width: 0;
  }

  .flex > * {
    min-width: 0;
    flex-shrink: 1;
  }
}

/* Corrections supplémentaires pour tous les écrans */
.commande-card,
.stat-card,
.secondary-stat-card,
.filters-card {
  max-width: 100%;
  box-sizing: border-box;
}

.commande-content,
.stat-content,
.secondary-stat-content,
.filters-content {
  max-width: 100%;
  box-sizing: border-box;
}

/* Assurer que les textes longs se cassent correctement */
.commande-title,
.commande-client,
.page-title,
.chart-title,
.modal-title {
  word-break: break-word;
  hyphens: auto;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card,
.secondary-stat-card,
.commande-card,
.filters-card {
  animation: slideIn 0.3s ease-out;
}

.commande-card:nth-child(1) { animation-delay: 0.1s; }
.commande-card:nth-child(2) { animation-delay: 0.2s; }
.commande-card:nth-child(3) { animation-delay: 0.3s; }
.commande-card:nth-child(4) { animation-delay: 0.4s; }
.commande-card:nth-child(5) { animation-delay: 0.5s; }

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-container {
  animation: modalSlideIn 0.3s ease-out;
}
</style>