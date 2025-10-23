import Link from 'next/link'
import { Shield, ArrowLeft, LogIn, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NoAutorizadoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Ilustración de acceso denegado */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-800 bg-clip-text text-[8rem] font-black leading-none text-transparent md:text-[12rem]">
            403
          </div>

          {/* Elementos decorativos */}
          <div className="absolute left-1/4 top-0 h-4 w-4 animate-bounce rounded-full bg-red-400 delay-100"></div>
          <div className="absolute right-1/4 top-1/4 h-3 w-3 animate-bounce rounded-full bg-pink-400 delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 h-2 w-2 animate-bounce rounded-full bg-red-500 delay-500"></div>

          {/* Icono central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white/80 p-6 shadow-lg backdrop-blur-sm">
              <Shield className="h-16 w-16 text-red-600" />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="mb-12 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Acceso no autorizado</h1>

          <p className="mx-auto max-w-md text-lg leading-relaxed text-gray-600">
            No tienes permisos para acceder a esta página. Por favor, inicia sesión con una cuenta
            autorizada.
          </p>
        </div>

        {/* Información de seguridad */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/60 p-8 shadow-lg backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-800">Área restringida</h2>
          </div>

          <p className="mb-6 text-gray-600">
            Esta sección del sistema está protegida y requiere autenticación válida.
          </p>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-800">¿Eres empleado municipal?</h3>
            <p className="text-sm text-red-700">
              Contacta al administrador del sistema para obtener acceso o verifica que estés usando
              las credenciales correctas.
            </p>
          </div>
        </div>

        {/* Opciones disponibles */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <LogIn className="mx-auto mb-3 h-8 w-8 text-blue-600" />
            <h3 className="mb-2 font-semibold text-blue-800">Iniciar sesión</h3>
            <p className="mb-4 text-sm text-blue-700">Accede con tu cuenta autorizada</p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/login">Ir al login</Link>
            </Button>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <Shield className="mx-auto mb-3 h-8 w-8 text-green-600" />
            <h3 className="mb-2 font-semibold text-green-800">Área pública</h3>
            <p className="mb-4 text-sm text-green-700">Consulta información sin restricciones</p>
            <Button
              asChild
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-100"
            >
              <Link href="/">Ver área pública</Link>
            </Button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-red-600 px-8 text-white hover:bg-red-700">
            <Link href="/login">
              <LogIn className="mr-2 h-5 w-5" />
              Iniciar sesión
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        {/* Información de contacto */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-2 font-semibold text-gray-800">¿Necesitas acceso al sistema?</h3>
          <p className="mb-4 text-sm text-gray-600">
            Si eres empleado municipal y necesitas acceso, contacta al administrador del sistema
          </p>
          <div className="flex justify-center">
            <Link
              href="mailto:transportepublicolanus@gmail.com"
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              transportepublicolanus@gmail.com
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="text-xs text-gray-400">
            Municipio de Lanús - Sistema de Gestión de Habilitaciones de Transporte
          </div>
        </div>
      </div>
    </div>
  )
}
