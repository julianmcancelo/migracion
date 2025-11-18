/**
 * Sistema de almacenamiento offline para inspecciones
 * Usa IndexedDB para guardar inspecciones pendientes de sincronización
 */

const DB_NAME = 'inspecciones-offline';
const DB_VERSION = 1;
const STORE_NAME = 'inspecciones-pendientes';

interface InspeccionOffline {
  id: string;
  timestamp: number;
  data: any;
  synced: boolean;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveInspeccion(data: any): Promise<string> {
    if (!this.db) await this.init();

    const id = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const inspeccion: InspeccionOffline = {
      id,
      timestamp: Date.now(),
      data,
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(inspeccion);

      request.onsuccess = () => {
        console.log('✅ Inspección guardada offline:', id);
        resolve(id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingInspecciones(): Promise<InspeccionOffline[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(false));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const inspeccion = getRequest.result;
        if (inspeccion) {
          inspeccion.synced = true;
          const updateRequest = store.put(inspeccion);
          updateRequest.onsuccess = () => {
            console.log('✅ Inspección marcada como sincronizada:', id);
            resolve();
          };
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteInspeccion(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('🗑️ Inspección eliminada:', id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllInspecciones(): Promise<InspeccionOffline[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedInspecciones(): Promise<void> {
    if (!this.db) await this.init();

    const pending = await this.getPendingInspecciones();
    const all = await this.getAllInspecciones();
    const synced = all.filter(i => i.synced);

    for (const inspeccion of synced) {
      await this.deleteInspeccion(inspeccion.id);
    }

    console.log(`🧹 ${synced.length} inspecciones sincronizadas eliminadas`);
  }
}

export const offlineStorage = new OfflineStorage();
