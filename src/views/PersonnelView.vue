<template>
  <div class="personnel-container">
    <!-- Header moderne -->
    <div class="personnel-header">
      <div class="header-content">
        <div class="header-main">
          <div class="flex items-center">
            <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-4 shadow-lg">
              <UserGroupIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="page-title">Gestion du Personnel</h1>
              <p class="page-subtitle">Création et gestion des utilisateurs</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="openModal()"
              class="action-button"
            >
              <PlusIcon class="h-5 w-5 mr-2" />
              Nouvel utilisateur
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- KPI Cards modernisés -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper stat-blue">
              <UserGroupIcon class="stat-icon" />
            </div>
            <div class="stat-details">
              <dl>
                <dt class="stat-label">Total utilisateurs</dt>
                <dd class="stat-value">{{ users.length }}</dd>
                <dd class="stat-unit">utilisateurs</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper stat-green">
              <CheckCircleIcon class="stat-icon" />
            </div>
            <div class="stat-details">
              <dl>
                <dt class="stat-label">Utilisateurs actifs</dt>
                <dd class="stat-value">{{ activeUsers }}</dd>
                <dd class="stat-unit">actifs</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper stat-purple">
              <ShieldCheckIcon class="stat-icon" />
            </div>
            <div class="stat-details">
              <dl>
                <dt class="stat-label">Administrateurs</dt>
                <dd class="stat-value">{{ getRoleCount('admin') }}</dd>
                <dd class="stat-unit">admins</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des utilisateurs -->
      <div class="users-grid">
        <div
          v-for="user in users"
          :key="user.id"
          class="user-card"
        >
          <div class="user-header">
            <div class="user-avatar">
              <div class="avatar-circle">
                {{ (user.first_name || '?').charAt(0) }}{{ (user.last_name || '?').charAt(0) }}
              </div>
            </div>
            <div class="user-info">
              <h3 class="user-name">{{ user.first_name || 'Prénom' }} {{ user.last_name || 'Nom' }}</h3>
              <p class="user-email">{{ user.email }}</p>
            </div>
          </div>

          <div class="user-meta">
            <span :class="`role-badge role-${user.role}`">
              {{ getRoleLabel(user.role || 'operator') }}
            </span>
            <span :class="`status-badge status-${user.actif ? 'active' : 'inactive'}`">
              {{ user.actif ? 'Actif' : 'Inactif' }}
            </span>
          </div>

          <div v-if="user.phone" class="user-phone">
            <PhoneIcon class="phone-icon" />
            {{ user.phone }}
          </div>

          <div class="user-actions">
            <button @click="openModal(user)" class="action-button action-secondary">
              <PencilIcon class="h-4 w-4 mr-2" />
              Modifier
            </button>

            <button @click="handleDeleteUser(String(user.id))" class="action-button action-danger">
              <TrashIcon class="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
      </div>

      <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</h2>
          <button @click="closeModal" class="modal-close">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveUser" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Prénom *</label>
              <input
                v-model="newUser.first_name"
                type="text"
                required
                class="form-input"
                placeholder="Prénom"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Nom *</label>
              <input
                v-model="newUser.last_name"
                type="text"
                required
                class="form-input"
                placeholder="Nom"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email *</label>
            <input
              v-model="newUser.email"
              type="email"
              required
              class="form-input"
              placeholder="email@exemple.com"
            />
          </div>

          <div v-if="!editingUser" class="form-group">
            <label class="form-label">Mot de passe *</label>
            <input
              v-model="newUser.password"
              type="password"
              required
              class="form-input"
              placeholder="Mot de passe"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Rôle *</label>
              <select v-model="newUser.role" required class="form-select">
                <option value="operator">Opérateur</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrateur</option>
                <option value="secretaire">Secrétaire</option>
                <option value="livreur">Livreur</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Téléphone</label>
              <input
                v-model="newUser.phone"
                type="tel"
                class="form-input"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Statut</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="newUser.actif"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-text">Utilisateur actif</span>
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingUser ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de connexion automatique -->
    <AutoLoginModal
      v-if="showAutoLoginModal && createdUser"
      :show="showAutoLoginModal"
      :user="createdUser"
      @close="closeAutoLoginModal"
      @success="onAutoLoginSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLaravelApi, type LaravelUser } from '@/services/laravelApiService'
import AutoLoginModal from '@/components/AutoLoginModal.vue'
import {
  UserGroupIcon,
  PlusIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  PhoneIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const { getUsers } = useLaravelApi()

// État réactif
const users = ref<LaravelUser[]>([])
const showModal = ref(false)
const showAutoLoginModal = ref(false)
const editingUser = ref<LaravelUser | null>(null)
const createdUser = ref<LaravelUser | null>(null)

const newUser = ref<Omit<LaravelUser, 'id' | 'created_at' | 'updated_at'> & { password: string }>({
  email: '',
  name: '',
  phone: '',
  department: '',
  position: '',
  roles: [],
  password: ''
})

// Computed
const activeUsers = computed(() => 
  users.value.filter(u => u.actif).length
)

// Méthodes
const loadUsers = async () => {
  try {
    console.log('🔍 [PersonnelView] Chargement des utilisateurs...')
    users.value = await getUsers()
    console.log('✅ [PersonnelView] Utilisateurs chargés:', users.value.length)
  } catch (error) {
    console.error('❌ [PersonnelView] Erreur lors du chargement des utilisateurs:', error)
  }
}

const openModal = (user?: LaravelUser) => {
  if (user) {
    editingUser.value = user
    newUser.value = {
      email: user.email,
      name: user.name,
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || '',
      roles: user.roles || [],
      password: ''
    }
  } else {
    editingUser.value = null
    newUser.value = {
      email: '',
      name: '',
      phone: '',
      department: '',
      position: '',
      roles: [],
      password: ''
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingUser.value = null
}

const saveUser = async () => {
  try {
    console.log('💾 [PersonnelView] Sauvegarde de l\'utilisateur...')
    
    if (editingUser.value) {
      await updateUser(editingUser.value.id!, newUser.value)
      console.log('✅ [PersonnelView] Utilisateur mis à jour')
      await loadUsers()
      closeModal()
      alert('Utilisateur mis à jour avec succès !')
    } else {
      const createdUserData = await createUser(newUser.value)
      console.log('✅ [PersonnelView] Utilisateur créé')
      createdUser.value = createdUserData
      await loadUsers()
      closeModal()
      
      // Proposer la connexion automatique pour les nouveaux utilisateurs
      showAutoLoginModal.value = true
    }
  } catch (error) {
    console.error('❌ [PersonnelView] Erreur lors de la sauvegarde:', error)
    alert('Erreur lors de la sauvegarde de l\'utilisateur')
  }
}

const handleDeleteUser = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
    try {
      console.log('🗑️ [PersonnelView] Suppression de l\'utilisateur:', id)
      await deleteUser(Number(id))
      await loadUsers()
      console.log('✅ [PersonnelView] Utilisateur supprimé')
    } catch (error) {
      console.error('❌ [PersonnelView] Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de l\'utilisateur')
    }
  }
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    'superadmin': 'Super Admin',
    'admin': 'Administrateur',
    'manager': 'Manager',
    'operator': 'Opérateur',
    'secretaire': 'Secrétaire',
    'livreur': 'Livreur'
  }
  return labels[role] || role
}

const getRoleCount = (role: string) => {
  return users.value.filter(u => u.role === role).length
}

const closeAutoLoginModal = () => {
  showAutoLoginModal.value = false
  createdUser.value = null
}

const onAutoLoginSuccess = () => {
  console.log('✅ [PersonnelView] Connexion automatique réussie')
  closeAutoLoginModal()
  alert('Connexion automatique réussie !')
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
/* Container principal */
.personnel-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
}

/* Header moderne */
.personnel-header {
  margin-bottom: 2rem;
}

.header-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
}

/* Contenu principal */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* Grille des statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon-wrapper {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-blue {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-green {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.stat-details {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0.25rem 0 0 0;
}

.stat-unit {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}

/* Grille des utilisateurs */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.user-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.user-email {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.user-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-superadmin {
  background: #fef3c7;
  color: #92400e;
}

.role-admin {
  background: #dbeafe;
  color: #1e40af;
}

.role-manager {
  background: #d1fae5;
  color: #065f46;
}

.role-operator {
  background: #e0e7ff;
  color: #3730a3;
}

.role-secretaire {
  background: #fce7f3;
  color: #be185d;
}

.role-livreur {
  background: #fef3c7;
  color: #92400e;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.user-phone {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.phone-icon {
  width: 1rem;
  height: 1rem;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.action-button {
  background: #3b82f6;
  color: white;
}

.action-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-secondary {
  background: #64748b;
  color: white;
}

.action-secondary:hover {
  background: #475569;
  transform: translateY(-1px);
}

.action-danger {
  background: #ef4444;
  color: white;
}

.action-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  color: #64748b;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background: #f1f5f9;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.checkbox-text {
  font-size: 0.875rem;
  color: #374151;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>