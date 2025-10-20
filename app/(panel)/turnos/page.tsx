'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, Filter, CheckCircle, XCircle, AlertCircle, Edit, Trash2, User, Car, Search, SortAsc, ListChecks } from 'lucide-react'
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
  const [ordenamiento, setOrdenamiento] = useState<'fecha-asc' | 'fecha-desc' | 'licencia' | 'estado'>('fecha-asc')

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
        resultado.sort((a, b) => new Date(a.fecha + ' ' + a.hora).getTime() - new Date(b.fecha + ' ' + b.hora).getTime())
        break
      case 'fecha-desc':
        resultado.sort((a, b) => new Date(b.fecha + ' ' + b.hora).getTime() - new Date(a.fecha + ' ' + a.hora).getTime())
        break
      case 'licencia':
        resultado.sort((a, b) => (a.habilitacion?.nro_licencia || '').localeCompare(b.habilitacion?.nro_licencia || ''))
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
        const data = await response.json()
        if (data.success) {
          alert('✅ Turno cancelado exitosamente')
          cargarTurnos() // Recargar la lista
        } else {
          alert('❌ Error: ' + (data.error || 'Error desconocido'))
        }
      } else {
        alert('❌ Error al cancelar el turno')
      }
    } catch (error) {
      console.error('Error al cancelar turno:', error)
      alert('❌ Error de conexión al cancelar el turno')
    }
  }

  // Funciones de selección múltiple
  const toggleSeleccion = (id: number) => {
    setSeleccionados(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
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

    if (!confirm(`¿Cancelar ${seleccionados.length} turno(s) seleccionado(s)?`)) return

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

    alert(`✅ ${exitosos} turno(s) cancelado(s)\n${fallidos > 0 ? `❌ ${fallidos} turno(s) con error` : ''}`)
    setSeleccionados([])
    cargarTurnos()
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
                    setTurnoEditar(null)
                    setPrecargarLicencia(hab.nro_licencia)
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
      {/* Panel de Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Header del panel */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
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
                onClick={() => { setBuscarDNI(''); setBuscarDominio(''); }}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Limpiar Búsqueda
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Búsqueda por DNI y Dominio */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Búsqueda Rápida
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Buscar por DNI del Titular
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: 12345678"
                    value={buscarDNI}
                    onChange={(e) => setBuscarDNI(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Car className="h-4 w-4 text-blue-600" />
                  Buscar por Dominio del Vehículo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: ABC123"
                    value={buscarDominio}
                    onChange={(e) => setBuscarDominio(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros por Estado */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Filtrar por Estado
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {['TODOS', 'PENDIENTE', 'CONFIRMADO', 'FINALIZADO', 'CANCELADO'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
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
            <div className="flex items-center gap-2 mb-3">
              <SortAsc className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Ordenar Resultados
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value as any)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="fecha-asc">📅 Fecha - Más Próximos Primero</option>
                <option value="fecha-desc">📅 Fecha - Más Lejanos Primero</option>
                <option value="licencia">🔢 N° Licencia - A a Z</option>
                <option value="estado">📊 Estado - Alfabético</option>
              </select>
              <span className="text-xs text-gray-500 hidden md:block">
                {turnosFiltrados.length} resultado{turnosFiltrados.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
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

      {/* Barra de acciones en lote */}
      {seleccionados.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-md mb-4 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ListChecks className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Selección Múltiple Activa</p>
                <p className="text-lg font-bold text-blue-900">
                  {seleccionados.length} turno{seleccionados.length !== 1 ? 's' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
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
                <XCircle className="h-4 w-4 mr-2" />
                Deseleccionar Todo
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={cancelarSeleccionados}
                className="bg-red-600 hover:bg-red-700 shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancelar {seleccionados.length} Turno{seleccionados.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  <th className="px-4 py-4 text-center w-12">
                    <input
                      type="checkbox"
                      checked={seleccionados.length === turnosFiltrados.length && turnosFiltrados.length > 0}
                      onChange={toggleSeleccionTodos}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </th>
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
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(turno.id)}
                        onChange={() => toggleSeleccion(turno.id)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                    </td>
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
        precargarLicencia={precargarLicencia}
      />
    </div>
  )
}
