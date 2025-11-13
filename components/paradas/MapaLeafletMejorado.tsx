'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Parada, TIPOS_PARADA, ParadaTipo } from './types'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

// Importar Leaflet dinámicamente
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface MapaLeafletMejoradoProps {
  paradas: Parada[]
  onMapClick?: (lat: number, lng: number) => void
  onMarkerClick?: (parada: Parada) => void
  onEditClick?: (parada: Parada) => void
  onDeleteClick?: (parada: Parada) => void
  onMarkerDragEnd?: (paradaId: number, lat: number, lng: number) => void
  editingParadaId?: number | null
  center?: [number, number]
  zoom?: number
}

// Capas de mapa disponibles - todas GRATUITAS y sin API key
const MAP_LAYERS = {
  'google-like': {
    label: 'Google Style',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20
  },
  'google-dark': {
    label: 'Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20
  },
  'voyager': {
    label: 'Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20
  },
  'satellite': {
    label: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri',
    maxZoom: 19
  },
  'osm': {
    label: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }
}

type LayerType = keyof typeof MAP_LAYERS

export default function MapaLeafletMejorado({
  paradas,
  onMapClick,
  onMarkerClick,
  onEditClick,
  onDeleteClick,
  onMarkerDragEnd,
  editingParadaId,
  center = [-34.715, -58.407], // Lanús
  zoom = 14,
}: MapaLeafletMejoradoProps) {
  const [L, setL] = useState<any>(null)
  const [customIcons, setCustomIcons] = useState<any>({})
  const [selectedLayer, setSelectedLayer] = useState<LayerType>('google-like')
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

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)

      const icons: any = {}
      
      Object.entries(TIPOS_PARADA).forEach(([tipo, config]) => {
        const gradient = tipo === 'seguridad' ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' :
                        tipo === 'transporte' ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' :
                        tipo === 'salud' ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' :
                        tipo === 'educacion' ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' :
                        tipo === 'municipal' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' :
                        'linear-gradient(135deg, #64748b 0%, #475569 100%)'
        
        icons[tipo] = leaflet.divIcon({
          html: `
            <div class="marker-container" style="position: relative; animation: markerBounce 0.5s ease-out;">
              <div class="marker-pulse" style="
                position: absolute;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: ${config.color}33;
                animation: pulse 2s infinite;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              "></div>
              <div class="marker-icon" style="
                position: relative;
                background: ${gradient};
                width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                border: 2px solid white;
                box-shadow: 0 3px 6px rgba(0,0,0,0.2), 0 0 0 1px ${config.color}44;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10;
              " onmouseover="this.style.transform='scale(1.3)';this.style.boxShadow='0 5px 10px rgba(0,0,0,0.3), 0 0 0 2px ${config.color}';" 
                 onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 3px 6px rgba(0,0,0,0.2), 0 0 0 1px ${config.color}44';">
                <i class="fa-solid fa-${config.icon}" style="font-size: 9px; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));"></i>
              </div>
              <div style="
                position: absolute;
                bottom: -4px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 3px solid transparent;
                border-right: 3px solid transparent;
                border-top: 4px solid white;
                filter: drop-shadow(0 1px 1px rgba(0,0,0,0.15));
              "></div>
            </div>
            <style>
              @keyframes pulse {
                0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.95); }
                50% { opacity: 0.3; transform: translate(-50%, -50%) scale(1.05); }
              }
              @keyframes markerBounce {
                0% { transform: translateY(-20px); opacity: 0; }
                60% { transform: translateY(5px); }
                80% { transform: translateY(-3px); }
                100% { transform: translateY(0); opacity: 1; }
              }
            </style>
          `,
          className: '',
          iconSize: [22, 26],
          iconAnchor: [11, 26],
          popupAnchor: [0, -26],
        })
      })

      icons.semaforo = leaflet.divIcon({
        html: `
          <div class="semaforo-container" style="position: relative; animation: markerBounce 0.5s ease-out;">
            <div style="
              background: linear-gradient(180deg, #1f2937 0%, #374151 100%);
              width: 12px;
              height: 26px;
              border-radius: 6px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-around;
              padding: 3px 1.5px;
              border: 2px solid white;
              box-shadow: 0 3px 6px rgba(0,0,0,0.2), 0 0 0 1px #4b556344;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
              z-index: 10;
            " onmouseover="this.style.transform='scale(1.3)';this.style.boxShadow='0 5px 10px rgba(0,0,0,0.3), 0 0 0 2px #4b5563';" 
               onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 3px 6px rgba(0,0,0,0.2), 0 0 0 1px #4b556344';">
              <div style="
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b);
                box-shadow: 0 0 4px #fbbf24, inset 0 -1px 1px rgba(0,0,0,0.3);
                animation: semaphoreLight 3s infinite;
              "></div>
              <div style="
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, #22c55e, #16a34a);
                box-shadow: 0 0 4px #22c55e, inset 0 -1px 1px rgba(0,0,0,0.3);
              "></div>
            </div>
            <div style="
              position: absolute;
              bottom: -4px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 3px solid transparent;
              border-right: 3px solid transparent;
              border-top: 4px solid white;
              filter: drop-shadow(0 1px 1px rgba(0,0,0,0.15));
            "></div>
          </div>
          <style>
            @keyframes semaphoreLight {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
          </style>
        `,
        className: '',
        iconSize: [16, 32],
        iconAnchor: [8, 32],
        popupAnchor: [0, -32],
      })

      setCustomIcons(icons)
    })
  }, [])

  // Filtrar paradas
  const paradasFiltradas = useMemo(() => {
    return paradas.filter(parada => {
      const tipoVisible = filtrosTipo[parada.tipo]
      const estadoVisible = parada.estado 
        ? filtrosEstado[parada.estado] ?? true
        : filtrosEstado.sin_estado ?? true
      
      return tipoVisible && estadoVisible && parada.activo
    })
  }, [paradas, filtrosTipo, filtrosEstado])

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

  if (!L) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  const selectedLayerConfig = MAP_LAYERS[selectedLayer]

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        className="rounded-lg"
      >
        <TileLayer
          attribution={selectedLayerConfig.attribution}
          url={selectedLayerConfig.url}
          maxZoom={selectedLayerConfig.maxZoom}
        />

        {paradasFiltradas.map((parada) => {
          const icon = customIcons[parada.tipo] || customIcons.municipal
          const isEditing = editingParadaId === parada.id
          
          return (
            <Marker
              key={parada.id}
              position={[parada.latitud, parada.longitud]}
              icon={icon}
              draggable={isEditing}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(parada)
                  }
                },
                dragend: (e) => {
                  if (isEditing && onMarkerDragEnd) {
                    const marker = e.target
                    const position = marker.getLatLng()
                    onMarkerDragEnd(parada.id, position.lat, position.lng)
                  }
                },
              }}
            >
              <Popup className="custom-popup">
                <div className="min-w-[240px] max-w-[320px]">
                  {/* Indicador de modo edición arrastrable */}
                  {isEditing && (
                    <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <i className="fa-solid fa-hand-pointer text-lg animate-pulse"></i>
                        <div className="flex-1">
                          <p className="text-xs font-bold">Modo Edición Activo</p>
                          <p className="text-xs">Arrastra este marcador para cambiar su ubicación</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md"
                      style={{ 
                        background: `linear-gradient(135deg, ${TIPOS_PARADA[parada.tipo]?.color || '#64748b'} 0%, ${TIPOS_PARADA[parada.tipo]?.color || '#64748b'}dd 100%)`
                      }}
                    >
                      <i className={`fa-solid fa-${TIPOS_PARADA[parada.tipo]?.icon || 'map-pin'} text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 leading-tight">{parada.titulo}</h3>
                      <span 
                        className="text-xs font-medium capitalize px-2 py-1 rounded-full inline-block mt-1"
                        style={{ 
                          backgroundColor: `${TIPOS_PARADA[parada.tipo]?.color || '#64748b'}15`,
                          color: TIPOS_PARADA[parada.tipo]?.color || '#64748b'
                        }}
                      >
                        <i className={`fa-solid fa-${TIPOS_PARADA[parada.tipo]?.icon || 'map-pin'} mr-1`}></i>
                        {TIPOS_PARADA[parada.tipo]?.label || parada.tipo}
                      </span>
                    </div>
                  </div>

                  {parada.descripcion && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {parada.descripcion}
                      </p>
                    </div>
                  )}

                  {parada.estado && (
                    <div className="mb-4 flex items-center gap-2">
                      <span className={`text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                        parada.estado === 'ok' ? 'bg-green-100 text-green-700' :
                        parada.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <i className={`fa-solid ${
                          parada.estado === 'ok' ? 'fa-circle-check' :
                          parada.estado === 'mantenimiento' ? 'fa-wrench' :
                          'fa-circle-xmark'
                        }`}></i>
                        {parada.estado === 'ok' ? 'Operativo' :
                         parada.estado === 'mantenimiento' ? 'En Mantenimiento' :
                         'Fuera de Servicio'}
                      </span>
                    </div>
                  )}

                  <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <i className="fa-solid fa-location-dot"></i>
                      <span className="font-mono">{parada.latitud.toFixed(6)}, {parada.longitud.toFixed(6)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {onEditClick && (
                      <button
                        onClick={() => onEditClick(parada)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                        Editar
                      </button>
                    )}
                    {onDeleteClick && (
                      <button
                        onClick={() => onDeleteClick(parada)}
                        className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Panel de Filtros */}
      <Card className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm shadow-xl max-w-xs border-0 z-[1000]">
        <div className="p-4">
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
              {/* Selector de Capa */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Estilo de Mapa</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(MAP_LAYERS) as LayerType[]).map((layer) => (
                    <button
                      key={layer}
                      onClick={() => setSelectedLayer(layer)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                        selectedLayer === layer
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {MAP_LAYERS[layer].label}
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
