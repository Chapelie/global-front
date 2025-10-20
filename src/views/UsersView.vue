<template>
  <div class="users-view">
    <div class="view-header">
      <h1 class="view-title">Gestion des Utilisateurs</h1>
      <p class="view-subtitle">
        Gérez les comptes utilisateurs et leurs rôles
      </p>
    </div>

    <div class="view-content">
      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">👥</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total utilisateurs</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.totalUsers }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">✅</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Utilisateurs actifs</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.activeUsers }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">🕒</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Connexions récentes</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.recentUsers }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">👑</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Administrateurs</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.adminUsers }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Liste des utilisateurs</h3>
            <div class="flex space-x-3">
              <button
                @click="refreshUsers"
                :disabled="loading"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ loading ? 'Actualisation...' : 'Actualiser' }}
              </button>
              <button
                @click="showCreateModal = true"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Créer un utilisateur
              </button>
            </div>
          </div>
        </div>

        <!-- Tableau des utilisateurs -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ user.first_name?.[0] }}{{ user.last_name?.[0] }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.first_name }} {{ user.last_name }}
                      </div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRoleClass(user.role)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="user.is_active ? 'text-green-600' : 'text-red-600'" class="text-sm">
                    {{ user.is_active ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.last_login) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="editUser(user)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Modifier
                    </button>
                    <button
                      @click="toggleUserStatus(user)"
                      :class="user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                    >
                      {{ user.is_active ? 'Désactiver' : 'Activer' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de création/modification d'utilisateur -->
    <div v-if="showCreateModal || editingUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">
          {{ editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur' }}
        </h3>
        
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              v-model="userForm.first_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              v-model="userForm.last_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="userForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div v-if="!editingUser">
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              v-model="userForm.password"
              type="password"
              :required="!editingUser"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select
              v-model="userForm.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="secretaire">Secrétaire</option>
              <option value="livreur">Livreur</option>
              <option value="operator">Opérateur</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrateur</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              v-model="userForm.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="cancelEdit"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}
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

const { getAllUsers, updateUserProfile, createUserProfile, hasRole } = useAuth()

const loading = ref(false)
const users = ref<any[]>([])
const showCreateModal = ref(false)
const editingUser = ref<any>(null)

const userForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: 'secretaire',
  phone: ''
})

// Statistiques
const stats = computed(() => {
  const totalUsers = users.value.length
  const activeUsers = users.value.filter(u => u.is_active).length
  const recentUsers = users.value.filter(u => {
    if (!u.last_login) return false
    const lastLogin = new Date(u.last_login)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return lastLogin > thirtyDaysAgo
  }).length
  const adminUsers = users.value.filter(u => ['admin', 'superadmin'].includes(u.role)).length

  return {
    totalUsers,
    activeUsers,
    recentUsers,
    adminUsers
  }
})

// Vérifier les permissions
const canManageUsers = computed(() => hasRole('admin') || hasRole('superadmin'))

// Charger les utilisateurs
const loadUsers = async () => {
  if (!canManageUsers.value) {
    console.warn('❌ [UsersView] Permissions insuffisantes pour gérer les utilisateurs')
    return
  }

  loading.value = true
  try {
    console.log('👥 [UsersView] Chargement des utilisateurs')
    users.value = await getAllUsers()
    console.log('✅ [UsersView] Utilisateurs chargés:', users.value.length)
  } catch (error) {
    console.error('❌ [UsersView] Erreur lors du chargement:', error)
  } finally {
    loading.value = false
  }
}

const refreshUsers = () => {
  loadUsers()
}

// Gestion des utilisateurs
const editUser = (user: any) => {
  editingUser.value = user
  userForm.value = {
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    password: '',
    role: user.role || 'secretaire',
    phone: user.phone || ''
  }
}

const cancelEdit = () => {
  editingUser.value = null
  showCreateModal.value = false
  userForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'secretaire',
    phone: ''
  }
}

const saveUser = async () => {
  loading.value = true
  try {
    if (editingUser.value) {
      // Mise à jour
      console.log('👤 [UsersView] Mise à jour utilisateur:', editingUser.value.id)
      await updateUserProfile(editingUser.value.id, {
        first_name: userForm.value.first_name,
        last_name: userForm.value.last_name,
        phone: userForm.value.phone,
        role: userForm.value.role as any
      })
    } else {
      // Création
      console.log('👤 [UsersView] Création utilisateur:', userForm.value.email)
      // Note: La création d'utilisateur se fait via l'inscription normale
      // Ici on pourrait appeler une fonction admin pour créer un utilisateur
    }
    
    await loadUsers()
    cancelEdit()
  } catch (error) {
    console.error('❌ [UsersView] Erreur lors de la sauvegarde:', error)
  } finally {
    loading.value = false
  }
}

const toggleUserStatus = async (user: any) => {
  try {
    console.log('👤 [UsersView] Changement statut utilisateur:', user.id)
    await updateUserProfile(user.id, {
      // Note: Il faudrait ajouter un champ is_active dans updateUserProfile
    })
    await loadUsers()
  } catch (error) {
    console.error('❌ [UsersView] Erreur lors du changement de statut:', error)
  }
}

// Utilitaires
const getRoleClass = (role: string) => {
  const classes = {
    superadmin: 'bg-red-100 text-red-800',
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    operator: 'bg-green-100 text-green-800',
    secretaire: 'bg-yellow-100 text-yellow-800',
    livreur: 'bg-gray-100 text-gray-800'
  }
  return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getRoleLabel = (role: string) => {
  const labels = {
    superadmin: 'Super Admin',
    admin: 'Administrateur',
    manager: 'Manager',
    operator: 'Opérateur',
    secretaire: 'Secrétaire',
    livreur: 'Livreur'
  }
  return labels[role as keyof typeof labels] || role
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Jamais'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  if (canManageUsers.value) {
    loadUsers()
  }
})
</script>

<style scoped>
.users-view {
  min-height: 100vh;
  background: #f9fafb;
  padding: 2rem;
}

.view-header {
  text-align: center;
  margin-bottom: 3rem;
}

.view-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.view-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

.view-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
