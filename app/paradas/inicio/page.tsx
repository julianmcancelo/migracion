'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Upload, 
  Database, 
  Map as MapIcon,
  ArrowRight,
  Zap,
  Globe
} from 'lucide-react'
import Link from 'next/link'

export default function ParadasInicioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl mb-6">
            <MapPin className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Sistema de Paradas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gestiona, geocodifica y visualiza paradas de transporte de forma profesional
          </p>
        </div>

        {/* Opciones */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Opción 1: Geocodificar */}
          <Card className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Geocodificar Excel
              </h2>
              <p className="text-gray-600 mb-6">
                Sube un archivo Excel con direcciones y conviértelas automáticamente en coordenadas GPS usando Google Maps
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  Interfaz gráfica fácil de usar
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  Progreso en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  Descarga CSV y GeoJSON
                </li>
              </ul>
              <Link href="/paradas/geocodificar">
                <Button className="w-full h-12 text-lg group-hover:bg-green-600">
                  Comenzar
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Opción 2: Base de Datos */}
          <Card className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Paradas en BD
              </h2>
              <p className="text-gray-600 mb-6">
                Gestiona las paradas almacenadas en la base de datos. Crea, edita y elimina puntos de interés
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  196 paradas activas
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  CRUD completo
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Filtros por tipo y estado
                </li>
              </ul>
              <Link href="/paradas">
                <Button className="w-full h-12 text-lg group-hover:bg-blue-600">
                  Abrir Mapa
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Opción 3: Ver Geocodificadas */}
          <Card className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Paradas Geocodificadas
              </h2>
              <p className="text-gray-600 mb-6">
                Visualiza las paradas que fueron geocodificadas desde archivos Excel con información detallada
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Filtros avanzados
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Nivel de precisión GPS
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Exportar subconjuntos
                </li>
              </ul>
              <Link href="/paradas/geocodificadas">
                <Button className="w-full h-12 text-lg group-hover:bg-purple-600">
                  Ver Resultados
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Información adicional */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">¿Primera vez geocodificando?</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Te recomendamos empezar con pocas filas (10-20) para probar el sistema antes de procesar archivos grandes.
                </p>
                <Link href="/paradas/geocodificar">
                  <Button variant="outline" size="sm" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100">
                    Ir al Geocodificador
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">¿Ya tienes paradas en la BD?</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Accede directamente al mapa para visualizar, editar o agregar nuevas paradas manualmente.
                </p>
                <Link href="/paradas">
                  <Button variant="outline" size="sm" className="border-blue-400 text-blue-700 hover:bg-blue-100">
                    Abrir Mapa de BD
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer con ayuda */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>¿Necesitas ayuda? Revisa la documentación en la carpeta <code className="bg-gray-200 px-2 py-1 rounded">/paradas/README_GEOCODIFICACION.md</code></p>
        </div>
      </div>
    </div>
  )
}
