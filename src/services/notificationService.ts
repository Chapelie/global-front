/**
 * Service de gestion des notifications
 * Gère les notifications backend et les notifications push natives via Capacitor
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useLaravelApi } from './laravelApiService'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

// Types
export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  data?: any
  read_at?: string
  action_url?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  updated_at: string
}

class NotificationService {
  private api = useLaravelApi()
  private notifications = ref<Notification[]>([])
  private unreadCount = ref<number>(0)
  private isInitialized = ref<boolean>(false)
  private pollInterval: number | null = null
  private pushToken: string | null = null

  constructor() {
    this.setupPolling()
  }

  /**
   * Initialiser le service de notifications
   */
  async initialize(): Promise<void> {
    if (this.isInitialized.value) return

    try {
      // Charger les notifications depuis le backend
      await this.loadNotifications()

      // Initialiser les notifications push natives si sur mobile
      if (Capacitor.isNativePlatform()) {
        await this.initializePushNotifications()
      }

      this.isInitialized.value = true
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error)
    }
  }

  /**
   * Initialiser les notifications push natives (Capacitor)
   */
  private async initializePushNotifications(): Promise<void> {
    try {
      // Demander les permissions
      let permStatus = await PushNotifications.checkPermissions()
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions()
      }

      if (permStatus.receive !== 'granted') {
        console.warn('Permissions de notifications refusées')
        return
      }

      // S'enregistrer pour les notifications push
      await PushNotifications.register()

      // Écouter les événements
      PushNotifications.addListener('registration', async (token) => {
        console.log('📱 Token push enregistré:', token.value)
        this.pushToken = token.value
        await this.registerDeviceToken(token.value)
      })

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Erreur d\'enregistrement push:', error)
      })

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📬 Notification reçue:', notification)
        // Recharger les notifications depuis le backend
        this.loadNotifications()
      })

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('👆 Action sur notification:', notification)
        // Naviguer vers l'URL d'action si disponible
        if (notification.notification.data?.action_url) {
          window.location.href = notification.notification.data.action_url
        }
      })
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications push:', error)
    }
  }

  /**
   * Enregistrer le token de l'appareil sur le backend
   */
  private async registerDeviceToken(token: string): Promise<void> {
    try {
      const deviceType = Capacitor.getPlatform() === 'android' ? 'android' : 
                        Capacitor.getPlatform() === 'ios' ? 'ios' : 'web'
      
      await this.api.api.post('/notifications/register-device', {
        device_token: token,
        device_type: deviceType
      })
      
      console.log('✅ Token d\'appareil enregistré sur le backend')
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token:', error)
    }
  }

  /**
   * Charger les notifications depuis le backend
   */
  async loadNotifications(): Promise<void> {
    try {
      const response = await this.api.api.get('/notifications')
      const data = response.data
      
      // Gérer la pagination
      if (data?.data && Array.isArray(data.data)) {
        this.notifications.value = data.data
      } else if (Array.isArray(data)) {
        this.notifications.value = data
      }

      // Charger le nombre de non lues
      await this.loadUnreadCount()
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    }
  }

  /**
   * Charger le nombre de notifications non lues
   */
  async loadUnreadCount(): Promise<void> {
    try {
      const response = await this.api.api.get('/notifications/unread-count')
      this.unreadCount.value = response.data?.count || 0
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de notifications non lues:', error)
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: number): Promise<boolean> {
    try {
      await this.api.api.post(`/notifications/${id}/read`)
      await this.loadNotifications()
      return true
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
      return false
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      await this.api.api.post('/notifications/read-all')
      await this.loadNotifications()
      return true
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error)
      return false
    }
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(id: number): Promise<boolean> {
    try {
      await this.api.api.delete(`/notifications/${id}`)
      await this.loadNotifications()
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error)
      return false
    }
  }

  /**
   * Désactiver les notifications push
   */
  async disablePushNotifications(): Promise<boolean> {
    try {
      await this.api.api.post('/notifications/disable')
      this.pushToken = null
      return true
    } catch (error) {
      console.error('Erreur lors de la désactivation des notifications:', error)
      return false
    }
  }

  /**
   * Configurer le polling pour rafraîchir les notifications
   */
  private setupPolling(): void {
    // Rafraîchir toutes les 30 secondes
    this.pollInterval = window.setInterval(() => {
      if (this.isInitialized.value) {
        this.loadUnreadCount()
      }
    }, 30000)
  }

  /**
   * Nettoyer les ressources
   */
  cleanup(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  // Getters
  getNotifications() {
    return this.notifications
  }

  getUnreadCount() {
    return this.unreadCount
  }

  getIsInitialized() {
    return this.isInitialized
  }
}

// Instance singleton
let notificationServiceInstance: NotificationService | null = null

export function useNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService()
  }
  return notificationServiceInstance
}


