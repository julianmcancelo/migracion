import Link from 'next/link'
import { ArrowLeft, Home, Search, FileQuestion, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Ilustración 404 */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-[12rem] font-black leading-none text-transparent md:text-[16rem]">
            404
          </div>

          {/* Elementos decorativos flotantes */}
          <div className="absolute left-1/4 top-0 h-4 w-4 animate-bounce rounded-full bg-blue-400 delay-100"></div>
          <div className="absolute right-1/4 top-1/4 h-3 w-3 animate-bounce rounded-full bg-purple-400 delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 h-2 w-2 animate-bounce rounded-full bg-blue-500 delay-500"></div>

          {/* Icono central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white/80 p-6 shadow-lg backdrop-blur-sm">
              <FileQuestion className="h-16 w-16 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="mb-12 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            ¡Oops! Página no encontrada
          </h1>

          <p className="mx-auto max-w-md text-lg leading-relaxed text-gray-600">
            La página que buscas no existe o ha sido movida. No te preocupes, te ayudamos a
            encontrar lo que necesitas.
          </p>
        </div>

        {/* Sugerencias útiles */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/60 p-8 shadow-lg backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">¿Qué puedes hacer?</h2>

          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Home className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Ir al inicio</div>
                <div className="text-gray-600">Volver a la página principal</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Search className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Buscar habilitaciones</div>
                <div className="text-gray-600">Encontrar lo que necesitas</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
              <div className="rounded-lg bg-green-100 p-2">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Ver turnos</div>
                <div className="text-gray-600">Gestionar tus citas</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <FileQuestion className="h-4 w-4 text-orange-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Ayuda</div>
                <div className="text-gray-600">Contactar soporte</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-blue-600 px-8 text-white hover:bg-blue-700">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Volver al inicio
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/habilitaciones">
              <Search className="mr-2 h-5 w-5" />
              Ver habilitaciones
            </Link>
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-center gap-6 text-sm text-gray-500 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
              <span>Sistema funcionando correctamente</span>
            </div>

            <div className="flex items-center gap-2">
              <span>¿Necesitas ayuda?</span>
              <Link
                href="mailto:transportepublicolanus@gmail.com"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Contactanos
              </Link>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-400">
            Municipio de Lanús - Sistema de Gestión de Habilitaciones de Transporte
          </div>
        </div>
      </div>
    </div>
  )
}
