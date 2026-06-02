importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

let firebaseReady = false;
let messaging = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_FIREBASE_CONFIG' && event.data.config) {
    try {
      if (!firebaseReady) {
        firebase.initializeApp(event.data.config);
        firebaseReady = true;
      }
      if (firebase.messaging && !messaging) {
        messaging = firebase.messaging();
        messaging.onBackgroundMessage((payload) => {
          const title = (payload.notification && payload.notification.title) || 'New Update';
          const options = {
            body: (payload.notification && payload.notification.body) || '',
            icon: '/icon.png',
            badge: '/icon.png',
            data: payload.data || {},
          };
          self.registration.showNotification(title, options);
        });
      }
    } catch (e) {
      console.error('[SW] Firebase init error:', e);
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
