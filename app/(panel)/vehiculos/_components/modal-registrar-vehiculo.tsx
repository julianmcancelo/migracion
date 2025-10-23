'use client'

import { useState } from 'react'
import { Car, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ModalRegistrarVehiculoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegistroExitoso?: () => void
}

export default function ModalRegistrarVehiculo({
  open,
  onOpenChange,
  onRegistroExitoso,
}: ModalRegistrarVehiculoProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    dominio: '',
    marca: '',
    modelo: '',
    tipo: '',
    ano: '',
    chasis: '',
    motor: '',
    asientos: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.dominio.trim()) {
      setError('El dominio es obligatorio')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dominio: formData.dominio.toUpperCase(),
          marca: formData.marca || null,
          modelo: formData.modelo || null,
          tipo: formData.tipo || null,
          ano: formData.ano ? parseInt(formData.ano) : null,
          chasis: formData.chasis || null,
          motor: formData.motor || null,
          asientos: formData.asientos ? parseInt(formData.asientos) : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onRegistroExitoso?.()
        onOpenChange(false)
        // Resetear formulario
        setFormData({
          dominio: '',
          marca: '',
          modelo: '',
          tipo: '',
          ano: '',
          chasis: '',
          motor: '',
          asientos: '',
        })
      } else {
        setError(data.error || 'Error al registrar vehículo')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-600" />
            Registrar Nuevo Vehículo
          </DialogTitle>
          <DialogDescription>
            Complete los datos del vehículo. El dominio es obligatorio.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dominio (obligatorio) */}
          <div className="space-y-2">
            <Label htmlFor="dominio">
              Dominio <span className="text-red-600">*</span>
            </Label>
            <Input
              id="dominio"
              placeholder="Ej: ABC123"
              value={formData.dominio}
              onChange={(e) => handleChange('dominio', e.target.value.toUpperCase())}
              required
              maxLength={10}
              className="uppercase"
            />
          </div>

          {/* Marca y Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                placeholder="Ej: Ford"
                value={formData.marca}
                onChange={(e) => handleChange('marca', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                placeholder="Ej: Transit"
                value={formData.modelo}
                onChange={(e) => handleChange('modelo', e.target.value)}
              />
            </div>
          </div>

          {/* Tipo y Año */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Input
                id="tipo"
                placeholder="Ej: Minibus"
                value={formData.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano">Año</Label>
              <Input
                id="ano"
                type="number"
                placeholder="Ej: 2020"
                value={formData.ano}
                onChange={(e) => handleChange('ano', e.target.value)}
                min="1900"
                max="2099"
              />
            </div>
          </div>

          {/* Chasis y Motor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chasis">N° Chasis</Label>
              <Input
                id="chasis"
                placeholder="Número de chasis"
                value={formData.chasis}
                onChange={(e) => handleChange('chasis', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motor">N° Motor</Label>
              <Input
                id="motor"
                placeholder="Número de motor"
                value={formData.motor}
                onChange={(e) => handleChange('motor', e.target.value)}
              />
            </div>
          </div>

          {/* Asientos */}
          <div className="space-y-2">
            <Label htmlFor="asientos">Cantidad de Asientos</Label>
            <Input
              id="asientos"
              type="number"
              placeholder="Ej: 15"
              value={formData.asientos}
              onChange={(e) => handleChange('asientos', e.target.value)}
              min="1"
              max="100"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.dominio.trim()}>
              {loading ? 'Registrando...' : 'Registrar Vehículo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
