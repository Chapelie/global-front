<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Connexion automatique</h2>
        <button @click="closeModal" class="modal-close">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="user-info">
          <div class="user-avatar">
            {{ user.name.charAt(0) }}
          </div>
          <div class="user-details">
            <h3 class="user-name">{{ user.name }}</h3>
            <p class="user-email">{{ user.email }}</p>
            <span :class="`role-badge role-${user.roles?.[0]?.name || 'operator'}`">
              {{ getRoleLabel(user.roles?.[0]?.name || 'operator') }}
            </span>
          </div>
        </div>

        <div class="login-options">
          <p class="login-text">Voulez-vous vous connecter automatiquement avec ce compte ?</p>
          
          <div class="password-section">
            <label class="form-label">Mot de passe temporaire</label>
            <input
              v-model="temporaryPassword"
              type="password"
              class="form-input"
              placeholder="Mot de passe temporaire"
            />
            <p class="password-hint">Le mot de passe sera changé lors de la première connexion</p>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="closeModal" class="btn btn-secondary">
          Annuler
        </button>
        <button @click="performAutoLogin" class="btn btn-primary" :disabled="!temporaryPassword">
          Se connecter automatiquement
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLaravelApi, type LaravelUser } from '@/services/laravelApiService'
import { useAuth } from '@/services/auth'

const props = defineProps<{
  show: boolean
  user: LaravelUser
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const { signIn } = useAuth()

const temporaryPassword = ref('')

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

const closeModal = () => {
  emit('close')
}

const performAutoLogin = async () => {
  try {
    console.log('🔐 [AutoLoginModal] Tentative de connexion automatique...')
    
    // Utiliser notre méthode de connexion personnalisée
    const { signIn } = useAuth()
    const result = await signIn({ email: props.user.email, password: temporaryPassword.value })
    
    // Simuler la connexion en stockant les données dans localStorage
    localStorage.setItem('user', JSON.stringify(result.user))
    if ((result as any).session) {
      localStorage.setItem('session', JSON.stringify((result as any).session))
    }
    
    console.log('✅ [AutoLoginModal] Connexion automatique réussie')
    emit('success')
    closeModal()
  } catch (error) {
    console.error('❌ [AutoLoginModal] Erreur lors de la connexion automatique:', error)
    alert('Erreur lors de la connexion automatique')
  }
}
</script>

<style scoped>
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
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;
}

.modal-close:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.125rem;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.user-email {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-operator {
  background: #dbeafe;
  color: #1e40af;
}

.role-manager {
  background: #fef3c7;
  color: #92400e;
}

.role-admin {
  background: #fecaca;
  color: #991b1b;
}

.role-secretaire {
  background: #d1fae5;
  color: #065f46;
}

.role-livreur {
  background: #e0e7ff;
  color: #3730a3;
}

.login-options {
  margin-bottom: 1rem;
}

.login-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.password-section {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.password-hint {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}
</style>
