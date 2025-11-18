const CACHE_NAME = 'inspecciones-lanus-v1';
const urlsToCache = [
  '/inspector-movil/tramites',
  '/inspector-movil/verificacion',
  '/inspector-movil/formulario',
  '/offline.html'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Archivos en caché');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.log('Service Worker: Error al cachear', err))
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Limpiando caché antiguo');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estrategia: Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
  // Solo cachear GET requests
  if (event.request.method !== 'GET') return;

  // Ignorar requests de API que necesitan estar siempre actualizados
  if (event.request.url.includes('/api/')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en caché
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar servir desde caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si no hay caché, mostrar página offline
          return caches.match('/offline.html');
        });
      })
  );
});

// Sincronización en segundo plano (para cuando vuelva la conexión)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronizando datos...');
  if (event.tag === 'sync-inspecciones') {
    event.waitUntil(syncInspecciones());
  }
});

async function syncInspecciones() {
  // Aquí puedes implementar lógica para sincronizar inspecciones pendientes
  console.log('Sincronizando inspecciones pendientes...');
}
