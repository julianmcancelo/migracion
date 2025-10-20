import Link from 'next/link'
import { ArrowLeft, Home, Search, FileQuestion, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ilustración 404 */}
        <div className="relative mb-8">
          <div className="text-[12rem] md:text-[16rem] font-black text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text leading-none">
            404
          </div>
          
          {/* Elementos decorativos flotantes */}
          <div className="absolute top-0 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-500"></div>
          
          {/* Icono central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <FileQuestion className="h-16 w-16 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-6 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            ¡Oops! Página no encontrada
          </h1>
          
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            La página que buscas no existe o ha sido movida. 
            No te preocupes, te ayudamos a encontrar lo que necesitas.
          </p>
        </div>

        {/* Sugerencias útiles */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            ¿Qué puedes hacer?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Home className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Ir al inicio</div>
                <div className="text-gray-600">Volver a la página principal</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Search className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Buscar habilitaciones</div>
                <div className="text-gray-600">Encontrar lo que necesitas</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-lg">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Ver turnos</div>
                <div className="text-gray-600">Gestionar tus citas</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="bg-orange-100 p-2 rounded-lg">
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Volver al inicio
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/habilitaciones">
              <Search className="h-5 w-5 mr-2" />
              Ver habilitaciones
            </Link>
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Sistema funcionando correctamente</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>¿Necesitas ayuda?</span>
              <Link 
                href="mailto:transportepublicolanus@gmail.com" 
                className="text-blue-600 hover:text-blue-700 font-medium"
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
