import { createRouter, createWebHistory } from 'vue-router'
import { storageService } from '../services/storage'
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
      path: '/',
      name: 'home',
      component: HomeView,
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
  ],
})

// Navigation guard pour vérifier l'authentification
router.beforeEach((to, from, next) => {
  const currentUser = storageService.getCurrentUser()
  
  if (to.meta.requiresAuth && !currentUser) {
    next('/login')
  } else if (to.path === '/login' && currentUser) {
    next('/')
  } else {
    next()
  }
})

export default router
