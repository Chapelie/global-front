<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { storageService } from './services/storage'
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  TruckIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShoppingCartIcon
} from '@heroicons/vue/24/outline'

const sidebarOpen = ref(false)
const route = useRoute()
const router = useRouter()

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Commandes', href: '/commandes', icon: ShoppingCartIcon },
  { name: 'Production', href: '/production', icon: CubeIcon },
  { name: 'Livraison', href: '/livraison', icon: TruckIcon },
  { name: 'Stock', href: '/stock', icon: ArchiveBoxIcon },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Personnel', href: '/personnel', icon: UsersIcon },
  { name: 'Analyses', href: '/analyses', icon: ChartBarIcon },
  { name: 'Paramètres', href: '/parametres', icon: Cog6ToothIcon },
]

const currentPage = computed(() => {
  return navigation.find(item => item.href === route.path)?.name || 'Dashboard'
})

const currentUser = computed(() => storageService.getCurrentUser())

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleLogout = () => {
  storageService.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar pour mobile -->
    <div v-if="sidebarOpen" class="relative z-50 lg:hidden">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" @click="toggleSidebar"></div>
      
      <div class="fixed inset-0 z-40 flex">
        <div class="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div class="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              class="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              @click="toggleSidebar"
            >
              <XMarkIcon class="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div class="flex flex-shrink-0 items-center px-4 py-6">
            <div class="flex items-center">
              <img src="/logo.jpg" alt="Global Star Distribution" class="h-8 w-8 rounded-lg object-cover">
              <span class="ml-3 text-xl font-semibold text-gray-900">Global Star Distribution</span>
            </div>
          </div>
          
          <nav class="mt-6 flex-1 space-y-1 px-2">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="group flex items-center px-2 py-2 text-base font-medium rounded-lg transition-colors"
              :class="[
                route.path === item.href
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              ]"
              @click="sidebarOpen = false"
            >
              <component
                :is="item.icon"
                class="mr-4 h-6 w-6 flex-shrink-0"
                :class="[
                  route.path === item.href ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                ]"
              />
              {{ item.name }}
            </router-link>
          </nav>
        </div>
      </div>
    </div>

    <!-- Sidebar pour desktop -->
    <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200">
        <div class="flex items-center flex-shrink-0 px-4 py-6">
          <div class="flex items-center">
            <img src="/logo.jpg" alt="Global Star Distribution" class="h-8 w-8 rounded-lg object-cover">
            <span class="ml-3 text-xl font-semibold text-gray-900">Global Star Distribution</span>
          </div>
        </div>
        
        <nav class="mt-6 flex-1 space-y-1 px-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="[
              route.path === item.href
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <component
              :is="item.icon"
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="[
                route.path === item.href ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
              ]"
            />
            {{ item.name }}
          </router-link>
        </nav>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="lg:pl-64">
      <!-- Header sticky -->
      <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          @click="toggleSidebar"
        >
          <Bars3Icon class="h-6 w-6" />
        </button>

        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div class="flex flex-1 items-center">
            <h1 class="text-lg font-semibold text-gray-900">{{ currentPage }}</h1>
          </div>
          
          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <!-- Notifications -->
            <button type="button" class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
              <span class="sr-only">Voir les notifications</span>
              <div class="relative">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <span class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
              </div>
            </button>

            <!-- Profil -->
            <div class="flex items-center gap-x-4">
              <div class="flex items-center space-x-3">
                <div class="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span class="text-sm font-medium text-white">{{ currentUser?.username?.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="hidden sm:block">
                  <p class="text-sm font-medium text-gray-900">{{ currentUser?.username }}</p>
                  <p class="text-xs text-gray-500">{{ currentUser?.role }}</p>
                </div>
              </div>
              <button
                @click="handleLogout"
                class="text-gray-400 hover:text-gray-600"
                title="Déconnexion"
              >
                <ArrowRightOnRectangleIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu de la page -->
      <main class="py-6">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Styles personnalisés pour l'application */
</style>
