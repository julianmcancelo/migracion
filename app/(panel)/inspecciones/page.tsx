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
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'PENDIENTE' | 'APROBADO' | 'CONDICIONAL' | 'RECHAZADO'>('TODAS')

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

  // Filtrar inspecciones según el estado seleccionado
  const inspeccionesFiltradas = inspecciones.filter(inspeccion => {
    if (filtroEstado === 'TODAS') return true
    if (filtroEstado === 'PENDIENTE') return !inspeccion.resultado || inspeccion.resultado === 'PENDIENTE'
    return inspeccion.resultado === filtroEstado
  })

  return (
    <div className="space-y-4">
      {/* Header Simplificado */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
              Inspecciones Vehiculares
            </h1>
            <p className="mt-1 text-sm text-gray-500">Gestión de inspecciones técnicas</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Link href="/turnos" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-4 w-4" />
                Turnos
              </Button>
            </Link>
            <Link href="/inspecciones/nueva" className="w-full sm:w-auto">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Inspección
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filtros por Estado */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroEstado('TODAS')}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              filtroEstado === 'TODAS'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Todas ({inspecciones.length})
          </button>
          <button
            onClick={() => setFiltroEstado('PENDIENTE')}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              filtroEstado === 'PENDIENTE'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pendientes ({inspecciones.filter(i => i.resultado === 'PENDIENTE' || !i.resultado).length})
          </button>
          <button
            onClick={() => setFiltroEstado('APROBADO')}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              filtroEstado === 'APROBADO'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Aprobadas ({inspecciones.filter(i => i.resultado === 'APROBADO').length})
          </button>
          <button
            onClick={() => setFiltroEstado('CONDICIONAL')}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              filtroEstado === 'CONDICIONAL'
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Condicionales ({inspecciones.filter(i => i.resultado === 'CONDICIONAL').length})
          </button>
          <button
            onClick={() => setFiltroEstado('RECHAZADO')}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              filtroEstado === 'RECHAZADO'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Rechazadas ({inspecciones.filter(i => i.resultado === 'RECHAZADO').length})
          </button>
        </div>
      </div>

      {/* Lista de Inspecciones Simplificada */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando inspecciones...</div>
        ) : inspecciones.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardCheck className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="mb-4 text-gray-500">No hay inspecciones registradas</p>
            <Link href="/inspecciones/nueva">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-5 w-5" />
                Crear Primera Inspección
              </Button>
            </Link>
          </div>
        ) : inspeccionesFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No hay inspecciones con el estado seleccionado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Fecha
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Licencia
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Titular
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Dominio
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Inspector
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Resultado
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inspeccionesFiltradas.map(inspeccion => (
                  <tr
                    key={inspeccion.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => (window.location.href = `/inspecciones/${inspeccion.id}`)}
                    title="Click para ver/editar"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-AR')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {inspeccion.nro_licencia}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="max-w-[150px] truncate" title={inspeccion.titular || '-'}>
                        {inspeccion.titular || '-'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {inspeccion.dominio || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {inspeccion.nombre_inspector}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getResultadoBadge(inspeccion.resultado)}`}
                      >
                        {getResultadoIcon(inspeccion.resultado)}
                        {inspeccion.resultado || 'Pendiente'}
                      </span>
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-3 text-right"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/api/inspecciones/${inspeccion.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                          title="Descargar PDF"
                        >
                          PDF
                        </a>
                        {inspeccion.email_contribuyente && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              enviarEmail(inspeccion.id, inspeccion.email_contribuyente!)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Enviar por email"
                          >
                            <Mail className="h-4 w-4" />
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
