'use client'

import { useState, useEffect } from 'react'
import { Shield, Search, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ModalObleas } from '@/components/obleas/modal-obleas'

interface Habilitacion {
  id: number
  nro_licencia: string
  estado: string
  tipo_transporte: string
  titular_principal: string
  vigencia_fin: string
}

/**
 * Página dedicada exclusivamente a la gestión de obleas
 * Plan B para acceso directo cuando el menú no funciona
 */
export default function ObleasPage() {
  const [habilitaciones, setHabilitaciones] = useState<Habilitacion[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [selectedHabilitacion, setSelectedHabilitacion] = useState<Habilitacion | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    cargarHabilitaciones()
  }, [])

  const cargarHabilitaciones = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/habilitaciones?estado=HABILITADO&limite=100')
      const data = await response.json()
      
      if (data.success) {
        setHabilitaciones(data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar habilitaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const habilitacionesFiltradas = habilitaciones.filter(hab =>
    hab.nro_licencia?.toLowerCase().includes(busqueda.toLowerCase()) ||
    hab.titular_principal?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleGestionarObleas = (hab: Habilitacion) => {
    setSelectedHabilitacion(hab)
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Obleas
            </h1>
            <p className="text-gray-600">
              Generar certificados de entrega de obleas para habilitaciones activas
            </p>
          </div>
        </div>
      </div>

      {/* Información importante */}
      <Card className="p-4 bg-orange-50 border-orange-200">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">
              ℹ️ Información sobre Obleas
            </h3>
            <div className="text-sm text-orange-800 space-y-1">
              <p>• Solo habilitaciones con estado <strong>HABILITADO</strong> pueden generar obleas</p>
              <p>• El certificado PDF ocupa toda la hoja A4 para impresión profesional</p>
              <p>• Cada oblea queda registrada en el historial del sistema</p>
              <p>• El certificado debe ser firmado por el titular y el agente municipal</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Búsqueda */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por número de licencia o titular..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={cargarHabilitaciones} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Habilitadas</p>
              <p className="text-2xl font-bold text-gray-900">{habilitaciones.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resultados</p>
              <p className="text-2xl font-bold text-gray-900">{habilitacionesFiltradas.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Download className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Listas para Obleas</p>
              <p className="text-2xl font-bold text-gray-900">{habilitacionesFiltradas.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de habilitaciones */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Habilitaciones Disponibles para Obleas
          </h2>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : habilitacionesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron habilitaciones
              </h3>
              <p className="text-gray-500">
                {busqueda ? 'Intenta con otro término de búsqueda' : 'No hay habilitaciones HABILITADAS disponibles'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {habilitacionesFiltradas.map((hab) => (
                <div
                  key={hab.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {hab.nro_licencia}
                        </h3>
                        <Badge className="bg-green-600 text-white">
                          HABILITADO
                        </Badge>
                        <Badge variant="outline">
                          {hab.tipo_transporte}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Titular: {hab.titular_principal || 'N/A'}
                      </p>
                      {hab.vigencia_fin && (
                        <p className="text-xs text-gray-500">
                          Vigencia hasta: {new Date(hab.vigencia_fin).toLocaleDateString('es-AR')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleGestionarObleas(hab)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Gestionar Obleas
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de obleas */}
      {selectedHabilitacion && (
        <ModalObleas
          habilitacionId={selectedHabilitacion.id}
          nroLicencia={selectedHabilitacion.nro_licencia}
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
