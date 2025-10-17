/**
 * Service d'authentification Laravel avec Laravel Sanctum
 * Remplace auth.ts (Supabase) pour utiliser le backend Laravel
 */

import { ref, computed } from 'vue'
import { useLaravelApi, type LaravelUser } from './laravelApiService'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  role?: string
}

interface AuthResponse {
  user: LaravelUser
  token: string
  message?: string
}

interface PasswordResetRequest {
  email: string
}

interface PasswordReset {
  email: string
  password: string
  password_confirmation: string
  token: string
}

class LaravelAuthService {
  private api = useLaravelApi()
  private user = ref<LaravelUser | null>(null)
  private loading = ref(false)

  constructor() {
    this.loadUserFromStorage()
  }

  // Getters
  get currentUser() {
    return computed(() => this.user.value)
  }

  get isAuthenticated() {
    return computed(() => !!this.user.value && !!this.api.isAuthenticated.value)
  }

  get isLoading() {
    return computed(() => this.loading.value)
  }

  get userRole() {
    return computed(() => this.user.value?.role || 'guest')
  }

  get isAdmin() {
    return computed(() => ['admin', 'super_admin'].includes(this.userRole.value))
  }

  get isManager() {
    return computed(() => ['manager', 'admin', 'super_admin'].includes(this.userRole.value))
  }

  get isOperator() {
    return computed(() => ['operator', 'manager', 'admin', 'super_admin'].includes(this.userRole.value))
  }

  // Charger l'utilisateur depuis le localStorage
  private loadUserFromStorage() {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (storedUser && token) {
      try {
        this.user.value = JSON.parse(storedUser)
        this.api.setToken(token)
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur stocké:', error)
        this.clearAuth()
      }
    }
  }

  // Sauvegarder l'utilisateur dans le localStorage
  private saveUserToStorage(user: LaravelUser, token: string) {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    this.api.setToken(token)
  }

  // Nettoyer l'authentification
  private clearAuth() {
    this.user.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    this.api.setToken(null)
  }

  // Connexion
  async signIn(credentials: LoginCredentials): Promise<{ success: boolean; error?: string; user?: LaravelUser }> {
    this.loading.value = true
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion')
      }

      // Sauvegarder l'utilisateur et le token
      this.user.value = data.user
      this.saveUserToStorage(data.user, data.token)

      console.log('✅ Connexion réussie:', data.user)
      return { success: true, user: data.user }

    } catch (error) {
      console.error('❌ Erreur de connexion:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      }
    } finally {
      this.loading.value = false
    }
  }

  // Inscription
  async signUp(userData: RegisterData): Promise<{ success: boolean; error?: string; user?: LaravelUser }> {
    this.loading.value = true
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur d\'inscription')
      }

      // Sauvegarder l'utilisateur et le token
      this.user.value = data.user
      this.saveUserToStorage(data.user, data.token)

      console.log('✅ Inscription réussie:', data.user)
      return { success: true, user: data.user }

    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur d\'inscription' 
      }
    } finally {
      this.loading.value = false
    }
  }

  // Déconnexion
  async signOut(): Promise<void> {
    this.loading.value = true
    
    try {
      // Appeler l'endpoint de déconnexion du backend
      await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.api.isAuthenticated.value ? localStorage.getItem('token') : ''}`,
          'Accept': 'application/json'
        }
      })
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      this.clearAuth()
      this.loading.value = false
      console.log('✅ Déconnexion réussie')
    }
  }

  // Obtenir la session actuelle
  async getSession(): Promise<LaravelUser | null> {
    if (!this.api.isAuthenticated.value) {
      return null
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Session invalide')
      }

      const data = await response.json()
      this.user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
      
      return data.user
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error)
      this.clearAuth()
      return null
    }
  }

  // Réinitialiser le mot de passe
  async resetPassword(request: PasswordResetRequest): Promise<{ success: boolean; error?: string }> {
    this.loading.value = true
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la réinitialisation')
      }

      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la réinitialisation' 
      }
    } finally {
      this.loading.value = false
    }
  }

  // Mettre à jour le mot de passe
  async updatePassword(passwordData: { current_password: string; password: string; password_confirmation: string }): Promise<{ success: boolean; error?: string }> {
    this.loading.value = true
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(passwordData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour')
      }

      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' 
      }
    } finally {
      this.loading.value = false
    }
  }

  // Mettre à jour le profil
  async updateProfile(profileData: { name?: string; email?: string }): Promise<{ success: boolean; error?: string; user?: LaravelUser }> {
    this.loading.value = true
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour')
      }

      this.user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))

      return { success: true, user: data.user }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' 
      }
    } finally {
      this.loading.value = false
    }
  }

  // Mettre à jour le rôle utilisateur (admin seulement)
  async updateUserRole(userId: number, role: string): Promise<{ success: boolean; error?: string }> {
    this.loading.value = true
    
    try {
      const response = await fetch(`http://localhost:8000/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ role })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du rôle')
      }

      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du rôle' 
      }
    } finally {
      this.loading.value = false
    }
  }

  // Créer un profil utilisateur
  async createUserProfile(userData: Partial<LaravelUser>): Promise<{ success: boolean; error?: string }> {
    this.loading.value = true
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création')
      }

      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la création' 
      }
    } finally {
      this.loading.value = false
    }
  }

  // Obtenir tous les utilisateurs (admin seulement)
  async getUsers(): Promise<{ success: boolean; error?: string; users?: LaravelUser[] }> {
    try {
      const response = await fetch('http://localhost:8000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération')
      }

      return { success: true, users: data.users || [] }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération' 
      }
    }
  }

  // Vérifier si l'utilisateur a une permission spécifique
  hasPermission(permission: string): boolean {
    if (!this.user.value) return false
    
    const userRole = this.user.value.role
    
    // Logique des permissions basée sur les rôles
    const permissions = {
      'guest': [],
      'operator': ['read_articles', 'read_consommables', 'read_commandes', 'read_livraisons', 'read_productions'],
      'manager': ['read_articles', 'write_articles', 'read_consommables', 'write_consommables', 'read_commandes', 'write_commandes', 'read_livraisons', 'write_livraisons', 'read_productions', 'write_productions'],
      'admin': ['*'], // Toutes les permissions
      'super_admin': ['*'] // Toutes les permissions
    }

    const userPermissions = permissions[userRole as keyof typeof permissions] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  // Écouteur d'état d'authentification (simulation)
  onAuthStateChange(callback: (user: LaravelUser | null) => void): () => void {
    // Dans Laravel Sanctum, on peut implémenter un système de polling
    // ou utiliser WebSockets pour les changements d'état en temps réel
    const checkAuthState = () => {
      if (this.api.isAuthenticated.value && !this.user.value) {
        this.getSession()
      }
      callback(this.user.value)
    }

    // Vérifier l'état au chargement
    checkAuthState()

    // Retourner une fonction de nettoyage
    return () => {
      // Nettoyage si nécessaire
    }
  }

  // Initialiser le service
  async init(): Promise<void> {
    if (this.api.isAuthenticated.value) {
      await this.getSession()
    }
  }
}

// Instance singleton
const laravelAuthService = new LaravelAuthService()

// Composable pour Vue
export function useLaravelAuth() {
  return laravelAuthService
}

// Export de l'instance pour utilisation directe
export default laravelAuthService

// Export des types
export type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  PasswordResetRequest,
  PasswordReset
}
