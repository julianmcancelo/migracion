'use client';

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registrado:', registration.scope);
            
            // Verificar actualizaciones cada 60 segundos
            setInterval(() => {
              registration.update();
            }, 60000);
          })
          .catch((error) => {
            console.error('❌ Error al registrar Service Worker:', error);
          });
      });
    }

    // Detectar evento de instalación de PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      console.log('📱 PWA instalable detectada');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar cuando la app ya está instalada
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalada correctamente');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Guardar en localStorage para no mostrar de nuevo por 7 días
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // No mostrar si fue descartado recientemente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0093D2] to-[#007AB8] rounded-xl flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">
              Instalar Aplicación
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Instala la app para acceso rápido y funcionalidad offline
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-[#0093D2] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#007AB8] transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
