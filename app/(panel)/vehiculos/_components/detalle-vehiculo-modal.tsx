'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Car, 
  Calendar, 
  User, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Shield,
  Clock,
  X,
  Mail,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PreviewEmailModal } from './preview-email-modal'

interface DetalleVehiculoModalProps {
  vehiculoId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Modal minimalista para ver detalles completos del vehículo
 * Diseño limpio y estético con información organizada
 */
export function DetalleVehiculoModal({
  vehiculoId,
  open,
  onOpenChange,
}: DetalleVehiculoModalProps) {
  const [vehiculo, setVehiculo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [enviandoNotificacion, setEnviandoNotificacion] = useState(false)
  const [showPreviewEmail, setShowPreviewEmail] = useState(false)
  const [documentosParaNotificar, setDocumentosParaNotificar] = useState<any[]>([])

  useEffect(() => {
    if (open && vehiculoId) {
      cargarDetalles()
    }
  }, [open, vehiculoId])

  const cargarDetalles = async () => {
    if (!vehiculoId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}`)
      const data = await response.json()

      if (data.success) {
        setVehiculo(data.data)
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-AR')
  }

  const solicitarActualizacion = () => {
    if (!vehiculo || !vehiculoId) return

    const documentosVencidos = []

    if (vehiculo.alertas?.vtv?.vencida) {
      documentosVencidos.push({
        tipo: 'VTV',
        vencimiento: vehiculo.Vencimiento_VTV,
        diasVencido: Math.abs(vehiculo.alertas.vtv.diasRestantes)
      })
    }

    if (vehiculo.alertas?.poliza?.vencida) {
      documentosVencidos.push({
        tipo: 'Póliza de Seguro',
        vencimiento: vehiculo.Vencimiento_Poliza,
        diasVencido: Math.abs(vehiculo.alertas.poliza.diasRestantes)
      })
    }

    if (documentosVencidos.length === 0) {
      alert('⚠️ No hay documentos vencidos para notificar')
      return
    }

    // Guardar documentos y mostrar vista previa
    setDocumentosParaNotificar(documentosVencidos)
    setShowPreviewEmail(true)
  }

  const confirmarEnvioNotificacion = async () => {
    if (!vehiculo || !vehiculoId) return

    setEnviandoNotificacion(true)

    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}/solicitar-actualizacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentosVencidos: documentosParaNotificar,
          mensaje: `Documentación vencida del vehículo ${vehiculo.dominio}`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar notificación')
      }

      setShowPreviewEmail(false)
      
      alert(
        `✅ Notificación enviada correctamente\n\n` +
        `Titular: ${data.data.titular.nombre}\n` +
        `Email: ${data.data.titular.email}\n\n` +
        `Se solicitó actualizar:\n` +
        documentosParaNotificar.map(d => `• ${d.tipo}`).join('\n')
      )
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setEnviandoNotificacion(false)
    }
  }

  if (loading || !vehiculo) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-600">Cargando detalles...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const { alertas } = vehiculo

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 text-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <DialogTitle className="flex items-center gap-3 text-3xl font-bold">
            <Car className="h-8 w-8" />
            {vehiculo.dominio}
          </DialogTitle>
          <p className="mt-2 text-blue-100">
            {vehiculo.marca} {vehiculo.modelo} {vehiculo.ano ? `(${vehiculo.ano})` : ''}
          </p>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto p-8" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Alertas */}
          {(alertas?.vtv?.vencida || alertas?.vtv?.proximaVencer || alertas?.poliza?.vencida || alertas?.poliza?.proximaVencer) && (
            <div className="mb-6">
              {/* Botón de notificación si hay algo vencido */}
              {(alertas?.vtv?.vencida || alertas?.poliza?.vencida) && (
                <div className="mb-4">
                  <Button
                    onClick={solicitarActualizacion}
                    disabled={enviandoNotificacion}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                    size="lg"
                  >
                    {enviandoNotificacion ? (
                      <>
                        <Clock className="mr-2 h-5 w-5 animate-spin" />
                        Enviando notificación...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-5 w-5" />
                        Solicitar Actualización de Documentos
                      </>
                    )}
                  </Button>
                  <p className="mt-2 text-center text-xs text-gray-600">
                    Se enviará un email al titular solicitando la documentación vencida
                  </p>
                </div>
              )}

              <div className="space-y-3">
              {alertas.vtv?.vencida && (
                <div className="flex items-center gap-3 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">VTV Vencida</p>
                    <p className="text-sm text-red-700">
                      Vencida hace {Math.abs(alertas.vtv.diasRestantes)} días
                    </p>
                  </div>
                </div>
              )}

              {alertas.vtv?.proximaVencer && (
                <div className="flex items-center gap-3 rounded-lg border-2 border-yellow-200 bg-yellow-50 px-4 py-3">
                  <Clock className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-900">VTV Próxima a Vencer</p>
                    <p className="text-sm text-yellow-700">
                      Vence en {alertas.vtv.diasRestantes} días
                    </p>
                  </div>
                </div>
              )}

              {alertas.poliza?.vencida && (
                <div className="flex items-center gap-3 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Póliza Vencida</p>
                    <p className="text-sm text-red-700">
                      Vencida hace {Math.abs(alertas.poliza.diasRestantes)} días
                    </p>
                  </div>
                </div>
              )}

              {alertas.poliza?.proximaVencer && (
                <div className="flex items-center gap-3 rounded-lg border-2 border-yellow-200 bg-yellow-50 px-4 py-3">
                  <Clock className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-900">Póliza Próxima a Vencer</p>
                    <p className="text-sm text-yellow-700">
                      Vence en {alertas.poliza.diasRestantes} días
                    </p>
                  </div>
                </div>
              )}
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Información Técnica */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <Car className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Información Técnica</h3>
              </div>

              <DataRow label="Tipo" value={vehiculo.tipo || '-'} />
              <DataRow label="Chasis" value={vehiculo.chasis || '-'} mono />
              <DataRow label="Motor" value={vehiculo.motor || '-'} mono />
              <DataRow label="Asientos" value={vehiculo.asientos || '-'} />
              <DataRow 
                label="Inscripción Inicial" 
                value={formatearFecha(vehiculo.inscripcion_inicial)} 
              />
            </div>

            {/* VTV y Seguro */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">VTV y Seguro</h3>
              </div>

              <DataRow 
                label="Vencimiento VTV" 
                value={formatearFecha(vehiculo.Vencimiento_VTV)}
                badge={
                  alertas?.vtv?.vencida 
                    ? { text: 'Vencida', variant: 'destructive' as const }
                    : alertas?.vtv?.proximaVencer 
                    ? { text: 'Por vencer', variant: 'secondary' as const }
                    : vehiculo.Vencimiento_VTV 
                    ? { text: 'Vigente', variant: 'default' as const }
                    : null
                }
              />
              <DataRow label="Aseguradora" value={vehiculo.Aseguradora || '-'} />
              <DataRow label="N° Póliza" value={vehiculo.poliza || '-'} mono />
              <DataRow 
                label="Vencimiento Póliza" 
                value={formatearFecha(vehiculo.Vencimiento_Poliza)}
                badge={
                  alertas?.poliza?.vencida 
                    ? { text: 'Vencida', variant: 'destructive' as const }
                    : alertas?.poliza?.proximaVencer 
                    ? { text: 'Por vencer', variant: 'secondary' as const }
                    : vehiculo.Vencimiento_Poliza 
                    ? { text: 'Vigente', variant: 'default' as const }
                    : null
                }
              />
            </div>
          </div>

          {/* Habilitaciones Asociadas */}
          {vehiculo.habilitaciones_vehiculos && vehiculo.habilitaciones_vehiculos.length > 0 && (
            <div className="mt-8">
              <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Habilitaciones Activas</h3>
                <Badge variant="secondary" className="ml-auto">
                  {vehiculo.habilitaciones_vehiculos.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {vehiculo.habilitaciones_vehiculos.map((hv: any) => {
                  const titular = hv.habilitacion?.habilitaciones_personas?.[0]?.persona
                  
                  return (
                    <div
                      key={hv.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge className="font-mono">
                              {hv.habilitacion?.nro_licencia || 'S/N'}
                            </Badge>
                            <Badge variant="outline">
                              {hv.habilitacion?.tipo_transporte}
                            </Badge>
                            <Badge 
                              variant={
                                hv.habilitacion?.estado === 'HABILITADO' ? 'default' as const : 'secondary'
                              }
                            >
                              {hv.habilitacion?.estado}
                            </Badge>
                          </div>

                          {titular && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{titular.nombre}</span>
                              <span className="text-gray-400">•</span>
                              <span>DNI {titular.dni}</span>
                            </div>
                          )}

                          {hv.habilitacion?.vigencia_hasta && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Vigencia hasta: {formatearFecha(hv.habilitacion.vigencia_hasta)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sin habilitaciones */}
          {(!vehiculo.habilitaciones_vehiculos || vehiculo.habilitaciones_vehiculos.length === 0) && (
            <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-600">
                Este vehículo no tiene habilitaciones activas
              </p>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Modal de Vista Previa del Email */}
      {vehiculo && (
        <PreviewEmailModal
          open={showPreviewEmail}
          onOpenChange={setShowPreviewEmail}
          onConfirm={confirmarEnvioNotificacion}
          titular={{
            nombre: vehiculo.habilitaciones_vehiculos?.[0]?.habilitacion
              ?.habilitaciones_personas?.[0]?.persona?.nombre || 'Titular',
            email: vehiculo.habilitaciones_vehiculos?.[0]?.habilitacion
              ?.habilitaciones_personas?.[0]?.persona?.email || 'Sin email'
          }}
          vehiculo={{
            dominio: vehiculo.dominio,
            marca: vehiculo.marca,
            modelo: vehiculo.modelo
          }}
          documentosVencidos={documentosParaNotificar}
          enviando={enviandoNotificacion}
        />
      )}
    </Dialog>
  )
}

// Componente auxiliar para mostrar datos
function DataRow({ 
  label, 
  value, 
  mono = false,
  badge
}: { 
  label: string
  value: string | number
  mono?: boolean
  badge?: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } | null
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-medium text-gray-900 ${mono ? 'font-mono text-sm' : ''}`}>
          {value}
        </span>
        {badge && (
          <Badge variant={badge.variant}>
            {badge.text}
          </Badge>
        )}
      </div>
    </div>
  )
}
