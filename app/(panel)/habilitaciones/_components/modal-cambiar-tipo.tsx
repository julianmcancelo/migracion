'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface ModalCambiarTipoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habilitacion: any
  onCambioExitoso?: () => void
}

const TIPOS_HABILITACION = [
  { value: 'Alta', label: 'Alta (Primera vez)' },
  { value: 'Renovación', label: 'Renovación' },
  { value: 'Cambio de Material', label: 'Cambio de Material Rodante' },
  { value: 'Cambio de Titularidad', label: 'Cambio de Titularidad' },
  { value: 'Ampliación', label: 'Ampliación' },
  { value: 'Modificación', label: 'Modificación de Datos' },
  { value: 'Baja', label: 'Baja' },
]

export default function ModalCambiarTipo({
  open,
  onOpenChange,
  habilitacion,
  onCambioExitoso,
}: ModalCambiarTipoProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tipoSeleccionado, setTipoSeleccionado] = useState(habilitacion?.tipo || '')
  const [observaciones, setObservaciones] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tipoSeleccionado) {
      setError('Debe seleccionar un tipo')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/habilitaciones/${habilitacion.id}/cambiar-tipo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_nuevo: tipoSeleccionado,
          observaciones: observaciones || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onCambioExitoso?.()
        onOpenChange(false)
        // Resetear
        setTipoSeleccionado('')
        setObservaciones('')
      } else {
        setError(data.error || 'Error al cambiar tipo de habilitación')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Cambiar Tipo de Habilitación
          </DialogTitle>
          <DialogDescription>
            Modifique el tipo de trámite. Se registrará en el historial de novedades.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Información actual */}
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Tipo Actual:</p>
          <p className="text-lg font-bold text-gray-900">
            {habilitacion?.tipo || 'Sin especificar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Nuevo Tipo <span className="text-red-600">*</span>
            </Label>
            <Select value={tipoSeleccionado} onValueChange={setTipoSeleccionado}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo de habilitación" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_HABILITACION.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              placeholder="Ej: Cambio solicitado por el titular debido a..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
            />
          </div>

          {/* Info de novedades */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm text-blue-800">
              ℹ️ Este cambio se registrará automáticamente en el historial de novedades.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !tipoSeleccionado}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Cambiar Tipo'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
