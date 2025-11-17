<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      type="button"
      class="relative -m-2.5 p-2.5 text-gray-400 hover:text-orange-500 transition-colors hover:bg-orange-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
      :class="{ 'text-orange-500 bg-orange-50': isDropdownOpen }"
    >
      <span class="sr-only">Voir les notifications</span>
      <BellIcon class="h-6 w-6" />
      
      <!-- Badge du nombre de notifications non lues -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown des notifications -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isDropdownOpen"
        v-click-outside="closeDropdown"
        class="absolute right-0 z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[600px] overflow-hidden flex flex-col"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">Notifications</h3>
          <div class="flex items-center gap-2">
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="text-sm text-orange-100 hover:text-white transition-colors"
              :disabled="loading"
            >
              Tout marquer comme lu
            </button>
            <button
              @click="closeDropdown"
              class="text-orange-200 hover:text-white transition-colors"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Liste des notifications -->
        <div class="overflow-y-auto flex-1">
          <div v-if="loading" class="p-4 text-center text-gray-500">
            Chargement...
          </div>
          <div v-else-if="notifications.length === 0" class="p-8 text-center">
            <BellSlashIcon class="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">Aucune notification</p>
          </div>
          <div v-else class="divide-y divide-gray-200">
            <button
              v-for="notification in notifications"
              :key="notification.id"
              @click="handleNotificationClick(notification)"
              class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              :class="{
                'bg-orange-50': !notification.read_at,
                'bg-white': notification.read_at
              }"
            >
              <div class="flex items-start gap-3">
                <!-- Icône du type -->
                <div
                  class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                  :class="getTypeIconClass(notification.type)"
                >
                  <component :is="getTypeIcon(notification.type)" class="h-5 w-5 text-white" />
                </div>

                <!-- Contenu -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <p
                      class="text-sm font-medium text-gray-900"
                      :class="{ 'font-semibold': !notification.read_at }"
                    >
                      {{ notification.title }}
                    </p>
                    <button
                      v-if="!notification.read_at"
                      @click.stop="markAsRead(notification.id)"
                      class="flex-shrink-0 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      <CheckIcon class="h-4 w-4" />
                    </button>
                  </div>
                  <p class="mt-1 text-sm text-gray-600 line-clamp-2">
                    {{ notification.message }}
                  </p>
                  <p class="mt-1 text-xs text-gray-400">
                    {{ formatDate(notification.created_at) }}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="notifications.length > 0" class="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <button
            @click="loadAllNotifications"
            class="w-full text-sm text-center text-orange-600 hover:text-orange-700 font-medium"
          >
            Voir toutes les notifications
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  BellIcon,
  BellSlashIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ShoppingCartIcon,
  TruckIcon,
  CogIcon,
  ArchiveBoxIcon
} from '@heroicons/vue/24/outline'
import { useNotificationService, type Notification } from '../services/notificationService'

const router = useRouter()
const notificationService = useNotificationService()

const isDropdownOpen = ref(false)
const loading = ref(false)

const notifications = computed(() => notificationService.getNotifications().value.slice(0, 10)) // Limiter à 10 dans le dropdown
const unreadCount = computed(() => notificationService.getUnreadCount().value)

// Directive pour fermer le dropdown en cliquant à l'extérieur
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    loadNotifications()
  }
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const loadNotifications = async () => {
  loading.value = true
  try {
    await notificationService.loadNotifications()
  } finally {
    loading.value = false
  }
}

const loadAllNotifications = () => {
  closeDropdown()
  router.push('/notifications')
}

const markAsRead = async (id: number) => {
  await notificationService.markAsRead(id)
}

const markAllAsRead = async () => {
  loading.value = true
  try {
    await notificationService.markAllAsRead()
  } finally {
    loading.value = false
  }
}

const handleNotificationClick = async (notification: Notification) => {
  // Marquer comme lue si ce n'est pas déjà fait
  if (!notification.read_at) {
    await markAsRead(notification.id)
  }

  // Naviguer vers l'URL d'action si disponible
  if (notification.action_url) {
    closeDropdown()
    router.push(notification.action_url)
  }
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    info: InformationCircleIcon,
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: ExclamationCircleIcon,
    order: ShoppingCartIcon,
    delivery: TruckIcon,
    production: CogIcon,
    inventory: ArchiveBoxIcon,
    stock_alert: ExclamationTriangleIcon
  }
  return icons[type] || BellIcon
}

const getTypeIconClass = (type: string) => {
  const classes: Record<string, string> = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    order: 'bg-purple-500',
    delivery: 'bg-indigo-500',
    production: 'bg-blue-500',
    inventory: 'bg-gray-500',
    stock_alert: 'bg-orange-500'
  }
  return classes[type] || 'bg-gray-500'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await notificationService.initialize()
  await loadNotifications()
})

onUnmounted(() => {
  notificationService.cleanup()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>









