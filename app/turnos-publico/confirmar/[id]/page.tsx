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
        method: 'POST'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Confirmando su turno...</p>
        </div>
      </div>
    )
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
          <p className="text-sm text-gray-500 mb-4">
            Si el problema persiste, contacte al 4357-5100 int. 7137
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ¡Turno Confirmado!
        </h1>
        <p className="text-gray-600 mb-6">
          Su turno ha sido confirmado exitosamente. Hemos notificado a nuestro equipo sobre su confirmación.
        </p>
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-6">
          <p className="text-sm text-green-900 font-semibold mb-2">
            📋 Recordatorios Importantes:
          </p>
          <ul className="text-sm text-green-800 text-left space-y-1">
            <li>• Presentarse con <strong>15 minutos de anticipación</strong></li>
            <li>• Traer toda la <strong>documentación</strong> en regla</li>
            <li>• DNI del titular y cédula verde</li>
          </ul>
        </div>
        <p className="text-sm text-gray-500">
          📞 Consultas: 4357-5100 int. 7137<br/>
          📧 transportepublicolanus@gmail.com
        </p>
      </div>
    </div>
  )
}
