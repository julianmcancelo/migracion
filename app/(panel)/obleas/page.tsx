'use client'

import { useState, useEffect } from 'react'
import { Shield, Search, Download, FileCheck2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Habilitacion {
  id: number
  nro_licencia: string
  tipo_transporte: string
  estado: string
  titular_nombre: string
  titular_dni: string
  vehiculo_dominio: string
  vehiculo_marca: string
  vehiculo_modelo: string
  vigencia_fin: string
  oblea_colocada: boolean
}

/**
 * Página simplificada de certificados de obleas
 * Solo permite buscar habilitaciones y descargar el certificado PDF
 */
export default function ObleasPage() {
  const [busqueda, setBusqueda] = useState('')
  const [todasHabilitaciones, setTodasHabilitaciones] = useState<Habilitacion[]>([])
  const [habilitacionesFiltradas, setHabilitacionesFiltradas] = useState<Habilitacion[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar todas las habilitaciones al montar el componente
  useEffect(() => {
    cargarTodasHabilitaciones()
  }, [])

  // Filtrar habilitaciones cuando cambia el texto de búsqueda
  useEffect(() => {
    filtrarHabilitaciones()
  }, [busqueda, todasHabilitaciones])

  const cargarTodasHabilitaciones = async () => {
    setLoading(true)

    try {
      // Cargar habilitaciones relevantes para certificados desde el endpoint de pendientes
      const response = await fetch('/api/obleas/pendientes?limite=500')
      const data = await response.json()

      console.log('📊 Datos de habilitaciones para certificados recibidos:', data)
      console.log('📊 data.success:', data.success)
      console.log('📊 data.data length:', data.data?.length)
      console.log('📊 Primera oblea:', data.data?.[0])

      if (data.status === 'success' && data.data) {
        // Mapear los datos de habilitaciones (pendientes) al formato de la pantalla
        const habilitaciones = data.data.map((hab: any) => ({
          id: hab.id,
          nro_licencia: hab.nro_licencia || 'S/N',
          tipo_transporte: hab.tipo_transporte || 'N/A',
          estado: hab.estado || 'N/A',
          titular_nombre: hab.titular?.nombre || 'Sin titular',
          titular_dni: hab.titular?.dni || 'N/A',
          vehiculo_dominio: hab.vehiculo?.dominio || 'N/A',
          vehiculo_marca: hab.vehiculo?.marca || '',
          vehiculo_modelo: hab.vehiculo?.modelo || '',
          vigencia_fin: hab.vigencia_fin || 'N/A',
          oblea_colocada: Boolean(hab.oblea_colocada),
        }))

        console.log('✅ Habilitaciones cargadas para certificados:', habilitaciones.length)
        setTodasHabilitaciones(habilitaciones)
        setHabilitacionesFiltradas(habilitaciones)
      } else {
        console.warn('⚠️ No se encontraron habilitaciones para certificados')
        setTodasHabilitaciones([])
        setHabilitacionesFiltradas([])
      }
    } catch (error) {
      console.error('❌ Error al cargar habilitaciones para certificados:', error)
      alert('Error al cargar habilitaciones para certificados')
    } finally {
      setLoading(false)
    }
  }

  const filtrarHabilitaciones = () => {
    if (!busqueda.trim()) {
      setHabilitacionesFiltradas(todasHabilitaciones)
      return
    }

    const busquedaLower = busqueda.toLowerCase()
    const filtradas = todasHabilitaciones.filter((hab) => {
      return (
        hab.nro_licencia.toLowerCase().includes(busquedaLower) ||
        hab.titular_nombre.toLowerCase().includes(busquedaLower) ||
        hab.titular_dni.includes(busqueda) ||
        hab.vehiculo_dominio.toLowerCase().includes(busquedaLower) ||
        hab.tipo_transporte.toLowerCase().includes(busquedaLower)
      )
    })

    setHabilitacionesFiltradas(filtradas)
  }

  const descargarCertificado = (habilitacionId: number, nroLicencia: string) => {
    console.log('🎫 Descargando certificado para:', { habilitacionId, nroLicencia })
    
    // Abrir en nueva pestaña para descargar el PDF
    const url = `/api/obleas/${habilitacionId}/certificado`
    console.log('📄 URL del certificado:', url)
    
    const newWindow = window.open(url, '_blank')
    
    if (!newWindow) {
      alert('Por favor permite las ventanas emergentes para descargar el certificado')
    }
  }


  return (
    <div className="space-y-4">
      {/* Header Simplificado */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <FileCheck2 className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Certificados de Obleas
            </h1>
            <p className="text-sm text-gray-500">
              Habilitaciones con obleas colocadas - Descarga certificados
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Buscar por N° Licencia, Dominio, DNI o Titular
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Filtrar habilitaciones activas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        {/* Información */}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-blue-50 p-3">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Total:</strong> {habilitacionesFiltradas.length} habilitaciones con obleas
            {busqueda && ` (filtradas de ${todasHabilitaciones.length})`}
          </p>
        </div>
      </div>

      {/* Resultados */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            Cargando habilitaciones con obleas...
          </div>
        ) : habilitacionesFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="mx-auto mb-2 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">
              {busqueda ? 'No se encontraron resultados' : 'No hay obleas registradas'}
            </p>
            {busqueda && (
              <p className="mt-1 text-sm text-gray-400">
                Intenta con otro término de búsqueda
              </p>
            )}
            {!busqueda && (
              <p className="mt-1 text-sm text-gray-400">
                Las obleas se generan cuando se coloca una oblea en un vehículo
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {habilitacionesFiltradas.map((hab: Habilitacion) => (
              <div
                key={hab.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-blue-600">
                          {hab.nro_licencia}
                        </span>
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          {hab.estado}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            hab.oblea_colocada
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {hab.oblea_colocada ? 'Oblea colocada' : 'Pendiente de oblea'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{hab.titular_nombre}</p>
                      <div className="mt-1 flex gap-4 text-xs text-gray-500">
                        <span>DNI: {hab.titular_dni}</span>
                        <span>•</span>
                        <span>Dominio: <strong>{hab.vehiculo_dominio}</strong></span>
                        <span>•</span>
                        <span>{hab.tipo_transporte}</span>
                      </div>
                      {hab.vehiculo_marca && (
                        <p className="mt-1 text-xs text-gray-500">
                          {hab.vehiculo_marca} {hab.vehiculo_modelo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => descargarCertificado(hab.id, hab.nro_licencia)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {hab.oblea_colocada ? 'Consultar Oblea' : 'Descargar Certificado'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ayuda */}
      {todasHabilitaciones.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold text-gray-900">¿Qué es el certificado de oblea?</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Documento que certifica la entrega de la oblea de habilitación</li>
            <li>• Se utiliza para verificación holográfica del vehículo</li>
            <li>• Debe exhibirse junto con la oblea en el vehículo</li>
            <li>• Válido solo para habilitaciones activas</li>
          </ul>
        </div>
      )}
    </div>
  )
}
