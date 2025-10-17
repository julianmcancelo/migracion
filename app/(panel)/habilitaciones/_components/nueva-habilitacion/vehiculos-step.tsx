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

  const busquedaDebounced = useDebounce(busqueda, 500)

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

    onChange([...vehiculos, nuevoVehiculo])
    
    // Resetear campos
    setVehiculoSeleccionado(null)
    setBusqueda('')
    setResultados([])
  }

  const handleEliminarVehiculo = (index: number) => {
    onChange(vehiculos.filter((_, i) => i !== index))
  }

  // Obtener info completa de vehículo por ID (simulado)
  const getVehiculoInfo = (vehiculo_id: number) => {
    const vehiculo = resultados.find(v => v.id === vehiculo_id)
    return vehiculo || { dominio: `Vehículo ${vehiculo_id}`, marca: '-', modelo: '-' }
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
                  className="flex items-center justify-between p-3 bg-white border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Car className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">{info.dominio}</div>
                      <div className="text-sm text-gray-500">
                        {info.marca} {info.modelo} {info.ano && `(${info.ano})`}
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
