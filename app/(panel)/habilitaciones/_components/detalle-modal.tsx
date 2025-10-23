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
  Trash2,
  History,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import TimelineNovedades from '@/components/habilitaciones/timeline-novedades'
import ModalCambiarTipo from './modal-cambiar-tipo'

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
  const [verificacionSeleccionada, setVerificacionSeleccionada] = useState<any>(null)
  const [modalCambiarTipoOpen, setModalCambiarTipoOpen] = useState(false)

  // Helper para formatear hora TIME de MySQL (formato HH:MM:SS o timestamp)
  const formatearHora = (hora: any): string => {
    if (!hora) return 'N/A'

    // Si es un string tipo "09:00:00" o "09:07:56"
    if (typeof hora === 'string' && hora.includes(':')) {
      const partes = hora.split(':')
      return `${partes[0]}:${partes[1]}` // HH:MM
    }

    // Si es un Date object o timestamp ISO
    try {
      const date = new Date(hora)
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      }
    } catch (e) {
      // Si falla, intentar extraer HH:MM del string
    }

    return String(hora).substring(0, 5) // Fallback: primeros 5 caracteres
  }

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
        method: 'DELETE',
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
      activa: { variant: 'default', icon: CheckCircle },
      vencida: { variant: 'destructive', icon: XCircle },
      pendiente: { variant: 'outline', icon: AlertCircle },
    }

    const config = estados[estado] || { variant: 'outline', icon: AlertCircle }
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="px-4 py-1 text-base">
        <Icon className="mr-1 h-4 w-4" />
        {estado.toUpperCase()}
      </Badge>
    )
  }

  const InfoSection = ({
    title,
    icon,
    children,
  }: {
    title: string
    icon: any
    children: React.ReactNode
  }) => (
    <div className="space-y-2">
      <h3 className="mt-4 flex items-center gap-2 font-semibold text-gray-700">
        {icon} {title}
      </h3>
      {children}
    </div>
  )

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="font-semibold">{value || 'No especificado'}</span>
    </div>
  )

  const handleEditar = () => {
    // TODO: Implementar edición
    console.log('Editar habilitación', hab.id)
  }

  const handleDescargarConstancia = async () => {
    try {
      const response = await fetch(`/api/habilitaciones/${hab.id}/descargar-certificado`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al generar certificado')
      }

      // Obtener el blob y descargarlo
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificado-${hab.nro_licencia || hab.id}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      alert('✅ Certificado descargado correctamente')
    } catch (error) {
      console.error('Error al descargar certificado:', error)
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const handleDescargarResolucion = async () => {
    // TODO: Implementar descarga de resolución
    alert('⏳ Funcionalidad de resolución en desarrollo')
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[96vw] w-[96vw] max-h-[96vh] overflow-hidden p-0">
          {/* Header Mejorado con Gradiente */}
          <DialogHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white px-8 py-6 border-b-4 border-blue-900 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                  <FileCheck className="h-9 w-9 text-white drop-shadow-lg" />
                  Licencia N° {habilitacion?.nro_licencia || 'S/N'}
                </DialogTitle>
                <p className="mt-2 text-blue-50 text-sm font-medium">
                  📄 Información detallada y registro completo de actividad
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleDescargarConstancia}
                  className="bg-white text-blue-700 hover:bg-blue-50 border-2 border-white font-semibold shadow-md"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Descargar Constancia
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleDescargarResolucion}
                  className="bg-white text-blue-700 hover:bg-blue-50 border-2 border-white font-semibold shadow-md"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Descargar Resolución
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Contenido scrolleable */}
          <div className="overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 p-6" style={{ maxHeight: 'calc(96vh - 120px)' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 font-medium">Cargando información completa...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Datos de la Habilitación */}
                <div className="rounded-xl border-2 border-blue-200 bg-white shadow-lg">
                  <div className="border-b bg-gray-50 px-4 py-3">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      Datos de la Habilitación
                    </h3>
                  </div>
                  <div className="space-y-4 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="mb-1 text-xs text-gray-500">Estado</p>
                        <Badge
                          variant={hab.estado === 'HABILITADO' ? 'default' : 'secondary'}
                          className="font-semibold"
                        >
                          {hab.estado || 'EN TRÁMITE'}
                        </Badge>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-500">Tipo Transporte</p>
                        <p className="font-semibold text-gray-900">
                          {hab.tipo_transporte || 'Transporte'}
                        </p>
                      </div>
                    </div>

                    {/* Tipo de Habilitación con botón de editar */}
                    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-blue-700">Tipo de Habilitación</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setModalCambiarTipoOpen(true)}
                          className="h-7 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Cambiar
                        </Button>
                      </div>
                      <p className="text-lg font-bold text-blue-900">
                        {hab.tipo || 'Sin especificar'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="mb-1 text-xs text-gray-500">Vigencia Inicio</p>
                        <p className="font-semibold text-gray-900">
                          {hab.vigencia_inicio
                            ? new Date(hab.vigencia_inicio).toLocaleDateString('es-AR')
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-500">Vigencia Fin</p>
                        <p className="font-semibold text-gray-900">
                          {hab.vigencia_fin
                            ? new Date(hab.vigencia_fin).toLocaleDateString('es-AR')
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personas Asociadas */}
                <div className="rounded-xl border-2 border-green-200 bg-white shadow-lg">
                  <div className="border-b bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <User className="h-5 w-5 text-green-600" />
                      Personas Asociadas
                    </h3>
                  </div>
                  <div className="space-y-3 p-4">
                    {hab.habilitaciones_personas?.map((rel: any, idx: number) => (
                      <div key={idx} className="rounded-lg bg-gray-50 p-3">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <p className="font-bold uppercase text-gray-900">
                              {rel.persona?.nombre || rel.nombre || 'Nombre no disponible'}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              {rel.rol || 'ROL NO ESPECIFICADO'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">DNI:</span>{' '}
                          {rel.persona?.dni || rel.dni || 'No disponible'}
                        </p>
                        {rel.licencia_categoria && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Licencia:</span> {rel.licencia_categoria}
                          </p>
                        )}
                      </div>
                    )) || (
                      <p className="py-4 text-center text-sm text-gray-500">
                        No hay personas asociadas
                      </p>
                    )}
                  </div>
                </div>

                {/* Vehículo Asociado */}
                <div className="rounded-xl border-2 border-orange-200 bg-white shadow-lg">
                  <div className="border-b bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <Car className="h-5 w-5 text-orange-600" />
                      Vehículo Asociado
                    </h3>
                  </div>
                  <div className="p-4">
                    {hab.habilitaciones_vehiculos?.[0] ? (
                      <div className="space-y-3">
                        {(() => {
                          const vehiculo =
                            hab.habilitaciones_vehiculos[0].vehiculo ||
                            hab.habilitaciones_vehiculos[0]
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="mb-1 text-xs text-gray-500">Dominio</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {vehiculo.dominio || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="mb-1 text-xs text-gray-500">Marca</p>
                                  <p className="font-semibold text-gray-900">
                                    {vehiculo.marca || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="mb-1 text-xs text-gray-500">Modelo</p>
                                  <p className="font-semibold text-gray-900">
                                    {vehiculo.modelo || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="mb-1 text-xs text-gray-500">Año</p>
                                  <p className="font-semibold text-gray-900">
                                    {vehiculo.anio || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="mb-1 text-xs text-gray-500">Asientos</p>
                                  <p className="font-semibold text-gray-900">
                                    {vehiculo.cantidad_asientos || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="mb-1 text-xs text-gray-500">Chasis</p>
                                  <p className="font-semibold text-gray-900">
                                    {vehiculo.nro_chasis || 'N/A'}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <p className="mb-1 text-xs text-gray-500">Motor</p>
                                  <p className="font-semibold text-gray-900">
                                    {vehiculo.nro_motor || 'N/A'}
                                  </p>
                                </div>
                              </div>

                              {/* Información de seguro */}
                              <div className="mt-3 border-t pt-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="mb-1 text-xs text-gray-500">Aseguradora</p>
                                    <p className="font-semibold text-gray-900">
                                      {vehiculo.aseguradora || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs text-gray-500">Póliza Nº</p>
                                    <p className="font-semibold text-gray-900">
                                      {vehiculo.poliza_nro || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs text-gray-500">Vencimiento Póliza</p>
                                    <p className="font-semibold text-gray-900">
                                      {vehiculo.poliza_vencimiento
                                        ? new Date(vehiculo.poliza_vencimiento).toLocaleDateString(
                                            'es-AR'
                                          )
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs text-gray-500">Vencimiento VTV</p>
                                    <p className="font-semibold text-gray-900">
                                      {vehiculo.vtv_vencimiento
                                        ? new Date(vehiculo.vtv_vencimiento).toLocaleDateString(
                                            'es-AR'
                                          )
                                        : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-sm text-gray-500">
                        No hay vehículo asociado
                      </p>
                    )}
                  </div>
                </div>

                {/* Historial de Colocación de Obleas */}
                <div className="rounded-xl border-2 border-purple-200 bg-white shadow-lg">
                  <div className="border-b bg-gradient-to-r from-purple-50 to-violet-50 px-4 py-3">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <Shield className="h-5 w-5 text-purple-600" />
                      Historial de Colocación de Obleas
                    </h3>
                  </div>
                  <div className="p-4">
                    {hab.obleas?.length > 0 ? (
                      <div className="space-y-3">
                        {hab.obleas.map((oblea: any, idx: number) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {new Date(oblea.fecha_solicitud).toLocaleDateString('es-AR')} -{' '}
                                  {formatearHora(oblea.hora_solicitud)}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  Notificado: {oblea.notificado === 'si' ? '✅ Sí' : '⏳ No'}
                                </p>
                              </div>
                              <Badge variant={oblea.notificado === 'si' ? 'default' : 'secondary'}>
                                {oblea.notificado === 'si' ? 'Notificado' : 'Pendiente'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-sm text-gray-500">
                        No hay registros de colocación de obleas para esta habilitación.
                      </p>
                    )}
                  </div>
                </div>

                {/* Historial de Verificaciones */}
                <div className="rounded-xl border-2 border-teal-200 bg-white shadow-lg">
                  <div className="border-b bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <CheckCircle className="h-5 w-5 text-teal-600" />
                      Historial de Verificaciones
                    </h3>
                  </div>
                  <div className="space-y-3 p-4">
                    {hab.verificaciones?.length > 0 ? (
                      hab.verificaciones.map((verif: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(verif.fecha).toLocaleDateString('es-AR')} -{' '}
                              {formatearHora(verif.hora)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Resultado: <Badge variant="default">{verif.resultado}</Badge>
                            </p>
                            {verif.dominio && (
                              <p className="mt-1 text-xs text-gray-500">
                                Vehículo: {verif.dominio}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVerificacionSeleccionada(verif)}
                          >
                            Ver Detalle
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                        <p className="text-sm text-blue-700">
                          No hay verificaciones técnicas registradas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Historial de Inspecciones */}
                <div className="rounded-xl border-2 border-indigo-200 bg-white shadow-lg">
                  <div className="border-b bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <ClipboardList className="h-5 w-5 text-indigo-600" />
                      Historial de Inspecciones
                    </h3>
                  </div>
                  <div className="p-4">
                    {hab.inspecciones?.length > 0 ? (
                      <div className="space-y-3">
                        {hab.inspecciones.map((insp: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {new Date(insp.fecha_inspeccion).toLocaleDateString('es-AR')}
                              </p>
                              <p className="text-sm text-gray-600">
                                Inspector: {insp.nombre_inspector}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={insp.resultado === 'APROBADO' ? 'default' : 'destructive'}
                              >
                                {insp.resultado || 'Pendiente'}
                              </Badge>
                              <button
                                onClick={() => handleEliminarInspeccion(insp.id)}
                                disabled={eliminandoInspeccion === insp.id}
                                className="rounded p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                                title="Eliminar inspección"
                              >
                                {eliminandoInspeccion === insp.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                        <p className="text-sm text-blue-700">
                          No hay inspecciones físicas registradas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Historial de Novedades */}
                <div className="rounded-xl border-2 border-pink-200 bg-white shadow-lg">
                  <div className="border-b bg-gradient-to-r from-pink-50 to-rose-50 px-4 py-3">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <History className="h-5 w-5 text-pink-600" />
                      Historial de Novedades
                    </h3>
                  </div>
                  <div className="p-4">
                    <TimelineNovedades habilitacionId={hab.id} />
                  </div>
                </div>

                {/* Observaciones */}
                {hab.observaciones && (
                  <div className="rounded-xl border-2 border-amber-200 bg-white shadow-lg">
                    <div className="border-b bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3">
                      <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                        <FileText className="h-5 w-5 text-amber-600" />
                        Observaciones
                      </h3>
                    </div>
                    <div className="p-4">
                      <p className="whitespace-pre-wrap text-sm text-gray-700">
                        {hab.observaciones}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para detalle de verificación */}
      <Dialog
        open={!!verificacionSeleccionada}
        onOpenChange={() => setVerificacionSeleccionada(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              Detalle de Verificación Técnica
            </DialogTitle>
          </DialogHeader>

          {verificacionSeleccionada && (
            <div className="space-y-4">
              {/* Información general */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-3 font-semibold text-blue-900">Información General</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Fecha:</span>
                    <span className="ml-2 text-blue-900">
                      {new Date(verificacionSeleccionada.fecha).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Hora:</span>
                    <span className="ml-2 text-blue-900">
                      {formatearHora(verificacionSeleccionada.hora)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Planta:</span>
                    <span className="ml-2 text-blue-900">
                      {verificacionSeleccionada.planta || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Turno:</span>
                    <span className="ml-2 text-blue-900">
                      {verificacionSeleccionada.turno || 'N/A'}
                    </span>
                  </div>
                  {verificacionSeleccionada.dominio && (
                    <div className="col-span-2">
                      <span className="font-medium text-blue-700">Vehículo:</span>
                      <span className="ml-2 font-mono font-bold text-blue-900">
                        {verificacionSeleccionada.dominio}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resultado */}
              <div className="rounded-lg border bg-white p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Resultado de la Verificación</h3>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      verificacionSeleccionada.resultado === 'APROBADO' ? 'default' : 'destructive'
                    }
                    className="px-4 py-2 text-base"
                  >
                    {verificacionSeleccionada.resultado || 'SIN RESULTADO'}
                  </Badge>
                </div>
              </div>

              {/* Datos técnicos */}
              {(verificacionSeleccionada.nro_certificado || verificacionSeleccionada.nro_oblea) && (
                <div className="rounded-lg border bg-white p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">Datos Técnicos</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {verificacionSeleccionada.nro_certificado && (
                      <div>
                        <span className="font-medium text-gray-700">N° Certificado:</span>
                        <span className="ml-2 font-mono text-gray-900">
                          {verificacionSeleccionada.nro_certificado}
                        </span>
                      </div>
                    )}
                    {verificacionSeleccionada.nro_oblea && (
                      <div>
                        <span className="font-medium text-gray-700">N° Oblea:</span>
                        <span className="ml-2 font-mono text-gray-900">
                          {verificacionSeleccionada.nro_oblea}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {verificacionSeleccionada.observaciones && (
                <div className="rounded-lg border bg-white p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">Observaciones</h3>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {verificacionSeleccionada.observaciones}
                  </p>
                </div>
              )}

              {/* Botón cerrar */}
              <div className="flex justify-end pt-2">
                <Button onClick={() => setVerificacionSeleccionada(null)} variant="outline">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para cambiar tipo de habilitación */}
      {hab && (
        <ModalCambiarTipo
          open={modalCambiarTipoOpen}
          onOpenChange={setModalCambiarTipoOpen}
          habilitacion={hab}
          onCambioExitoso={() => {
            cargarDetalleCompleto()
          }}
        />
      )}
    </>
  )
}
