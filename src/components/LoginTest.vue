<template>
  <div class="login-test">
    <h3>Test de connexion Supabase</h3>
    
    <div class="test-form">
      <div class="form-group">
        <label for="test-email">Email de test :</label>
        <input
          id="test-email"
          v-model="testEmail"
          type="email"
          placeholder="test@example.com"
          class="form-input"
        />
      </div>
      
      <div class="form-group">
        <label for="test-password">Mot de passe de test :</label>
        <input
          id="test-password"
          v-model="testPassword"
          type="password"
          placeholder="password123"
          class="form-input"
        />
      </div>
      
      <div class="form-actions">
        <button @click="testLogin" :disabled="isLoading" class="btn btn-primary">
          {{ isLoading ? 'Connexion...' : 'Tester la connexion' }}
        </button>
        <button @click="testLogout" :disabled="isLoading" class="btn btn-secondary">
          Tester la déconnexion
        </button>
      </div>
    </div>

    <div v-if="error" class="error">
      <p><strong>Erreur :</strong> {{ error }}</p>
    </div>

    <div v-if="success" class="success">
      <p><strong>Succès :</strong> {{ success }}</p>
    </div>

    <div class="logs">
      <h4>Logs de connexion :</h4>
      <div class="logs-content">
        <div v-for="(log, index) in logs" :key="index" :class="log.type">
          {{ log.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../services/auth'

const { signIn, signOut, isLoading, isAuthenticated, user } = useAuth()

const testEmail = ref('test@example.com')
const testPassword = ref('password123')
const error = ref('')
const success = ref('')
const logs = ref<Array<{type: string, message: string}>>([])

const addLog = (type: string, message: string) => {
  logs.value.push({ type, message })
  // Garder seulement les 10 derniers logs
  if (logs.value.length > 10) {
    logs.value.shift()
  }
}

const testLogin = async () => {
  error.value = ''
  success.value = ''
  logs.value = []
  
  addLog('info', '🔐 Début du test de connexion')
  addLog('info', `📧 Email: ${testEmail.value}`)
  
  try {
    await signIn({ email: testEmail.value, password: testPassword.value })
    addLog('success', '✅ Connexion réussie !')
    success.value = 'Connexion réussie !'
  } catch (err: any) {
    addLog('error', `❌ Erreur: ${err.message}`)
    error.value = err.message || 'Erreur de connexion'
  }
}

const testLogout = async () => {
  error.value = ''
  success.value = ''
  logs.value = []
  
  addLog('info', '🔐 Début du test de déconnexion')
  
  try {
    await signOut()
    addLog('success', '✅ Déconnexion réussie !')
    success.value = 'Déconnexion réussie !'
  } catch (err: any) {
    addLog('error', `❌ Erreur: ${err.message}`)
    error.value = err.message || 'Erreur de déconnexion'
  }
}
</script>

<style scoped>
.login-test {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 20px 0;
  background: #f9f9f9;
}

.test-form {
  margin: 15px 0;
}

.form-group {
  margin: 10px 0;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  margin: 15px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.error {
  color: #dc3545;
  background: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.success {
  color: #155724;
  background: #d4edda;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.logs {
  margin: 20px 0;
}

.logs h4 {
  margin: 10px 0;
  font-size: 16px;
}

.logs-content {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
}

.logs-content .info {
  color: #6c757d;
}

.logs-content .success {
  color: #28a745;
  background: none;
  padding: 0;
  margin: 0;
}

.logs-content .error {
  color: #dc3545;
  background: none;
  padding: 0;
  margin: 0;
}
</style>
