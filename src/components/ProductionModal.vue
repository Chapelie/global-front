<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storageService, type Article, type EtatProductionArticle } from '../services/storage'
import { 
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  article?: Article
  visible: boolean
}>()



const emit = defineEmits<{
  close: []
}>()

const etatsProduction = ref<EtatProductionArticle[]>([])
const showNewEtatModal = ref(false)
const editingEtat = ref<EtatProductionArticle | null>(null)

const newEtat = ref({
  articleId: 0, // ID de l'article sélectionné
  quantitePlanifiee: 0,
  quantiteProduite: 0,
  statut: 'planifie' as 'planifie' | 'en_cours' | 'termine' | 'annule',
  operateur: '',
  machine: '',
  qualiteProduite: 'excellente' as 'excellente' | 'bonne' | 'moyenne' | 'defectueuse',
  notes: '',
  tempsEffectif: 0,
  rendement: 100
})

const statuts = [
  { value: 'planifie', label: 'Planifié', color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
  { value: 'en_cours', label: 'En cours', color: 'bg-orange-100 text-orange-800', icon: PlayIcon },
  { value: 'termine', label: 'Terminé', color: 'bg-green-100 text-green-800', icon: CheckIcon },
  { value: 'annule', label: 'Annulé', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
]

const qualites = [
  { value: 'excellente', label: 'Excellente', color: 'bg-green-100 text-green-800' },
  { value: 'bonne', label: 'Bonne', color: 'bg-blue-100 text-blue-800' },
  { value: 'moyenne', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'defectueuse', label: 'Défectueuse', color: 'bg-red-100 text-red-800' }
]

onMounted(() => {
  if (props.visible) {
    loadEtatsProduction()
  }
})

const loadEtatsProduction = () => {
  // Charger les états de production de tous les articles ou de l'article spécifique
  if (props.article) {
    etatsProduction.value = storageService.getEtatsProductionArticle(props.article.id)
  } else {
    // Si pas d'article spécifique, charger tous les états
    const articles = storageService.getStock()
    const tousLesEtats: EtatProductionArticle[] = []
    const etatsIds = new Set() // Pour éviter les doublons
    
    articles.forEach(article => {
      const etats = storageService.getEtatsProductionArticle(article.id)
      etats.forEach(etat => {
        if (!etatsIds.has(etat.id)) {
          etatsIds.add(etat.id)
          tousLesEtats.push(etat)
        }
      })
    })
    
    etatsProduction.value = tousLesEtats
  }
}

const resetForm = () => {
  newEtat.value = {
    articleId: props.article?.id || 0,
    quantitePlanifiee: props.article?.capaciteProduction || 0,
    quantiteProduite: 0,
    statut: 'planifie',
    operateur: '',
    machine: '',
    qualiteProduite: 'excellente',
    notes: '',
    tempsEffectif: props.article?.tempsProduction || 0,
    rendement: 100
  }
}

const openNewEtatModal = () => {
  editingEtat.value = null
  resetForm()
  showNewEtatModal.value = true
}

const editEtat = (etat: EtatProductionArticle) => {
  editingEtat.value = etat
  newEtat.value = { 
    articleId: etat.articleId,
    quantitePlanifiee: etat.quantitePlanifiee,
    quantiteProduite: etat.quantiteProduite,
    statut: etat.statut,
    operateur: etat.operateur || '',
    machine: etat.machine || '',
    qualiteProduite: etat.qualiteProduite,
    notes: etat.notes || '',
    tempsEffectif: etat.tempsEffectif,
    rendement: etat.rendement
  }
  showNewEtatModal.value = true
}

const saveEtat = () => {
  if (!newEtat.value.articleId) {
    alert('Veuillez sélectionner un article')
    return
  }

  if (newEtat.value.quantitePlanifiee <= 0) {
    alert('La quantité planifiée doit être supérieure à 0')
    return
  }

  if (newEtat.value.quantiteProduite < 0) {
    alert('La quantité produite ne peut pas être négative')
    return
  }

  if (newEtat.value.rendement < 0 || newEtat.value.rendement > 100) {
    alert('Le rendement doit être entre 0 et 100%')
    return
  }

  const etatData = {
    ...newEtat.value,
    date: new Date().toISOString().split('T')[0]
  }
  
  try {
    if (editingEtat.value) {
      storageService.mettreAJourEtatProduction(editingEtat.value.articleId, editingEtat.value.id, etatData)
    } else {
      storageService.ajouterEtatProduction(etatData)
    }
    
    loadEtatsProduction()
    showNewEtatModal.value = false
  } catch (error) {
    alert(`Erreur lors de la sauvegarde: ${error}`)
  }
}

const demarrerProduction = (etat: EtatProductionArticle) => {
  if (etat.statut === 'planifie') {
    storageService.mettreAJourEtatProduction(etat.articleId, etat.id, {
      statut: 'en_cours',
      heureDebut: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    })
    loadEtatsProduction()
  }
}

const terminerProduction = (etat: EtatProductionArticle) => {
  if (etat.statut === 'en_cours') {
    storageService.mettreAJourEtatProduction(etat.articleId, etat.id, {
      statut: 'termine',
      heureFin: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    })
    loadEtatsProduction()
  }
}

const annulerProduction = (etat: EtatProductionArticle) => {
  if (etat.statut === 'planifie' || etat.statut === 'en_cours') {
    storageService.mettreAJourEtatProduction(etat.articleId, etat.id, {
      statut: 'annule'
    })
    loadEtatsProduction()
  }
}

const getStatutInfo = (statut: string) => {
  return statuts.find(s => s.value === statut) || statuts[0]
}

const getQualiteInfo = (qualite: string) => {
  return qualites.find(q => q.value === qualite) || qualites[0]
}

const etatsFiltres = computed(() => {
  return etatsProduction.value.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const statistiques = computed(() => {
  if (props.article) {
    return storageService.getStatistiquesProductionArticle(props.article.id, 'mois')
  } else {
    // Statistiques générales pour tous les articles
    const articles = storageService.getStock()
    const articlesActifs = articles.filter(a => a.actif)
    
    const totalProduit = articlesActifs.reduce((total, article) => {
      const stats = storageService.getStatistiquesProductionArticle(article.id, 'mois')
      return total + stats.totalProduit
    }, 0)
    
    const valeurStock = articles.reduce((total, article) => {
      return total + (article.stock * article.prix)
    }, 0)
    
    const rendementMoyen = articlesActifs.length > 0 ? 
      articlesActifs.reduce((total, article) => {
        const stats = storageService.getStatistiquesProductionArticle(article.id, 'mois')
        return total + stats.rendementMoyen
      }, 0) / articlesActifs.length : 0
    
    return {
      totalProduit,
      moyenneQuotidienne: totalProduit / 30,
      rendementMoyen,
      tempsMoyen: 0,
      coutTotal: 0
    }
  }
})

// Obtenir tous les articles disponibles pour la production
const articlesDisponibles = computed(() => {
  return storageService.getStock().filter(article => article.actif)
})

// Obtenir l'article sélectionné
const articleSelectionne = computed(() => {
  return articlesDisponibles.value.find(a => a.id === newEtat.value.articleId)
})

// Mettre à jour les valeurs par défaut quand l'article change
const onArticleChange = () => {
  if (articleSelectionne.value) {
    newEtat.value.quantitePlanifiee = articleSelectionne.value.capaciteProduction
    newEtat.value.tempsEffectif = articleSelectionne.value.tempsProduction
  } else {
    newEtat.value.quantitePlanifiee = 0
    newEtat.value.tempsEffectif = 0
  }
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- En-tête -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">
              {{ article ? `Production - ${article.nom}` : 'Nouvelle Production' }}
            </h3>
            <p class="text-sm text-gray-600">
              {{ article ? `${article.categorie} - ${article.typeProduction}` : 'Sélectionnez un article à produire' }}
            </p>
          </div>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p class="text-sm font-medium text-blue-600">Total produit (mois)</p>
            <p class="text-2xl font-bold text-blue-900">
              {{ statistiques.totalProduit || 0 }} {{ articleSelectionne?.unite || 'unités' }}
            </p>
          </div>
          <div class="bg-green-50 rounded-lg p-4 border border-green-200">
            <p class="text-sm font-medium text-green-600">Moyenne/jour</p>
            <p class="text-2xl font-bold text-green-900">
              {{ Math.round(statistiques.moyenneQuotidienne || 0) }} {{ articleSelectionne?.unite || 'unités' }}
            </p>
          </div>
          <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p class="text-sm font-medium text-orange-600">Rendement</p>
            <p class="text-2xl font-bold text-orange-900">{{ Math.round(statistiques.rendementMoyen || 0) }}%</p>
          </div>
          <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p class="text-sm font-medium text-purple-600">Coût total</p>
            <p class="text-2xl font-bold text-purple-900">{{ (statistiques.coutTotal || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center mb-6">
          <h4 class="text-lg font-medium text-gray-900">
            {{ article ? 'États de production' : 'Tous les états de production' }}
          </h4>
          <button
            @click="openNewEtatModal"
            class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Nouvel état
          </button>
        </div>

        <!-- Liste des états -->
        <div v-if="etatsFiltres.length === 0" class="text-center py-8 text-gray-500">
          <p class="text-lg">Aucun état de production trouvé</p>
          <p class="text-sm">Commencez par créer un nouvel état de production</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="etat in etatsFiltres" 
            :key="etat.id"
            class="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatutInfo(etat.statut).color"
                >
                  <component :is="getStatutInfo(etat.statut).icon" class="h-3 w-3 mr-1" />
                  {{ getStatutInfo(etat.statut).label }}
                </span>
                <span class="text-sm text-gray-600">{{ etat.date }}</span>
                <span v-if="!article" class="text-sm font-medium text-gray-800">
                  {{ articlesDisponibles.find(a => a.id === etat.articleId)?.nom }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  v-if="etat.statut === 'planifie'"
                  @click="demarrerProduction(etat)"
                  class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                >
                  <PlayIcon class="h-3 w-3 mr-1 inline" />
                  Démarrer
                </button>
                <button
                  v-if="etat.statut === 'en_cours'"
                  @click="terminerProduction(etat)"
                  class="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                >
                  <CheckIcon class="h-3 w-3 mr-1 inline" />
                  Terminer
                </button>
                <button
                  v-if="etat.statut === 'planifie' || etat.statut === 'en_cours'"
                  @click="annulerProduction(etat)"
                  class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon class="h-3 w-3 mr-1 inline" />
                  Annuler
                </button>
                <button
                  @click="editEtat(etat)"
                  class="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Planifié:</span>
                <span class="font-medium text-gray-900 ml-1">
                  {{ etat.quantitePlanifiee }} {{ articlesDisponibles.find(a => a.id === etat.articleId)?.unite || 'unités' }}
                </span>
              </div>
              <div>
                <span class="text-gray-600">Produit:</span>
                <span class="font-medium text-gray-900 ml-1">
                  {{ etat.quantiteProduite }} {{ articlesDisponibles.find(a => a.id === etat.articleId)?.unite || 'unités' }}
                </span>
              </div>
              <div>
                <span class="text-gray-600">Rendement:</span>
                <span class="font-medium text-gray-900 ml-1">{{ etat.rendement }}%</span>
              </div>
              <div>
                <span class="text-gray-600">Temps:</span>
                <span class="font-medium text-gray-900 ml-1">{{ etat.tempsEffectif }} min</span>
              </div>
            </div>

            <div v-if="etat.operateur || etat.machine || etat.notes" class="mt-3 pt-3 border-t border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div v-if="etat.operateur">
                  <span class="text-gray-600">Opérateur:</span>
                  <span class="font-medium text-gray-900 ml-1">{{ etat.operateur }}</span>
                </div>
                <div v-if="etat.machine">
                  <span class="text-gray-600">Machine:</span>
                  <span class="font-medium text-gray-900 ml-1">{{ etat.machine }}</span>
                </div>
                <div v-if="etat.notes">
                  <span class="text-gray-600">Notes:</span>
                  <span class="font-medium text-gray-900 ml-1">{{ etat.notes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal pour ajouter/modifier un état -->
        <div v-if="showNewEtatModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">
                {{ editingEtat ? 'Modifier l\'état' : 'Nouvel état de production' }}
              </h4>
              
              <form @submit.prevent="saveEtat" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Article à produire</label>
                    <select
                      v-model="newEtat.articleId"
                      @change="onArticleChange"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="">Sélectionner un article</option>
                      <option 
                        v-for="article in articlesDisponibles" 
                        :key="article.id" 
                        :value="article.id"
                      >
                        {{ article.nom }} ({{ article.typeProduction }})
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Quantité planifiée</label>
                    <input
                      v-model.number="newEtat.quantitePlanifiee"
                      type="number"
                      required
                      min="0"
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Quantité produite</label>
                    <input
                      v-model.number="newEtat.quantiteProduite"
                      type="number"
                      required
                      min="0"
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      v-model="newEtat.statut"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option v-for="statut in statuts" :key="statut.value" :value="statut.value">
                        {{ statut.label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Opérateur</label>
                    <input
                      v-model="newEtat.operateur"
                      type="text"
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Machine</label>
                    <input
                      v-model="newEtat.machine"
                      type="text"
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Qualité produite</label>
                    <select
                      v-model="newEtat.qualiteProduite"
                      required
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option v-for="qualite in qualites" :key="qualite.value" :value="qualite.value">
                        {{ qualite.label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Temps effectif (min)</label>
                    <input
                      v-model.number="newEtat.tempsEffectif"
                      type="number"
                      required
                      min="0"
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Rendement (%)</label>
                    <input
                      v-model.number="newEtat.rendement"
                      type="number"
                      required
                      min="0"
                      max="100"
                      class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    v-model="newEtat.notes"
                    rows="3"
                    class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  ></textarea>
                </div>

                <div class="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    @click="showNewEtatModal = false"
                    class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {{ editingEtat ? 'Modifier' : 'Créer' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>
