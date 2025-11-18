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
  console.log('🔄 Sincronizando inspecciones pendientes...');
  
  try {
    // Abrir IndexedDB
    const db = await openDB();
    const transaction = db.transaction(['inspecciones-pendientes'], 'readonly');
    const store = transaction.objectStore('inspecciones-pendientes');
    const index = store.index('synced');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(false));
      
      request.onsuccess = async () => {
        const pending = request.result;
        console.log(`📊 ${pending.length} inspecciones pendientes de sincronizar`);
        
        for (const inspeccion of pending) {
          try {
            // Intentar enviar al servidor
            const response = await fetch('/api/inspecciones/guardar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(inspeccion.data)
            });
            
            if (response.ok) {
              // Marcar como sincronizada
              await markAsSynced(db, inspeccion.id);
              console.log(`✅ Inspección ${inspeccion.id} sincronizada`);
            }
          } catch (error) {
            console.error(`❌ Error sincronizando ${inspeccion.id}:`, error);
          }
        }
        
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('inspecciones-offline', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function markAsSynced(db, id) {
  const transaction = db.transaction(['inspecciones-pendientes'], 'readwrite');
  const store = transaction.objectStore('inspecciones-pendientes');
  const getRequest = store.get(id);
  
  return new Promise((resolve, reject) => {
    getRequest.onsuccess = () => {
      const inspeccion = getRequest.result;
      if (inspeccion) {
        inspeccion.synced = true;
        store.put(inspeccion);
      }
      resolve();
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}
