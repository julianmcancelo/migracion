import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Marcar como ruta dinámica
export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/stats
 * Obtiene estadísticas para el dashboard
 */
export async function GET() {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Filtro según rol (simplificado por ahora)
    const whereBase: any = {
      is_deleted: false,
    }

    // KPI 1: Habilitaciones activas
    const activas = await prisma.habilitaciones_generales.count({
      where: {
        ...whereBase,
        estado: 'HABILITADO',
      },
    })

    // KPI 2: En trámite
    const enTramite = await prisma.habilitaciones_generales.count({
      where: {
        ...whereBase,
        estado: 'EN_TRAMITE',
      },
    })

    // KPI 3: Por vencer (próximos 30 días)
    const hoy = new Date()
    const en30Dias = new Date()
    en30Dias.setDate(hoy.getDate() + 30)

    const porVencer = await prisma.habilitaciones_generales.count({
      where: {
        ...whereBase,
        estado: 'HABILITADO',
        vigencia_fin: {
          gte: hoy,
          lte: en30Dias,
        },
      },
    })

    // KPI 4: Obleas pendientes
    const obleasPendientes = await prisma.habilitaciones_generales.findMany({
      where: {
        ...whereBase,
        estado: 'HABILITADO',
        oblea_colocada: false,
      },
      select: {
        id: true,
        nro_licencia: true,
      },
      orderBy: {
        id: 'desc',
      },
    })

    // Distribución por estado (para gráfico)
    const distribucion = await prisma.habilitaciones_generales.groupBy({
      by: ['estado'],
      where: whereBase,
      _count: {
        id: true,
      },
    })

    const distribucionFormateada = distribucion.map((d) => ({
      estado: d.estado,
      total: d._count.id,
    }))

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          activas,
          en_tramite: enTramite,
          por_vencer: porVencer,
          obleas_pendientes: obleasPendientes.length,
        },
        obleas_pendientes: obleasPendientes,
        distribucion: distribucionFormateada,
      },
    })

  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
