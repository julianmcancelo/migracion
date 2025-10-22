import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/obleas/evidencias
 * Obtiene obleas con evidencia física (tabla obleas - sistema viejo)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const habilitacionId = searchParams.get('habilitacion_id')

    const whereConditions: any = {}

    if (habilitacionId) {
      whereConditions.habilitacion_id = parseInt(habilitacionId)
    }

    // Obtener obleas con evidencia física
    const obleasConEvidencia = await prisma.obleas.findMany({
      where: whereConditions,
      orderBy: {
        fecha_colocacion: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: obleasConEvidencia,
      count: obleasConEvidencia.length
    })

  } catch (error: any) {
    console.error('Error al obtener obleas con evidencia:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener obleas con evidencia',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
