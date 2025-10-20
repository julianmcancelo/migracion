'use client'

import { useState, useEffect } from 'react'
import { X, FileText, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CertificadoOblea } from './certificado-oblea'

interface Oblea {
  id: number
  nro_licencia: string
  fecha_solicitud: string
  fecha_entrega: string | null
  estado: string
  observaciones: string | null
}

interface ModalObleasProps {
  habilitacionId: number
  nroLicencia: string
  open: boolean
  onClose: () => void
}

export function ModalObleas({ habilitacionId, nroLicencia, open, onClose }: ModalObleasProps) {
  const [obleas, setObleas] = useState<Oblea[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      cargarObleas()
    }
  }, [open, habilitacionId])

  const cargarObleas = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/habilitaciones/${habilitacionId}/obleas`)
      const result = await response.json()
      
      if (result.success) {
        setObleas(result.data || [])
      }
    } catch (error) {
      console.error('Error al cargar obleas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleObleaGenerada = () => {
    cargarObleas() // Recargar la lista
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ENTREGADA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <CheckCircle className="h-3 w-3" />
            Entregada
          </span>
        )
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            <AlertCircle className="h-3 w-3" />
            Pendiente
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            <AlertCircle className="h-3 w-3" />
            {estado}
          </span>
        )
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Gestión de Obleas</h2>
                <p className="text-orange-100 text-sm">
                  Licencia: {nroLicencia}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generar nueva oblea */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🆕 Generar Nueva Oblea
              </h3>
              
              <CertificadoOblea 
                habilitacionId={habilitacionId}
                onSuccess={handleObleaGenerada}
              />
            </div>

            {/* Historial de obleas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Historial de Obleas
              </h3>

              {loading ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando historial...</p>
                </div>
              ) : obleas.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <h4 className="font-medium text-blue-900 mb-2">
                    Sin obleas registradas
                  </h4>
                  <p className="text-blue-700 text-sm">
                    No hay registros de obleas para esta habilitación. 
                    Genera la primera oblea usando el formulario de la izquierda.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {obleas.map((oblea) => (
                    <div key={oblea.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              Oblea #{oblea.id}
                            </span>
                            {getEstadoBadge(oblea.estado)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Licencia: {oblea.nro_licencia}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Fecha solicitud:</span>
                          <p className="font-medium">
                            {new Date(oblea.fecha_solicitud).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                        
                        {oblea.fecha_entrega && (
                          <div>
                            <span className="text-gray-500">Fecha entrega:</span>
                            <p className="font-medium">
                              {new Date(oblea.fecha_entrega).toLocaleDateString('es-AR')}
                            </p>
                          </div>
                        )}
                      </div>

                      {oblea.observaciones && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-gray-500 text-sm">Observaciones:</span>
                          <p className="text-sm text-gray-700 mt-1">
                            {oblea.observaciones}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              ℹ️ Información sobre Obleas
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Las obleas deben ser colocadas en un lugar visible del vehículo</p>
              <p>• El certificado de entrega debe ser firmado por el titular y el agente municipal</p>
              <p>• Conserve una copia del certificado como respaldo</p>
              <p>• La oblea es válida mientras esté vigente la habilitación</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
