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
        method: 'POST'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Turno Cancelado
          </h1>
          <p className="text-gray-600 mb-6">
            Su turno ha sido cancelado exitosamente. Puede solicitar un nuevo turno cuando lo necesite.
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¿Cancelar Turno?
          </h1>
          <p className="text-gray-600 mb-6">
            ¿Está seguro que desea cancelar su turno? Esta acción no se puede deshacer.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
