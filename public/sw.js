/* globalstar PWA service worker */
const CACHE_VERSION = 'globalstar-v2'
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

function parsePushPayload(event) {
  if (!event.data) return {}
  try {
    return event.data.json()
  } catch {
    try {
      const text = event.data.text()
      return text ? JSON.parse(text) : {}
    } catch {
      return { message: event.data.text() }
    }
  }
}

function buildNotificationOptions(data) {
  const payload = data.data && typeof data.data === 'object' ? data.data : data
  return {
    body: data.message || data.body || 'Nouvelle notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || `notification-${payload.notification_id || Date.now()}`,
    data: {
      ...payload,
      action_url: payload.action_url || data.action_url || '/',
    },
    requireInteraction: Boolean(data.requireInteraction),
    actions: Array.isArray(data.actions) ? data.actions : [],
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_VERSION).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico'
  ) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request)
        const networkPromise = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          .catch(() => null)
        return cached || networkPromise
      }),
    )
  }
})

self.addEventListener('push', (event) => {
  const data = parsePushPayload(event)
  const title = data.title || 'Global Star'
  const options = buildNotificationOptions(data)

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const actionUrl = event.notification.data?.action_url || '/'
  const url = new URL(actionUrl, self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client && 'navigate' in client) {
          return client.navigate(url).then(() => client.focus())
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})

self.addEventListener('notificationclose', () => {})

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(notifyClients({ type: 'SYNC_NOTIFICATIONS' }))
  }
})

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(notifyClients({ type: 'PERIODIC_SYNC_NOTIFICATIONS' }))
  }
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  await Promise.all(clients.map((client) => client.postMessage(message)))
}
