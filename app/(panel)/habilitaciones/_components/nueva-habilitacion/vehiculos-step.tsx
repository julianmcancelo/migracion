'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Search, Trash2, Car } from 'lucide-react'
import { VehiculoHabilitacion } from '@/lib/validations/habilitacion'
import { useDebounce } from '@/lib/hooks/use-debounce'

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
  // Caché local para mantener información completa de vehículos agregados
  const [vehiculosCache, setVehiculosCache] = useState<Map<number, Vehiculo>>(new Map())

  const busquedaDebounced = useDebounce(busqueda, 500)

  // Cargar datos completos de vehículos ya agregados
  useEffect(() => {
    const cargarVehiculosAgregados = async () => {
      const vehiculosSinDatos = vehiculos.filter(v => !vehiculosCache.has(v.vehiculo_id))
      
      if (vehiculosSinDatos.length === 0) return

      try {
        const promesas = vehiculosSinDatos.map(async (v) => {
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
        const response = await fetch(`/api/vehiculos?buscar=${encodeURIComponent(busquedaDebounced)}`)
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
      ano: undefined
    } as Vehiculo
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Vehículos Vinculados <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Agregue al menos un vehículo que estará vinculado a esta habilitación.
        </p>
      </div>

      {/* Formulario de búsqueda y agregar */}
      <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
        <h4 className="font-medium">Agregar Vehículo</h4>
        
        {/* Búsqueda */}
        <div className="space-y-2">
          <Label>Buscar por dominio, marca o modelo</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ingrese dominio, marca o modelo..."
            />
          </div>
          
          {/* Resultados de búsqueda */}
          {busqueda.length >= 2 && (
            <div className="bg-white border rounded-md max-h-48 overflow-y-auto">
              {buscando ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Buscando...
                </div>
              ) : resultados.length > 0 ? (
                resultados.map((vehiculo) => (
                  <button
                    key={vehiculo.id}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    onClick={() => {
                      setVehiculoSeleccionado(vehiculo)
                      setBusqueda(vehiculo.dominio)
                    }}
                  >
                    <Car className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-sm">{vehiculo.dominio}</div>
                      <div className="text-xs text-gray-500">
                        {vehiculo.marca} {vehiculo.modelo} {vehiculo.ano && `(${vehiculo.ano})`}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No se encontraron vehículos
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón agregar */}
        <Button
          onClick={handleAgregarVehiculo}
          disabled={!vehiculoSeleccionado}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Vehículo
        </Button>
      </div>

      {/* Lista de vehículos agregados */}
      <div>
        <h4 className="font-medium mb-3">
          Vehículos Agregados ({vehiculos.length})
        </h4>
        
        {vehiculos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            No hay vehículos agregados aún
          </div>
        ) : (
          <div className="space-y-2">
            {vehiculos.map((vehiculo, index) => {
              const info = getVehiculoInfo(vehiculo.vehiculo_id)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Car className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-lg">{info.dominio}</div>
                      <div className="text-sm text-gray-700 mt-1 font-medium">
                        {info.marca} {info.modelo} {info.ano && `(${info.ano})`}
                      </div>
                      
                      <div className="flex flex-col gap-1 mt-2 text-xs text-gray-600">
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
                            <span className="font-medium">VTV vence:</span> {new Date((info as any).Vencimiento_VTV).toLocaleDateString('es-AR')}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEliminarVehiculo(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
