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
        alert('✅ Notificación enviada exitosamente')
        // Actualizar el estado del turno
        setTurnos(prev =>
          prev.map(t => (t.id === turnoId ? { ...t, recordatorio_enviado: true } : t))
        )
      } else {
        alert('❌ Error al enviar notificación: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al enviar notificación')
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Panel de Control</h1>
          <p className="mt-2 text-gray-600">Información crítica y alertas del sistema</p>
        </div>
        <Badge className="bg-blue-100 px-4 py-2 text-sm text-blue-700">
          <Clock className="mr-2 inline h-4 w-4" />
          Actualizado ahora
        </Badge>
      </div>

      {/* ALERTAS CRÍTICAS - Primera sección */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Alerta: Habilitaciones Vencidas */}
        <Card className="relative overflow-hidden border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-red-500/5"></div>
          <div className="relative p-6">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500">
                <FileX className="h-6 w-6 text-white" />
              </div>
              {totales.vencidas > 0 && (
                <Badge className="animate-pulse bg-red-500 text-white">URGENTE</Badge>
              )}
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600">Habilitaciones Vencidas</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-red-600">{totales.vencidas}</p>
              <span className="text-sm font-medium text-red-500">
                {totales.vencidas > 0 ? 'Requieren acción' : 'Todo al día'}
              </span>
            </div>
            <Link href="/habilitaciones" className="mt-4 block">
              <Button size="sm" variant="destructive" className="w-full">
                Ver habilitaciones
              </Button>
            </Link>
          </div>
        </Card>

        {/* Alerta: Por Vencer (30 días) */}
        <Card className="relative overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-orange-500/5"></div>
          <div className="relative p-6">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              {kpis.por_vencer > 0 && <Badge className="bg-orange-500 text-white">ATENCIÓN</Badge>}
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600">Por Vencer (30 días)</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-orange-600">{kpis.por_vencer}</p>
              <span className="text-sm font-medium text-orange-500">Renovar pronto</span>
            </div>
            <Link href="/habilitaciones" className="mt-4 block">
              <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                Ver habilitaciones
              </Button>
            </Link>
          </div>
        </Card>

        {/* Inspecciones Confirmadas - Placeholder por ahora */}
        <Card className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-green-500/5"></div>
          <div className="relative p-6">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-green-500 text-white">HOY</Badge>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600">Inspecciones Confirmadas</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-green-600">-</p>
              <span className="text-sm font-medium text-green-500">Próximamente</span>
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
        <Card className="cursor-pointer p-5 transition-shadow hover:shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mb-1 text-sm text-gray-600">Obleas Pendientes</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.obleas_pendientes}</p>
          <p className="mt-1 text-xs text-gray-500">Colocar en vehículos</p>
        </Card>

        {/* En Trámite */}
        <Card className="cursor-pointer p-5 transition-shadow hover:shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mb-1 text-sm text-gray-600">En Trámite</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.en_tramite}</p>
          <p className="mt-1 text-xs text-gray-500">Esperando documentación</p>
        </Card>

        {/* Habilitadas */}
        <Card className="cursor-pointer p-5 transition-shadow hover:shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="mb-1 text-sm text-gray-600">Habilitadas</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.activas}</p>
          <p className="mt-1 text-xs text-gray-500">Activas al día</p>
        </Card>

        {/* Próximos 7 días */}
        <Card className="cursor-pointer p-5 transition-shadow hover:shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mb-1 text-sm text-gray-600">Próximos 7 días</p>
          <p className="text-3xl font-bold text-gray-900">{totales.proximos_7_dias}</p>
          <p className="mt-1 text-xs text-gray-500">A vencer pronto</p>
        </Card>
      </div>

      {/* PRÓXIMOS VENCIMIENTOS - Lista detallada */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Próximos Vencimientos</h2>
            <p className="mt-1 text-sm text-gray-600">Habilitaciones que requieren renovación</p>
          </div>
          <Badge className="bg-orange-100 text-orange-700">
            <AlertCircle className="mr-1 inline h-4 w-4" />
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
                  className={`flex items-center justify-between p-4 ${config.bg} border ${config.border} rounded-lg transition-shadow hover:shadow-md`}
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div
                      className={`h-12 w-12 ${config.iconBg} flex items-center justify-center rounded-xl`}
                    >
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
                    <Badge className={`${badgeInfo.bg} mb-2 text-white`}>{badgeInfo.text}</Badge>
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
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Próximos Turnos de Inspección</h2>
            <p className="mt-1 text-sm text-gray-600">Turnos agendados para los próximos días</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700">
            <Calendar className="mr-1 inline h-4 w-4" />
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
                  className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {turno.habilitacion.tipo_transporte} - Lic.{' '}
                        {turno.habilitacion.nro_licencia}
                      </p>
                      <p className="text-sm text-gray-600">
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
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`${badgeColor} px-3 py-1 text-white`}>{badgeFecha}</Badge>
                    <div className="flex gap-2">
                      <Link href={`/habilitaciones/${turno.habilitacion.id}`}>
                        <Button size="sm" variant="outline" className="h-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => handleReenviarNotificacion(turno.id)}
                        disabled={reenviando === turno.id}
                      >
                        {reenviando === turno.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
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
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
  )
}
