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
    <div className="space-y-6">
      {/* Header Minimalista */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Habilitaciones</h1>
          <p className="text-sm text-slate-600 mt-1">Gestión de transporte</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Nueva
        </Button>
      </div>

      {/* Stats Minimalistas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600">Habilitadas</p>
              <p className="text-2xl font-bold text-slate-900">{stats.habilitadas}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600">En Trámite</p>
              <p className="text-2xl font-bold text-slate-900">{stats.enTramite}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600">Por Vencer</p>
              <p className="text-2xl font-bold text-slate-900">{stats.porVencer}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Contenido Principal */}
      <Tabs value={tipoActivo} onValueChange={v => setTipoActivo(v as TipoTransporte)}>
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="Escolar" className="gap-2 data-[state=active]:bg-white">
                <Bus className="h-4 w-4" />
                Escolar
                {pagination && tipoActivo === 'Escolar' && (
                  <Badge variant="secondary" className="ml-1">{pagination.total}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="Remis" className="gap-2 data-[state=active]:bg-white">
                <Car className="h-4 w-4" />
                Remis
                {pagination && tipoActivo === 'Remis' && (
                  <Badge variant="secondary" className="ml-1">{pagination.total}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 max-w-md">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Buscar por licencia, DNI, nombre, dominio..."
              />
            </div>
          </div>

          <TabsContent value="Escolar" className="mt-0">
            {habilitaciones.length === 0 && !loading ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Bus className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Sin habilitaciones</h3>
                <p className="text-sm text-slate-600 mb-4">Aún no hay habilitaciones escolares registradas</p>
                <Button onClick={() => setModalOpen(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera
                </Button>
              </div>
            ) : (
              <HabilitacionesTable habilitaciones={habilitaciones} loading={loading} />
            )}

            {pagination && habilitaciones.length > 0 && (
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <p className="text-sm text-slate-600">
                  {(pagination.pagina_actual - 1) * pagination.limite + 1}-{Math.min(pagination.pagina_actual * pagination.limite, pagination.total)} de {pagination.total}
                </p>
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
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Car className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Sin habilitaciones</h3>
                <p className="text-sm text-slate-600 mb-4">Aún no hay habilitaciones de remis registradas</p>
                <Button onClick={() => setModalOpen(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera
                </Button>
              </div>
            ) : (
              <HabilitacionesTable habilitaciones={habilitaciones} loading={loading} />
            )}

            {pagination && habilitaciones.length > 0 && (
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <p className="text-sm text-slate-600">
                  {(pagination.pagina_actual - 1) * pagination.limite + 1}-{Math.min(pagination.pagina_actual * pagination.limite, pagination.total)} de {pagination.total}
                </p>
                <Pagination
                  currentPage={pagination.pagina_actual}
                  totalPages={pagination.total_paginas}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </TabsContent>
        </Card>
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
