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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(white,transparent_70%)] opacity-30"></div>
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center relative z-10 border border-red-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-400 blur-3xl opacity-20 animate-pulse"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto relative shadow-lg">
              <span className="text-5xl animate-bounce">❌</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Algo salió mal</h1>
          <p className="text-gray-600 mb-6 text-lg">{error}</p>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-900 font-semibold mb-2">📞 ¿Necesita ayuda?</p>
            <p className="text-sm text-red-800">Contacte al <strong>4357-5100 int. 7137</strong></p>
            <p className="text-xs text-red-700 mt-1">Lunes a Viernes de 8:00 a 16:00 hs</p>
          </div>
          <Button onClick={() => setError(null)} className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(white,transparent_70%)] opacity-30"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center relative z-10 border border-orange-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-orange-400 blur-3xl opacity-30 animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto relative shadow-2xl animate-in zoom-in duration-500">
              <XCircle className="h-16 w-16 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Turno Cancelado
          </h1>
          
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Su turno ha sido <strong className="text-orange-600">cancelado exitosamente</strong>. Hemos notificado a nuestro equipo sobre la cancelación.
          </p>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 mb-6 shadow-inner">
            <p className="text-base text-blue-900 font-bold mb-4 flex items-center justify-center gap-2">
              <span className="text-2xl">📅</span>
              ¿Nuevo Turno?
            </p>
            <p className="text-sm text-blue-800 mb-3">
              Puede solicitar un nuevo turno cuando lo necesite
            </p>
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <p className="text-lg font-bold text-blue-700">
                📞 4357-5100 <span className="text-sm">int.</span> 7137
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 font-semibold mb-2">CONTACTO</p>
            <p className="text-sm text-gray-700">
              📧 <strong>transportepublicolanus@gmail.com</strong>
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">🏛️ Municipalidad de Lanús</p>
            <p className="text-xs text-gray-400 mt-1">Dirección Gral. de Movilidad y Transporte</p>
          </div>
        </div>
      </div>
    )
  }

  if (showConfirm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(white,transparent_70%)] opacity-30"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center relative z-10 border border-yellow-100 animate-in fade-in slide-in-from-bottom-6 duration-600">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30 animate-pulse"></div>
            <div className="w-28 h-28 bg-gradient-to-br from-yellow-200 to-amber-300 rounded-full flex items-center justify-center mx-auto relative shadow-2xl animate-in zoom-in duration-500">
              <span className="text-6xl animate-bounce" style={{ animationDuration: '1.5s' }}>⚠️</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-4">
            ¿Cancelar Turno?
          </h1>
          
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            ¿Está seguro que desea <strong className="text-yellow-700">cancelar su turno</strong>? Esta acción notificará al municipio y liberará el horario.
          </p>
          
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6 shadow-inner">
            <p className="text-base text-yellow-900 font-bold mb-3 flex items-center justify-center gap-2">
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
              className="flex-1 h-12 border-2 hover:bg-gray-50 font-semibold"
              disabled={confirming}
            >
              No, Mantener
            </Button>
            <Button 
              onClick={cancelarTurno} 
              className="flex-1 h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 font-semibold shadow-lg"
              disabled={confirming}
            >
              {confirming ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Sí, Cancelar'
              )}
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">🏛️ Municipalidad de Lanús</p>
            <p className="text-xs text-gray-400 mt-1">Dirección Gral. de Movilidad y Transporte</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
