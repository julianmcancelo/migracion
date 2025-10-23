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
  tipoTransporte,
}: EstablecimientosStepProps) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<Establecimiento[]>([])
  const [buscando, setBuscando] = useState(false)
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] =
    useState<Establecimiento | null>(null)
  // Caché local para mantener información completa de establecimientos agregados
  const [establecimientosCache, setEstablecimientosCache] = useState<Map<number, Establecimiento>>(
    new Map()
  )

  const busquedaDebounced = useDebounce(busqueda, 500)

  // Cargar datos completos de establecimientos ya agregados
  useEffect(() => {
    const cargarEstablecimientosAgregados = async () => {
      const establecimientosSinDatos = establecimientos.filter(
        e => !establecimientosCache.has(e.establecimiento_id)
      )

      if (establecimientosSinDatos.length === 0) return

      try {
        const promesas = establecimientosSinDatos.map(async e => {
          const response = await fetch(
            `/api/establecimientos/${e.establecimiento_id}?tipo=${e.tipo}`
          )
          const data = await response.json()
          return data.success ? data.data : null
        })

        const establecimientosData = await Promise.all(promesas)

        const nuevoCache = new Map(establecimientosCache)
        establecimientosData.forEach((establecimiento, index) => {
          if (establecimiento) {
            nuevoCache.set(establecimientosSinDatos[index].establecimiento_id, establecimiento)
          }
        })
        setEstablecimientosCache(nuevoCache)
      } catch (error) {
        console.error('Error al cargar establecimientos agregados:', error)
      }
    }

    cargarEstablecimientosAgregados()
  }, [establecimientos, establecimientosCache])

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
      tipo_entidad: 'establecimiento' as const,
    }
  }

  const textoTipo = tipoTransporte === 'Remis' ? 'remiserías' : 'establecimientos escolares'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          {tipoTransporte === 'Remis' ? 'Remiserías' : 'Establecimientos'} (Opcional)
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Agregue los {textoTipo} vinculados a esta habilitación. Este paso es opcional.
        </p>
      </div>

      {/* Formulario de búsqueda y agregar */}
      <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
        <h4 className="font-medium">
          Agregar {tipoTransporte === 'Remis' ? 'Remisería' : 'Establecimiento'}
        </h4>

        {/* Búsqueda */}
        <div className="space-y-2">
          <Label>Buscar por nombre</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder={`Ingrese nombre del ${tipoTransporte === 'Remis' ? 'remisería' : 'establecimiento'}...`}
            />
          </div>

          {/* Resultados de búsqueda */}
          {busqueda.length >= 2 && (
            <div className="max-h-48 overflow-y-auto rounded-md border bg-white">
              {buscando ? (
                <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>
              ) : resultados.length > 0 ? (
                resultados.map(establecimiento => (
                  <button
                    key={establecimiento.id}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-gray-50"
                    onClick={() => {
                      setEstablecimientoSeleccionado(establecimiento)
                      setBusqueda(establecimiento.nombre)
                    }}
                  >
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">{establecimiento.nombre}</div>
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
          <Plus className="mr-2 h-4 w-4" />
          Agregar {tipoTransporte === 'Remis' ? 'Remisería' : 'Establecimiento'}
        </Button>
      </div>

      {/* Lista de establecimientos agregados */}
      <div>
        <h4 className="mb-3 font-medium">
          {tipoTransporte === 'Remis' ? 'Remiserías' : 'Establecimientos'} Agregados (
          {establecimientos.length})
        </h4>

        {establecimientos.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed py-8 text-center text-gray-500">
            No hay {textoTipo} agregados aún
          </div>
        ) : (
          <div className="space-y-2">
            {establecimientos.map((establecimiento, index) => {
              const info = getEstablecimientoInfo(establecimiento.establecimiento_id)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-bold text-gray-900">{info.nombre}</span>
                        {(info as any).tipo && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                            {(info as any).tipo}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-col gap-1 text-xs text-gray-600">
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

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          💡 <strong>Nota:</strong> Este paso es opcional. Puede dejarlo vacío y agregar
          establecimientos más tarde.
        </p>
      </div>
    </div>
  )
}
