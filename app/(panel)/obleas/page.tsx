'use client'

import { useState } from 'react'
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
}

/**
 * Página simplificada de certificados de obleas
 * Solo permite buscar habilitaciones y descargar el certificado PDF
 */
export default function ObleasPage() {
  const [busqueda, setBusqueda] = useState('')
  const [habilitaciones, setHabilitaciones] = useState<Habilitacion[]>([])
  const [loading, setLoading] = useState(false)
  const [buscado, setBuscado] = useState(false)

  const buscarHabilitaciones = async () => {
    if (!busqueda.trim()) {
      alert('Por favor ingresa un número de licencia, dominio o DNI')
      return
    }

    setLoading(true)
    setBuscado(true)

    try {
      const response = await fetch(
        `/api/habilitaciones?busqueda=${encodeURIComponent(busqueda)}&estado=ACTIVA`
      )
      const data = await response.json()

      if (data.success) {
        setHabilitaciones(data.data || [])
      } else {
        setHabilitaciones([])
      }
    } catch (error) {
      console.error('Error al buscar:', error)
      alert('Error al buscar habilitaciones')
      setHabilitaciones([])
    } finally {
      setLoading(false)
    }
  }

  const descargarCertificado = (habilitacionId: number, nroLicencia: string) => {
    // Abrir en nueva pestaña para descargar el PDF
    window.open(`/api/obleas/${habilitacionId}/certificado`, '_blank')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      buscarHabilitaciones()
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
              Busca una habilitación y descarga su certificado de oblea
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Buscar por N° Licencia, Dominio o DNI
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ej: 2024/123, ABC123, 12345678"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={buscarHabilitaciones}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </div>

        {/* Información */}
        <div className="mt-3 rounded-lg bg-blue-50 p-3">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Instrucción:</strong> El certificado de oblea es para verificación holográfica.
            Ingresa el número de licencia, dominio del vehículo o DNI del titular para buscar.
          </p>
        </div>
      </div>

      {/* Resultados */}
      {buscado && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Buscando habilitaciones...</div>
          ) : habilitaciones.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="mx-auto mb-2 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">
                No se encontraron habilitaciones activas
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Intenta con otro número de licencia, dominio o DNI
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {habilitaciones.map((hab) => (
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
                    Descargar Certificado
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ayuda */}
      {!buscado && (
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
