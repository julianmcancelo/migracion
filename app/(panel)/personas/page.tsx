'use client'

import { useState, useEffect } from 'react'
import { User, Plus, Search, Edit, Trash2, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import ModalRegistrarPersona from './_components/modal-registrar-persona'
import ModalEditarPersona from './_components/modal-editar-persona'

interface Persona {
  id: number
  nombre: string | null
  dni: string
  genero: string | null
  cuit: string | null
  telefono: string | null
  email: string | null
  domicilio_calle: string | null
  domicilio_nro: string | null
  domicilio_localidad: string | null
}

/**
 * Página de gestión de personas
 * Permite ver, buscar y gestionar personas del sistema
 */
export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [modalRegistroOpen, setModalRegistroOpen] = useState(false)
  const [modalEdicionOpen, setModalEdicionOpen] = useState(false)
  const [personaSeleccionada, setPersonaSeleccionada] = useState<Persona | null>(null)

  useEffect(() => {
    cargarPersonas()
  }, [])

  const cargarPersonas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/personas?limite=100')
      const data = await response.json()

      if (data.success) {
        setPersonas(data.data || [])
      } else {
        setError('Error al cargar personas')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const buscarPersonas = async () => {
    if (busqueda.trim().length < 2) {
      cargarPersonas()
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/personas?buscar=${encodeURIComponent(busqueda)}`)
      const data = await response.json()

      if (data.success) {
        setPersonas(data.data || [])
      }
    } catch {
      setError('Error al buscar')
    } finally {
      setLoading(false)
    }
  }

  const personasFiltradas = personas

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            <User className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
            Personas
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Gestión de personas del sistema (titulares, conductores, celadores)
          </p>
        </div>
        <Button onClick={() => setModalRegistroOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Persona
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Buscar por DNI, nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarPersonas()}
          className="w-full sm:max-w-md"
        />
        <div className="flex gap-2">
          <Button onClick={buscarPersonas} disabled={loading} className="flex-1 sm:flex-none">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          {busqueda && (
            <Button
              variant="outline"
              onClick={() => {
                setBusqueda('')
                cargarPersonas()
              }}
              className="flex-1 sm:flex-none"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:p-4 sm:text-base">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border bg-white shadow">
        {loading ? (
          <div className="py-8 text-center sm:py-12">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-600 sm:text-base">Cargando personas...</p>
          </div>
        ) : personasFiltradas.length === 0 ? (
          <div className="py-8 text-center sm:py-12">
            <User className="mx-auto mb-4 h-12 w-12 text-gray-300 sm:h-16 sm:w-16" />
            <p className="text-sm text-gray-600 sm:text-base">No se encontraron personas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] sm:text-xs">DNI</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Nombre</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">CUIT</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Contacto</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Domicilio</TableHead>
                  <TableHead className="text-right text-[10px] sm:text-xs">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personasFiltradas.map((persona) => (
                  <TableRow key={persona.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="font-mono text-[10px] sm:text-xs">
                        {persona.dni}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-gray-900 sm:text-sm">
                        {persona.nombre || '-'}
                      </div>
                      {persona.genero && (
                        <div className="text-[10px] text-gray-500 sm:text-xs">
                          {persona.genero}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] sm:text-xs">
                      {persona.cuit || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs sm:space-y-1 sm:text-sm">
                        {persona.telefono && (
                          <div className="flex items-center gap-0.5 text-gray-600 sm:gap-1">
                            <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="truncate">{persona.telefono}</span>
                          </div>
                        )}
                        {persona.email && (
                          <div className="flex items-center gap-0.5 text-gray-600 sm:gap-1">
                            <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="max-w-[120px] truncate sm:max-w-none">{persona.email}</span>
                          </div>
                        )}
                        {!persona.telefono && !persona.email && '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {persona.domicilio_calle && persona.domicilio_nro ? (
                        <div>
                          <div className="truncate">{persona.domicilio_calle} {persona.domicilio_nro}</div>
                          {persona.domicilio_localidad && (
                            <div className="truncate text-[10px] text-gray-500 sm:text-xs">{persona.domicilio_localidad}</div>
                          )}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setPersonaSeleccionada(persona)
                            setModalEdicionOpen(true)
                          }}
                          className="h-7 px-2 sm:h-8 sm:px-3"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => alert('Eliminar persona próximamente')}
                          className="h-7 px-2 sm:h-8 sm:px-3"
                        >
                          <Trash2 className="h-3 w-3 text-red-600 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
        <p className="text-xs text-gray-700 sm:text-sm">
          📊 Total de personas: <strong>{personasFiltradas.length}</strong>
        </p>
      </div>

      {/* Modal de Registro */}
      <ModalRegistrarPersona
        open={modalRegistroOpen}
        onOpenChange={setModalRegistroOpen}
        onRegistroExitoso={() => {
          cargarPersonas()
        }}
      />

      {/* Modal de Edición */}
      {personaSeleccionada && (
        <ModalEditarPersona
          open={modalEdicionOpen}
          onOpenChange={setModalEdicionOpen}
          persona={personaSeleccionada}
          onEdicionExitosa={() => {
            cargarPersonas()
          }}
        />
      )}
    </div>
  )
}
