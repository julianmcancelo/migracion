import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/obleas/stats
 * Obtiene estadísticas de obleas
 */
export async function GET() {
  try {
    // Total de obleas
    const totalObleas = await prisma.oblea_historial.count()

    // Obleas por estado de notificación
    const notificadas = await prisma.oblea_historial.count({
      where: { notificado: 'si' }
    })

    const noNotificadas = await prisma.oblea_historial.count({
      where: { notificado: 'no' }
    })

    // Obleas por mes (últimos 12 meses)
    const fechaInicio = new Date()
    fechaInicio.setMonth(fechaInicio.getMonth() - 12)

    const obleasPorMes = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(fecha_solicitud, '%Y-%m') as mes,
        COUNT(*) as cantidad
      FROM oblea_historial 
      WHERE fecha_solicitud >= ${fechaInicio}
      GROUP BY DATE_FORMAT(fecha_solicitud, '%Y-%m')
      ORDER BY mes DESC
      LIMIT 12
    `

    // Obleas por tipo de transporte
    const obleasPorTipo = await prisma.$queryRaw`
      SELECT 
        hg.tipo_transporte,
        COUNT(oh.id) as cantidad
      FROM oblea_historial oh
      JOIN habilitaciones_generales hg ON oh.habilitacion_id = hg.id
      GROUP BY hg.tipo_transporte
    `

    // Obleas recientes (últimas 10)
    const obleasRecientes = await prisma.oblea_historial.findMany({
      take: 10,
      orderBy: {
        fecha_solicitud: 'desc'
      },
      include: {
        habilitaciones_generales: {
          select: {
            nro_licencia: true,
            tipo_transporte: true,
            habilitaciones_personas: {
              where: { rol: 'TITULAR' },
              include: {
                persona: {
                  select: {
                    nombre: true
                  }
                }
              },
              take: 1
            }
          }
        }
      }
    })

    // Habilitaciones sin oblea
    const habilitacionesSinOblea = await prisma.habilitaciones_generales.count({
      where: {
        estado: 'HABILITADO',
        NOT: {
          oblea_historial: {
            some: {}
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totales: {
          total_obleas: totalObleas,
          notificadas,
          no_notificadas: noNotificadas,
          habilitaciones_sin_oblea: habilitacionesSinOblea
        },
        por_mes: obleasPorMes,
        por_tipo: obleasPorTipo,
        recientes: obleasRecientes.map(oblea => ({
          id: oblea.id,
          fecha: oblea.fecha_solicitud,
          nro_licencia: oblea.habilitaciones_generales?.nro_licencia,
          tipo_transporte: oblea.habilitaciones_generales?.tipo_transporte,
          titular: oblea.habilitaciones_generales?.habilitaciones_personas[0]?.persona?.nombre,
          notificado: oblea.notificado
        }))
      }
    })

  } catch (error: any) {
    console.error('Error al obtener estadísticas de obleas:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener estadísticas',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
