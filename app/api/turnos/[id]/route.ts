import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/turnos/[id] - Obtener turno por ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const turno = await prisma.turnos.findUnique({
      where: { id: Number(id) }
    })

    if (!turno) {
      return NextResponse.json(
        { success: false, error: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    // Obtener info de habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: turno.habilitacion_id },
      select: {
        id: true,
        nro_licencia: true,
        tipo: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...turno,
        habilitacion
      }
    })

  } catch (error) {
    console.error('Error al obtener turno:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener turno' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/turnos/[id] - Actualizar turno
 * Body: { estado?: string, observaciones?: string }
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { estado, observaciones } = body

    // Verificar que el turno existe
    const turnoExistente = await prisma.turnos.findUnique({
      where: { id: Number(id) }
    })

    if (!turnoExistente) {
      return NextResponse.json(
        { success: false, error: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar turno
    const turno = await prisma.turnos.update({
      where: { id: Number(id) },
      data: {
        ...(estado && { estado }),
        ...(observaciones !== undefined && { observaciones })
      }
    })

    return NextResponse.json({
      success: true,
      data: turno
    })

  } catch (error) {
    console.error('Error al actualizar turno:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar turno' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/turnos/[id] - Cancelar/eliminar turno
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar que el turno existe
    const turnoExistente = await prisma.turnos.findUnique({
      where: { id: Number(id) }
    })

    if (!turnoExistente) {
      return NextResponse.json(
        { success: false, error: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    // Marcar como cancelado en lugar de eliminar
    const turno = await prisma.turnos.update({
      where: { id: Number(id) },
      data: { estado: 'CANCELADO' }
    })

    return NextResponse.json({
      success: true,
      data: turno
    })

  } catch (error) {
    console.error('Error al cancelar turno:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cancelar turno' },
      { status: 500 }
    )
  }
}
