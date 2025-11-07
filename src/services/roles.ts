import { computed } from 'vue'
import { useAuth } from './auth'

// Types pour les rôles et permissions
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'operator' | 'production_manager' | 'production_operator' | 'logistics_manager' | 'logistics_operator' | 'inventory_manager' | 'viewer'

export interface UserPermissions {
  canViewProduction: boolean
  canEditProduction: boolean
  canDeleteProduction: boolean
  canViewCommandes: boolean
  canEditCommandes: boolean
  canDeleteCommandes: boolean
  canViewLivraisons: boolean
  canEditLivraisons: boolean
  canDeleteLivraisons: boolean
  canViewStock: boolean
  canEditStock: boolean
  canDeleteStock: boolean
  canViewPersonnel: boolean
  canEditPersonnel: boolean
  canDeletePersonnel: boolean
  canViewAnalyses: boolean
  canViewParametres: boolean
  canEditParametres: boolean
  canManageUsers: boolean
  canDelete: boolean  // Permission générale de suppression
}

// Définition des permissions par rôle
const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  super_admin: {
    canViewProduction: true,
    canEditProduction: true,
    canDeleteProduction: true,
    canViewCommandes: true,
    canEditCommandes: true,
    canDeleteCommandes: true,
    canViewLivraisons: true,
    canEditLivraisons: true,
    canDeleteLivraisons: true,
    canViewStock: true,
    canEditStock: true,
    canDeleteStock: true,
    canViewPersonnel: true,
    canEditPersonnel: true,
    canDeletePersonnel: true,
    canViewAnalyses: true,
    canViewParametres: true,
    canEditParametres: true,
    canManageUsers: true,
    canDelete: true
  },
  admin: {
    canViewProduction: true,
    canEditProduction: true,
    canDeleteProduction: true,
    canViewCommandes: true,
    canEditCommandes: true,
    canDeleteCommandes: true,
    canViewLivraisons: true,
    canEditLivraisons: true,
    canDeleteLivraisons: true,
    canViewStock: true,
    canEditStock: true,
    canDeleteStock: true,
    canViewPersonnel: true,
    canEditPersonnel: true,
    canDeletePersonnel: true,
    canViewAnalyses: true,
    canViewParametres: true,
    canEditParametres: false,
    canManageUsers: false,
    canDelete: true
  },
  manager: {
    canViewProduction: true,
    canEditProduction: true,
    canDeleteProduction: true,
    canViewCommandes: true,
    canEditCommandes: true,
    canDeleteCommandes: true,
    canViewLivraisons: false,
    canEditLivraisons: false,
    canDeleteLivraisons: false,
    canViewStock: true,
    canEditStock: true,
    canDeleteStock: true,
    canViewPersonnel: false,
    canEditPersonnel: false,
    canDeletePersonnel: false,
    canViewAnalyses: false,
    canViewParametres: false,
    canEditParametres: false,
    canManageUsers: false,
    canDelete: true
  },
  operator: {
    canViewProduction: false,
    canEditProduction: false,
    canDeleteProduction: false,
    canViewCommandes: false,
    canEditCommandes: false,
    canDeleteCommandes: false,
    canViewLivraisons: true,
    canEditLivraisons: true,
    canDeleteLivraisons: false,
    canViewStock: false,
    canEditStock: false,
    canDeleteStock: false,
    canViewPersonnel: false,
    canEditPersonnel: false,
    canDeletePersonnel: false,
    canViewAnalyses: false,
    canViewParametres: false,
    canEditParametres: false,
    canManageUsers: false,
    canDelete: false
  },
  production_manager: {
    canViewProduction: true,
    canEditProduction: true,
    canDeleteProduction: true,
    canViewCommandes: false,
    canEditCommandes: false,
    canDeleteCommandes: false,
    canViewLivraisons: false,
    canEditLivraisons: false,
    canDeleteLivraisons: false,
    canViewStock: true,
    canEditStock: true,
    canDeleteStock: false,
    canViewPersonnel: false,
    canEditPersonnel: false,
    canDeletePersonnel: false,
    canViewAnalyses: true,
    canViewParametres: false,
    canEditParametres: false,
    canManageUsers: false,
    canDelete: false
  },
  production_operator: {
    canViewProduction: true,
    canEditProduction: true,
    canDeleteProduction: false,
    canViewCommandes: false,
    canEditCommandes: false,
    canDeleteCommandes: false,
    canViewLivraisons: false,
    canEditLivraisons: false,
    canDeleteLivraisons: false,
    canViewStock: true,
    canEditStock: false,
    canDeleteStock: false,
    canViewPersonnel: false,
    canEditPersonnel: false,
    canDeletePersonnel: false,
    canViewAnalyses: false,
    canViewParametres: false,
    canEditParametres: false,
    canManageUsers: false,
    canDelete: false
  },
  logistics_manager: {
    canViewProduction: false,
    canEditProduction: false,
    canDeleteProduction: false,
    canViewCommandes: true,
    canEditCommandes: true,
    canDeleteCommandes: true,
    canViewLivraisons: true,
    canEditLivraisons: true,
    canDeleteLivraisons: true,
    canViewStock: false,
    canEditStock: false,
    canDeleteStock: false,
    canViewPersonnel: false,
    canEditPersonnel: false,
    canDeletePersonnel: false,
    canViewAnalyses: true,
    canViewParametres: false,
    canEditParametres: false,
    canManageUsers: false,
    canDelete: false
  },
  logistics_operator: {
    canViewProduction: false,
    canEditProduction: false,
    canDeleteProduction: false,
    canViewCommandes: true,
    canEditCommandes: false,
    canDeleteCommandes: false,
    canViewLivraisons: true,
    canEditLivraisons: true,
    canDeleteLivraisons: false,
    canViewStock: false,
    canEditStock: false,
    canDeleteStock: false,
    canViewPersonnel: false,
    canEditPersonnel: false,
    canDeletePersonnel: false,
    canViewAnalyses: false,
    canViewParametres: false,
    canEditParametres: false,
    canManageUsers: false,
    canDelete: false
  },
  inventory_manager: {
    canViewProduction: false,
    canEditProduction: false,
    canDeleteProduction: false,
    canViewCommandes: false,
    canEditCommandes: false,
    canDeleteCommandes: false,
    canViewLivraisons: false,
    canEditLivraisons: false,
    canDeleteLivraisons: false,
    canViewStock: true,
    canEditStock: true,
    canDeleteStock: false,
    canViewPersonnel: false,
    canEditPersonnel: false,
    canDeletePersonnel: false,
    canViewAnalyses: true,
    canViewParametres: false,
    canEditParametres: false,
    canManageUsers: false,
    canDelete: false
  },
  viewer: {
    canViewProduction: true,
    canEditProduction: false,
    canDeleteProduction: false,
    canViewCommandes: true,
    canEditCommandes: false,
    canDeleteCommandes: false,
    canViewLivraisons: true,
    canEditLivraisons: false,
    canDeleteLivraisons: false,
    canViewStock: true,
    canEditStock: false,
    canDeleteStock: false,
    canViewPersonnel: false,
    canEditPersonnel: false,
    canDeletePersonnel: false,
    canViewAnalyses: true,
    canViewParametres: false,
    canEditParametres: false,
    canManageUsers: false,
    canDelete: false
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
  const canDeleteProduction = computed(() => permissions.value.canDeleteProduction)
  const canViewCommandes = computed(() => permissions.value.canViewCommandes)
  const canEditCommandes = computed(() => permissions.value.canEditCommandes)
  const canDeleteCommandes = computed(() => permissions.value.canDeleteCommandes)
  const canViewLivraisons = computed(() => permissions.value.canViewLivraisons)
  const canEditLivraisons = computed(() => permissions.value.canEditLivraisons)
  const canDeleteLivraisons = computed(() => permissions.value.canDeleteLivraisons)
  const canViewStock = computed(() => permissions.value.canViewStock)
  const canEditStock = computed(() => permissions.value.canEditStock)
  const canDeleteStock = computed(() => permissions.value.canDeleteStock)
  const canViewPersonnel = computed(() => permissions.value.canViewPersonnel)
  const canEditPersonnel = computed(() => permissions.value.canEditPersonnel)
  const canDeletePersonnel = computed(() => permissions.value.canDeletePersonnel)
  const canViewAnalyses = computed(() => permissions.value.canViewAnalyses)
  const canViewParametres = computed(() => permissions.value.canViewParametres)
  const canEditParametres = computed(() => permissions.value.canEditParametres)
  const canManageUsers = computed(() => permissions.value.canManageUsers)
  const canDelete = computed(() => permissions.value.canDelete)

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
      super_admin: 10,
      admin: 9,
      manager: 8,
      production_manager: 6,
      logistics_manager: 6,
      inventory_manager: 6,
      production_operator: 4,
      logistics_operator: 4,
      operator: 3,
      viewer: 1
    }
    
    return roleHierarchy[currentRole.value] > roleHierarchy[targetRole]
  }

  // Nom d'affichage du rôle
  const roleDisplayName = computed(() => {
    const roleNames: Record<UserRole, string> = {
      super_admin: 'Super Administrateur',
      admin: 'Administrateur',
      manager: 'Manager',
      operator: 'Opérateur',
      production_manager: 'Responsable Production',
      production_operator: 'Opérateur Production',
      logistics_manager: 'Responsable Logistique',
      logistics_operator: 'Opérateur Logistique',
      inventory_manager: 'Responsable Inventaire',
      viewer: 'Consultant'
    }
    return roleNames[currentRole.value]
  })

  // Couleur du rôle pour l'affichage
  const roleColor = computed(() => {
    const roleColors: Record<UserRole, string> = {
      super_admin: 'text-red-600 bg-red-50',
      admin: 'text-blue-600 bg-blue-50',
      manager: 'text-purple-600 bg-purple-50',
      operator: 'text-indigo-600 bg-indigo-50',
      production_manager: 'text-green-600 bg-green-50',
      production_operator: 'text-emerald-600 bg-emerald-50',
      logistics_manager: 'text-yellow-600 bg-yellow-50',
      logistics_operator: 'text-amber-600 bg-amber-50',
      inventory_manager: 'text-cyan-600 bg-cyan-50',
      viewer: 'text-gray-600 bg-gray-50'
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
    canDeleteProduction,
    canViewCommandes,
    canEditCommandes,
    canDeleteCommandes,
    canViewLivraisons,
    canEditLivraisons,
    canDeleteLivraisons,
    canViewStock,
    canEditStock,
    canDeleteStock,
    canViewPersonnel,
    canEditPersonnel,
    canDeletePersonnel,
    canViewAnalyses,
    canViewParametres,
    canEditParametres,
    canManageUsers,
    canDelete,

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
