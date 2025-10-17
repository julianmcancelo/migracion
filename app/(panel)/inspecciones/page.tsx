'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ClipboardCheck, Plus, Calendar, CheckCircle, XCircle, AlertCircle, FileText, Download } from 'lucide-react'
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
    const badges = {
      APROBADO: 'bg-green-100 text-green-800 border-green-300',
      CONDICIONAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      RECHAZADO: 'bg-red-100 text-red-800 border-red-300'
    }
    return badges[resultado as keyof typeof badges] || badges.APROBADO
  }

  const getResultadoIcon = (resultado: string) => {
    switch (resultado) {
      case 'APROBADO':
        return <CheckCircle className="h-4 w-4" />
      case 'RECHAZADO':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            Inspecciones Vehiculares
          </h1>
          <p className="text-gray-600 mt-2">
            Gestión de inspecciones técnicas de vehículos
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/turnos">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <Calendar className="h-5 w-5 mr-2" />
              Gestión de Turnos
            </Button>
          </Link>
          <Link href="/inspecciones/nueva">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Nueva Inspección
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Aprobadas</p>
              <p className="text-2xl font-bold text-green-900">
                {inspecciones.filter(i => i.resultado === 'APROBADO').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Condicionales</p>
              <p className="text-2xl font-bold text-yellow-900">
                {inspecciones.filter(i => i.resultado === 'CONDICIONAL').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Rechazadas</p>
              <p className="text-2xl font-bold text-red-900">
                {inspecciones.filter(i => i.resultado === 'RECHAZADO').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Lista de Inspecciones */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Cargando inspecciones...
          </div>
        ) : inspecciones.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay inspecciones registradas</p>
            <Link href="/inspecciones/nueva">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                Crear Primera Inspección
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Licencia
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resultado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inspecciones.map((inspeccion) => (
                  <tr key={inspeccion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-mono font-bold text-blue-600">
                        {inspeccion.nro_licencia}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inspeccion.nombre_inspector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {inspeccion.tipo_transporte || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getResultadoBadge(inspeccion.resultado)}`}>
                        {getResultadoIcon(inspeccion.resultado)}
                        {inspeccion.resultado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {inspeccion.email_contribuyente || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={`/api/inspecciones/${inspeccion.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 font-medium"
                        title="Descargar PDF"
                      >
                        <FileText className="h-4 w-4" />
                        PDF
                      </a>
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
