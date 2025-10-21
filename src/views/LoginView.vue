<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLaravelAuth } from '../services/laravelAuth'
import { useLogo } from '../composables/useLogo'
import { CubeIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const { logo, getLogoAlt, getLogoClass } = useLogo()
const { signIn, isLoading, isAuthenticated } = useLaravelAuth()

const phone = ref('')
const password = ref('')
const error = ref('')
const success = ref('')

const handleLogin = async () => {
  if (!phone.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  error.value = ''
  success.value = ''

  try {
    console.log('🔐 [LoginView] Tentative de connexion')
    console.log('📱 [LoginView] Téléphone:', phone.value)

    const result = await signIn({ phone: phone.value, password: password.value })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la connexion')
    }

    console.log('✅ [LoginView] Connexion réussie:', result)
    console.log('🔄 [LoginView] État authentification:', isAuthenticated.value)
    success.value = 'Connexion réussie ! Redirection...'

    // Attendre que l'état d'authentification soit mis à jour, puis rediriger
    setTimeout(() => {
      console.log('🔄 [LoginView] État authentification final:', isAuthenticated.value)
      console.log('🔀 [LoginView] Redirection vers /')
      router.push('/')
    }, 1000)
    
  } catch (err: any) {
    console.error('❌ [LoginView] Erreur de connexion:', err)
    error.value = err.message || 'Erreur lors de la connexion'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <img :src="logo" :alt="getLogoAlt()" :class="getLogoClass('medium')">
      </div>
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Global Star Distribution
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Connectez-vous à votre compte
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
Numero de telephone            </label>
            <div class="mt-1">
              <input 
                id="phone"
                v-model="phone"
        name="Telephone"
                type="phone"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Entrez votre adresse Telephone"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Entrez votre mot de passe"
              />
            </div>
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-sm text-green-600">{{ success }}</p>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading ? 'Connexion...' : 'Se connecter' }}
            </button>
          </div>
        </form>

          

          <div class="mt-6 space-y-3">
             
              
        </div>
      </div>
    </div>
  </div>
</template>
