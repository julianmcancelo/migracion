'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log del error para debugging
    console.error('Error capturado:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ilustración de error */}
        <div className="relative mb-8">
          <div className="text-[8rem] md:text-[12rem] font-black text-transparent bg-gradient-to-r from-red-600 via-orange-600 to-red-800 bg-clip-text leading-none">
            ¡Ups!
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-0 left-1/4 w-4 h-4 bg-red-400 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-red-500 rounded-full animate-bounce delay-500"></div>
          
          {/* Icono central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <AlertTriangle className="h-16 w-16 text-red-600" />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-6 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Algo salió mal
          </h1>
          
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            Ocurrió un error inesperado. Nuestro equipo ha sido notificado 
            y está trabajando para solucionarlo.
          </p>
        </div>

        {/* Detalles del error (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 rounded-lg p-4 mb-8 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Bug className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-800">Detalles del error (desarrollo):</span>
            </div>
            <code className="text-sm text-red-600 break-all">
              {error.message}
            </code>
            {error.digest && (
              <div className="mt-2 text-xs text-gray-500">
                ID: {error.digest}
              </div>
            )}
          </div>
        )}

        {/* Sugerencias */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            ¿Qué puedes hacer?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-lg">
                <RefreshCw className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Intentar de nuevo</div>
                <div className="text-gray-600">Recargar la página</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-lg">
                <Home className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Ir al inicio</div>
                <div className="text-gray-600">Volver a empezar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={reset}
            size="lg" 
            className="bg-red-600 hover:bg-red-700 text-white px-8"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Intentar de nuevo
          </Button>
          
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        {/* Información de contacto */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-500 mb-4">
            Si el problema persiste, por favor contacta a nuestro equipo de soporte
          </div>
          
          <div className="flex justify-center items-center gap-6 text-sm">
            <Link 
              href="mailto:transportepublicolanus@gmail.com" 
              className="text-red-600 hover:text-red-700 font-medium"
            >
              transportepublicolanus@gmail.com
            </Link>
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            Municipio de Lanús - Sistema de Gestión de Habilitaciones de Transporte
          </div>
        </div>
      </div>
    </div>
  )
}
