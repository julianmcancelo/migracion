'use client'

import { useState, useEffect } from 'react'
import { Car, Plus, Search, Eye, AlertTriangle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ModalRegistrarVehiculo from './_components/modal-registrar-vehiculo'
import { DetalleVehiculoModal } from './_components/detalle-vehiculo-modal'
import { CompletarDatosModal } from './_components/completar-datos-modal'
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
  Vencimiento_VTV?: string | null
  Vencimiento_Poliza?: string | null
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
  const [modalRegistroOpen, setModalRegistroOpen] = useState(false)
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<number | null>(null)
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false)
  const [filtroProblemas, setFiltroProblemas] = useState<'todos' | 'con_problemas' | 'sin_datos'>('todos')
  const [vehiculoParaCompletar, setVehiculoParaCompletar] = useState<Vehiculo | null>(null)
  const [modalCompletarOpen, setModalCompletarOpen] = useState(false)

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

  // Función para detectar problemas en un vehículo
  const tieneProblemas = (vehiculo: Vehiculo) => {
    const hoy = new Date()
    const vtvVencida = vehiculo.Vencimiento_VTV ? new Date(vehiculo.Vencimiento_VTV) < hoy : false
    const polizaVencida = vehiculo.Vencimiento_Poliza ? new Date(vehiculo.Vencimiento_Poliza) < hoy : false
    return vtvVencida || polizaVencida
  }

  const tieneDatosFaltantes = (vehiculo: Vehiculo) => {
    return !vehiculo.marca || !vehiculo.modelo || !vehiculo.ano || 
           !vehiculo.Vencimiento_VTV || !vehiculo.Vencimiento_Poliza
  }

  // Aplicar filtros
  let vehiculosFiltrados = vehiculos

  // Filtro por búsqueda
  if (busqueda.trim()) {
    vehiculosFiltrados = vehiculosFiltrados
  }

  // Filtro por problemas
  if (filtroProblemas === 'con_problemas') {
    vehiculosFiltrados = vehiculosFiltrados.filter(tieneProblemas)
  } else if (filtroProblemas === 'sin_datos') {
    vehiculosFiltrados = vehiculosFiltrados.filter(tieneDatosFaltantes)
  }

  // Calcular contadores
  const vehiculosConProblemas = vehiculos.filter(tieneProblemas).length
  const vehiculosSinDatos = vehiculos.filter(tieneDatosFaltantes).length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            <Car className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
            Vehículos
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Gestión de vehículos del sistema
          </p>
        </div>
        <Button onClick={() => setModalRegistroOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Vehículo
        </Button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Buscar por dominio, marca..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarVehiculos()}
            className="w-full sm:max-w-md"
          />
          <div className="flex gap-2">
            <Button onClick={buscarVehiculos} disabled={loading} className="flex-1 sm:flex-none">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            {busqueda && (
              <Button
                variant="outline"
                onClick={() => {
                  setBusqueda('')
                  cargarVehiculos()
                }}
                className="flex-1 sm:flex-none"
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Filtros discretos */}
        {(vehiculosConProblemas > 0 || vehiculosSinDatos > 0) && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filtroProblemas === 'todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroProblemas('todos')}
              className="text-xs"
            >
              Todos ({vehiculos.length})
            </Button>
            
            {vehiculosConProblemas > 0 && (
              <Button
                variant={filtroProblemas === 'con_problemas' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setFiltroProblemas('con_problemas')}
                className="text-xs"
              >
                <AlertTriangle className="mr-1 h-3 w-3" />
                Doc. Vencida ({vehiculosConProblemas})
              </Button>
            )}
            
            {vehiculosSinDatos > 0 && (
              <Button
                variant={filtroProblemas === 'sin_datos' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setFiltroProblemas('sin_datos')}
                className="text-xs"
              >
                <FileText className="mr-1 h-3 w-3" />
                Datos Faltantes ({vehiculosSinDatos})
              </Button>
            )}
          </div>
        )}
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
            <p className="text-sm text-gray-600 sm:text-base">Cargando vehículos...</p>
          </div>
        ) : vehiculosFiltrados.length === 0 ? (
          <div className="py-8 text-center sm:py-12">
            <Car className="mx-auto mb-4 h-12 w-12 text-gray-300 sm:h-16 sm:w-16" />
            <p className="text-sm text-gray-600 sm:text-base">No se encontraron vehículos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] sm:text-xs">Dominio</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Marca</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Modelo</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Año</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Asientos</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Chasis</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Motor</TableHead>
                  <TableHead className="text-right text-[10px] sm:text-xs">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiculosFiltrados.map((vehiculo) => (
                  <TableRow key={vehiculo.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="font-mono text-[10px] sm:text-xs">
                        {vehiculo.dominio}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{vehiculo.marca || '-'}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{vehiculo.modelo || '-'}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{vehiculo.ano || '-'}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{vehiculo.asientos || '-'}</TableCell>
                    <TableCell className="font-mono text-[10px] sm:text-xs">
                      {vehiculo.chasis ? vehiculo.chasis.substring(0, 10) + '...' : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] sm:text-xs">
                      {vehiculo.motor ? vehiculo.motor.substring(0, 10) + '...' : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* Botón Completar Datos (solo si filtro activo) */}
                        {filtroProblemas === 'sin_datos' && tieneDatosFaltantes(vehiculo) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setVehiculoParaCompletar(vehiculo)
                              setModalCompletarOpen(true)
                            }}
                            className="h-7 px-2 text-orange-600 hover:bg-orange-50 hover:text-orange-700 sm:h-8 sm:px-3"
                          >
                            <FileText className="h-3 w-3 sm:mr-1 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline text-xs">Completar</span>
                          </Button>
                        )}
                        
                        {/* Botón Ver Detalle */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setVehiculoSeleccionado(vehiculo.id)
                            setModalDetalleOpen(true)
                          }}
                          className="h-7 px-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 sm:h-8 sm:px-3"
                        >
                          <Eye className="h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Ver</span>
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-700 sm:text-sm">
            📊 {filtroProblemas === 'todos' ? 'Total de vehículos' : 
                filtroProblemas === 'con_problemas' ? 'Vehículos con documentación vencida' :
                'Vehículos con datos faltantes'}: <strong>{vehiculosFiltrados.length}</strong>
            {filtroProblemas !== 'todos' && ` de ${vehiculos.length}`}
          </p>
          {filtroProblemas !== 'todos' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltroProblemas('todos')}
              className="text-xs text-blue-700 hover:text-blue-900"
            >
              Ver todos
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Registro */}
      <ModalRegistrarVehiculo
        open={modalRegistroOpen}
        onOpenChange={setModalRegistroOpen}
        onRegistroExitoso={() => {
          cargarVehiculos()
        }}
      />

      {/* Modal de Detalle */}
      <DetalleVehiculoModal
        vehiculoId={vehiculoSeleccionado}
        open={modalDetalleOpen}
        onOpenChange={setModalDetalleOpen}
      />

      {/* Modal de Completar Datos */}
      <CompletarDatosModal
        vehiculo={vehiculoParaCompletar}
        open={modalCompletarOpen}
        onOpenChange={setModalCompletarOpen}
        onGuardado={() => {
          cargarVehiculos()
          setModalCompletarOpen(false)
        }}
      />
    </div>
  )
}
