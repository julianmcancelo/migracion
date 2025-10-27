'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Persona {
  id: number
  nombre: string
  apellido: string
  dni: string
  domicilio?: string
  telefono?: string
  email?: string
}

interface RenovarPersonaSelectorProps {
  onSelect: (persona: Persona | null) => void
  rol: 'TITULAR' | 'CHOFER' | 'CELADOR'
}

export function RenovarPersonaSelector({ onSelect, rol }: RenovarPersonaSelectorProps) {
  const [modo, setModo] = useState<'buscar' | 'crear'>('buscar')
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<Persona[]>([])
  const [buscando, setBuscando] = useState(false)
  const [personaSeleccionada, setPersonaSeleccionada] = useState<Persona | null>(null)
  
  // Datos para crear nueva persona
  const [nuevaPersona, setNuevaPersona] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    domicilio: '',
    telefono: '',
    email: '',
  })

  // Buscar personas en la BD
  const buscarPersonas = async () => {
    if (busqueda.length < 2) {
      setResultados([])
      return
    }

    setBuscando(true)
    try {
      const res = await fetch(`/api/personas?buscar=${encodeURIComponent(busqueda)}&limite=5`)
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
      if (busqueda) buscarPersonas()
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda])

  const handleSeleccionarExistente = (persona: Persona) => {
    setPersonaSeleccionada(persona)
    onSelect(persona)
    setBusqueda('')
    setResultados([])
  }

  const handleCrearNueva = () => {
    if (!nuevaPersona.nombre || !nuevaPersona.apellido || !nuevaPersona.dni) {
      return
    }
    
    // Devolver datos para crear
    onSelect(nuevaPersona as any)
  }

  const rolLabel = {
    TITULAR: 'Titular',
    CHOFER: 'Chofer',
    CELADOR: 'Celador/a'
  }[rol]

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
          {!personaSeleccionada ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Buscar ${rolLabel} por nombre o DNI...`}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Resultados */}
              {buscando && (
                <p className="text-xs text-gray-500">Buscando...</p>
              )}
              
              {resultados.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2">
                  {resultados.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => handleSeleccionarExistente(persona)}
                      className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm transition-colors"
                    >
                      <p className="font-medium">
                        {persona.apellido}, {persona.nombre}
                      </p>
                      <p className="text-xs text-gray-600">DNI: {persona.dni}</p>
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
                <p className="font-medium text-sm">
                  {personaSeleccionada.apellido}, {personaSeleccionada.nombre}
                </p>
                <p className="text-xs text-gray-600">DNI: {personaSeleccionada.dni}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPersonaSeleccionada(null)
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Nombre *</Label>
              <Input
                placeholder="Juan"
                value={nuevaPersona.nombre}
                onChange={(e) => {
                  setNuevaPersona({ ...nuevaPersona, nombre: e.target.value })
                  handleCrearNueva()
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Apellido *</Label>
              <Input
                placeholder="García"
                value={nuevaPersona.apellido}
                onChange={(e) => {
                  setNuevaPersona({ ...nuevaPersona, apellido: e.target.value })
                  handleCrearNueva()
                }}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">DNI *</Label>
            <Input
              placeholder="12345678"
              value={nuevaPersona.dni}
              onChange={(e) => {
                setNuevaPersona({ ...nuevaPersona, dni: e.target.value })
                handleCrearNueva()
              }}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-xs">Domicilio (opcional)</Label>
            <Input
              placeholder="Calle 123, Ciudad"
              value={nuevaPersona.domicilio}
              onChange={(e) => {
                setNuevaPersona({ ...nuevaPersona, domicilio: e.target.value })
                handleCrearNueva()
              }}
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Teléfono (opcional)</Label>
              <Input
                placeholder="1234567890"
                value={nuevaPersona.telefono}
                onChange={(e) => {
                  setNuevaPersona({ ...nuevaPersona, telefono: e.target.value })
                  handleCrearNueva()
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Email (opcional)</Label>
              <Input
                placeholder="email@ejemplo.com"
                value={nuevaPersona.email}
                onChange={(e) => {
                  setNuevaPersona({ ...nuevaPersona, email: e.target.value })
                  handleCrearNueva()
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
