import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dashboard | Panel de Gestión',
}

/**
 * Obtener estadísticas del servidor
 */
async function getStats() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/habilitaciones/stats`, {
      cache: 'no-store',
    })
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return null
  }
}

/**
 * Página principal del dashboard
 * - KPIs de habilitaciones
 * - Gráfico de distribución
 * - Acciones rápidas
 */
export default async function DashboardPage() {
  const stats = await getStats()
  const kpis = stats?.kpis || { activas: 0, en_tramite: 0, por_vencer: 0, obleas_pendientes: 0 }

  return (
    <div className="space-y-8">
      {/* Header de la página */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Vista general del sistema de habilitaciones
        </p>
      </div>

      {/* KPIs - Cards de estadísticas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Habilitaciones Activas */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-green-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Habilitadas</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{kpis.activas}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: En Trámite */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-amber-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">En Trámite</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">24</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Por Vencer */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-orange-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Por Vencer (30 días)</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">8</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Obleas Pendientes */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-sky-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Obleas Pendientes</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">12</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="rounded-lg bg-white shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button className="flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-sky-500 hover:bg-sky-50 transition-colors">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Nueva Habilitación</span>
          </button>
          
          <button className="flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-sky-500 hover:bg-sky-50 transition-colors">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Nueva Inspección</span>
          </button>
          
          <button className="flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-sky-500 hover:bg-sky-50 transition-colors">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Asignar Turno</span>
          </button>
        </div>
      </div>

      {/* Placeholder para gráfico */}
      <div className="rounded-lg bg-white shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Distribución de Habilitaciones</h2>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Gráfico de distribución (próximamente con Recharts)</p>
        </div>
      </div>
    </div>
  )
}
