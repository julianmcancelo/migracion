'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Trash2, User, UserPlus } from 'lucide-react'
import { PersonaHabilitacion } from '@/lib/validations/habilitacion'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { RegistrarPersonaDialog } from './registrar-persona-dialog'

interface PersonasStepProps {
  personas: PersonaHabilitacion[]
  onChange: (personas: PersonaHabilitacion[]) => void
}

interface Persona {
  id: number
  nombre: string
  dni: string
  email?: string
  telefono?: string
}

/**
 * Paso 2: Agregar personas vinculadas (titular, conductores, etc.)
 */
export function PersonasStep({ personas, onChange }: PersonasStepProps) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<Persona[]>([])
  const [buscando, setBuscando] = useState(false)
  const [personaSeleccionada, setPersonaSeleccionada] = useState<Persona | null>(null)
  const [rolSeleccionado, setRolSeleccionado] = useState<string>('TITULAR')
  const [licenciaCategoria, setLicenciaCategoria] = useState('')
  // Caché local para mantener información completa de personas agregadas
  const [personasCache, setPersonasCache] = useState<Map<number, Persona>>(new Map())
  const [registrarDialogOpen, setRegistrarDialogOpen] = useState(false)

  const busquedaDebounced = useDebounce(busqueda, 500)

  // Cargar datos completos de personas ya agregadas
  useEffect(() => {
    const cargarPersonasAgregadas = async () => {
      const personasSinDatos = personas.filter(p => !personasCache.has(p.persona_id))

      if (personasSinDatos.length === 0) return

      try {
        // Cargar datos de cada persona que no está en caché
        const promesas = personasSinDatos.map(async p => {
          const response = await fetch(`/api/personas/${p.persona_id}`)
          const data = await response.json()
          return data.success ? data.data : null
        })

        const personasData = await Promise.all(promesas)

        // Actualizar caché con los datos obtenidos
        const nuevoCache = new Map(personasCache)
        personasData.forEach((persona, index) => {
          if (persona) {
            nuevoCache.set(personasSinDatos[index].persona_id, persona)
          }
        })
        setPersonasCache(nuevoCache)
      } catch (error) {
        console.error('Error al cargar personas agregadas:', error)
      }
    }

    cargarPersonasAgregadas()
  }, [personas, personasCache])

  // Buscar personas cuando cambia el término de búsqueda
  useEffect(() => {
    const buscarPersonas = async () => {
      if (busquedaDebounced.length < 2) {
        setResultados([])
        return
      }

      setBuscando(true)
      try {
        const response = await fetch(
          `/api/personas?buscar=${encodeURIComponent(busquedaDebounced)}`
        )
        const data = await response.json()
        if (data.success) {
          setResultados(data.data)
        }
      } catch (error) {
        console.error('Error al buscar personas:', error)
      } finally {
        setBuscando(false)
      }
    }

    buscarPersonas()
  }, [busquedaDebounced])

  const handleAgregarPersona = () => {
    if (!personaSeleccionada) return

    // Verificar que no esté duplicada
    if (personas.some(p => p.persona_id === personaSeleccionada.id)) {
      alert('Esta persona ya está agregada')
      return
    }

    const nuevaPersona: PersonaHabilitacion = {
      persona_id: personaSeleccionada.id,
      rol: rolSeleccionado as any,
      licencia_categoria: licenciaCategoria || undefined,
    }

    // Guardar en caché la información completa de la persona
    const nuevoCache = new Map(personasCache)
    nuevoCache.set(personaSeleccionada.id, personaSeleccionada)
    setPersonasCache(nuevoCache)

    onChange([...personas, nuevaPersona])

    // Resetear campos
    setPersonaSeleccionada(null)
    setBusqueda('')
    setResultados([])
    setLicenciaCategoria('')
  }

  const handleEliminarPersona = (index: number) => {
    onChange(personas.filter((_, i) => i !== index))
  }

  // Obtener info completa de persona por ID desde caché o resultados
  const getPersonaInfo = (persona_id: number) => {
    // Primero buscar en el caché
    const personaCache = personasCache.get(persona_id)
    if (personaCache) return personaCache

    // Luego en resultados actuales
    const persona = resultados.find(p => p.id === persona_id)
    if (persona) return persona

    // Fallback con estructura completa
    return {
      id: persona_id,
      nombre: `Persona ${persona_id}`,
      dni: 'No disponible',
      telefono: undefined,
      email: undefined,
      domicilio_calle: undefined,
      domicilio_nro: undefined,
      domicilio_localidad: undefined,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Personas Vinculadas <span className="text-red-500">*</span>
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Agregue al menos el titular de la habilitación. Puede incluir conductores, choferes y
          celadores.
        </p>
      </div>

      {/* Formulario de búsqueda y agregar */}
      <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
        <h4 className="font-medium">Agregar Persona</h4>

        {/* Búsqueda */}
        <div className="space-y-2">
          <Label>Buscar por nombre o DNI</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Ingrese nombre o DNI..."
            />
          </div>

          {/* Resultados de búsqueda */}
          {busqueda.length >= 2 && (
            <div className="max-h-48 overflow-y-auto rounded-md border bg-white">
              {buscando ? (
                <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>
              ) : resultados.length > 0 ? (
                resultados.map(persona => (
                  <button
                    key={persona.id}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-gray-50"
                    onClick={() => {
                      setPersonaSeleccionada(persona)
                      setBusqueda(persona.nombre)
                    }}
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">{persona.nombre}</div>
                      <div className="text-xs text-gray-500">DNI: {persona.dni}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="space-y-2 p-4">
                  <div className="text-center text-sm text-gray-500">
                    No se encontraron personas
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setRegistrarDialogOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrar Nueva Persona
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rol y categoría */}
        {personaSeleccionada && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={rolSeleccionado} onValueChange={setRolSeleccionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TITULAR">Titular</SelectItem>
                  <SelectItem value="CONDUCTOR">Conductor</SelectItem>
                  <SelectItem value="CHOFER">Chofer</SelectItem>
                  <SelectItem value="CELADOR">Celador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoría de Licencia</Label>
              <Input
                value={licenciaCategoria}
                onChange={e => setLicenciaCategoria(e.target.value)}
                placeholder="Ej: D1, D2, etc."
              />
            </div>
          </div>
        )}

        {/* Botón agregar */}
        <Button onClick={handleAgregarPersona} disabled={!personaSeleccionada} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Persona
        </Button>
      </div>

      {/* Lista de personas agregadas */}
      <div>
        <h4 className="mb-3 font-medium">Personas Agregadas ({personas.length})</h4>

        {personas.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed py-8 text-center text-gray-500">
            No hay personas agregadas aún
          </div>
        ) : (
          <div className="space-y-2">
            {personas.map((persona, index) => {
              const info = getPersonaInfo(persona.persona_id)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{info.nombre}</span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {persona.rol}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="font-medium">DNI: {info.dni || 'No especificado'}</span>
                        {persona.licencia_categoria && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Licencia:</span>{' '}
                              {persona.licencia_categoria}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="mt-2 flex flex-col gap-1">
                        {(info as any).telefono && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <span>📞</span>
                            <span className="font-medium">{(info as any).telefono}</span>
                          </div>
                        )}
                        {(info as any).email && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <span>✉️</span>
                            <span>{(info as any).email}</span>
                          </div>
                        )}
                        {(info as any).domicilio_calle && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <span>📍</span>
                            <span>
                              {(info as any).domicilio_calle} {(info as any).domicilio_nro}
                              {(info as any).domicilio_localidad &&
                                `, ${(info as any).domicilio_localidad}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEliminarPersona(index)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Dialog para registrar nueva persona */}
      <RegistrarPersonaDialog
        open={registrarDialogOpen}
        onOpenChange={setRegistrarDialogOpen}
        dniInicial={busqueda}
        onPersonaCreada={persona => {
          // Agregar la persona recién creada al caché
          const nuevoCache = new Map(personasCache)
          nuevoCache.set(persona.id, persona)
          setPersonasCache(nuevoCache)

          // Seleccionarla automáticamente
          setPersonaSeleccionada(persona)
          setBusqueda(persona.nombre)

          // Agregar a resultados para que aparezca en la lista
          setResultados(prev => [persona, ...prev])
        }}
      />
    </div>
  )
}
