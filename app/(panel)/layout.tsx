import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

export const metadata: Metadata = {
  title: 'Panel de Gestión | Municipio de Lanús',
  description: 'Sistema de gestión de habilitaciones de transporte',
}

/**
 * Layout del panel administrativo
 * - Requiere autenticación
 * - Sidebar + Header
 * - Rutas protegidas
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar autenticación
  const session = await getSession()
  
  if (!session) {
    redirect('/login?error=acceso_denegado')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
