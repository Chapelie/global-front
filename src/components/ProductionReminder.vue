<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useLaravelApi } from '../services/laravelApiService'
import { useLaravelAuth } from '../services/laravelAuth'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/vue/24/outline'

interface ProductionReminder {
  id: string
  date: string
  message: string
  type: 'warning' | 'info' | 'success'
  dismissed: boolean
  createdAt: string
}

interface ProductionData {
  id?: number
  date: string
  statut: string
  heure_debut?: string
  heure_fin?: string
  user_id: number
  articles_produits?: any[]
}

const { getProductionsDuJour, addProduction, updateProduction } = useLaravelApi()
const { currentUser } = useLaravelAuth()

// État réactif
const showReminder = ref(false)
const productionDuJour = ref<ProductionData[]>([])
const isLoading = ref(false)
const reminderData = ref<ProductionReminder | null>(null)

// Computed pour vérifier si la production du jour est renseignée
const productionRenseignee = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return productionDuJour.value.some(p => p.date === today && p.statut !== 'en_attente')
})

const hasProductionToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return productionDuJour.value.some(p => p.date === today)
})

// Charger les données au montage
onMounted(async () => {
  await loadProductionDuJour()
  checkProductionReminder()
})

// Charger la production du jour
const loadProductionDuJour = async () => {
  try {
    isLoading.value = true
    productionDuJour.value = await getProductionsDuJour()
  } catch (error) {
    console.error('Erreur lors du chargement de la production du jour:', error)
  } finally {
    isLoading.value = false
  }
}

// Vérifier si un rappel doit être affiché
const checkProductionReminder = () => {
  const today = new Date().toISOString().split('T')[0]
  const reminderKey = `production_reminder_${today}`
  
  // Vérifier si le rappel a déjà été ignoré aujourd'hui
  const dismissedToday = localStorage.getItem(reminderKey)
  
  if (!dismissedToday && !productionRenseignee.value) {
    showReminder.value = true
    reminderData.value = {
      id: reminderKey,
      date: today,
      message: hasProductionToday.value 
        ? 'La production du jour n\'est pas encore finalisée. Veuillez vérifier et compléter les informations.'
        : 'Aucune production n\'a été renseignée pour aujourd\'hui. Souhaitez-vous ajouter une production ?',
      type: hasProductionToday.value ? 'warning' : 'info',
      dismissed: false,
      createdAt: new Date().toISOString()
    }
  }
}

// Fermer le rappel
const dismissReminder = () => {
  if (reminderData.value) {
    localStorage.setItem(reminderData.value.id, 'true')
    showReminder.value = false
    reminderData.value = null
  }
}

// Ignorer le rappel pour aujourd'hui
const dismissForToday = () => {
  const today = new Date().toISOString().split('T')[0]
  const reminderKey = `production_reminder_${today}`
  localStorage.setItem(reminderKey, 'true')
  showReminder.value = false
  reminderData.value = null
}

// Aller à la page de production
const goToProduction = () => {
  window.location.href = '/production'
}

// Ajouter une production rapide
const addQuickProduction = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const newProduction = {
      date: today,
      statut: 'en_attente',
      user_id: currentUser.value?.id || 1
    }
    
    await addProduction(newProduction)
    await loadProductionDuJour()
    dismissReminder()
    
    // Rediriger vers la page de production
    setTimeout(() => {
      window.location.href = '/production'
    }, 1000)
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la production:', error)
    alert('Erreur lors de l\'ajout de la production')
  }
}

// Formater la date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Obtenir l'icône selon le type
const getIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return ExclamationTriangleIcon
    case 'info':
      return ClockIcon
    case 'success':
      return CheckCircleIcon
    default:
      return ClockIcon
  }
}

// Obtenir la couleur selon le type
const getColor = (type: string) => {
  switch (type) {
    case 'warning':
      return 'text-orange-600'
    case 'info':
      return 'text-blue-600'
    case 'success':
      return 'text-green-600'
    default:
      return 'text-blue-600'
  }
}

// Obtenir la couleur de fond selon le type
const getBgColor = (type: string) => {
  switch (type) {
    case 'warning':
      return 'bg-orange-50 border-orange-200'
    case 'info':
      return 'bg-blue-50 border-blue-200'
    case 'success':
      return 'bg-green-50 border-green-200'
    default:
      return 'bg-blue-50 border-blue-200'
  }
}
</script>

<template>
  <!-- Rappel de production du jour -->
  <div
    v-if="showReminder && reminderData"
    class="fixed top-4 right-4 z-50 max-w-md w-full mx-4"
  >
    <div
      :class="[
        'rounded-xl shadow-lg border-2 p-4 transform transition-all duration-300 ease-in-out',
        getBgColor(reminderData.type)
      ]"
    >
      <!-- Header du rappel -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center">
          <component
            :is="getIcon(reminderData.type)"
            :class="['h-6 w-6 mr-2', getColor(reminderData.type)]"
          />
          <h3 class="text-lg font-semibold text-gray-900">
            {{ reminderData.type === 'warning' ? 'Production en cours' : 'Rappel Production' }}
          </h3>
        </div>
        <button
          @click="dismissReminder"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- Contenu du rappel -->
      <div class="mb-4">
        <p class="text-sm text-gray-700 mb-2">
          {{ reminderData.message }}
        </p>
        <p class="text-xs text-gray-500">
          {{ formatDate(reminderData.date) }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-2">
        <button
          @click="goToProduction"
          class="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
        >
          <ChartBarIcon class="h-4 w-4 inline mr-2" />
          Aller à la Production
        </button>
        
        <button
          v-if="!hasProductionToday"
          @click="addQuickProduction"
          class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
        >
          <PlusIcon class="h-4 w-4 inline mr-2" />
          Ajouter Production
        </button>
        
        <button
          @click="dismissForToday"
          class="px-4 py-2 text-gray-600 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Ignorer aujourd'hui
        </button>
      </div>

      <!-- Indicateur de progression -->
      <div class="mt-3 pt-3 border-t border-gray-200">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>Production du jour</span>
          <span :class="productionRenseignee ? 'text-green-600' : 'text-orange-600'">
            {{ productionRenseignee ? 'Complétée' : 'En attente' }}
          </span>
        </div>
        <div class="mt-1 w-full bg-gray-200 rounded-full h-1.5">
          <div
            :class="[
              'h-1.5 rounded-full transition-all duration-300',
              productionRenseignee ? 'bg-green-500 w-full' : 'bg-orange-500 w-1/3'
            ]"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation d'entrée */
.fixed {
  animation: slideInFromRight 0.5s ease-out;
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .fixed {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style>




