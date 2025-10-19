import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/[id]/obleas
 * Obtiene el historial de obleas de una habilitación
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const obleas = await prisma.oblea_historial.findMany({
      where: {
        habilitacion_id: Number(id)
      },
      orderBy: {
        fecha_solicitud: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: obleas
    })
  } catch (error) {
    console.error('Error al obtener obleas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener obleas' },
      { status: 500 }
    )
  }
}
