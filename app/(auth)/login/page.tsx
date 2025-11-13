'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Obtener mensajes de la URL
  const urlError = searchParams.get('error')
  const urlSuccess = searchParams.get('exito')

  // Configurar mensajes iniciales
  useState(() => {
    if (urlError === 'acceso_denegado') {
      setError('Debes iniciar sesión para acceder al panel.')
    }
    if (urlSuccess === 'logout') {
      setSuccessMessage('Has cerrado sesión exitosamente.')
    }
  })

  // Saludo dinámico
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Esperar un momento para que la cookie se establezca
        await new Promise(resolve => setTimeout(resolve, 100))
        // Forzar recarga completa del navegador
        window.location.replace('/dashboard')
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Background decorativo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="float absolute right-20 top-10 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/30 to-blue-500/30 blur-3xl"></div>
        <div
          className="absolute bottom-10 left-20 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-500/20 blur-3xl"
          style={{ animation: 'float 4s ease-in-out infinite' }}
        ></div>
      </div>

      <div className="glass-strong relative z-10 flex w-full max-w-6xl animate-fade-in overflow-hidden rounded-3xl border-2 border-white/50 shadow-[0_20px_80px_rgba(0,0,0,0.15)]">
        {/* Panel izquierdo con imagen */}
        <div className="relative hidden md:block md:w-1/2">
          <img
            src="https://www.lanus.gob.ar/storage/fichas/multimedia/dji-0046-0dcHp.JPG"
            alt="Imagen del Municipio de Lanús"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-gray-900/80 to-transparent p-12 text-white">
            <div className="animate-fade-in-down">
              <h1 className="text-shadow mb-4 text-5xl font-bold leading-tight">
                Sistema de Gestión Interna
              </h1>
              <p className="text-shadow-sm text-xl opacity-90">
                Panel de administración para el Municipio de Lanús.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="https://www.lanus.gob.ar/logo-200.png"
                alt="Logo Municipio de Lanús"
                className="h-16 w-auto opacity-75"
              />
            </div>
          </div>
        </div>

        {/* Panel derecho con formulario */}
        <div className="flex w-full flex-col justify-center p-8 sm:p-12 md:w-1/2">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 animate-fade-in-up">
              <img
                src="https://www.lanus.gob.ar/logo-200.png"
                alt="Logo Municipio de Lanús"
                className="mx-auto h-14 md:mx-0"
              />
              <h2 className="mt-6 text-left text-4xl font-bold text-gray-800">{getGreeting()}</h2>
              <p className="mt-2 text-left text-base text-gray-500">
                Ingresa tus credenciales para acceder.
              </p>
            </div>

            {/* Mensajes de error y éxito */}
            <div className="mb-6 space-y-4">
              {error && (
                <div className="flex items-start rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-800 shadow-md">
                  <svg
                    className="mr-3 h-6 w-6 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold">Error de acceso</p>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start rounded-lg border-l-4 border-green-500 bg-green-50 p-4 text-green-800 shadow-md">
                  <svg
                    className="mr-3 h-6 w-6 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold">Operación exitosa</p>
                    <span className="text-sm">{successMessage}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="correo" className="mb-2 block text-sm font-bold text-gray-700">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    id="correo"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 py-3.5 pl-11 pr-4 transition-all duration-300 hover:border-gray-300 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="tu-correo@lanus.gob.ar"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="clave" className="mb-2 block text-sm font-bold text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="clave"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 py-3.5 pl-11 pr-10 transition-all duration-300 hover:border-gray-300 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 transition-colors hover:text-gray-800"
                  >
                    {!showPassword ? (
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full transform items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-3.5 text-base font-bold text-white transition-all duration-300 ease-in-out hover:scale-[1.02] hover:from-sky-700 hover:to-blue-700 hover:shadow-[0_10px_30px_rgba(14,165,233,0.4)] disabled:transform-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verificando...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Ingresar al Panel
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-12 text-center text-xs text-gray-400">
              <p>
                &copy; {new Date().getFullYear()} Municipio de Lanús. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
