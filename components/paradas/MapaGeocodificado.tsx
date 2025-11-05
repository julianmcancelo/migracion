'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { CheckCircle, XCircle, AlertTriangle, MapPin } from 'lucide-react'

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

interface MapaGeocodificadoProps {
  features: GeoJSONFeature[]
}

export default function MapaGeocodificado({ features }: MapaGeocodificadoProps) {
  const [L, setL] = useState<any>(null)
  const [customIcons, setCustomIcons] = useState<any>({})

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)

      // Iconos por status
      const icons: any = {}

      // Icon para OK
      icons.OK = leaflet.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              border: 2px solid white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
              cursor: pointer;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
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
            "></div>
          </div>
        `,
        className: '',
        iconSize: [28, 33],
        iconAnchor: [14, 33],
        popupAnchor: [0, -33],
      })

      // Icon para baja_precision
      icons.baja_precision = leaflet.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              border: 2px solid white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
              cursor: pointer;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
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
            "></div>
          </div>
        `,
        className: '',
        iconSize: [28, 33],
        iconAnchor: [14, 33],
        popupAnchor: [0, -33],
      })

      // Icon para ZERO_RESULTS
      icons.ZERO_RESULTS = leaflet.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              border: 2px solid white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
              cursor: pointer;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
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
            "></div>
          </div>
        `,
        className: '',
        iconSize: [28, 33],
        iconAnchor: [14, 33],
        popupAnchor: [0, -33],
      })

      // Icon por defecto
      icons.default = leaflet.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              border: 2px solid white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
              cursor: pointer;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
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
            "></div>
          </div>
        `,
        className: '',
        iconSize: [28, 33],
        iconAnchor: [14, 33],
        popupAnchor: [0, -33],
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

  // Filtrar solo features con geometría válida
  const validFeatures = features.filter(f => f.geometry !== null)

  // Calcular centro del mapa
  const center: [number, number] = validFeatures.length > 0
    ? [
        validFeatures.reduce((sum, f) => sum + f.geometry!.coordinates[1], 0) / validFeatures.length,
        validFeatures.reduce((sum, f) => sum + f.geometry!.coordinates[0], 0) / validFeatures.length
      ]
    : [-34.715, -58.407] // Lanús por defecto

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />

      {validFeatures.map((feature, index) => {
        const [lng, lat] = feature.geometry!.coordinates
        const props = feature.properties
        const icon = customIcons[props.status] || customIcons.default

        return (
          <Marker
            key={`${props.codigoParada}-${index}`}
            position={[lat, lng]}
            icon={icon}
          >
            <Popup className="custom-popup">
              <div className="min-w-[260px] max-w-[320px]">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    props.status === 'OK' ? 'bg-green-100 text-green-600' :
                    props.status === 'baja_precision' ? 'bg-yellow-100 text-yellow-600' :
                    props.status === 'ZERO_RESULTS' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {props.status === 'OK' ? <CheckCircle className="w-5 h-5" /> :
                     props.status === 'baja_precision' ? <AlertTriangle className="w-5 h-5" /> :
                     props.status === 'ZERO_RESULTS' ? <XCircle className="w-5 h-5" /> :
                     <MapPin className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-gray-800">{props.codigoParada}</h3>
                    <p className="text-sm text-gray-600">{props.calle} {props.altura}</p>
                  </div>
                </div>

                {/* Dirección */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">DIRECCIÓN BUSCADA</p>
                  <p className="text-sm text-gray-700">{props.fullAddress}</p>
                </div>

                {/* Dirección formateada por Google */}
                {props.formatted_address && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">DIRECCIÓN GOOGLE MAPS</p>
                    <p className="text-sm text-gray-700">{props.formatted_address}</p>
                  </div>
                )}

                {/* Precisión */}
                {props.accuracy && (
                  <div className="mb-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      props.accuracy === 'ROOFTOP' ? 'bg-green-100 text-green-700' :
                      props.accuracy === 'RANGE_INTERPOLATED' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {props.accuracy === 'ROOFTOP' ? '📍 Precisión Exacta' :
                       props.accuracy === 'RANGE_INTERPOLATED' ? '📏 Interpolada' :
                       props.accuracy === 'GEOMETRIC_CENTER' ? '📐 Centro Geométrico' :
                       '~️ Aproximada'}
                    </span>
                  </div>
                )}

                {/* Coordenadas */}
                <div className="mb-3 p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500 font-mono">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </p>
                </div>

                {/* Place ID */}
                {props.place_id && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">PLACE ID</p>
                    <p className="text-xs text-gray-600 font-mono break-all">{props.place_id}</p>
                  </div>
                )}

                {/* Referencia */}
                {props.referencia && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">REFERENCIA</p>
                    <p className="text-sm text-gray-700">{props.referencia}</p>
                  </div>
                )}

                {/* Botón para abrir en Google Maps */}
                {props.place_id && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${props.place_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition text-center"
                  >
                    Abrir en Google Maps →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
