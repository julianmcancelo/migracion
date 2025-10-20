import Link from 'next/link'
import { Wrench, Clock, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MantenimientoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ilustración de mantenimiento */}
        <div className="relative mb-8">
          <div className="text-[8rem] md:text-[12rem] font-black text-transparent bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-800 bg-clip-text leading-none">
            🔧
          </div>
          
          {/* Elementos decorativos animados */}
          <div className="absolute top-0 left-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-yellow-500 rounded-full animate-bounce delay-500"></div>
          
          {/* Icono central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-6 shadow-lg">
              <Wrench className="h-16 w-16 text-yellow-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-6 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Sistema en mantenimiento
          </h1>
          
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            Estamos realizando mejoras en el sistema para brindarte 
            una mejor experiencia. Volveremos pronto.
          </p>
        </div>

        {/* Información del mantenimiento */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Clock className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Tiempo estimado
            </h2>
          </div>
          
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            2 horas
          </div>
          
          <p className="text-gray-600 mb-6">
            El mantenimiento comenzó a las 02:00 AM y finalizará aproximadamente a las 04:00 AM
          </p>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full animate-pulse" style={{width: '65%'}}></div>
          </div>
          
          <div className="text-sm text-gray-500">
            Progreso: 65% completado
          </div>
        </div>

        {/* Qué estamos mejorando */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            ¿Qué estamos mejorando?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Optimización de base de datos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Mejoras de seguridad</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Nuevas funcionalidades</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Optimización de rendimiento</span>
            </div>
          </div>
        </div>

        {/* Contacto de emergencia */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            ¿Necesitas ayuda urgente?
          </h3>
          <p className="text-red-700 text-sm mb-4">
            Para emergencias relacionadas con habilitaciones de transporte
          </p>
          <Button asChild variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
            <Link href="mailto:transportepublicolanus@gmail.com">
              <Mail className="h-4 w-4 mr-2" />
              Contactar por email
            </Link>
          </Button>
        </div>

        {/* Botón de volver */}
        <div className="flex justify-center">
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver más tarde
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-500 mb-2">
            Gracias por tu paciencia
          </div>
          <div className="text-xs text-gray-400">
            Municipio de Lanús - Sistema de Gestión de Habilitaciones de Transporte
          </div>
        </div>
      </div>
    </div>
  )
}
