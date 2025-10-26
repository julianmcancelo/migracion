'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Car } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Vehiculo {
  id: number
  dominio: string
  marca?: string
  modelo?: string
  anio?: number
  tipo?: string
}

interface RenovarVehiculoSelectorProps {
  onSelect: (vehiculo: Vehiculo | null) => void
}

export function RenovarVehiculoSelector({ onSelect }: RenovarVehiculoSelectorProps) {
  const [modo, setModo] = useState<'buscar' | 'crear'>('buscar')
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<Vehiculo[]>([])
  const [buscando, setBuscando] = useState(false)
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null)
  
  // Datos para crear nuevo vehículo
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    dominio: '',
    marca: '',
    modelo: '',
    anio: '',
    tipo: '',
  })

  // Buscar vehículos en la BD
  const buscarVehiculos = async () => {
    if (busqueda.length < 2) {
      setResultados([])
      return
    }

    setBuscando(true)
    try {
      const res = await fetch(`/api/vehiculos?buscar=${encodeURIComponent(busqueda)}&limite=5`)
      const data = await res.json()
      
      if (data.success) {
        setResultados(data.data)
      }
    } catch (error) {
      console.error('Error al buscar:', error)
    } finally {
      setBuscando(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda) buscarVehiculos()
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda])

  const handleSeleccionarExistente = (vehiculo: Vehiculo) => {
    setVehiculoSeleccionado(vehiculo)
    onSelect(vehiculo)
    setBusqueda('')
    setResultados([])
  }

  const handleCrearNuevo = () => {
    if (!nuevoVehiculo.dominio || !nuevoVehiculo.marca) {
      return
    }
    
    // Devolver datos para crear
    onSelect({
      ...nuevoVehiculo,
      anio: nuevoVehiculo.anio ? parseInt(nuevoVehiculo.anio) : undefined,
    } as any)
  }

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`flex-1 pb-2 text-sm font-medium transition-colors ${
            modo === 'buscar'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setModo('buscar')}
        >
          <Search className="inline h-4 w-4 mr-1" />
          Buscar Existente
        </button>
        <button
          className={`flex-1 pb-2 text-sm font-medium transition-colors ${
            modo === 'crear'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setModo('crear')}
        >
          <Plus className="inline h-4 w-4 mr-1" />
          Crear Nuevo
        </button>
      </div>

      {modo === 'buscar' ? (
        <div className="space-y-2">
          {/* Búsqueda */}
          {!vehiculoSeleccionado ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar vehículo por dominio..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
                  className="pl-9"
                />
              </div>
              
              {/* Resultados */}
              {buscando && (
                <p className="text-xs text-gray-500">Buscando...</p>
              )}
              
              {resultados.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2">
                  {resultados.map((vehiculo) => (
                    <button
                      key={vehiculo.id}
                      onClick={() => handleSeleccionarExistente(vehiculo)}
                      className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm transition-colors"
                    >
                      <p className="font-medium">{vehiculo.dominio}</p>
                      <p className="text-xs text-gray-600">
                        {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio || ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              
              {busqueda.length >= 2 && resultados.length === 0 && !buscando && (
                <p className="text-xs text-gray-500">
                  No se encontraron resultados. Prueba crear uno nuevo.
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between rounded-lg border bg-green-50 p-3">
              <div>
                <p className="font-medium text-sm">{vehiculoSeleccionado.dominio}</p>
                <p className="text-xs text-gray-600">
                  {vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setVehiculoSeleccionado(null)
                  onSelect(null)
                }}
              >
                Cambiar
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Dominio *</Label>
            <Input
              placeholder="ABC123"
              value={nuevoVehiculo.dominio}
              onChange={(e) => {
                setNuevoVehiculo({ ...nuevoVehiculo, dominio: e.target.value.toUpperCase() })
                handleCrearNuevo()
              }}
              maxLength={7}
              className="mt-1 font-mono"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Marca *</Label>
              <Input
                placeholder="Ford"
                value={nuevoVehiculo.marca}
                onChange={(e) => {
                  setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })
                  handleCrearNuevo()
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Modelo</Label>
              <Input
                placeholder="Transit"
                value={nuevoVehiculo.modelo}
                onChange={(e) => {
                  setNuevoVehiculo({ ...nuevoVehiculo, modelo: e.target.value })
                  handleCrearNuevo()
                }}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Año</Label>
              <Input
                placeholder="2020"
                type="number"
                value={nuevoVehiculo.anio}
                onChange={(e) => {
                  setNuevoVehiculo({ ...nuevoVehiculo, anio: e.target.value })
                  handleCrearNuevo()
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Input
                placeholder="Minibus"
                value={nuevoVehiculo.tipo}
                onChange={(e) => {
                  setNuevoVehiculo({ ...nuevoVehiculo, tipo: e.target.value })
                  handleCrearNuevo()
                }}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
