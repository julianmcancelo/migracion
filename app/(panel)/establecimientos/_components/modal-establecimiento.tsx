'use client'

import { useState, useEffect } from 'react'
import { Building2, Car, MapPin, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Switch } from '@/components/ui/switch'

interface ModalEstablecimientoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  establecimiento?: any | null
  ubicacionInicial?: { lat: number; lng: number } | null
  onGuardadoExitoso: () => void
  onEliminar?: () => void
}

export default function ModalEstablecimiento({
  open,
  onOpenChange,
  establecimiento,
  ubicacionInicial,
  onGuardadoExitoso,
  onEliminar,
}: ModalEstablecimientoProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'ESCUELA' as 'ESCUELA' | 'REMISERIA',
    direccion: '',
    latitud: 0,
    longitud: 0,
    telefono: '',
    email: '',
    responsable: '',
    observaciones: '',
    activo: true,
  })

  useEffect(() => {
    if (open) {
      if (establecimiento) {
        // Editar existente
        setFormData({
          nombre: establecimiento.nombre || '',
          tipo: establecimiento.tipo || 'ESCUELA',
          direccion: establecimiento.direccion || '',
          latitud: establecimiento.latitud || 0,
          longitud: establecimiento.longitud || 0,
          telefono: establecimiento.telefono || '',
          email: establecimiento.email || '',
          responsable: establecimiento.responsable || '',
          observaciones: establecimiento.observaciones || '',
          activo: establecimiento.activo !== false,
        })
      } else if (ubicacionInicial) {
        // Nuevo desde mapa
        setFormData(prev => ({
          ...prev,
          latitud: ubicacionInicial.lat,
          longitud: ubicacionInicial.lng,
        }))
      }
    }
  }, [open, establecimiento, ubicacionInicial])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    if (!formData.direccion.trim()) {
      setError('La dirección es obligatoria')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = establecimiento
        ? `/api/establecimientos/${establecimiento.id}`
        : '/api/establecimientos'

      const method = establecimiento ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Establecimiento ${establecimiento ? 'actualizado' : 'creado'} exitosamente`)
        onGuardadoExitoso()
      } else {
        setError(data.error || 'Error al guardar establecimiento')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const esNuevo = !establecimiento

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {formData.tipo === 'ESCUELA' ? (
              <Building2 className="h-5 w-5 text-green-600" />
            ) : (
              <Car className="h-5 w-5 text-purple-600" />
            )}
            {esNuevo ? 'Nuevo Establecimiento' : `Editar: ${establecimiento.nombre}`}
          </DialogTitle>
          <DialogDescription>
            {esNuevo
              ? '📍 Complete los datos del nuevo establecimiento'
              : 'Modifique los datos del establecimiento'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo <span className="text-red-600">*</span>
            </Label>
            <Select value={formData.tipo} onValueChange={(v) => handleChange('tipo', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ESCUELA">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-600" />
                    Establecimiento Educativo
                  </div>
                </SelectItem>
                <SelectItem value="REMISERIA">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-purple-600" />
                    Remisería
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-600">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Escuela N° 123 o Remisería San Martín"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">
              Dirección <span className="text-red-600">*</span>
            </Label>
            <Input
              id="direccion"
              placeholder="Ej: Av. San Martín 1234, Lanús"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              required
            />
          </div>

          {/* Coordenadas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitud">Latitud</Label>
              <Input
                id="latitud"
                type="number"
                step="0.000001"
                value={formData.latitud}
                onChange={(e) => handleChange('latitud', parseFloat(e.target.value) || 0)}
                placeholder="-34.7081"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitud">Longitud</Label>
              <Input
                id="longitud"
                type="number"
                step="0.000001"
                value={formData.longitud}
                onChange={(e) => handleChange('longitud', parseFloat(e.target.value) || 0)}
                placeholder="-58.3958"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                placeholder="Ej: 11-2345-6789"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ej: contacto@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>

          {/* Responsable */}
          <div className="space-y-2">
            <Label htmlFor="responsable">Responsable</Label>
            <Input
              id="responsable"
              placeholder="Ej: Director Juan Pérez"
              value={formData.responsable}
              onChange={(e) => handleChange('responsable', e.target.value)}
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales..."
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              rows={3}
            />
          </div>

          {/* Activo */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Estado</Label>
              <p className="text-sm text-gray-500">
                Establecimiento {formData.activo ? 'activo' : 'inactivo'}
              </p>
            </div>
            <Switch
              checked={formData.activo}
              onCheckedChange={(checked) => handleChange('activo', checked)}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 justify-end pt-4">
            {!esNuevo && onEliminar && (
              <Button
                type="button"
                variant="destructive"
                onClick={onEliminar}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  {esNuevo ? 'Crear Establecimiento' : 'Guardar Cambios'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
