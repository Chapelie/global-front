import { Capacitor } from '@capacitor/core'

const SW_URL = '/sw.js'
const SW_SCOPE = '/'

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (registrationPromise) return registrationPromise

  registrationPromise = (async () => {
    if (!('serviceWorker' in navigator) || Capacitor.isNativePlatform()) {
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE })

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing
        if (!installing) return

        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            installing.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      })

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }

      console.log('✅ Service Worker enregistré:', registration.scope)
      return registration
    } catch (error) {
      console.error('❌ Échec enregistrement Service Worker:', error)
      return null
    }
  })()

  return registrationPromise
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator) || Capacitor.isNativePlatform()) {
    return null
  }

  const existing = await registerServiceWorker()
  if (existing) return existing

  return (await navigator.serviceWorker.getRegistration(SW_SCOPE)) ?? null
}

export async function registerBackgroundSync(tag = 'sync-notifications'): Promise<void> {
  const registration = await getServiceWorkerRegistration()
  const syncManager = (registration as ServiceWorkerRegistration & {
    sync?: { register: (tag: string) => Promise<void> }
  })?.sync
  if (!syncManager) return

  try {
    await syncManager.register(tag)
  } catch (error) {
    console.warn('Background Sync non disponible:', error)
  }
}

export function listenForServiceWorkerMessages(
  handler: (data: { type: string }) => void,
): () => void {
  if (!('serviceWorker' in navigator)) return () => {}

  const listener = (event: MessageEvent) => {
    if (event.data?.type) handler(event.data)
  }

  navigator.serviceWorker.addEventListener('message', listener)
  return () => navigator.serviceWorker.removeEventListener('message', listener)
}
