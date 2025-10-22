'use client'

import { useEffect, useState } from 'react'
import { Search, FileText, Calendar, User, Car, CheckCircle, XCircle, AlertCircle, FileCheck2, Download, Filter } from 'lucide-react'
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

    const matchResultado = filtroResultado === 'todos' || 
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

  const statsAprobadas = verificaciones.filter(v => v.resultado.toLowerCase().includes('aprobad')).length
  const statsRechazadas = verificaciones.filter(v => v.resultado.toLowerCase().includes('rechazad') || v.resultado.toLowerCase().includes('desaprob')).length
  const statsOtras = verificaciones.length - statsAprobadas - statsRechazadas

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando verificaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header con gradiente */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileCheck2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Verificaciones Técnicas</h1>
              <p className="text-blue-100">Historial completo de verificaciones realizadas</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <Calendar className="h-4 w-4" />
            <span>Última actualización: {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Cards con animación */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-semibold uppercase tracking-wide mb-1">Total</p>
                <p className="text-3xl font-bold text-blue-900">{verificaciones.length}</p>
                <p className="text-xs text-blue-600 mt-1">Verificaciones</p>
              </div>
              <div className="p-4 bg-blue-600 rounded-xl shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-semibold uppercase tracking-wide mb-1">Aprobadas</p>
                <p className="text-3xl font-bold text-green-900">{statsAprobadas}</p>
                <p className="text-xs text-green-600 mt-1">{statsAprobadas > 0 ? `${((statsAprobadas / verificaciones.length) * 100).toFixed(0)}%` : '0%'} del total</p>
              </div>
              <div className="p-4 bg-green-600 rounded-xl shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-lg border-2 border-red-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-semibold uppercase tracking-wide mb-1">Rechazadas</p>
                <p className="text-3xl font-bold text-red-900">{statsRechazadas}</p>
                <p className="text-xs text-red-600 mt-1">{statsRechazadas > 0 ? `${((statsRechazadas / verificaciones.length) * 100).toFixed(0)}%` : '0%'} del total</p>
              </div>
              <div className="p-4 bg-red-600 rounded-xl shadow-lg">
                <XCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl shadow-lg border-2 border-indigo-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-700 font-semibold uppercase tracking-wide mb-1">Otras</p>
                <p className="text-3xl font-bold text-indigo-900">{statsOtras}</p>
                <p className="text-xs text-indigo-600 mt-1">{statsOtras > 0 ? `${((statsOtras / verificaciones.length) * 100).toFixed(0)}%` : '0%'} del total</p>
              </div>
              <div className="p-4 bg-indigo-600 rounded-xl shadow-lg">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda con mejor diseño */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros y Búsqueda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por licencia, titular, dominio o expediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-2 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filtroResultado === 'todos' ? 'default' : 'outline'}
                onClick={() => setFiltroResultado('todos')}
                size="sm"
                className="font-medium"
              >
                <FileText className="h-4 w-4 mr-1" />
                Todos
              </Button>
              <Button
                variant={filtroResultado === 'aprobad' ? 'default' : 'outline'}
                onClick={() => setFiltroResultado('aprobad')}
                size="sm"
                className={filtroResultado === 'aprobad' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 hover:text-green-700 hover:border-green-300'}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Aprobadas
              </Button>
              <Button
                variant={filtroResultado === 'rechazad' ? 'default' : 'outline'}
                onClick={() => setFiltroResultado('rechazad')}
                size="sm"
                className={filtroResultado === 'rechazad' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 hover:text-red-700 hover:border-red-300'}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rechazadas
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla de Verificaciones con mejor diseño */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha/Hora
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    N° Licencia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Titular
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Dominio
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Resultado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Expediente
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {verificacionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">No se encontraron verificaciones</p>
                          <p className="text-sm text-gray-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  verificacionesFiltradas.map((verif) => (
                    <tr key={verif.id} className="hover:bg-blue-50/50 transition-colors duration-150 border-b border-gray-100 last:border-0">
                      <td className="px-4 py-4 text-sm">
                        <div className="flex flex-col">
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            {new Date(verif.fecha).toLocaleDateString('es-AR', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="text-gray-500 text-xs mt-0.5 ml-5">{formatearHora(verif.hora)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Badge variant="outline" className="font-mono font-semibold text-blue-700 border-blue-300 bg-blue-50">
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
                          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {verif.dominio}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm ${getResultadoBadge(verif.resultado)}`}>
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
                          <span className="text-gray-400 italic">Sin expediente</span>
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
        <div className="mt-6 flex items-center justify-between px-4 py-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileCheck2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Mostrando {verificacionesFiltradas.length} de {verificaciones.length} verificaciones
              </p>
              <p className="text-xs text-gray-500">
                {searchTerm && `Filtrado por: "${searchTerm}"`}
                {filtroResultado !== 'todos' && ` • Estado: ${filtroResultado === 'aprobad' ? 'Aprobadas' : 'Rechazadas'}`}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Sistema actualizado</span>
          </div>
        </div>
      </div>
    </div>
  )
}
