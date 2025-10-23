'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Página pública para confirmar un turno desde el email
 * No requiere autenticación
 */
export default function ConfirmarTurnoPublicoPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    confirmarTurno()
  }, [])

  const confirmarTurno = async () => {
    try {
      const response = await fetch(`/api/turnos/${params.id}/confirmar-publico`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Error al confirmar el turno')
      }
    } catch (err) {
      setError('Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="bg-grid-slate-100 absolute inset-0 opacity-30 [mask-image:radial-gradient(white,transparent_70%)]"></div>
        <div className="relative z-10 text-center duration-500 animate-in fade-in">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse bg-green-400 opacity-20 blur-3xl"></div>
            <Loader2
              className="relative mx-auto mb-6 h-16 w-16 animate-spin text-green-600"
              strokeWidth={2.5}
            />
          </div>
          <p className="animate-pulse text-lg font-medium text-gray-700">Confirmando su turno...</p>
          <p className="mt-2 text-sm text-gray-500">Por favor espere un momento</p>
        </div>
      </div>
    )
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
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
      <div className="bg-grid-slate-100 absolute inset-0 opacity-30 [mask-image:radial-gradient(white,transparent_70%)]"></div>

      {/* Efectos de fondo decorativos */}
      <div className="absolute left-20 top-20 h-72 w-72 animate-pulse rounded-full bg-green-300 opacity-20 mix-blend-multiply blur-3xl filter"></div>
      <div
        className="absolute bottom-20 right-20 h-72 w-72 animate-pulse rounded-full bg-emerald-300 opacity-20 mix-blend-multiply blur-3xl filter"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-green-100 bg-white p-10 text-center shadow-2xl duration-700 animate-in fade-in slide-in-from-bottom-8">
        {/* Ícono de éxito con animación */}
        <div className="relative mb-6">
          <div
            className="absolute inset-0 animate-ping bg-green-400 opacity-30 blur-3xl"
            style={{ animationDuration: '2s' }}
          ></div>
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-2xl duration-500 animate-in zoom-in">
            <CheckCircle className="h-16 w-16 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-4xl font-bold text-transparent">
          ¡Turno Confirmado!
        </h1>

        <p className="mb-8 text-lg leading-relaxed text-gray-600">
          Su turno ha sido <strong className="text-green-600">confirmado exitosamente</strong>.
          Hemos notificado a nuestro equipo sobre su confirmación.
        </p>

        <div className="mb-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-inner">
          <p className="mb-4 flex items-center justify-center gap-2 text-base font-bold text-green-900">
            <span className="text-2xl">📋</span>
            Recordatorios Importantes
          </p>
          <ul className="space-y-3 text-left text-sm text-green-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-green-500">✓</span>
              <span>
                Presentarse con <strong>15 minutos de anticipación</strong>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-green-500">✓</span>
              <span>
                Traer <strong>DNI del titular y cédula verde</strong>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-green-500">✓</span>
              <span>
                Toda la <strong>documentación en regla</strong>
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 text-xs font-semibold text-gray-500">CONTACTO</p>
          <p className="text-sm text-gray-700">
            📞 <strong>4357-5100</strong> int. <strong>7137</strong>
            <br />
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
