'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface VigenciaTrimestral {
  clave: string
  anio: number
  trimestre: number
  total: number
  escolares: number
  remis: number
  habilitadas: number
  enTramite: number
  habilitaciones: Array<{
    id: number
    nro_licencia: string | null
    tipo_transporte: string | null
    vigencia_inicio: string | null
    vigencia_fin: string | null
    estado: string | null
    titular: string
    dni: string | null
    dominio: string | null
  }>
}

export default function VigenciasTrimestralPage() {
  const [trimestres, setTrimestres] = useState<VigenciaTrimestral[]>([])
  const [loading, setLoading] = useState(true)
  const [anioFiltro, setAnioFiltro] = useState<string>('todos')
  const [trimestreFiltro, setTrimestreFiltro] = useState<string>('todos')
  const [trimestreExpandido, setTrimestreExpandido] = useState<string | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [anioFiltro, trimestreFiltro])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (anioFiltro !== 'todos') params.append('anio', anioFiltro)
      if (trimestreFiltro !== 'todos') params.append('trimestre', trimestreFiltro)

      const response = await fetch(`/api/vigencias/trimestral?${params}`)
      const data = await response.json()

      if (data.success) {
        setTrimestres(data.trimestres)
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatearTrimestre = (trimestre: number) => {
    const nombres = {
      1: 'Q1 (Ene-Mar)',
      2: 'Q2 (Abr-Jun)',
      3: 'Q3 (Jul-Sep)',
      4: 'Q4 (Oct-Dic)',
    }
    return nombres[trimestre as keyof typeof nombres]
  }

  const aniosDisponibles = Array.from(
    new Set(trimestres.map((t) => t.anio))
  ).sort((a, b) => b - a)

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Calendar className="h-8 w-8 text-blue-600" />
          Vigencias por Trimestre
        </h1>
        <p className="text-gray-600">
          Consulta las habilitaciones agrupadas por períodos trimestrales
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Año</label>
              <Select value={anioFiltro} onValueChange={setAnioFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los años</SelectItem>
                  {aniosDisponibles.map((anio) => (
                    <SelectItem key={anio} value={anio.toString()}>
                      {anio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Trimestre</label>
              <Select value={trimestreFiltro} onValueChange={setTrimestreFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los trimestres</SelectItem>
                  <SelectItem value="1">Q1 (Ene-Mar)</SelectItem>
                  <SelectItem value="2">Q2 (Abr-Jun)</SelectItem>
                  <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                  <SelectItem value="4">Q4 (Oct-Dic)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setAnioFiltro('todos')
                  setTrimestreFiltro('todos')
                }}
                className="w-full"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      )}

      {/* Trimestres */}
      {!loading && trimestres.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron datos para los filtros seleccionados</p>
          </CardContent>
        </Card>
      )}

      {!loading && trimestres.length > 0 && (
        <div className="space-y-4">
          {trimestres.map((trimestre) => (
            <Card
              key={trimestre.clave}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      {trimestre.anio} - {formatearTrimestre(trimestre.trimestre)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {trimestre.total} habilitaciones totales
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setTrimestreExpandido(
                        trimestreExpandido === trimestre.clave ? null : trimestre.clave
                      )
                    }
                  >
                    {trimestreExpandido === trimestre.clave ? 'Ocultar' : 'Ver detalle'}
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {/* Banner destacado de habilitados */}
                {trimestre.habilitadas > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-600 text-white rounded-full p-3">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">Habilitaciones Activas</p>
                          <p className="text-3xl font-bold text-green-700">{trimestre.habilitadas}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-green-700">
                        <p className="font-semibold">
                          {((trimestre.habilitadas / trimestre.total) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs">del total</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{trimestre.total}</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Escolares</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{trimestre.escolares}</p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Remis</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{trimestre.remis}</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Habilitadas</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{trimestre.habilitadas}</p>
                  </div>
                </div>

                {/* Detalle expandible */}
                {trimestreExpandido === trimestre.clave && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Habilitaciones del trimestre</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {trimestre.habilitaciones.slice(0, 20).map((hab) => (
                        <div
                          key={hab.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            hab.estado === 'HABILITADO' 
                              ? 'bg-green-50 border-2 border-green-200 hover:bg-green-100' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {hab.nro_licencia || 'S/N'}
                              </Badge>
                              <Badge
                                variant={
                                  hab.tipo_transporte === 'Escolar' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {hab.tipo_transporte || 'N/A'}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm">{hab.titular}</p>
                            <p className="text-xs text-gray-600">
                              DNI: {hab.dni || 'N/A'} • Dominio: {hab.dominio || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right text-xs text-gray-600">
                            <p>
                              Inicio:{' '}
                              {hab.vigencia_inicio
                                ? new Date(hab.vigencia_inicio).toLocaleDateString('es-AR')
                                : 'N/A'}
                            </p>
                            <p>
                              Fin:{' '}
                              {hab.vigencia_fin
                                ? new Date(hab.vigencia_fin).toLocaleDateString('es-AR')
                                : 'N/A'}
                            </p>
                            <Badge
                              variant={hab.estado === 'HABILITADO' ? 'default' : 'secondary'}
                              className={`mt-1 ${hab.estado === 'HABILITADO' ? 'bg-green-600' : ''}`}
                            >
                              {hab.estado === 'HABILITADO' && '✓ '}
                              {hab.estado || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {trimestre.habilitaciones.length > 20 && (
                        <p className="text-center text-sm text-gray-500 py-2">
                          ... y {trimestre.habilitaciones.length - 20} más
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
