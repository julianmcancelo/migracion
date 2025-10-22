'use client'

import { useState, useEffect } from 'react'
import { Shield, Search, FileText, Download, Trash2, Edit, Plus, BarChart3, AlertCircle, CheckCircle, Clock, Filter, Calendar, Users, Settings, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModalObleas } from '@/components/obleas/modal-obleas'
import { ModalGestionOblea } from '@/components/obleas/modal-gestion-oblea'

interface Oblea {
  id: number
  habilitacion_id: number
  fecha_solicitud: string
  hora_solicitud: string
  creado_en: string
  notificado: string
  nro_licencia: string
  tipo_transporte: string
  estado_habilitacion: string
  titular: string
  titular_dni: string
  vehiculo_dominio: string
  vehiculo_marca: string
  vehiculo_modelo: string
}

interface Stats {
  totales: {
    total_obleas: number
    notificadas: number
    no_notificadas: number
    habilitaciones_sin_oblea: number
  }
  recientes: Array<{
    id: number
    fecha: string
    nro_licencia: string
    tipo_transporte: string
    titular: string
    notificado: string
  }>
}

interface Habilitacion {
  id: number
  nro_licencia: string
  estado: string
  tipo_transporte: string
  titular_principal: string
  vigencia_fin: string
}

/**
 * Página completa de administración de obleas
 * - Gestión completa de obleas existentes
 * - Estadísticas y reportes
 * - Generación de nuevas obleas
 */
export default function ObleasPage() {
  const [obleas, setObleas] = useState<Oblea[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [habilitaciones, setHabilitaciones] = useState<Habilitacion[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [selectedHabilitacion, setSelectedHabilitacion] = useState<Habilitacion | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [eliminandoOblea, setEliminandoOblea] = useState<number | null>(null)
  const [obleaSeleccionada, setObleaSeleccionada] = useState<Oblea | null>(null)
  const [showGestionModal, setShowGestionModal] = useState(false)
  
  // Estados para filtros avanzados
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    tipoTransporte: '',
    notificado: ''
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  
  // Estados para selección masiva
  const [obleasSeleccionadas, setObleasSeleccionadas] = useState<number[]>([])
  const [seleccionarTodas, setSeleccionarTodas] = useState(false)
  const [accionMasiva, setAccionMasiva] = useState('')
  const [procesandoMasivo, setProcesandoMasivo] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  // Recargar obleas cuando cambien filtros o búsqueda
  useEffect(() => {
    if (!loading) {
      cargarObleas()
    }
  }, [filtros, busqueda])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      await Promise.all([
        cargarObleas(),
        cargarStats(),
        cargarHabilitaciones()
      ])
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarObleas = async () => {
    try {
      console.log('🔄 Cargando obleas...')
      // Construir parámetros con filtros
      const params = new URLSearchParams({
        limite: '50',
        busqueda: busqueda,
        ...filtros
      })
      
      const response = await fetch(`/api/obleas?${params}`)
      const data = await response.json()
      
      console.log('📊 Respuesta API obleas:', data)
      
      if (data.success) {
        setObleas(data.data || [])
        console.log('✅ Obleas cargadas:', data.data?.length || 0)
      } else {
        console.error('❌ Error en respuesta:', data.error)
      }
    } catch (error) {
      console.error('❌ Error al cargar obleas:', error)
    }
  }

  const cargarStats = async () => {
    try {
      const response = await fetch('/api/obleas/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  const cargarHabilitaciones = async () => {
    try {
      const response = await fetch('/api/habilitaciones?estado=HABILITADO&limite=100')
      const data = await response.json()
      
      if (data.success) {
        setHabilitaciones(data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar habilitaciones:', error)
    }
  }

  const eliminarOblea = async (obleaId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta oblea?')) return

    setEliminandoOblea(obleaId)
    try {
      const response = await fetch(`/api/obleas/${obleaId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await cargarDatos() // Recargar todos los datos
        alert('Oblea eliminada exitosamente')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error al eliminar oblea:', error)
      alert('Error al eliminar la oblea')
    } finally {
      setEliminandoOblea(null)
    }
  }

  const obleasFiltradas = obleas.filter(oblea =>
    oblea.nro_licencia?.toLowerCase().includes(busqueda.toLowerCase()) ||
    oblea.titular?.toLowerCase().includes(busqueda.toLowerCase()) ||
    oblea.vehiculo_dominio?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const habilitacionesFiltradas = habilitaciones.filter(hab =>
    hab.nro_licencia?.toLowerCase().includes(busqueda.toLowerCase()) ||
    hab.titular_principal?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleGestionarObleas = (hab: Habilitacion) => {
    setSelectedHabilitacion(hab)
    setShowModal(true)
  }

  const handleAbrirGestionOblea = (oblea: Oblea) => {
    setObleaSeleccionada(oblea)
    setShowGestionModal(true)
  }

  // Funciones para selección masiva
  const toggleSeleccionOblea = (obleaId: number) => {
    setObleasSeleccionadas(prev => 
      prev.includes(obleaId) 
        ? prev.filter(id => id !== obleaId)
        : [...prev, obleaId]
    )
  }

  const toggleSeleccionarTodas = () => {
    if (seleccionarTodas) {
      setObleasSeleccionadas([])
    } else {
      setObleasSeleccionadas(obleasFiltradas.map(oblea => oblea.id))
    }
    setSeleccionarTodas(!seleccionarTodas)
  }

  const ejecutarAccionMasiva = async () => {
    if (!accionMasiva || obleasSeleccionadas.length === 0) return

    if (!confirm(`¿Estás seguro de aplicar "${accionMasiva}" a ${obleasSeleccionadas.length} obleas?`)) return

    setProcesandoMasivo(true)
    try {
      const response = await fetch('/api/obleas/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: accionMasiva,
          obleas_ids: obleasSeleccionadas
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await cargarDatos()
        setObleasSeleccionadas([])
        setSeleccionarTodas(false)
        alert(`✅ ${data.message}`)
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error en acción masiva:', error)
      alert('❌ Error al ejecutar acción masiva')
    } finally {
      setProcesandoMasivo(false)
    }
  }

  const exportarObleas = async (formato: string = 'csv') => {
    try {
      const params = new URLSearchParams({
        formato,
        busqueda: busqueda,
        ...filtros
      })
      
      const response = await fetch(`/api/obleas/export?${params}`)
      
      if (formato === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `obleas_export_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        console.log('Datos exportados:', data)
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      alert('❌ Error al exportar obleas')
    }
  }

  const aplicarFiltros = () => {
    cargarObleas()
  }

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      tipoTransporte: '',
      notificado: ''
    })
    setBusqueda('')
  }

  const getEstadoBadge = (notificado: string) => {
    return notificado === 'si' ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Notificada
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Pendiente
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Obleas
            </h1>
            <p className="text-gray-600">
              Generar certificados de entrega de obleas para habilitaciones activas
            </p>
          </div>
        </div>
      </div>

      {/* Información importante */}
      <Card className="p-4 bg-orange-50 border-orange-200">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">
              ℹ️ Información sobre Obleas
            </h3>
            <div className="text-sm text-orange-800 space-y-1">
              <p>• Solo habilitaciones con estado <strong>HABILITADO</strong> pueden generar obleas</p>
              <p>• El certificado PDF ocupa toda la hoja A4 para impresión profesional</p>
              <p>• Cada oblea queda registrada en el historial del sistema</p>
              <p>• El certificado debe ser firmado por el titular y el agente municipal</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Barra de búsqueda y herramientas */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por licencia, titular o dominio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button 
            onClick={() => exportarObleas('csv')} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button 
            onClick={cargarDatos} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Panel de filtros avanzados */}
        {mostrarFiltros && (
          <Card className="p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha Desde</label>
                <Input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha Hasta</label>
                <Input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo Transporte</label>
                <Select value={filtros.tipoTransporte} onValueChange={(value) => setFiltros(prev => ({ ...prev, tipoTransporte: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="Escolar">Escolar</SelectItem>
                    <SelectItem value="Remis">Remis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
                <Select value={filtros.notificado} onValueChange={(value) => setFiltros(prev => ({ ...prev, notificado: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="si">Notificadas</SelectItem>
                    <SelectItem value="no">Pendientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={aplicarFiltros} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Aplicar Filtros
              </Button>
              <Button onClick={limpiarFiltros} variant="outline">
                Limpiar
              </Button>
            </div>
          </Card>
        )}

        {/* Barra de acciones masivas */}
        {obleasSeleccionadas.length > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {obleasSeleccionadas.length} obleas seleccionadas
                </span>
                <Select value={accionMasiva} onValueChange={setAccionMasiva}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Seleccionar acción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marcar_notificadas">Marcar como Notificadas</SelectItem>
                    <SelectItem value="marcar_pendientes">Marcar como Pendientes</SelectItem>
                    <SelectItem value="eliminar_masivo">Eliminar Seleccionadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={ejecutarAccionMasiva} 
                  disabled={!accionMasiva || procesandoMasivo}
                  className="flex items-center gap-2"
                >
                  {procesandoMasivo ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Settings className="h-4 w-4" />
                  )}
                  Ejecutar
                </Button>
                <Button 
                  onClick={() => {
                    setObleasSeleccionadas([])
                    setSeleccionarTodas(false)
                  }} 
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Obleas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totales.total_obleas}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Notificadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totales.notificadas}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totales.no_notificadas}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sin Oblea</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totales.habilitaciones_sin_oblea}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Pestañas de administración */}
      <Tabs defaultValue="generar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generar" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generar Obleas
          </TabsTrigger>
          <TabsTrigger value="administrar" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Administrar Obleas
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* Pestaña: Generar Obleas */}
        <TabsContent value="generar">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Habilitaciones Disponibles para Obleas
              </h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : habilitacionesFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No se encontraron habilitaciones
                  </h3>
                  <p className="text-gray-500">
                    {busqueda ? 'Intenta con otro término de búsqueda' : 'No hay habilitaciones HABILITADAS disponibles'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {habilitacionesFiltradas.map((hab) => (
                    <div
                      key={hab.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Shield className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {hab.nro_licencia}
                            </h3>
                            <Badge className="bg-green-600 text-white">
                              HABILITADO
                            </Badge>
                            <Badge variant="outline">
                              {hab.tipo_transporte}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Titular: {hab.titular_principal || 'N/A'}
                          </p>
                          {hab.vigencia_fin && (
                            <p className="text-xs text-gray-500">
                              Vigencia hasta: {new Date(hab.vigencia_fin).toLocaleDateString('es-AR')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleGestionarObleas(hab)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Gestionar Obleas
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Pestaña: Administrar Obleas */}
        <TabsContent value="administrar">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Obleas Registradas en el Sistema
              </h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : obleasFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No se encontraron obleas
                  </h3>
                  <p className="text-gray-500">
                    {busqueda ? 'Intenta con otro término de búsqueda' : 'No hay obleas registradas en el sistema'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {obleasFiltradas.map((oblea) => (
                    <div
                      key={oblea.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              Oblea #{oblea.id}
                            </h3>
                            <Badge variant="outline">
                              {oblea.nro_licencia}
                            </Badge>
                            <Badge variant="outline">
                              {oblea.tipo_transporte}
                            </Badge>
                            {getEstadoBadge(oblea.notificado)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Titular: {oblea.titular} | Vehículo: {oblea.vehiculo_dominio}
                          </p>
                          <p className="text-xs text-gray-500">
                            Generada: {new Date(oblea.fecha_solicitud).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/obleas/${oblea.id}/pdf-historico`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Descargar certificado con evidencia disponible"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 hover:bg-red-100 text-red-600"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </a>
                        <Button
                          onClick={() => handleAbrirGestionOblea(oblea)}
                          variant="outline"
                          size="sm"
                          className="bg-blue-50 hover:bg-blue-100"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Gestionar
                        </Button>
                        <Button
                          onClick={() => eliminarOblea(oblea.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={eliminandoOblea === oblea.id}
                        >
                          {eliminandoOblea === oblea.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Pestaña: Estadísticas */}
        <TabsContent value="estadisticas">
          <div className="space-y-6">
            {stats && (
              <>
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Obleas Recientes
                  </h2>
                  <div className="space-y-3">
                    {stats.recientes.map((oblea) => (
                      <div key={oblea.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Oblea #{oblea.id}</span>
                            <Badge variant="outline">{oblea.nro_licencia}</Badge>
                            <Badge variant="outline">{oblea.tipo_transporte}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {oblea.titular} - {new Date(oblea.fecha).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                        {getEstadoBadge(oblea.notificado)}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Resumen del Sistema
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Total de Obleas</h3>
                      <p className="text-2xl font-bold text-blue-600">{stats.totales.total_obleas}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">Obleas Notificadas</h3>
                      <p className="text-2xl font-bold text-green-600">{stats.totales.notificadas}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-2">Pendientes de Notificar</h3>
                      <p className="text-2xl font-bold text-yellow-600">{stats.totales.no_notificadas}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-900 mb-2">Habilitaciones sin Oblea</h3>
                      <p className="text-2xl font-bold text-red-600">{stats.totales.habilitaciones_sin_oblea}</p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de obleas */}
      {selectedHabilitacion && (
        <ModalObleas
          habilitacionId={selectedHabilitacion.id}
          nroLicencia={selectedHabilitacion.nro_licencia}
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Modal de gestión de oblea */}
      <ModalGestionOblea
        oblea={obleaSeleccionada}
        open={showGestionModal}
        onClose={() => {
          setShowGestionModal(false)
          setObleaSeleccionada(null)
        }}
        onUpdate={cargarDatos}
      />
    </div>
  )
}
