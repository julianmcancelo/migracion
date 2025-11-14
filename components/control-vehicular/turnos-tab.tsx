'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  User,
  Car,
  Search,
  SortAsc,
  ListChecks,
} from 'lucide-react'
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
export default function TurnosTab() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [turnosFiltrados, setTurnosFiltrados] = useState<Turno[]>([])
  const [habilitacionesSinTurno, setHabilitacionesSinTurno] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS')
  const [buscarDNI, setBuscarDNI] = useState('')
  const [buscarDominio, setBuscarDominio] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [turnoEditar, setTurnoEditar] = useState<Turno | null>(null)
  const [precargarLicencia, setPrecargarLicencia] = useState('')

  // Estados para selección múltiple
  const [seleccionados, setSeleccionados] = useState<number[]>([])
  const [ordenamiento, setOrdenamiento] = useState<
    'fecha-asc' | 'fecha-desc' | 'licencia' | 'estado'
  >('fecha-asc')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false)

  // Detectar parámetro licencia en URL y abrir modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const licencia = params.get('licencia')

    if (licencia) {
      setPrecargarLicencia(licencia)
      setModalAbierto(true)

      // Limpiar URL después de procesar el parámetro
      window.history.replaceState({}, '', '/turnos')
    }
  }, [])

  useEffect(() => {
    cargarTurnos()
    cargarHabilitacionesSinTurno()
  }, [filtroEstado])

  useEffect(() => {
    aplicarFiltros()
  }, [turnos, buscarDNI, buscarDominio, ordenamiento])

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

    // Aplicar ordenamiento
    switch (ordenamiento) {
      case 'fecha-asc':
        resultado.sort(
          (a, b) =>
            new Date(a.fecha + ' ' + a.hora).getTime() - new Date(b.fecha + ' ' + b.hora).getTime()
        )
        break
      case 'fecha-desc':
        resultado.sort(
          (a, b) =>
            new Date(b.fecha + ' ' + b.hora).getTime() - new Date(a.fecha + ' ' + a.hora).getTime()
        )
        break
      case 'licencia':
        resultado.sort((a, b) =>
          (a.habilitacion?.nro_licencia || '').localeCompare(b.habilitacion?.nro_licencia || '')
        )
        break
      case 'estado':
        resultado.sort((a, b) => a.estado.localeCompare(b.estado))
        break
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
    setPrecargarLicencia('')
  }

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    if (!confirm(`¿Confirmar cambio de estado a ${nuevoEstado}?`)) return

    try {
      const response = await fetch(`/api/turnos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
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
    if (!confirm('⚠️ ¿Está seguro de ELIMINAR este turno?\n\nEsta acción no se puede deshacer.'))
      return

    try {
      const response = await fetch(`/api/turnos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('✅ Turno eliminado exitosamente')
          cargarTurnos() // Recargar la lista
        } else {
          alert('❌ Error: ' + (data.error || 'Error desconocido'))
        }
      } else {
        alert('❌ Error al eliminar el turno')
      }
    } catch (error) {
      console.error('Error al eliminar turno:', error)
      alert('❌ Error de conexión al eliminar el turno')
    }
  }

  // Funciones de selección múltiple
  const toggleSeleccion = (id: number) => {
    setSeleccionados(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]))
  }

  const toggleSeleccionTodos = () => {
    if (seleccionados.length === turnosFiltrados.length) {
      setSeleccionados([])
    } else {
      setSeleccionados(turnosFiltrados.map(t => t.id))
    }
  }

  const cancelarSeleccionados = async () => {
    if (seleccionados.length === 0) {
      alert('Seleccione al menos un turno')
      return
    }

    if (
      !confirm(
        `⚠️ ¿Está seguro de ELIMINAR ${seleccionados.length} turno(s) seleccionado(s)?\n\nEsta acción no se puede deshacer.`
      )
    )
      return

    let exitosos = 0
    let fallidos = 0

    for (const id of seleccionados) {
      try {
        const response = await fetch(`/api/turnos/${id}`, { method: 'DELETE' })
        const data = await response.json()
        if (response.ok && data.success) {
          exitosos++
        } else {
          fallidos++
        }
      } catch (error) {
        fallidos++
      }
    }

    alert(
      `✅ ${exitosos} turno(s) eliminado(s)\n${fallidos > 0 ? `❌ ${fallidos} turno(s) con error` : ''}`
    )
    setSeleccionados([])
    cargarTurnos()
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      PENDIENTE: 'bg-yellow-100 text-yellow-700',
      CONFIRMADO: 'bg-blue-100 text-blue-700',
      FINALIZADO: 'bg-green-100 text-green-700',
      CANCELADO: 'bg-red-100 text-red-700',
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
      year: 'numeric',
    })
  }

  const formatearHora = (hora: string) => {
    return new Date(hora).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      {/* Botón Nuevo Turno */}
      <div className="flex justify-end">
        <Link href="/turnos/nuevo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Turno
          </Button>
        </Link>
      </div>
      {/* Habilitaciones sin turno - Alerta Simple */}
      {habilitacionesSinTurno.length > 0 && (
        <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <h2 className="text-base font-semibold text-orange-900">
                ⚠️ Pendientes de Turno ({habilitacionesSinTurno.length})
              </h2>
              <p className="text-sm text-orange-700">
                Estas habilitaciones necesitan turno asignado
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {habilitacionesSinTurno.slice(0, 5).map((hab: any) => (
              <div
                key={hab.id}
                className="flex items-center justify-between rounded-lg border border-orange-200 bg-white p-3 hover:bg-orange-50"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-900">{hab.nro_licencia}</p>
                    <p className="text-xs text-gray-600">{hab.titular_nombre}</p>
                  </div>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="font-mono text-sm text-gray-700">{hab.vehiculo_patente}</span>
                </div>

                <Button
                  onClick={() => {
                    setTurnoEditar(null)
                    setPrecargarLicencia(hab.nro_licencia)
                    setModalAbierto(true)
                  }}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Asignar Turno
                </Button>
              </div>
            ))}
            {habilitacionesSinTurno.length > 5 && (
              <p className="text-center text-xs text-gray-500">
                Y {habilitacionesSinTurno.length - 5} más...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filtros Colapsables */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Buscar Turnos</h3>
            {(buscarDNI || buscarDominio) && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                Activo
              </span>
            )}
          </div>
          <span className="text-gray-400">{mostrarFiltros ? '▼' : '▶'}</span>
        </button>

        {mostrarFiltros && (
          <div className="space-y-4 border-t border-gray-200 p-4">
            {/* Búsqueda Rápida */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-700">DNI del Titular</label>
                <input
                  type="text"
                  placeholder="12345678"
                  value={buscarDNI}
                  onChange={e => setBuscarDNI(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Dominio</label>
                <input
                  type="text"
                  placeholder="ABC123"
                  value={buscarDominio}
                  onChange={e => setBuscarDominio(e.target.value.toUpperCase())}
                  className="w-full rounded border border-gray-300 px-3 py-2 uppercase focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Botón Limpiar */}
            {(buscarDNI || buscarDominio) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBuscarDNI('')
                  setBuscarDominio('')
                }}
                className="w-full"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Limpiar Búsqueda
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Filtro Estado - Tabs Simples */}
      <div className="flex flex-wrap gap-2">
        {['TODOS', 'PENDIENTE', 'CONFIRMADO', 'FINALIZADO', 'CANCELADO'].map(estado => {
          const count = estado === 'TODOS' 
            ? turnosFiltrados.length 
            : turnosFiltrados.filter(t => t.estado === estado).length
          
          return (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filtroEstado === estado
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {estado === 'TODOS' && '📋'}
              {estado === 'PENDIENTE' && '⏳'}
              {estado === 'CONFIRMADO' && '✅'}
              {estado === 'FINALIZADO' && '🎉'}
              {estado === 'CANCELADO' && '❌'}
              {' '}{estado} ({count})
            </button>
          )
        })}
      </div>

      {/* Barra de acciones en lote - Simplificada */}
      {seleccionados.length > 0 && (
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">
              ✓ {seleccionados.length} turno{seleccionados.length !== 1 ? 's' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSeleccionados([])}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={cancelarSeleccionados}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Turnos - Simplificada */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando turnos...</div>
        ) : turnosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay turnos para mostrar</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-10 px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={
                        seleccionados.length === turnosFiltrados.length &&
                        turnosFiltrados.length > 0
                      }
                      onChange={toggleSeleccionTodos}
                      className="h-4 w-4 cursor-pointer rounded text-blue-600"
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Fecha/Hora
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Licencia
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Titular
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Vehículo
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {turnosFiltrados.map(turno => (
                  <tr key={turno.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(turno.id)}
                        onChange={() => toggleSeleccion(turno.id)}
                        className="h-4 w-4 cursor-pointer rounded text-blue-600"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {formatearFecha(turno.fecha)}
                      </div>
                      <div className="text-xs text-blue-600">
                        {formatearHora(turno.hora)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-mono text-sm font-semibold text-blue-600">
                        {turno.habilitacion?.nro_licencia || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {turno.habilitacion?.tipo_transporte || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {turno.titular_nombre || 'Sin datos'}
                      </div>
                      {turno.titular_dni && (
                        <div className="text-xs text-gray-500">
                          DNI: {turno.titular_dni}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm font-semibold text-gray-900">
                        {turno.vehiculo_patente || 'N/A'}
                      </div>
                      {(turno.vehiculo_marca || turno.vehiculo_modelo) && (
                        <div className="text-xs text-gray-500">
                          {turno.vehiculo_marca} {turno.vehiculo_modelo}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getEstadoBadge(turno.estado)}`}
                      >
                        {getEstadoIcon(turno.estado)}
                        {turno.estado}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Confirmar */}
                        {turno.estado === 'PENDIENTE' && (
                          <button
                            onClick={() => cambiarEstado(turno.id, 'CONFIRMADO')}
                            className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                            title="Confirmar turno"
                          >
                            Confirmar
                          </button>
                        )}

                        {/* Inspeccionar */}
                        {turno.estado === 'CONFIRMADO' && (
                          <a
                            href={`/inspecciones/nueva?turno_id=${turno.id}&habilitacion_id=${turno.habilitacion_id}`}
                            className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                          >
                            Inspeccionar
                          </a>
                        )}

                        {/* Editar */}
                        {turno.estado !== 'FINALIZADO' && turno.estado !== 'CANCELADO' && (
                          <button
                            onClick={() => abrirModalEditar(turno)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Editar turno"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}

                        {/* Eliminar */}
                        {turno.estado !== 'FINALIZADO' && turno.estado !== 'CANCELADO' && (
                          <button
                            onClick={() => eliminarTurno(turno.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar turno"
                          >
                            <Trash2 className="h-4 w-4" />
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
        precargarLicencia={precargarLicencia}
      />
    </div>
  )
}
