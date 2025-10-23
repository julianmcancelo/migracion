'use client'

import { User, Mail, Phone, MapPin } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface Persona {
  id: number
  nombre: string | null
  genero: string | null
  dni: string | null
  cuit: string | null
  telefono: string | null
  email: string | null
  foto_url: string | null
  domicilio_calle: string | null
  domicilio_nro: string | null
  domicilio_localidad: string | null
  rol: string | null
  licencia_categoria: string | null
}

interface PersonaModalProps {
  persona: Persona | null
  open: boolean
  onClose: () => void
}

/**
 * Modal para ver detalles completos de persona
 */
export function PersonaModal({ persona, open, onClose }: PersonaModalProps) {
  if (!persona) return null

  const getRolBadge = (rol: string | null) => {
    const roles: Record<string, { variant: any; label: string; emoji: string }> = {
      TITULAR: { variant: 'default', label: 'Titular', emoji: '👤' },
      CONDUCTOR: { variant: 'secondary', label: 'Conductor', emoji: '🚗' },
      CHOFER: { variant: 'secondary', label: 'Chofer', emoji: '🚗' },
      CELADOR: { variant: 'outline', label: 'Celador', emoji: '👨‍✈️' },
    }

    const config = roles[rol || ''] || { variant: 'outline', label: rol || 'N/A', emoji: '❓' }

    return (
      <Badge variant={config.variant as any} className="px-4 py-1 text-base">
        {config.emoji} {config.label}
      </Badge>
    )
  }

  const InfoRow = ({
    label,
    value,
    highlight = false,
  }: {
    label: string
    value: any
    highlight?: boolean
  }) => (
    <div
      className={`flex items-center justify-between rounded-lg p-3 ${highlight ? 'border border-indigo-200 bg-indigo-50' : 'border'}`}
    >
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-indigo-900' : ''}`}>
        {value || 'No especificado'}
      </span>
    </div>
  )

  const domicilioCompleto = [
    persona.domicilio_calle,
    persona.domicilio_nro,
    persona.domicilio_localidad,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-6 w-6" />
            {persona.nombre || 'Sin nombre'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Foto y Rol */}
          <div className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl">
              {persona.foto_url ? (
                <img
                  src={persona.foto_url}
                  alt={persona.nombre || 'Persona'}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-white">{persona.nombre}</p>
              <div className="mt-2">{getRolBadge(persona.rol)}</div>
            </div>
          </div>

          {/* Datos Personales */}
          <div className="space-y-2">
            <h3 className="mt-4 flex items-center gap-2 font-semibold text-gray-700">
              📋 Datos Personales
            </h3>
            <InfoRow label="DNI" value={persona.dni} highlight={true} />
            <InfoRow label="CUIT" value={persona.cuit} />
            <InfoRow label="Género" value={persona.genero} />
          </div>

          {/* Licencia de Conducir */}
          {persona.licencia_categoria && (
            <div className="space-y-2">
              <h3 className="mt-4 flex items-center gap-2 font-semibold text-gray-700">
                🪪 Licencia de Conducir
              </h3>
              <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4 text-center">
                <p className="mb-1 text-sm text-gray-600">Categoría</p>
                <p className="text-3xl font-bold text-yellow-900">{persona.licencia_categoria}</p>
              </div>
            </div>
          )}

          {/* Contacto */}
          <div className="space-y-2">
            <h3 className="mt-4 flex items-center gap-2 font-semibold text-gray-700">
              📞 Contacto
            </h3>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Teléfono</span>
              <span className="ml-auto font-semibold">{persona.telefono || 'No especificado'}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Email</span>
              <span className="ml-auto text-sm font-semibold">
                {persona.email || 'No especificado'}
              </span>
            </div>
          </div>

          {/* Domicilio */}
          {domicilioCompleto && (
            <div className="space-y-2">
              <h3 className="mt-4 flex items-center gap-2 font-semibold text-gray-700">
                <MapPin className="h-5 w-5" />
                Domicilio
              </h3>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-900">{domicilioCompleto}</p>
              </div>
            </div>
          )}

          {/* Info adicional */}
          <div className="mt-4 rounded-lg border bg-gray-100 p-3">
            <p className="text-xs text-gray-600">
              <strong>ID:</strong> {persona.id}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
