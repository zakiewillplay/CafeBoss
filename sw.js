const CACHE_NAME = 'cafeboss-v2';  // bumped version to force update
const ASSETS_TO_CACHE = [
  '/CafeBoss/',
  '/CafeBoss/index.html',
  '/CafeBoss/auth.html',
  '/CafeBoss/dashboard.html',
  '/CafeBoss/menu.html',
  '/CafeBoss/admin.html',
  '/CafeBoss/manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap'
];

// Install – cache essential static files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate – clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch – smart strategy, never cache POST/HEAD/API calls
self.addEventListener('fetch', event => {
  // Only handle GET requests (ignore POST, HEAD, etc.)
  if (event.request.method !== 'GET') return;

  // For navigation requests, use cache-first, then network fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      }).catch(() => {
        // Ultimate offline fallback – return the cached index page
        return caches.match('/CafeBoss/index.html');
      })
    );
    return;
  }

  // For other GET requests (images, CDN scripts, etc.) – network first, fallback to cache
  event.respondWith(
    fetch(event.request).then(response => {
      // Don’t cache Supabase API responses (they are dynamic)
      if (event.request.url.includes('supabase.co') || event.request.url.includes('pbbybxdxnvzhjtkpfpej')) {
        return response;
      }
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Push notification handler (unchanged)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New update!',
    icon: '/CafeBoss/icon-192.png',
    badge: '/CafeBoss/icon-192.png'
  };
  event.waitUntil(self.registration.showNotification(data.title || 'Cafe Boss', options));
});

// Notification click handler (unchanged)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/CafeBoss/');
    })
  );
});