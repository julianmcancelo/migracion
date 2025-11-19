const CACHE_NAME = 'transporte-lanus-admin-v1';
const urlsToCache = [
  '/panel',
  '/panel/habilitaciones',
  '/panel/vehiculos',
  '/panel/personas',
  '/panel/turnos',
  '/offline.html'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Admin SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Admin SW] Archivos en caché');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.log('[Admin SW] Error al cachear', err))
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Admin SW] Activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache.startsWith('transporte-lanus-admin')) {
            console.log('[Admin SW] Limpiando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estrategia: Network First con timeout, fallback a Cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // No cachear APIs que necesitan estar actualizadas
  if (event.request.url.includes('/api/')) {
    return event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Sin conexión' }),
          { 
            status: 503, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      })
    );
  }

  event.respondWith(
    // Intentar red primero con timeout de 3 segundos
    Promise.race([
      fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 3000)
      )
    ]).catch(() => {
      // Si falla la red, usar caché
      return caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Si no hay caché, mostrar página offline
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('Recurso no disponible offline', { status: 503 });
      });
    })
  );
});

// Notificaciones push
self.addEventListener('push', (event) => {
  console.log('[Admin SW] Push recibido');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notificación del Sistema';
  const options = {
    body: data.body || 'Nueva actualización disponible',
    icon: '/icon-admin-192.png',
    badge: '/icon-admin-192.png',
    vibrate: [200, 100, 200],
    data: data.url || '/panel',
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[Admin SW] Click en notificación');
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/panel')
    );
  }
});
