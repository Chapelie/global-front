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
      } else {
        // Initialiser les notifications push pour le navigateur (Web Push API)
        await this.initializeWebPushNotifications()
      }

      this.isInitialized.value = true
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error)
    }
  }

  /**
   * Initialiser les notifications push pour le navigateur (Web Push API)
   */
  private async initializeWebPushNotifications(): Promise<void> {
    try {
      // Vérifier si le navigateur supporte les notifications
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        console.warn('Ce navigateur ne supporte pas les notifications push')
        return
      }

      // Demander la permission
      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }

      if (permission !== 'granted') {
        console.warn('Permission de notifications refusée')
        return
      }

      // Enregistrer le service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      // Obtenir la subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(await this.getVapidPublicKey())
      })

      // Enregistrer la subscription sur le backend
      await this.registerWebPushSubscription(subscription)
      
      console.log('✅ Notifications Web Push initialisées')
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications Web Push:', error)
    }
  }

  /**
   * Obtenir la clé publique VAPID depuis le backend
   */
  private async getVapidPublicKey(): Promise<string> {
    try {
      const response = await this.api.api.get('/notifications/vapid-public-key')
      return response.data?.public_key || ''
    } catch (error) {
      console.error('Erreur lors de la récupération de la clé VAPID:', error)
      return ''
    }
  }

  /**
   * Convertir une clé base64 en Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  /**
   * Enregistrer la subscription Web Push sur le backend
   */
  private async registerWebPushSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      }

      await this.api.api.post('/notifications/register-web-push', {
        subscription: subscriptionData,
        device_type: 'web'
      })
      
      console.log('✅ Subscription Web Push enregistrée sur le backend')
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la subscription Web Push:', error)
    }
  }

  /**
   * Convertir un ArrayBuffer en base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
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


