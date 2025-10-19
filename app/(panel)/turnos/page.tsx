'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, Filter, CheckCircle, XCircle, AlertCircle, Edit, Trash2, User, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModalTurno } from '@/components/turnos/modal-turno'

interface Turno {
  id: number
  habilitacion_id: number
  fecha: string
  hora: string
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'FINALIZADO' | 'CANCELADO'
  observaciones?: string
  recordatorio_enviado?: number
  creado_en?: string
  habilitacion?: {
    id: number
    nro_licencia: string
    tipo_transporte: string
  }
  titular_nombre?: string
  titular_dni?: string
  titular_email?: string
  titular_telefono?: string
  vehiculo_patente?: string
  vehiculo_marca?: string
  vehiculo_modelo?: string
}

/**
 * Página de gestión de turnos
 * Lista, crea y actualiza turnos de inspección
 */
export default function TurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [turnosFiltrados, setTurnosFiltrados] = useState<Turno[]>([])
  const [habilitacionesSinTurno, setHabilitacionesSinTurno] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS')
  const [buscarDNI, setBuscarDNI] = useState('')
  const [buscarDominio, setBuscarDominio] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [turnoEditar, setTurnoEditar] = useState<Turno | null>(null)

  useEffect(() => {
    cargarTurnos()
    cargarHabilitacionesSinTurno()
  }, [filtroEstado])

  useEffect(() => {
    aplicarFiltros()
  }, [turnos, buscarDNI, buscarDominio])

  const cargarTurnos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filtroEstado !== 'TODOS') {
        params.append('estado', filtroEstado)
      }

      const response = await fetch(`/api/turnos?${params}`)
      const data = await response.json()

      if (data.success) {
        setTurnos(data.data)
        setTurnosFiltrados(data.data)
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarHabilitacionesSinTurno = async () => {
    try {
      const response = await fetch('/api/habilitaciones/sin-turno')
      const data = await response.json()

      if (data.success) {
        setHabilitacionesSinTurno(data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar habilitaciones sin turno:', error)
    }
  }

  const aplicarFiltros = () => {
    let resultado = [...turnos]

    if (buscarDNI.trim()) {
      resultado = resultado.filter(t => 
        t.titular_dni?.toLowerCase().includes(buscarDNI.toLowerCase())
      )
    }

    if (buscarDominio.trim()) {
      resultado = resultado.filter(t => 
        t.vehiculo_patente?.toLowerCase().includes(buscarDominio.toLowerCase())
      )
    }

    setTurnosFiltrados(resultado)
  }

  const abrirModalNuevo = () => {
    setTurnoEditar(null)
    setModalAbierto(true)
  }

  const abrirModalEditar = (turno: Turno) => {
    setTurnoEditar(turno)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setTurnoEditar(null)
  }

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    if (!confirm(`¿Confirmar cambio de estado a ${nuevoEstado}?`)) return

    try {
      const response = await fetch(`/api/turnos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Estado actualizado correctamente')
        cargarTurnos()
      } else {
        alert(`Error: ${data.error || 'No se pudo actualizar el estado'}`)
      }
    } catch (error) {
      console.error('Error al actualizar turno:', error)
      alert('Error al actualizar el turno')
    }
  }

  const eliminarTurno = async (id: number) => {
    if (!confirm('¿Está seguro de cancelar este turno?')) return

    try {
      const response = await fetch(`/api/turnos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        cargarTurnos()
      }
    } catch (error) {
      console.error('Error al cancelar turno:', error)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CONFIRMADO: 'bg-blue-100 text-blue-800 border-blue-300',
      FINALIZADO: 'bg-green-100 text-green-800 border-green-300',
      CANCELADO: 'bg-red-100 text-red-800 border-red-300'
    }
    return badges[estado as keyof typeof badges] || badges.PENDIENTE
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'FINALIZADO':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELADO':
        return <XCircle className="h-4 w-4" />
      case 'CONFIRMADO':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatearHora = (hora: string) => {
    return new Date(hora).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Gestión de Turnos
          </h1>
          <p className="text-gray-600 mt-2">
            Agenda de turnos para inspecciones vehiculares
          </p>
        </div>
        
        <Button onClick={abrirModalNuevo} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Turno
        </Button>
      </div>

      {/* Habilitaciones sin turno */}
      {habilitacionesSinTurno.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <div>
              <h2 className="text-lg font-bold text-orange-900">
                Habilitaciones en Trámite sin Turno Asignado
              </h2>
              <p className="text-sm text-orange-700">
                Hay {habilitacionesSinTurno.length} habilitación{habilitacionesSinTurno.length !== 1 ? 'es' : ''} esperando asignación de turno
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habilitacionesSinTurno.map((hab: any) => (
              <div key={hab.id} className="bg-white rounded-lg p-4 shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">N° Licencia</p>
                    <p className="font-mono font-bold text-blue-700">{hab.nro_licencia}</p>
                  </div>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
                    SIN TURNO
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{hab.titular_nombre || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span className="font-mono text-gray-700">{hab.vehiculo_patente || 'N/A'}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Tipo: <span className="font-medium">{hab.tipo_transporte || 'N/A'}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    setTurnoEditar({
                      id: 0,
                      habilitacion_id: hab.id,
                      fecha: '',
                      hora: '',
                      estado: 'PENDIENTE',
                      habilitacion: {
                        id: hab.id,
                        nro_licencia: hab.nro_licencia,
                        tipo_transporte: hab.tipo_transporte || 'Escolar'
                      }
                    } as Turno)
                    setModalAbierto(true)
                  }}
                  size="sm"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Asignar Turno
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros:</span>
        </div>
        
        {/* Búsqueda por DNI y Dominio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar por DNI:
            </label>
            <input
              type="text"
              placeholder="Ingrese DNI del titular..."
              value={buscarDNI}
              onChange={(e) => setBuscarDNI(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🚗 Buscar por Dominio:
            </label>
            <input
              type="text"
              placeholder="Ingrese patente del vehículo..."
              value={buscarDominio}
              onChange={(e) => setBuscarDominio(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            />
          </div>
        </div>

        {/* Estado */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Por estado:</span>
          {['TODOS', 'PENDIENTE', 'CONFIRMADO', 'FINALIZADO', 'CANCELADO'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === estado
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {estado}
            </button>
          ))}
        </div>

        {/* Resumen de búsqueda */}
        {(buscarDNI || buscarDominio) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Filtrando:</strong>
              {buscarDNI && <span className="ml-2">DNI: "{buscarDNI}"</span>}
              {buscarDominio && <span className="ml-2">Dominio: "{buscarDominio}"</span>}
              <button
                onClick={() => { setBuscarDNI(''); setBuscarDominio(''); }}
                className="ml-4 text-blue-600 hover:text-blue-800 font-semibold"
              >
                ❌ Limpiar
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">
                {turnosFiltrados.filter(t => t.estado === 'PENDIENTE').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Confirmados</p>
              <p className="text-2xl font-bold text-blue-900">
                {turnosFiltrados.filter(t => t.estado === 'CONFIRMADO').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Finalizados</p>
              <p className="text-2xl font-bold text-green-900">
                {turnosFiltrados.filter(t => t.estado === 'FINALIZADO').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Cancelados</p>
              <p className="text-2xl font-bold text-red-900">
                {turnosFiltrados.filter(t => t.estado === 'CANCELADO').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Lista de Turnos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Cargando turnos...
          </div>
        ) : turnosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No hay turnos para mostrar
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha / Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Licencia
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titular / Vehículo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {turnosFiltrados.map((turno) => (
                  <tr key={turno.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatearFecha(turno.fecha)}
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-medium ml-6">
                          <Clock className="h-4 w-4" />
                          {formatearHora(turno.hora)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-blue-600 text-base">
                          {turno.habilitacion?.nro_licencia || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {turno.habilitacion?.tipo_transporte || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <User className="h-4 w-4 text-gray-400" />
                          {turno.titular_nombre || 'Sin datos'}
                        </div>
                        {turno.titular_dni && (
                          <span className="text-xs text-gray-500 ml-6">DNI: {turno.titular_dni}</span>
                        )}
                        {turno.titular_telefono && (
                          <span className="text-xs text-gray-500 ml-6">📞 {turno.titular_telefono}</span>
                        )}
                        <div className="flex items-center gap-2 text-gray-700 mt-1">
                          <Car className="h-4 w-4 text-gray-400" />
                          <span className="font-mono font-semibold">{turno.vehiculo_patente || 'N/A'}</span>
                          {(turno.vehiculo_marca || turno.vehiculo_modelo) && (
                            <span className="text-xs text-gray-500">
                              {turno.vehiculo_marca} {turno.vehiculo_modelo}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(turno.estado)}`}>
                        {getEstadoIcon(turno.estado)}
                        {turno.estado}
                      </span>
                      {turno.observaciones && (
                        <p className="text-xs text-gray-500 mt-2 max-w-xs truncate" title={turno.observaciones}>
                          {turno.observaciones}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2 flex-wrap">
                        {/* Editar */}
                        {turno.estado !== 'FINALIZADO' && turno.estado !== 'CANCELADO' && (
                          <button
                            onClick={() => abrirModalEditar(turno)}
                            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
                            title="Editar observaciones"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </button>
                        )}

                        {/* Confirmar */}
                        {turno.estado === 'PENDIENTE' && (
                          <button
                            onClick={() => cambiarEstado(turno.id, 'CONFIRMADO')}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 font-medium"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Confirmar
                          </button>
                        )}

                        {/* Inspeccionar */}
                        {turno.estado === 'CONFIRMADO' && (
                          <a
                            href={`/inspecciones/nueva?turno_id=${turno.id}&habilitacion_id=${turno.habilitacion_id}`}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-900 font-medium"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Inspeccionar
                          </a>
                        )}

                        {/* Cancelar */}
                        {turno.estado !== 'FINALIZADO' && turno.estado !== 'CANCELADO' && (
                          <button
                            onClick={() => eliminarTurno(turno.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 font-medium"
                          >
                            <Trash2 className="h-4 w-4" />
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Crear/Editar Turno */}
      <ModalTurno
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onSuccess={() => {
          cargarTurnos()
          cargarHabilitacionesSinTurno()
        }}
        turnoEdit={turnoEditar}
      />
    </div>
  )
}
