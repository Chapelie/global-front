<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Créer un compte</h2>
        <p class="mt-2 text-sm text-gray-600">
          Rejoignez Global Star Distribution
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Informations personnelles -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Informations personnelles</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">
                  Prénom *
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre prénom"
                />
              </div>
              
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre nom"
                />
              </div>
            </div>
          </div>

          <!-- Informations de connexion -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Informations de connexion</h3>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Adresse email *
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                minlength="6"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Minimum 6 caractères"
              />
              <p class="mt-1 text-xs text-gray-500">
                Le mot de passe doit contenir au moins 6 caractères
              </p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Répétez votre mot de passe"
              />
            </div>
          </div>

          <!-- Rôle utilisateur -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Rôle dans l'entreprise</h3>
            
            <div>
              <label for="role" class="block text-sm font-medium text-gray-700">
                Votre rôle *
              </label>
              <select
                id="role"
                v-model="form.role"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionnez votre rôle</option>
                <option value="secretaire">Secrétaire</option>
                <option value="livreur">Livreur</option>
                <option value="operator">Opérateur</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrateur</option>
              </select>
              <p class="mt-1 text-xs text-gray-500">
                Choisissez le rôle qui correspond le mieux à vos responsabilités
              </p>
            </div>
          </div>

          <!-- Informations de contact -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Informations de contact</h3>
            
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">
                Téléphone *
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="+33 6 12 34 56 78"
              />
              <p class="mt-1 text-xs text-gray-500">
                Le téléphone servira pour la connexion
              </p>
            </div>

          </div>

          <!-- Conditions d'utilisation -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="terms"
                v-model="form.acceptTerms"
                type="checkbox"
                required
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="terms" class="font-medium text-gray-700">
                J'accepte les conditions d'utilisation *
              </label>
              <p class="text-gray-500">
                En créant un compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              </p>
            </div>
          </div>

          <!-- Messages d'erreur -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Erreur d'inscription
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <!-- Message de succès -->
          <div v-if="success" class="bg-green-50 border border-green-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">
                  Inscription réussie !
                </h3>
                <div class="mt-2 text-sm text-green-700">
                  Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.
                </div>
              </div>
            </div>
          </div>

          <!-- Bouton d'inscription -->
          <div>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Création du compte...' : 'Créer mon compte' }}
            </button>
          </div>

          <!-- Lien vers la connexion -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Déjà un compte ?
              <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
                Se connecter
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLaravelAuth } from '../services/laravelAuth'

const router = useRouter()
const { signUp } = useLaravelAuth()

const loading = ref(false)
const error = ref('')
const success = ref(false)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  phone: '',
  acceptTerms: false
})

// Validation du formulaire
const isFormValid = computed(() => {
  return form.value.firstName &&
         form.value.lastName &&
         form.value.email &&
         form.value.password &&
         form.value.password === form.value.confirmPassword &&
         form.value.role &&
         form.value.acceptTerms
})

// Gestion de l'inscription
const handleRegister = async () => {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir tous les champs obligatoires'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    console.log('🔐 [RegisterView] Inscription - Début')
    console.log('📧 [RegisterView] Email:', form.value.email)
    console.log('👤 [RegisterView] Rôle:', form.value.role)

    // Inscription avec données Laravel
    const result = await signUp({
      name: `${form.value.firstName} ${form.value.lastName}`,
      email: form.value.email,
      password: form.value.password,
      password_confirmation: form.value.confirmPassword,
      phone: form.value.phone,
      role: form.value.role as any
    })
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de l\'inscription')
    }

    console.log('✅ [RegisterView] Inscription réussie')
    success.value = true
    
    // Redirection vers la connexion après 2 secondes
    setTimeout(() => {
      router.push('/login')
    }, 2000)

  } catch (err: any) {
    console.error('❌ [RegisterView] Erreur d\'inscription:', err)
    error.value = err.message || 'Erreur lors de la création du compte'
  } finally {
    loading.value = false
  }
}
</script>