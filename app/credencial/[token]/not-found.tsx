import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CredencialNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-red-200 bg-white p-8 text-center shadow-2xl">
        <div className="mb-6 inline-flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-16 w-16 text-red-600" />
        </div>

        <h1 className="mb-3 text-3xl font-black text-gray-900">Acceso Denegado</h1>

        <p className="mb-8 text-lg leading-relaxed text-gray-600">
          El enlace de acceso no es válido, ha expirado o ha sido revocado.
        </p>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
          <div className="mb-3 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-semibold text-gray-700">
              Si considera que esto es un error, contáctenos:
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-600">Teléfono:</span>
              <span className="rounded bg-gray-200 px-2 py-0.5 font-mono text-gray-900">
                4357-5100 (Int. 7137)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-600">Correo:</span>
              <span className="rounded bg-gray-200 px-2 py-0.5 font-mono text-xs text-gray-900">
                transportepublicolanus@gmail.com
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-sm text-gray-500">
            <strong>Dirección Gral. de Movilidad y Transporte</strong>
            <br />
            Subsecretaría de Ordenamiento Urbano
            <br />
            Municipalidad de Lanús
          </p>
        </div>
      </div>
    </div>
  )
}
