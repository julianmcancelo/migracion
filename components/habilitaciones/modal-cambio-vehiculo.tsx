'use client'

import { useState, useEffect } from 'react'
import { RefreshCcw, Search, AlertTriangle, History, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Vehiculo {
  id: number
  dominio: string
  marca: string
  modelo: string
  ano?: number
}

interface VehiculoHistorico {
  id: number
  vehiculo_id: number
  dominio: string | null
  marca: string | null
  modelo: string | null
  fecha_alta: string
  fecha_baja: string | null
  observaciones: string | null
}

interface ModalCambioVehiculoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habilitacionId: number
  vehiculoActual?: {
    id: number
    dominio: string
    marca: string
    modelo: string
  }
  onCambioExitoso?: () => void
}

export default function ModalCambioVehiculo({
  open,
  onOpenChange,
  habilitacionId,
  vehiculoActual,
  onCambioExitoso,
}: ModalCambioVehiculoProps) {
  const [paso, setPaso] = useState<'seleccionar' | 'confirmar' | 'historial'>('seleccionar')
  const [busqueda, setBusqueda] = useState('')
  const [vehiculosBuscados, setVehiculosBuscados] = useState<Vehiculo[]>([])
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [historial, setHistorial] = useState<VehiculoHistorico[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar vehículos
  const buscarVehiculos = async () => {
    const busquedaTrim = busqueda.trim()
    
    if (busquedaTrim.length < 2) {
      setError('Ingrese al menos 2 caracteres para buscar')
      return
    }
    
    // Limpiar resultados anteriores
    setVehiculosBuscados([])

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/vehiculos?buscar=${encodeURIComponent(busqueda)}`)
      const data = await response.json()

      if (data.success) {
        setVehiculosBuscados(data.data || [])
        if (!data.data || data.data.length === 0) {
          setError('No se encontraron vehículos con ese criterio de búsqueda')
        }
      } else {
        setError(data.error || data.message || 'Error al buscar vehículos')
      }
    } catch (err) {
      setError('Error de conexión al buscar vehículos')
    } finally {
      setLoading(false)
    }
  }

  // Cargar historial
  const cargarHistorial = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/habilitaciones/${habilitacionId}/cambiar-vehiculo`)
      const data = await response.json()

      if (data.success) {
        setHistorial(data.data.historial || [])
      }
    } finally {
      setLoading(false)
    }
  }

  // Confirmar cambio
  const confirmarCambio = async () => {
    if (!vehiculoSeleccionado) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/habilitaciones/${habilitacionId}/cambiar-vehiculo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nuevo_vehiculo_id: vehiculoSeleccionado.id,
          observaciones: observaciones.trim() || 'Cambio de material rodante',
        }),
      })

      const data = await response.json()

      if (data.success) {
        onCambioExitoso?.()
        onOpenChange(false)
        // Resetear estado
        setPaso('seleccionar')
        setVehiculoSeleccionado(null)
        setObservaciones('')
        setBusqueda('')
        setVehiculosBuscados([])
      } else {
        setError(data.error || 'Error al cambiar vehículo')
      }
    } catch (err) {
      setError('Error al procesar el cambio')
    } finally {
      setLoading(false)
    }
  }

  // Cargar historial al abrir
  useEffect(() => {
    if (open && paso === 'historial') {
      cargarHistorial()
    }
  }, [open, paso])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-blue-600" />
            Cambio de Material Rodante
          </DialogTitle>
          <DialogDescription>
            Cambiar el vehículo de la habilitación manteniendo todo el historial
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={paso === 'seleccionar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPaso('seleccionar')}
          >
            <Search className="h-4 w-4 mr-2" />
            Seleccionar Vehículo
          </Button>
          <Button
            variant={paso === 'historial' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPaso('historial')}
          >
            <History className="h-4 w-4 mr-2" />
            Ver Historial
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* PASO 1: Seleccionar Vehículo */}
        {paso === 'seleccionar' && (
          <div className="space-y-4">
            {/* Vehículo Actual */}
            {vehiculoActual && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <strong>Vehículo Actual:</strong>{' '}
                  <Badge variant="outline" className="ml-2">
                    {vehiculoActual.dominio}
                  </Badge>{' '}
                  {vehiculoActual.marca} {vehiculoActual.modelo}
                </p>
              </div>
            )}

            {/* Buscar Nuevo Vehículo */}
            <div className="space-y-2">
              <Label>Buscar Nuevo Vehículo</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: ABC123, Ford, Transit..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarVehiculos()}
                  disabled={loading}
                />
                <Button onClick={buscarVehiculos} disabled={loading || busqueda.trim().length < 2}>
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {busqueda.trim().length > 0 && busqueda.trim().length < 2 && (
                <p className="text-xs text-orange-600">Ingrese al menos 2 caracteres</p>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-4 text-sm text-gray-500">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
                Buscando vehículos...
              </div>
            )}

            {/* Resultados de Búsqueda */}
            {!loading && vehiculosBuscados.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dominio</TableHead>
                      <TableHead>Marca/Modelo</TableHead>
                      <TableHead>Año</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehiculosBuscados.map((vehiculo) => (
                      <TableRow key={vehiculo.id}>
                        <TableCell className="font-medium">{vehiculo.dominio}</TableCell>
                        <TableCell>
                          {vehiculo.marca} {vehiculo.modelo}
                        </TableCell>
                        <TableCell>{vehiculo.ano || '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={
                              vehiculoSeleccionado?.id === vehiculo.id ? 'default' : 'outline'
                            }
                            onClick={() => {
                              setVehiculoSeleccionado(vehiculo)
                              setPaso('confirmar')
                            }}
                          >
                            {vehiculoSeleccionado?.id === vehiculo.id ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Seleccionado
                              </>
                            ) : (
                              'Seleccionar'
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* No hay resultados */}
            {!loading && busqueda.trim().length >= 2 && vehiculosBuscados.length === 0 && !error && (
              <div className="text-center py-6 border border-dashed rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <p className="text-sm text-gray-600 mb-2">
                  No se encontró el vehículo <strong>{busqueda}</strong>
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  El vehículo debe estar registrado previamente en el sistema
                </p>
                <div className="space-y-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.location.href = '/vehiculos'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    🤖 Registrar con OCR Automático
                  </Button>
                  <p className="text-xs text-blue-600 font-medium">
                    ✨ Escanea el título y la IA carga los datos automáticamente
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 2: Confirmar Cambio */}
        {paso === 'confirmar' && vehiculoSeleccionado && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong>Atención:</strong> Está por cambiar el vehículo de esta habilitación. El
                vehículo anterior quedará registrado en el historial.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-600">Vehículo Actual (se dará de baja)</Label>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium">{vehiculoActual?.dominio}</p>
                  <p className="text-sm text-gray-600">
                    {vehiculoActual?.marca} {vehiculoActual?.modelo}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-green-600">Nuevo Vehículo</Label>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium">{vehiculoSeleccionado.dominio}</p>
                  <p className="text-sm text-gray-600">
                    {vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observaciones del Cambio</Label>
              <Textarea
                placeholder="Ej: Cambio de material rodante por solicitud del titular..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPaso('seleccionar')}>
                Volver
              </Button>
              <Button onClick={confirmarCambio} disabled={loading} className="flex-1">
                {loading ? 'Procesando...' : 'Confirmar Cambio de Vehículo'}
              </Button>
            </div>
          </div>
        )}

        {/* PASO 3: Ver Historial */}
        {paso === 'historial' && (
          <div className="space-y-4">
            {historial.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600">No hay cambios de vehículo registrados</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dominio</TableHead>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Desde</TableHead>
                      <TableHead>Hasta</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historial.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.dominio}</TableCell>
                        <TableCell>
                          {item.marca} {item.modelo}
                        </TableCell>
                        <TableCell>
                          {new Date(item.fecha_alta).toLocaleDateString('es-AR')}
                        </TableCell>
                        <TableCell>
                          {item.fecha_baja
                            ? new Date(item.fecha_baja).toLocaleDateString('es-AR')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.observaciones || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
