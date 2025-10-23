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
