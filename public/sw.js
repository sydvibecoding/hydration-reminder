// Service Worker for Hydration Reminder
//
// SCOPE (MVP): This SW only handles notification-click focus routing.
// It does NOT precache the app shell — the app depends on live JS/CSS from
// the deploy target, and stale caches are worse than a network round-trip
// for a tool this small. If offline support becomes a requirement, add a
// stale-while-revalidate strategy here and bump SW_VERSION.
//
// Bump SW_VERSION on any change to this file so browsers pick up the new
// worker instead of the cached one. Old caches (if any are added later)
// should be cleaned up in the 'activate' handler by CACHE_NAME.
const SW_VERSION = 'hydration-reminder-v1.0.0';
const CACHE_NAME = SW_VERSION;

// Install
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate — take control immediately and drop any stale caches from prior versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Focus the app when the user clicks a notification (or open it if closed)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Notification dismissed — no-op, kept for future analytics hook
self.addEventListener('notificationclose', () => {});
