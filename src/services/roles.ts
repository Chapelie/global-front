import { computed } from 'vue'
import { useAuth } from './auth'

// Types pour les rôles et permissions
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'operator'

export interface UserPermissions {
  canViewProduction: boolean
  canEditProduction: boolean
  canViewCommandes: boolean
  canEditCommandes: boolean
  canViewLivraisons: boolean
  canEditLivraisons: boolean
  canViewStock: boolean
  canEditStock: boolean
  canViewPersonnel: boolean
  canEditPersonnel: boolean
  canViewAnalyses: boolean
  canViewParametres: boolean
  canEditParametres: boolean
  canManageUsers: boolean
}

// Définition des permissions par rôle
const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  super_admin: {
    canViewProduction: true,
    canEditProduction: true,
    canViewCommandes: true,
    canEditCommandes: true,
    canViewLivraisons: true,
    canEditLivraisons: true,
    canViewStock: true,
    canEditStock: true,
    canViewPersonnel: true,
    canEditPersonnel: true,
    canViewAnalyses: true,
    canViewParametres: true,
    canEditParametres: true,
    canManageUsers: true
  },
  admin: {
    canViewProduction: true,
    canEditProduction: true,
    canViewCommandes: true,
    canEditCommandes: true,
    canViewLivraisons: true,
    canEditLivraisons: true,
    canViewStock: true,
    canEditStock: true,
    canViewPersonnel: true,
    canEditPersonnel: true,
    canViewAnalyses: true,
    canViewParametres: true,
    canEditParametres: false,
    canManageUsers: false
  },
  manager: {
    canViewProduction: true,
    canEditProduction: true,
    canViewCommandes: true,
    canEditCommandes: true,
    canViewLivraisons: true,
    canEditLivraisons: true,
    canViewStock: true,
    canEditStock: true,
    canViewPersonnel: true,
    canEditPersonnel: false,
    canViewAnalyses: true,
    canViewParametres: false,
    canEditParametres: false,
    canManageUsers: false
  },
  operator: {
    canViewProduction: true,
    canEditProduction: false,
    canViewCommandes: true,
    canEditCommandes: false,
    canViewLivraisons: true,
    canEditLivraisons: false,
    canViewStock: true,
    canEditStock: false,
    canViewPersonnel: false,
    canEditPersonnel: false,
    canViewAnalyses: false,
    canViewParametres: false,
    canEditParametres: false,
    canManageUsers: false
  }
}

// Composable pour la gestion des rôles et permissions
export const useRoles = () => {
  const { user } = useAuth()

  // Rôle actuel de l'utilisateur
  const currentRole = computed((): UserRole => {
    return (user.value?.roles?.[0]?.name as UserRole) || 'operator'
  })

  // Permissions actuelles de l'utilisateur
  const permissions = computed((): UserPermissions => {
    return ROLE_PERMISSIONS[currentRole.value]
  })

  // Vérifications de permissions spécifiques
  const canViewProduction = computed(() => permissions.value.canViewProduction)
  const canEditProduction = computed(() => permissions.value.canEditProduction)
  const canViewCommandes = computed(() => permissions.value.canViewCommandes)
  const canEditCommandes = computed(() => permissions.value.canEditCommandes)
  const canViewLivraisons = computed(() => permissions.value.canViewLivraisons)
  const canEditLivraisons = computed(() => permissions.value.canEditLivraisons)
  const canViewStock = computed(() => permissions.value.canViewStock)
  const canEditStock = computed(() => permissions.value.canEditStock)
  const canViewPersonnel = computed(() => permissions.value.canViewPersonnel)
  const canEditPersonnel = computed(() => permissions.value.canEditPersonnel)
  const canViewAnalyses = computed(() => permissions.value.canViewAnalyses)
  const canViewParametres = computed(() => permissions.value.canViewParametres)
  const canEditParametres = computed(() => permissions.value.canEditParametres)
  const canManageUsers = computed(() => permissions.value.canManageUsers)

  // Vérification générique de permission
  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return permissions.value[permission]
  }

  // Vérification de rôle
  const hasRole = (role: UserRole): boolean => {
    return currentRole.value === role
  }

  // Vérification de plusieurs rôles
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(currentRole.value)
  }

  // Vérification de hiérarchie des rôles
  const isHigherRole = (targetRole: UserRole): boolean => {
    const roleHierarchy: Record<UserRole, number> = {
      super_admin: 4,
      admin: 3,
      manager: 2,
      operator: 1
    }
    
    return roleHierarchy[currentRole.value] > roleHierarchy[targetRole]
  }

  // Nom d'affichage du rôle
  const roleDisplayName = computed(() => {
    const roleNames: Record<UserRole, string> = {
      super_admin: 'Super Administrateur',
      admin: 'Administrateur',
      manager: 'Manager',
      operator: 'Opérateur'
    }
    return roleNames[currentRole.value]
  })

  // Couleur du rôle pour l'affichage
  const roleColor = computed(() => {
    const roleColors: Record<UserRole, string> = {
      super_admin: 'text-red-600 bg-red-50',
      admin: 'text-blue-600 bg-blue-50',
      manager: 'text-purple-600 bg-purple-50',
      operator: 'text-indigo-600 bg-indigo-50'
    }
    return roleColors[currentRole.value]
  })

  return {
    // État
    currentRole,
    permissions,
    roleDisplayName,
    roleColor,

    // Vérifications de permissions
    canViewProduction,
    canEditProduction,
    canViewCommandes,
    canEditCommandes,
    canViewLivraisons,
    canEditLivraisons,
    canViewStock,
    canEditStock,
    canViewPersonnel,
    canEditPersonnel,
    canViewAnalyses,
    canViewParametres,
    canEditParametres,
    canManageUsers,

    // Méthodes utilitaires
    hasPermission,
    hasRole,
    hasAnyRole,
    isHigherRole
  }
}

// Fonction utilitaire pour vérifier les permissions dans les composants
export const checkPermission = (permission: keyof UserPermissions): boolean => {
  const { hasPermission } = useRoles()
  return hasPermission(permission)
}

// Fonction utilitaire pour vérifier les rôles dans les composants
export const checkRole = (role: UserRole): boolean => {
  const { hasRole } = useRoles()
  return hasRole(role)
}

// Export des constantes pour utilisation dans d'autres fichiers
export { ROLE_PERMISSIONS }
