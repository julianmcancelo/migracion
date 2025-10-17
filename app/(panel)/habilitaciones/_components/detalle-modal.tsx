'use client'

import { FileText, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface DetalleModalProps {
  habilitacion: any | null
  open: boolean
  onClose: () => void
}

/**
 * Modal para ver detalle completo de habilitación
 */
export function DetalleModal({ habilitacion, open, onClose }: DetalleModalProps) {
  if (!habilitacion) return null

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Habilitación #{habilitacion.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Encabezado con estado */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <div>
              <p className="text-white text-lg font-semibold">
                {habilitacion.tipo_transporte || 'Transporte'}
              </p>
              <p className="text-indigo-100 text-sm">
                Titular: {habilitacion.titular_principal || 'N/A'}
              </p>
            </div>
            {getEstadoBadge(habilitacion.estado)}
          </div>

          {/* Información General */}
          <InfoSection title="📋 Información General" icon="📋">
            <InfoRow label="Número" value={habilitacion.numero} />
            <InfoRow label="Legajo" value={habilitacion.legajo} />
            <InfoRow label="Expediente" value={habilitacion.expte} />
            <InfoRow label="Tipo Transporte" value={habilitacion.tipo_transporte} />
          </InfoSection>

          {/* Vigencia */}
          <InfoSection title="📅 Vigencia" icon={<Calendar className="h-5 w-5" />}>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Inicio</p>
                <p className="font-semibold text-green-900">
                  {habilitacion.vigencia_inicio ? new Date(habilitacion.vigencia_inicio).toLocaleDateString('es-AR') : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Fin</p>
                <p className="font-semibold text-red-900">
                  {habilitacion.vigencia_fin ? new Date(habilitacion.vigencia_fin).toLocaleDateString('es-AR') : 'N/A'}
                </p>
              </div>
            </div>
          </InfoSection>

          {/* Personas */}
          {habilitacion.personas?.length > 0 && (
            <InfoSection title="👥 Personas" icon="👥">
              <div className="space-y-2">
                {habilitacion.personas.map((persona: any) => (
                  <div key={persona.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{persona.nombre}</p>
                      <p className="text-sm text-gray-600">DNI: {persona.dni}</p>
                    </div>
                    <Badge variant="outline">{persona.rol}</Badge>
                  </div>
                ))}
              </div>
            </InfoSection>
          )}

          {/* Vehículos */}
          {habilitacion.vehiculos?.length > 0 && (
            <InfoSection title="🚗 Vehículos" icon="🚗">
              <div className="space-y-2">
                {habilitacion.vehiculos.map((vehiculo: any) => (
                  <div key={vehiculo.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">{vehiculo.dominio}</p>
                        <p className="text-sm text-gray-600">
                          {vehiculo.marca} {vehiculo.modelo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </InfoSection>
          )}

          {/* Establecimientos */}
          {habilitacion.establecimientos?.length > 0 && (
            <InfoSection title="🏫 Establecimientos" icon="🏫">
              <div className="space-y-2">
                {habilitacion.establecimientos.map((est: any) => (
                  <div key={est.id} className="p-3 border rounded-lg">
                    <p className="font-semibold">{est.nombre}</p>
                    <Badge variant="secondary" className="text-xs">{est.tipo}</Badge>
                  </div>
                ))}
              </div>
            </InfoSection>
          )}

          {/* Observaciones */}
          {habilitacion.observaciones && (
            <InfoSection title="📝 Observaciones" icon="📝">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700">{habilitacion.observaciones}</p>
              </div>
            </InfoSection>
          )}

          {/* Resolución */}
          {habilitacion.tiene_resolucion && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <strong>Esta habilitación tiene resolución adjunta</strong>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
