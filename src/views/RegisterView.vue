<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../services/auth'
import { useLogo } from '../composables/useLogo'

const router = useRouter()
const { signUp, signInWithGoogle, isLoading, initAuth } = useAuth()
const { logo, getLogoAlt, getLogoClass } = useLogo()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')
const role = ref('secretaire')
const error = ref('')
const isSubmitting = ref(false)
const success = ref('')

const availableRoles = [
  { value: 'secretaire', label: 'Secrétaire', description: 'Gestion des commandes et livraisons' },
  { value: 'livreur', label: 'Livreur', description: 'Gestion des livraisons uniquement' }
]

// Initialiser l'authentification au montage
onMounted(async () => {
  await initAuth()
})

const handleRegister = async () => {
  // Validation
  if (!email.value || !password.value || !firstName.value || !lastName.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  isSubmitting.value = true
  error.value = ''
  success.value = ''

  try {
    await signUp(email.value, password.value, {
      first_name: firstName.value,
      last_name: lastName.value,
      role: role.value
    })
    
    success.value = 'Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.'
    
    // Redirection après 3 secondes
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la création du compte'
  } finally {
    isSubmitting.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    await signInWithGoogle()
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la connexion Google'
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
        Créer un compte
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Rejoignez Global Star Distribution
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <div class="mt-1">
                <input
                  id="firstName"
                  v-model="firstName"
                  name="firstName"
                  type="text"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <div class="mt-1">
                <input
                  id="lastName"
                  v-model="lastName"
                  name="lastName"
                  type="text"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Votre nom"
                />
              </div>
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="votre@email.com"
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
                placeholder="Minimum 6 caractères"
              />
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Répétez votre mot de passe"
              />
            </div>
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">
              Rôle
            </label>
            <div class="mt-1">
              <select
                id="role"
                v-model="role"
                name="role"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option v-for="roleOption in availableRoles" :key="roleOption.value" :value="roleOption.value">
                  {{ roleOption.label }} - {{ roleOption.description }}
                </option>
              </select>
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
              :disabled="isSubmitting || isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isSubmitting" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isSubmitting ? 'Création...' : 'Créer mon compte' }}
            </button>
          </div>

          <div class="mt-4">
            <button
              type="button"
              @click="handleGoogleLogin"
              :disabled="isSubmitting || isLoading"
              class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              S'inscrire avec Google
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Déjà un compte ?</span>
            </div>
          </div>

          <div class="mt-6 text-center">
            <router-link
              to="/login"
              class="text-orange-600 hover:text-orange-500 text-sm font-medium"
            >
              Se connecter
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
