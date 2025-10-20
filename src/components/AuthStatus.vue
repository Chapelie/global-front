<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      🔐 Statut d'Authentification
    </h3>
    
    <div class="space-y-4">
      <!-- Statut de connexion -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">Utilisateur connecté:</span>
        <span :class="authStatusClass" class="px-3 py-1 rounded-full text-sm font-medium">
          {{ authStatusText }}
        </span>
      </div>

      <!-- Informations utilisateur -->
      <div v-if="isAuthenticated" class="bg-green-50 p-4 rounded-md">
        <div class="text-sm font-medium text-green-800 mb-2">Informations utilisateur:</div>
        <div class="text-sm text-green-700 space-y-1">
          <div><strong>Email:</strong> {{ user?.email }}</div>
          <div><strong>ID:</strong> {{ user?.id }}</div>
          <div><strong>Rôle:</strong> {{ userRole }}</div>
          <div><strong>Connecté depuis:</strong> {{ formatDate(user?.created_at) }}</div>
        </div>
      </div>

      <!-- Actions d'authentification -->
      <div class="pt-4 border-t">
        <div v-if="!isAuthenticated" class="space-y-3">
          <div class="text-sm text-gray-600">
            Vous devez vous connecter pour utiliser Supabase
          </div>
          <div class="flex space-x-3">
            <button
              @click="showLogin = true"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Se connecter
            </button>
            <button
              @click="showRegister = true"
              class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              S'inscrire
            </button>
          </div>
        </div>
        
        <div v-else class="space-y-3">
          <div class="text-sm text-green-600">
            ✅ Authentifié - Supabase disponible
          </div>
          <button
            @click="handleSignOut"
            :disabled="loading"
            class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ loading ? 'Déconnexion...' : 'Se déconnecter' }}
          </button>
        </div>
      </div>

      <!-- Mode de fonctionnement -->
      <div class="pt-4 border-t">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Mode de données:</span>
          <span :class="dataModeClass" class="px-3 py-1 rounded-full text-sm font-medium">
            {{ dataModeText }}
          </span>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ dataModeDescription }}
        </div>
      </div>
    </div>

    <!-- Modales de connexion/inscription -->
    <div v-if="showLogin" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h4 class="text-lg font-semibold mb-4">Connexion</h4>
        <form @submit.prevent="handleSignIn">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="loginForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="votre@email.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                v-model="loginForm.password"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre mot de passe"
              >
            </div>
          </div>
          <div class="flex space-x-3 mt-6">
            <button
              type="button"
              @click="showLogin = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Connexion...' : 'Se connecter' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showRegister" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h4 class="text-lg font-semibold mb-4">Inscription</h4>
        <form @submit.prevent="handleSignUp">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="registerForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="votre@email.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                v-model="registerForm.password"
                type="password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum 6 caractères"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                v-model="registerForm.firstName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre prénom"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                v-model="registerForm.lastName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre nom"
              >
            </div>
          </div>
          <div class="flex space-x-3 mt-6">
            <button
              type="button"
              @click="showRegister = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ loading ? 'Inscription...' : 'S\'inscrire' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../services/auth'
import { useLaravelAuth } from '../services/laravelAuth'

const { user, isAuthenticated, isLoading, signIn, signUp, signOut, initAuth } = useAuth()

const loading = ref(false)
const showLogin = ref(false)
const showRegister = ref(false)

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: ''
})

// Statut d'authentification
const authStatusText = computed(() => {
  if (isLoading.value) return 'Chargement...'
  return isAuthenticated.value ? 'Connecté' : 'Non connecté'
})

const authStatusClass = computed(() => {
  if (isLoading.value) return 'bg-yellow-100 text-yellow-800'
  return isAuthenticated.value 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800'
})

// Rôle utilisateur
const userRole = computed(() => {
  return user.value?.user_metadata?.role || 'secretaire'
})

// Mode de données
const dataModeText = computed(() => {
  if (isAuthenticated.value) return 'Supabase'
  return 'localStorage'
})

const dataModeClass = computed(() => {
  return isAuthenticated.value 
    ? 'bg-blue-100 text-blue-800' 
    : 'bg-yellow-100 text-yellow-800'
})

const dataModeDescription = computed(() => {
  if (isAuthenticated.value) {
    return 'Données sauvegardées dans Supabase avec votre compte'
  }
  return 'Données sauvegardées localement (mode hors ligne)'
})

// Actions
const handleSignIn = async () => {
  loading.value = true
  try {
    await signIn({ email: loginForm.value.email, password: loginForm.value.password })
    showLogin.value = false
    loginForm.value = { email: '', password: '' }
  } catch (error: any) {
    alert(`Erreur de connexion: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const handleSignUp = async () => {
  loading.value = true
  try {
    await signUp({
      name: `${registerForm.value.firstName} ${registerForm.value.lastName}`,
      email: registerForm.value.email,
      password: registerForm.value.password,
      password_confirmation: registerForm.value.password,
      role: 'secretaire'
    })
    showRegister.value = false
    registerForm.value = { email: '', password: '', firstName: '', lastName: '' }
    alert('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.')
  } catch (error: any) {
    alert(`Erreur d'inscription: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const handleSignOut = async () => {
  loading.value = true
  try {
    await signOut()
  } catch (error: any) {
    alert(`Erreur de déconnexion: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

onMounted(async () => {
  console.log('🚀 [AuthStatus] Initialisation de l\'authentification')
  try {
    await initAuth()
    console.log('✅ [AuthStatus] Authentification initialisée')
  } catch (error) {
    console.error('❌ [AuthStatus] Erreur d\'initialisation:', error)
  }
})
</script>
