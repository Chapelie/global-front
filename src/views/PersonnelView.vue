<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLaravelApi } from '../services/laravelApiService'
import { useLaravelAuth } from '../services/laravelAuth'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

// Types
interface User {
  id?: number
  name?: string
  first_name?: string
  last_name?: string
  email: string
  phone?: string
  role: string
  password?: string
  password_confirmation?: string
  actif: boolean
  created_at?: string
  updated_at?: string
}

interface Role {
  id: number
  name: string
  display_name: string
  description: string
  permissions: string[]
  color: string
}

// Services
const { getUsers, addUser, updateUser, deleteUser, getRoles, createRole, updateRole, deleteRole } = useLaravelApi()
const { currentUser } = useLaravelAuth()

// État réactif
const users = ref<User[]>([])
const roles = ref<Role[]>([])
const showUserModal = ref(false)
const showRoleModal = ref(false)
const editingUser = ref<User | null>(null)
const editingRole = ref<Role | null>(null)
const isEditingUser = ref(false)
const isEditingRole = ref(false)
const isLoading = ref(false)
const showPassword = ref(false)
const activeTab = ref<'users' | 'roles'>('users')

// Nouvel utilisateur
const newUser = ref<User>({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'operator',
  password: '',
  password_confirmation: '',
  actif: true
})

// Nouveau rôle
const newRole = ref<Role>({
  id: 0, // ID temporaire pour la création
  name: '',
  display_name: '',
  description: '',
  permissions: [],
  color: 'blue'
})

// Rôles prédéfinis
const predefinedRoles = [
  {
    id: 1,
    name: 'super_admin',
    display_name: 'Super Administrateur',
    description: 'Accès complet à tous les modules et fonctionnalités',
    permissions: ['all'],
    color: 'red'
  },
  {
    id: 2,
    name: 'admin',
    display_name: 'Administrateur',
    description: 'Gestion des utilisateurs et accès à tous les modules',
    permissions: ['users.manage', 'dashboard.view', 'production.manage', 'logistics.manage', 'inventory.manage'],
    color: 'orange'
  },
  {
    id: 3,
    name: 'production_manager',
    display_name: 'Responsable Production',
    description: 'Gestion complète de la production',
    permissions: ['production.manage', 'production.view', 'inventory.view', 'dashboard.production'],
    color: 'blue'
  },
  {
    id: 4,
    name: 'production_operator',
    display_name: 'Opérateur Production',
    description: 'Opérations de production',
    permissions: ['production.view', 'production.create', 'inventory.view'],
    color: 'green'
  },
  {
    id: 5,
    name: 'logistics_manager',
    display_name: 'Responsable Logistique',
    description: 'Gestion des livraisons et logistique',
    permissions: ['logistics.manage', 'logistics.view', 'customers.manage', 'dashboard.logistics'],
    color: 'yellow'
  },
  {
    id: 6,
    name: 'logistics_operator',
    display_name: 'Opérateur Logistique',
    description: 'Opérations de livraison',
    permissions: ['logistics.view', 'logistics.create', 'customers.view'],
    color: 'indigo'
  },
  {
    id: 7,
    name: 'inventory_manager',
    display_name: 'Responsable Inventaire',
    description: 'Gestion des stocks et inventaire',
    permissions: ['inventory.manage', 'inventory.view', 'products.manage'],
    color: 'purple'
  },
  {
    id: 8,
    name: 'viewer',
    display_name: 'Consultant',
    description: 'Accès en lecture seule',
    permissions: ['dashboard.view', 'production.view', 'logistics.view', 'inventory.view'],
    color: 'gray'
  }
]

// Computed properties
const activeUsers = computed(() => users.value.filter(user => user.actif).length)

const getRoleCount = (roleName: string) => {
  return users.value.filter(user => user.role === roleName).length
}

const getRoleLabel = (role: string) => {
  const roleData = predefinedRoles.find(r => r.name === role)
  return roleData ? roleData.display_name : role
}

const getRoleColor = (role: string) => {
  const roleData = predefinedRoles.find(r => r.name === role)
  return roleData ? roleData.color : 'gray'
}

// Charger les données
onMounted(async () => {
  await loadUsers()
  await loadRoles()
})

const loadUsers = async () => {
  try {
    isLoading.value = true
    const laravelUsers = await getUsers()
    // Convertir LaravelUser[] en User[]
    users.value = laravelUsers.map(user => {
      // Séparer name en first_name et last_name si nécessaire
      let firstName = user.first_name || ''
      let lastName = user.last_name || ''
      if (!firstName && !lastName && user.name) {
        const nameParts = user.name.split(' ', 2)
        firstName = nameParts[0] || ''
        lastName = nameParts[1] || ''
      }
      
      return {
        id: user.id,
        name: user.name,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        phone: user.phone,
        role: user.roles?.[0]?.name || user.role || 'user',
        password: '',
        password_confirmation: '',
        actif: user.actif !== false
      }
    })
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
    alert('Erreur lors du chargement des utilisateurs')
  } finally {
    isLoading.value = false
  }
}

const loadRoles = async () => {
  try {
    roles.value = await getRoles()
  } catch (error) {
    console.error('Erreur lors du chargement des rôles:', error)
    // Utiliser les rôles prédéfinis si l'API échoue
    roles.value = predefinedRoles
  }
}

// Gestion des modals utilisateurs
const openUserModal = (user?: User) => {
  console.log('🔵 [PersonnelView] openUserModal appelé avec:', user ? 'user' : 'nouveau')
  if (user) {
    // S'assurer que first_name et last_name sont présents
    editingUser.value = {
      ...user,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      password: '',
      password_confirmation: '',
      actif: user.actif !== false
    }
    isEditingUser.value = true
  } else {
    editingUser.value = { 
      ...newUser.value,
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'operator',
      password: '',
      password_confirmation: '',
      actif: true
    }
    isEditingUser.value = false
  }
  console.log('🔵 [PersonnelView] editingUser initialisé:', editingUser.value)
  console.log('🔵 [PersonnelView] showUserModal sera:', true)
  showUserModal.value = true
  showPassword.value = false
  console.log('🔵 [PersonnelView] showUserModal est maintenant:', showUserModal.value)
}

const closeUserModal = () => {
  showUserModal.value = false
  editingUser.value = null
  isEditingUser.value = false
}

// Gestion des modals rôles
const openRoleModal = (role?: Role) => {
  if (role) {
    editingRole.value = { ...role }
    isEditingRole.value = true
  } else {
    editingRole.value = { ...newRole.value }
    isEditingRole.value = false
  }
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  editingRole.value = null
  isEditingRole.value = false
}

// CRUD Utilisateurs
const saveUser = async () => {
  if (!editingUser.value) {
    console.error('❌ [PersonnelView] editingUser est null')
    return
  }

  try {
    // Préparer les données pour l'API
    const userData: any = {
      first_name: editingUser.value.first_name || '',
      last_name: editingUser.value.last_name || '',
      email: editingUser.value.email,
      phone: editingUser.value.phone || null,
      role: editingUser.value.role,
    }
    
    // Ajouter le mot de passe seulement pour la création (OBLIGATOIRE pour création)
    if (!isEditingUser.value) {
      if (!editingUser.value.password || editingUser.value.password.length < 8) {
        alert('Le mot de passe est requis et doit contenir au moins 8 caractères')
        return
      }
      if (editingUser.value.password !== editingUser.value.password_confirmation) {
        alert('Les mots de passe ne correspondent pas')
        return
      }
      userData.password = editingUser.value.password
    }
    
    console.log('📤 [PersonnelView] Envoi des données:', { 
      isEditing: isEditingUser.value, 
      userData: { ...userData, password: userData.password ? '***' : undefined } 
    })
    
    if (isEditingUser.value) {
      await updateUser(editingUser.value.id!, userData)
      console.log('✅ [PersonnelView] Utilisateur mis à jour')
    } else {
      const result = await addUser(userData)
      console.log('✅ [PersonnelView] Utilisateur créé:', result)
    }
    await loadUsers()
    closeUserModal()
    alert(isEditingUser.value ? 'Utilisateur mis à jour avec succès' : 'Utilisateur créé avec succès')
  } catch (error: any) {
    console.error('❌ [PersonnelView] Erreur lors de la sauvegarde:', error)
    const errorMessage = error?.response?.data?.error || 
                        error?.response?.data?.message || 
                        error?.message || 
                        'Erreur lors de la sauvegarde de l\'utilisateur'
    
    // Afficher les erreurs de validation si disponibles
    if (error?.response?.data?.errors) {
      const errors = Object.entries(error.response.data.errors)
        .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('\n')
      alert(`Erreurs de validation:\n${errors}`)
    } else {
      alert(errorMessage)
    }
  }
}

const deleteUserAction = async (user: User) => {
  const userName = (user.first_name && user.last_name) 
    ? `${user.first_name} ${user.last_name}` 
    : (user.name || 'cet utilisateur')
  if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userName} ?`)) return

  try {
    await deleteUser(user.id!)
    await loadUsers()
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    alert('Erreur lors de la suppression de l\'utilisateur')
  }
}

// CRUD Rôles
const saveRole = async () => {
  if (!editingRole.value) return

  try {
    if (isEditingRole.value) {
      await updateRole(editingRole.value.id!, editingRole.value)
    } else {
      await createRole(editingRole.value)
    }
    await loadRoles()
    closeRoleModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du rôle:', error)
    alert('Erreur lors de la sauvegarde du rôle')
  }
}

const deleteRoleAction = async (role: Role) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle ${role.display_name} ?`)) return

  try {
    await deleteRole(role.id!)
    await loadRoles()
  } catch (error) {
    console.error('Erreur lors de la suppression du rôle:', error)
    alert('Erreur lors de la suppression du rôle')
  }
}

// Fonctions utilitaires
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  if (editingUser.value) {
    editingUser.value.password = password
    editingUser.value.password_confirmation = password
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  alert('Copié dans le presse-papiers !')
}
</script>

<template>
  <div class="personnel-container min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="header-content bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center mb-4 sm:mb-0">
            <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg mr-4">
              <UserGroupIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="page-title text-2xl font-bold text-gray-900">Gestion du Personnel</h1>
              <p class="text-sm text-gray-600">Utilisateurs et rôles du système</p>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="activeTab = 'users'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Utilisateurs
            </button>
            <button
              @click="activeTab = 'roles'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                activeTab === 'roles'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Rôles
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <UserGroupIcon class="h-6 w-6 text-white" />
            </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total utilisateurs</p>
                <p class="stat-value text-2xl font-bold text-gray-900">{{ users.length }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <CheckCircleIcon class="h-6 w-6 text-white" />
            </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
                <p class="stat-value text-2xl font-bold text-gray-900">{{ activeUsers }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="stat-content p-6">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <ShieldCheckIcon class="h-6 w-6 text-white" />
            </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Administrateurs</p>
                <p class="stat-value text-2xl font-bold text-gray-900">{{ getRoleCount('admin') + getRoleCount('super_admin') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglets de contenu -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Onglets -->
        <div class="border-b border-gray-200">
          <nav class="flex">
            <button
              @click="activeTab = 'users'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-medium text-center transition-all duration-200',
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <UserGroupIcon class="h-5 w-5 mx-auto mb-2" />
              Utilisateurs
            </button>
            <button
              @click="activeTab = 'roles'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-medium text-center transition-all duration-200',
                activeTab === 'roles'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <CogIcon class="h-5 w-5 mx-auto mb-2" />
              Rôles
            </button>
          </nav>
              </div>

        <!-- Contenu Utilisateurs -->
        <div v-if="activeTab === 'users'" class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Liste des utilisateurs</h2>
            <button
              @click="openUserModal()"
              class="action-button inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
            >
              <PlusIcon class="h-5 w-5 mr-2" />
              Nouvel utilisateur
            </button>
            </div>

          <!-- Tableau des utilisateurs -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg mr-4">
                        <span class="text-sm font-bold text-white">
                          {{ ((user.first_name || user.name || '?').charAt(0)).toUpperCase() }}
                        </span>
            </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ (user.first_name && user.last_name) ? `${user.first_name} ${user.last_name}` : (user.name || 'Nom non défini') }}
                        </div>
          </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ user.email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ user.phone || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        `bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800`
                      ]"
                    >
                      {{ getRoleLabel(user.role) }}
            </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        user.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      ]"
                    >
                      <component
                        :is="user.actif ? CheckCircleIcon : ExclamationTriangleIcon"
                        class="h-3 w-3 mr-1"
                      />
              {{ user.actif ? 'Actif' : 'Inactif' }}
            </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ user.created_at ? formatDate(user.created_at) : 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="openUserModal(user)"
                        class="text-orange-600 hover:text-orange-900 transition-colors"
                      >
                        <PencilIcon class="h-4 w-4" />
                      </button>
                      <button
                        @click="deleteUserAction(user)"
                        class="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Message si aucun utilisateur -->
          <div v-if="users.length === 0" class="text-center py-12">
            <UserGroupIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p class="text-gray-600">Commencez par créer votre premier utilisateur.</p>
          </div>
          </div>

        <!-- Contenu Rôles -->
        <div v-if="activeTab === 'roles'" class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Liste des rôles</h2>
            <button
              @click="openRoleModal()"
              class="action-button inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
            >
              <PlusIcon class="h-5 w-5 mr-2" />
              Nouveau rôle
            </button>
          </div>

          <!-- Tableau des rôles -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateurs</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="role in roles" :key="role.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div :class="[
                        'h-10 w-10 rounded-xl flex items-center justify-center shadow-lg mr-4',
                        `bg-gradient-to-r from-${role.color}-500 to-${role.color}-600`
                      ]">
                        <CogIcon class="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ role.display_name }}</div>
                        <div class="text-sm text-gray-500">{{ role.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ role.description }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="permission in role.permissions.slice(0, 3)"
                        :key="permission"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {{ permission }}
                      </span>
                      <span
                        v-if="role.permissions.length > 3"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        +{{ role.permissions.length - 3 }} autres
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ getRoleCount(role.name) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="openRoleModal(role)"
                        class="text-orange-600 hover:text-orange-900 transition-colors"
                      >
                        <PencilIcon class="h-4 w-4" />
                      </button>
                      <button
                        @click="deleteRoleAction(role)"
                        class="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <TrashIcon class="h-4 w-4" />
            </button>
          </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Message si aucun rôle -->
          <div v-if="roles.length === 0" class="text-center py-12">
            <CogIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun rôle trouvé</h3>
            <p class="text-gray-600">Commencez par créer votre premier rôle.</p>
          </div>
        </div>
      </div>
      </div>

    <!-- Modal Utilisateur -->
    <div
      v-if="showUserModal && editingUser"
      class="fixed inset-0"
      style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; display: flex; align-items: center; justify-content: center;"
      @click.self="closeUserModal"
    >
      <!-- Overlay -->
      <div 
        class="absolute inset-0 bg-black"
        style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); z-index: 1;"
        @click="closeUserModal"
      ></div>
      
      <!-- Modal Content -->
      <div 
        class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4"
        style="position: relative; z-index: 10; background: white; max-width: 32rem; margin: 0 auto; max-height: 90vh; overflow-y: auto;"
        @click.stop
      >
        <!-- Header -->
        <div class="modal-header-content bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="modal-title text-lg font-semibold text-white">
                    {{ isEditingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
                  </h3>
                  <p class="modal-subtitle text-sm text-orange-100">
                    {{ isEditingUser ? 'Modifiez les informations' : 'Renseignez les informations' }}
                  </p>
                </div>
                <button
                  @click="closeUserModal"
                  class="text-orange-200 hover:text-white transition-colors"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Contenu -->
            <div class="modal-body-content px-6 py-6 max-h-96 overflow-y-auto">
              <form @submit.prevent="saveUser" class="space-y-4">
                <!-- Prénom -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    v-model="editingUser.first_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <!-- Nom -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    v-model="editingUser.last_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    v-model="editingUser.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <!-- Téléphone -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    v-model="editingUser.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <!-- Rôle -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Rôle *</label>
                  <select
                    v-model="editingUser.role"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option
                      v-for="role in predefinedRoles"
                      :key="role.name"
                      :value="role.name"
                    >
                      {{ role.display_name }}
                    </option>
                  </select>
                </div>

                <!-- Mot de passe (seulement pour nouveau utilisateur) -->
                <div v-if="!isEditingUser">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                  <div class="relative">
                    <input
                      v-model="editingUser.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      type="button"
                      @click="togglePasswordVisibility"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <component
                        :is="showPassword ? EyeSlashIcon : EyeIcon"
                        class="h-5 w-5 text-gray-400"
                      />
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="generatePassword"
                    class="mt-2 text-sm text-orange-600 hover:text-orange-800 flex items-center"
                  >
                    <KeyIcon class="h-4 w-4 mr-1" />
                    Générer un mot de passe
                  </button>
                </div>

                <!-- Confirmation mot de passe -->
                <div v-if="!isEditingUser">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
                  <input
                    v-model="editingUser.password_confirmation"
                    type="password"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <!-- Statut -->
                <div class="flex items-center">
                  <input
                    v-model="editingUser.actif"
                    type="checkbox"
                    class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    Utilisateur actif
                  </label>
                </div>
              </form>
            </div>

            <!-- Footer -->
            <div class="modal-footer-content bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                @click="closeUserModal"
                class="btn-cancel px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Annuler
              </button>
              <button
                @click="saveUser"
                class="btn-submit px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {{ isEditingUser ? 'Modifier' : 'Créer' }}
              </button>
        </div>
      </div>
    </div>

    <!-- Modal Rôle -->
    <div
      v-if="showRoleModal"
      class="fixed inset-0 z-50 overflow-y-auto mobile-modal-container"
      @click.self="closeRoleModal"
    >
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="closeRoleModal"></div>

        <div class="modal-container inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <!-- Header -->
          <div class="modal-header-content bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="modal-title text-lg font-semibold text-white">
                  {{ isEditingRole ? 'Modifier le rôle' : 'Nouveau rôle' }}
                </h3>
                <p class="modal-subtitle text-sm text-orange-100">
                  {{ isEditingRole ? 'Modifiez les informations' : 'Renseignez les informations' }}
                </p>
              </div>
              <button
                @click="closeRoleModal"
                class="text-orange-200 hover:text-white transition-colors"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Contenu -->
          <div class="modal-body-content px-6 py-6 max-h-96 overflow-y-auto">
            <form @submit.prevent="saveRole" class="space-y-4">
              <!-- Nom du rôle -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom du rôle *</label>
                <input
                  v-model="editingRole!.name"
                  type="text"
                  required
                  placeholder="Ex: custom_role"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <!-- Nom d'affichage -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom d'affichage *</label>
                <input
                  v-model="editingRole!.display_name"
                  type="text"
                  required
                  placeholder="Ex: Rôle Personnalisé"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="editingRole!.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                ></textarea>
              </div>

              <!-- Couleur -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                <select
                  v-model="editingRole!.color"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="blue">Bleu</option>
                  <option value="green">Vert</option>
                  <option value="red">Rouge</option>
                  <option value="yellow">Jaune</option>
                  <option value="orange">Orange</option>
                  <option value="purple">Violet</option>
                  <option value="indigo">Indigo</option>
                  <option value="gray">Gris</option>
                </select>
              </div>

              <!-- Permissions -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div class="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  <label
                    v-for="permission in [
                      'all', 'users.manage', 'dashboard.view', 'production.manage', 'production.view',
                      'logistics.manage', 'logistics.view', 'inventory.manage', 'inventory.view',
                      'customers.manage', 'customers.view', 'products.manage', 'products.view'
                    ]"
                    :key="permission"
                    class="flex items-center"
                  >
                    <input
                      v-model="editingRole!.permissions"
                      :value="permission"
                      type="checkbox"
                      class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span class="ml-2 text-sm text-gray-900">{{ permission }}</span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="modal-footer-content bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              @click="closeRoleModal"
              class="btn-cancel px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Annuler
            </button>
            <button
              @click="saveRole"
              class="btn-submit px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {{ isEditingRole ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles de base */
.personnel-container {
  min-height: 100vh;
}

.page-title {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 700;
  color: #111827;
}

.action-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(to right, #f97316, #ea580c);
  color: white;
  font-weight: 500;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  transform: scale(1);
}

.action-button:hover {
  background: linear-gradient(to right, #ea580c, #c2410c);
  transform: scale(1.05);
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.stat-content {
  padding: 1.5rem;
}

.stat-value {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: #111827;
}

/* Modal responsive pour mobile */
.mobile-modal-container {
  padding: 0;
  margin: 0;
}

.modal-container {
  margin: 0.5rem;
  max-height: calc(100vh - 1rem);
  width: calc(100% - 1rem);
  max-width: 32rem;
}

.modal-header-content {
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #f97316, #ea580c);
}

.modal-title {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  color: white;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #fed7aa;
}

.modal-body-content {
  padding: 1.5rem;
  max-height: 24rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-footer-content {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel,
.btn-submit {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.btn-cancel {
  color: #374151;
  background: white;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-submit {
  color: white;
  background: linear-gradient(to right, #f97316, #ea580c);
}

.btn-submit:hover {
  background: linear-gradient(to right, #ea580c, #c2410c);
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-container {
    margin: 0.25rem;
    max-height: calc(100vh - 0.5rem);
    width: calc(100% - 0.5rem);
  }

  .modal-body-content {
    max-height: calc(100vh - 12rem);
    padding: 1rem;
  }

  .modal-header-content {
    padding: 0.75rem 1rem;
  }

  .modal-footer-content {
    padding: 0.75rem 1rem;
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }

  .page-title {
    font-size: 1.5rem;
    line-height: 2rem;
}

.action-button {
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
  }

  .stat-content {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .modal-container {
    margin: 0.125rem;
    max-height: calc(100vh - 0.25rem);
    width: calc(100% - 0.25rem);
  }

  .modal-body-content {
    max-height: calc(100vh - 10rem);
    padding: 0.75rem;
  }

  .modal-header-content {
    padding: 0.5rem 0.75rem;
  }

  .modal-footer-content {
    padding: 0.5rem 0.75rem;
  }

  .page-title {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .stat-content {
    padding: 0.75rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }
}

/* Améliorations pour le scroll sur mobile */
.modal-body-content {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.modal-body-content::-webkit-scrollbar {
  width: 6px;
}

.modal-body-content::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.modal-body-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.modal-body-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Assurer que les inputs sont accessibles sur mobile */
input, select, textarea {
  font-size: 16px; /* Évite le zoom automatique sur iOS */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* Améliorer l'espacement des touches sur mobile */
button {
  min-height: 44px; /* Taille minimale recommandée pour les touches tactiles */
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: slideIn 0.3s ease-out;
}
</style>