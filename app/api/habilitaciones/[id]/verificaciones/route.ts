import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/[id]/verificaciones
 * Obtiene el historial de verificaciones de una habilitación
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Obtener número de licencia de la habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: Number(id) },
      select: { nro_licencia: true }
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    const verificaciones = await prisma.verificaciones_historial.findMany({
      where: {
        nro_licencia: habilitacion.nro_licencia || ''
      },
      orderBy: {
        fecha: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: verificaciones
    })
  } catch (error) {
    console.error('Error al obtener verificaciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener verificaciones' },
      { status: 500 }
    )
  }
}
