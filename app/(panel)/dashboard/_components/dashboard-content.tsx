'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, FileX, Calendar, Bell, TrendingUp, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Stats {
  kpis: {
    activas: number
    en_tramite: number
    por_vencer: number
    obleas_pendientes: number
  }
}

interface Vencimiento {
  id: number
  nro_licencia: string
  tipo_transporte: string
  vigencia_fin: string
  dias_restantes: number
  urgencia: 'vencida' | 'urgente' | 'atencion' | 'planificado'
  titular: {
    nombre: string
    dni?: string
  }
  vehiculo: {
    dominio: string
    marca?: string
    modelo?: string
  }
}

interface Vencimientos {
  vencidas: Vencimiento[]
  por_vencer: Vencimiento[]
  totales: {
    vencidas: number
    proximos_7_dias: number
    proximos_15_dias: number
    proximos_30_dias: number
  }
}

export function DashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [vencimientos, setVencimientos] = useState<Vencimientos | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [statsRes, vencimientosRes] = await Promise.all([
          fetch('/api/habilitaciones/stats'),
          fetch('/api/habilitaciones/vencimientos')
        ])

        const statsData = await statsRes.json()
        const vencimientosData = await vencimientosRes.json()

        if (statsData.success) setStats(statsData.data)
        if (vencimientosData.success) setVencimientos(vencimientosData.data)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const kpis = stats?.kpis || { activas: 0, en_tramite: 0, por_vencer: 0, obleas_pendientes: 0 }
  const totales = vencimientos?.totales || { vencidas: 0, proximos_7_dias: 0, proximos_15_dias: 0, proximos_30_dias: 0 }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getUrgenciaBadge = (urgencia: string, diasRestantes: number) => {
    if (urgencia === 'vencida') {
      return { bg: 'bg-red-500', text: 'VENCIDA' }
    } else if (urgencia === 'urgente') {
      return { bg: 'bg-red-500', text: `Vence en ${diasRestantes} días` }
    } else if (urgencia === 'atencion') {
      return { bg: 'bg-orange-500', text: `Vence en ${diasRestantes} días` }
    } else {
      return { bg: 'bg-yellow-500', text: `Vence en ${diasRestantes} días` }
    }
  }

  const getUrgenciaCard = (urgencia: string) => {
    const configs = {
      vencida: { border: 'border-red-200', bg: 'bg-red-50', iconBg: 'bg-red-500', icon: FileX },
      urgente: { border: 'border-red-200', bg: 'bg-red-50', iconBg: 'bg-red-500', icon: FileX },
      atencion: { border: 'border-orange-200', bg: 'bg-orange-50', iconBg: 'bg-orange-500', icon: AlertTriangle },
      planificado: { border: 'border-yellow-200', bg: 'bg-yellow-50', iconBg: 'bg-yellow-500', icon: Clock }
    }
    return configs[urgencia as keyof typeof configs] || configs.planificado
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
          <p className="mt-2 text-gray-600">
            Información crítica y alertas del sistema
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
          <Clock className="h-4 w-4 mr-2 inline" />
          Actualizado ahora
        </Badge>
      </div>

      {/* ALERTAS CRÍTICAS - Primera sección */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Alerta: Habilitaciones Vencidas */}
        <Card className="relative overflow-hidden border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full"></div>
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <FileX className="h-6 w-6 text-white" />
              </div>
              {totales.vencidas > 0 && (
                <Badge className="bg-red-500 text-white animate-pulse">URGENTE</Badge>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Habilitaciones Vencidas</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-red-600">{totales.vencidas}</p>
              <span className="text-sm text-red-500 font-medium">
                {totales.vencidas > 0 ? 'Requieren acción' : 'Todo al día'}
              </span>
            </div>
            <Link href="/panel/habilitaciones" className="mt-4 block">
              <Button size="sm" variant="destructive" className="w-full">
                Ver habilitaciones
              </Button>
            </Link>
          </div>
        </Card>

        {/* Alerta: Por Vencer (30 días) */}
        <Card className="relative overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full"></div>
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              {kpis.por_vencer > 0 && (
                <Badge className="bg-orange-500 text-white">ATENCIÓN</Badge>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Por Vencer (30 días)</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-orange-600">{kpis.por_vencer}</p>
              <span className="text-sm text-orange-500 font-medium">Renovar pronto</span>
            </div>
            <Link href="/panel/habilitaciones" className="mt-4 block">
              <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                Ver habilitaciones
              </Button>
            </Link>
          </div>
        </Card>

        {/* Inspecciones Confirmadas - Placeholder por ahora */}
        <Card className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full"></div>
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-green-500 text-white">HOY</Badge>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Inspecciones Confirmadas</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-green-600">-</p>
              <span className="text-sm text-green-500 font-medium">Próximamente</span>
            </div>
            <Button size="sm" className="w-full bg-green-500 hover:bg-green-600" disabled>
              Próximamente
            </Button>
          </div>
        </Card>
      </div>

      {/* RESUMEN RÁPIDO - Segunda fila */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Obleas Pendientes */}
        <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Obleas Pendientes</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.obleas_pendientes}</p>
          <p className="text-xs text-gray-500 mt-1">Colocar en vehículos</p>
        </Card>

        {/* En Trámite */}
        <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-sm text-gray-600 mb-1">En Trámite</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.en_tramite}</p>
          <p className="text-xs text-gray-500 mt-1">Esperando documentación</p>
        </Card>

        {/* Habilitadas */}
        <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Habilitadas</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.activas}</p>
          <p className="text-xs text-gray-500 mt-1">Activas al día</p>
        </Card>

        {/* Próximos 7 días */}
        <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Próximos 7 días</p>
          <p className="text-3xl font-bold text-gray-900">{totales.proximos_7_dias}</p>
          <p className="text-xs text-gray-500 mt-1">A vencer pronto</p>
        </Card>
      </div>

      {/* PRÓXIMOS VENCIMIENTOS - Lista detallada */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Próximos Vencimientos</h2>
            <p className="text-sm text-gray-600 mt-1">Habilitaciones que requieren renovación</p>
          </div>
          <Badge className="bg-orange-100 text-orange-700">
            <AlertCircle className="h-4 w-4 mr-1 inline" />
            {vencimientos?.por_vencer.length || 0} próximos
          </Badge>
        </div>
        
        {vencimientos && vencimientos.por_vencer.length > 0 ? (
          <div className="space-y-3">
            {vencimientos.por_vencer.slice(0, 5).map((venc) => {
              const config = getUrgenciaCard(venc.urgencia)
              const badgeInfo = getUrgenciaBadge(venc.urgencia, venc.dias_restantes)
              const Icon = config.icon

              return (
                <div
                  key={venc.id}
                  className={`flex items-center justify-between p-4 ${config.bg} border ${config.border} rounded-lg hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Habilitación {venc.tipo_transporte} {venc.nro_licencia}
                      </p>
                      <p className="text-sm text-gray-600">
                        Titular: {venc.titular.nombre} • Vehículo: {venc.vehiculo.dominio}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${badgeInfo.bg} text-white mb-2`}>
                      {badgeInfo.text}
                    </Badge>
                    <p className="text-xs text-gray-500">{formatFecha(venc.vigencia_fin)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p>No hay vencimientos próximos. ¡Todo al día!</p>
          </div>
        )}
        
        {vencimientos && vencimientos.por_vencer.length > 5 && (
          <div className="mt-4 text-center">
            <Link href="/panel/habilitaciones">
              <Button variant="outline" className="w-full">
                Ver todos los vencimientos ({vencimientos.por_vencer.length})
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Acciones rápidas */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/panel/habilitaciones">
            <button className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-8 hover:border-blue-500 hover:bg-blue-100 transition-all group">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-base font-semibold text-gray-900">Nueva Habilitación</span>
            </button>
          </Link>
          
          <button className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 cursor-not-allowed opacity-60">
            <div className="w-14 h-14 bg-gray-400 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-white" />
            </div>
            <span className="text-base font-semibold text-gray-600">Nueva Inspección</span>
            <span className="text-xs text-gray-500">Próximamente</span>
          </button>
          
          <button className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 cursor-not-allowed opacity-60">
            <div className="w-14 h-14 bg-gray-400 rounded-2xl flex items-center justify-center">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <span className="text-base font-semibold text-gray-600">Asignar Turno</span>
            <span className="text-xs text-gray-500">Próximamente</span>
          </button>
        </div>
      </Card>
    </div>
  )
}
