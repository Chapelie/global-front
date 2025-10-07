import { ref, computed } from 'vue'
import { supabase, type User, type AuthState, type UserRole } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

// État global de l'authentification
const authState = ref<AuthState>({
  user: null,
  loading: true,
  initialized: false
})

// Composable pour l'authentification
export const useAuth = () => {

  // Getters
  const user = computed(() => authState.value.user)
  const isAuthenticated = computed(() => !!authState.value.user)
  const isLoading = computed(() => authState.value.loading)
  const isInitialized = computed(() => authState.value.initialized)

  // Initialiser l'auth listener
  const initAuth = async () => {
    console.log('🔐 [Auth] initAuth() - Début')
    console.log('🔍 [Auth] Supabase client:', supabase ? 'Disponible' : 'Non disponible')
    
    if (!supabase) {
      console.error('❌ [Auth] Supabase client non disponible')
      authState.value.loading = false
      authState.value.initialized = true
      return
    }

    try {
      console.log('📡 [Auth] Récupération de la session actuelle')
      // Récupérer la session actuelle
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('❌ [Auth] Erreur lors de la récupération de session:', error)
      } else {
        console.log('✅ [Auth] Session récupérée:', session ? 'Session active' : 'Aucune session')
      }

      if (session?.user) {
        console.log('👤 [Auth] Utilisateur trouvé dans la session:', session.user.email)
        authState.value.user = session.user as User
      } else {
        console.log('👤 [Auth] Aucun utilisateur dans la session')
      }

      // Écouter les changements d'authentification
      console.log('👂 [Auth] Configuration du listener d\'authentification')
      supabase.auth.onAuthStateChange((event: any, session: any) => {
        console.log('🔄 [Auth] Auth state changed:', event, session?.user?.email)

        if (session?.user) {
          console.log('✅ [Auth] Utilisateur connecté:', session.user.email)
          authState.value.user = session.user as User
          // Synchronisation automatique via Supabase (plus de syncService nécessaire)
        } else {
          console.log('❌ [Auth] Utilisateur déconnecté')
          authState.value.user = null
        }

        authState.value.loading = false
      })

      authState.value.initialized = true
      authState.value.loading = false
      console.log('✅ [Auth] Initialisation terminée')
    } catch (error) {
      console.error('❌ [Auth] Erreur lors de l\'initialisation de l\'auth:', error)
      authState.value.loading = false
      authState.value.initialized = true
    }
  }

  // Connexion avec email/mot de passe
  const signIn = async (email: string, password: string) => {
    console.log('🔐 [Auth] signIn() - Début')
    console.log('📧 [Auth] Email:', email)
    authState.value.loading = true

    console.log('📡 [Auth] Appel Supabase: signInWithPassword()')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ [Auth] Erreur de connexion:', error)
      authState.value.loading = false
      throw new Error(getErrorMessage(error.message))
    }

    console.log('✅ [Auth] Connexion réussie:', data.user?.email)
    console.log('👤 [Auth] User ID:', data.user?.id)
    return data
  }

  // Inscription avec email/mot de passe
  const signUp = async (email: string, password: string, metadata?: {
    first_name?: string
    last_name?: string
    role?: UserRole
    phone?: string
  }) => {
    console.log('🔐 [Auth] signUp() - Début')
    console.log('📧 [Auth] Email:', email)
    console.log('👤 [Auth] Métadonnées:', metadata)
    
    authState.value.loading = true

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata?.first_name || '',
          last_name: metadata?.last_name || '',
          role: metadata?.role || 'secretaire', // Rôle par défaut
          phone: metadata?.phone || '',
          full_name: `${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim()
        }
      }
    })

    if (error) {
      console.error('❌ [Auth] Erreur d\'inscription:', error)
      authState.value.loading = false
      throw new Error(getErrorMessage(error.message))
    }

    console.log('✅ [Auth] Inscription réussie:', data.user?.email)
    console.log('👤 [Auth] User ID:', data.user?.id)
    
    // Créer le profil utilisateur dans la table users
    if (data.user) {
      try {
        await createUserProfile(data.user.id, {
          email: data.user.email!,
          first_name: metadata?.first_name || '',
          last_name: metadata?.last_name || '',
          role: metadata?.role || 'secretaire',
          phone: metadata?.phone || ''
        })
      } catch (profileError) {
        console.warn('⚠️ [Auth] Erreur lors de la création du profil:', profileError)
        // Ne pas faire échouer l'inscription pour cette erreur
      }
    }

    authState.value.loading = false
    return data
  }

  // Connexion avec Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) {
      throw new Error(getErrorMessage(error.message))
    }
  }

  // Déconnexion
  const signOut = async () => {
    authState.value.loading = true

    const { error } = await supabase.auth.signOut()

    if (error) {
      authState.value.loading = false
      throw new Error(getErrorMessage(error.message))
    }

    authState.value.user = null
    authState.value.loading = false
  }

  // Réinitialiser le mot de passe
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      throw new Error(getErrorMessage(error.message))
    }
  }

  // Mettre à jour le mot de passe
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new Error(getErrorMessage(error.message))
    }
  }

  // Mettre à jour le profil
  const updateProfile = async (updates: {
    first_name?: string
    last_name?: string
    avatar_url?: string
    role?: UserRole
  }) => {
    const { error } = await supabase.auth.updateUser({
      data: updates
    })

    if (error) {
      throw new Error(getErrorMessage(error.message))
    }

    // Mettre à jour l'état local
    if (authState.value.user) {
      authState.value.user = {
        ...authState.value.user,
        user_metadata: {
          ...authState.value.user.user_metadata,
          ...updates
        }
      }
    }
  }

  // Mettre à jour le rôle d'un utilisateur (admin seulement)
  const updateUserRole = async (userId: string, role: UserRole) => {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    })

    if (error) {
      throw new Error(getErrorMessage(error.message))
    }
  }

  // Obtenir le rôle actuel
  const getCurrentRole = (): UserRole => {
    return authState.value.user?.user_metadata?.role || 'secretaire'
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: UserRole): boolean => {
    return getCurrentRole() === role
  }

  // Vérifier si l'utilisateur a un des rôles spécifiés
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(getCurrentRole())
  }

  // Créer le profil utilisateur dans la table users
  const createUserProfile = async (userId: string, profileData: {
    email: string
    first_name: string
    last_name: string
    role: UserRole
    phone?: string
  }) => {
    console.log('👤 [Auth] createUserProfile() - Début')
    console.log('🆔 [Auth] User ID:', userId)
    console.log('📋 [Auth] Profil:', profileData)

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        role: profileData.role,
        phone: profileData.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [Auth] Erreur création profil:', error)
      throw error
    }

    console.log('✅ [Auth] Profil créé:', data)
    return data
  }

  // Obtenir le profil utilisateur complet
  const getUserProfile = async (userId?: string) => {
    const targetUserId = userId || authState.value.user?.id
    if (!targetUserId) return null

    console.log('👤 [Auth] getUserProfile() - Début')
    console.log('🆔 [Auth] User ID:', targetUserId)

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single()

    if (error) {
      console.error('❌ [Auth] Erreur récupération profil:', error)
      return null
    }

    console.log('✅ [Auth] Profil récupéré:', data)
    return data
  }

  // Mettre à jour le profil utilisateur
  const updateUserProfile = async (updates: {
    first_name?: string
    last_name?: string
    phone?: string
    role?: UserRole
  }) => {
    const userId = authState.value.user?.id
    if (!userId) throw new Error('Utilisateur non authentifié')

    console.log('👤 [Auth] updateUserProfile() - Début')
    console.log('🆔 [Auth] User ID:', userId)
    console.log('📝 [Auth] Mises à jour:', updates)

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ [Auth] Erreur mise à jour profil:', error)
      throw error
    }

    console.log('✅ [Auth] Profil mis à jour:', data)
    return data
  }

  // Obtenir tous les utilisateurs (admin seulement)
  const getAllUsers = async () => {
    console.log('👥 [Auth] getAllUsers() - Début')

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [Auth] Erreur récupération utilisateurs:', error)
      throw error
    }

    console.log('✅ [Auth] Utilisateurs récupérés:', data?.length || 0)
    return data || []
  }

  return {
    // État
    user,
    isAuthenticated,
    isLoading,
    isInitialized,

    // Actions
    initAuth,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    updateUserRole,

    // Profils utilisateurs
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    getAllUsers,

    // Rôles
    getCurrentRole,
    hasRole,
    hasAnyRole
  }
}

// Messages d'erreur traduits
const getErrorMessage = (error: string): string => {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Email ou mot de passe incorrect',
    'Email not confirmed': 'Veuillez confirmer votre email',
    'User not found': 'Utilisateur introuvable',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
    'User already registered': 'Cet email est déjà utilisé',
    'Invalid email': 'Adresse email invalide',
    'Signup is disabled': 'Les inscriptions sont désactivées',
    'Email rate limit exceeded': 'Trop de tentatives, réessayez plus tard'
  }

  return errorMessages[error] || error
}

// Hook pour les notifications push
export const usePushNotifications = () => {
  const isSupported = computed(() => 'Notification' in window && 'serviceWorker' in navigator)
  const permission = ref<NotificationPermission>('default')

  // Demander l'autorisation pour les notifications
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      throw new Error('Les notifications push ne sont pas supportées')
    }

    const result = await Notification.requestPermission()
    permission.value = result

    return result === 'granted'
  }

  // S'abonner aux notifications push
  const subscribe = async (): Promise<PushSubscription | null> => {
    if (permission.value !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        console.warn('VAPID public key manquante')
        return null
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      })

      // Sauvegarder l'abonnement dans Supabase
      const { user } = useAuth()
      if (user.value) {
        await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.value.id,
            subscription: subscription,
            created_at: new Date().toISOString()
          })
      }

      return subscription
    } catch (error) {
      console.error('Erreur lors de l\'abonnement aux notifications:', error)
      return null
    }
  }

  // Se désabonner des notifications
  const unsubscribe = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Supprimer de Supabase
        const { user } = useAuth()
        if (user.value) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .match({ user_id: user.value.id })
        }

        return true
      }

      return false
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error)
      return false
    }
  }

  // Envoyer une notification test locale
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission.value === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        ...options
      })
    }
  }

  return {
    isSupported,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification
  }
}