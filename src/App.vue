<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { storageService } from './services/storage'
import { useLogo } from './composables/useLogo'
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
const { logo, getLogoAlt, getLogoClass } = useLogo()

// Pages qui ne nécessitent pas de sidebar/navbar
const authPages = ['/login', '/register']
const isAuthPage = computed(() => authPages.includes(route.path))

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
  <!-- Pages d'authentification (login/register) - Layout simple -->
  <div v-if="isAuthPage" class="min-h-screen bg-gray-50">
    <RouterView />
  </div>

  <!-- Pages principales - Layout avec sidebar/navbar -->
  <div v-else class="min-h-screen bg-gray-50">
    <!-- Sidebar pour mobile -->
    <div v-if="sidebarOpen" class="relative z-50 lg:hidden">
      <div class="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm" @click="toggleSidebar"></div>

      <div class="fixed inset-0 z-40 flex">
        <div class="relative flex w-full max-w-sm flex-1 flex-col bg-gradient-to-b from-gray-50 to-white shadow-2xl">
          <div class="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              class="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all hover:bg-opacity-30"
              @click="toggleSidebar"
            >
              <XMarkIcon class="h-6 w-6 text-white" />
            </button>
          </div>

          <!-- Logo mobile -->
          <div class="flex flex-shrink-0 items-center px-6 py-8 bg-white border-b border-gray-100">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <img :src="logo" :alt="getLogoAlt()" :class="getLogoClass('small')">
              </div>
              <div class="ml-3">
                <h1 class="text-lg font-bold text-gray-900">Global Star</h1>
                <p class="text-sm text-gray-600">Distribution</p>
              </div>
            </div>
          </div>

          <!-- Navigation mobile -->
          <nav class="mt-6 flex-1 space-y-2 px-4">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200"
              :class="[
                route.path === item.href
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white hover:shadow-md'
              ]"
              @click="sidebarOpen = false"
            >
              <component
                :is="item.icon"
                class="mr-4 h-6 w-6 flex-shrink-0"
                :class="[
                  route.path === item.href ? 'text-white' : 'text-gray-500 group-hover:text-orange-500'
                ]"
              />
              {{ item.name }}
            </router-link>
          </nav>

          <!-- Section utilisateur mobile -->
          <div class="p-4 border-t border-gray-100 bg-white">
            <div class="flex items-center p-3 rounded-xl bg-gray-50">
              <div class="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <span class="text-sm font-bold text-white">{{ currentUser?.username?.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-semibold text-gray-900">{{ currentUser?.username }}</p>
                <p class="text-xs text-gray-600">{{ currentUser?.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar pour desktop -->
    <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
      <div class="flex flex-col flex-grow bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 shadow-lg">
        <!-- Logo et titre -->
        <div class="flex items-center flex-shrink-0 px-6 py-8 bg-white border-b border-gray-100">
          <div class="flex items-center">
            <div class="h-10 w-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <img :src="logo" :alt="getLogoAlt()" :class="getLogoClass('small')">
            </div>
            <div class="ml-3">
              <h1 class="text-lg font-bold text-gray-900">Global Star</h1>
              <p class="text-sm text-gray-600">Distribution</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="mt-6 flex-1 space-y-2 px-4">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden"
            :class="[
              route.path === item.href
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105'
                : 'text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-102'
            ]"
          >
            <component
              :is="item.icon"
              class="mr-4 h-5 w-5 flex-shrink-0 transition-colors"
              :class="[
                route.path === item.href ? 'text-white' : 'text-gray-500 group-hover:text-orange-500'
              ]"
            />
            <span class="transition-colors">{{ item.name }}</span>

            <!-- Indicateur actif -->
            <div v-if="route.path === item.href"
                 class="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg">
            </div>
          </router-link>
        </nav>

        <!-- Section utilisateur -->
        <div class="p-4 border-t border-gray-100 bg-white">
          <div class="flex items-center p-3 rounded-xl bg-gray-50">
            <div class="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <span class="text-sm font-bold text-white">{{ currentUser?.username?.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-semibold text-gray-900">{{ currentUser?.username }}</p>
              <p class="text-xs text-gray-600">{{ currentUser?.role }}</p>
            </div>
            <button
              @click="handleLogout"
              class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
              title="Déconnexion"
            >
              <ArrowRightOnRectangleIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="lg:pl-72">
      <!-- Header sticky amélioré -->
      <div class="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-xl px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          class="-m-2.5 p-2.5 text-gray-700 hover:text-orange-600 transition-colors lg:hidden"
          @click="toggleSidebar"
        >
          <Bars3Icon class="h-6 w-6" />
        </button>

        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div class="flex flex-1 items-center">
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ currentPage }}</h1>
              <p class="text-sm text-gray-600">{{ new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <!-- Notifications améliorées -->
            <button type="button" class="relative -m-2.5 p-2.5 text-gray-400 hover:text-orange-500 transition-colors hover:bg-orange-50 rounded-xl">
              <span class="sr-only">Voir les notifications</span>
              <div class="relative">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <span class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg animate-pulse"></span>
              </div>
            </button>

            <!-- Profil amélioré -->
            <div class="flex items-center gap-x-4">
              <div class="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div class="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <span class="text-sm font-bold text-white">{{ currentUser?.username?.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="hidden sm:block">
                  <p class="text-sm font-semibold text-gray-900">{{ currentUser?.username }}</p>
                  <p class="text-xs text-gray-600">{{ currentUser?.role }}</p>
                </div>
              </div>
              <button
                @click="handleLogout"
                class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
                title="Déconnexion"
              >
                <ArrowRightOnRectangleIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu de la page -->
      <main class="py-8">
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
