import Link from 'next/link'
import { Shield, ArrowLeft, LogIn, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NoAutorizadoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ilustración de acceso denegado */}
        <div className="relative mb-8">
          <div className="text-[8rem] md:text-[12rem] font-black text-transparent bg-gradient-to-r from-red-600 via-pink-600 to-red-800 bg-clip-text leading-none">
            403
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-0 left-1/4 w-4 h-4 bg-red-400 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-red-500 rounded-full animate-bounce delay-500"></div>
          
          {/* Icono central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <Shield className="h-16 w-16 text-red-600" />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-6 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Acceso no autorizado
          </h1>
          
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            No tienes permisos para acceder a esta página. 
            Por favor, inicia sesión con una cuenta autorizada.
          </p>
        </div>

        {/* Información de seguridad */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Área restringida
            </h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Esta sección del sistema está protegida y requiere autenticación válida.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">
              ¿Eres empleado municipal?
            </h3>
            <p className="text-red-700 text-sm">
              Contacta al administrador del sistema para obtener acceso o 
              verifica que estés usando las credenciales correctas.
            </p>
          </div>
        </div>

        {/* Opciones disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <LogIn className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-800 mb-2">
              Iniciar sesión
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Accede con tu cuenta autorizada
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/login">
                Ir al login
              </Link>
            </Button>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-2">
              Área pública
            </h3>
            <p className="text-green-700 text-sm mb-4">
              Consulta información sin restricciones
            </p>
            <Button asChild variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-100">
              <Link href="/">
                Ver área pública
              </Link>
            </Button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
            <Link href="/login">
              <LogIn className="h-5 w-5 mr-2" />
              Iniciar sesión
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        {/* Información de contacto */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-2">
            ¿Necesitas acceso al sistema?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Si eres empleado municipal y necesitas acceso, contacta al administrador del sistema
          </p>
          <div className="flex justify-center">
            <Link 
              href="mailto:transportepublicolanus@gmail.com" 
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              transportepublicolanus@gmail.com
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-xs text-gray-400">
            Municipio de Lanús - Sistema de Gestión de Habilitaciones de Transporte
          </div>
        </div>
      </div>
    </div>
  )
}
