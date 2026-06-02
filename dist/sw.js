// Service Worker pour les notifications push
self.addEventListener('push', function(event) {
  console.log('📬 Notification push reçue:', event)
  
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Global Star'
  const options = {
    body: data.message || 'Nouvelle notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'notification',
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  console.log('👆 Notification cliquée:', event)
  
  event.notification.close()

  if (event.notification.data?.action_url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.action_url)
    )
  } else {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

self.addEventListener('notificationclose', function(event) {
  console.log('❌ Notification fermée:', event)
})



