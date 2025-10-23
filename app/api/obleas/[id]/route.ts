import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/obleas/[id]
 * Obtiene una oblea específica
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const obleaId = parseInt(params.id)

    const oblea = await prisma.oblea_historial.findUnique({
      where: { id: obleaId },
      include: {
        habilitaciones_generales: {
          include: {
            habilitaciones_personas: {
              where: { rol: 'TITULAR' },
              include: {
                persona: true,
              },
              take: 1,
            },
            habilitaciones_vehiculos: {
              include: {
                vehiculo: true,
              },
              take: 1,
            },
          },
        },
      },
    })

    if (!oblea) {
      return NextResponse.json({ success: false, error: 'Oblea no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: oblea,
    })
  } catch (error: any) {
    console.error('Error al obtener oblea:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener oblea',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/obleas/[id]
 * Actualiza una oblea
 */
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const obleaId = parseInt(params.id)
    const body = await request.json()
    const { notificado, observaciones } = body

    const oblea = await prisma.oblea_historial.findUnique({
      where: { id: obleaId },
    })

    if (!oblea) {
      return NextResponse.json({ success: false, error: 'Oblea no encontrada' }, { status: 404 })
    }

    // Actualizar oblea
    const obleaActualizada = await prisma.oblea_historial.update({
      where: { id: obleaId },
      data: {
        notificado: notificado || oblea.notificado,
      },
    })

    return NextResponse.json({
      success: true,
      data: obleaActualizada,
      message: 'Oblea actualizada exitosamente',
    })
  } catch (error: any) {
    console.error('Error al actualizar oblea:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar oblea',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/obleas/[id]
 * Elimina una oblea
 */
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const obleaId = parseInt(params.id)

    const oblea = await prisma.oblea_historial.findUnique({
      where: { id: obleaId },
    })

    if (!oblea) {
      return NextResponse.json({ success: false, error: 'Oblea no encontrada' }, { status: 404 })
    }

    // Eliminar oblea
    await prisma.oblea_historial.delete({
      where: { id: obleaId },
    })

    return NextResponse.json({
      success: true,
      message: 'Oblea eliminada exitosamente',
    })
  } catch (error: any) {
    console.error('Error al eliminar oblea:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar oblea',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
