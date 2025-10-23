'use client'

import { useState, useEffect } from 'react'
import { Car, Plus, Search, Edit, Trash2 } from 'lucide-react'
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

interface Vehiculo {
  id: number
  dominio: string
  marca: string | null
  modelo: string | null
  ano: number | null
  chasis: string | null
  motor: string | null
  asientos: number | null
}

/**
 * Página de gestión de vehículos
 * Permite ver, buscar y gestionar vehículos del sistema
 */
export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarVehiculos()
  }, [])

  const cargarVehiculos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vehiculos?limite=100')
      const data = await response.json()

      if (data.success) {
        setVehiculos(data.data || [])
      } else {
        setError('Error al cargar vehículos')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const buscarVehiculos = async () => {
    if (busqueda.trim().length < 2) {
      cargarVehiculos()
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/vehiculos?buscar=${encodeURIComponent(busqueda)}`)
      const data = await response.json()

      if (data.success) {
        setVehiculos(data.data || [])
      }
    } catch {
      setError('Error al buscar')
    } finally {
      setLoading(false)
    }
  }

  const vehiculosFiltrados = busqueda.trim()
    ? vehiculos
    : vehiculos

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Car className="h-8 w-8 text-blue-600" />
            Vehículos
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión de vehículos del sistema
          </p>
        </div>
        <Button onClick={() => alert('Funcionalidad de crear vehículo próximamente')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Vehículo
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por dominio, marca o modelo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarVehiculos()}
          className="max-w-md"
        />
        <Button onClick={buscarVehiculos} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
        {busqueda && (
          <Button
            variant="outline"
            onClick={() => {
              setBusqueda('')
              cargarVehiculos()
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
            <p className="text-gray-600">Cargando vehículos...</p>
          </div>
        ) : vehiculosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron vehículos</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dominio</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Asientos</TableHead>
                <TableHead>Chasis</TableHead>
                <TableHead>Motor</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehiculosFiltrados.map((vehiculo) => (
                <TableRow key={vehiculo.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="font-mono">
                      {vehiculo.dominio}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehiculo.marca || '-'}</TableCell>
                  <TableCell>{vehiculo.modelo || '-'}</TableCell>
                  <TableCell>{vehiculo.ano || '-'}</TableCell>
                  <TableCell>{vehiculo.asientos || '-'}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {vehiculo.chasis ? vehiculo.chasis.substring(0, 10) + '...' : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {vehiculo.motor ? vehiculo.motor.substring(0, 10) + '...' : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert('Editar vehículo próximamente')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert('Eliminar vehículo próximamente')}
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
          📊 Total de vehículos: <strong>{vehiculosFiltrados.length}</strong>
        </p>
      </div>
    </div>
  )
}
