'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Página para cancelar un turno desde el email
 */
export default function CancelarTurnoPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showConfirm, setShowConfirm] = useState(true)

  useEffect(() => {
    // Solo cargar la página, no cancelar automáticamente
    setLoading(false)
  }, [])

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-gray-600" />
          <p className="text-gray-600">Cargando...</p>
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
          <div className="flex gap-3">
            <Button onClick={() => setError(null)} variant="outline" className="flex-1">
              Reintentar
            </Button>
            <Button onClick={() => router.push('/turnos')} className="flex-1">
              Volver a Turnos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <XCircle className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Turno Cancelado</h1>
          <p className="mb-6 text-gray-600">
            Su turno ha sido cancelado exitosamente. Puede solicitar un nuevo turno cuando lo
            necesite.
          </p>
          <Button onClick={() => router.push('/turnos')} className="w-full">
            Volver a Turnos
          </Button>
        </div>
      </div>
    )
  }

  if (showConfirm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">¿Cancelar Turno?</h1>
          <p className="mb-6 text-gray-600">
            ¿Está seguro que desea cancelar su turno? Esta acción no se puede deshacer.
          </p>
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              Si necesita reprogramar, puede solicitar un nuevo turno después de cancelar este.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/turnos')}
              variant="outline"
              className="flex-1"
              disabled={confirming}
            >
              No, Mantener
            </Button>
            <Button
              onClick={cancelarTurno}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={confirming}
            >
              {confirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Sí, Cancelar'
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
