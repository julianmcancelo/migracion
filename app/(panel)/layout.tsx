import { PanelLayoutClient } from './layout-client'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel de Gestión | Municipio de Lanús',
  description: 'Sistema de gestión de habilitaciones de transporte',
}

/**
 * Layout del panel administrativo
 * - Requiere autenticación
 * - Sidebar colapsable + Header
 * - Rutas protegidas
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Verificar autenticación
  const session = await getSession()

  if (!session) {
    redirect('/login?error=acceso_denegado')
  }

  return <PanelLayoutClient user={session}>{children}</PanelLayoutClient>
}
