'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Trash2, User } from 'lucide-react'
import { PersonaHabilitacion } from '@/lib/validations/habilitacion'
import { useDebounce } from '@/lib/hooks/use-debounce'

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

  const busquedaDebounced = useDebounce(busqueda, 500)

  // Buscar personas cuando cambia el término de búsqueda
  useEffect(() => {
    const buscarPersonas = async () => {
      if (busquedaDebounced.length < 2) {
        setResultados([])
        return
      }

      setBuscando(true)
      try {
        const response = await fetch(`/api/personas?buscar=${encodeURIComponent(busquedaDebounced)}`)
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

  // Obtener info completa de persona por ID (simulado)
  const getPersonaInfo = (persona_id: number) => {
    const persona = resultados.find(p => p.id === persona_id)
    return persona || { nombre: `Persona ${persona_id}`, dni: '-' }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Personas Vinculadas <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Agregue al menos el titular de la habilitación. Puede incluir conductores, choferes y celadores.
        </p>
      </div>

      {/* Formulario de búsqueda y agregar */}
      <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
        <h4 className="font-medium">Agregar Persona</h4>
        
        {/* Búsqueda */}
        <div className="space-y-2">
          <Label>Buscar por nombre o DNI</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ingrese nombre o DNI..."
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
                resultados.map((persona) => (
                  <button
                    key={persona.id}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    onClick={() => {
                      setPersonaSeleccionada(persona)
                      setBusqueda(persona.nombre)
                    }}
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-sm">{persona.nombre}</div>
                      <div className="text-xs text-gray-500">DNI: {persona.dni}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No se encontraron personas
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
                onChange={(e) => setLicenciaCategoria(e.target.value)}
                placeholder="Ej: D1, D2, etc."
              />
            </div>
          </div>
        )}

        {/* Botón agregar */}
        <Button
          onClick={handleAgregarPersona}
          disabled={!personaSeleccionada}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Persona
        </Button>
      </div>

      {/* Lista de personas agregadas */}
      <div>
        <h4 className="font-medium mb-3">
          Personas Agregadas ({personas.length})
        </h4>
        
        {personas.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            No hay personas agregadas aún
          </div>
        ) : (
          <div className="space-y-2">
            {personas.map((persona, index) => {
              const info = getPersonaInfo(persona.persona_id)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{info.nombre}</div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1 flex-wrap">
                        <span className="font-medium">DNI: {info.dni}</span>
                        <span className="text-gray-400">•</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {persona.rol}
                        </span>
                        {persona.licencia_categoria && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">Lic: {persona.licencia_categoria}</span>
                          </>
                        )}
                      </div>
                      {(info as any).telefono && (
                        <div className="text-xs text-gray-500 mt-1">
                          📞 {(info as any).telefono}
                        </div>
                      )}
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
    </div>
  )
}
