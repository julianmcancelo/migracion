'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { SearchBar } from './_components/search-bar'
import { HabilitacionesTable } from './_components/habilitaciones-table'
import { Pagination } from './_components/pagination'

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Habilitaciones</h1>
          <p className="mt-2 text-gray-600">
            Gestión de habilitaciones de transporte escolar y remis
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Habilitación
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tipoActivo} onValueChange={(v) => setTipoActivo(v as TipoTransporte)}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="Escolar">Escolar</TabsTrigger>
            <TabsTrigger value="Remis">Remis</TabsTrigger>
          </TabsList>

          {/* Búsqueda */}
          <div className="w-full sm:w-auto sm:min-w-[300px]">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Contenido tabs */}
        <TabsContent value="Escolar" className="mt-6">
          <div className="space-y-6">
            <HabilitacionesTable habilitaciones={habilitaciones} loading={loading} />
            
            {pagination && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  Mostrando {((pagination.pagina_actual - 1) * pagination.limite) + 1} - {Math.min(pagination.pagina_actual * pagination.limite, pagination.total)} de {pagination.total} resultados
                </div>
                <Pagination
                  currentPage={pagination.pagina_actual}
                  totalPages={pagination.total_paginas}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="Remis" className="mt-6">
          <div className="space-y-6">
            <HabilitacionesTable habilitaciones={habilitaciones} loading={loading} />
            
            {pagination && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  Mostrando {((pagination.pagina_actual - 1) * pagination.limite) + 1} - {Math.min(pagination.pagina_actual * pagination.limite, pagination.total)} de {pagination.total} resultados
                </div>
                <Pagination
                  currentPage={pagination.pagina_actual}
                  totalPages={pagination.total_paginas}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
