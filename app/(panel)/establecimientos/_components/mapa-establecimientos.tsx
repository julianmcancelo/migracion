'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Building2, Car, MapPin, Phone, Mail, User, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ModalEstablecimiento from './modal-establecimiento'

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

interface MapaEstablecimientosProps {
  establecimientos: Establecimiento[]
  onEstablecimientoClick: (est: Establecimiento) => void
  onMapClick: (lat: number, lng: number) => void
  onRecargar: () => void
}

// Iconos personalizados para el mapa
const iconoEscuela = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18"/>
      <path d="M3 10h18"/>
      <path d="M5 6h14"/>
      <path d="M4 14h16"/>
      <path d="m8 6 4-4 4 4"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'bg-green-600 rounded-full p-1 shadow-lg border-2 border-white',
})

const iconoRemiseria = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <path d="M9 17h6"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'bg-purple-600 rounded-full p-1 shadow-lg border-2 border-white',
})

// Componente para manejar clicks en el mapa
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapaEstablecimientos({
  establecimientos,
  onEstablecimientoClick,
  onMapClick,
  onRecargar,
}: MapaEstablecimientosProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState<Establecimiento | null>(null)
  const [nuevaUbicacion, setNuevaUbicacion] = useState<{ lat: number; lng: number } | null>(null)

  // Centro inicial: Lanús, Buenos Aires
  const centroLanus = { lat: -34.7081, lng: -58.3958 }

  const handleMapClick = (lat: number, lng: number) => {
    setNuevaUbicacion({ lat, lng })
    setEstablecimientoSeleccionado(null)
    setModalOpen(true)
  }

  const handleMarkerClick = (est: Establecimiento) => {
    setEstablecimientoSeleccionado(est)
    setNuevaUbicacion(null)
    setModalOpen(true)
    onEstablecimientoClick(est)
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este establecimiento?')) return

    try {
      const response = await fetch(`/api/establecimientos/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Establecimiento eliminado exitosamente')
        setModalOpen(false)
        onRecargar()
      } else {
        alert('❌ Error al eliminar: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al eliminar establecimiento')
    }
  }

  return (
    <>
      <div className="h-[600px] rounded-lg overflow-hidden border-2 border-gray-300">
        <MapContainer
          center={[centroLanus.lat, centroLanus.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onClick={handleMapClick} />

          {/* Marcadores de establecimientos */}
          {establecimientos.map((est) => {
            if (!est.latitud || !est.longitud) return null

            return (
              <Marker
                key={est.id}
                position={[est.latitud, est.longitud]}
                icon={est.tipo === 'ESCUELA' ? iconoEscuela : iconoRemiseria}
                eventHandlers={{
                  click: () => handleMarkerClick(est),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <div className="flex items-start gap-3 mb-3">
                      {est.tipo === 'ESCUELA' ? (
                        <Building2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Car className="h-6 w-6 text-purple-600" />
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900">{est.nombre}</h3>
                        <Badge variant={est.activo ? 'default' : 'secondary'} className="mt-1">
                          {est.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{est.direccion}</span>
                      </div>
                      {est.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{est.telefono}</span>
                        </div>
                      )}
                      {est.responsable && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span>{est.responsable}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleMarkerClick(est)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Modal para ver/editar/crear */}
      <ModalEstablecimiento
        open={modalOpen}
        onOpenChange={setModalOpen}
        establecimiento={establecimientoSeleccionado}
        ubicacionInicial={nuevaUbicacion}
        onGuardadoExitoso={() => {
          onRecargar()
          setModalOpen(false)
        }}
        onEliminar={establecimientoSeleccionado ? () => handleEliminar(establecimientoSeleccionado.id) : undefined}
      />
    </>
  )
}
