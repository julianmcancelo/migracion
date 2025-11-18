import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sistema de Gestión de Transporte - Lanús',
  description:
    'Portal de acceso para la administración y consulta de habilitaciones del Municipio de Lanús',
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/manifest.json',
  themeColor: '#0093D2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Inspecciones Lanús',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
