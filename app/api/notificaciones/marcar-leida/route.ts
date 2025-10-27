import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST - Marcar notificaciones como leídas
 * Body: { ids: number[] } o { todas: true }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    if (body.todas) {
      // Marcar todas como leídas
      const result = await prisma.notificaciones.updateMany({
        where: {
          usuario_id: session.userId,
          leida: false,
        },
        data: {
          leida: true,
          fecha_lectura: new Date(),
        },
      })

      return NextResponse.json({
        exito: true,
        actualizadas: result.count,
        mensaje: 'Todas las notificaciones marcadas como leídas',
      })
    }

    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de IDs' },
        { status: 400 }
      )
    }

    // Marcar notificaciones específicas como leídas
    const result = await prisma.notificaciones.updateMany({
      where: {
        id: {
          in: body.ids,
        },
        usuario_id: session.userId,
        leida: false,
      },
      data: {
        leida: true,
        fecha_lectura: new Date(),
      },
    })

    return NextResponse.json({
      exito: true,
      actualizadas: result.count,
      mensaje: `${result.count} notificación(es) marcada(s) como leída(s)`,
    })
  } catch (error) {
    console.error('Error al marcar notificaciones:', error)
    return NextResponse.json(
      { error: 'Error al marcar notificaciones' },
      { status: 500 }
    )
  }
}
