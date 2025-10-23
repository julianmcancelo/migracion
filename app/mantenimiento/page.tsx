import Link from 'next/link'
import { Wrench, Clock, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MantenimientoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Ilustración de mantenimiento */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-800 bg-clip-text text-[8rem] font-black leading-none text-transparent md:text-[12rem]">
            🔧
          </div>

          {/* Elementos decorativos animados */}
          <div className="absolute left-1/4 top-0 h-4 w-4 animate-bounce rounded-full bg-yellow-400 delay-100"></div>
          <div className="absolute right-1/4 top-1/4 h-3 w-3 animate-bounce rounded-full bg-orange-400 delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 h-2 w-2 animate-bounce rounded-full bg-yellow-500 delay-500"></div>

          {/* Icono central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white/80 p-6 shadow-lg backdrop-blur-sm">
              <Wrench className="h-16 w-16 animate-pulse text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="mb-12 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Sistema en mantenimiento</h1>

          <p className="mx-auto max-w-md text-lg leading-relaxed text-gray-600">
            Estamos realizando mejoras en el sistema para brindarte una mejor experiencia.
            Volveremos pronto.
          </p>
        </div>

        {/* Información del mantenimiento */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/60 p-8 shadow-lg backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-center gap-3">
            <Clock className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-800">Tiempo estimado</h2>
          </div>

          <div className="mb-2 text-3xl font-bold text-yellow-600">2 horas</div>

          <p className="mb-6 text-gray-600">
            El mantenimiento comenzó a las 02:00 AM y finalizará aproximadamente a las 04:00 AM
          </p>

          {/* Barra de progreso */}
          <div className="mb-4 h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 animate-pulse rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
              style={{ width: '65%' }}
            ></div>
          </div>

          <div className="text-sm text-gray-500">Progreso: 65% completado</div>
        </div>

        {/* Qué estamos mejorando */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">¿Qué estamos mejorando?</h3>

          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Optimización de base de datos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Mejoras de seguridad</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></div>
              <span>Nuevas funcionalidades</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
              <span>Optimización de rendimiento</span>
            </div>
          </div>
        </div>

        {/* Contacto de emergencia */}
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-red-800">¿Necesitas ayuda urgente?</h3>
          <p className="mb-4 text-sm text-red-700">
            Para emergencias relacionadas con habilitaciones de transporte
          </p>
          <Button
            asChild
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <Link href="mailto:transportepublicolanus@gmail.com">
              <Mail className="mr-2 h-4 w-4" />
              Contactar por email
            </Link>
          </Button>
        </div>

        {/* Botón de volver */}
        <div className="flex justify-center">
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver más tarde
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="mb-2 text-sm text-gray-500">Gracias por tu paciencia</div>
          <div className="text-xs text-gray-400">
            Municipio de Lanús - Sistema de Gestión de Habilitaciones de Transporte
          </div>
        </div>
      </div>
    </div>
  )
}
