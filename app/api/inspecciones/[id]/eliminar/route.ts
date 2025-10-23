import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/inspecciones/[id]/eliminar
 * Elimina una inspección y todos sus registros relacionados
 */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const inspeccionId = parseInt(params.id)

    // Verificar que la inspección existe
    const inspeccion = await prisma.inspecciones.findUnique({
      where: { id: inspeccionId },
    })

    if (!inspeccion) {
      return NextResponse.json(
        { success: false, error: 'Inspección no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la inspección (las relaciones se eliminan en cascada según el schema)
    await prisma.inspecciones.delete({
      where: { id: inspeccionId },
    })

    return NextResponse.json({
      success: true,
      message: 'Inspección eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error al eliminar inspección:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar inspección' },
      { status: 500 }
    )
  }
}
