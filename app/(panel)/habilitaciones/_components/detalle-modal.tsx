'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit,
  Download,
  FileCheck,
  X,
  ArrowLeft,
  User,
  Car,
  Building2,
  ClipboardList,
  Shield,
  Trash2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface DetalleModalProps {
  habilitacion: any | null
  open: boolean
  onClose: () => void
}

/**
 * Modal para ver detalle completo de habilitación
 * - Datos completos de la habilitación
 * - Personas asociadas
 * - Vehículos con información completa
 * - Historial de verificaciones
 * - Historial de inspecciones
 * - Historial de obleas
 */
export function DetalleModal({ habilitacion, open, onClose }: DetalleModalProps) {
  const [loading, setLoading] = useState(false)
  const [detalleCompleto, setDetalleCompleto] = useState<any>(null)
  const [eliminandoInspeccion, setEliminandoInspeccion] = useState<number | null>(null)

  // Cargar detalle completo cuando se abre el modal
  useEffect(() => {
    if (open && habilitacion) {
      cargarDetalleCompleto()
    }
  }, [open, habilitacion])

  const cargarDetalleCompleto = async () => {
    if (!habilitacion?.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/habilitaciones/${habilitacion.id}`)
      const data = await response.json()
      if (data.success) {
        setDetalleCompleto(data.data)
      }
    } catch (error) {
      console.error('Error al cargar detalle:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!habilitacion) return null

  const hab = detalleCompleto || habilitacion

  const handleEliminarInspeccion = async (inspeccionId: number) => {
    if (!confirm('¿Está seguro de eliminar esta inspección? Esta acción no se puede deshacer.')) {
      return
    }

    setEliminandoInspeccion(inspeccionId)
    try {
      const res = await fetch(`/api/inspecciones/${inspeccionId}/eliminar`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Inspección eliminada exitosamente')
        // Recargar el detalle completo
        await cargarDetalleCompleto()
      } else {
        alert('❌ Error al eliminar inspección: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al eliminar inspección')
    } finally {
      setEliminandoInspeccion(null)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { variant: any; icon: any }> = {
      'activa': { variant: 'default', icon: CheckCircle },
      'vencida': { variant: 'destructive', icon: XCircle },
      'pendiente': { variant: 'outline', icon: AlertCircle },
    }
    
    const config = estados[estado] || { variant: 'outline', icon: AlertCircle }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant as any} className="text-base px-4 py-1">
        <Icon className="h-4 w-4 mr-1" />
        {estado.toUpperCase()}
      </Badge>
    )
  }

  const InfoSection = ({ title, icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-700 flex items-center gap-2 mt-4">
        {icon} {title}
      </h3>
      {children}
    </div>
  )

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="font-semibold">{value || 'No especificado'}</span>
    </div>
  )

  const handleEditar = () => {
    // TODO: Implementar edición
    console.log('Editar habilitación', hab.id)
  }

  const handleDescargarConstancia = async () => {
    // TODO: Implementar descarga
    console.log('Descargar constancia', hab.id)
  }

  const handleDescargarResolucion = async () => {
    // TODO: Implementar descarga
    console.log('Descargar resolución', hab.id)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0">
        {/* Header con botones de acción */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="-ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
              <div>
                <h2 className="text-2xl font-bold">
                  Licencia Nº <span className="text-blue-600">{hab.nro_licencia || 'S/N'}</span>
                </h2>
                <p className="text-sm text-gray-500">
                  Información detallada y registro de actividad de la habilitación.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditar}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDescargarConstancia}
              >
                <Download className="h-4 w-4 mr-1" />
                Descargar Constancia
              </Button>
              {hab.resolucion && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDescargarResolucion}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Descargar Resolución
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Cargando información...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Datos de la Habilitación */}
              <div className="bg-white border rounded-lg">
                <div className="border-b px-4 py-3 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                    Datos de la Habilitación
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Estado</p>
                    <Badge 
                      variant={hab.estado === 'HABILITADO' ? 'default' : 'secondary'}
                      className="font-semibold"
                    >
                      {hab.estado || 'EN TRÁMITE'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tipo Trámite</p>
                    <p className="font-semibold text-gray-900">{hab.tipo_transporte || 'Transporte'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Renovación</p>
                    <p className="font-semibold text-gray-900">{hab.tipo || hab.tipo_transporte || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Vigencia Inicio</p>
                    <p className="font-semibold text-gray-900">
                      {hab.vigencia_inicio ? new Date(hab.vigencia_inicio).toLocaleDateString('es-AR') : '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Vigencia Fin</p>
                    <p className="font-semibold text-gray-900">
                      {hab.vigencia_fin ? new Date(hab.vigencia_fin).toLocaleDateString('es-AR') : '-'}
                    </p>
                  </div>
                </div>
              </div>


              {/* Personas Asociadas */}
              <div className="bg-white border rounded-lg">
                <div className="border-b px-4 py-3 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personas Asociadas
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {hab.habilitaciones_personas?.map((rel: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-gray-900 uppercase">
                            {rel.persona?.nombre || rel.nombre || 'Nombre no disponible'}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {rel.rol || 'ROL NO ESPECIFICADO'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">DNI:</span> {rel.persona?.dni || rel.dni || 'No disponible'}
                      </p>
                      {rel.licencia_categoria && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Licencia:</span> {rel.licencia_categoria}
                        </p>
                      )}
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500 text-center py-4">No hay personas asociadas</p>
                  )}
                </div>
              </div>

              {/* Vehículo Asociado */}
              <div className="bg-white border rounded-lg">
                <div className="border-b px-4 py-3 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    Vehículo Asociado
                  </h3>
                </div>
                <div className="p-4">
                  {hab.habilitaciones_vehiculos?.[0] ? (
                    <div className="space-y-3">
                      {(() => {
                        const vehiculo = hab.habilitaciones_vehiculos[0].vehiculo || hab.habilitaciones_vehiculos[0]
                        return (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Dominio</p>
                                <p className="font-bold text-lg text-gray-900">{vehiculo.dominio || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Marca</p>
                                <p className="font-semibold text-gray-900">{vehiculo.marca || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Modelo</p>
                                <p className="font-semibold text-gray-900">{vehiculo.modelo || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Año</p>
                                <p className="font-semibold text-gray-900">{vehiculo.anio || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Asientos</p>
                                <p className="font-semibold text-gray-900">{vehiculo.cantidad_asientos || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Chasis</p>
                                <p className="font-semibold text-gray-900">{vehiculo.nro_chasis || 'N/A'}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Motor</p>
                                <p className="font-semibold text-gray-900">{vehiculo.nro_motor || 'N/A'}</p>
                              </div>
                            </div>
                            
                            {/* Información de seguro */}
                            <div className="border-t pt-3 mt-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Aseguradora</p>
                                  <p className="font-semibold text-gray-900">{vehiculo.aseguradora || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Póliza Nº</p>
                                  <p className="font-semibold text-gray-900">{vehiculo.poliza_nro || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Vencimiento Póliza</p>
                                  <p className="font-semibold text-gray-900">
                                    {vehiculo.poliza_vencimiento ? new Date(vehiculo.poliza_vencimiento).toLocaleDateString('es-AR') : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Vencimiento VTV</p>
                                  <p className="font-semibold text-gray-900">
                                    {vehiculo.vtv_vencimiento ? new Date(vehiculo.vtv_vencimiento).toLocaleDateString('es-AR') : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No hay vehículo asociado</p>
                  )}
                </div>
              </div>

              {/* Historial de Colocación de Obleas */}
              <div className="bg-white border rounded-lg">
                <div className="border-b px-4 py-3 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Historial de Colocación de Obleas
                  </h3>
                </div>
                <div className="p-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-700">
                      No hay registros de colocación de obleas para esta habilitación.
                    </p>
                  </div>
                </div>
              </div>

              {/* Historial de Verificaciones */}
              <div className="bg-white border rounded-lg">
                <div className="border-b px-4 py-3 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    Historial de Verificaciones
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {hab.verificaciones?.length > 0 ? (
                    hab.verificaciones.map((verif: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(verif.fecha).toLocaleDateString('es-AR')} {verif.hora || ''}
                          </p>
                          <p className="text-sm text-gray-600">Resultado: <Badge variant="default">{verif.resultado}</Badge></p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Ver Detalle
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-blue-700">
                        No hay verificaciones técnicas registradas.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Historial de Inspecciones */}
              <div className="bg-white border rounded-lg">
                <div className="border-b px-4 py-3 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    Historial de Inspecciones
                  </h3>
                </div>
                <div className="p-4">
                  {hab.inspecciones?.length > 0 ? (
                    <div className="space-y-3">
                      {hab.inspecciones.map((insp: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(insp.fecha).toLocaleDateString('es-AR')}
                            </p>
                            <p className="text-sm text-gray-600">{insp.observaciones || 'Sin observaciones'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">{insp.estado}</Badge>
                            <button
                              onClick={() => handleEliminarInspeccion(insp.id)}
                              disabled={eliminandoInspeccion === insp.id}
                              className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50"
                              title="Eliminar inspección"
                            >
                              {eliminandoInspeccion === insp.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-blue-700">
                        No hay inspecciones físicas registradas.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              {hab.observaciones && (
                <div className="bg-white border rounded-lg">
                  <div className="border-b px-4 py-3 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Observaciones
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{hab.observaciones}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
