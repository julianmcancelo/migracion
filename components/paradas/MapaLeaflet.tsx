'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Parada, TIPOS_PARADA } from './types'

// Importar Leaflet dinámicamente para evitar SSR issues
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
interface MapaLeafletProps {
  paradas: Parada[]
  onMapClick?: (lat: number, lng: number) => void
  onMarkerClick?: (parada: Parada) => void
  onEditClick?: (parada: Parada) => void
  onDeleteClick?: (parada: Parada) => void
  center?: [number, number]
  zoom?: number
}

export default function MapaLeaflet({
  paradas,
  onMapClick,
  onMarkerClick,
  onEditClick,
  onDeleteClick,
  center = [-34.715, -58.407], // Lanús por defecto
  zoom = 14,
}: MapaLeafletProps) {
  const [L, setL] = useState<any>(null)
  const [customIcons, setCustomIcons] = useState<any>({})

  useEffect(() => {
    // Importar Leaflet solo en el cliente
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)

      // Crear iconos personalizados con diseño mejorado
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
                width: 32px;
                height: 32px;
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
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                border: 2px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2), 0 0 0 1px ${config.color}44;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10;
              " onmouseover="this.style.transform='scale(1.2)';this.style.boxShadow='0 6px 12px rgba(0,0,0,0.3), 0 0 0 2px ${config.color}';" 
                 onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 8px rgba(0,0,0,0.2), 0 0 0 1px ${config.color}44';">
                <i class="fa-solid fa-${config.icon}" style="font-size: 13px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));"></i>
              </div>
              <div style="
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 5px solid white;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
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
          iconSize: [32, 38],
          iconAnchor: [16, 38],
          popupAnchor: [0, -38],
        })
      })

      // Icono especial mejorado para semáforos
      icons.semaforo = leaflet.divIcon({
        html: `
          <div class="semaforo-container" style="position: relative; animation: markerBounce 0.5s ease-out;">
            <div style="
              background: linear-gradient(180deg, #1f2937 0%, #374151 100%);
              width: 18px;
              height: 38px;
              border-radius: 9px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-around;
              padding: 4px 2px;
              border: 2px solid white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2), 0 0 0 1px #4b556344;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
              z-index: 10;
            " onmouseover="this.style.transform='scale(1.2)';this.style.boxShadow='0 6px 12px rgba(0,0,0,0.3), 0 0 0 2px #4b5563';" 
               onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 8px rgba(0,0,0,0.2), 0 0 0 1px #4b556344';">
              <div style="
                width: 11px;
                height: 11px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b);
                box-shadow: 0 0 6px #fbbf24, inset 0 -1px 2px rgba(0,0,0,0.3);
                animation: semaphoreLight 3s infinite;
              "></div>
              <div style="
                width: 11px;
                height: 11px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, #22c55e, #16a34a);
                box-shadow: 0 0 6px #22c55e, inset 0 -1px 2px rgba(0,0,0,0.3);
              "></div>
            </div>
            <div style="
              position: absolute;
              bottom: -5px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 4px solid transparent;
              border-right: 4px solid transparent;
              border-top: 5px solid white;
              filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
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
        iconSize: [22, 46],
        iconAnchor: [11, 46],
        popupAnchor: [0, -46],
      })

      setCustomIcons(icons)
    })

  }, [])

  if (!L) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', zIndex: 10 }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />

      {paradas.map((parada) => {
        const icon = customIcons[parada.tipo] || customIcons.municipal
        
        return (
          <Marker
            key={parada.id}
            position={[parada.latitud, parada.longitud]}
            icon={icon}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(parada)
                }
              },
            }}
          >
            <Popup className="custom-popup">
              <div className="min-w-[240px] max-w-[320px]">
                {/* Header con icono y tipo */}
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

                {/* Descripción */}
                {parada.descripcion && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {parada.descripcion}
                    </p>
                  </div>
                )}

                {/* Estado */}
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

                {/* Imágenes preview */}
                {parada.imagenes && parada.imagenes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {parada.imagenes.slice(0, 3).map((img, idx) => (
                        <img 
                          key={idx}
                          src={img.imagen_base64}
                          alt={img.descripcion || `Imagen ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          title={img.descripcion || ''}
                        />
                      ))}
                      {parada.imagenes.length > 3 && (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs font-medium">
                          +{parada.imagenes.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Coordenadas */}
                <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="fa-solid fa-location-dot"></i>
                    <span className="font-mono">{parada.latitud.toFixed(6)}, {parada.longitud.toFixed(6)}</span>
                  </div>
                </div>

                {/* Botones de acción */}
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
  )
}
