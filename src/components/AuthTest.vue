<template>
  <div class="auth-test">
    <h3>Test d'authentification Supabase</h3>
    
    <div class="status">
      <p><strong>État de l'authentification :</strong></p>
      <ul>
        <li>Initialisé : {{ isInitialized ? '✅ Oui' : '❌ Non' }}</li>
        <li>Chargement : {{ isLoading ? '⏳ Oui' : '✅ Non' }}</li>
        <li>Authentifié : {{ isAuthenticated ? '✅ Oui' : '❌ Non' }}</li>
      </ul>
    </div>

    <div v-if="user" class="user-info">
      <p><strong>Utilisateur connecté :</strong></p>
      <ul>
        <li>ID : {{ user.id }}</li>
        <li>Email : {{ user.email }}</li>
        <li>Rôle : {{ user.user_metadata?.role || 'Non défini' }}</li>
        <li>Prénom : {{ user.user_metadata?.first_name || 'Non défini' }}</li>
        <li>Nom : {{ user.user_metadata?.last_name || 'Non défini' }}</li>
      </ul>
    </div>

    <div class="actions">
      <button @click="testSignIn" :disabled="isLoading" class="btn btn-primary">
        Tester la connexion
      </button>
      <button @click="testSignOut" :disabled="isLoading" class="btn btn-secondary">
        Tester la déconnexion
      </button>
      <button @click="refreshAuth" :disabled="isLoading" class="btn btn-info">
        Actualiser l'état
      </button>
    </div>

    <div v-if="error" class="error">
      <p><strong>Erreur :</strong> {{ error }}</p>
    </div>

    <div v-if="success" class="success">
      <p><strong>Succès :</strong> {{ success }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../services/auth'

const { user, isAuthenticated, isLoading, isInitialized, signIn, signOut, initAuth } = useAuth()

const error = ref('')
const success = ref('')

const testSignIn = async () => {
  try {
    error.value = ''
    success.value = ''
    
    // Test avec des identifiants de test
    await signIn('test@example.com', 'password123')
    success.value = 'Connexion réussie !'
  } catch (err: any) {
    error.value = err.message || 'Erreur de connexion'
  }
}

const testSignOut = async () => {
  try {
    error.value = ''
    success.value = ''
    
    await signOut()
    success.value = 'Déconnexion réussie !'
  } catch (err: any) {
    error.value = err.message || 'Erreur de déconnexion'
  }
}

const refreshAuth = async () => {
  try {
    error.value = ''
    success.value = ''
    
    await initAuth()
    success.value = 'Authentification actualisée !'
  } catch (err: any) {
    error.value = err.message || 'Erreur d\'actualisation'
  }
}
</script>

<style scoped>
.auth-test {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 20px 0;
  background: #f9f9f9;
}

.status, .user-info {
  margin: 15px 0;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.status ul, .user-info ul {
  margin: 5px 0;
  padding-left: 20px;
}

.actions {
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

.btn-info {
  background: #17a2b8;
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
</style>
