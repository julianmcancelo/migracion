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
import { MapPin, X, Search, MapPinned, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface FormularioParadaProps {
  onSubmit: (data: ParadaFormData) => Promise<void>
  onCancel?: () => void
  editingParada?: Parada | null
  initialLat?: number
  initialLng?: number
  editingLat?: number
  editingLng?: number
  onCoordinatesChange?: (lat: number, lng: number) => void
}

export default function FormularioParada({
  onSubmit,
  onCancel,
  editingParada,
  initialLat,
  initialLng,
  editingLat,
  editingLng,
  onCoordinatesChange,
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

  // Estados para geocodificación
  const [searchAddress, setSearchAddress] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeResult, setGeocodeResult] = useState<{
    lat: number
    lng: number
    formatted_address: string
  } | null>(null)

  // Actualizar formulario cuando se está editando
  useEffect(() => {
    if (editingParada) {
      setFormData({
        titulo: editingParada.titulo,
        tipo: editingParada.tipo,
        descripcion: editingParada.descripcion || '',
        latitud: editingLat !== undefined ? editingLat : editingParada.latitud,
        longitud: editingLng !== undefined ? editingLng : editingParada.longitud,
        estado: editingParada.estado || 'ok',
      })
    }
  }, [editingParada, editingLat, editingLng])

  // Actualizar coordenadas cuando cambian desde el mapa (nuevo punto)
  useEffect(() => {
    if (initialLat !== undefined && initialLng !== undefined && !editingParada) {
      setFormData((prev) => ({
        ...prev,
        latitud: initialLat,
        longitud: initialLng,
      }))
    }
  }, [initialLat, initialLng, editingParada])

  const handleGeocode = async () => {
    if (!searchAddress.trim()) {
      toast.error('Escribe una dirección para buscar')
      return
    }

    setGeocoding(true)
    setGeocodeResult(null)

    try {
      const response = await fetch('/api/paradas/geocode-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: searchAddress }),
      })

      const data = await response.json()

      if (data.success) {
        setGeocodeResult({
          lat: data.lat,
          lng: data.lng,
          formatted_address: data.formatted_address,
        })
        toast.success('¡Ubicación encontrada!')
      } else {
        toast.error(data.error || 'No se encontró la dirección')
      }
    } catch (error) {
      console.error('Error en geocodificación:', error)
      toast.error('Error al buscar la dirección')
    } finally {
      setGeocoding(false)
    }
  }

  const handleConfirmGeocode = () => {
    if (geocodeResult) {
      setFormData({
        ...formData,
        latitud: geocodeResult.lat,
        longitud: geocodeResult.lng,
      })
      // Notificar al componente padre para mover el marcador en el mapa
      if (onCoordinatesChange) {
        onCoordinatesChange(geocodeResult.lat, geocodeResult.lng)
      }
      toast.success('📍 Coordenadas actualizadas desde dirección')
      setGeocodeResult(null)
      setSearchAddress('')
    }
  }

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
      setSearchAddress('')
      setGeocodeResult(null)
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

          {/* Búsqueda por Dirección */}
          <div className="space-y-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPinned className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-semibold text-blue-900">Buscar por Dirección</Label>
            </div>
            <p className="text-xs text-blue-700 mb-3">
              Escribe una dirección para encontrar las coordenadas automáticamente
            </p>
            
            <div className="flex gap-2">
              <Input
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Ej: Av. Hipólito Yrigoyen 5650, Lanús"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleGeocode()
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleGeocode}
                disabled={geocoding || !searchAddress.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {geocoding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>

            {/* Resultado de geocodificación */}
            {geocodeResult && (
              <div className="mt-3 p-3 bg-white border-2 border-green-300 rounded-lg animate-in slide-in-from-top">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      ✓ Ubicación Encontrada
                    </p>
                    <p className="text-xs text-gray-700 mb-2">
                      {geocodeResult.formatted_address}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {geocodeResult.lat.toFixed(6)}, {geocodeResult.lng.toFixed(6)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleConfirmGeocode}
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Usar Esta Ubicación
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Coordenadas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label>Coordenadas *</Label>
              {editingParada && editingLat !== undefined && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <i className="fa-solid fa-arrows-up-down-left-right"></i>
                  Actualizado por arrastre
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitud" className="text-xs text-gray-600">Latitud</Label>
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
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitud" className="text-xs text-gray-600">Longitud</Label>
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
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 También puedes hacer click en el mapa o arrastrar el marcador (en modo edición)
            </p>
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
