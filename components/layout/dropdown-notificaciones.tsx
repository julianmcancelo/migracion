'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, X } from 'lucide-react'

interface Notificacion {
  id: number
  tipo: string
  titulo: string
  mensaje: string
  icono: string
  url: string | null
  leida: boolean
  fecha_creacion: string
  metadata: any
}

export function DropdownNotificaciones() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loading, setLoading] = useState(false)

  // Cargar notificaciones
  useEffect(() => {
    if (isOpen) {
      cargarNotificaciones()
    } else {
      // Cargar solo el contador cuando está cerrado
      cargarContador()
    }
  }, [isOpen])

  // Polling cada 30 segundos para actualizar el contador
  useEffect(() => {
    const interval = setInterval(() => {
      cargarContador()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const cargarContador = async () => {
    try {
      const res = await fetch('/api/notificaciones?limit=0&solo_no_leidas=true')
      if (res.ok) {
        const data = await res.json()
        setNoLeidas(data.no_leidas || 0)
      }
    } catch (error) {
      console.error('Error al cargar contador:', error)
    }
  }

  const cargarNotificaciones = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notificaciones?limit=10')
      if (res.ok) {
        const data = await res.json()
        setNotificaciones(data.notificaciones || [])
        setNoLeidas(data.no_leidas || 0)
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLeida = async (id: number) => {
    try {
      const res = await fetch('/api/notificaciones/marcar-leida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })

      if (res.ok) {
        setNotificaciones((prev) =>
          prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
        )
        setNoLeidas((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error al marcar notificación:', error)
    }
  }

  const marcarTodasLeidas = async () => {
    try {
      const res = await fetch('/api/notificaciones/marcar-leida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todas: true }),
      })

      if (res.ok) {
        setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
        setNoLeidas(0)
      }
    } catch (error) {
      console.error('Error al marcar todas:', error)
    }
  }

  const handleClickNotificacion = (notif: Notificacion) => {
    if (!notif.leida) {
      marcarComoLeida(notif.id)
    }
    if (notif.url) {
      setIsOpen(false)
      router.push(notif.url)
    }
  }

  const formatearTiempo = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime()
    const minutos = Math.floor(diff / 60000)
    const horas = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)

    if (minutos < 1) return 'Ahora'
    if (minutos < 60) return `Hace ${minutos}m`
    if (horas < 24) return `Hace ${horas}h`
    return `Hace ${dias}d`
  }

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full bg-white p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <span className="sr-only">Ver notificaciones</span>
        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
        
        {/* Badge de notificaciones pendientes */}
        {noLeidas > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white sm:h-5 sm:w-5 sm:text-xs">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel de notificaciones */}
          <div className="absolute right-0 z-20 mt-2 w-80 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 sm:w-96">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Notificaciones {noLeidas > 0 && `(${noLeidas})`}
              </h3>
              <div className="flex items-center gap-2">
                {noLeidas > 0 && (
                  <button
                    onClick={marcarTodasLeidas}
                    className="text-xs text-blue-600 hover:text-blue-700"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Cargando...
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  No hay notificaciones
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificaciones.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleClickNotificacion(notif)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                        !notif.leida ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono */}
                        <span className="text-2xl">{notif.icono}</span>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notif.titulo}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">
                            {notif.mensaje}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatearTiempo(notif.fecha_creacion)}
                          </p>
                        </div>

                        {/* Indicador de no leída */}
                        {!notif.leida && (
                          <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notificaciones.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-2">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/dashboard?seccion=notificaciones')
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Ver todas las notificaciones →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
