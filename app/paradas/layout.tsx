import type { Metadata } from 'next'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Mapa de Paradas - Municipio de Lanús',
  description: 'Sistema de gestión de paradas y puntos de interés del Municipio de Lanús',
  openGraph: {
    title: 'Mapa de Paradas - Municipio de Lanús',
    description: 'Sistema de gestión de paradas y puntos de interés',
    type: 'website',
  },
}

export default function ParadasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  )
}
