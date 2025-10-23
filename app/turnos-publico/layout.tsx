import { ReactNode } from 'react'

/**
 * Layout aislado para páginas públicas de gestión de turnos
 * Sin navbar, sin sidebar, sin acceso al sistema
 */
export default function TurnosPublicoLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">{children}</div>
}

// Metadata para SEO
export const metadata = {
  title: 'Gestión de Turno - Municipalidad de Lanús',
  description: 'Confirmar, reprogramar o cancelar su turno de inspección vehicular',
  robots: 'noindex, nofollow', // No indexar estas páginas en Google
}
