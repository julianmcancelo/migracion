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
  
  // Comprimir respuestas
  compress: true,
  
  // Security & PWA Headers
  headers: async () => [
    // Security Headers para todas las rutas
    {
      source: '/:path*',
      headers: [
        // Prevenir clickjacking
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        // Prevenir MIME sniffing
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        // Protección XSS
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        // Referrer Policy
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        // Permissions Policy
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(self)',
        },
        // HSTS (solo en producción)
        ...(process.env.NODE_ENV === 'production'
          ? [
              {
                key: 'Strict-Transport-Security',
                value: 'max-age=31536000; includeSubDomains; preload',
              },
            ]
          : []),
      ],
    },
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
  
  // TypeScript - IMPORTANTE: Corregir errores antes de producción
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development', // Solo ignorar en desarrollo
  },
  
  // ESLint
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
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
