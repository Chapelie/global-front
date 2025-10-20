import type { RouteLocationNormalized } from 'vue-router'
import { useRoles } from '../services/roles'
// Types pour les rôles utilisateur
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'operator'

// Définition des permissions requises pour chaque route
export const ROUTE_PERMISSIONS: Record<string, {
  requiredRoles?: UserRole[]
  requiredPermissions?: string[]
  redirectTo?: string
}> = {
  '/': {
    requiredRoles: ['super_admin', 'admin', 'manager', 'operator']
  },
  '/production': {
    requiredRoles: ['super_admin', 'admin', 'manager'],
    requiredPermissions: ['canViewProduction']
  },
  '/commandes': {
    requiredRoles: ['super_admin', 'admin', 'manager', 'operator'],
    requiredPermissions: ['canViewCommandes']
  },
  '/livraison': {
    requiredRoles: ['super_admin', 'admin', 'manager', 'operator'],
    requiredPermissions: ['canViewLivraisons']
  },
  '/stock': {
    requiredRoles: ['super_admin', 'admin', 'manager'],
    requiredPermissions: ['canViewStock']
  },
  '/personnel': {
    requiredRoles: ['super_admin', 'admin', 'manager'],
    requiredPermissions: ['canViewPersonnel']
  },
  '/analyses': {
    requiredRoles: ['super_admin', 'admin', 'manager'],
    requiredPermissions: ['canViewAnalyses']
  },
  '/parametres': {
    requiredRoles: ['super_admin', 'admin'],
    requiredPermissions: ['canViewParametres']
  }
}

// Garde de route pour vérifier les permissions
export const checkRoutePermissions = (to: RouteLocationNormalized): {
  allowed: boolean
  redirectTo?: string
  reason?: string
} => {
  const routeConfig = ROUTE_PERMISSIONS[to.path]
  
  if (!routeConfig) {
    // Route sans restrictions
    return { allowed: true }
  }

  const { currentRole, hasRole, hasAnyRole, hasPermission } = useRoles()

  // Vérifier les rôles requis
  if (routeConfig.requiredRoles && routeConfig.requiredRoles.length > 0) {
    if (!hasAnyRole(routeConfig.requiredRoles)) {
      return {
        allowed: false,
        redirectTo: '/',
        reason: `Accès refusé. Rôle requis: ${routeConfig.requiredRoles.join(' ou ')}`
      }
    }
  }

  // Vérifier les permissions requises
  if (routeConfig.requiredPermissions && routeConfig.requiredPermissions.length > 0) {
    for (const permission of routeConfig.requiredPermissions) {
      if (!hasPermission(permission as any)) {
        return {
          allowed: false,
          redirectTo: '/',
          reason: `Permission manquante: ${permission}`
        }
      }
    }
  }

  return { allowed: true }
}

// Garde pour les routes d'administration
export const adminGuard = (to: RouteLocationNormalized) => {
  const { hasRole } = useRoles()
  
  if (!hasRole('super_admin') && !hasRole('admin')) {
    return {
      allowed: false,
      redirectTo: '/',
      reason: 'Accès administrateur requis'
    }
  }
  
  return { allowed: true }
}

// Garde pour les routes de gestion des utilisateurs
export const userManagementGuard = (to: RouteLocationNormalized) => {
  const { hasRole } = useRoles()
  
  if (!hasRole('super_admin')) {
    return {
      allowed: false,
      redirectTo: '/',
      reason: 'Accès super administrateur requis'
    }
  }
  
  return { allowed: true }
}

// Fonction utilitaire pour créer des gardes personnalisés
export const createRoleGuard = (requiredRoles: UserRole[], redirectTo: string = '/') => {
  return (to: RouteLocationNormalized) => {
    const { hasAnyRole } = useRoles()
    
    if (!hasAnyRole(requiredRoles)) {
      return {
        allowed: false,
        redirectTo,
        reason: `Rôle requis: ${requiredRoles.join(' ou ')}`
      }
    }
    
    return { allowed: true }
  }
}

// Fonction utilitaire pour créer des gardes de permission
export const createPermissionGuard = (requiredPermissions: string[], redirectTo: string = '/') => {
  return (to: RouteLocationNormalized) => {
    const { hasPermission } = useRoles()
    
    for (const permission of requiredPermissions) {
      if (!hasPermission(permission as any)) {
        return {
          allowed: false,
          redirectTo,
          reason: `Permission manquante: ${permission}`
        }
      }
    }
    
    return { allowed: true }
  }
}
