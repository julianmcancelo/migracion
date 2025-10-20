import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        {/* Spinner principal */}
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          
          {/* Elementos decorativos */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-400 rounded-full animate-pulse delay-300"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-500"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-500 rounded-full animate-pulse delay-700"></div>
        </div>

        {/* Texto de carga */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Cargando...
          </h2>
          
          <p className="text-gray-600 max-w-sm mx-auto">
            Estamos preparando todo para ti. 
            Esto solo tomará unos segundos.
          </p>
          
          {/* Barra de progreso animada */}
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="mt-12 text-xs text-gray-400">
          Municipio de Lanús - Sistema de Gestión de Habilitaciones
        </div>
      </div>
    </div>
  )
}
