'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileX,
  Calendar,
  Bell,
  TrendingUp,
  AlertCircle,
  Mail,
  Eye,
  RefreshCw,
  UserPlus,
  Car,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RegistroPersonaRapidoDialog } from './registro-persona-rapido-dialog'
import { RegistroVehiculoRapidoDialog } from './registro-vehiculo-rapido-dialog'
import { OnboardingTour, useOnboardingTour, mainTourSteps } from '@/components/ui/onboarding-tour'
import { useToast } from '@/components/ui/toast-notifications'

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

interface Turno {
  id: number
  fecha: string
  hora: string
  estado: string
  observaciones: string | null
  recordatorio_enviado: boolean
  habilitacion: {
    id: number
    nro_licencia: string
    tipo_transporte: string
  }
  titular: {
    nombre: string
    email: string
    dni: string
  } | null
  vehiculo: {
    dominio: string
    marca: string | null
    modelo: string | null
  } | null
}

export function DashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [vencimientos, setVencimientos] = useState<Vencimientos | null>(null)
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [reenviando, setReenviando] = useState<number | null>(null)
  const [showRegistroPersona, setShowRegistroPersona] = useState(false)
  const [showRegistroVehiculo, setShowRegistroVehiculo] = useState(false)
  
  // Tour de bienvenida
  const { hasSeenTour, completeTour } = useOnboardingTour('dashboard')
  const toast = useToast()

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [statsRes, vencimientosRes, turnosRes] = await Promise.all([
          fetch('/api/habilitaciones/stats'),
          fetch('/api/habilitaciones/vencimientos'),
          fetch('/api/turnos/proximos?limite=10'),
        ])

        const statsData = await statsRes.json()
        const vencimientosData = await vencimientosRes.json()
        const turnosData = await turnosRes.json()

        if (statsData.success) setStats(statsData.data)
        if (vencimientosData.success) setVencimientos(vencimientosData.data)
        if (turnosData.success) setTurnos(turnosData.data)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const handleReenviarNotificacion = async (turnoId: number) => {
    setReenviando(turnoId)
    try {
      const res = await fetch(`/api/turnos/${turnoId}/reenviar-notificacion`, {
        method: 'POST',
      })

      const data = await res.json()

      if (data.success) {
        toast.success(
          '¡Notificación enviada!',
          'El recordatorio se envió correctamente por email al titular del turno.'
        )
        // Actualizar el estado del turno
        setTurnos(prev =>
          prev.map(t => (t.id === turnoId ? { ...t, recordatorio_enviado: true } : t))
        )
      } else {
        toast.error(
          'Error al enviar',
          data.error || 'No se pudo enviar la notificación. Intenta nuevamente.'
        )
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(
        'Error de conexión',
        'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.'
      )
    } finally {
      setReenviando(null)
    }
  }

  const kpis = stats?.kpis || { activas: 0, en_tramite: 0, por_vencer: 0, obleas_pendientes: 0 }
  const totales = vencimientos?.totales || {
    vencidas: 0,
    proximos_7_dias: 0,
    proximos_15_dias: 0,
    proximos_30_dias: 0,
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
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
      atencion: {
        border: 'border-orange-200',
        bg: 'bg-orange-50',
        iconBg: 'bg-orange-500',
        icon: AlertTriangle,
      },
      planificado: {
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        iconBg: 'bg-yellow-500',
        icon: Clock,
      },
    }
    return configs[urgencia as keyof typeof configs] || configs.planificado
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Tour de Bienvenida - Solo se muestra la primera vez */}
      {!hasSeenTour && (
        <OnboardingTour
          steps={mainTourSteps}
          onComplete={completeTour}
          onSkip={completeTour}
          autoStart={true}
        />
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">Panel de Control</h1>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">Información crítica y alertas del sistema</p>
        </div>
        <Badge className="w-fit bg-blue-100 px-3 py-1.5 text-xs text-blue-700 sm:px-4 sm:py-2 sm:text-sm">
          <Clock className="mr-1.5 inline h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
          Actualizado ahora
        </Badge>
      </div>

      {/* ALERTAS CRÍTICAS - Primera sección */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {/* Alerta: Habilitaciones Vencidas */}
        <Card className="relative overflow-hidden border-2 border-red-200 bg-gradient-to-br from-red-50 to-white transition-shadow hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-red-500/5 sm:h-32 sm:w-32"></div>
          <div className="relative p-4 sm:p-6">
            <div className="mb-2 flex items-start justify-between sm:mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 sm:h-12 sm:w-12 sm:rounded-xl">
                <FileX className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              {totales.vencidas > 0 && (
                <Badge className="animate-pulse bg-red-500 text-white">URGENTE</Badge>
              )}
            </div>
            <h3 className="mb-1 text-xs font-medium text-gray-600 sm:text-sm">Habilitaciones Vencidas</h3>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <p className="text-3xl font-bold text-red-600 sm:text-4xl">{totales.vencidas}</p>
              <span className="text-xs font-medium text-red-500 sm:text-sm">
                {totales.vencidas > 0 ? 'Requieren acción' : 'Todo al día'}
              </span>
            </div>
            <Link href="/habilitaciones" className="mt-3 block sm:mt-4">
              <Button size="sm" variant="destructive" className="w-full text-xs sm:text-sm">
                Ver habilitaciones
              </Button>
            </Link>
          </div>
        </Card>

        {/* Alerta: Por Vencer (30 días) */}
        <Card className="relative overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white transition-shadow hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-orange-500/5 sm:h-32 sm:w-32"></div>
          <div className="relative p-4 sm:p-6">
            <div className="mb-2 flex items-start justify-between sm:mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 sm:h-12 sm:w-12 sm:rounded-xl">
                <AlertTriangle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              {kpis.por_vencer > 0 && <Badge className="bg-orange-500 text-white">ATENCIÓN</Badge>}
            </div>
            <h3 className="mb-1 text-xs font-medium text-gray-600 sm:text-sm">Por Vencer (30 días)</h3>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <p className="text-3xl font-bold text-orange-600 sm:text-4xl">{kpis.por_vencer}</p>
              <span className="text-xs font-medium text-orange-500 sm:text-sm">Renovar pronto</span>
            </div>
            <Link href="/habilitaciones" className="mt-3 block sm:mt-4">
              <Button size="sm" className="w-full bg-orange-500 text-xs hover:bg-orange-600 sm:text-sm">
                Ver habilitaciones
              </Button>
            </Link>
          </div>
        </Card>

        {/* Inspecciones Confirmadas - Placeholder por ahora */}
        <Card className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 to-white transition-shadow hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-green-500/5 sm:h-32 sm:w-32"></div>
          <div className="relative p-4 sm:p-6">
            <div className="mb-2 flex items-start justify-between sm:mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 sm:h-12 sm:w-12 sm:rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <Badge className="bg-green-500 text-white">HOY</Badge>
            </div>
            <h3 className="mb-1 text-xs font-medium text-gray-600 sm:text-sm">Inspecciones Confirmadas</h3>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <p className="text-3xl font-bold text-green-600 sm:text-4xl">-</p>
              <span className="text-xs font-medium text-green-500 sm:text-sm">Próximamente</span>
            </div>
            <Button size="sm" className="w-full bg-green-500 text-xs hover:bg-green-600 sm:text-sm" disabled>
              Próximamente
            </Button>
          </div>
        </Card>
      </div>

      {/* RESUMEN RÁPIDO - Segunda fila */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Obleas Pendientes */}
        <Card className="cursor-pointer p-3 transition-shadow hover:shadow-lg sm:p-4 lg:p-5">
          <div className="mb-2 flex items-center justify-between sm:mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
            </div>
            <TrendingUp className="h-3 w-3 text-blue-500 sm:h-4 sm:w-4" />
          </div>
          <p className="mb-0.5 text-xs text-gray-600 sm:mb-1 sm:text-sm">Obleas Pendientes</p>
          <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{kpis.obleas_pendientes}</p>
          <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1 sm:text-xs">Colocar en vehículos</p>
        </Card>

        {/* En Trámite */}
        <Card className="cursor-pointer p-3 transition-shadow hover:shadow-lg sm:p-4 lg:p-5">
          <div className="mb-2 flex items-center justify-between sm:mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 sm:h-10 sm:w-10">
              <Clock className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5" />
            </div>
            <TrendingUp className="h-3 w-3 text-amber-500 sm:h-4 sm:w-4" />
          </div>
          <p className="mb-0.5 text-xs text-gray-600 sm:mb-1 sm:text-sm">En Trámite</p>
          <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{kpis.en_tramite}</p>
          <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1 sm:text-xs">Esperando documentación</p>
        </Card>

        {/* Habilitadas */}
        <Card className="cursor-pointer p-3 transition-shadow hover:shadow-lg sm:p-4 lg:p-5">
          <div className="mb-2 flex items-center justify-between sm:mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 sm:h-10 sm:w-10">
              <CheckCircle2 className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
            </div>
            <TrendingUp className="h-3 w-3 text-green-500 sm:h-4 sm:w-4" />
          </div>
          <p className="mb-0.5 text-xs text-gray-600 sm:mb-1 sm:text-sm">Habilitadas</p>
          <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{kpis.activas}</p>
          <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1 sm:text-xs">Activas al día</p>
        </Card>

        {/* Próximos 7 días */}
        <Card className="cursor-pointer p-3 transition-shadow hover:shadow-lg sm:p-4 lg:p-5">
          <div className="mb-2 flex items-center justify-between sm:mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 sm:h-10 sm:w-10">
              <Calendar className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
            </div>
            <TrendingUp className="h-3 w-3 text-purple-500 sm:h-4 sm:w-4" />
          </div>
          <p className="mb-0.5 text-xs text-gray-600 sm:mb-1 sm:text-sm">Próximos 7 días</p>
          <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{totales.proximos_7_dias}</p>
          <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1 sm:text-xs">A vencer pronto</p>
        </Card>
      </div>

      {/* PRÓXIMOS VENCIMIENTOS - Lista detallada */}
      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Próximos Vencimientos</h2>
            <p className="mt-0.5 text-xs text-gray-600 sm:mt-1 sm:text-sm">Habilitaciones que requieren renovación</p>
          </div>
          <Badge className="w-fit bg-orange-100 text-xs text-orange-700 sm:text-sm">
            <AlertCircle className="mr-1 inline h-3 w-3 sm:h-4 sm:w-4" />
            {vencimientos?.por_vencer.length || 0} próximos
          </Badge>
        </div>

        {vencimientos && vencimientos.por_vencer.length > 0 ? (
          <div className="space-y-3">
            {vencimientos.por_vencer.slice(0, 5).map(venc => {
              const config = getUrgenciaCard(venc.urgencia)
              const badgeInfo = getUrgenciaBadge(venc.urgencia, venc.dias_restantes)
              const Icon = config.icon

              return (
                <div
                  key={venc.id}
                  className={`flex flex-col gap-3 p-3 ${config.bg} border ${config.border} rounded-lg transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-4`}
                >
                  <div className="flex flex-1 items-center gap-3 sm:gap-4">
                    <div
                      className={`h-10 w-10 flex-shrink-0 ${config.iconBg} flex items-center justify-center rounded-lg sm:h-12 sm:w-12 sm:rounded-xl`}
                    >
                      <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                        Habilitación {venc.tipo_transporte} {venc.nro_licencia}
                      </p>
                      <p className="truncate text-xs text-gray-600 sm:text-sm">
                        Titular: {venc.titular.nombre} • Vehículo: {venc.vehiculo.dominio}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-start">
                    <Badge className={`${badgeInfo.bg} text-xs text-white sm:mb-2`}>{badgeInfo.text}</Badge>
                    <p className="text-xs text-gray-500">{formatFecha(venc.vigencia_fin)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500" />
            <p>No hay vencimientos próximos. ¡Todo al día!</p>
          </div>
        )}

        {vencimientos && vencimientos.por_vencer.length > 5 && (
          <div className="mt-4 text-center">
            <Link href="/habilitaciones">
              <Button variant="outline" className="w-full">
                Ver todos los vencimientos ({vencimientos.por_vencer.length})
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* PRÓXIMOS TURNOS DE INSPECCIÓN */}
      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Próximos Turnos de Inspección</h2>
            <p className="mt-0.5 text-xs text-gray-600 sm:mt-1 sm:text-sm">Turnos agendados para los próximos días</p>
          </div>
          <Badge className="w-fit bg-blue-100 text-xs text-blue-700 sm:text-sm">
            <Calendar className="mr-1 inline h-3 w-3 sm:h-4 sm:w-4" />
            {turnos.length} turnos
          </Badge>
        </div>

        {turnos.length > 0 ? (
          <div className="space-y-3">
            {turnos.map(turno => {
              const fechaTurno = new Date(turno.fecha)
              const horaTurno = turno.hora.split(':').slice(0, 2).join(':')
              const esHoy = fechaTurno.toDateString() === new Date().toDateString()
              const esMañana =
                new Date(fechaTurno.getTime() - 86400000).toDateString() ===
                new Date().toDateString()

              let badgeFecha = formatFecha(turno.fecha)
              let badgeColor = 'bg-gray-500'

              if (esHoy) {
                badgeFecha = '¡HOY!'
                badgeColor = 'bg-red-500 animate-pulse'
              } else if (esMañana) {
                badgeFecha = 'MAÑANA'
                badgeColor = 'bg-orange-500'
              }

              return (
                <div
                  key={turno.id}
                  className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-4"
                >
                  <div className="flex flex-1 items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 sm:h-12 sm:w-12 sm:rounded-xl">
                      <Calendar className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                        {turno.habilitacion.tipo_transporte} - Lic.{' '}
                        {turno.habilitacion.nro_licencia}
                      </p>
                      <p className="truncate text-xs text-gray-600 sm:text-sm">
                        {turno.titular?.nombre || 'Sin titular'} •{' '}
                        {turno.vehiculo?.dominio || 'Sin dominio'}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{horaTurno}hs</span>
                        {turno.estado === 'CONFIRMADO' && (
                          <Badge className="ml-2 bg-green-500 text-xs text-white">
                            ✓ Confirmado
                          </Badge>
                        )}
                        {turno.recordatorio_enviado && (
                          <Badge className="ml-2 bg-gray-500 text-xs text-white">
                            <Mail className="mr-1 h-3 w-3" />
                            Notificado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                    <Badge className={`${badgeColor} px-2 py-0.5 text-xs text-white sm:px-3 sm:py-1`}>{badgeFecha}</Badge>
                    <div className="flex gap-1.5 sm:gap-2">
                      <Link href={`/habilitaciones/${turno.habilitacion.id}`}>
                        <Button size="sm" variant="outline" className="h-7 px-2 sm:h-8 sm:px-3">
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 sm:h-8 sm:px-3"
                        onClick={() => handleReenviarNotificacion(turno.id)}
                        disabled={reenviando === turno.id}
                      >
                        {reenviando === turno.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                        ) : (
                          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p>No hay turnos programados próximamente</p>
          </div>
        )}

        {turnos.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/turnos">
              <Button variant="outline" className="w-full">
                Ver todos los turnos
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Acciones rápidas */}
      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900 sm:mb-6 sm:text-xl">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <Link href="/habilitaciones">
            <button className="group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-8 transition-all hover:border-blue-500 hover:bg-blue-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 transition-transform group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-base font-semibold text-gray-900">Nueva Habilitación</span>
            </button>
          </Link>

          <button
            onClick={() => setShowRegistroPersona(true)}
            className="group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-green-300 bg-green-50 p-8 transition-all hover:border-green-500 hover:bg-green-100"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 transition-transform group-hover:scale-110">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <span className="text-base font-semibold text-gray-900">Registrar Persona</span>
            <span className="flex items-center gap-1 text-xs text-green-600">
              <span>✨</span> Con OCR de DNI
            </span>
          </button>

          <button
            onClick={() => setShowRegistroVehiculo(true)}
            className="group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 p-8 transition-all hover:border-purple-500 hover:bg-purple-100"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500 transition-transform group-hover:scale-110">
              <Car className="h-7 w-7 text-white" />
            </div>
            <span className="text-base font-semibold text-gray-900">Registrar Vehículo</span>
            <span className="flex items-center gap-1 text-xs text-purple-600">
              <span>✨</span> Con OCR de Cédula
            </span>
          </button>
        </div>
      </Card>

      {/* Diálogos de registro rápido */}
      <RegistroPersonaRapidoDialog
        open={showRegistroPersona}
        onOpenChange={setShowRegistroPersona}
      />

      <RegistroVehiculoRapidoDialog
        open={showRegistroVehiculo}
        onOpenChange={setShowRegistroVehiculo}
      />
    </div>
    </>
  )
}
