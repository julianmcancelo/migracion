import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/turnos/[id] - Obtener turno por ID
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    // Usar raw SQL para evitar problemas con fechas inválidas
    const turnos: any[] = await prisma.$queryRaw`
      SELECT 
        t.id,
        t.habilitacion_id,
        t.fecha,
        t.hora,
        t.estado,
        t.observaciones,
        t.recordatorio_enviado,
        t.creado_en
      FROM turnos AS t
      WHERE t.id = ${Number(id)}
        AND t.fecha > '1970-01-01'
      LIMIT 1
    `

    if (!turnos || turnos.length === 0) {
      return NextResponse.json({ success: false, error: 'Turno no encontrado' }, { status: 404 })
    }

    const turno = turnos[0]

    // Obtener info de habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: turno.habilitacion_id },
      select: {
        id: true,
        nro_licencia: true,
        tipo_transporte: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...turno,
        habilitacion,
      },
    })
  } catch (error) {
    console.error('Error al obtener turno:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener turno' }, { status: 500 })
  }
}

/**
 * PATCH /api/turnos/[id] - Actualizar turno
 * Body: { estado?: string, observaciones?: string }
 */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { estado, observaciones } = body

    console.log('Actualizando turno:', id, 'con estado:', estado)

    // Verificar que el turno existe usando raw SQL
    const turnosExistentes: any[] = await prisma.$queryRaw`
      SELECT id FROM turnos 
      WHERE id = ${Number(id)} 
        AND fecha > '1970-01-01'
      LIMIT 1
    `

    if (!turnosExistentes || turnosExistentes.length === 0) {
      return NextResponse.json({ success: false, error: 'Turno no encontrado' }, { status: 404 })
    }

    // Actualizar turno usando raw SQL para evitar leer fecha_hora
    if (estado && observaciones !== undefined) {
      await prisma.$executeRaw`
        UPDATE turnos 
        SET estado = ${estado}, observaciones = ${observaciones}
        WHERE id = ${Number(id)}
      `
    } else if (estado) {
      await prisma.$executeRaw`
        UPDATE turnos 
        SET estado = ${estado}
        WHERE id = ${Number(id)}
      `
    } else if (observaciones !== undefined) {
      await prisma.$executeRaw`
        UPDATE turnos 
        SET observaciones = ${observaciones}
        WHERE id = ${Number(id)}
      `
    }

    console.log('Turno actualizado exitosamente')

    return NextResponse.json({
      success: true,
      message: `Turno actualizado exitosamente`,
    })
  } catch (error: any) {
    console.error('Error al actualizar turno:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar turno',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/turnos/[id] - Eliminar turno permanentemente
 */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    // Verificar que el turno existe usando raw SQL
    const turnosExistentes: any[] = await prisma.$queryRaw`
      SELECT id FROM turnos 
      WHERE id = ${Number(id)} 
        AND fecha > '1970-01-01'
      LIMIT 1
    `

    if (!turnosExistentes || turnosExistentes.length === 0) {
      return NextResponse.json({ success: false, error: 'Turno no encontrado' }, { status: 404 })
    }

    // Eliminar turno físicamente usando raw SQL
    await prisma.$executeRaw`
      DELETE FROM turnos 
      WHERE id = ${Number(id)}
    `

    return NextResponse.json({
      success: true,
      message: 'Turno eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error al eliminar turno:', error)
    return NextResponse.json({ success: false, error: 'Error al eliminar turno' }, { status: 500 })
  }
}
