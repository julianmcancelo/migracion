import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/verificaciones
 * Obtiene todas las verificaciones del historial
 */
export async function GET() {
  try {
    const verificaciones = await prisma.verificaciones_historial.findMany({
      orderBy: {
        fecha: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: verificaciones,
    })
  } catch (error) {
    console.error('Error al obtener verificaciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener verificaciones' },
      { status: 500 }
    )
  }
}
