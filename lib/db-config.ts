/**
 * Configuración de base de datos optimizada para Vercel
 *
 * Vercel Serverless Functions tienen algunas limitaciones:
 * - Timeout de 10s (hobby) o 60s (pro)
 * - No mantiene conexiones persistentes
 * - Necesita connection pooling eficiente
 */

import { PrismaClient } from '@prisma/client'

// Configuración de Prisma optimizada para Vercel
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

/**
 * Función helper para cerrar conexiones en edge cases
 * Útil para testing y serverless cleanup
 */
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

/**
 * Health check de la base de datos
 * Útil para verificar conectividad antes de hacer queries críticas
 */
export async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { success: true, message: 'Conexión exitosa a MySQL' }
  } catch (error) {
    console.error('Error conectando a la base de datos:', error)
    return {
      success: false,
      message: 'Error de conexión a MySQL',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
