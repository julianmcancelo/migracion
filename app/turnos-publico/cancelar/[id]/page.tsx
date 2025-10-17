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
          <Button onClick={() => setError(null)} className="w-full">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-12 w-12 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Turno Cancelado
          </h1>
          <p className="text-gray-600 mb-6">
            Su turno ha sido cancelado exitosamente. Hemos notificado a nuestro equipo sobre la cancelación.
          </p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
            <p className="text-sm text-blue-900">
              Puede solicitar un nuevo turno cuando lo necesite contactándonos al:
            </p>
            <p className="text-lg font-bold text-blue-700 mt-2">
              📞 4357-5100 int. 7137
            </p>
          </div>
          <p className="text-sm text-gray-500">
            📧 transportepublicolanus@gmail.com
          </p>
        </div>
      </div>
    )
  }

  if (showConfirm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            ¿Cancelar Turno?
          </h1>
          <p className="text-gray-600 mb-6">
            ¿Está seguro que desea cancelar su turno? Esta acción notificará al municipio y liberará el horario.
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-900">
              <strong>💡 ¿Prefiere reprogramar?</strong>
            </p>
            <p className="text-sm text-yellow-800 mt-2">
              Puede solicitar un nuevo turno contactándonos directamente al 4357-5100 int. 7137
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => router.push('/')} 
              variant="outline" 
              className="flex-1"
              disabled={confirming}
            >
              Volver
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
