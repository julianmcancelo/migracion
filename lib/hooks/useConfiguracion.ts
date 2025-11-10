import { useState, useEffect } from 'react'

export interface ConfiguracionApp {
  id: number
  titulo: string
  subtitulo?: string | null
  logo_base64?: string | null
  favicon_base64?: string | null
  color_primario?: string | null
  color_secundario?: string | null
  pie_pagina?: string | null
  actualizado_en: string
}

/**
 * Hook para obtener la configuración de la aplicación
 * Se carga automáticamente al montar el componente
 */
export function useConfiguracion() {
  const [config, setConfig] = useState<ConfiguracionApp | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/configuracion')
      const data = await response.json()

      if (data.success) {
        setConfig(data.data)
      } else {
        setError(data.error || 'Error al cargar configuración')
      }
    } catch (err) {
      console.error('Error al cargar configuración:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchConfig()
  }

  return {
    config,
    loading,
    error,
    refetch,
  }
}
