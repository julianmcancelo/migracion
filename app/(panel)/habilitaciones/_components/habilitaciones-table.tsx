'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, MoreVertical, Eye, Edit, FileText, Calendar, Download, QrCode, Shield } from 'lucide-react'
import { VehiculoModal } from './vehiculo-modal'
import { PersonaModal } from './persona-modal'
import { DetalleModal } from './detalle-modal'
import { EditarHabilitacionDialog } from './editar-habilitacion-dialog'
import { ModalObleas } from '@/components/obleas/modal-obleas'
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
  const [showObleasModal, setShowObleasModal] = useState(false)

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
    // Redirigir a la página de turnos con la licencia precargada
    router.push(`/turnos?licencia=${hab.nro_licencia}`)
  }

  const handleDescargarPDF = async (hab: any) => {
    try {
      // TODO: Implementar generación de PDF
      alert(`Descargando PDF de habilitación #${hab.id}`)
    } catch (error) {
      console.error('Error al descargar PDF:', error)
    }
  }

  const handleGenerarCredencial = async (hab: any) => {
    try {
      const res = await fetch(`/api/habilitaciones/${hab.id}/generar-token-credencial`, {
        method: 'POST'
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

  const handleGestionarObleas = (hab: any) => {
    setSelectedHabilitacion(hab)
    setShowObleasModal(true)
  }

  const getEstadoBadge = (estado: string | null) => {
    const estados: Record<string, { className: string; label: string }> = {
      'HABILITADO': { 
        className: 'bg-green-600 text-white border-green-700',
        label: 'Habilitado' 
      },
      'EN_TRAMITE': { 
        className: 'bg-yellow-500 text-white border-yellow-600',
        label: 'En Trámite' 
      },
      'NO_HABILITADO': { 
        className: 'bg-red-600 text-white border-red-700',
        label: 'No Habilitado' 
      },
      'INICIADO': { 
        className: 'bg-blue-600 text-white border-blue-700',
        label: 'Iniciado' 
      },
    }

    const config = estados[estado || ''] || { 
      className: 'bg-gray-400 text-white border-gray-500',
      label: estado || 'N/A' 
    }
    return <Badge className={`${config.className} px-2.5 py-0.5 text-xs font-medium border uppercase`}>{config.label}</Badge>
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
      return (
        <Badge className="bg-orange-500 text-white text-xs">
          {diasRestantes} días
        </Badge>
      )
    }
    return null
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
    <div className="space-y-2">
      {habilitaciones.map((hab) => {
        const isExpanded = expandedRows.has(hab.id)
        
        return (
          <div 
            key={hab.id} 
            className="border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            {/* Fila principal */}
            <div className="flex items-center p-4 gap-4">
              {/* Botón expandir */}
              <button
                onClick={() => toggleRow(hab.id)}
                className="shrink-0 p-1 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-gray-600 transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>

              {/* Licencia y Expediente */}
              <div className="min-w-0 flex-shrink-0 w-40">
                <div className="font-semibold text-sm text-gray-900 truncate">{hab.nro_licencia || 'N/A'}</div>
                <div className="text-xs text-gray-500 truncate">Exp: {hab.expte || 'N/A'}</div>
              </div>

              {/* Titular */}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {hab.titular_principal || <span className="italic text-gray-500">Sin asignar</span>}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {hab.tipo_transporte || 'Sin tipo'}
                </div>
              </div>

              {/* Estado */}
              <div className="flex-shrink-0">
                {getEstadoBadge(hab.estado)}
              </div>

              {/* Vigencia */}
              <div className="flex-shrink-0 w-32">
                <div className="text-xs text-gray-500 mb-0.5">Vence</div>
                <div className="text-sm font-semibold text-gray-900">
                  {hab.vigencia_fin ? formatearFecha(hab.vigencia_fin) : 'N/A'}
                </div>
                <div className="mt-1">
                  {getEstadoVigencia(hab.vigencia_fin)}
                </div>
              </div>

              {/* Menú de acciones */}
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="h-4 w-4" />
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
                    <DropdownMenuItem onClick={() => handleGenerarCredencial(hab)} className="cursor-pointer">
                      <QrCode className="h-4 w-4 mr-2" />
                      Ver Credencial
                    </DropdownMenuItem>
                    {hab.estado === 'HABILITADO' && (
                      <DropdownMenuItem onClick={() => handleGestionarObleas(hab)} className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" />
                        Gestionar Obleas
                      </DropdownMenuItem>
                    )}
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
              <div className="border-t bg-gray-50 p-4 space-y-3">
                {/* Personas */}
                {hab.personas.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                      Personas ({hab.personas.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {hab.personas.map((persona) => (
                        <button
                          key={persona.id}
                          onClick={() => {
                            setSelectedPersona(persona)
                            setShowPersonaModal(true)
                          }}
                          className="flex items-center gap-2 text-xs bg-white p-2 border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer text-left"
                        >
                          <Badge variant="outline" className="text-xs">
                            {persona.rol}
                          </Badge>
                          <span className="font-medium text-gray-900 flex-1 truncate">{persona.nombre}</span>
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
                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                      Vehículos ({hab.vehiculos.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {hab.vehiculos.map((vehiculo) => (
                        <button
                          key={vehiculo.id}
                          onClick={() => {
                            setSelectedVehiculo(vehiculo)
                            setShowVehiculoModal(true)
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer"
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
                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                      Destinos ({hab.establecimientos.length})
                    </h4>
                    <div className="space-y-1">
                      {hab.establecimientos.map((est) => (
                        <div key={est.id} className="text-xs bg-white p-2 border border-gray-300 text-gray-700">
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

      {selectedHabilitacion && (
        <ModalObleas
          habilitacionId={selectedHabilitacion.id}
          nroLicencia={selectedHabilitacion.nro_licencia}
          open={showObleasModal}
          onClose={() => setShowObleasModal(false)}
        />
      )}
    </div>
  )
}
