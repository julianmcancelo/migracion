import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/verificaciones/[id]/eliminar
 * Elimina una verificación del historial
 * Solo permitido para el usuario jmcancelo@lanus.gob.ar
 */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Verificar sesión
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Solo permitir eliminación al usuario específico
    if (session.email !== 'jmcancelo@lanus.gob.ar') {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para eliminar verificaciones' },
        { status: 403 }
      )
    }

    const params = await context.params
    const verificacionId = parseInt(params.id)

    // Verificar que la verificación existe
    const verificacion = await prisma.verificaciones_historial.findUnique({
      where: { id: verificacionId },
    })

    if (!verificacion) {
      return NextResponse.json(
        { success: false, error: 'Verificación no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la verificación
    await prisma.verificaciones_historial.delete({
      where: { id: verificacionId },
    })

    return NextResponse.json({
      success: true,
      message: 'Verificación eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error al eliminar verificación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar verificación' },
      { status: 500 }
    )
  }
}
