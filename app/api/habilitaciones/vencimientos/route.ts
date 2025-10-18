import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/vencimientos
 * Obtiene habilitaciones vencidas y próximas a vencer con detalles
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const hoy = new Date()
    const en7Dias = new Date()
    en7Dias.setDate(hoy.getDate() + 7)
    const en15Dias = new Date()
    en15Dias.setDate(hoy.getDate() + 15)
    const en30Dias = new Date()
    en30Dias.setDate(hoy.getDate() + 30)

    // Habilitaciones vencidas
    const vencidas = await prisma.habilitaciones_generales.findMany({
      where: {
        is_deleted: false,
        estado: 'HABILITADO',
        vigencia_fin: {
          lt: hoy
        }
      },
      include: {
        habilitaciones_personas: {
          where: { rol: 'TITULAR' },
          include: { persona: true },
          take: 1
        },
        habilitaciones_vehiculos: {
          include: { vehiculo: true },
          take: 1
        }
      },
      orderBy: { vigencia_fin: 'asc' },
      take: 10
    })

    // Por vencer (próximos 30 días)
    const porVencer = await prisma.habilitaciones_generales.findMany({
      where: {
        is_deleted: false,
        estado: 'HABILITADO',
        vigencia_fin: {
          gte: hoy,
          lte: en30Dias
        }
      },
      include: {
        habilitaciones_personas: {
          where: { rol: 'TITULAR' },
          include: { persona: true },
          take: 1
        },
        habilitaciones_vehiculos: {
          include: { vehiculo: true },
          take: 1
        }
      },
      orderBy: { vigencia_fin: 'asc' },
      take: 20
    })

    // Formatear datos
    const formatearHabilitacion = (hab: any) => {
      const titular = hab.habilitaciones_personas?.[0]
      const vehiculo = hab.habilitaciones_vehiculos?.[0]
      const fechaVencimiento = hab.vigencia_fin ? new Date(hab.vigencia_fin) : new Date()
      const diasRestantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: hab.id,
        nro_licencia: hab.nro_licencia || `#${hab.id}`,
        tipo_transporte: hab.tipo_transporte,
        vigencia_fin: hab.vigencia_fin,
        dias_restantes: diasRestantes,
        urgencia: diasRestantes < 0 ? 'vencida' : diasRestantes <= 7 ? 'urgente' : diasRestantes <= 15 ? 'atencion' : 'planificado',
        titular: {
          nombre: titular?.persona?.nombre || 'Sin titular',
          dni: titular?.persona?.dni
        },
        vehiculo: {
          dominio: vehiculo?.vehiculo?.dominio || 'Sin vehículo',
          marca: vehiculo?.vehiculo?.marca,
          modelo: vehiculo?.vehiculo?.modelo
        }
      }
    }

    const vencidasFormateadas = vencidas.map(formatearHabilitacion)
    const porVencerFormateadas = porVencer.map(formatearHabilitacion)

    return NextResponse.json({
      success: true,
      data: {
        vencidas: vencidasFormateadas,
        por_vencer: porVencerFormateadas,
        totales: {
          vencidas: vencidas.length,
          proximos_7_dias: porVencer.filter(h => {
            if (!h.vigencia_fin) return false
            const dias = Math.ceil((new Date(h.vigencia_fin).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
            return dias <= 7
          }).length,
          proximos_15_dias: porVencer.filter(h => {
            if (!h.vigencia_fin) return false
            const dias = Math.ceil((new Date(h.vigencia_fin).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
            return dias <= 15
          }).length,
          proximos_30_dias: porVencer.length
        }
      }
    })

  } catch (error: any) {
    console.error('Error al obtener vencimientos:', error)
    return NextResponse.json(
      { error: 'Error al obtener vencimientos', details: error.message },
      { status: 500 }
    )
  }
}
