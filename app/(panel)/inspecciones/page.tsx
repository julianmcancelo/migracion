'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ClipboardCheck,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Inspeccion {
  id: number
  habilitacion_id: number
  nro_licencia: string
  nombre_inspector: string
  fecha_inspeccion: string
  tipo_transporte: string
  resultado: string
  email_contribuyente?: string
  titular?: string | null
  dominio?: string | null
}

/**
 * Página principal de inspecciones
 * Lista todas las inspecciones realizadas
 */
export default function InspeccionesPage() {
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarInspecciones()
  }, [])

  const cargarInspecciones = async () => {
    try {
      const response = await fetch('/api/inspecciones')
      const data = await response.json()

      if (data.success) {
        setInspecciones(data.data)
      }
    } catch (error) {
      console.error('Error al cargar inspecciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const getResultadoBadge = (resultado: string) => {
    if (!resultado || resultado === 'PENDIENTE') {
      return 'bg-blue-100 text-blue-800 border-blue-300'
    }

    const resultadoUpper = resultado.toUpperCase()

    if (resultadoUpper.includes('APROBAD')) {
      return 'bg-green-100 text-green-800 border-green-300'
    } else if (resultadoUpper.includes('RECHAZAD')) {
      return 'bg-red-100 text-red-800 border-red-300'
    } else if (resultadoUpper.includes('CONDICIONAL')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }

    return 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getResultadoIcon = (resultado: string) => {
    if (!resultado) return <AlertCircle className="h-4 w-4" />

    const resultadoUpper = resultado.toUpperCase()

    if (resultadoUpper.includes('APROBAD')) {
      return <CheckCircle className="h-4 w-4" />
    } else if (resultadoUpper.includes('RECHAZAD')) {
      return <XCircle className="h-4 w-4" />
    }

    return <AlertCircle className="h-4 w-4" />
  }

  const enviarEmail = async (inspeccionId: number, email: string) => {
    if (!confirm(`¿Enviar informe de inspección a ${email}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/inspecciones/${inspeccionId}/enviar-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Email enviado correctamente')
      } else {
        alert('❌ Error al enviar email: ' + (data.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error al enviar email:', error)
      alert('❌ Error al enviar email')
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:gap-3 sm:text-3xl lg:text-4xl">
            <ClipboardCheck className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
            Inspecciones Vehiculares
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">Gestión de inspecciones técnicas de vehículos</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Link href="/turnos" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-blue-600 text-sm text-blue-600 hover:bg-blue-50 sm:w-auto sm:text-base">
              <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Gestión de </span>Turnos
            </Button>
          </Link>
          <Link href="/inspecciones/nueva" className="w-full sm:w-auto">
            <Button className="w-full bg-blue-600 text-sm hover:bg-blue-700 sm:w-auto sm:text-base">
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Nueva Inspección
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 transition-shadow hover:shadow-md sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700 sm:text-sm">Pendientes</p>
              <p className="text-xl font-bold text-blue-900 sm:text-2xl">
                {inspecciones.filter(i => i.resultado === 'PENDIENTE' || !i.resultado).length}
              </p>
            </div>
            <AlertCircle className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
          </div>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-3 transition-shadow hover:shadow-md sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700 sm:text-sm">Aprobadas</p>
              <p className="text-xl font-bold text-green-900 sm:text-2xl">
                {inspecciones.filter(i => i.resultado === 'APROBADO').length}
              </p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
          </div>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 transition-shadow hover:shadow-md sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-700 sm:text-sm">Condicionales</p>
              <p className="text-xl font-bold text-yellow-900 sm:text-2xl">
                {inspecciones.filter(i => i.resultado === 'CONDICIONAL').length}
              </p>
            </div>
            <AlertCircle className="h-6 w-6 text-yellow-600 sm:h-8 sm:w-8" />
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-3 transition-shadow hover:shadow-md sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-700 sm:text-sm">Rechazadas</p>
              <p className="text-xl font-bold text-red-900 sm:text-2xl">
                {inspecciones.filter(i => i.resultado === 'RECHAZADO').length}
              </p>
            </div>
            <XCircle className="h-6 w-6 text-red-600 sm:h-8 sm:w-8" />
          </div>
        </div>
      </div>

      {/* Lista de Inspecciones */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 sm:p-12 sm:text-base">Cargando inspecciones...</div>
        ) : inspecciones.length === 0 ? (
          <div className="p-8 text-center sm:p-12">
            <ClipboardCheck className="mx-auto mb-4 h-12 w-12 text-gray-300 sm:h-16 sm:w-16" />
            <p className="mb-4 text-sm text-gray-500 sm:text-base">No hay inspecciones registradas</p>
            <Link href="/inspecciones/nueva">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-5 w-5" />
                Crear Primera Inspección
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-4 sm:py-3 sm:text-xs">
                    Fecha
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-4 sm:py-3 sm:text-xs">
                    Licencia
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-4 sm:py-3 sm:text-xs">
                    Titular
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-4 sm:py-3 sm:text-xs">
                    Dominio
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-4 sm:py-3 sm:text-xs">
                    Inspector
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-4 sm:py-3 sm:text-xs">
                    Tipo
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-4 sm:py-3 sm:text-xs">
                    Resultado
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-4 sm:py-3 sm:text-xs">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-4 sm:py-3 sm:text-xs">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inspecciones.map(inspeccion => (
                  <tr
                    key={inspeccion.id}
                    className="cursor-pointer transition-colors hover:bg-blue-50"
                    onClick={() => (window.location.href = `/inspecciones/${inspeccion.id}`)}
                    title="Click para ver/editar"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-900 sm:px-4 sm:py-3 sm:text-sm">
                      {new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-AR')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className="font-mono text-sm font-bold text-blue-600 sm:text-base">
                        {inspeccion.nro_licencia}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 sm:px-4 sm:py-3 sm:text-sm">
                      <div className="max-w-[100px] truncate sm:max-w-[150px]" title={inspeccion.titular || '-'}
                        {inspeccion.titular || '-'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm">
                      <span className="font-mono text-sm font-bold text-gray-900 sm:text-base">
                        {inspeccion.dominio || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700 sm:px-4 sm:py-3 sm:text-sm">
                      {inspeccion.nombre_inspector}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-600 sm:px-4 sm:py-3 sm:text-sm">
                      {inspeccion.tipo_transporte || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3">
                      <span
                        className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold sm:gap-1 sm:px-2 sm:py-1 sm:text-xs ${getResultadoBadge(inspeccion.resultado)}`}
                      >
                        {getResultadoIcon(inspeccion.resultado)}
                        <span className="hidden sm:inline">{inspeccion.resultado || 'Sin resultado'}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 sm:px-4 sm:py-3 sm:text-sm">
                      <div
                        className="max-w-[80px] truncate sm:max-w-[120px]"
                        title={inspeccion.email_contribuyente || '-'}
                      >
                        {inspeccion.email_contribuyente || '-'}
                      </div>
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <a
                          href={`/api/inspecciones/${inspeccion.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600 hover:text-red-900 sm:gap-1"
                          title="Descargar PDF"
                        >
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">PDF</span>
                        </a>
                        {inspeccion.email_contribuyente && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              enviarEmail(inspeccion.id, inspeccion.email_contribuyente!)
                            }}
                            className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-900 sm:gap-1"
                            title="Enviar por email"
                          >
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        )}
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
  )
}
