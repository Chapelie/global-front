/**
 * Configuration Laravel API
 * Configuration centralisée pour les appels API vers le backend Laravel
 */

// Configuration de base
export const LARAVEL_CONFIG = {
  // URL de base de l'API Laravel
  BASE_URL: import.meta.env.VITE_LARAVEL_API_BASE_URL || 'http://localhost:8000/api',

  // URL de base pour l'authentification
  AUTH_URL: `${import.meta.env.VITE_LARAVEL_API_BASE_URL || 'http://localhost:8000/api'}/auth`,
  
  // Timeout pour les requêtes (en millisecondes)
  TIMEOUT: 30000,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  
  // Configuration des endpoints
  ENDPOINTS: {
    // Authentification
    AUTH: {
      LOGIN: '/login',
      REGISTER: '/register',
      LOGOUT: '/logout',
      ME: '/me',
      REFRESH: '/refresh',
      FORGOT_PASSWORD: '/forgot-password',
      RESET_PASSWORD: '/reset-password',
      UPDATE_PASSWORD: '/update-password',
      UPDATE_PROFILE: '/profile'
    },
    
    // Articles
    ARTICLES: {
      INDEX: '/articles',
      STORE: '/articles',
      SHOW: (id: number) => `/articles/${id}`,
      UPDATE: (id: number) => `/articles/${id}`,
      DESTROY: (id: number) => `/articles/${id}`,
      UPDATE_STOCK: (id: number) => `/articles/${id}/stock`,
      STATS: '/articles/stats',
      STOCK_CRITIQUE: '/articles/stock-critique',
      ACTIFS: '/articles/actifs'
    },
    
    // Consommables
    CONSOMMABLES: {
      INDEX: '/consommables',
      STORE: '/consommables',
      SHOW: (id: number) => `/consommables/${id}`,
      UPDATE: (id: number) => `/consommables/${id}`,
      DESTROY: (id: number) => `/consommables/${id}`,
      UPDATE_STOCK: (id: number) => `/consommables/${id}/stock`,
      STATS: '/consommables/stats',
      STOCK_CRITIQUE: '/consommables/stock-critique',
      PERIMES: '/consommables/perimes',
      VA_PERIMER: '/consommables/va-perimer'
    },
    
    // Commandes
    COMMANDES: {
      INDEX: '/commandes',
      STORE: '/commandes',
      SHOW: (id: number) => `/commandes/${id}`,
      UPDATE: (id: number) => `/commandes/${id}`,
      DESTROY: (id: number) => `/commandes/${id}`,
      STATS: '/commandes/stats'
    },
    
    // Livraisons
    LIVRAISONS: {
      INDEX: '/livraisons',
      STORE: '/livraisons',
      SHOW: (id: number) => `/livraisons/${id}`,
      UPDATE: (id: number) => `/livraisons/${id}`,
      DESTROY: (id: number) => `/livraisons/${id}`,
      STATS: '/livraisons/stats'
    },
    
    // Productions
    PRODUCTIONS: {
      INDEX: '/productions',
      STORE: '/productions',
      SHOW: (id: number) => `/productions/${id}`,
      UPDATE: (id: number) => `/productions/${id}`,
      DESTROY: (id: number) => `/productions/${id}`,
      STATS: '/productions/stats'
    },
    
    // Utilisateurs (admin seulement)
    USERS: {
      INDEX: '/users',
      STORE: '/users',
      SHOW: (id: number) => `/users/${id}`,
      UPDATE: (id: number) => `/users/${id}`,
      DESTROY: (id: number) => `/users/${id}`,
      UPDATE_ROLE: (id: number) => `/users/${id}/role`
    }
  },
  
  // Configuration des rôles et permissions
  ROLES: {
    GUEST: 'guest',
    OPERATOR: 'operator',
    MANAGER: 'manager',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },
  
  // Permissions par rôle
  PERMISSIONS: {
    guest: [],
    operator: [
      'read_articles',
      'read_consommables',
      'read_commandes',
      'read_livraisons',
      'read_productions',
      'update_stock'
    ],
    manager: [
      'read_articles',
      'write_articles',
      'read_consommables',
      'write_consommables',
      'read_commandes',
      'write_commandes',
      'read_livraisons',
      'write_livraisons',
      'read_productions',
      'write_productions',
      'update_stock'
    ],
    admin: ['*'],
    super_admin: ['*']
  },
  
  // Configuration des messages d'erreur
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erreur de connexion au serveur',
    UNAUTHORIZED: 'Non autorisé - Veuillez vous reconnecter',
    FORBIDDEN: 'Accès interdit - Permissions insuffisantes',
    NOT_FOUND: 'Ressource non trouvée',
    VALIDATION_ERROR: 'Erreur de validation des données',
    SERVER_ERROR: 'Erreur interne du serveur',
    TIMEOUT: 'Délai d\'attente dépassé',
    UNKNOWN: 'Erreur inconnue'
  },
  
  // Configuration des codes de statut HTTP
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  },
  
  // Configuration du cache
  CACHE: {
    // Durée de cache par défaut (en millisecondes)
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    
    // Clés de cache
    KEYS: {
      USER: 'laravel_user',
      TOKEN: 'laravel_token',
      ARTICLES: 'laravel_articles',
      CONSOMMABLES: 'laravel_consommables',
      COMMANDES: 'laravel_commandes',
      LIVRAISONS: 'laravel_livraisons',
      PRODUCTIONS: 'laravel_productions',
      DASHBOARD_STATS: 'laravel_dashboard_stats'
    }
  },
  
  // Configuration des retry
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 seconde
    BACKOFF_FACTOR: 2
  },
  
  // Configuration du debug
  DEBUG: {
    ENABLED: import.meta.env.DEV,
    LOG_REQUESTS: import.meta.env.DEV,
    LOG_RESPONSES: import.meta.env.DEV,
    LOG_ERRORS: true
  }
} as const

// Types pour la configuration
export type LaravelConfig = typeof LARAVEL_CONFIG
export type LaravelEndpoints = typeof LARAVEL_CONFIG.ENDPOINTS
export type LaravelRoles = typeof LARAVEL_CONFIG.ROLES
export type LaravelPermissions = typeof LARAVEL_CONFIG.PERMISSIONS

// Fonction utilitaire pour construire les URLs
export function buildApiUrl(endpoint: string): string {
  return `${LARAVEL_CONFIG.BASE_URL}${endpoint}`
}

export function buildAuthUrl(endpoint: string): string {
  return `${LARAVEL_CONFIG.AUTH_URL}${endpoint}`
}

// Fonction utilitaire pour obtenir les headers avec authentification
export function getAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { ...LARAVEL_CONFIG.DEFAULT_HEADERS }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// Fonction utilitaire pour vérifier les permissions
export function hasPermission(userRole: string, permission: string): boolean {
  const rolePermissions = LARAVEL_CONFIG.PERMISSIONS[userRole as keyof typeof LARAVEL_CONFIG.PERMISSIONS]
  
  if (!rolePermissions) {
    return false
  }
  
  // L'admin et super_admin ont toutes les permissions
  if (rolePermissions.includes('*' as never)) {
    return true
  }
  
  return rolePermissions.includes(permission as never)
}

// Fonction utilitaire pour obtenir le message d'erreur
export function getErrorMessage(status: number): string {
  switch (status) {
    case LARAVEL_CONFIG.HTTP_STATUS.UNAUTHORIZED:
      return LARAVEL_CONFIG.ERROR_MESSAGES.UNAUTHORIZED
    case LARAVEL_CONFIG.HTTP_STATUS.FORBIDDEN:
      return LARAVEL_CONFIG.ERROR_MESSAGES.FORBIDDEN
    case LARAVEL_CONFIG.HTTP_STATUS.NOT_FOUND:
      return LARAVEL_CONFIG.ERROR_MESSAGES.NOT_FOUND
    case LARAVEL_CONFIG.HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return LARAVEL_CONFIG.ERROR_MESSAGES.VALIDATION_ERROR
    case LARAVEL_CONFIG.HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return LARAVEL_CONFIG.ERROR_MESSAGES.SERVER_ERROR
    default:
      return LARAVEL_CONFIG.ERROR_MESSAGES.UNKNOWN
  }
}

// Fonction utilitaire pour le debug
export function debugLog(message: string, data?: any): void {
  if (LARAVEL_CONFIG.DEBUG.ENABLED) {
    console.log(`[Laravel API] ${message}`, data)
  }
}

export function debugError(message: string, error?: any): void {
  if (LARAVEL_CONFIG.DEBUG.LOG_ERRORS) {
    console.error(`[Laravel API] ${message}`, error)
  }
}

// Export par défaut
export default LARAVEL_CONFIG
