import { useState, useEffect, useCallback } from 'react'
import type { HabilitacionFormateada } from '@/lib/prisma-types'

/**
 * Hook para gestionar habilitaciones
 *
 * Maneja estado de carga, errores y revalidación automática
 *
 * @example
 * ```tsx
 * function HabilitacionesList() {
 *   const { habilitaciones, loading, error, refetch } = useHabilitaciones('Escolar')
 *
 *   if (loading) return <LoadingSkeleton />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return (
 *     <div>
 *       {habilitaciones.map(hab => <Card key={hab.id} data={hab} />)}
 *       <button onClick={refetch}>Recargar</button>
 *     </div>
 *   )
 * }
 * ```
 */

interface UseHabilitacionesOptions {
  tipo?: 'Escolar' | 'Remis' | 'Demo'
  buscar?: string
  pagina?: number
  limite?: number
  autoRefetch?: boolean
  refetchInterval?: number
}

interface UseHabilitacionesReturn {
  habilitaciones: HabilitacionFormateada[]
  loading: boolean
  error: string | null
  total: number
  totalPaginas: number
  refetch: () => Promise<void>
}

export function useHabilitaciones(options: UseHabilitacionesOptions = {}): UseHabilitacionesReturn {
  const {
    tipo = 'Escolar',
    buscar = '',
    pagina = 1,
    limite = 15,
    autoRefetch = false,
    refetchInterval = 30000, // 30 segundos
  } = options

  const [habilitaciones, setHabilitaciones] = useState<HabilitacionFormateada[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)

  const fetchHabilitaciones = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        tipo,
        pagina: pagina.toString(),
        limite: limite.toString(),
      })

      if (buscar) {
        params.append('buscar', buscar)
      }

      const response = await fetch(`/api/habilitaciones?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar habilitaciones')
      }

      if (result.success) {
        setHabilitaciones(result.data.data || result.data)
        setTotal(result.data.pagination?.total || 0)
        setTotalPaginas(result.data.pagination?.total_paginas || 0)
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos'
      setError(message)
      setHabilitaciones([])
    } finally {
      setLoading(false)
    }
  }, [tipo, buscar, pagina, limite])

  // Fetch inicial
  useEffect(() => {
    fetchHabilitaciones()
  }, [fetchHabilitaciones])

  // Auto-refetch opcional
  useEffect(() => {
    if (!autoRefetch) return

    const interval = setInterval(() => {
      fetchHabilitaciones()
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [autoRefetch, refetchInterval, fetchHabilitaciones])

  return {
    habilitaciones,
    loading,
    error,
    total,
    totalPaginas,
    refetch: fetchHabilitaciones,
  }
}
