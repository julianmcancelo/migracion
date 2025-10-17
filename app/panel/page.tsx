'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  nombre: string
  email: string
  rol: string
  legajo?: string
}

export default function PanelPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener datos de la sesión
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login?exito=logout')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-3xl float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl" style={{animation: 'float 4s ease-in-out infinite'}}></div>
        </div>
        <div className="text-center relative z-10 glass-strong rounded-3xl p-12 shadow-2xl">
          <svg className="animate-spin h-16 w-16 text-sky-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-semibold text-gray-700">Cargando panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Header mejorado */}
      <header className="glass-strong border-b border-white/30 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="glass rounded-2xl p-2 shadow-lg">
              <img 
                src="https://www.lanus.gob.ar/logo-200.png" 
                alt="Logo Lanús" 
                className="h-12 w-auto"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">Panel de Gestión</h1>
              <p className="text-sm text-slate-600">Municipio de Lanús</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Card de bienvenida mejorada */}
        <div className="relative glass-strong rounded-3xl shadow-2xl p-10 mb-10 overflow-hidden border-2 border-white/50 animate-fade-in-up group">
          {/* Gradiente de fondo */}
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/90 to-blue-600/90 rounded-3xl"></div>
          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="relative z-10 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
                  ¡Bienvenido, {user?.nombre}! 
                  <span className="text-5xl animate-bounce">👋</span>
                </h2>
                <p className="text-sky-100 text-lg">
                  Has iniciado sesión exitosamente en el sistema de gestión.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="glass rounded-2xl p-4 backdrop-blur-sm">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del usuario mejorada */}
        <div className="glass-strong rounded-3xl shadow-2xl p-8 mb-10 animate-fade-in-up border-2 border-white/50" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información de Sesión
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl border-l-4 border-sky-500 p-5 hover:scale-105 transition-transform duration-300">
              <p className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Nombre Completo
              </p>
              <p className="text-lg text-gray-800 font-semibold">{user?.nombre}</p>
            </div>
            <div className="glass rounded-2xl border-l-4 border-blue-500 p-5 hover:scale-105 transition-transform duration-300">
              <p className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Correo Electrónico
              </p>
              <p className="text-lg text-gray-800 font-semibold">{user?.email}</p>
            </div>
            <div className="glass rounded-2xl border-l-4 border-indigo-500 p-5 hover:scale-105 transition-transform duration-300">
              <p className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Rol
              </p>
              <p className="text-lg text-gray-800 font-semibold capitalize">{user?.rol}</p>
            </div>
            {user?.legajo && (
              <div className="glass rounded-2xl border-l-4 border-purple-500 p-5 hover:scale-105 transition-transform duration-300">
                <p className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                  Legajo
                </p>
                <p className="text-lg text-gray-800 font-semibold">{user.legajo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cards de funcionalidades mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group glass-strong rounded-2xl shadow-xl p-7 hover:shadow-2xl transition-all duration-300 animate-fade-in-up hover:scale-105 border-2 border-white/40 relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/10 to-blue-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-sky-600 transition-colors">Gestión de Usuarios</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">Administra usuarios y permisos del sistema</p>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Próximamente</span>
              </div>
            </div>
          </div>

          <div className="group glass-strong rounded-2xl shadow-xl p-7 hover:shadow-2xl transition-all duration-300 animate-fade-in-up hover:scale-105 border-2 border-white/40 relative overflow-hidden" style={{ animationDelay: '0.3s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-green-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">Habilitaciones</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">Consulta y gestiona habilitaciones de transporte</p>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Próximamente</span>
              </div>
            </div>
          </div>

          <div className="group glass-strong rounded-2xl shadow-xl p-7 hover:shadow-2xl transition-all duration-300 animate-fade-in-up hover:scale-105 border-2 border-white/40 relative overflow-hidden" style={{ animationDelay: '0.4s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-violet-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">Estadísticas</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">Visualiza reportes y métricas del sistema</p>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Próximamente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info sobre la demo mejorada */}
        <div className="mt-10 glass-strong rounded-3xl p-8 animate-fade-in-up border-2 border-white/50 shadow-xl" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                Prueba de Migración a Next.js
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">DEMO</span>
              </h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                Esta es una demostración de cómo se vería el sistema migrado a <strong>Next.js con TypeScript</strong>.
                El login está <span className="text-green-600 font-semibold">completamente funcional</span> y conectado a tu base de datos MySQL existente.
                Las demás funcionalidades se pueden migrar siguiendo el mismo patrón.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-black text-white text-xs px-3 py-1.5 rounded-lg font-mono">Next.js 14</span>
                <span className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-mono">TypeScript</span>
                <span className="bg-teal-600 text-white text-xs px-3 py-1.5 rounded-lg font-mono">Prisma ORM</span>
                <span className="bg-cyan-600 text-white text-xs px-3 py-1.5 rounded-lg font-mono">Tailwind CSS</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
