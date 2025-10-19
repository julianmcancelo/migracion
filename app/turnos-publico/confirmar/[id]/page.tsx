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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(white,transparent_70%)] opacity-30"></div>
        <div className="text-center relative z-10 animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 blur-3xl opacity-20 animate-pulse"></div>
            <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto mb-6 relative" strokeWidth={2.5} />
          </div>
          <p className="text-gray-700 text-lg font-medium animate-pulse">Confirmando su turno...</p>
          <p className="text-gray-500 text-sm mt-2">Por favor espere un momento</p>
        </div>
      </div>
    )
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(white,transparent_70%)] opacity-30"></div>
      
      {/* Efectos de fondo decorativos */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center relative z-10 border border-green-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Ícono de éxito con animación */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-green-400 blur-3xl opacity-30 animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto relative shadow-2xl animate-in zoom-in duration-500">
            <CheckCircle className="h-16 w-16 text-white" strokeWidth={2.5} />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          ¡Turno Confirmado!
        </h1>
        
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Su turno ha sido <strong className="text-green-600">confirmado exitosamente</strong>. Hemos notificado a nuestro equipo sobre su confirmación.
        </p>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-6 shadow-inner">
          <p className="text-base text-green-900 font-bold mb-4 flex items-center justify-center gap-2">
            <span className="text-2xl">📋</span>
            Recordatorios Importantes
          </p>
          <ul className="text-sm text-green-800 text-left space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              <span>Presentarse con <strong>15 minutos de anticipación</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              <span>Traer <strong>DNI del titular y cédula verde</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              <span>Toda la <strong>documentación en regla</strong></span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500 font-semibold mb-2">CONTACTO</p>
          <p className="text-sm text-gray-700">
            📞 <strong>4357-5100</strong> int. <strong>7137</strong><br/>
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
