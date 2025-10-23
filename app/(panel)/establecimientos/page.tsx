'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Search, Building2, Car as CarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'

// Importar mapa dinámicamente para evitar SSR
const MapaEstablecimientos = dynamic(
  () => import('./_components/mapa-establecimientos'),
  { ssr: false, loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg" /> }
)

interface Establecimiento {
  id: number
  nombre: string
  tipo: 'ESCUELA' | 'REMISERIA'
  direccion: string
  latitud: number | null
  longitud: number | null
  telefono: string | null
  email: string | null
  responsable: string | null
  activo: boolean
}

/**
 * Página de gestión de establecimientos
 * - Mapa interactivo con todos los establecimientos
 * - Click en marcador para ver detalles
 * - Click en mapa vacío para crear nuevo
 * - Búsqueda y filtros
 */
export default function EstablecimientosPage() {
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoFiltro, setTipoFiltro] = useState<'TODOS' | 'ESCUELA' | 'REMISERIA'>('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    escuelas: 0,
    remiserias: 0,
    activos: 0,
  })

  useEffect(() => {
    cargarEstablecimientos()
  }, [])

  const cargarEstablecimientos = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/establecimientos')
      const data = await response.json()

      if (data.success) {
        setEstablecimientos(data.data)
        
        // Calcular stats
        const escuelas = data.data.filter((e: Establecimiento) => e.tipo === 'ESCUELA').length
        const remiserias = data.data.filter((e: Establecimiento) => e.tipo === 'REMISERIA').length
        const activos = data.data.filter((e: Establecimiento) => e.activo).length

        setStats({
          total: data.data.length,
          escuelas,
          remiserias,
          activos,
        })
      }
    } catch (error) {
      console.error('Error al cargar establecimientos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar establecimientos
  const establecimientosFiltrados = establecimientos.filter(est => {
    const cumpleTipo = tipoFiltro === 'TODOS' || est.tipo === tipoFiltro
    const cumpleBusqueda = busqueda === '' || 
      est.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.direccion.toLowerCase().includes(busqueda.toLowerCase())
    
    return cumpleTipo && cumpleBusqueda
  })

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Establecimientos
          </h1>
          <p className="mt-2 text-gray-600">
            Gestione escuelas y remiserías en el mapa interactivo
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <MapPin className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Escuelas</p>
              <p className="text-3xl font-bold text-green-900">{stats.escuelas}</p>
            </div>
            <Building2 className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Remiserías</p>
              <p className="text-3xl font-bold text-purple-900">{stats.remiserias}</p>
            </div>
            <CarIcon className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Activos</p>
              <p className="text-3xl font-bold text-emerald-900">{stats.activos}</p>
            </div>
            <MapPin className="h-10 w-10 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Tabs de filtro */}
          <Tabs value={tipoFiltro} onValueChange={(v) => setTipoFiltro(v as any)}>
            <TabsList>
              <TabsTrigger value="TODOS">
                Todos
                <Badge className="ml-2 bg-blue-100 text-blue-700">
                  {stats.total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ESCUELA">
                <Building2 className="mr-2 h-4 w-4" />
                Escuelas
                <Badge className="ml-2 bg-green-100 text-green-700">
                  {stats.escuelas}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="REMISERIA">
                <CarIcon className="mr-2 h-4 w-4" />
                Remiserías
                <Badge className="ml-2 bg-purple-100 text-purple-700">
                  {stats.remiserias}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Búsqueda */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar por nombre o dirección..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mapa Interactivo */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mapa Interactivo</h2>
            <p className="text-sm text-gray-600">
              📍 Click en un marcador para ver detalles | ➕ Click en el mapa para agregar nuevo
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {establecimientosFiltrados.length} establecimiento{establecimientosFiltrados.length !== 1 ? 's' : ''} visible{establecimientosFiltrados.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {loading ? (
          <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-gray-400 animate-bounce mb-4" />
              <p className="text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        ) : (
          <MapaEstablecimientos
            establecimientos={establecimientosFiltrados}
            onEstablecimientoClick={(est) => console.log('Click en:', est)}
            onMapClick={(lat, lng) => console.log('Click en mapa:', lat, lng)}
            onRecargar={cargarEstablecimientos}
          />
        )}
      </div>
    </div>
  )
}
