'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPWAProps {
  appName?: string
  variant?: 'admin' | 'inspector'
}

export default function InstallPWA({ 
  appName = 'esta aplicación',
  variant = 'admin' 
}: InstallPWAProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Escuchar evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Mostrar prompt después de 3 segundos (para no ser intrusivo)
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Detectar cuando se instala
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalada exitosamente')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Mostrar prompt de instalación
    deferredPrompt.prompt()

    // Esperar respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la PWA')
    } else {
      console.log('Usuario rechazó instalar la PWA')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // No mostrar de nuevo en esta sesión
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // No mostrar si ya está instalada o si fue rechazada en esta sesión
  if (isInstalled || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null
  }

  if (!showInstallPrompt || !deferredPrompt) {
    return null
  }

  const colors = {
    admin: {
      bg: 'bg-gradient-to-r from-blue-600 to-blue-700',
      hover: 'hover:from-blue-700 hover:to-blue-800',
      text: 'text-blue-900',
      border: 'border-blue-200'
    },
    inspector: {
      bg: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
      hover: 'hover:from-emerald-700 hover:to-emerald-800',
      text: 'text-emerald-900',
      border: 'border-emerald-200'
    }
  }

  const style = colors[variant]

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header con gradiente */}
        <div className={`${style.bg} p-4 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Instalar Aplicación</h3>
                <p className="text-sm text-white/90">Acceso rápido desde tu dispositivo</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${style.bg}`} />
              <span>Funciona sin conexión</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${style.bg}`} />
              <span>Acceso directo en tu pantalla de inicio</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${style.bg}`} />
              <span>Notificaciones en tiempo real</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Ahora no
            </button>
            <button
              onClick={handleInstallClick}
              className={`flex-1 px-4 py-2.5 ${style.bg} ${style.hover} text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg`}
            >
              Instalar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
