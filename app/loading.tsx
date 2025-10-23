import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        {/* Spinner principal */}
        <div className="relative mb-8">
          <div className="mx-auto h-20 w-20 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>

          {/* Elementos decorativos */}
          <div className="absolute -left-2 -top-2 h-6 w-6 animate-pulse rounded-full bg-blue-400"></div>
          <div className="absolute -right-2 -top-2 h-4 w-4 animate-pulse rounded-full bg-purple-400 delay-300"></div>
          <div className="absolute -bottom-2 -left-2 h-4 w-4 animate-pulse rounded-full bg-blue-500 delay-500"></div>
          <div className="absolute -bottom-2 -right-2 h-6 w-6 animate-pulse rounded-full bg-purple-500 delay-700"></div>
        </div>

        {/* Texto de carga */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Cargando...</h2>

          <p className="mx-auto max-w-sm text-gray-600">
            Estamos preparando todo para ti. Esto solo tomará unos segundos.
          </p>

          {/* Barra de progreso animada */}
          <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
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
