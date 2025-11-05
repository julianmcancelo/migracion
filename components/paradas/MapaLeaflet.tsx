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

      // Crear iconos personalizados
      const icons: any = {}
      Object.entries(TIPOS_PARADA).forEach(([tipo, config]) => {
        icons[tipo] = leaflet.divIcon({
          html: `<div style="background-color: ${config.color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <i class="fa-solid fa-${config.icon}" style="font-size: 16px;"></i>
          </div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        })
      })

      // Icono especial para semáforos
      icons.semaforo = leaflet.divIcon({
        html: `<div style="background-color: #4b5563; width: 20px; height: 40px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #22c55e; margin: 2px 0;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #d1d5db; margin: 2px 0;"></div>
        </div>`,
        className: '',
        iconSize: [24, 44],
        iconAnchor: [12, 44],
        popupAnchor: [0, -44],
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
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
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-base mb-2">{parada.titulo}</h3>
                <span className="text-xs capitalize bg-gray-200 px-2 py-1 rounded inline-block mb-2">
                  {TIPOS_PARADA[parada.tipo]?.label || parada.tipo}
                </span>
                {parada.descripcion && (
                  <p className="text-sm text-gray-600 mt-2 mb-3">{parada.descripcion}</p>
                )}
                <div className="flex gap-2 mt-3">
                  {onEditClick && (
                    <button
                      onClick={() => onEditClick(parada)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                    >
                      Editar
                    </button>
                  )}
                  {onDeleteClick && (
                    <button
                      onClick={() => onDeleteClick(parada)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                    >
                      Eliminar
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
