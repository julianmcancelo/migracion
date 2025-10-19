import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CredencialNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 text-center border-2 border-red-200">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-100 mb-6 animate-pulse">
          <AlertTriangle className="h-16 w-16 text-red-600" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3">
          Acceso Denegado
        </h1>

        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          El enlace de acceso no es válido, ha expirado o ha sido revocado.
        </p>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="font-semibold text-sm text-gray-700">Si considera que esto es un error, contáctenos:</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Teléfono:</span>
              <span className="font-mono text-gray-900 bg-gray-200 px-2 py-0.5 rounded">4357-5100 (Int. 7137)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Correo:</span>
              <span className="font-mono text-gray-900 bg-gray-200 px-2 py-0.5 rounded text-xs">transportepublicolanus@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-sm text-gray-500">
            <strong>Dirección Gral. de Movilidad y Transporte</strong><br/>
            Subsecretaría de Ordenamiento Urbano<br/>
            Municipalidad de Lanús
          </p>
        </div>
      </div>
    </div>
  )
}
