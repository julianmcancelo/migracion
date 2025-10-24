'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

/**
 * Página de Requisitos - Optimizada para escaneo de QR
 * Formulario simple para recibir requisitos por email
 */
export default function RequisitosPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    
    if (!email.trim()) {
      setError('Por favor, ingresa tu email.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('El formato del email no es válido.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/requisitos/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setEmail('')
      } else {
        setError(data.error || 'Error al enviar el email.')
      }
    } catch (err) {
      console.error('Error al enviar requisitos:', err)
      setError('Ocurrió un error. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="w-full max-w-md">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al inicio
        </Link>

        <Card className="bg-white shadow-xl p-8">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="bg-blue-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Requisitos para Habilitaciones
            </h1>
            <p className="text-sm text-slate-600">
              Ingresá tu email y recibí el listado completo
            </p>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                ¡Enviado con éxito!
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                Revisá tu casilla de email. Te enviamos el listado completo de requisitos.
              </p>
              <Button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                variant="outline"
                className="w-full"
              >
                Enviar a otro email
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Correo Electrónico
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu-correo@ejemplo.com"
                    className="mt-1"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Requisitos
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-slate-500 text-center mt-6">
                Al continuar, aceptás recibir información sobre requisitos y trámites municipales.
              </p>
            </>
          )}
        </Card>

        <p className="text-center text-sm text-slate-600 mt-6">
          © 2025 Municipio de Lanús
        </p>
      </div>
    </div>
  )
}
