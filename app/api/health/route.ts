import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/db-config'

// Marcar como ruta dinámica para Vercel
export const dynamic = 'force-dynamic'

/**
 * Endpoint de health check
 * Útil para verificar que la aplicación y la base de datos están funcionando
 *
 * GET /api/health
 */
export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const dbStatus = await testDatabaseConnection()

    // Información del sistema
    const systemInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
    }

    if (dbStatus.success) {
      return NextResponse.json(
        {
          status: 'healthy',
          database: {
            status: 'connected',
            message: dbStatus.message,
          },
          system: systemInfo,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: {
            status: 'disconnected',
            message: dbStatus.message,
            error: dbStatus.error,
          },
          system: systemInfo,
        },
        { status: 503 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error al verificar el estado del sistema',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
