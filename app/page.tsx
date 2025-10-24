'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Key, X, Loader2 } from 'lucide-react'

/**
 * Landing Page - Municipio de Lanús
 * Replica del diseño del PHP original (index.php)
 */
export default function Home() {
  const [isFinderOpen, setIsFinderOpen] = useState(false)
  const [dni, setDni] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFindCredential = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!dni.trim() || !email.trim()) {
      setError('Por favor, completa ambos campos.')
      return
    }

    setLoading(true)

    try {
      // TODO: Implementar la búsqueda real cuando exista el endpoint API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simular que no se encontró (hasta que exista el API)
      setError('No se encontró una credencial activa con la combinación de DNI y email proporcionada.')
    } catch (err) {
      setError('Ocurrió un error. Por favor, intente más tarde.')
    } finally {
      setLoading(false)
    }
  }

  const openFinder = () => {
    setIsFinderOpen(true)
    setError('')
    setDni('')
    setEmail('')
  }

  return (
    <div 
      className="min-h-screen" 
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="w-full max-w-5xl mx-auto text-center px-4 py-12 md:py-20">
        
        {/* Header con logo y título */}
        <div className="animate-fade-in-up">
          <img 
            src="https://www.lanus.gob.ar/logo-200.png" 
            alt="Logo Lanús" 
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">
            Gestión de Transporte
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            El portal de acceso para la administración y consulta de habilitaciones del Municipio de Lanús.
          </p>
        </div>

        {/* Dos tarjetas principales */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Tarjeta 1: Acceso Administrativo */}
          <Card className="animate-fade-in-up animation-delay-200 bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-left transform transition-transform duration-300 hover:-translate-y-2">
            <div className="bg-slate-100 text-slate-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Key className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Acceso Administrativo</h2>
            <p className="text-slate-500 mt-2 mb-6">
              Ingresá al panel para gestionar habilitaciones, usuarios y credenciales del sistema.
            </p>
            <Link href="/login" className="font-semibold text-slate-700 hover:text-sky-600 group transition-colors duration-300">
              Iniciar Sesión
              <span className="inline-block transform group-hover:translate-x-1 transition-transform ml-1">→</span>
            </Link>
          </Card>

          {/* Tarjeta 2: Soy Contribuyente */}
          <Card className="animate-fade-in-up animation-delay-400 bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-left transform transition-transform duration-300 hover:-translate-y-2">
            <div className="bg-sky-100 text-sky-700 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <CreditCard className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Soy Contribuyente</h2>
            <p className="text-slate-500 mt-2 mb-6">
              Consultá el estado de tu credencial digital o accedé a ella directamente.
            </p>
            <button 
              onClick={openFinder}
              className="font-semibold text-sky-600 hover:text-sky-800 group transition-colors duration-300"
            >
              Buscar mi Credencial
              <span className="inline-block transform group-hover:translate-x-1 transition-transform ml-1">→</span>
            </button>
          </Card>
        </div>

        {/* Modal de búsqueda de credencial */}
        {isFinderOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsFinderOpen(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Buscar mi Credencial</h3>
                  <p className="text-sm text-gray-500">
                    Ingresa tu DNI y Correo Electrónico para encontrar tu credencial digital activa.
                  </p>
                </div>
                <button
                  onClick={() => setIsFinderOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFindCredential} className="space-y-4 mt-6">
                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="lookup_dni" className="block text-sm font-medium text-slate-600 mb-1 text-left">
                    DNI (sin puntos)
                  </Label>
                  <Input
                    type="text"
                    id="lookup_dni"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                    placeholder="Tu número de DNI"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="lookup_email" className="block text-sm font-medium text-slate-600 mb-1 text-left">
                    Correo Electrónico
                  </Label>
                  <Input
                    type="email"
                    id="lookup_email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu-correo@ejemplo.com"
                    className="w-full"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsFinderOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-sky-600 hover:bg-sky-700 min-w-[120px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      'Buscar'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
