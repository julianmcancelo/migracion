'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Search, Trash2, Car, Scan, PlusCircle } from 'lucide-react'
import { VehiculoHabilitacion } from '@/lib/validations/habilitacion'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { OCRScanner } from '@/components/ocr-scanner'
import { RegistroVehiculoRapidoDialog } from '@/app/(panel)/dashboard/_components/registro-vehiculo-rapido-dialog'

interface VehiculosStepProps {
  vehiculos: VehiculoHabilitacion[]
  onChange: (vehiculos: VehiculoHabilitacion[]) => void
}

interface Vehiculo {
  id: number
  dominio: string
  marca?: string
  modelo?: string
  tipo?: string
  ano?: number
}

/**
 * Paso 3: Agregar vehículos vinculados
 */
export function VehiculosStep({ vehiculos, onChange }: VehiculosStepProps) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<Vehiculo[]>([])
  const [buscando, setBuscando] = useState(false)
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null)
  const [showOCR, setShowOCR] = useState(false)
  const [showRegistroModal, setShowRegistroModal] = useState(false)
  const ocrEnabled = process.env.NEXT_PUBLIC_ENABLE_OCR === 'true'
  // Caché local para mantener información completa de vehículos agregados
  const [vehiculosCache, setVehiculosCache] = useState<Map<number, Vehiculo>>(new Map())

  const busquedaDebounced = useDebounce(busqueda, 500)

  // Procesar datos del OCR de cédula verde
  const handleOCRData = (data: any) => {
    console.log('Datos OCR Cédula recibidos:', data)

    // Buscar el vehículo por dominio automáticamente
    if (data.dominio) {
      setBusqueda(data.dominio.toUpperCase())
      // El useEffect se encargará de buscar automáticamente
    }

    // Cerrar OCR
    setShowOCR(false)
  }

  // Cargar datos completos de vehículos ya agregados
  useEffect(() => {
    const cargarVehiculosAgregados = async () => {
      const vehiculosSinDatos = vehiculos.filter(v => !vehiculosCache.has(v.vehiculo_id))

      if (vehiculosSinDatos.length === 0) return

      try {
        const promesas = vehiculosSinDatos.map(async v => {
          const response = await fetch(`/api/vehiculos/${v.vehiculo_id}`)
          const data = await response.json()
          return data.success ? data.data : null
        })

        const vehiculosData = await Promise.all(promesas)

        const nuevoCache = new Map(vehiculosCache)
        vehiculosData.forEach((vehiculo, index) => {
          if (vehiculo) {
            nuevoCache.set(vehiculosSinDatos[index].vehiculo_id, vehiculo)
          }
        })
        setVehiculosCache(nuevoCache)
      } catch (error) {
        console.error('Error al cargar vehículos agregados:', error)
      }
    }

    cargarVehiculosAgregados()
  }, [vehiculos, vehiculosCache])

  // Buscar vehículos cuando cambia el término de búsqueda
  useEffect(() => {
    const buscarVehiculos = async () => {
      if (busquedaDebounced.length < 2) {
        setResultados([])
        return
      }

      setBuscando(true)
      try {
        const response = await fetch(
          `/api/vehiculos?buscar=${encodeURIComponent(busquedaDebounced)}`
        )
        const data = await response.json()
        if (data.success) {
          setResultados(data.data)
        }
      } catch (error) {
        console.error('Error al buscar vehículos:', error)
      } finally {
        setBuscando(false)
      }
    }

    buscarVehiculos()
  }, [busquedaDebounced])

  const handleAgregarVehiculo = () => {
    if (!vehiculoSeleccionado) return

    // Verificar que no esté duplicado
    if (vehiculos.some(v => v.vehiculo_id === vehiculoSeleccionado.id)) {
      alert('Este vehículo ya está agregado')
      return
    }

    const nuevoVehiculo: VehiculoHabilitacion = {
      vehiculo_id: vehiculoSeleccionado.id,
    }

    // Guardar en caché la información completa del vehículo
    const nuevoCache = new Map(vehiculosCache)
    nuevoCache.set(vehiculoSeleccionado.id, vehiculoSeleccionado)
    setVehiculosCache(nuevoCache)

    onChange([...vehiculos, nuevoVehiculo])

    // Resetear campos
    setVehiculoSeleccionado(null)
    setBusqueda('')
    setResultados([])
  }

  // Manejar cuando se crea exitosamente un vehículo nuevo
  const handleVehiculoCreado = (vehiculoNuevo: any) => {
    // Agregar automáticamente el vehículo recién creado
    const nuevoVehiculo: VehiculoHabilitacion = {
      vehiculo_id: vehiculoNuevo.id,
    }
    
    const nuevoCache = new Map(vehiculosCache)
    nuevoCache.set(vehiculoNuevo.id, vehiculoNuevo)
    setVehiculosCache(nuevoCache)
    
    onChange([...vehiculos, nuevoVehiculo])
    
    // Resetear búsqueda
    setBusqueda('')
    setResultados([])
    setVehiculoSeleccionado(null)
  }

  const handleEliminarVehiculo = (index: number) => {
    onChange(vehiculos.filter((_, i) => i !== index))
  }

  // Obtener info completa de vehículo por ID desde caché o resultados
  const getVehiculoInfo = (vehiculo_id: number): Vehiculo => {
    // Primero buscar en el caché
    const vehiculoCache = vehiculosCache.get(vehiculo_id)
    if (vehiculoCache) return vehiculoCache

    // Luego en resultados actuales
    const vehiculo = resultados.find(v => v.id === vehiculo_id)
    if (vehiculo) return vehiculo

    // Fallback si no se encuentra
    return {
      id: vehiculo_id,
      dominio: `Vehículo ${vehiculo_id}`,
      marca: '-',
      modelo: '-',
      ano: undefined,
    } as Vehiculo
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Vehículos Vinculados <span className="text-red-500">*</span>
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Agregue al menos un vehículo que estará vinculado a esta habilitación.
        </p>
      </div>

      {/* Formulario de búsqueda y agregar */}
      <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
        <h4 className="font-medium">Agregar Vehículo</h4>

        {/* Botón OCR (opcional) */}
        {ocrEnabled && !showOCR && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h5 className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <Scan className="h-4 w-4" />
                  ¿Tenés la Cédula Verde?
                </h5>
                <p className="mt-1 text-xs text-blue-700">
                  Escaneá y autocompletamos los datos del vehículo
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setShowOCR(true)}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Scan className="mr-1 h-3 w-3" />
                Escanear
              </Button>
            </div>
          </div>
        )}

        {/* Componente OCR (opcional) */}
        {ocrEnabled && showOCR && (
          <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h5 className="text-sm font-semibold text-blue-900">Escanear Cédula Verde</h5>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowOCR(false)}
                className="h-6 text-blue-700"
              >
                Cerrar
              </Button>
            </div>
            <OCRScanner
              type="cedula"
              onDataExtracted={handleOCRData}
              buttonText="Escanear Cédula del Vehículo"
            />
          </div>
        )}

        {/* Búsqueda */}
        <div className="space-y-2">
          <Label>Buscar por dominio, marca o modelo</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Ingrese dominio, marca o modelo..."
            />
          </div>

          {/* Resultados de búsqueda */}
          {busqueda.length >= 2 && (
            <div className="max-h-48 overflow-y-auto rounded-md border bg-white">
              {buscando ? (
                <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>
              ) : resultados.length > 0 ? (
                resultados.map(vehiculo => (
                  <button
                    key={vehiculo.id}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-gray-50"
                    onClick={() => {
                      setVehiculoSeleccionado(vehiculo)
                      setBusqueda(vehiculo.dominio)
                    }}
                  >
                    <Car className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">{vehiculo.dominio}</div>
                      <div className="text-xs text-gray-500">
                        {vehiculo.marca} {vehiculo.modelo} {vehiculo.ano && `(${vehiculo.ano})`}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 space-y-3">
                  <div className="text-center text-sm text-gray-500">
                    No se encontraron vehículos con ese dominio
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                    onClick={() => setShowRegistroModal(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Nuevo Vehículo
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón agregar */}
        <Button onClick={handleAgregarVehiculo} disabled={!vehiculoSeleccionado} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Vehículo
        </Button>
      </div>

      {/* Lista de vehículos agregados */}
      <div>
        <h4 className="mb-3 font-medium">Vehículos Agregados ({vehiculos.length})</h4>

        {vehiculos.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed py-8 text-center text-gray-500">
            No hay vehículos agregados aún
          </div>
        ) : (
          <div className="space-y-2">
            {vehiculos.map((vehiculo, index) => {
              const info = getVehiculoInfo(vehiculo.vehiculo_id)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Car className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-bold text-gray-900">{info.dominio}</div>
                      <div className="mt-1 text-sm font-medium text-gray-700">
                        {info.marca} {info.modelo} {info.ano && `(${info.ano})`}
                      </div>

                      <div className="mt-2 flex flex-col gap-1 text-xs text-gray-600">
                        {info.tipo && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Tipo:</span> {info.tipo}
                          </div>
                        )}
                        {(info as any).chasis && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Chasis:</span> {(info as any).chasis}
                          </div>
                        )}
                        {(info as any).motor && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Motor:</span> {(info as any).motor}
                          </div>
                        )}
                        {(info as any).asientos && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Asientos:</span> {(info as any).asientos}
                          </div>
                        )}
                        {(info as any).Vencimiento_VTV && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">VTV vence:</span>{' '}
                            {new Date((info as any).Vencimiento_VTV).toLocaleDateString('es-AR')}
                          </div>
                        )}
                        {(info as any).Aseguradora && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Seguro:</span> {(info as any).Aseguradora}
                            {(info as any).poliza && ` - Póliza: ${(info as any).poliza}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEliminarVehiculo(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Registro de Vehículo */}
      <RegistroVehiculoRapidoDialog
        open={showRegistroModal}
        onOpenChange={setShowRegistroModal}
        dominioInicial={busqueda.toUpperCase()}
        onSuccess={handleVehiculoCreado}
      />
    </div>
  )
}
