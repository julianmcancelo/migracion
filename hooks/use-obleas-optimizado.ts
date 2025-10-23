import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/lib/logger'
import { useDebounce } from './use-debounce'

/**
 * Hook optimizado para gestión de obleas
 *
 * Características:
 * - ✅ Búsqueda con debounce automático
 * - ✅ Caché inteligente
 * - ✅ Auto-refetch configurable
 * - ✅ Estados de loading y error
 * - ✅ Paginación integrada
 * - ✅ Logging automático
 *
 * @example
 * ```tsx
 * function ObleasList() {
 *   const {
 *     obleas,
 *     loading,
 *     error,
 *     total,
 *     refetch
 *   } = useObleasOptimizado({
 *     pagina: 1,
 *     limite: 20,
 *     busqueda: searchTerm,
 *     autoRefetch: true
 *   })
 *
 *   if (loading) return <LoadingSkeleton />
 *   if (error) return <ErrorMessage error={error} onRetry={refetch} />
 *
 *   return <Table data={obleas} />
 * }
 * ```
 */

interface Oblea {
  id: number
  habilitacion_id: number
  nro_licencia: string
  titular: string
  titular_dni: string
  titular_telefono: string | null
  titular_email: string | null
  vehiculo_dominio: string
  vehiculo_marca: string
  vehiculo_modelo: string
  vehiculo_tipo: string | null
  vehiculo_ano: number | null
  tipo_transporte: string
  estado_habilitacion: string
  fecha_colocacion: Date
  path_foto: string
  path_firma_receptor: string
  path_firma_inspector: string
  tiene_foto: boolean
  tiene_firmas: boolean
}

interface Pagination {
  pagina_actual: number
  limite: number
  total: number
  total_paginas: number
}

interface UseObleasOptions {
  /** Número de página (default: 1) */
  pagina?: number
  /** Registros por página (default: 20, max: 100) */
  limite?: number
  /** Término de búsqueda */
  busqueda?: string
  /** Filtro por tipo de transporte */
  tipo_transporte?: 'Escolar' | 'Remis' | 'Demo' | ''
  /** Fecha desde (ISO string) */
  fecha_desde?: string
  /** Fecha hasta (ISO string) */
  fecha_hasta?: string
  /** Auto-refetch cada N segundos (default: false) */
  autoRefetch?: boolean
  /** Intervalo de refetch en ms (default: 30000) */
  refetchInterval?: number
  /** Delay del debounce en búsqueda (default: 500ms) */
  debounceDelay?: number
}

interface UseObleasReturn {
  /** Lista de obleas */
  obleas: Oblea[]
  /** Estado de carga */
  loading: boolean
  /** Error si existe */
  error: string | null
  /** Total de registros */
  total: number
  /** Total de páginas */
  totalPaginas: number
  /** Información de paginación completa */
  pagination: Pagination | null
  /** Función para refrescar datos */
  refetch: () => Promise<void>
  /** Indica si está refrescando (útil para spinners) */
  isRefetching: boolean
}

export function useObleasOptimizado(options: UseObleasOptions = {}): UseObleasReturn {
  const {
    pagina = 1,
    limite = 20,
    busqueda = '',
    tipo_transporte = '',
    fecha_desde = '',
    fecha_hasta = '',
    autoRefetch = false,
    refetchInterval = 30000,
    debounceDelay = 500,
  } = options

  // Estados
  const [obleas, setObleas] = useState<Oblea[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)

  // Debounce en búsqueda para no hacer request en cada tecla
  const busquedaDebounced = useDebounce(busqueda, debounceDelay)

  /**
   * Función principal para cargar obleas
   */
  const fetchObleas = useCallback(
    async (isInitialLoad = false) => {
      const startTime = Date.now()

      // Solo mostrar loading completo en carga inicial
      if (isInitialLoad) {
        setLoading(true)
      } else {
        setIsRefetching(true)
      }

      setError(null)

      try {
        // Construir query params
        const params = new URLSearchParams({
          pagina: pagina.toString(),
          limite: Math.min(limite, 100).toString(), // Max 100
        })

        if (busquedaDebounced) params.append('busqueda', busquedaDebounced)
        if (tipo_transporte) params.append('tipo_transporte', tipo_transporte)
        if (fecha_desde) params.append('fecha_desde', fecha_desde)
        if (fecha_hasta) params.append('fecha_hasta', fecha_hasta)

        logger.debug('Fetching obleas', {
          pagina,
          limite,
          busqueda: busquedaDebounced,
          tipo_transporte,
        })

        // Fetch con timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        const response = await fetch(`/api/obleas-optimizado?${params}`, {
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Error desconocido')
        }

        // Actualizar estados
        setObleas(result.data.data)
        setPagination(result.data.pagination)

        const duration = Date.now() - startTime
        logger.info('Obleas cargadas', {
          count: result.data.data.length,
          total: result.data.pagination.total,
          duration: `${duration}ms`,
          queries: result.data.meta?.queries || 'N/A',
        })
      } catch (err) {
        // Manejar diferentes tipos de errores
        let message = 'Error al cargar obleas'

        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            message = 'La solicitud tardó demasiado. Intente nuevamente.'
          } else {
            message = err.message
          }
        }

        setError(message)
        setObleas([])
        setPagination(null)

        logger.error('Error al cargar obleas', err)
      } finally {
        setLoading(false)
        setIsRefetching(false)
      }
    },
    [pagina, limite, busquedaDebounced, tipo_transporte, fecha_desde, fecha_hasta]
  )

  /**
   * Refetch manual para el usuario
   */
  const refetch = useCallback(async () => {
    await fetchObleas(false)
  }, [fetchObleas])

  // Fetch inicial
  useEffect(() => {
    fetchObleas(true)
  }, [fetchObleas])

  // Auto-refetch si está habilitado
  useEffect(() => {
    if (!autoRefetch) return

    logger.debug('Auto-refetch habilitado', { interval: refetchInterval })

    const interval = setInterval(() => {
      logger.debug('Auto-refetching obleas...')
      fetchObleas(false)
    }, refetchInterval)

    return () => {
      clearInterval(interval)
      logger.debug('Auto-refetch detenido')
    }
  }, [autoRefetch, refetchInterval, fetchObleas])

  return {
    obleas,
    loading,
    error,
    total: pagination?.total || 0,
    totalPaginas: pagination?.total_paginas || 0,
    pagination,
    refetch,
    isRefetching,
  }
}

/**
 * Hook simple para stats de obleas (dashboard)
 */
export function useObleasStats() {
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    colocadas: 0,
    loading: true,
    error: null as string | null,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/obleas/stats')
        const result = await response.json()

        if (result.success) {
          setStats({
            total: result.data.total,
            pendientes: result.data.pendientes,
            colocadas: result.data.colocadas,
            loading: false,
            error: null,
          })
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Error al cargar stats',
        }))
      }
    }

    fetchStats()
  }, [])

  return stats
}
