'use client';

import { useEffect, useState } from 'react';
import { CloudOff, Cloud, RefreshCw } from 'lucide-react';
import { offlineStorage } from '@/lib/offline-storage';

export default function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Inicializar offline storage
    offlineStorage.init();

    // Verificar estado de conexión
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      console.log('✅ Conexión restaurada');
      // Intentar sincronizar automáticamente
      syncPendingInspecciones();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('⚠️ Sin conexión');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar inspecciones pendientes cada 10 segundos
    const interval = setInterval(checkPendingInspecciones, 10000);
    checkPendingInspecciones();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkPendingInspecciones = async () => {
    try {
      const pending = await offlineStorage.getPendingInspecciones();
      setPendingCount(pending.length);
    } catch (error) {
      console.error('Error al verificar inspecciones pendientes:', error);
    }
  };

  const syncPendingInspecciones = async () => {
    if (!isOnline || syncing) return;

    setSyncing(true);
    try {
      const pending = await offlineStorage.getPendingInspecciones();
      console.log(`🔄 Sincronizando ${pending.length} inspecciones...`);

      for (const inspeccion of pending) {
        try {
          const response = await fetch('/api/inspecciones/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inspeccion.data),
          });

          if (response.ok) {
            await offlineStorage.markAsSynced(inspeccion.id);
            console.log(`✅ Inspección ${inspeccion.id} sincronizada`);
          } else {
            console.error(`❌ Error al sincronizar ${inspeccion.id}`);
          }
        } catch (error) {
          console.error(`❌ Error en sincronización:`, error);
        }
      }

      // Limpiar inspecciones sincronizadas
      await offlineStorage.clearSyncedInspecciones();
      await checkPendingInspecciones();
    } catch (error) {
      console.error('Error en sincronización:', error);
    } finally {
      setSyncing(false);
    }
  };

  // No mostrar si todo está bien
  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div
        className={`rounded-xl shadow-lg border p-4 ${
          isOnline
            ? 'bg-blue-50 border-blue-200'
            : 'bg-orange-50 border-orange-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {isOnline ? (
              <Cloud className="w-5 h-5 text-blue-600" />
            ) : (
              <CloudOff className="w-5 h-5 text-orange-600" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`font-semibold text-sm ${
                isOnline ? 'text-blue-900' : 'text-orange-900'
              }`}
            >
              {isOnline ? 'Conectado' : 'Sin Conexión'}
            </h3>
            {pendingCount > 0 && (
              <p
                className={`text-xs mt-1 ${
                  isOnline ? 'text-blue-700' : 'text-orange-700'
                }`}
              >
                {pendingCount} inspección{pendingCount > 1 ? 'es' : ''} pendiente
                {pendingCount > 1 ? 's' : ''} de sincronizar
              </p>
            )}
          </div>
          {isOnline && pendingCount > 0 && (
            <button
              onClick={syncPendingInspecciones}
              disabled={syncing}
              className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
