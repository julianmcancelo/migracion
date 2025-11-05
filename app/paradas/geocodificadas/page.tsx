'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Search, MapPin, AlertCircle, CheckCircle, XCircle, Navigation } from 'lucide-react'

// Importar mapa dinámicamente
const MapaGeocodificado = dynamic(
  () => import('@/components/paradas/MapaGeocodificado'),
  { ssr: false }
)

interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  } | null
  properties: {
    codigoParada: string
    calle: string
    altura: string
    localidad: string
    fullAddress: string
    formatted_address: string | null
    place_id: string | null
    accuracy: string | null
    status: string
    referencia?: string
  }
}

interface GeoJSON {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export default function ParadasGeocodificadasPage() {
  const [geojson, setGeojson] = useState<GeoJSON | null>(null)
  const [filteredFeatures, setFilteredFeatures] = useState<GeoJSONFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [accuracyFilter, setAccuracyFilter] = useState<string>('all')

  // Cargar GeoJSON
  useEffect(() => {
    loadGeoJSON()
  }, [])

  const loadGeoJSON = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/paradas/geocodificadas')
      
      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || 'Error al cargar paradas')
        return
      }

      const data = await response.json()
      setGeojson(data)
      setFilteredFeatures(data.features)
    } catch (error) {
      console.error('Error al cargar GeoJSON:', error)
      toast.error('Error al cargar paradas geocodificadas')
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    if (!geojson) return

    let filtered = geojson.features

    // Filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(f => 
        f.properties.codigoParada.toLowerCase().includes(term) ||
        f.properties.calle.toLowerCase().includes(term) ||
        f.properties.localidad.toLowerCase().includes(term) ||
        f.properties.fullAddress.toLowerCase().includes(term)
      )
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.properties.status === statusFilter)
    }

    // Filtro de accuracy
    if (accuracyFilter !== 'all') {
      filtered = filtered.filter(f => f.properties.accuracy === accuracyFilter)
    }

    setFilteredFeatures(filtered)
  }, [searchTerm, statusFilter, accuracyFilter, geojson])

  // Exportar GeoJSON filtrado
  const exportFiltered = () => {
    const filteredGeoJSON: GeoJSON = {
      type: 'FeatureCollection',
      features: filteredFeatures
    }

    const blob = new Blob([JSON.stringify(filteredGeoJSON, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `paradas_filtradas_${new Date().toISOString().split('T')[0]}.geojson`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('GeoJSON exportado')
  }

  // Estadísticas
  const stats = geojson ? {
    total: geojson.features.length,
    ok: geojson.features.filter(f => f.properties.status === 'OK' || f.properties.status === 'baja_precision').length,
    sinMatch: geojson.features.filter(f => f.properties.status === 'ZERO_RESULTS').length,
    insuficientes: geojson.features.filter(f => f.properties.status === 'insuficiente').length,
    errores: geojson.features.filter(f => f.properties.status.includes('ERROR')).length,
    conCoordenadas: geojson.features.filter(f => f.geometry !== null).length,
  } : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Cargando paradas geocodificadas...</p>
        </div>
      </div>
    )
  }

  if (!geojson) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No hay datos geocodificados</h2>
          <p className="text-gray-600 mb-4">
            Ejecuta el script de geocodificación primero:
          </p>
          <code className="bg-gray-100 px-4 py-2 rounded block mb-4 text-sm">
            npm run geocode
          </code>
          <Button onClick={loadGeoJSON} variant="outline">
            Reintentar
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-50">
      {/* Panel Lateral */}
      <aside className="w-full md:w-96 h-auto md:h-full overflow-y-auto bg-white border-r shadow-sm p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Paradas Geocodificadas
              </h1>
              <p className="text-sm text-gray-500">Google Maps Geocoding API</p>
            </div>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-medium uppercase">Total</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                  </div>
                  <MapPin className="text-blue-400 w-6 h-6" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-medium uppercase">Con Coords</p>
                    <p className="text-2xl font-bold text-green-900">{stats.conCoordenadas}</p>
                  </div>
                  <CheckCircle className="text-green-400 w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Desglose de Status */}
          {stats && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">Por Estado</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Geocodificadas OK
                  </span>
                  <span className="font-semibold text-gray-800">{stats.ok}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center gap-2">
                    <XCircle className="w-3 h-3 text-red-500" />
                    Sin Match
                  </span>
                  <span className="font-semibold text-gray-800">{stats.sinMatch}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    Datos Insuficientes
                  </span>
                  <span className="font-semibold text-gray-800">{stats.insuficientes}</span>
                </div>
                {stats.errores > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-orange-500" />
                      Errores
                    </span>
                    <span className="font-semibold text-gray-800">{stats.errores}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Código, calle, localidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Estado
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="OK">OK</SelectItem>
                <SelectItem value="baja_precision">Baja Precisión</SelectItem>
                <SelectItem value="ZERO_RESULTS">Sin Match</SelectItem>
                <SelectItem value="insuficiente">Datos Insuficientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Precisión
            </label>
            <Select value={accuracyFilter} onValueChange={setAccuracyFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="ROOFTOP">Exacta (ROOFTOP)</SelectItem>
                <SelectItem value="RANGE_INTERPOLATED">Interpolada</SelectItem>
                <SelectItem value="GEOMETRIC_CENTER">Centro Geométrico</SelectItem>
                <SelectItem value="APPROXIMATE">Aproximada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          <Button
            onClick={exportFiltered}
            variant="outline"
            className="w-full"
            disabled={filteredFeatures.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Filtro ({filteredFeatures.length})
          </Button>
          <Button
            onClick={loadGeoJSON}
            variant="outline"
            className="w-full"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Recargar Datos
          </Button>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            Mostrando <strong>{filteredFeatures.length}</strong> de{' '}
            <strong>{geojson.features.length}</strong> paradas
          </p>
        </div>
      </aside>

      {/* Mapa */}
      <main className="flex-1 h-[400px] md:h-full relative">
        <MapaGeocodificado features={filteredFeatures} />
      </main>
    </div>
  )
}
