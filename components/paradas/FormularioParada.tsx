'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ParadaFormData, TIPOS_PARADA, Parada } from './types'
import { MapPin, X } from 'lucide-react'

interface FormularioParadaProps {
  onSubmit: (data: ParadaFormData) => Promise<void>
  onCancel?: () => void
  editingParada?: Parada | null
  initialLat?: number
  initialLng?: number
}

export default function FormularioParada({
  onSubmit,
  onCancel,
  editingParada,
  initialLat,
  initialLng,
}: FormularioParadaProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ParadaFormData>({
    titulo: '',
    tipo: 'transporte',
    descripcion: '',
    latitud: initialLat || -34.715,
    longitud: initialLng || -58.407,
    estado: 'ok',
  })

  // Actualizar formulario cuando se está editando
  useEffect(() => {
    if (editingParada) {
      setFormData({
        titulo: editingParada.titulo,
        tipo: editingParada.tipo,
        descripcion: editingParada.descripcion || '',
        latitud: editingParada.latitud,
        longitud: editingParada.longitud,
        estado: editingParada.estado || 'ok',
      })
    }
  }, [editingParada])

  // Actualizar coordenadas cuando cambian desde el mapa
  useEffect(() => {
    if (initialLat !== undefined && initialLng !== undefined && !editingParada) {
      setFormData((prev) => ({
        ...prev,
        latitud: initialLat,
        longitud: initialLng,
      }))
    }
  }, [initialLat, initialLng, editingParada])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      // Resetear formulario si no estamos editando
      if (!editingParada) {
        setFormData({
          titulo: '',
          tipo: 'transporte',
          descripcion: '',
          latitud: initialLat || -34.715,
          longitud: initialLng || -58.407,
          estado: 'ok',
        })
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <CardTitle>
            {editingParada ? 'Editar Punto' : 'Añadir Nuevo Punto'}
          </CardTitle>
        </div>
        {editingParada && onCancel && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
              required
              placeholder="Ej: Municipalidad de Lanús"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Punto *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: any) =>
                setFormData({ ...formData, tipo: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPOS_PARADA).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Añada detalles adicionales..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitud">Latitud *</Label>
              <Input
                id="latitud"
                type="number"
                step="any"
                value={formData.latitud}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    latitud: parseFloat(e.target.value),
                  })
                }
                required
                placeholder="Click en el mapa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitud">Longitud *</Label>
              <Input
                id="longitud"
                type="number"
                step="any"
                value={formData.longitud}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    longitud: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          {formData.tipo === 'semaforo' && (
            <div className="space-y-2">
              <Label htmlFor="estado">Estado del Semáforo</Label>
              <Select
                value={formData.estado || 'ok'}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, estado: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ok">Funcionando</SelectItem>
                  <SelectItem value="falla">Con Falla</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? 'Guardando...'
                : editingParada
                ? 'Actualizar Punto'
                : 'Guardar Punto'}
            </Button>
            {editingParada && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
