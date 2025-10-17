import Link from 'next/link'
import { ClipboardCheck, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Página principal de inspecciones
 * Lista todas las inspecciones realizadas
 */
export default function InspeccionesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            Inspecciones Vehiculares
          </h1>
          <p className="text-gray-600 mt-2">
            Gestión de inspecciones técnicas de vehículos
          </p>
        </div>
        
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-5 w-5 mr-2" />
          Nueva Inspección
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white mb-8">
        <h2 className="text-2xl font-bold mb-4">🚧 Módulo en Construcción</h2>
        <p className="text-blue-100 mb-6">
          El sistema de inspecciones está siendo migrado desde PHP a Next.js.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm text-blue-100 mb-1">Funcionalidades</p>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-blue-200">Checklist, Firmas, Fotos</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm text-blue-100 mb-1">Tablas BD</p>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-blue-200">inspecciones, detalles, fotos</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm text-blue-100 mb-1">Estado</p>
            <p className="text-2xl font-bold">⏳</p>
            <p className="text-xs text-blue-200">En desarrollo</p>
          </div>
        </div>
      </div>

      {/* Funcionalidades Planificadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900">
            ✅ Checklist de Items
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">●</span>
              Estado: Bien / Regular / Mal
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">●</span>
              Foto por cada ítem
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">●</span>
              Observaciones
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">●</span>
              Geolocalización GPS
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900">
            📷 Fotos del Vehículo
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-blue-500">●</span>
              Frente y contrafrente
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">●</span>
              Laterales izquierdo/derecho
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">●</span>
              Fotos adicionales
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">●</span>
              Coordenadas por foto
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900">
            ✍️ Firmas Digitales
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-purple-500">●</span>
              Firma del inspector (obligatoria)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">●</span>
              Firma del contribuyente (opcional)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">●</span>
              Canvas HTML5 para firmar
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900">
            🤖 Automatizaciones
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-yellow-500">●</span>
              Veredicto automático (Aprobado/Rechazado)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-500">●</span>
              Generación de PDF
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-500">●</span>
              Envío de email al contribuyente
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-500">●</span>
              Actualización de turno
            </li>
          </ul>
        </div>
      </div>

      {/* Botón Temporal de Acceso */}
      <div className="mt-8 text-center">
        <Link href="/habilitaciones" className="text-blue-600 hover:underline">
          ← Volver a Habilitaciones
        </Link>
      </div>
    </div>
  )
}
