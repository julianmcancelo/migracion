'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  FileText,
  Calendar,
  User,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileCheck2,
  Download,
  Filter,
  Trash2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Verificacion {
  id: number
  nro_licencia: string
  fecha: string
  hora: string
  nombre_titular: string
  dominio: string
  resultado: string
  expediente: string | null
  creado_en: string
}

export default function VerificacionesTab() {
  const [verificaciones, setVerificaciones] = useState<Verificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroResultado, setFiltroResultado] = useState<string>('todos')
  const [puedeEliminar, setPuedeEliminar] = useState(false)

  useEffect(() => {
    fetchVerificaciones()
    verificarPermisos()
  }, [])

  const verificarPermisos = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      if (data.success && data.user) {
        setPuedeEliminar(data.user.email === 'jmcancelo@lanus.gob.ar')
      }
    } catch (error) {
      console.error('Error al verificar permisos:', error)
    }
  }

  const fetchVerificaciones = async () => {
    try {
      const response = await fetch('/api/verificaciones')
      if (!response.ok) throw new Error('Error al cargar verificaciones')

      const data = await response.json()
      setVerificaciones(data.data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('⚠️ ¿Está seguro de ELIMINAR esta verificación?\n\nEsta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/verificaciones/${id}/eliminar`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Verificación eliminada exitosamente')
        fetchVerificaciones() // Recargar la lista
      } else {
        alert('❌ Error: ' + (data.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('❌ Error al eliminar la verificación')
    }
  }

  const verificacionesFiltradas = verificaciones.filter(verif => {
    const matchSearch =
      verif.nro_licencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verif.nombre_titular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verif.dominio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verif.expediente?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchResultado =
      filtroResultado === 'todos' ||
      verif.resultado.toLowerCase().includes(filtroResultado.toLowerCase())

    return matchSearch && matchResultado
  })

  const getResultadoBadge = (resultado: string) => {
    const resultadoLower = resultado.toLowerCase()

    if (resultadoLower.includes('aprobad')) {
      return 'bg-green-100 text-green-700'
    } else if (resultadoLower.includes('rechazad') || resultadoLower.includes('desaprob')) {
      return 'bg-red-100 text-red-700'
    } else {
      return 'bg-blue-100 text-blue-700'
    }
  }

  const getResultadoIcon = (resultado: string) => {
    const resultadoLower = resultado.toLowerCase()

    if (resultadoLower.includes('aprobad')) {
      return <CheckCircle className="h-4 w-4" />
    } else if (resultadoLower.includes('rechazad') || resultadoLower.includes('desaprob')) {
      return <XCircle className="h-4 w-4" />
    } else {
      return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatearHora = (hora: any) => {
    if (!hora) return 'N/A'

    // Si es un string en formato TIME (HH:MM:SS) o solo hora
    if (typeof hora === 'string') {
      // Extraer solo HH:MM de formatos como "1970-01-01T10:03:00" o "10:03:00"
      const match = hora.match(/(\d{2}):(\d{2})/)
      if (match) {
        return `${match[1]}:${match[2]}`
      }
      return hora
    }

    // Si es un objeto Date
    if (hora instanceof Date) {
      return hora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    }

    return String(hora)
  }

  const statsAprobadas = verificaciones.filter(v =>
    v.resultado.toLowerCase().includes('aprobad')
  ).length
  const statsRechazadas = verificaciones.filter(
    v =>
      v.resultado.toLowerCase().includes('rechazad') ||
      v.resultado.toLowerCase().includes('desaprob')
  ).length
  const statsOtras = verificaciones.length - statsAprobadas - statsRechazadas

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando verificaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Resumen Simple */}
      <div className="flex flex-wrap gap-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
          <span className="text-xs text-blue-700">Total:</span>
          <span className="ml-2 text-lg font-bold text-blue-900">{verificaciones.length}</span>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <span className="text-xs text-green-700">Aprobadas:</span>
          <span className="ml-2 text-lg font-bold text-green-900">{statsAprobadas}</span>
          <span className="ml-1 text-xs text-green-600">
            ({statsAprobadas > 0 ? `${((statsAprobadas / verificaciones.length) * 100).toFixed(0)}%` : '0%'})
          </span>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <span className="text-xs text-red-700">Rechazadas:</span>
          <span className="ml-2 text-lg font-bold text-red-900">{statsRechazadas}</span>
          <span className="ml-1 text-xs text-red-600">
            ({statsRechazadas > 0 ? `${((statsRechazadas / verificaciones.length) * 100).toFixed(0)}%` : '0%'})
          </span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <span className="text-xs text-gray-700">Otras:</span>
          <span className="ml-2 text-lg font-bold text-gray-900">{statsOtras}</span>
        </div>
      </div>

      {/* Búsqueda Simple */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-900">Buscar</h2>
        </div>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Buscar por licencia, titular, dominio..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroResultado('todos')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filtroResultado === 'todos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Todos ({verificaciones.length})
            </button>
            <button
              onClick={() => setFiltroResultado('aprobad')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filtroResultado === 'aprobad'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✅ Aprobadas ({statsAprobadas})
            </button>
            <button
              onClick={() => setFiltroResultado('rechazad')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filtroResultado === 'rechazad'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ❌ Rechazadas ({statsRechazadas})
            </button>
          </div>
        </div>
      </div>

      {/* Tabla Simplificada */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                  Fecha/Hora
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
                  Resultado
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                  Expediente
                </th>
                {puedeEliminar && (
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {verificacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={puedeEliminar ? 7 : 6} className="px-4 py-12 text-center">
                    <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">No se encontraron verificaciones</p>
                  </td>
                </tr>
              ) : (
                verificacionesFiltradas.map(verif => (
                  <tr key={verif.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {new Date(verif.fecha).toLocaleDateString('es-AR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatearHora(verif.hora)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {verif.nro_licencia}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {verif.nombre_titular}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {verif.dominio}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getResultadoBadge(verif.resultado)}`}
                      >
                        {getResultadoIcon(verif.resultado)}
                        {verif.resultado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {verif.expediente ? `Exp. ${verif.expediente}` : '-'}
                    </td>
                    {puedeEliminar && (
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEliminar(verif.id)
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar verificación"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>

      {/* Contador Simple */}
      {verificacionesFiltradas.length !== verificaciones.length && (
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3">
          <p className="text-sm text-blue-900">
            Mostrando {verificacionesFiltradas.length} de {verificaciones.length} verificaciones
            {searchTerm && ` • Buscando: "${searchTerm}"`}
          </p>
        </div>
      )}
    </div>
  )
}
