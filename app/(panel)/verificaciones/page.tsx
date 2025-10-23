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

export default function VerificacionesPage() {
  const [verificaciones, setVerificaciones] = useState<Verificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroResultado, setFiltroResultado] = useState<string>('todos')

  useEffect(() => {
    fetchVerificaciones()
  }, [])

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
      return 'bg-green-100 text-green-800 border-green-300'
    } else if (resultadoLower.includes('rechazad') || resultadoLower.includes('desaprob')) {
      return 'bg-red-100 text-red-800 border-red-300'
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-300'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl">
        {/* Header con gradiente */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
          <div className="mb-3 flex items-center gap-4">
            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
              <FileCheck2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="mb-1 text-3xl font-bold">Verificaciones Técnicas</h1>
              <p className="text-blue-100">Historial completo de verificaciones realizadas</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <Calendar className="h-4 w-4" />
            <span>
              Última actualización:{' '}
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Stats Cards con animación */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-blue-700">
                  Total
                </p>
                <p className="text-3xl font-bold text-blue-900">{verificaciones.length}</p>
                <p className="mt-1 text-xs text-blue-600">Verificaciones</p>
              </div>
              <div className="rounded-xl bg-blue-600 p-4 shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-green-700">
                  Aprobadas
                </p>
                <p className="text-3xl font-bold text-green-900">{statsAprobadas}</p>
                <p className="mt-1 text-xs text-green-600">
                  {statsAprobadas > 0
                    ? `${((statsAprobadas / verificaciones.length) * 100).toFixed(0)}%`
                    : '0%'}{' '}
                  del total
                </p>
              </div>
              <div className="rounded-xl bg-green-600 p-4 shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-red-700">
                  Rechazadas
                </p>
                <p className="text-3xl font-bold text-red-900">{statsRechazadas}</p>
                <p className="mt-1 text-xs text-red-600">
                  {statsRechazadas > 0
                    ? `${((statsRechazadas / verificaciones.length) * 100).toFixed(0)}%`
                    : '0%'}{' '}
                  del total
                </p>
              </div>
              <div className="rounded-xl bg-red-600 p-4 shadow-lg">
                <XCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-indigo-700">
                  Otras
                </p>
                <p className="text-3xl font-bold text-indigo-900">{statsOtras}</p>
                <p className="mt-1 text-xs text-indigo-600">
                  {statsOtras > 0
                    ? `${((statsOtras / verificaciones.length) * 100).toFixed(0)}%`
                    : '0%'}{' '}
                  del total
                </p>
              </div>
              <div className="rounded-xl bg-indigo-600 p-4 shadow-lg">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda con mejor diseño */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros y Búsqueda</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por licencia, titular, dominio o expediente..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-11 border-2 pl-10 transition-colors focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={filtroResultado === 'todos' ? 'default' : 'outline'}
                onClick={() => setFiltroResultado('todos')}
                size="sm"
                className="font-medium"
              >
                <FileText className="mr-1 h-4 w-4" />
                Todos
              </Button>
              <Button
                variant={filtroResultado === 'aprobad' ? 'default' : 'outline'}
                onClick={() => setFiltroResultado('aprobad')}
                size="sm"
                className={
                  filtroResultado === 'aprobad'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'hover:border-green-300 hover:bg-green-50 hover:text-green-700'
                }
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Aprobadas
              </Button>
              <Button
                variant={filtroResultado === 'rechazad' ? 'default' : 'outline'}
                onClick={() => setFiltroResultado('rechazad')}
                size="sm"
                className={
                  filtroResultado === 'rechazad'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                }
              >
                <XCircle className="mr-1 h-4 w-4" />
                Rechazadas
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla de Verificaciones con mejor diseño */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha/Hora
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">
                    N° Licencia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Titular
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Dominio
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">
                    Resultado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">
                    Expediente
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {verificacionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-gray-100 p-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">
                            No se encontraron verificaciones
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Intenta ajustar los filtros de búsqueda
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  verificacionesFiltradas.map(verif => (
                    <tr
                      key={verif.id}
                      className="border-b border-gray-100 transition-colors duration-150 last:border-0 hover:bg-blue-50/50"
                    >
                      <td className="px-4 py-4 text-sm">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            {new Date(verif.fecha).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="ml-5 mt-0.5 text-xs text-gray-500">
                            {formatearHora(verif.hora)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Badge
                          variant="outline"
                          className="border-blue-300 bg-blue-50 font-mono font-semibold text-blue-700"
                        >
                          {verif.nro_licencia}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{verif.nombre_titular}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          <span className="rounded bg-gray-100 px-2 py-1 font-mono font-bold text-gray-900">
                            {verif.dominio}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold shadow-sm ${getResultadoBadge(verif.resultado)}`}
                        >
                          {getResultadoIcon(verif.resultado)}
                          {verif.resultado}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {verif.expediente ? (
                          <Badge variant="secondary" className="font-medium">
                            Exp. {verif.expediente}
                          </Badge>
                        ) : (
                          <span className="italic text-gray-400">Sin expediente</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer con contadores mejorado */}
        <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <FileCheck2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Mostrando {verificacionesFiltradas.length} de {verificaciones.length} verificaciones
              </p>
              <p className="text-xs text-gray-500">
                {searchTerm && `Filtrado por: "${searchTerm}"`}
                {filtroResultado !== 'todos' &&
                  ` • Estado: ${filtroResultado === 'aprobad' ? 'Aprobadas' : 'Rechazadas'}`}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-gray-500 md:flex">
            <Calendar className="h-4 w-4" />
            <span>Sistema actualizado</span>
          </div>
        </div>
      </div>
    </div>
  )
}
