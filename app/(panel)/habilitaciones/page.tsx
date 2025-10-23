'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
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
 * - Búsqueda inteligente en tiempo real
 * - Paginación
 * - Tabla expandible
 */
export default function HabilitacionesPage() {
  const searchParams = useSearchParams()
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

  // Leer búsqueda de URL al cargar
  useEffect(() => {
    const buscarParam = searchParams.get('buscar')
    if (buscarParam) {
      setBusqueda(buscarParam)
    }
  }, [searchParams])

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
        const enTramite = data.data.filter(
          (h: any) => h.estado === 'EN_TRAMITE' || h.estado === 'INICIADO'
        ).length
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header moderno sin gradiente */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">Habilitaciones</h1>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Gestione habilitaciones de transporte escolar y remis de forma eficiente
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          size="lg"
          className="w-full bg-blue-600 text-sm text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl sm:w-auto sm:text-base"
        >
          <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Nueva Habilitación
        </Button>
      </div>

      {/* Stats Cards con diseño moderno */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {/* Total */}
        <Card className="group relative cursor-pointer overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-blue-500/10 to-blue-600/5 sm:h-28 sm:w-28 lg:h-32 lg:w-32"></div>
          <div className="relative p-4 sm:p-5 lg:p-6">
            <div className="mb-2 flex items-center justify-between sm:mb-3 lg:mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-transform group-hover:scale-110 sm:h-12 sm:w-12 lg:h-14 lg:w-14 lg:rounded-2xl">
                <FileCheck className="h-5 w-5 text-white sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs lg:text-sm">Total</p>
                <p className="mt-0.5 text-2xl font-bold text-gray-900 sm:text-3xl lg:mt-1 lg:text-4xl">{stats.total}</p>
              </div>
            </div>
            <div className="h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 sm:h-1"></div>
          </div>
        </Card>

        {/* Habilitadas */}
        <Card className="group relative cursor-pointer overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-green-500/10 to-green-600/5 sm:h-28 sm:w-28 lg:h-32 lg:w-32"></div>
          <div className="relative p-4 sm:p-5 lg:p-6">
            <div className="mb-2 flex items-center justify-between sm:mb-3 lg:mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-transform group-hover:scale-110 sm:h-12 sm:w-12 lg:h-14 lg:w-14 lg:rounded-2xl">
                <CheckCircle2 className="h-5 w-5 text-white sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs lg:text-sm">
                  Habilitadas
                </p>
                <p className="mt-0.5 text-2xl font-bold text-gray-900 sm:text-3xl lg:mt-1 lg:text-4xl">{stats.habilitadas}</p>
              </div>
            </div>
            <div className="h-0.5 rounded-full bg-gradient-to-r from-green-500 to-green-600 sm:h-1"></div>
          </div>
        </Card>

        {/* En Trámite */}
        <Card className="group relative cursor-pointer overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-amber-500/10 to-amber-600/5 sm:h-28 sm:w-28 lg:h-32 lg:w-32"></div>
          <div className="relative p-4 sm:p-5 lg:p-6">
            <div className="mb-2 flex items-center justify-between sm:mb-3 lg:mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg transition-transform group-hover:scale-110 sm:h-12 sm:w-12 lg:h-14 lg:w-14 lg:rounded-2xl">
                <Clock className="h-5 w-5 text-white sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs lg:text-sm">
                  En Trámite
                </p>
                <p className="mt-0.5 text-2xl font-bold text-gray-900 sm:text-3xl lg:mt-1 lg:text-4xl">{stats.enTramite}</p>
              </div>
            </div>
            <div className="h-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 sm:h-1"></div>
          </div>
        </Card>

        {/* Por Vencer */}
        <Card className="group relative cursor-pointer overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-orange-500/10 to-orange-600/5 sm:h-28 sm:w-28 lg:h-32 lg:w-32"></div>
          <div className="relative p-4 sm:p-5 lg:p-6">
            <div className="mb-2 flex items-center justify-between sm:mb-3 lg:mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg transition-transform group-hover:scale-110 sm:h-12 sm:w-12 lg:h-14 lg:w-14 lg:rounded-2xl">
                <AlertCircle className="h-5 w-5 text-white sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs lg:text-sm">
                  Por Vencer
                </p>
                <p className="mt-0.5 text-2xl font-bold text-gray-900 sm:text-3xl lg:mt-1 lg:text-4xl">{stats.porVencer}</p>
              </div>
            </div>
            <div className="h-0.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 sm:h-1"></div>
          </div>
        </Card>
      </div>

      {/* Tabs modernos */}
      <Tabs value={tipoActivo} onValueChange={v => setTipoActivo(v as TipoTransporte)}>
        <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
            <TabsList className="h-10 w-full bg-gray-100 p-1 sm:h-12 sm:w-auto">
              <TabsTrigger
                value="Escolar"
                className="flex-1 gap-1.5 px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-md sm:flex-none sm:gap-2 sm:px-6 sm:text-sm"
              >
                <Bus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Escolar</span>
                {pagination && tipoActivo === 'Escolar' && (
                  <Badge className="ml-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-100 sm:ml-2">
                    {pagination.total}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="Remis"
                className="flex-1 gap-1.5 px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-md sm:flex-none sm:gap-2 sm:px-6 sm:text-sm"
              >
                <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Remis</span>
                {pagination && tipoActivo === 'Remis' && (
                  <Badge className="ml-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-100 sm:ml-2">
                    {pagination.total}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Búsqueda Inteligente */}
            <div className="w-full sm:min-w-[300px] lg:min-w-[400px]">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="🔍 Buscar por licencia, DNI, nombre, dominio, expediente..."
              />
            </div>
          </div>

          {/* Contenido tabs */}
          <TabsContent value="Escolar" className="mt-0">
            {habilitaciones.length === 0 && !loading ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50">
                  <Bus className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  No hay habilitaciones escolares
                </h3>
                <p className="mx-auto mb-8 max-w-md text-gray-600">
                  Comienza creando tu primera habilitación escolar para gestionar el transporte de
                  manera eficiente
                </p>
                <Button
                  onClick={() => setModalOpen(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Crear Primera Habilitación
                </Button>
              </div>
            ) : (
              <HabilitacionesTable habilitaciones={habilitaciones} loading={loading} />
            )}

            {pagination && habilitaciones.length > 0 && (
              <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {(pagination.pagina_actual - 1) * pagination.limite + 1} -{' '}
                    {Math.min(pagination.pagina_actual * pagination.limite, pagination.total)} de{' '}
                    {pagination.total}
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
              <div className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50">
                  <Car className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  No hay habilitaciones de remis
                </h3>
                <p className="mx-auto mb-8 max-w-md text-gray-600">
                  Comienza creando tu primera habilitación de remis para gestionar el servicio de
                  forma organizada
                </p>
                <Button
                  onClick={() => setModalOpen(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Crear Primera Habilitación
                </Button>
              </div>
            ) : (
              <HabilitacionesTable habilitaciones={habilitaciones} loading={loading} />
            )}

            {pagination && habilitaciones.length > 0 && (
              <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {(pagination.pagina_actual - 1) * pagination.limite + 1} -{' '}
                    {Math.min(pagination.pagina_actual * pagination.limite, pagination.total)} de{' '}
                    {pagination.total}
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
