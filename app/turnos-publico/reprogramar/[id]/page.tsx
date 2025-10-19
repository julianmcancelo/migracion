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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(white,transparent_70%)] opacity-30"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center relative z-10 border border-purple-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-400 blur-3xl opacity-30 animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="w-28 h-28 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center mx-auto relative shadow-2xl animate-in zoom-in duration-500">
              <Calendar className="h-16 w-16 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-4">
            ¡Solicitud Enviada!
          </h1>
          
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Su solicitud de reprogramación ha sido <strong className="text-purple-600">recibida exitosamente</strong>. Nuestro equipo se contactará con usted a la brevedad.
          </p>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6 shadow-inner">
            <p className="text-base text-blue-900 font-bold mb-4 flex items-center justify-center gap-2">
              <span className="text-2xl">⏱️</span>
              Tiempo de Respuesta
            </p>
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <p className="text-lg font-bold text-blue-700">
                24 a 48 horas hábiles
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
            <p className="text-xs text-gray-500 font-semibold mb-3">CONTACTO DIRECTO</p>
            <p className="text-sm text-gray-700">
              📞 <strong>4357-5100</strong> int. <strong>7137</strong><br/>
              📧 <strong>transportepublicolanus@gmail.com</strong>
            </p>
            <p className="text-xs text-gray-500 mt-2">⏰ Lunes a Viernes de 8:00 a 16:00 hs</p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">🏛️ Municipalidad de Lanús</p>
            <p className="text-xs text-gray-400 mt-1">Dirección Gral. de Movilidad y Transporte</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(white,transparent_70%)] opacity-30"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full relative z-10 border border-purple-100 animate-in fade-in slide-in-from-bottom-6 duration-600">
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-400 blur-3xl opacity-20 animate-pulse"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-violet-200 rounded-full flex items-center justify-center mx-auto relative shadow-lg">
              <Calendar className="h-12 w-12 text-purple-600" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-3">
            Reprogramar Turno
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            Complete el formulario y nos contactaremos con usted para coordinar una nueva fecha.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Motivo de la reprogramación (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Necesito cambiar la fecha por razones laborales..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all duration-200"
              rows={4}
            />
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-2xl p-5 shadow-inner">
            <p className="text-sm text-purple-900 font-bold mb-3 flex items-center gap-2">
              <span className="text-lg">📋</span>
              Información importante
            </p>
            <ul className="text-xs text-purple-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold mt-0.5">✓</span>
                <span>Su turno actual quedará en estado PENDIENTE</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold mt-0.5">✓</span>
                <span>Nos contactaremos vía email o teléfono</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold mt-0.5">✓</span>
                <span>La reprogramación está sujeta a disponibilidad</span>
              </li>
            </ul>
          </div>

          <Button 
            onClick={solicitarReprogramacion}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 h-14 text-base font-bold shadow-lg"
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

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-center text-gray-500 mb-2">CONTACTO DIRECTO</p>
            <p className="text-sm text-center text-gray-700">
              📞 <strong>4357-5100 int. 7137</strong>
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">🏛️ Municipalidad de Lanús</p>
          <p className="text-xs text-gray-400 mt-1">Dirección Gral. de Movilidad y Transporte</p>
        </div>
      </div>
    </div>
  )
}
