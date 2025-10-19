'use client'

import { useEffect, useState } from 'react'
import { Search, FileText, Calendar, User, Car, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verificaciones Técnicas</h1>
          <p className="text-gray-600">Historial completo de verificaciones realizadas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900">{verificaciones.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Aprobadas</p>
                <p className="text-2xl font-bold text-green-900">{statsAprobadas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Rechazadas</p>
                <p className="text-2xl font-bold text-red-900">{statsRechazadas}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Otras</p>
                <p className="text-2xl font-bold text-blue-900">{statsOtras}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por licencia, titular, dominio o expediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filtroResultado === 'todos' ? 'default' : 'outline'}
                onClick={() => setFiltroResultado('todos')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filtroResultado === 'aprobad' ? 'default' : 'outline'}
                onClick={() => setFiltroResultado('aprobad')}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Aprobadas
              </Button>
              <Button
                variant={filtroResultado === 'rechazad' ? 'default' : 'outline'}
                onClick={() => setFiltroResultado('rechazad')}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                Rechazadas
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla de Verificaciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No se encontraron verificaciones
                    </td>
                  </tr>
                ) : (
                  verificacionesFiltradas.map((verif) => (
                    <tr key={verif.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(verif.fecha).toLocaleDateString('es-AR')}
                          </div>
                          <div className="text-gray-500 text-xs">{verif.hora}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">
                        {verif.nro_licencia}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {verif.nombre_titular}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-mono font-medium text-gray-900">
                          {verif.dominio}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getResultadoBadge(verif.resultado)}`}>
                          {getResultadoIcon(verif.resultado)}
                          {verif.resultado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {verif.expediente || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer con contadores */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          Mostrando {verificacionesFiltradas.length} de {verificaciones.length} verificaciones
        </div>
      </div>
    </div>
  )
}
