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
      {/* Tour de Bienvenida */}
      {!hasSeenTour && (
        <OnboardingTour
          steps={mainTourSteps}
          onComplete={completeTour}
          onSkip={completeTour}
          autoStart={true}
        />
      )}

      <div className="space-y-6">
        {/* Header Simple */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
          <p className="text-sm text-slate-600">Gestión de Transporte</p>
        </div>

      {/* Métricas Principales */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Vencidas */}
        <Card className="p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Vencidas</p>
              <p className="text-3xl font-bold text-red-600">{totales.vencidas}</p>
            </div>
            <FileX className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        {/* Por Vencer */}
        <Card className="p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Por Vencer (30d)</p>
              <p className="text-3xl font-bold text-orange-600">{kpis.por_vencer}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        {/* Activas */}
        <Card className="p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Activas</p>
              <p className="text-3xl font-bold text-green-600">{kpis.activas}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>


      {/* Próximos Vencimientos */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Próximos Vencimientos</h2>
          <Link href="/habilitaciones">
            <Button size="sm" variant="outline">Ver todos</Button>
          </Link>
        </div>

        {vencimientos && vencimientos.por_vencer.length > 0 ? (
          <div className="space-y-2">
            {vencimientos.por_vencer.slice(0, 5).map(venc => (
              <div key={venc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {venc.tipo_transporte} {venc.nro_licencia}
                  </p>
                  <p className="text-xs text-slate-600 truncate">{venc.titular.nombre}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-slate-900">{venc.dias_restantes}d</p>
                  <p className="text-xs text-slate-600">{formatFecha(venc.vigencia_fin)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600 text-center py-4">No hay vencimientos próximos</p>
        )}
      </Card>

      {/* Próximos Turnos */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Próximos Turnos</h2>
          <Link href="/turnos">
            <Button size="sm" variant="outline">Ver todos</Button>
          </Link>
        </div>

        {turnos.length > 0 ? (
          <div className="space-y-2">
            {turnos.slice(0, 5).map(turno => {
              const horaTurno = turno.hora.split(':').slice(0, 2).join(':')
              return (
                <div key={turno.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {turno.titular?.nombre || 'Sin titular'}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {turno.habilitacion.tipo_transporte} • {turno.vehiculo?.dominio || 'Sin dominio'}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-slate-900">{formatFecha(turno.fecha)}</p>
                    <p className="text-xs text-slate-600">{horaTurno}hs</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-600 text-center py-4">No hay turnos programados</p>
        )}
      </Card>

      {/* Acciones Rápidas */}
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Acciones Rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/habilitaciones">
            <Button className="w-full justify-start" variant="outline">
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nueva Habilitación
            </Button>
          </Link>

          <Button onClick={() => setShowRegistroPersona(true)} className="w-full justify-start" variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Registrar Persona
          </Button>

          <Button onClick={() => setShowRegistroVehiculo(true)} className="w-full justify-start" variant="outline">
            <Car className="mr-2 h-4 w-4" />
            Registrar Vehículo
          </Button>
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
