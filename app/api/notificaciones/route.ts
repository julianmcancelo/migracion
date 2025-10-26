import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET - Obtener notificaciones del usuario actual
 * Query params:
 * - limit: cantidad de notificaciones (default: 10)
 * - solo_no_leidas: true/false (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const soloNoLeidas = searchParams.get('solo_no_leidas') === 'true'

    // Construir filtro
    const where: any = {
      usuario_id: session.userId,
    }

    if (soloNoLeidas) {
      where.leida = false
    }

    // Obtener notificaciones
    const notificaciones = limit > 0 
      ? await prisma.notificaciones.findMany({
          where,
          orderBy: {
            fecha_creacion: 'desc',
          },
          take: limit,
        })
      : []

    // Contar no leídas
    const noLeidas = await prisma.notificaciones.count({
      where: {
        usuario_id: session.userId,
        leida: false,
      },
    })

    return NextResponse.json({
      notificaciones,
      no_leidas: noLeidas,
      total: notificaciones.length,
    })
  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    )
  }
}
