const CACHE_NAME = 'inspecciones-lanus-v1';
const urlsToCache = [
  '/inspector-movil',
  '/inspector-movil/tramites',
  '/inspector-movil/verificacion',
  '/inspector-movil/formulario',
  '/offline.html'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Inspector SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Inspector SW] Archivos en caché');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.log('[Inspector SW] Error al cachear', err))
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Inspector SW] Activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache.startsWith('inspecciones-lanus')) {
            console.log('[Inspector SW] Limpiando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estrategia: Cache First para recursos estáticos, Network First para datos
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // APIs siempre desde red
  if (url.pathname.includes('/api/')) {
    return event.respondWith(
      fetch(event.request).catch(() => {
        // Si es una inspección, guardar en IndexedDB para sincronizar después
        if (url.pathname.includes('/api/inspecciones/guardar')) {
          return saveInspectionOffline(event.request);
        }
        return new Response(
          JSON.stringify({ error: 'Sin conexión', offline: true }),
          { 
            status: 503, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      })
    );
  }

  // Recursos estáticos (imágenes, CSS, JS) - Cache First
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|css|js|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Páginas HTML - Network First
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('Recurso no disponible offline', { status: 503 });
        });
      })
  );
});

// Guardar inspección offline
async function saveInspectionOffline(request) {
  try {
    const data = await request.clone().json();
    const db = await openDB();
    const transaction = db.transaction(['inspecciones-pendientes'], 'readwrite');
    const store = transaction.objectStore('inspecciones-pendientes');
    
    const inspeccion = {
      id: Date.now(),
      data: data,
      synced: false,
      timestamp: new Date().toISOString()
    };
    
    store.add(inspeccion);
    
    // Registrar sincronización para cuando vuelva la conexión
    if ('sync' in self.registration) {
      await self.registration.sync.register('sync-inspecciones');
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        offline: true, 
        message: 'Inspección guardada. Se sincronizará cuando haya conexión.' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('[Inspector SW] Error guardando offline:', error);
    return new Response(
      JSON.stringify({ error: 'Error guardando offline' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('[Inspector SW] Sincronizando datos...');
  if (event.tag === 'sync-inspecciones') {
    event.waitUntil(syncInspecciones());
  }
});

async function syncInspecciones() {
  console.log('🔄 Sincronizando inspecciones pendientes...');
  
  try {
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
            const response = await fetch('/api/inspecciones/guardar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(inspeccion.data)
            });
            
            if (response.ok) {
              await markAsSynced(db, inspeccion.id);
              console.log(`✅ Inspección ${inspeccion.id} sincronizada`);
              
              // Notificar al usuario
              self.registration.showNotification('Inspección Sincronizada', {
                body: 'La inspección guardada offline se ha sincronizado correctamente',
                icon: '/icon-inspector-192.png',
                badge: '/icon-inspector-192.png'
              });
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
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('inspecciones-pendientes')) {
        const store = db.createObjectStore('inspecciones-pendientes', { keyPath: 'id' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    
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

// Notificaciones push
self.addEventListener('push', (event) => {
  console.log('[Inspector SW] Push recibido');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Nueva Inspección';
  const options = {
    body: data.body || 'Tienes una nueva inspección asignada',
    icon: '/icon-inspector-192.png',
    badge: '/icon-inspector-192.png',
    vibrate: [200, 100, 200],
    data: data.url || '/inspector-movil/tramites',
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[Inspector SW] Click en notificación');
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/inspector-movil/tramites')
    );
  }
});
