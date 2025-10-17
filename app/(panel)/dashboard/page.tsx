import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, FileX, Calendar, Bell, TrendingUp, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Dashboard | Panel de Gestión',
}

/**
 * Obtener estadísticas del servidor
 */
async function getStats() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/habilitaciones/stats`, {
      cache: 'no-store',
    })
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return null
  }
}

/**
 * Página principal del dashboard
 * - KPIs de habilitaciones
 * - Gráfico de distribución
 * - Acciones rápidas
 */
export default async function DashboardPage() {
  const stats = await getStats()
  const kpis = stats?.kpis || { activas: 0, en_tramite: 0, por_vencer: 0, obleas_pendientes: 0 }

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
              <Badge className="bg-red-500 text-white animate-pulse">URGENTE</Badge>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Habilitaciones Vencidas</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-red-600">3</p>
              <span className="text-sm text-red-500 font-medium">Requieren acción</span>
            </div>
            <Link href="/panel/habilitaciones?filtro=vencidas" className="mt-4 block">
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
              <Badge className="bg-orange-500 text-white">ATENCIÓN</Badge>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Por Vencer (30 días)</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-orange-600">8</p>
              <span className="text-sm text-orange-500 font-medium">Renovar pronto</span>
            </div>
            <Link href="/panel/habilitaciones?filtro=por-vencer" className="mt-4 block">
              <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                Planificar renovación
              </Button>
            </Link>
          </div>
        </Card>

        {/* Inspecciones Confirmadas */}
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
              <p className="text-4xl font-bold text-green-600">5</p>
              <span className="text-sm text-green-500 font-medium">Para hoy</span>
            </div>
            <Link href="/panel/inspecciones?fecha=hoy" className="mt-4 block">
              <Button size="sm" className="w-full bg-green-500 hover:bg-green-600">
                Ver agenda del día
              </Button>
            </Link>
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
          <p className="text-3xl font-bold text-gray-900">12</p>
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
          <p className="text-3xl font-bold text-gray-900">24</p>
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

        {/* Turnos Pendientes */}
        <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Turnos Pendientes</p>
          <p className="text-3xl font-bold text-gray-900">7</p>
          <p className="text-xs text-gray-500 mt-1">Esta semana</p>
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
            11 próximos
          </Badge>
        </div>
        <div className="space-y-3">
          {/* Item 1 - Urgente (7 días) */}
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <FileX className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Habilitación Escolar #2024-001</p>
                <p className="text-sm text-gray-600">Titular: Juan Pérez • Vehículo: ABC123</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-red-500 text-white mb-2">Vence en 7 días</Badge>
              <p className="text-xs text-gray-500">25/10/2025</p>
            </div>
          </div>

          {/* Item 2 - Atención (15 días) */}
          <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Habilitación Remis #2024-042</p>
                <p className="text-sm text-gray-600">Titular: María González • Vehículo: XYZ789</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-orange-500 text-white mb-2">Vence en 15 días</Badge>
              <p className="text-xs text-gray-500">02/11/2025</p>
            </div>
          </div>

          {/* Item 3 - Planificado (25 días) */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Habilitación Escolar #2024-015</p>
                <p className="text-sm text-gray-600">Titular: Carlos Rodríguez • Vehículo: DEF456</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-yellow-500 text-white mb-2">Vence en 25 días</Badge>
              <p className="text-xs text-gray-500">12/11/2025</p>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link href="/panel/habilitaciones?filtro=vencimientos">
            <Button variant="outline" className="w-full">
              Ver todos los vencimientos ({11})
            </Button>
          </Link>
        </div>
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
          
          <Link href="/panel/inspecciones">
            <button className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-green-300 bg-green-50 p-8 hover:border-green-500 hover:bg-green-100 transition-all group">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-900">Nueva Inspección</span>
            </button>
          </Link>
          
          <Link href="/panel/turnos">
            <button className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 p-8 hover:border-purple-500 hover:bg-purple-100 transition-all group">
              <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-900">Asignar Turno</span>
            </button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
