'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  FileText,
  Calendar,
  Download,
  QrCode,
  Shield,
  RefreshCcw,
  Bot,
} from 'lucide-react'
import { VehiculoModal } from './vehiculo-modal'
import { PersonaModal } from './persona-modal'
import { DetalleModal } from './detalle-modal'
import { EditarHabilitacionDialog } from './editar-habilitacion-dialog'
import { ModalObleas } from '@/components/obleas/modal-obleas'
import ModalCambioVehiculo from '@/components/habilitaciones/modal-cambio-vehiculo'
import ChatIAHabilitacion from '@/components/habilitaciones/chat-ia-habilitacion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatearFecha } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Habilitacion {
  id: number
  nro_licencia: string | null
  resolucion: string | null
  estado: string | null
  vigencia_inicio: Date | null
  vigencia_fin: Date | null
  tipo_transporte: string | null
  expte: string | null
  observaciones: string | null
  titular_principal: string | null
  personas: any[]
  vehiculos: any[]
  establecimientos: any[]
  tiene_resolucion: boolean
  resolucion_doc_id: number | null
}

interface HabilitacionesTableProps {
  habilitaciones: Habilitacion[]
  loading?: boolean
}

/**
 * Tabla de habilitaciones expandible
 * - Muestra información principal
 * - Expandible para ver detalles
 * - Menú de acciones por fila
 */
export function HabilitacionesTable({ habilitaciones, loading = false }: HabilitacionesTableProps) {
  const router = useRouter()
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPersona, setSelectedPersona] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedHabilitacion, setSelectedHabilitacion] = useState<any>(null)
  const [showVehiculoModal, setShowVehiculoModal] = useState(false)
  const [showPersonaModal, setShowPersonaModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showEditarDialog, setShowEditarDialog] = useState(false)
  const [showObleasModal, setShowObleasModal] = useState(false)
  const [showCambioVehiculoModal, setShowCambioVehiculoModal] = useState(false)
  const [showChatIAModal, setShowChatIAModal] = useState(false)

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Funciones para las acciones del menú
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleVerDetalle = (hab: any) => {
    setSelectedHabilitacion(hab)
    setShowDetalleModal(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditar = (hab: any) => {
    setSelectedHabilitacion(hab)
    setShowEditarDialog(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAsignarTurno = (hab: any) => {
    // Redirigir a la página de turnos con la licencia precargada
    router.push(`/turnos?licencia=${hab.nro_licencia}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDescargarPDF = async (hab: any) => {
    try {
      // TODO: Implementar generación de PDF
      alert(`Descargando PDF de habilitación #${hab.id}`)
    } catch (error) {
      console.error('Error al descargar PDF:', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGenerarCredencial = async (hab: any) => {
    try {
      const res = await fetch(`/api/habilitaciones/${hab.id}/generar-token-credencial`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        // Copiar URL al portapapeles
        await navigator.clipboard.writeText(data.data.url)

        // Abrir credencial en nueva pestaña
        window.open(data.data.url, '_blank')

        alert('✅ Credencial generada. URL copiada al portapapeles.')
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error al generar credencial:', error)
      alert('❌ Error al generar credencial')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGestionarObleas = (hab: any) => {
    setSelectedHabilitacion(hab)
    setShowObleasModal(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCambioMaterial = (hab: any) => {
    setSelectedHabilitacion(hab)
    setShowCambioVehiculoModal(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChatIA = (hab: any) => {
    setSelectedHabilitacion(hab)
    setShowChatIAModal(true)
  }

  const getEstadoBadge = (estado: string | null) => {
    const estados: Record<string, { className: string; label: string }> = {
      HABILITADO: {
        className: 'bg-green-600 text-white border-green-700',
        label: 'Habilitado',
      },
      EN_TRAMITE: {
        className: 'bg-yellow-500 text-white border-yellow-600',
        label: 'En Trámite',
      },
      NO_HABILITADO: {
        className: 'bg-red-600 text-white border-red-700',
        label: 'No Habilitado',
      },
      INICIADO: {
        className: 'bg-blue-600 text-white border-blue-700',
        label: 'Iniciado',
      },
    }

    const config = estados[estado || ''] || {
      className: 'bg-gray-400 text-white border-gray-500',
      label: estado || 'N/A',
    }
    return (
      <Badge className={`${config.className} border px-2.5 py-0.5 text-xs font-medium uppercase`}>
        {config.label}
      </Badge>
    )
  }

  const getEstadoVigencia = (fecha: Date | null) => {
    if (!fecha) return null

    const hoy = new Date()
    const vigencia = new Date(fecha)
    const diasRestantes = Math.ceil((vigencia.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    if (diasRestantes < 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          Vencida
        </Badge>
      )
    } else if (diasRestantes <= 30) {
      return <Badge className="bg-orange-500 text-xs text-white">{diasRestantes} días</Badge>
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }

  if (habilitaciones.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <FileText className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          No se encontraron habilitaciones
        </h3>
        <p className="text-gray-500">Intenta con otro término de búsqueda o revisa los filtros</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {habilitaciones.map(hab => {
        const isExpanded = expandedRows.has(hab.id)

        return (
          <div
            key={hab.id}
            className="border border-gray-300 bg-white transition-colors hover:bg-gray-50"
          >
            {/* Fila principal */}
            <div className="flex items-center gap-4 p-4">
              {/* Botón expandir */}
              <button
                onClick={() => toggleRow(hab.id)}
                className="shrink-0 p-1 transition-colors hover:bg-gray-200"
              >
                <ChevronRight
                  className={cn(
                    'h-4 w-4 text-gray-600 transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                />
              </button>

              {/* Licencia y Expediente */}
              <div className="w-40 min-w-0 flex-shrink-0">
                <div className="truncate text-sm font-semibold text-gray-900">
                  {hab.nro_licencia || 'N/A'}
                </div>
                <div className="truncate text-xs text-gray-500">Exp: {hab.expte || 'N/A'}</div>
              </div>

              {/* Titular */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900">
                  {hab.titular_principal || (
                    <span className="italic text-gray-500">Sin asignar</span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  {hab.tipo_transporte || 'Sin tipo'}
                </div>
              </div>

              {/* Estado */}
              <div className="flex-shrink-0">{getEstadoBadge(hab.estado)}</div>

              {/* Vigencia */}
              <div className="w-32 flex-shrink-0">
                <div className="mb-0.5 text-xs text-gray-500">Vence</div>
                <div className="text-sm font-semibold text-gray-900">
                  {hab.vigencia_fin ? formatearFecha(hab.vigencia_fin) : 'N/A'}
                </div>
                <div className="mt-1">{getEstadoVigencia(hab.vigencia_fin)}</div>
              </div>

              {/* Menú de acciones */}
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => handleVerDetalle(hab)}
                      className="cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditar(hab)} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleGenerarCredencial(hab)}
                      className="cursor-pointer"
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Ver Credencial
                    </DropdownMenuItem>
                    {hab.estado === 'HABILITADO' && (
                      <DropdownMenuItem
                        onClick={() => handleGestionarObleas(hab)}
                        className="cursor-pointer"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Gestionar Obleas
                      </DropdownMenuItem>
                    )}
                    {hab.vehiculos && hab.vehiculos.length > 0 && (
                      <DropdownMenuItem
                        onClick={() => handleCambioMaterial(hab)}
                        className="cursor-pointer"
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Cambio de Material
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleChatIA(hab)}
                      className="cursor-pointer"
                    >
                      <Bot className="mr-2 h-4 w-4" />
                      Consultar con IA
                    </DropdownMenuItem>
                    {hab.tiene_resolucion && (
                      <DropdownMenuItem className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Resolución
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleAsignarTurno(hab)}
                      className="cursor-pointer"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Asignar Turno
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDescargarPDF(hab)}
                      className="cursor-pointer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Detalles expandibles */}
            {isExpanded && (
              <div className="space-y-3 border-t bg-gray-50 p-4">
                {/* Personas */}
                {hab.personas.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase text-gray-700">
                      Personas ({hab.personas.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {hab.personas.map(persona => (
                        <button
                          key={persona.id}
                          onClick={() => {
                            setSelectedPersona(persona)
                            setShowPersonaModal(true)
                          }}
                          className="flex cursor-pointer items-center gap-2 border border-gray-300 bg-white p-2 text-left text-xs transition-colors hover:bg-gray-100"
                        >
                          <Badge variant="outline" className="text-xs">
                            {persona.rol}
                          </Badge>
                          <span className="flex-1 truncate font-medium text-gray-900">
                            {persona.nombre}
                          </span>
                          {persona.licencia_categoria && (
                            <span className="text-gray-500">Cat: {persona.licencia_categoria}</span>
                          )}
                          <Eye className="h-3 w-3 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehículos */}
                {hab.vehiculos.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase text-gray-700">
                      Vehículos ({hab.vehiculos.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {hab.vehiculos.map(vehiculo => (
                        <button
                          key={vehiculo.id}
                          onClick={() => {
                            setSelectedVehiculo(vehiculo)
                            setShowVehiculoModal(true)
                          }}
                          className="inline-flex cursor-pointer items-center gap-2 border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-100"
                        >
                          <span>{vehiculo.dominio || 'N/A'}</span>
                          <Eye className="h-3 w-3 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Establecimientos */}
                {hab.establecimientos.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase text-gray-700">
                      Destinos ({hab.establecimientos.length})
                    </h4>
                    <div className="space-y-1">
                      {hab.establecimientos.map(est => (
                        <div
                          key={est.id}
                          className="border border-gray-300 bg-white p-2 text-xs text-gray-700"
                        >
                          {est.nombre || 'N/A'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observaciones */}
                {hab.observaciones && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Observaciones</h4>
                    <p className="rounded border bg-white p-3 text-sm text-gray-600">
                      {hab.observaciones}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Modales */}
      <VehiculoModal
        vehiculo={selectedVehiculo}
        open={showVehiculoModal}
        onClose={() => setShowVehiculoModal(false)}
      />

      <PersonaModal
        persona={selectedPersona}
        open={showPersonaModal}
        onClose={() => setShowPersonaModal(false)}
      />

      <DetalleModal
        habilitacion={selectedHabilitacion}
        open={showDetalleModal}
        onClose={() => setShowDetalleModal(false)}
      />

      <EditarHabilitacionDialog
        habilitacion={selectedHabilitacion}
        open={showEditarDialog}
        onClose={() => setShowEditarDialog(false)}
        onSaved={() => {
          setShowEditarDialog(false)
          // Recargar la página para reflejar los cambios
          router.refresh()
        }}
      />

      {selectedHabilitacion && (
        <ModalObleas
          habilitacionId={selectedHabilitacion.id}
          nroLicencia={selectedHabilitacion.nro_licencia}
          open={showObleasModal}
          onClose={() => setShowObleasModal(false)}
        />
      )}

      {/* Modal de Cambio de Material */}
      {selectedHabilitacion && selectedHabilitacion.vehiculos?.[0] && (
        <ModalCambioVehiculo
          open={showCambioVehiculoModal}
          onOpenChange={setShowCambioVehiculoModal}
          habilitacionId={selectedHabilitacion.id}
          vehiculoActual={{
            id: selectedHabilitacion.vehiculos[0].id,
            dominio: selectedHabilitacion.vehiculos[0].dominio,
            marca: selectedHabilitacion.vehiculos[0].marca,
            modelo: selectedHabilitacion.vehiculos[0].modelo,
          }}
          onCambioExitoso={() => {
            setShowCambioVehiculoModal(false)
            // Refrescar la página para ver el nuevo vehículo
            router.refresh()
          }}
        />
      )}

      {/* Modal de Chat IA */}
      {selectedHabilitacion && showChatIAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl p-6">
            <button
              onClick={() => setShowChatIAModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <ChatIAHabilitacion
              habilitacionId={selectedHabilitacion.id}
              nroLicencia={selectedHabilitacion.nro_licencia}
            />
          </div>
        </div>
      )}
    </div>
  )
}
