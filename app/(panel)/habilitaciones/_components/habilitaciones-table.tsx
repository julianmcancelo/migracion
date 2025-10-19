'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, MoreVertical, Eye, Edit, FileText, Calendar, Download } from 'lucide-react'
import { VehiculoModal } from './vehiculo-modal'
import { PersonaModal } from './persona-modal'
import { DetalleModal } from './detalle-modal'
import { EditarHabilitacionDialog } from './editar-habilitacion-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(null)
  const [selectedPersona, setSelectedPersona] = useState<any>(null)
  const [selectedHabilitacion, setSelectedHabilitacion] = useState<any>(null)
  const [showVehiculoModal, setShowVehiculoModal] = useState(false)
  const [showPersonaModal, setShowPersonaModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showEditarDialog, setShowEditarDialog] = useState(false)

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
  const handleVerDetalle = (hab: any) => {
    setSelectedHabilitacion(hab)
    setShowDetalleModal(true)
  }

  const handleEditar = (hab: any) => {
    setSelectedHabilitacion(hab)
    setShowEditarDialog(true)
  }

  const handleAsignarTurno = (hab: any) => {
    // TODO: Implementar modal de turnos
    alert(`Asignar turno a habilitación #${hab.id}`)
  }

  const handleDescargarPDF = async (hab: any) => {
    try {
      // TODO: Implementar generación de PDF
      alert(`Descargando PDF de habilitación #${hab.id}`)
    } catch (error) {
      console.error('Error al descargar PDF:', error)
    }
  }

  const getEstadoBadge = (estado: string | null) => {
    const estados: Record<string, { className: string; label: string }> = {
      'HABILITADO': { 
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm',
        label: '✓ Habilitado' 
      },
      'EN_TRAMITE': { 
        className: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-sm',
        label: '⏳ En Trámite' 
      },
      'NO_HABILITADO': { 
        className: 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-sm',
        label: '✗ No Habilitado' 
      },
      'INICIADO': { 
        className: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-0 shadow-sm',
        label: '📝 Iniciado' 
      },
    }

    const config = estados[estado || ''] || { 
      className: 'bg-gray-200 text-gray-700 border-0',
      label: estado || 'N/A' 
    }
    return <Badge className={`${config.className} px-3 py-1 text-xs font-semibold`}>{config.label}</Badge>
  }

  const getEstadoVigencia = (fecha: Date | null) => {
    if (!fecha) return null

    const hoy = new Date()
    const vigencia = new Date(fecha)
    const diasRestantes = Math.ceil((vigencia.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    if (diasRestantes < 0) {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-sm px-2 py-0.5 text-xs font-semibold animate-pulse">
          ⚠️ Vencida
        </Badge>
      )
    } else if (diasRestantes <= 30) {
      return (
        <Badge className="bg-gradient-to-r from-orange-400 to-amber-500 text-white border-0 shadow-sm px-2 py-0.5 text-xs font-semibold">
          🔔 {diasRestantes}d restantes
        </Badge>
      )
    }
    return (
      <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-sm px-2 py-0.5 text-xs font-semibold">
        ✓ Vigente
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (habilitaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
          <FileText className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron habilitaciones</h3>
        <p className="text-gray-500">Intenta con otro término de búsqueda o revisa los filtros</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {habilitaciones.map((hab) => {
        const isExpanded = expandedRows.has(hab.id)
        
        return (
          <div 
            key={hab.id} 
            className="group relative border-2 border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200"
          >
            {/* Borde decorativo superior con gradiente */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            
            {/* Fila principal */}
            <div className="flex items-center p-5 gap-4 pt-6">
              {/* Botón expandir con mejor diseño */}
              <button
                onClick={() => toggleRow(hab.id)}
                className="shrink-0 p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <ChevronRight
                  className={cn(
                    "h-5 w-5 text-blue-600 transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>

              {/* Licencia y Expediente con icono */}
              <div className="min-w-0 flex-shrink-0 w-44">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-lg text-blue-700 truncate">{hab.nro_licencia || 'N/A'}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-medium truncate pl-10">Exp: {hab.expte || 'N/A'}</div>
              </div>

              {/* Titular con mejor diseño */}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 truncate text-base">
                  {hab.titular_principal || <span className="italic text-gray-400">Sin asignar</span>}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {hab.tipo_transporte || 'Sin tipo'}
                </div>
              </div>

              {/* Estado con mejor estilo */}
              <div className="flex-shrink-0">
                {getEstadoBadge(hab.estado)}
              </div>

              {/* Vigencia con diseño mejorado */}
              <div className="flex-shrink-0 w-36 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Vence</div>
                <div className="text-sm font-bold text-gray-900">
                  {hab.vigencia_fin ? formatearFecha(hab.vigencia_fin) : 'N/A'}
                </div>
                <div className="mt-1.5">
                  {getEstadoVigencia(hab.vigencia_fin)}
                </div>
              </div>

              {/* Menú de acciones con mejor botón */}
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleVerDetalle(hab)} className="cursor-pointer">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditar(hab)} className="cursor-pointer">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {hab.tiene_resolucion && (
                      <DropdownMenuItem className="cursor-pointer">
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Resolución
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleAsignarTurno(hab)} className="cursor-pointer">
                      <Calendar className="h-4 w-4 mr-2" />
                      Asignar Turno
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDescargarPDF(hab)} className="cursor-pointer">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Detalles expandibles */}
            {isExpanded && (
              <div className="border-t bg-gradient-to-br from-gray-50 to-blue-50/30 p-5 space-y-4">
                {/* Personas */}
                {hab.personas.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      👥 Personas ({hab.personas.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {hab.personas.map((persona) => (
                        <button
                          key={persona.id}
                          onClick={() => {
                            setSelectedPersona(persona)
                            setShowPersonaModal(true)
                          }}
                          className="flex items-center gap-3 text-sm bg-white p-3 rounded-lg border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left group"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {persona.nombre?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{persona.nombre}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-2 py-0.5">
                                {persona.rol}
                              </Badge>
                              {persona.licencia_categoria && (
                                <span className="text-xs text-gray-600 font-medium">Cat: {persona.licencia_categoria}</span>
                              )}
                            </div>
                          </div>
                          <Eye className="h-4 w-4 ml-auto text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehículos */}
                {hab.vehiculos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      🚗 Vehículos ({hab.vehiculos.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {hab.vehiculos.map((vehiculo) => (
                        <button
                          key={vehiculo.id}
                          onClick={() => {
                            setSelectedVehiculo(vehiculo)
                            setShowVehiculoModal(true)
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-full font-bold text-sm hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-transparent hover:shadow-md transition-all cursor-pointer group"
                        >
                          <span>🚗 {vehiculo.dominio || 'N/A'}</span>
                          <Eye className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Establecimientos */}
                {hab.establecimientos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      🏢 Destinos ({hab.establecimientos.length})
                    </h4>
                    <div className="space-y-2">
                      {hab.establecimientos.map((est) => (
                        <div key={est.id} className="text-sm bg-white p-3 rounded-lg border-2 border-gray-200 font-medium text-gray-700">
                          {est.nombre || 'N/A'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observaciones */}
                {hab.observaciones && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Observaciones</h4>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded border">{hab.observaciones}</p>
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
    </div>
  )
}
