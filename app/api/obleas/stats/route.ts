import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/obleas/stats
 * Obtiene estadísticas de obleas desde tabla obleas (histórica)
 */
export async function GET() {
  try {
    console.log('📊 GET /api/obleas/stats - Iniciando...')

    // Total de obleas colocadas
    const totalObleas = await prisma.obleas.count()
    console.log('🔢 Total obleas colocadas:', totalObleas)

    // Todas las obleas colocadas se consideran notificadas
    const notificadas = totalObleas
    const noNotificadas = 0

    // Obleas por mes (últimos 12 meses)
    const fechaInicio = new Date()
    fechaInicio.setMonth(fechaInicio.getMonth() - 12)

    const obleasPorMes: any[] = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(fecha_colocacion, '%Y-%m') as mes,
        COUNT(*) as cantidad
      FROM obleas 
      WHERE fecha_colocacion >= ${fechaInicio}
      GROUP BY DATE_FORMAT(fecha_colocacion, '%Y-%m')
      ORDER BY mes DESC
      LIMIT 12
    `

    // Obleas por tipo de transporte
    const obleasPorTipo: any[] = await prisma.$queryRaw`
      SELECT 
        hg.tipo_transporte,
        COUNT(o.id) as cantidad
      FROM obleas o
      JOIN habilitaciones_generales hg ON o.habilitacion_id = hg.id
      GROUP BY hg.tipo_transporte
    `

    // Obleas recientes (últimas 10) - solo datos básicos de tabla obleas
    const obleasRecientes = await prisma.obleas.findMany({
      take: 10,
      orderBy: {
        fecha_colocacion: 'desc',
      },
      select: {
        id: true,
        nro_licencia: true,
        titular: true,
        fecha_colocacion: true,
      },
    })

    // Habilitaciones sin oblea - usando query SQL
    const habilitacionesSinObleaResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(*) as cantidad
      FROM habilitaciones_generales hg
      WHERE hg.estado = 'HABILITADO'
      AND NOT EXISTS (
        SELECT 1 FROM obleas o WHERE o.habilitacion_id = hg.id
      )
    `
    const habilitacionesSinOblea = Number(habilitacionesSinObleaResult[0]?.cantidad || 0)

    console.log('✅ Estadísticas calculadas correctamente')

    return NextResponse.json({
      success: true,
      data: {
        totales: {
          total_obleas: totalObleas,
          notificadas,
          no_notificadas: noNotificadas,
          habilitaciones_sin_oblea: habilitacionesSinOblea,
        },
        por_mes: obleasPorMes,
        por_tipo: obleasPorTipo,
        recientes: obleasRecientes.map(oblea => ({
          id: oblea.id,
          fecha: oblea.fecha_colocacion,
          nro_licencia: oblea.nro_licencia,
          tipo_transporte: 'Verificar habilitación',
          titular: oblea.titular,
          notificado: 'si',
        })),
      },
    })
  } catch (error: any) {
    console.error('❌ Error al obtener estadísticas de obleas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener estadísticas',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
