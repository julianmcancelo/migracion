import type { Metadata } from 'next'
import Script from 'next/script'
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
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID
  const isProd = process.env.NODE_ENV === 'production'

  return (
    <html lang="es">
      <body className="antialiased">
        {isProd && clarityId && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        )}
        {children}
      </body>
    </html>
  )
}
