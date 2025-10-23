'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Página para confirmar un turno desde el email
 */
export default function ConfirmarTurnoPage() {
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
        headers: { 'Content-Type': 'application/json' },
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Confirmando su turno...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Error</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <Button onClick={() => router.push('/turnos')} className="w-full">
            Volver a Turnos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">¡Turno Confirmado!</h1>
        <p className="mb-6 text-gray-600">
          Su turno ha sido confirmado exitosamente. Le esperamos en la fecha y hora acordada.
        </p>
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            <strong>Recuerde:</strong> Presentarse con 15 minutos de anticipación con toda la
            documentación en regla.
          </p>
        </div>
        <Button
          onClick={() => router.push('/turnos')}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Ver Mis Turnos
        </Button>
      </div>
    </div>
  )
}
