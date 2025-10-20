import { createRouter, createWebHistory } from 'vue-router'
import { useLaravelAuth } from '../services/laravelAuth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/commandes',
      name: 'commandes',
      component: () => import('../views/CommandesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/production',
      name: 'production',
      component: () => import('../views/ProductionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/livraison',
      name: 'livraison',
      component: () => import('../views/LivraisonView.vue'),
      meta: { requiresAuth: true }
    },
  
    {
      path: '/stock',
      name: 'stock',
      component: () => import('../views/StockView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/documents',
      name: 'documents',
      component: () => import('../views/DocumentsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/personnel',
      name: 'personnel',
      component: () => import('../views/PersonnelView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/analyses',
      name: 'analyses',
      component: () => import('../views/AnalysesView.vue'),
      meta: { requiresAuth: true }
    },
        {
          path: '/parametres',
          name: 'parametres',
          component: () => import('../views/ParametresView.vue'),
          meta: { requiresAuth: true }
        },
       
        {
          path: '/users',
          name: 'users',
          component: () => import('../views/UsersView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
  ],
})

// Navigation guard pour vérifier l'authentification Laravel
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, isLoading } = useLaravelAuth()
  
  // Attendre que l'authentification soit chargée
  if (isLoading.value) {
    // Attendre que l'auth soit chargée
    await new Promise(resolve => {
      const checkAuth = () => {
        if (!isLoading.value) {
          resolve(true)
        } else {
          setTimeout(checkAuth, 50)
        }
      }
      checkAuth()
    })
  }
  
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated.value) {
    next('/')
  } else {
    next()
  }
})

export default router
