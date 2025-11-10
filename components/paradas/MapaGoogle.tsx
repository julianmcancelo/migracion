'use client'

import { useState, useCallback, useMemo } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { Parada, TIPOS_PARADA, ParadaTipo, ParadaEstado } from './types'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

interface MapaGoogleProps {
  paradas: Parada[]
  onMapClick?: (lat: number, lng: number) => void
  onEditClick?: (parada: Parada) => void
  onDeleteClick?: (parada: Parada) => void
  center?: { lat: number; lng: number }
  zoom?: number
}

// Estilos de mapa disponibles
const MAP_STYLES = {
  silver: [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
],
  night: [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#d59563" }]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#d59563" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{ "color": "#263c3f" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#6b9a76" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#38414e" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#212a37" }]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9ca5b3" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{ "color": "#746855" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#1f2835" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#f3d19c" }]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [{ "color": "#2f3948" }]
    },
    {
      "featureType": "transit.station",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#d59563" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#17263c" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#515c6d" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#17263c" }]
    }
  ],
  retro: [
    { "elementType": "geometry", "stylers": [{ "color": "#ebe3cd" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#523735" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f1e6" }] },
    {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#c9b2a6" }]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#dcd2be" }]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#ae9e90" }]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "geometry",
      "stylers": [{ "color": "#dfd2ae" }]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{ "color": "#dfd2ae" }]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#93817c" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [{ "color": "#a5b076" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#447530" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#f5f1e6" }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [{ "color": "#fdfcf8" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{ "color": "#f8c967" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#e9bc62" }]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [{ "color": "#e98d58" }]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#db8555" }]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#806b63" }]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [{ "color": "#dfd2ae" }]
    },
    {
      "featureType": "transit.line",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#8f7d77" }]
    },
    {
      "featureType": "transit.line",
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#ebe3cd" }]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [{ "color": "#dfd2ae" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [{ "color": "#b9d3c2" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#92998d" }]
    }
  ],
  standard: []
}

type MapStyleType = keyof typeof MAP_STYLES

const containerStyle = {
  width: '100%',
  height: '100%'
}

// Crear iconos SVG personalizados para cada tipo
const createMarkerIcon = (tipo: ParadaTipo, estado?: ParadaEstado | null) => {
  const config = TIPOS_PARADA[tipo]
  const color = config?.color || '#64748b'
  
  // Determinar opacidad basado en estado
  const opacity = estado === 'falla' ? 0.5 : 1
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
      <defs>
        <filter id="shadow-${tipo}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="15" fill="${color}" opacity="${opacity}" filter="url(#shadow-${tipo})"/>
      <circle cx="20" cy="20" r="15" fill="none" stroke="white" stroke-width="2.5" opacity="${opacity}"/>
      <path d="M 20 35 L 20 48" stroke="white" stroke-width="2" opacity="${opacity}"/>
      <circle cx="20" cy="48" r="2" fill="${color}" opacity="${opacity}"/>
    </svg>
  `
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export default function MapaGoogle({
  paradas,
  onMapClick,
  onEditClick,
  onDeleteClick,
  center = { lat: -34.715, lng: -58.407 }, // Lanús
  zoom = 14
}: MapaGoogleProps) {
  const [selectedParada, setSelectedParada] = useState<Parada | null>(null)
  const [filtrosTipo, setFiltrosTipo] = useState<Record<ParadaTipo, boolean>>({
    seguridad: true,
    transporte: true,
    semaforo: true,
    salud: true,
    educacion: true,
    municipal: true
  })
  const [filtrosEstado, setFiltrosEstado] = useState<Record<string, boolean>>({
    ok: true,
    mantenimiento: true,
    falla: true,
    sin_estado: true
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(true)
  const [estiloMapa, setEstiloMapa] = useState<MapStyleType>('silver')

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  // Filtrar paradas según selección
  const paradasFiltradas = useMemo(() => {
    return paradas.filter(parada => {
      const tipoVisible = filtrosTipo[parada.tipo]
      const estadoVisible = parada.estado 
        ? filtrosEstado[parada.estado] ?? true
        : filtrosEstado.sin_estado ?? true
      
      return tipoVisible && estadoVisible && parada.activo
    })
  }, [paradas, filtrosTipo, filtrosEstado])

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && onMapClick) {
      onMapClick(e.latLng.lat(), e.latLng.lng())
    }
  }, [onMapClick])

  const toggleFiltroTipo = (tipo: ParadaTipo) => {
    setFiltrosTipo(prev => ({ ...prev, [tipo]: !prev[tipo] }))
  }

  const toggleFiltroEstado = (estado: string) => {
    setFiltrosEstado(prev => ({ ...prev, [estado]: !prev[estado] }))
  }

  const toggleTodos = () => {
    const todosMarcados = Object.values(filtrosTipo).every(v => v)
    const nuevoEstado = !todosMarcados
    
    setFiltrosTipo({
      seguridad: nuevoEstado,
      transporte: nuevoEstado,
      semaforo: nuevoEstado,
      salud: nuevoEstado,
      educacion: nuevoEstado,
      municipal: nuevoEstado
    })
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Cargando Google Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onClick={handleMapClick}
        options={{
          styles: MAP_STYLES[estiloMapa],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
        }}
      >
        {paradasFiltradas.map((parada) => (
          <Marker
            key={parada.id}
            position={{ lat: parada.latitud, lng: parada.longitud }}
            icon={{
              url: createMarkerIcon(parada.tipo, parada.estado),
              scaledSize: new google.maps.Size(40, 50),
              anchor: new google.maps.Point(20, 48)
            }}
            onClick={() => setSelectedParada(parada)}
            title={parada.titulo}
          />
        ))}

        {selectedParada && (
          <InfoWindow
            position={{ lat: selectedParada.latitud, lng: selectedParada.longitud }}
            onCloseClick={() => setSelectedParada(null)}
          >
            <div className="min-w-[260px] max-w-[320px] p-2">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${TIPOS_PARADA[selectedParada.tipo]?.color || '#64748b'} 0%, ${TIPOS_PARADA[selectedParada.tipo]?.color || '#64748b'}dd 100%)`
                  }}
                >
                  <i className={`fa-solid fa-${TIPOS_PARADA[selectedParada.tipo]?.icon || 'map-pin'} text-xl`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 leading-tight">{selectedParada.titulo}</h3>
                  <span 
                    className="text-xs font-medium capitalize px-2 py-1 rounded-full inline-block mt-1"
                    style={{ 
                      backgroundColor: `${TIPOS_PARADA[selectedParada.tipo]?.color || '#64748b'}15`,
                      color: TIPOS_PARADA[selectedParada.tipo]?.color || '#64748b'
                    }}
                  >
                    <i className={`fa-solid fa-${TIPOS_PARADA[selectedParada.tipo]?.icon || 'map-pin'} mr-1`}></i>
                    {TIPOS_PARADA[selectedParada.tipo]?.label || selectedParada.tipo}
                  </span>
                </div>
              </div>

              {/* Descripción */}
              {selectedParada.descripcion && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {selectedParada.descripcion}
                  </p>
                </div>
              )}

              {/* Estado */}
              {selectedParada.estado && (
                <div className="mb-3 flex items-center gap-2">
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                    selectedParada.estado === 'ok' ? 'bg-green-100 text-green-700' :
                    selectedParada.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    <i className={`fa-solid ${
                      selectedParada.estado === 'ok' ? 'fa-circle-check' :
                      selectedParada.estado === 'mantenimiento' ? 'fa-wrench' :
                      'fa-circle-xmark'
                    }`}></i>
                    {selectedParada.estado === 'ok' ? 'Operativo' :
                     selectedParada.estado === 'mantenimiento' ? 'En Mantenimiento' :
                     'Fuera de Servicio'}
                  </span>
                </div>
              )}

              {/* Coordenadas */}
              <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="fa-solid fa-location-dot"></i>
                  <span className="font-mono">{selectedParada.latitud.toFixed(6)}, {selectedParada.longitud.toFixed(6)}</span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-2 mt-3">
                {onEditClick && (
                  <button
                    onClick={() => {
                      onEditClick(selectedParada)
                      setSelectedParada(null)
                    }}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                    Editar
                  </button>
                )}
                {onDeleteClick && (
                  <button
                    onClick={() => {
                      onDeleteClick(selectedParada)
                      setSelectedParada(null)
                    }}
                    className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Panel de Filtros */}
      <Card className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm shadow-xl max-w-xs border-0">
        <div className="p-4">
          {/* Header con toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-blue-600"></i>
              <h3 className="font-bold text-gray-800">Filtros</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {paradasFiltradas.length}/{paradas.filter(p => p.activo).length}
              </span>
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <i className={`fa-solid fa-chevron-${mostrarFiltros ? 'up' : 'down'}`}></i>
            </button>
          </div>

          {mostrarFiltros && (
            <>
              {/* Estilo del Mapa */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Estilo del Mapa</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(MAP_STYLES) as MapStyleType[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => setEstiloMapa(style)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                        estiloMapa === style
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style === 'standard' ? 'Estándar' : style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Todos */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <Label htmlFor="toggle-all" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Seleccionar todos
                  </Label>
                  <Switch
                    id="toggle-all"
                    checked={Object.values(filtrosTipo).every(v => v)}
                    onCheckedChange={toggleTodos}
                  />
                </div>
              </div>

              {/* Filtros por Tipo */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Por Tipo</p>
                <div className="space-y-2">
                  {Object.entries(TIPOS_PARADA).map(([tipo, config]) => {
                    const count = paradas.filter(p => p.tipo === tipo && p.activo).length
                    return (
                      <div key={tipo} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2.5 flex-1">
                          <div 
                            className="w-3 h-3 rounded-full shadow-sm transition-transform group-hover:scale-110"
                            style={{ backgroundColor: config.color }}
                          />
                          <Label 
                            htmlFor={`tipo-${tipo}`}
                            className="text-sm text-gray-700 cursor-pointer flex-1 group-hover:text-gray-900"
                          >
                            {config.label}
                            <span className="text-xs text-gray-400 ml-1.5">({count})</span>
                          </Label>
                        </div>
                        <Switch
                          id={`tipo-${tipo}`}
                          checked={filtrosTipo[tipo as ParadaTipo]}
                          onCheckedChange={() => toggleFiltroTipo(tipo as ParadaTipo)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Filtros por Estado */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Por Estado</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-circle-check text-green-600 text-sm"></i>
                      <Label htmlFor="estado-ok" className="text-sm text-gray-700 cursor-pointer">
                        Operativo
                      </Label>
                    </div>
                    <Switch
                      id="estado-ok"
                      checked={filtrosEstado.ok}
                      onCheckedChange={() => toggleFiltroEstado('ok')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-wrench text-yellow-600 text-sm"></i>
                      <Label htmlFor="estado-mant" className="text-sm text-gray-700 cursor-pointer">
                        Mantenimiento
                      </Label>
                    </div>
                    <Switch
                      id="estado-mant"
                      checked={filtrosEstado.mantenimiento}
                      onCheckedChange={() => toggleFiltroEstado('mantenimiento')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-circle-xmark text-red-600 text-sm"></i>
                      <Label htmlFor="estado-falla" className="text-sm text-gray-700 cursor-pointer">
                        Fuera de Servicio
                      </Label>
                    </div>
                    <Switch
                      id="estado-falla"
                      checked={filtrosEstado.falla}
                      onCheckedChange={() => toggleFiltroEstado('falla')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-circle-question text-gray-500 text-sm"></i>
                      <Label htmlFor="estado-sin" className="text-sm text-gray-700 cursor-pointer">
                        Sin Estado
                      </Label>
                    </div>
                    <Switch
                      id="estado-sin"
                      checked={filtrosEstado.sin_estado}
                      onCheckedChange={() => toggleFiltroEstado('sin_estado')}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
