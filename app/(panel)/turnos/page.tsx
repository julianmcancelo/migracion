'use client'

import { useState, useEffect } from 'react'
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
  const [precargarLicencia, setPrecargarLicencia] = useState('')

  // Estados para selección múltiple
  const [seleccionados, setSeleccionados] = useState<number[]>([])
  const [ordenamiento, setOrdenamiento] = useState<
    'fecha-asc' | 'fecha-desc' | 'licencia' | 'estado'
  >('fecha-asc')

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
      PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CONFIRMADO: 'bg-blue-100 text-blue-800 border-blue-300',
      FINALIZADO: 'bg-green-100 text-green-800 border-green-300',
      CANCELADO: 'bg-red-100 text-red-800 border-red-300',
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:gap-3 sm:text-3xl lg:text-4xl">
            <Calendar className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
            Gestión de Turnos
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">Agenda de turnos para inspecciones vehiculares</p>
        </div>

        <Button onClick={abrirModalNuevo} className="w-full bg-blue-600 text-sm hover:bg-blue-700 sm:w-auto sm:text-base">
          <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Nuevo Turno
        </Button>
      </div>

      {/* Habilitaciones sin turno */}
      {habilitacionesSinTurno.length > 0 && (
        <div className="rounded-xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-red-50 p-4 sm:p-6">
          <div className="mb-3 flex items-start gap-2 sm:mb-4 sm:items-center sm:gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600 sm:h-6 sm:w-6" />
            <div>
              <h2 className="text-base font-bold text-orange-900 sm:text-lg">
                Habilitaciones en Trámite sin Turno Asignado
              </h2>
              <p className="text-xs text-orange-700 sm:text-sm">
                Hay {habilitacionesSinTurno.length} habilitación
                {habilitacionesSinTurno.length !== 1 ? 'es' : ''} esperando asignación de turno
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {habilitacionesSinTurno.map((hab: any) => (
              <div
                key={hab.id}
                className="rounded-lg border border-orange-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500">N° Licencia</p>
                    <p className="font-mono font-bold text-blue-700">{hab.nro_licencia}</p>
                  </div>
                  <span className="rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
                    SIN TURNO
                  </span>
                </div>

                <div className="mb-3 space-y-2">
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
                    setTurnoEditar(null)
                    setPrecargarLicencia(hab.nro_licencia)
                    setModalAbierto(true)
                  }}
                  size="sm"
                  className="w-full bg-orange-600 text-white hover:bg-orange-700"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Asignar Turno
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      {/* Panel de Filtros y Búsqueda */}
      <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header del panel */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Filtros de Búsqueda</h3>
                <p className="text-xs text-gray-600">Encuentra turnos específicos fácilmente</p>
              </div>
            </div>
            {(buscarDNI || buscarDominio) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBuscarDNI('')
                  setBuscarDominio('')
                }}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Limpiar Búsqueda
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Búsqueda por DNI y Dominio */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Búsqueda Rápida
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-blue-600" />
                  Buscar por DNI del Titular
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: 12345678"
                    value={buscarDNI}
                    onChange={e => setBuscarDNI(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                </div>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Car className="h-4 w-4 text-blue-600" />
                  Buscar por Dominio del Vehículo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: ABC123"
                    value={buscarDominio}
                    onChange={e => setBuscarDominio(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 uppercase transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros por Estado */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Filtrar por Estado
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {['TODOS', 'PENDIENTE', 'CONFIRMADO', 'FINALIZADO', 'CANCELADO'].map(estado => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`transform rounded-lg px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105 ${
                    filtroEstado === estado
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {estado === 'TODOS' && '📋 '}
                  {estado === 'PENDIENTE' && '⏳ '}
                  {estado === 'CONFIRMADO' && '✅ '}
                  {estado === 'FINALIZADO' && '🎉 '}
                  {estado === 'CANCELADO' && '❌ '}
                  {estado}
                </button>
              ))}
            </div>
          </div>

          {/* Ordenamiento */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Ordenar Resultados
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={ordenamiento}
                onChange={e => setOrdenamiento(e.target.value as any)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="fecha-asc">📅 Fecha - Más Próximos Primero</option>
                <option value="fecha-desc">📅 Fecha - Más Lejanos Primero</option>
                <option value="licencia">🔢 N° Licencia - A a Z</option>
                <option value="estado">📊 Estado - Alfabético</option>
              </select>
              <span className="hidden text-xs text-gray-500 md:block">
                {turnosFiltrados.length} resultado{turnosFiltrados.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 transition-shadow hover:shadow-md sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-700 sm:text-sm">Pendientes</p>
              <p className="text-xl font-bold text-yellow-900 sm:text-2xl">
                {turnosFiltrados.filter(t => t.estado === 'PENDIENTE').length}
              </p>
            </div>
            <Clock className="h-6 w-6 text-yellow-600 sm:h-8 sm:w-8" />
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 transition-shadow hover:shadow-md sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700 sm:text-sm">Confirmados</p>
              <p className="text-xl font-bold text-blue-900 sm:text-2xl">
                {turnosFiltrados.filter(t => t.estado === 'CONFIRMADO').length}
              </p>
            </div>
            <AlertCircle className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
          </div>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-3 transition-shadow hover:shadow-md sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700 sm:text-sm">Finalizados</p>
              <p className="text-xl font-bold text-green-900 sm:text-2xl">
                {turnosFiltrados.filter(t => t.estado === 'FINALIZADO').length}
              </p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-3 transition-shadow hover:shadow-md sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-700 sm:text-sm">Cancelados</p>
              <p className="text-xl font-bold text-red-900 sm:text-2xl">
                {turnosFiltrados.filter(t => t.estado === 'CANCELADO').length}
              </p>
            </div>
            <XCircle className="h-6 w-6 text-red-600 sm:h-8 sm:w-8" />
          </div>
        </div>
      </div>

      {/* Barra de acciones en lote */}
      {seleccionados.length > 0 && (
        <div className="mb-4 overflow-hidden rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 p-2">
                <ListChecks className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Selección Múltiple Activa</p>
                <p className="text-lg font-bold text-blue-900">
                  {seleccionados.length} turno{seleccionados.length !== 1 ? 's' : ''} seleccionado
                  {seleccionados.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSeleccionados([])}
                className="border-gray-300 hover:bg-white"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Deseleccionar Todo
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={cancelarSeleccionados}
                className="bg-red-600 shadow-sm hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar {seleccionados.length} Turno{seleccionados.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Turnos */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 sm:p-12 sm:text-base">Cargando turnos...</div>
        ) : turnosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 sm:p-12 sm:text-base">No hay turnos para mostrar</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-10 px-3 py-3 text-center sm:w-12 sm:px-4 sm:py-4">
                    <input
                      type="checkbox"
                      checked={
                        seleccionados.length === turnosFiltrados.length &&
                        turnosFiltrados.length > 0
                      }
                      onChange={toggleSeleccionTodos}
                      className="h-3.5 w-3.5 cursor-pointer rounded text-blue-600 sm:h-4 sm:w-4"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-6 sm:py-4 sm:text-xs">
                    Fecha / Hora
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-6 sm:py-4 sm:text-xs">
                    Licencia
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-6 sm:py-4 sm:text-xs">
                    Titular / Vehículo
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-6 sm:py-4 sm:text-xs">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-6 sm:py-4 sm:text-xs">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {turnosFiltrados.map(turno => (
                  <tr key={turno.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-3 py-3 text-center sm:px-4 sm:py-4">
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(turno.id)}
                        onChange={() => toggleSeleccion(turno.id)}
                        className="h-3.5 w-3.5 cursor-pointer rounded text-blue-600 sm:h-4 sm:w-4"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm">
                      <div className="flex flex-col gap-0.5 sm:gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 sm:gap-2 sm:text-sm">
                          <Calendar className="h-3 w-3 text-gray-400 sm:h-4 sm:w-4" />
                          {formatearFecha(turno.fecha)}
                        </div>
                        <div className="ml-4 flex items-center gap-1.5 text-xs font-medium text-blue-600 sm:ml-6 sm:gap-2">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          {formatearHora(turno.hora)}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-bold text-blue-600 sm:text-base">
                          {turno.habilitacion?.nro_licencia || 'N/A'}
                        </span>
                        <span className="text-[10px] text-gray-500 sm:text-xs">
                          {turno.habilitacion?.tipo_transporte || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm">
                      <div className="flex flex-col gap-0.5 sm:gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 sm:gap-2 sm:text-sm">
                          <User className="h-3 w-3 text-gray-400 sm:h-4 sm:w-4" />
                          {turno.titular_nombre || 'Sin datos'}
                        </div>
                        {turno.titular_dni && (
                          <span className="ml-4 text-[10px] text-gray-500 sm:ml-6 sm:text-xs">
                            DNI: {turno.titular_dni}
                          </span>
                        )}
                        {turno.titular_telefono && (
                          <span className="ml-4 text-[10px] text-gray-500 sm:ml-6 sm:text-xs">
                            📞 {turno.titular_telefono}
                          </span>
                        )}
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-700 sm:mt-1 sm:gap-2">
                          <Car className="h-3 w-3 text-gray-400 sm:h-4 sm:w-4" />
                          <span className="font-mono text-xs font-semibold sm:text-sm">
                            {turno.vehiculo_patente || 'N/A'}
                          </span>
                          {(turno.vehiculo_marca || turno.vehiculo_modelo) && (
                            <span className="text-[10px] text-gray-500 sm:text-xs">
                              {turno.vehiculo_marca} {turno.vehiculo_modelo}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                      <span
                        className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold sm:gap-1 sm:px-3 sm:py-1 sm:text-xs ${getEstadoBadge(turno.estado)}`}
                      >
                        {getEstadoIcon(turno.estado)}
                        <span className="hidden sm:inline">{turno.estado}</span>
                      </span>
                      {turno.observaciones && (
                        <p
                          className="mt-1 max-w-xs truncate text-[10px] text-gray-500 sm:mt-2 sm:text-xs"
                          title={turno.observaciones}
                        >
                          {turno.observaciones}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-2">
                        {/* Editar */}
                        {turno.estado !== 'FINALIZADO' && turno.estado !== 'CANCELADO' && (
                          <button
                            onClick={() => abrirModalEditar(turno)}
                            className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-600 hover:text-gray-900 sm:gap-1"
                            title="Editar observaciones"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                        )}

                        {/* Confirmar */}
                        {turno.estado === 'PENDIENTE' && (
                          <button
                            onClick={() => cambiarEstado(turno.id, 'CONFIRMADO')}
                            className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-900 sm:gap-1"
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Confirmar</span>
                          </button>
                        )}

                        {/* Inspeccionar */}
                        {turno.estado === 'CONFIRMADO' && (
                          <a
                            href={`/inspecciones/nueva?turno_id=${turno.id}&habilitacion_id=${turno.habilitacion_id}`}
                            className="inline-flex items-center gap-0.5 text-xs font-medium text-green-600 hover:text-green-900 sm:gap-1"
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Inspeccionar</span>
                          </a>
                        )}

                        {/* Eliminar */}
                        {turno.estado !== 'FINALIZADO' && turno.estado !== 'CANCELADO' && (
                          <button
                            onClick={() => eliminarTurno(turno.id)}
                            className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600 hover:text-red-900 sm:gap-1"
                            title="Eliminar turno permanentemente"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Eliminar</span>
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
