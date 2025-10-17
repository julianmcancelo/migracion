'use client'

import { Car } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface Vehiculo {
  id: number
  dominio: string | null
  marca: string | null
  modelo: string | null
  tipo: string | null
  chasis: string | null
  ano: number | null
  motor: string | null
  asientos: number | null
  inscripcion_inicial: Date | null
  Aseguradora: string | null
  poliza: string | null
  Vencimiento_Poliza: Date | null
  Vencimiento_VTV: Date | null
}

interface VehiculoModalProps {
  vehiculo: Vehiculo | null
  open: boolean
  onClose: () => void
}

const formatearFecha = (fecha: Date | null | string) => {
  if (!fecha) return 'N/A'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-AR')
}

/**
 * Modal para ver detalles completos de vehículo
 */
export function VehiculoModal({ vehiculo, open, onClose }: VehiculoModalProps) {
  if (!vehiculo) return null

  const InfoRow = ({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg ${highlight ? 'bg-indigo-50 border border-indigo-200' : 'border'}`}>
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-indigo-900' : ''}`}>
        {value || 'No especificado'}
      </span>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Car className="h-6 w-6" />
            Vehículo: {vehiculo.dominio || 'Sin dominio'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Identificación */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              📋 Identificación
            </h3>
            <div className="flex items-center justify-center p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <span className="text-3xl font-bold text-white tracking-wider">
                {vehiculo.dominio || 'SIN DOMINIO'}
              </span>
            </div>
            <InfoRow label="Tipo" value={vehiculo.tipo} />
          </div>

          {/* Especificaciones */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mt-4">
              🔧 Especificaciones
            </h3>
            <InfoRow label="Marca" value={vehiculo.marca} />
            <InfoRow label="Modelo" value={vehiculo.modelo} />
            <InfoRow label="Año" value={vehiculo.ano} />
            <InfoRow label="Chasis" value={vehiculo.chasis} />
            <InfoRow label="Motor" value={vehiculo.motor} />
            <InfoRow label="Asientos" value={vehiculo.asientos} />
            <InfoRow label="Inscripción Inicial" value={formatearFecha(vehiculo.inscripcion_inicial)} />
          </div>

          {/* Seguros */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mt-4">
              🛡️ Seguros
            </h3>
            <InfoRow label="Aseguradora" value={vehiculo.Aseguradora} />
            <InfoRow label="Póliza" value={vehiculo.poliza} />
            <InfoRow label="Vencimiento Póliza" value={formatearFecha(vehiculo.Vencimiento_Poliza)} highlight={true} />
          </div>

          {/* VTV */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mt-4">
              ✅ Verificación Técnica
            </h3>
            <InfoRow label="Vencimiento VTV" value={formatearFecha(vehiculo.Vencimiento_VTV)} highlight={true} />
          </div>

          {/* Info adicional */}
          <div className="mt-4 p-3 bg-gray-100 border rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>ID:</strong> {vehiculo.id}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
