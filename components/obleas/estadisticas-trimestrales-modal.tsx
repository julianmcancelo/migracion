'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, PieLabelRenderProps } from 'recharts'
import { TrendingUp, Calendar, Users, Car } from 'lucide-react'

interface EstadisticasTrimestrales {
  trimestres: {
    trimestre: string
    escolar: number
    remis: number
    total: number
  }[]
  totales: {
    escolar: number
    remis: number
    total: number
  }
}

interface EstadisticasTrimestralesModalProps {
  children?: React.ReactNode
}

const COLORS = {
  escolar: '#3b82f6',
  remis: '#10b981',
}

export function EstadisticasTrimestralesModal({ children }: EstadisticasTrimestralesModalProps) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<EstadisticasTrimestrales | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEstadisticas = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/obleas/estadisticas-trimestrales')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al cargar estadísticas')
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchEstadisticas()
    }
  }, [open])

  const getTrimestreLabel = (trimestre: string) => {
    const [year, q] = trimestre.split('-Q')
    const quarters = {
      '1': 'Ene-Mar',
      '2': 'Abr-Jun',
      '3': 'Jul-Sep',
      '4': 'Oct-Dic',
    }
    return `${quarters[q as keyof typeof quarters]} ${year}`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Estadísticas Trimestrales
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estadísticas Trimestrales de Obleas
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando estadísticas...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-destructive mb-4">Error: {error}</p>
              <Button onClick={fetchEstadisticas} variant="outline">
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {data && !loading && !error && (
          <div className="space-y-6">
            {/* Tarjetas de totales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Obleas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totales.total}</div>
                  <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transporte Escolar</CardTitle>
                  <Car className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{data.totales.escolar}</div>
                  <p className="text-xs text-muted-foreground">
                    {((data.totales.escolar / data.totales.total) * 100).toFixed(1)}% del total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Remis</CardTitle>
                  <Car className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{data.totales.remis}</div>
                  <p className="text-xs text-muted-foreground">
                    {((data.totales.remis / data.totales.total) * 100).toFixed(1)}% del total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de barras por trimestre */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Obleas por Trimestre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.trimestres.map(t => ({
                    ...t,
                    trimestreLabel: getTrimestreLabel(t.trimestre),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trimestreLabel" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`${value} obleas`, '']}
                      labelFormatter={(label: string) => `Trimestre: ${label}`}
                    />
                    <Bar dataKey="escolar" stackId="a" fill={COLORS.escolar} name="Escolar" />
                    <Bar dataKey="remis" stackId="a" fill={COLORS.remis} name="Remis" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de torta de distribución */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Transporte Escolar', value: data.totales.escolar, color: COLORS.escolar },
                          { name: 'Remis', value: data.totales.remis, color: COLORS.remis },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: PieLabelRenderProps) => {
                      const { name, percent } = props
                      return `${name || ''}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Transporte Escolar', value: data.totales.escolar, color: COLORS.escolar },
                          { name: 'Remis', value: data.totales.remis, color: COLORS.remis },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} obleas`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tabla de detalles */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalle por Trimestre</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.trimestres.map((trimestre) => (
                      <div key={trimestre.trimestre} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{getTrimestreLabel(trimestre.trimestre)}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Escolar: {trimestre.escolar}
                            </Badge>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Remis: {trimestre.remis}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{trimestre.total}</p>
                          <p className="text-xs text-muted-foreground">obleas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
