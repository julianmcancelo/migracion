'use client'

import { useState, useEffect } from 'react'
import { History, Loader2, Calendar, User, FileText } from 'lucide-react'

interface Novedad {
  id: number
  tipo_novedad: string
  entidad_afectada: string
  descripcion: string
  usuario_nombre: string | null
  fecha_novedad: string
  observaciones: string | null
}

interface TimelineNovedadesProps {
  habilitacionId: number
}

const ICONOS_NOVEDAD: Record<string, string> = {
  CAMBIO_VEHICULO: '🔄',
  CAMBIO_TIPO: '📋',
  ALTA: '✅',
  BAJA: '❌',
  MODIFICACION: '📝',
  CAMBIO_ESTADO: '🔔',
  RENOVACION: '🔄',
  SUSPENSION: '⏸️',
  REVOCACION: '🚫',
}

const COLORES_NOVEDAD: Record<string, string> = {
  CAMBIO_VEHICULO: 'bg-blue-50 border-blue-200',
  CAMBIO_TIPO: 'bg-purple-50 border-purple-200',
  ALTA: 'bg-green-50 border-green-200',
  BAJA: 'bg-red-50 border-red-200',
  MODIFICACION: 'bg-yellow-50 border-yellow-200',
  CAMBIO_ESTADO: 'bg-orange-50 border-orange-200',
  RENOVACION: 'bg-indigo-50 border-indigo-200',
}

export default function TimelineNovedades({ habilitacionId }: TimelineNovedadesProps) {
  const [novedades, setNovedades] = useState<Novedad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarNovedades()
  }, [habilitacionId])

  const cargarNovedades = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/habilitaciones/${habilitacionId}/novedades`)
      const data = await response.json()

      if (data.success) {
        setNovedades(data.data.novedades || [])
      } else {
        setError('Error al cargar novedades')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando historial...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  if (novedades.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <History className="mx-auto h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-600">No hay novedades registradas para esta habilitación</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Historial de Novedades</h3>
          <p className="text-sm text-gray-500">
            {novedades.length} {novedades.length === 1 ? 'novedad registrada' : 'novedades registradas'}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Línea vertical */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200"></div>

        {novedades.map((novedad, index) => {
          const colorClase = COLORES_NOVEDAD[novedad.tipo_novedad] || 'bg-gray-50 border-gray-200'
          const icono = ICONOS_NOVEDAD[novedad.tipo_novedad] || '📋'

          return (
            <div key={novedad.id} className="relative pl-12">
              {/* Punto en el timeline */}
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-blue-500 text-lg">
                {icono}
              </div>

              {/* Contenido */}
              <div className={`rounded-lg border p-4 ${colorClase}`}>
                {/* Header de la novedad */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded bg-white px-2 py-1 text-xs font-semibold text-gray-700 border">
                        {novedad.tipo_novedad.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {novedad.entidad_afectada}
                      </span>
                    </div>
                    <p className="mt-2 font-medium text-gray-900">{novedad.descripcion}</p>
                  </div>
                </div>

                {/* Observaciones */}
                {novedad.observaciones && (
                  <div className="mt-3 rounded bg-white p-2 border">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-600">{novedad.observaciones}</p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatearFecha(novedad.fecha_novedad)}
                  </div>
                  {novedad.usuario_nombre && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {novedad.usuario_nombre}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
