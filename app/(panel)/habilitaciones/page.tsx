'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Bus, Car, FileCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from './_components/search-bar'
import { HabilitacionesTable } from './_components/habilitaciones-table'
import { Pagination } from './_components/pagination'
import { NuevaHabilitacionDialog } from './_components/nueva-habilitacion-dialog'

type TipoTransporte = 'Escolar' | 'Remis'

interface PaginationData {
  pagina_actual: number
  limite: number
  total: number
  total_paginas: number
}

/**
 * Página de gestión de habilitaciones
 * - Tabs por tipo de transporte (Escolar/Remis)
 * - Búsqueda en tiempo real
 * - Paginación
 * - Tabla expandible
 */
export default function HabilitacionesPage() {
  const [tipoActivo, setTipoActivo] = useState<TipoTransporte>('Escolar')
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [habilitaciones, setHabilitaciones] = useState<any[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    habilitadas: 0,
    enTramite: 0,
    porVencer: 0,
  })

  // Cargar habilitaciones
  const cargarHabilitaciones = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        tipo: tipoActivo,
        buscar: busqueda,
        pagina: paginaActual.toString(),
        limite: '15',
      })

      const response = await fetch(`/api/habilitaciones?${params}`)
      const data = await response.json()

      if (data.success) {
        setHabilitaciones(data.data)
        setPagination(data.pagination)
        
        // Calcular stats
        const total = data.pagination.total
        const habilitadas = data.data.filter((h: any) => h.estado === 'HABILITADO').length
        const enTramite = data.data.filter((h: any) => h.estado === 'EN_TRAMITE' || h.estado === 'INICIADO').length
        setStats({
          total,
          habilitadas,
          enTramite,
          porVencer: 0, // TODO: calcular por fecha
        })
      }
    } catch (error) {
      console.error('Error al cargar habilitaciones:', error)
    } finally {
      setLoading(false)
    }
  }, [tipoActivo, busqueda, paginaActual])

  // Recargar cuando cambian los filtros
  useEffect(() => {
    cargarHabilitaciones()
  }, [cargarHabilitaciones])

  // Resetear página cuando cambian tipo o búsqueda
  useEffect(() => {
    setPaginaActual(1)
  }, [tipoActivo, busqueda])

  const handleSearch = (term: string) => {
    setBusqueda(term)
  }

  const handlePageChange = (page: number) => {
    setPaginaActual(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNuevaHabilitacionSuccess = () => {
    // Recargar lista después de crear
    cargarHabilitaciones()
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header moderno sin gradiente */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Habilitaciones</h1>
          <p className="mt-2 text-gray-600">
            Gestione habilitaciones de transporte escolar y remis de forma eficiente
          </p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)} 
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Habilitación
        </Button>
      </div>

      {/* Stats Cards con diseño moderno */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-bl-full"></div>
          <div className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FileCheck className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
          </div>
        </Card>

        {/* Habilitadas */}
        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-bl-full"></div>
          <div className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Habilitadas</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{stats.habilitadas}</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
          </div>
        </Card>

        {/* En Trámite */}
        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-bl-full"></div>
          <div className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">En Trámite</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{stats.enTramite}</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"></div>
          </div>
        </Card>

        {/* Por Vencer */}
        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-bl-full"></div>
          <div className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Por Vencer</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{stats.porVencer}</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
          </div>
        </Card>
      </div>

      {/* Tabs modernos */}
      <Tabs value={tipoActivo} onValueChange={(v) => setTipoActivo(v as TipoTransporte)}>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <TabsList className="bg-gray-100 p-1 h-12">
              <TabsTrigger 
                value="Escolar" 
                className="gap-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <Bus className="h-4 w-4" />
                Escolar
                {pagination && tipoActivo === 'Escolar' && (
                  <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {pagination.total}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="Remis" 
                className="gap-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <Car className="h-4 w-4" />
                Remis
                {pagination && tipoActivo === 'Remis' && (
                  <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {pagination.total}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Búsqueda */}
            <div className="w-full sm:w-auto sm:min-w-[350px]">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>

          {/* Contenido tabs */}
          <TabsContent value="Escolar" className="mt-0">
            {habilitaciones.length === 0 && !loading ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bus className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No hay habilitaciones escolares
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Comienza creando tu primera habilitación escolar para gestionar el transporte de manera eficiente
                </p>
                <Button 
                  onClick={() => setModalOpen(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Primera Habilitación
                </Button>
              </div>
            ) : (
              <HabilitacionesTable habilitaciones={habilitaciones} loading={loading} />
            )}
            
              {pagination && habilitaciones.length > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {((pagination.pagina_actual - 1) * pagination.limite) + 1} - {Math.min(pagination.pagina_actual * pagination.limite, pagination.total)} de {pagination.total}
                    </Badge>
                    <span className="text-gray-500">resultados</span>
                  </div>
                  <Pagination
                    currentPage={pagination.pagina_actual}
                    totalPages={pagination.total_paginas}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
        </TabsContent>

        <TabsContent value="Remis" className="mt-0">
            {habilitaciones.length === 0 && !loading ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Car className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No hay habilitaciones de remis
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Comienza creando tu primera habilitación de remis para gestionar el servicio de forma organizada
                </p>
                <Button 
                  onClick={() => setModalOpen(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Primera Habilitación
                </Button>
              </div>
            ) : (
              <HabilitacionesTable habilitaciones={habilitaciones} loading={loading} />
            )}
            
              {pagination && habilitaciones.length > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {((pagination.pagina_actual - 1) * pagination.limite) + 1} - {Math.min(pagination.pagina_actual * pagination.limite, pagination.total)} de {pagination.total}
                    </Badge>
                    <span className="text-gray-500">resultados</span>
                  </div>
                  <Pagination
                    currentPage={pagination.pagina_actual}
                    totalPages={pagination.total_paginas}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
        </TabsContent>
        </div>
      </Tabs>

      {/* Modal de Nueva Habilitación */}
      <NuevaHabilitacionDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleNuevaHabilitacionSuccess}
      />
    </div>
  )
}
