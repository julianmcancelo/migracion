'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Edit, FileText, Download, AlertTriangle, 
  Info, Users, Car, Calendar, CheckCircle, ClipboardCheck, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HabilitacionDetalleProps {
  id: string
}

/**
 * Componente principal de detalle de habilitación
 * Diseño similar al sistema PHP original
 */
export function HabilitacionDetalle({ id }: HabilitacionDetalleProps) {
  const [habilitacion, setHabilitacion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alertas, setAlertas] = useState<any[]>([])
  const [obleas, setObleas] = useState<any[]>([])
  const [verificaciones, setVerificaciones] = useState<any[]>([])
  const [inspecciones, setInspecciones] = useState<any[]>([])
  const [eliminandoInspeccion, setEliminandoInspeccion] = useState<number | null>(null)

  useEffect(() => {
    fetchHabilitacion()
    fetchHistoriales()
  }, [id])

  const fetchHabilitacion = async () => {
    try {
      const response = await fetch(`/api/habilitaciones/${id}`)
      if (!response.ok) throw new Error('Error al cargar habilitación')
      
      const data = await response.json()
      setHabilitacion(data.data)
      
      // Calcular alertas de vencimiento
      calcularAlertas(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistoriales = async () => {
    try {
      // Cargar obleas
      const obleasRes = await fetch(`/api/habilitaciones/${id}/obleas`)
      if (obleasRes.ok) {
        const obleasData = await obleasRes.json()
        setObleas(obleasData.data || [])
      }

      // Cargar verificaciones
      const verifRes = await fetch(`/api/habilitaciones/${id}/verificaciones`)
      if (verifRes.ok) {
        const verifData = await verifRes.json()
        setVerificaciones(verifData.data || [])
      }

      // Cargar inspecciones
      const inspRes = await fetch(`/api/habilitaciones/${id}/inspecciones`)
      if (inspRes.ok) {
        const inspData = await inspRes.json()
        setInspecciones(inspData.data || [])
      }
    } catch (err) {
      console.error('Error cargando historiales:', err)
    }
  }

  const handleEliminarInspeccion = async (inspeccionId: number) => {
    if (!confirm('¿Está seguro de eliminar esta inspección? Esta acción no se puede deshacer.')) {
      return
    }

    setEliminandoInspeccion(inspeccionId)
    try {
      const res = await fetch(`/api/inspecciones/${inspeccionId}/eliminar`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Inspección eliminada exitosamente')
        // Actualizar lista de inspecciones
        setInspecciones(prev => prev.filter(insp => insp.id !== inspeccionId))
      } else {
        alert('❌ Error al eliminar inspección: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al eliminar inspección')
    } finally {
      setEliminandoInspeccion(null)
    }
  }

  const calcularAlertas = (hab: any) => {
    const alertasTemp: any[] = []
    const hoy = new Date()
    const limite30Dias = new Date()
    limite30Dias.setDate(limite30Dias.getDate() + 30)

    const checkVencimiento = (fechaStr: string | null, nombre: string) => {
      if (!fechaStr) return
      
      const fechaVenc = new Date(fechaStr)
      
      if (fechaVenc < hoy) {
        alertasTemp.push({
          tipo: 'vencido',
          mensaje: `${nombre} VENCIDA el día ${fechaVenc.toLocaleDateString('es-AR')}`
        })
      } else if (fechaVenc <= limite30Dias) {
        const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
        alertasTemp.push({
          tipo: 'pronto',
          mensaje: `${nombre} PRONTA A VENCER. Vence el ${fechaVenc.toLocaleDateString('es-AR')} (en ${diasRestantes} días)`
        })
      }
    }

    checkVencimiento(hab.vigencia_fin, 'La Habilitación')
    
    if (hab.vehiculos?.[0]) {
      checkVencimiento(hab.vehiculos[0].Vencimiento_VTV, 'La VTV')
      checkVencimiento(hab.vehiculos[0].Vencimiento_Poliza, 'La Póliza de Seguro')
    }

    setAlertas(alertasTemp)
  }

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { class: string; label: string }> = {
      'HABILITADO': { class: 'bg-green-100 text-green-800', label: 'HABILITADO' },
      'VENCIDO': { class: 'bg-red-100 text-red-800', label: 'VENCIDO' },
      'EN_TRAMITE': { class: 'bg-yellow-100 text-yellow-800', label: 'EN TRÁMITE' },
    }
    
    const config = estados[estado] || { class: 'bg-gray-100 text-gray-800', label: estado }
    return <Badge className={config.class}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando habilitación...</p>
        </div>
      </div>
    )
  }

  if (error || !habilitacion) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg">
          <p className="font-bold text-lg">Error al Cargar la Habilitación</p>
          <p className="mt-2">{error || 'Habilitación no encontrada'}</p>
          <Link href="/habilitaciones" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-xl font-bold text-blue-600">Detalle de Habilitación</h1>
          <Link 
            href="/habilitaciones"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 mb-16">
        {/* Título y Botones de Acción */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-wrap justify-between items-start gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Licencia N° <span className="font-mono text-blue-600">{habilitacion.numero || 'N/A'}</span>
              </h2>
              <p className="mt-1 text-gray-600">
                Información detallada y registro de actividad de la habilitación.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/habilitaciones/${id}/editar`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                <Edit className="h-5 w-5" />
                Editar
              </Link>
              
              <Button
                variant="outline"
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold"
              >
                <FileText className="h-5 w-5 mr-2" />
                Credencial
              </Button>
              
              <Button
                variant="outline"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold"
              >
                <Download className="h-5 w-5 mr-2" />
                Descargar Constancia
              </Button>
              
              <Button
                variant="outline"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                <FileText className="h-5 w-5 mr-2" />
                Descargar Resolución
              </Button>
            </div>
          </div>
        </div>

        {/* Alertas de Vencimiento */}
        {alertas.length > 0 && (
          <div className="space-y-4 mb-8">
            {alertas.map((alerta, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg flex items-center gap-4 ${
                  alerta.tipo === 'vencido'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                }`}
              >
                <AlertTriangle className="h-8 w-8 flex-shrink-0" />
                <p><strong>{alerta.mensaje}</strong></p>
              </div>
            ))}
          </div>
        )}

        {/* Grid Principal: 3 columnas en desktop */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Columna Izquierda: Datos generales */}
          <div className="xl:col-span-1 space-y-8">
            {/* Datos de la Habilitación */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Info className="h-6 w-6 text-blue-600" />
                Datos de la Habilitación
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-gray-600">Estado</dt>
                  <dd className="mt-1">{getEstadoBadge(habilitacion.estado)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-600">Tipo Trámite</dt>
                  <dd className="mt-1">{habilitacion.tipo || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-600">Transporte</dt>
                  <dd className="mt-1">{habilitacion.tipo_transporte || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-600">Vigencia Inicio</dt>
                  <dd className="mt-1">
                    {habilitacion.vigencia_inicio 
                      ? new Date(habilitacion.vigencia_inicio).toLocaleDateString('es-AR')
                      : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-600">Vigencia Fin</dt>
                  <dd className="mt-1 font-bold">
                    {habilitacion.vigencia_fin 
                      ? new Date(habilitacion.vigencia_fin).toLocaleDateString('es-AR')
                      : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Personas Asociadas */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Users className="h-6 w-6 text-blue-600" />
                Personas Asociadas
              </h3>
              <div className="space-y-4">
                {habilitacion.personas && habilitacion.personas.length > 0 ? (
                  habilitacion.personas.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <p className="font-bold">{p.nombre}</p>
                          <Badge variant="outline">{p.rol}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">DNI: {p.dni}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="italic text-gray-500">Sin personas asociadas.</p>
                )}
              </div>
            </div>

            {/* Vehículo Asociado */}
            {habilitacion.vehiculos && habilitacion.vehiculos[0] && (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <Car className="h-6 w-6 text-blue-600" />
                  Vehículo Asociado
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  {(() => {
                    const v = habilitacion.vehiculos[0]
                    return (
                      <>
                        <div className="sm:col-span-2">
                          <dt className="font-semibold text-gray-600">Dominio</dt>
                          <dd className="mt-1 font-mono font-bold text-base">{v.dominio}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-600">Marca</dt>
                          <dd className="mt-1">{v.marca || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-600">Modelo</dt>
                          <dd className="mt-1">{v.modelo || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-600">Año</dt>
                          <dd className="mt-1">{v.ano || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-600">Asientos</dt>
                          <dd className="mt-1">{v.asientos || 'N/A'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="font-semibold text-gray-600">Chasis</dt>
                          <dd className="mt-1 font-mono">{v.chasis || 'N/A'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="font-semibold text-gray-600">Motor</dt>
                          <dd className="mt-1 font-mono">{v.motor || 'N/A'}</dd>
                        </div>
                        <hr className="sm:col-span-2 my-2" />
                        <div>
                          <dt className="font-semibold text-gray-600">Aseguradora</dt>
                          <dd className="mt-1">{v.Aseguradora || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-600">Póliza N°</dt>
                          <dd className="mt-1">{v.poliza || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-600">Vencimiento Póliza</dt>
                          <dd className="mt-1 font-bold">
                            {v.Vencimiento_Poliza 
                              ? new Date(v.Vencimiento_Poliza).toLocaleDateString('es-AR')
                              : 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-600">Vencimiento VTV</dt>
                          <dd className="mt-1 font-bold">
                            {v.Vencimiento_VTV 
                              ? new Date(v.Vencimiento_VTV).toLocaleDateString('es-AR')
                              : 'N/A'}
                          </dd>
                        </div>
                      </>
                    )
                  })()}
                </dl>
              </div>
            )}
          </div>

          {/* Columna Derecha: Historial */}
          <div className="xl:col-span-2 space-y-8">
            {/* Historial de Obleas */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                Historial de Colocación de Obleas
              </h3>
              {obleas.length === 0 ? (
                <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-lg">
                  <p>No hay registros de colocación de obleas para esta habilitación.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha Solicitud</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Hora</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {obleas.map((oblea: any) => (
                        <tr key={oblea.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {new Date(oblea.fecha_solicitud).toLocaleDateString('es-AR')}
                          </td>
                          <td className="px-4 py-3">
                            {oblea.hora_solicitud}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              oblea.notificado === 'si' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {oblea.notificado === 'si' ? 'Notificado' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Historial de Verificaciones */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                Historial de Verificaciones
              </h3>
              {verificaciones.length === 0 ? (
                <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-lg">
                  <p>No hay verificaciones técnicas registradas.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Hora</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Titular</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Dominio</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {verificaciones.map((verif: any) => (
                        <tr key={verif.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {new Date(verif.fecha).toLocaleDateString('es-AR')}
                          </td>
                          <td className="px-4 py-3">{verif.hora}</td>
                          <td className="px-4 py-3">{verif.nombre_titular}</td>
                          <td className="px-4 py-3 font-mono font-medium">{verif.dominio}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              verif.resultado?.toLowerCase().includes('aprobad') 
                                ? 'bg-green-100 text-green-800'
                                : verif.resultado?.toLowerCase().includes('rechazad') || verif.resultado?.toLowerCase().includes('desaprob')
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {verif.resultado || 'Verificada'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Historial de Inspecciones */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
                Historial de Inspecciones
              </h3>
              {inspecciones.length === 0 ? (
                <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-lg">
                  <p>No hay inspecciones técnicas registradas.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Inspector</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Resultado</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inspecciones.map((insp: any) => (
                        <tr key={insp.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {new Date(insp.fecha_inspeccion).toLocaleDateString('es-AR')}
                          </td>
                          <td className="px-4 py-3">{insp.nombre_inspector}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              insp.resultado === 'APROBADO' 
                                ? 'bg-green-100 text-green-800'
                                : insp.resultado === 'RECHAZADO'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {insp.resultado || 'PENDIENTE'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <a
                                href={`/api/inspecciones/${insp.id}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                Ver PDF
                              </a>
                              <button
                                onClick={() => handleEliminarInspeccion(insp.id)}
                                disabled={eliminandoInspeccion === insp.id}
                                className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1 disabled:opacity-50"
                                title="Eliminar inspección"
                              >
                                {eliminandoInspeccion === insp.id ? (
                                  <>
                                    <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                                    Eliminando...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
