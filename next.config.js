/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimización de imágenes
  images: {
    domains: ['www.lanus.gob.ar'],
    formats: ['image/avif', 'image/webp'], // Formatos modernos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Configuración experimental
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js'],
    // Optimizar imports de paquetes grandes
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Solo usar 'standalone' para Docker/Render
  // Comentar para Vercel (no es necesario)
  // output: 'standalone',

  // Configuración de producción
  poweredByHeader: false, // Ocultar header X-Powered-By
  
  // PWA Configuration
  headers: async () => [
    {
      source: '/sw-admin.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
    {
      source: '/sw-inspector.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
    {
      source: '/manifest-admin.json',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/manifest+json',
        },
      ],
    },
    {
      source: '/manifest-inspector.json',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/manifest+json',
        },
      ],
    },
  ],
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: true, // Permitir build con warnings de TypeScript
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Optimizaciones adicionales
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
