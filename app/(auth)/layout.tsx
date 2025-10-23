import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión - Sistema de Gestión | Municipio de Lanús',
  description:
    'Panel de administración para el sistema de gestión de habilitaciones de transporte del Municipio de Lanús.',
}

/**
 * Layout para rutas de autenticación
 * - Sin header ni sidebar
 * - Diseño centrado y limpio
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
