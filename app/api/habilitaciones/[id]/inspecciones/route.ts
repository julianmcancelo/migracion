import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/[id]/inspecciones
 * Obtiene el historial de inspecciones de una habilitación
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const inspecciones = await prisma.inspecciones.findMany({
      where: {
        habilitacion_id: Number(id)
      },
      orderBy: {
        fecha_inspeccion: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: inspecciones
    })
  } catch (error) {
    console.error('Error al obtener inspecciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener inspecciones' },
      { status: 500 }
    )
  }
}
