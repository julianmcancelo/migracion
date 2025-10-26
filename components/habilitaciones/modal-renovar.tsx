'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'

interface ModalRenovarProps {
  habilitacion: {
    id: number
    nro_licencia: string | null
    expte: string | null
    tipo_transporte: string | null
    vigencia_fin: Date | null
    titular?: string
    vehiculo?: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalRenovar({ habilitacion, open, onOpenChange }: ModalRenovarProps) {
  const router = useRouter()
  const [nuevoExpediente, setNuevoExpediente] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advertencias, setAdvertencias] = useState<string[]>([])
  const [success, setSuccess] = useState(false)

  const handleRenovar = async () => {
    if (!nuevoExpediente.trim()) {
      setError('Debe ingresar el número de expediente')
      return
    }

    setLoading(true)
    setError(null)
    setAdvertencias([])

    try {
      const res = await fetch(`/api/habilitaciones/${habilitacion.id}/renovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nuevoExpediente: nuevoExpediente.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.advertencia && data.faltantes) {
          setAdvertencias(data.faltantes)
          setError('Hay documentos vencidos. ¿Desea continuar de todos modos?')
        } else {
          setError(data.error || 'Error al renovar la habilitación')
        }
        return
      }

      // Éxito
      setSuccess(true)
      if (data.advertencias && data.advertencias.length > 0) {
        setAdvertencias(data.advertencias)
      }

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/habilitaciones/${data.habilitacion_nueva.id}`)
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error('Error al renovar:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleCerrar = () => {
    setNuevoExpediente('')
    setError(null)
    setAdvertencias([])
    setSuccess(false)
    onOpenChange(false)
  }

  // Calcular nuevo número de licencia
  const numeroBase = habilitacion.nro_licencia?.split('/')[0] || habilitacion.nro_licencia || '???'
  const añoActual = new Date().getFullYear()
  const nuevaLicencia = `${numeroBase}/${añoActual}`

  return (
    <Dialog open={open} onOpenChange={handleCerrar}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            Renovar Habilitación
          </DialogTitle>
          <DialogDescription>
            Crear una nueva habilitación para el año {añoActual} manteniendo los mismos datos
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-lg font-semibold text-green-900">¡Renovación exitosa!</h3>
            <p className="mt-2 text-sm text-gray-600">
              Nueva licencia: <span className="font-semibold">{nuevaLicencia}</span>
            </p>
            <p className="mt-1 text-sm text-gray-600">Redirigiendo...</p>
            {advertencias.length > 0 && (
              <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-left">
                <p className="text-sm font-medium text-yellow-800">⚠️ Advertencias:</p>
                <ul className="mt-2 space-y-1 text-xs text-yellow-700">
                  {advertencias.map((adv, i) => (
                    <li key={i}>• {adv}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Info de la habilitación actual */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Habilitación Actual</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Licencia:</span>{' '}
                  <span className="font-semibold">{habilitacion.nro_licencia}</span>
                </p>
                <p>
                  <span className="text-gray-600">Expediente:</span>{' '}
                  <span className="font-semibold">{habilitacion.expte || 'N/A'}</span>
                </p>
                <p>
                  <span className="text-gray-600">Tipo:</span>{' '}
                  <span className="capitalize">{habilitacion.tipo_transporte || 'N/A'}</span>
                </p>
                {habilitacion.titular && (
                  <p>
                    <span className="text-gray-600">Titular:</span>{' '}
                    <span>{habilitacion.titular}</span>
                  </p>
                )}
                {habilitacion.vehiculo && (
                  <p>
                    <span className="text-gray-600">Vehículo:</span>{' '}
                    <span>{habilitacion.vehiculo}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Nueva licencia */}
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-blue-700">Nueva Habilitación</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-blue-600">Licencia:</span>{' '}
                  <span className="font-semibold text-blue-900">{nuevaLicencia}</span>
                </p>
                <p>
                  <span className="text-blue-600">Vigencia:</span>{' '}
                  <span className="text-blue-900">
                    01/01/{añoActual} - 31/12/{añoActual}
                  </span>
                </p>
                <p className="text-xs text-blue-600">
                  ℹ️ Se copiarán personas y vehículos de la habilitación actual
                </p>
              </div>
            </div>

            {/* Input nuevo expediente */}
            <div className="space-y-2">
              <Label htmlFor="expediente">
                Nuevo Número de Expediente <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expediente"
                placeholder="Ej: EXP-2025-0123"
                value={nuevoExpediente}
                onChange={(e) => setNuevoExpediente(e.target.value)}
                disabled={loading}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                El número de expediente es único para cada renovación anual
              </p>
            </div>

            {/* Advertencias */}
            {advertencias.length > 0 && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-sm font-medium text-yellow-800">⚠️ Documentos Vencidos:</p>
                <ul className="mt-2 space-y-1 text-xs text-yellow-700">
                  {advertencias.map((adv, i) => (
                    <li key={i}>• {adv}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-yellow-600">
                  Se creará la renovación pero deberá actualizar estos documentos
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCerrar} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleRenovar} disabled={loading || !nuevoExpediente.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Renovando...' : '🔄 Renovar Habilitación'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
