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
    <div className="space-y-6">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white shadow-lg">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Habilitaciones</h1>
            <p className="mt-2 text-blue-100 text-lg">
              Gestión de habilitaciones de transporte escolar y remis
            </p>
          </div>
          <Button 
            onClick={() => setModalOpen(true)} 
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Habilitación
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Habilitadas</p>
              <p className="text-3xl font-bold text-green-600">{stats.habilitadas}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Trámite</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.enTramite}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Por Vencer</p>
              <p className="text-3xl font-bold text-orange-600">{stats.porVencer}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs con iconos y badges */}
      <Tabs value={tipoActivo} onValueChange={(v) => setTipoActivo(v as TipoTransporte)}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="Escolar" className="gap-2">
              <Bus className="h-4 w-4" />
              Escolar
              {pagination && tipoActivo === 'Escolar' && (
                <Badge variant="secondary" className="ml-2">
                  {pagination.total}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="Remis" className="gap-2">
              <Car className="h-4 w-4" />
              Remis
              {pagination && tipoActivo === 'Remis' && (
                <Badge variant="secondary" className="ml-2">
                  {pagination.total}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Búsqueda */}
          <div className="w-full sm:w-auto sm:min-w-[300px]">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Contenido tabs */}
        <TabsContent value="Escolar" className="mt-6">
          <Card className="p-6">
            <div className="space-y-6">
              {habilitaciones.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <Bus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay habilitaciones escolares
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Comienza creando tu primera habilitación escolar
                  </p>
                  <Button onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Habilitación
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
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="Remis" className="mt-6">
          <Card className="p-6">
            <div className="space-y-6">
              {habilitaciones.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay habilitaciones de remis
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Comienza creando tu primera habilitación de remis
                  </p>
                  <Button onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Habilitación
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
            </div>
          </Card>
        </TabsContent>
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
