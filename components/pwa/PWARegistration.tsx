'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

interface PWARegistrationProps {
  swPath: string
  appName: string
}

export default function PWARegistration({ swPath, appName }: PWARegistrationProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register(swPath, {
        scope: '/',
        updateViaCache: 'none'
      })

      console.log(`[${appName}] Service Worker registrado:`, registration.scope)

      // Verificar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              toast.info('Nueva versión disponible', {
                description: 'Hay una actualización disponible. Recarga la página para aplicarla.',
                action: {
                  label: 'Recargar',
                  onClick: () => window.location.reload()
                },
                duration: 10000
              })
            }
          })
        }
      })

      // Verificar actualizaciones cada hora
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)

    } catch (error) {
      console.error(`[${appName}] Error registrando Service Worker:`, error)
    }
  }

  // Escuchar mensajes del service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
          toast.success('Sincronización completada', {
            description: event.data.message || 'Los datos se han sincronizado correctamente'
          })
        }
      })
    }
  }, [])

  return null
}
