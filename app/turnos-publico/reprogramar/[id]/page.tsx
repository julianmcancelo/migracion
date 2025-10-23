'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Página pública para solicitar reprogramación de turno
 * No requiere autenticación
 */
export default function ReprogramarTurnoPublicoPage() {
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [observaciones, setObservaciones] = useState('')

  const solicitarReprogramacion = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/turnos/${params.id}/reprogramar-publico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observaciones }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Error al solicitar reprogramación')
      }
    } catch (err) {
      setError('Error al procesar la solicitud')
    } finally {
      setLoading(false)
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-4">
        <div className="bg-grid-slate-100 absolute inset-0 opacity-30 [mask-image:radial-gradient(white,transparent_70%)]"></div>
        <div className="absolute left-20 top-20 h-72 w-72 animate-pulse rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-3xl filter"></div>
        <div
          className="absolute bottom-20 right-20 h-72 w-72 animate-pulse rounded-full bg-violet-300 opacity-20 mix-blend-multiply blur-3xl filter"
          style={{ animationDelay: '1s' }}
        ></div>

        <div className="relative z-10 w-full max-w-lg rounded-3xl border border-purple-100 bg-white p-10 text-center shadow-2xl duration-700 animate-in fade-in slide-in-from-bottom-8">
          <div className="relative mb-6">
            <div
              className="absolute inset-0 animate-ping bg-purple-400 opacity-30 blur-3xl"
              style={{ animationDuration: '2s' }}
            ></div>
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-violet-500 shadow-2xl duration-500 animate-in zoom-in">
              <Calendar className="h-16 w-16 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-4xl font-bold text-transparent">
            ¡Solicitud Enviada!
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-gray-600">
            Su solicitud de reprogramación ha sido{' '}
            <strong className="text-purple-600">recibida exitosamente</strong>. Nuestro equipo se
            contactará con usted a la brevedad.
          </p>

          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-inner">
            <p className="mb-4 flex items-center justify-center gap-2 text-base font-bold text-blue-900">
              <span className="text-2xl">⏱️</span>
              Tiempo de Respuesta
            </p>
            <div className="rounded-xl border border-blue-200 bg-white p-4">
              <p className="text-lg font-bold text-blue-700">24 a 48 horas hábiles</p>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-xs font-semibold text-gray-500">CONTACTO DIRECTO</p>
            <p className="text-sm text-gray-700">
              📞 <strong>4357-5100</strong> int. <strong>7137</strong>
              <br />
              📧 <strong>transportepublicolanus@gmail.com</strong>
            </p>
            <p className="mt-2 text-xs text-gray-500">⏰ Lunes a Viernes de 8:00 a 16:00 hs</p>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500">🏛️ Municipalidad de Lanús</p>
            <p className="mt-1 text-xs text-gray-400">Dirección Gral. de Movilidad y Transporte</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-4">
      <div className="bg-grid-slate-100 absolute inset-0 opacity-30 [mask-image:radial-gradient(white,transparent_70%)]"></div>
      <div className="absolute left-20 top-20 h-72 w-72 animate-pulse rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-3xl filter"></div>
      <div
        className="absolute bottom-20 right-20 h-72 w-72 animate-pulse rounded-full bg-violet-300 opacity-20 mix-blend-multiply blur-3xl filter"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="duration-600 relative z-10 w-full max-w-lg rounded-3xl border border-purple-100 bg-white p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-6">
        <div className="mb-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-pulse bg-purple-400 opacity-20 blur-3xl"></div>
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-violet-200 shadow-lg">
              <Calendar className="h-12 w-12 text-purple-600" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="mb-3 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-4xl font-bold text-transparent">
            Reprogramar Turno
          </h1>
          <p className="text-base leading-relaxed text-gray-600">
            Complete el formulario y nos contactaremos con usted para coordinar una nueva fecha.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-3 block text-sm font-bold text-gray-700">
              Motivo de la reprogramación (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Ej: Necesito cambiar la fecha por razones laborales..."
              className="w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              rows={4}
            />
          </div>

          <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5 shadow-inner">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-purple-900">
              <span className="text-lg">📋</span>
              Información importante
            </p>
            <ul className="space-y-2 text-xs text-purple-800">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-purple-500">✓</span>
                <span>Su turno actual quedará en estado PENDIENTE</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-purple-500">✓</span>
                <span>Nos contactaremos vía email o teléfono</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-purple-500">✓</span>
                <span>La reprogramación está sujeta a disponibilidad</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={solicitarReprogramacion}
            disabled={loading}
            className="h-14 w-full bg-gradient-to-r from-purple-600 to-violet-600 text-base font-bold shadow-lg hover:from-purple-700 hover:to-violet-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando solicitud...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-5 w-5" />
                Solicitar Reprogramación
              </>
            )}
          </Button>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-center text-xs text-gray-500">CONTACTO DIRECTO</p>
            <p className="text-center text-sm text-gray-700">
              📞 <strong>4357-5100 int. 7137</strong>
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6 text-center">
          <p className="text-xs text-gray-500">🏛️ Municipalidad de Lanús</p>
          <p className="mt-1 text-xs text-gray-400">Dirección Gral. de Movilidad y Transporte</p>
        </div>
      </div>
    </div>
  )
}
