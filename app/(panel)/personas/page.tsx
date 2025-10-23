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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-8 w-8 text-blue-600" />
            Personas
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión de personas del sistema (titulares, conductores, celadores)
          </p>
        </div>
        <Button onClick={() => setModalRegistroOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Persona
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por DNI, nombre, CUIT..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarPersonas()}
          className="max-w-md"
        />
        <Button onClick={buscarPersonas} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
        {busqueda && (
          <Button
            variant="outline"
            onClick={() => {
              setBusqueda('')
              cargarPersonas()
            }}
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Cargando personas...</p>
          </div>
        ) : personasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron personas</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DNI</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>CUIT</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Domicilio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personasFiltradas.map((persona) => (
                <TableRow key={persona.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="font-mono">
                      {persona.dni}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900">
                      {persona.nombre || '-'}
                    </div>
                    {persona.genero && (
                      <div className="text-xs text-gray-500">
                        {persona.genero}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {persona.cuit || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {persona.telefono && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="h-3 w-3" />
                          {persona.telefono}
                        </div>
                      )}
                      {persona.email && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="h-3 w-3" />
                          {persona.email}
                        </div>
                      )}
                      {!persona.telefono && !persona.email && '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {persona.domicilio_calle && persona.domicilio_nro ? (
                      <div>
                        <div>{persona.domicilio_calle} {persona.domicilio_nro}</div>
                        {persona.domicilio_localidad && (
                          <div className="text-xs text-gray-500">{persona.domicilio_localidad}</div>
                        )}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setPersonaSeleccionada(persona)
                          setModalEdicionOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert('Eliminar persona próximamente')}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
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
