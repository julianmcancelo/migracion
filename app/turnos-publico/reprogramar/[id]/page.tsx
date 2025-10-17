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
        body: JSON.stringify({ observaciones })
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => setError(null)} className="w-full">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            ¡Solicitud Enviada!
          </h1>
          <p className="text-gray-600 mb-6">
            Su solicitud de reprogramación ha sido recibida exitosamente. Nuestro equipo se contactará con usted a la brevedad.
          </p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
            <p className="text-sm text-blue-900 font-semibold mb-2">
              ⏱️ Tiempo de respuesta estimado:
            </p>
            <p className="text-sm text-blue-800">
              24 a 48 horas hábiles
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-700 font-semibold mb-1">
              Para consultas inmediatas:
            </p>
            <p className="text-base font-bold text-gray-900">
              📞 4357-5100 int. 7137
            </p>
            <p className="text-sm text-gray-600 mt-2">
              📧 transportepublicolanus@gmail.com
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Lunes a Viernes de 8:00 a 16:00 hs
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reprogramar Turno
          </h1>
          <p className="text-gray-600">
            Complete el formulario y nos contactaremos con usted para coordinar una nueva fecha.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Motivo de la reprogramación (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Necesito cambiar la fecha por razones laborales..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <p className="text-sm text-purple-900 font-semibold mb-2">
              📋 Información importante:
            </p>
            <ul className="text-xs text-purple-800 space-y-1">
              <li>• Su turno actual quedará en estado PENDIENTE</li>
              <li>• Nos contactaremos vía email o teléfono</li>
              <li>• La reprogramación está sujeta a disponibilidad</li>
            </ul>
          </div>

          <Button 
            onClick={solicitarReprogramacion}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Enviando solicitud...
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5 mr-2" />
                Solicitar Reprogramación
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 mt-4">
            También puede llamar directamente al<br/>
            <strong>4357-5100 int. 7137</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
