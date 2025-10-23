'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Página pública para cancelar un turno desde el email
 * No requiere autenticación
 */
export default function CancelarTurnoPublicoPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showConfirm, setShowConfirm] = useState(true)

  const cancelarTurno = async () => {
    setConfirming(true)
    try {
      const response = await fetch(`/api/turnos/${params.id}/cancelar-publico`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setShowConfirm(false)
      } else {
        setError(data.error || 'Error al cancelar el turno')
      }
    } catch (err) {
      setError('Error al procesar la solicitud')
    } finally {
      setConfirming(false)
    }
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 p-4">
        <div className="bg-grid-slate-100 absolute inset-0 opacity-30 [mask-image:radial-gradient(white,transparent_70%)]"></div>
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-red-100 bg-white p-10 text-center shadow-2xl duration-500 animate-in fade-in slide-in-from-bottom-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-pulse bg-red-400 opacity-20 blur-3xl"></div>
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 shadow-lg">
              <span className="animate-bounce text-5xl">❌</span>
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">Algo salió mal</h1>
          <p className="mb-6 text-lg text-gray-600">{error}</p>
          <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4">
            <p className="mb-2 text-sm font-semibold text-red-900">📞 ¿Necesita ayuda?</p>
            <p className="text-sm text-red-800">
              Contacte al <strong>4357-5100 int. 7137</strong>
            </p>
            <p className="mt-1 text-xs text-red-700">Lunes a Viernes de 8:00 a 16:00 hs</p>
          </div>
          <Button
            onClick={() => setError(null)}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
        <div className="bg-grid-slate-100 absolute inset-0 opacity-30 [mask-image:radial-gradient(white,transparent_70%)]"></div>
        <div className="absolute left-20 top-20 h-72 w-72 animate-pulse rounded-full bg-orange-300 opacity-20 mix-blend-multiply blur-3xl filter"></div>
        <div
          className="absolute bottom-20 right-20 h-72 w-72 animate-pulse rounded-full bg-amber-300 opacity-20 mix-blend-multiply blur-3xl filter"
          style={{ animationDelay: '1s' }}
        ></div>

        <div className="relative z-10 w-full max-w-lg rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-2xl duration-700 animate-in fade-in slide-in-from-bottom-8">
          <div className="relative mb-6">
            <div
              className="absolute inset-0 animate-ping bg-orange-400 opacity-30 blur-3xl"
              style={{ animationDuration: '2s' }}
            ></div>
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-2xl duration-500 animate-in zoom-in">
              <XCircle className="h-16 w-16 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-4xl font-bold text-transparent">
            Turno Cancelado
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-gray-600">
            Su turno ha sido <strong className="text-orange-600">cancelado exitosamente</strong>.
            Hemos notificado a nuestro equipo sobre la cancelación.
          </p>

          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-inner">
            <p className="mb-4 flex items-center justify-center gap-2 text-base font-bold text-blue-900">
              <span className="text-2xl">📅</span>
              ¿Nuevo Turno?
            </p>
            <p className="mb-3 text-sm text-blue-800">
              Puede solicitar un nuevo turno cuando lo necesite
            </p>
            <div className="rounded-xl border border-blue-200 bg-white p-4">
              <p className="text-lg font-bold text-blue-700">
                📞 4357-5100 <span className="text-sm">int.</span> 7137
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-xs font-semibold text-gray-500">CONTACTO</p>
            <p className="text-sm text-gray-700">
              📧 <strong>transportepublicolanus@gmail.com</strong>
            </p>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500">🏛️ Municipalidad de Lanús</p>
            <p className="mt-1 text-xs text-gray-400">Dirección Gral. de Movilidad y Transporte</p>
          </div>
        </div>
      </div>
    )
  }

  if (showConfirm) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-4">
        <div className="bg-grid-slate-100 absolute inset-0 opacity-30 [mask-image:radial-gradient(white,transparent_70%)]"></div>
        <div className="absolute left-20 top-20 h-72 w-72 animate-pulse rounded-full bg-yellow-300 opacity-20 mix-blend-multiply blur-3xl filter"></div>
        <div
          className="absolute bottom-20 right-20 h-72 w-72 animate-pulse rounded-full bg-orange-300 opacity-20 mix-blend-multiply blur-3xl filter"
          style={{ animationDelay: '1s' }}
        ></div>

        <div className="duration-600 relative z-10 w-full max-w-lg rounded-3xl border border-yellow-100 bg-white p-10 text-center shadow-2xl animate-in fade-in slide-in-from-bottom-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-pulse bg-yellow-400 opacity-30 blur-3xl"></div>
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 shadow-2xl duration-500 animate-in zoom-in">
              <span className="animate-bounce text-6xl" style={{ animationDuration: '1.5s' }}>
                ⚠️
              </span>
            </div>
          </div>

          <h1 className="mb-4 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-4xl font-bold text-transparent">
            ¿Cancelar Turno?
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-gray-600">
            ¿Está seguro que desea <strong className="text-yellow-700">cancelar su turno</strong>?
            Esta acción notificará al municipio y liberará el horario.
          </p>

          <div className="mb-6 rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-6 shadow-inner">
            <p className="mb-3 flex items-center justify-center gap-2 text-base font-bold text-yellow-900">
              <span className="text-2xl">💡</span>
              ¿Prefiere reprogramar?
            </p>
            <p className="text-sm text-yellow-800">
              Puede solicitar un nuevo turno contactándonos al <strong>4357-5100 int. 7137</strong>
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="h-12 flex-1 border-2 font-semibold hover:bg-gray-50"
              disabled={confirming}
            >
              No, Mantener
            </Button>
            <Button
              onClick={cancelarTurno}
              className="h-12 flex-1 bg-gradient-to-r from-red-600 to-rose-600 font-semibold shadow-lg hover:from-red-700 hover:to-rose-700"
              disabled={confirming}
            >
              {confirming ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Sí, Cancelar'
              )}
            </Button>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500">🏛️ Municipalidad de Lanús</p>
            <p className="mt-1 text-xs text-gray-400">Dirección Gral. de Movilidad y Transporte</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
