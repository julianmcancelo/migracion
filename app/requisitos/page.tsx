'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'

/**
 * Página de Requisitos - Optimizada para escaneo de QR
 * Permite ingresar email manualmente o detectar cuenta de Google
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

  const handleGoogleSignIn = () => {
    // Verificar si Google Client ID está configurado
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setError('Google Sign-In no está configurado. Por favor, ingresa tu email manualmente.')
      return
    }

    // Detectar cuenta de Google usando Google One Tap
    if (typeof window !== 'undefined' && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            // Decodificar el JWT para obtener el email
            const payload = JSON.parse(atob(response.credential.split('.')[1]))
            const googleEmail = payload.email
            
            setEmail(googleEmail)
            setLoading(true)
            
            // Enviar automáticamente
            const res = await fetch('/api/requisitos/enviar', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: googleEmail,
              }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
              setSuccess(true)
            } else {
              setError(data.error || 'Error al enviar el email.')
            }
          } catch (error) {
            console.error('Error con Google Sign-In:', error)
            setError('Error al procesar la cuenta de Google.')
          } finally {
            setLoading(false)
          }
        },
      });

      (window as any).google.accounts.id.prompt()
    } else {
      // Fallback: usar método manual
      setError('Google Sign-In aún no está listo. Por favor, espera un momento o ingresa tu email manualmente.')
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-500">o</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full border-2"
                disabled={loading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Usar cuenta de Google
              </Button>

              <p className="text-xs text-slate-500 text-center mt-6">
                Al continuar, aceptás recibir información sobre trámites y servicios municipales.
              </p>
            </>
          )}
        </Card>

        <p className="text-center text-sm text-slate-600 mt-6">
          © 2025 Municipio de Lanús
        </p>
      </div>

      {/* Script de Google Identity Services */}
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
      />
    </div>
  )
}
