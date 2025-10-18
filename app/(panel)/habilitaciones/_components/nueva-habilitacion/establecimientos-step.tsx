'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Search, Trash2, Building2 } from 'lucide-react'
import { EstablecimientoHabilitacion } from '@/lib/validations/habilitacion'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface EstablecimientosStepProps {
  establecimientos: EstablecimientoHabilitacion[]
  onChange: (establecimientos: EstablecimientoHabilitacion[]) => void
  tipoTransporte?: string
}

interface Establecimiento {
  id: number
  nombre: string
  direccion?: string
  localidad?: string
  tipo_entidad: 'establecimiento' | 'remiseria'
}

/**
 * Paso 4: Agregar establecimientos/remiserías (opcional)
 */
export function EstablecimientosStep({ 
  establecimientos, 
  onChange, 
  tipoTransporte 
}: EstablecimientosStepProps) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<Establecimiento[]>([])
  const [buscando, setBuscando] = useState(false)
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState<Establecimiento | null>(null)
  // Caché local para mantener información completa de establecimientos agregados
  const [establecimientosCache, setEstablecimientosCache] = useState<Map<number, Establecimiento>>(new Map())

  const busquedaDebounced = useDebounce(busqueda, 500)

  // Buscar establecimientos cuando cambia el término de búsqueda
  useEffect(() => {
    const buscarEstablecimientos = async () => {
      if (busquedaDebounced.length < 2) {
        setResultados([])
        return
      }

      setBuscando(true)
      try {
        const tipo = tipoTransporte === 'Remis' ? 'remiseria' : 'establecimiento'
        const response = await fetch(
          `/api/establecimientos?buscar=${encodeURIComponent(busquedaDebounced)}&tipo=${tipo}`
        )
        const data = await response.json()
        if (data.success) {
          setResultados(data.data)
        }
      } catch (error) {
        console.error('Error al buscar establecimientos:', error)
      } finally {
        setBuscando(false)
      }
    }

    buscarEstablecimientos()
  }, [busquedaDebounced, tipoTransporte])

  const handleAgregarEstablecimiento = () => {
    if (!establecimientoSeleccionado) return

    // Verificar que no esté duplicado
    if (establecimientos.some(e => e.establecimiento_id === establecimientoSeleccionado.id)) {
      alert('Este establecimiento ya está agregado')
      return
    }

    const nuevoEstablecimiento: EstablecimientoHabilitacion = {
      establecimiento_id: establecimientoSeleccionado.id,
      tipo: establecimientoSeleccionado.tipo_entidad,
    }

    // Guardar en caché la información completa del establecimiento
    const nuevoCache = new Map(establecimientosCache)
    nuevoCache.set(establecimientoSeleccionado.id, establecimientoSeleccionado)
    setEstablecimientosCache(nuevoCache)

    onChange([...establecimientos, nuevoEstablecimiento])
    
    // Resetear campos
    setEstablecimientoSeleccionado(null)
    setBusqueda('')
    setResultados([])
  }

  const handleEliminarEstablecimiento = (index: number) => {
    onChange(establecimientos.filter((_, i) => i !== index))
  }

  // Obtener info completa de establecimiento por ID desde caché o resultados
  const getEstablecimientoInfo = (establecimiento_id: number) => {
    // Primero buscar en el caché
    const establecimientoCache = establecimientosCache.get(establecimiento_id)
    if (establecimientoCache) return establecimientoCache
    
    // Luego en resultados actuales
    const establecimiento = resultados.find(e => e.id === establecimiento_id)
    if (establecimiento) return establecimiento
    
    // Fallback
    return { 
      id: establecimiento_id,
      nombre: `Establecimiento ${establecimiento_id}`, 
      direccion: '-',
      tipo_entidad: 'establecimiento' as const
    }
  }

  const textoTipo = tipoTransporte === 'Remis' ? 'remiserías' : 'establecimientos escolares'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {tipoTransporte === 'Remis' ? 'Remiserías' : 'Establecimientos'} (Opcional)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Agregue los {textoTipo} vinculados a esta habilitación. Este paso es opcional.
        </p>
      </div>

      {/* Formulario de búsqueda y agregar */}
      <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
        <h4 className="font-medium">
          Agregar {tipoTransporte === 'Remis' ? 'Remisería' : 'Establecimiento'}
        </h4>
        
        {/* Búsqueda */}
        <div className="space-y-2">
          <Label>Buscar por nombre</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={`Ingrese nombre del ${tipoTransporte === 'Remis' ? 'remisería' : 'establecimiento'}...`}
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
                resultados.map((establecimiento) => (
                  <button
                    key={establecimiento.id}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    onClick={() => {
                      setEstablecimientoSeleccionado(establecimiento)
                      setBusqueda(establecimiento.nombre)
                    }}
                  >
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-sm">{establecimiento.nombre}</div>
                      <div className="text-xs text-gray-500">
                        {establecimiento.direccion && `${establecimiento.direccion} • `}
                        {establecimiento.localidad}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No se encontraron resultados
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón agregar */}
        <Button
          onClick={handleAgregarEstablecimiento}
          disabled={!establecimientoSeleccionado}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar {tipoTransporte === 'Remis' ? 'Remisería' : 'Establecimiento'}
        </Button>
      </div>

      {/* Lista de establecimientos agregados */}
      <div>
        <h4 className="font-medium mb-3">
          {tipoTransporte === 'Remis' ? 'Remiserías' : 'Establecimientos'} Agregados ({establecimientos.length})
        </h4>
        
        {establecimientos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            No hay {textoTipo} agregados aún
          </div>
        ) : (
          <div className="space-y-2">
            {establecimientos.map((establecimiento, index) => {
              const info = getEstablecimientoInfo(establecimiento.establecimiento_id)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{info.nombre}</span>
                        {(info as any).tipo && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {(info as any).tipo}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1 mt-2 text-xs text-gray-600">
                        {info.direccion && (
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span className="font-medium">{info.direccion}</span>
                          </div>
                        )}
                        {(info as any).localidad && (
                          <div className="flex items-center gap-1">
                            <span>🏙️</span>
                            <span>{(info as any).localidad}</span>
                          </div>
                        )}
                        {(info as any).telefono && (
                          <div className="flex items-center gap-1">
                            <span>📞</span>
                            <span className="font-medium">{(info as any).telefono}</span>
                          </div>
                        )}
                        {(info as any).email && (
                          <div className="flex items-center gap-1">
                            <span>✉️</span>
                            <span>{(info as any).email}</span>
                          </div>
                        )}
                        {(info as any).cue && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">CUE:</span> {(info as any).cue}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEliminarEstablecimiento(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          💡 <strong>Nota:</strong> Este paso es opcional. Puede dejarlo vacío y agregar establecimientos más tarde.
        </p>
      </div>
    </div>
  )
}
