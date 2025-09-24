<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  WifiIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

// État local pour éviter les dépendances circulaires
const isOnline = ref(navigator.onLine)
const isSyncing = ref(false)
const lastSync = ref<Date | null>(null)
const pendingChanges = ref(0)
const syncErrors = ref<string[]>([])

// Détection de la connexion
onMounted(() => {
  window.addEventListener('online', () => {
    isOnline.value = true
  })
  
  window.addEventListener('offline', () => {
    isOnline.value = false
  })
})

const syncStatus = computed(() => {
  if (!isOnline.value) {
    return {
      icon: ExclamationTriangleIcon,
      text: 'Hors ligne',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  }

  if (isSyncing.value) {
    return {
      icon: ArrowPathIcon,
      text: 'Synchronisation...',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  }

  if (syncErrors.value.length > 0) {
    return {
      icon: ExclamationTriangleIcon,
      text: `${syncErrors.value.length} erreur(s)`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  }

  if (pendingChanges.value > 0) {
    return {
      icon: ClockIcon,
      text: `${pendingChanges.value} en attente`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  }

  return {
    icon: CheckCircleIcon,
    text: 'Synchronisé',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
})

const formatLastSync = computed(() => {
  if (!lastSync.value) return 'Jamais'
  
  const now = new Date()
  const diff = now.getTime() - lastSync.value.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  
  const days = Math.floor(hours / 24)
  return `Il y a ${days} jour(s)`
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <!-- Indicateur de statut -->
    <div 
      :class="[
        'flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium',
        syncStatus.bgColor,
        syncStatus.borderColor,
        syncStatus.color
      ]"
    >
      <component 
        :is="syncStatus.icon" 
        :class="[
          'h-4 w-4',
          isSyncing ? 'animate-spin' : ''
        ]"
      />
      <span>{{ syncStatus.text }}</span>
    </div>

    <!-- Détails de synchronisation -->
    <div v-if="lastSync || pendingChanges > 0" class="text-xs text-gray-500">
      <div v-if="lastSync">
        Dernière sync: {{ formatLastSync }}
      </div>
      <div v-if="pendingChanges > 0">
        {{ pendingChanges }} changement(s) en attente
      </div>
    </div>

    <!-- Erreurs de synchronisation -->
    <div v-if="syncErrors.length > 0" class="text-xs text-yellow-600">
      <div v-for="error in syncErrors.slice(0, 2)" :key="error" class="truncate max-w-32">
        {{ error }}
      </div>
      <div v-if="syncErrors.length > 2" class="text-gray-500">
        +{{ syncErrors.length - 2 }} autres...
      </div>
    </div>
  </div>
</template>
