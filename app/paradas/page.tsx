'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import MapaLeafletMejorado from '@/components/paradas/MapaLeafletMejorado'
import FormularioParada from '@/components/paradas/FormularioParada'
import { Parada, ParadaFormData, TIPOS_PARADA } from '@/components/paradas/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search, MapPin, LogIn, Navigation, X } from 'lucide-react'

export default function ParadasPage() {
  const router = useRouter()
  const [paradas, setParadas] = useState<Parada[]>([])
  const [loading, setLoading] = useState(true)
  const [editingParada, setEditingParada] = useState<Parada | null>(null)
  const [deletingParada, setDeletingParada] = useState<Parada | null>(null)
  const [clickedLat, setClickedLat] = useState<number>()
  const [clickedLng, setClickedLng] = useState<number>()
  // Coordenadas actuales de la parada en edición (actualizadas al arrastrar)
  const [editingLat, setEditingLat] = useState<number>()
  const [editingLng, setEditingLng] = useState<number>()
  // Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginBanner, setShowLoginBanner] = useState(false)
  // Búsqueda de paradas
  const [searchAddress, setSearchAddress] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Parada[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  // Paradas cercanas
  const [nearbyParadas, setNearbyParadas] = useState<Parada[]>([])
  const [showNearby, setShowNearby] = useState(false)
  const [nearbyCenter, setNearbyCenter] = useState<{lat: number, lng: number} | null>(null)
  // Filtro activo de paradas en el mapa
  const [filteredParadas, setFilteredParadas] = useState<Parada[]>([])
  const [isFiltered, setIsFiltered] = useState(false)

  // Verificar autenticación al montar
  useEffect(() => {
    verificarSesion()
    cargarParadas()
  }, [])

  const verificarSesion = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        // Mostrar banner después de 2 segundos
        setTimeout(() => setShowLoginBanner(true), 2000)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setTimeout(() => setShowLoginBanner(true), 2000)
    }
  }

  const cargarParadas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/paradas')
      const data = await response.json()

      if (data.success) {
        setParadas(data.data)
      } else {
        toast.error('Error al cargar paradas')
      }
    } catch (error) {
      console.error('Error al cargar paradas:', error)
      toast.error('Error al cargar paradas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: ParadaFormData) => {
    try {
      let response

      if (editingParada) {
        // Actualizar parada existente
        response = await fetch(`/api/paradas/${editingParada.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        // Crear nueva parada
        response = await fetch('/api/paradas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      const data = await response.json()

      if (data.success) {
        toast.success(
          editingParada
            ? 'Parada actualizada exitosamente'
            : 'Parada creada exitosamente'
        )
        setEditingParada(null)
        cargarParadas()
      } else {
        toast.error(data.error || 'Error al guardar parada')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar parada')
    }
  }

  const handleDelete = async () => {
    if (!deletingParada) return

    try {
      const response = await fetch(`/api/paradas/${deletingParada.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Parada eliminada exitosamente')
        setDeletingParada(null)
        cargarParadas()
      } else {
        toast.error(data.error || 'Error al eliminar parada')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar parada')
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    if (!editingParada) {
      setClickedLat(lat)
      setClickedLng(lng)
    }
  }

  const handleEditClick = (parada: Parada) => {
    setEditingParada(parada)
    // Establecer coordenadas iniciales de edición
    setEditingLat(parada.latitud)
    setEditingLng(parada.longitud)
    // Scroll al formulario en móvil
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCancelEdit = () => {
    setEditingParada(null)
    setEditingLat(undefined)
    setEditingLng(undefined)
  }

  const handleMarkerDragEnd = (paradaId: number, lat: number, lng: number) => {
    // Actualizar coordenadas de edición cuando se arrastra el marcador
    setEditingLat(lat)
    setEditingLng(lng)
    toast.info('📍 Ubicación actualizada. Guarda los cambios para confirmar.')
  }

  const handleCoordinatesChange = (lat: number, lng: number) => {
    // Actualizar coordenadas cuando se usa geocodificación
    setEditingLat(lat)
    setEditingLng(lng)
  }

  // Limpiar filtros y mostrar todas las paradas
  const handleClearFilters = () => {
    setFilteredParadas([])
    setIsFiltered(false)
    setSearchResults([])
    setShowSearchResults(false)
    setNearbyParadas([])
    setShowNearby(false)
    setSearchAddress('')
    toast.success('Mostrando todas las paradas')
  }

  // Buscar paradas por dirección
  const handleSearchParadas = async () => {
    if (!searchAddress.trim()) {
      toast.error('Escribe una dirección para buscar')
      return
    }

    setSearching(true)
    setSearchResults([])

    try {
      // Primero geocodificar la dirección
      const geocodeResponse = await fetch('/api/paradas/geocode-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: searchAddress }),
      })

      const geocodeData = await geocodeResponse.json()

      if (geocodeData.success) {
        // Buscar paradas cercanas a esas coordenadas
        const lat = geocodeData.lat
        const lng = geocodeData.lng
        
        const nearby = findNearbyParadas(lat, lng, 1) // 1 km de radio
        
        if (nearby.length > 0) {
          setSearchResults(nearby)
          setShowSearchResults(true)
          // Filtrar mapa para mostrar solo estas paradas
          setFilteredParadas(nearby)
          setIsFiltered(true)
          toast.success(`${nearby.length} parada(s) encontrada(s) cerca de ${geocodeData.formatted_address}`)
        } else {
          toast.info('No se encontraron paradas cerca de esta dirección')
          setFilteredParadas([])
          setIsFiltered(false)
        }
      } else {
        toast.error('No se encontró la dirección')
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      toast.error('Error al buscar paradas')
    } finally {
      setSearching(false)
    }
  }

  // Encontrar paradas cercanas
  const findNearbyParadas = (lat: number, lng: number, radiusKm: number = 0.5): Parada[] => {
    return paradas.filter(parada => {
      const distance = calculateDistance(lat, lng, parada.latitud, parada.longitud)
      return distance <= radiusKm && parada.activo
    }).sort((a, b) => {
      const distA = calculateDistance(lat, lng, a.latitud, a.longitud)
      const distB = calculateDistance(lat, lng, b.latitud, b.longitud)
      return distA - distB
    })
  }

  // Calcular distancia entre dos puntos (fórmula Haversine)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Mostrar paradas cercanas a mi ubicación
  const handleShowNearby = () => {
    if (navigator.geolocation) {
      setShowNearby(false)
      toast.info('Obteniendo tu ubicación...')
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          const nearby = findNearbyParadas(lat, lng, 2) // 2 km de radio
          
          if (nearby.length > 0) {
            setNearbyParadas(nearby)
            setNearbyCenter({ lat, lng })
            setShowNearby(true)
            // Filtrar mapa para mostrar solo paradas cercanas
            setFilteredParadas(nearby)
            setIsFiltered(true)
            toast.success(`${nearby.length} parada(s) cercana(s) a tu ubicación`)
          } else {
            toast.info('No se encontraron paradas cerca de tu ubicación')
            setFilteredParadas([])
            setIsFiltered(false)
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
          toast.error('No se pudo obtener tu ubicación. Verifica los permisos del navegador.')
        }
      )
    } else {
      toast.error('Tu navegador no soporta geolocalización')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-50">
      {/* Panel Lateral - Formulario */}
      <aside className="w-full md:w-96 h-auto md:h-full overflow-y-auto bg-white border-r shadow-sm p-4">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-map-location-dot text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Mapa de Lanús
              </h1>
              <p className="text-sm text-gray-500">Sistema de Puntos de Interés</p>
            </div>
          </div>

          {/* Banner de Login */}
          {showLoginBanner && !isAuthenticated && (
            <Card className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <LogIn className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-1">
                      ¿Quieres gestionar paradas?
                    </h3>
                    <p className="text-sm text-amber-700 mb-3">
                      Inicia sesión para crear, editar y eliminar puntos de interés en el mapa
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => router.push('/login')}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Iniciar Sesión
                      </Button>
                      <Button
                        onClick={() => setShowLoginBanner(false)}
                        size="sm"
                        variant="outline"
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLoginBanner(false)}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Búsqueda de Paradas por Dirección */}
          <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-purple-900">Buscar Paradas por Dirección</h3>
            </div>
            <div className="flex gap-2 mb-3">
              <Input
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Ej: Av. Hipólito Yrigoyen 5650"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearchParadas()
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSearchParadas}
                disabled={searching}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {searching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleShowNearby}
                size="sm"
                variant="outline"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Ver Paradas Cercanas a Mi Ubicación
              </Button>
              
              {/* Botón para limpiar filtros */}
              {isFiltered && (
                <Button
                  onClick={handleClearFilters}
                  size="sm"
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Mostrar Todas las Paradas ({paradas.length})
                </Button>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-purple-900">
                    {searchResults.length} resultado(s) encontrado(s)
                  </p>
                  <button
                    onClick={() => setShowSearchResults(false)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {searchResults.map((parada) => (
                    <button
                      key={parada.id}
                      onClick={() => {
                        handleEditClick(parada)
                        setShowSearchResults(false)
                      }}
                      className="w-full text-left p-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <i
                          className={`fa-solid fa-${TIPOS_PARADA[parada.tipo]?.icon || 'map-pin'} text-sm mt-1`}
                          style={{ color: TIPOS_PARADA[parada.tipo]?.color }}
                        ></i>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {parada.titulo}
                          </p>
                          <p className="text-xs text-gray-500">
                            {TIPOS_PARADA[parada.tipo]?.label}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Paradas cercanas */}
            {showNearby && nearbyParadas.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-purple-900">
                    {nearbyParadas.length} parada(s) cercana(s)
                  </p>
                  <button
                    onClick={() => setShowNearby(false)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {nearbyParadas.map((parada) => {
                    const distance = nearbyCenter 
                      ? calculateDistance(nearbyCenter.lat, nearbyCenter.lng, parada.latitud, parada.longitud)
                      : 0
                    return (
                      <button
                        key={parada.id}
                        onClick={() => {
                          handleEditClick(parada)
                          setShowNearby(false)
                        }}
                        className="w-full text-left p-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <i
                            className={`fa-solid fa-${TIPOS_PARADA[parada.tipo]?.icon || 'map-pin'} text-sm mt-1`}
                            style={{ color: TIPOS_PARADA[parada.tipo]?.color }}
                          ></i>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {parada.titulo}
                            </p>
                            <p className="text-xs text-gray-500">
                              {TIPOS_PARADA[parada.tipo]?.label} • {distance.toFixed(2)} km
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{paradas.length}</p>
                </div>
                <i className="fa-solid fa-map-pin text-blue-400 text-2xl"></i>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium uppercase">Activos</p>
                  <p className="text-2xl font-bold text-green-900">{paradas.filter(p => p.activo).length}</p>
                </div>
                <i className="fa-solid fa-circle-check text-green-400 text-2xl"></i>
              </div>
            </div>
          </div>

          {/* Tipos de paradas */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">Por Tipo</p>
            <div className="space-y-1.5">
              {Object.entries(
                paradas.reduce((acc, p) => {
                  acc[p.tipo] = (acc[p.tipo] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([tipo, count]) => (
                <div key={tipo} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 capitalize flex items-center gap-2">
                    <i className={`fa-solid fa-circle text-[8px]`} style={{ color: TIPOS_PARADA[tipo as keyof typeof TIPOS_PARADA]?.color || '#64748b' }}></i>
                    {TIPOS_PARADA[tipo as keyof typeof TIPOS_PARADA]?.label || tipo}
                  </span>
                  <span className="font-semibold text-gray-800">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <FormularioParada
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
          editingParada={editingParada}
          initialLat={clickedLat}
          initialLng={clickedLng}
          editingLat={editingLat}
          editingLng={editingLng}
          onCoordinatesChange={handleCoordinatesChange}
        />
      </aside>

      {/* Mapa Principal */}
      <main className="flex-1 h-[400px] md:h-full relative">
        {/* Indicador de filtro activo */}
        {isFiltered && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" />
              Mostrando {filteredParadas.length} de {paradas.length} paradas
            </div>
          </div>
        )}
        
        <MapaLeafletMejorado
          paradas={isFiltered ? filteredParadas : paradas}
          onMapClick={handleMapClick}
          onEditClick={handleEditClick}
          onDeleteClick={setDeletingParada}
          onMarkerDragEnd={handleMarkerDragEnd}
          editingParadaId={editingParada?.id || null}
        />
      </main>

      {/* Modal de Confirmación de Eliminación */}
      <AlertDialog
        open={!!deletingParada}
        onOpenChange={() => setDeletingParada(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Punto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar el punto &quot;
              {deletingParada?.titulo}&quot;? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
