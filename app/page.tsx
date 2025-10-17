import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background decorativo con círculos animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl" style={{animation: 'float 4s ease-in-out infinite'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl" style={{animation: 'float 5s ease-in-out infinite'}}></div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Logo y título con efecto flotante */}
        <div className="animate-fade-in-up mb-16">
          <div className="inline-block float mb-6">
            <div className="glass-strong rounded-3xl p-4 shadow-2xl">
              <img 
                src="https://www.lanus.gob.ar/logo-200.png" 
                alt="Logo Lanús" 
                className="h-24 w-auto"
              />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
            Gestión de Transporte
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            El portal de acceso para la administración y consulta de habilitaciones del Municipio de Lanús.
          </p>
        </div>

        {/* Cards mejoradas con glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* Card Acceso Administrativo */}
          <Link 
            href="/login"
            className="group animate-fade-in-up glass-strong rounded-3xl shadow-2xl p-10 text-left transform transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(14,165,233,0.3)] border-2 border-white/50 relative overflow-hidden block"
            style={{animationDelay: '0.1s'}}
          >
            {/* Efecto shimmer en hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="shimmer absolute inset-0"></div>
            </div>
            
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-slate-600 to-slate-800 text-white w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-800 mb-3 group-hover:text-sky-600 transition-colors duration-300">
                Acceso Administrativo
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-6">
                Ingresá al panel para gestionar habilitaciones, usuarios y credenciales del sistema.
              </p>
              
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-600 group-hover:text-sky-700 flex items-center gap-2 text-lg">
                  Iniciar Sesión
                  <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Card Contribuyente */}
          <div 
            className="group animate-fade-in-up glass rounded-3xl shadow-xl p-10 text-left relative overflow-hidden border-2 border-white/30"
            style={{animationDelay: '0.2s'}}
          >
            {/* Badge de "Próximamente" */}
            <div className="absolute top-6 right-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
              Próximamente
            </div>
            
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg opacity-60">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-700 mb-3">
              Soy Contribuyente
            </h2>
            <p className="text-slate-500 text-base leading-relaxed mb-6">
              Consultá el estado de tu credencial digital o accedé a ella directamente.
            </p>
            
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Estará disponible pronto</span>
            </div>
          </div>
        </div>

        {/* Footer con badge tecnológico */}
        <div className="mt-16 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="glass inline-block rounded-2xl px-8 py-4 shadow-lg">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-semibold text-slate-700">Powered by</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-black text-white px-2 py-1 rounded font-mono font-bold">Next.js</span>
                <span className="text-slate-400">+</span>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-2 py-1 rounded font-mono font-bold">TypeScript</span>
                <span className="text-slate-400">+</span>
                <span className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-2 py-1 rounded font-mono font-bold">Prisma</span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">Demo de migración - Municipio de Lanús © 2025</p>
        </div>
      </div>
    </div>
  )
}
