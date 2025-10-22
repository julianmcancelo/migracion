/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.lanus.gob.ar'],
  },
  // Configuración para Render
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js'],
  },
  // Asegurar que funcione en producción
  output: 'standalone',
}

module.exports = nextConfig
