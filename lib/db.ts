import { PrismaClient } from '@prisma/client'

// Singleton para evitar múltiples instancias de PrismaClient en desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Configuración optimizada para Vercel Serverless
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Exportar también como default para compatibilidad
export default prisma
