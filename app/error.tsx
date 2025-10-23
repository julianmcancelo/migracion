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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Ilustración de error */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-800 bg-clip-text text-[8rem] font-black leading-none text-transparent md:text-[12rem]">
            ¡Ups!
          </div>

          {/* Elementos decorativos */}
          <div className="absolute left-1/4 top-0 h-4 w-4 animate-bounce rounded-full bg-red-400 delay-100"></div>
          <div className="absolute right-1/4 top-1/4 h-3 w-3 animate-bounce rounded-full bg-orange-400 delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 h-2 w-2 animate-bounce rounded-full bg-red-500 delay-500"></div>

          {/* Icono central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white/80 p-6 shadow-lg backdrop-blur-sm">
              <AlertTriangle className="h-16 w-16 text-red-600" />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="mb-12 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Algo salió mal</h1>

          <p className="mx-auto max-w-md text-lg leading-relaxed text-gray-600">
            Ocurrió un error inesperado. Nuestro equipo ha sido notificado y está trabajando para
            solucionarlo.
          </p>
        </div>

        {/* Detalles del error (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 rounded-lg bg-gray-100 p-4 text-left">
            <div className="mb-2 flex items-center gap-2">
              <Bug className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-800">Detalles del error (desarrollo):</span>
            </div>
            <code className="break-all text-sm text-red-600">{error.message}</code>
            {error.digest && <div className="mt-2 text-xs text-gray-500">ID: {error.digest}</div>}
          </div>
        )}

        {/* Sugerencias */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/60 p-8 shadow-lg backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">¿Qué puedes hacer?</h2>

          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Intentar de nuevo</div>
                <div className="text-gray-600">Recargar la página</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
              <div className="rounded-lg bg-green-100 p-2">
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
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button onClick={reset} size="lg" className="bg-red-600 px-8 text-white hover:bg-red-700">
            <RefreshCw className="mr-2 h-5 w-5" />
            Intentar de nuevo
          </Button>

          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        {/* Información de contacto */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="mb-4 text-sm text-gray-500">
            Si el problema persiste, por favor contacta a nuestro equipo de soporte
          </div>

          <div className="flex items-center justify-center gap-6 text-sm">
            <Link
              href="mailto:transportepublicolanus@gmail.com"
              className="font-medium text-red-600 hover:text-red-700"
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
