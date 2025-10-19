import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/[id]/inspecciones
 * Obtiene el historial de inspecciones del vehículo asociado a la habilitación
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Obtener el vehículo asociado a la habilitación
    const habVehiculo = await prisma.habilitaciones_vehiculos.findFirst({
      where: {
        habilitacion_id: Number(id)
      },
      select: {
        vehiculo_id: true
      }
    })

    if (!habVehiculo?.vehiculo_id) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Buscar todas las habilitaciones que tienen el mismo vehículo
    const habilitacionesConMismoVehiculo = await prisma.habilitaciones_vehiculos.findMany({
      where: {
        vehiculo_id: habVehiculo.vehiculo_id
      },
      select: {
        habilitacion_id: true
      }
    })

    const habilitacionIds = habilitacionesConMismoVehiculo
      .map(h => h.habilitacion_id)
      .filter((id): id is number => id !== null)

    // Buscar todas las inspecciones de esas habilitaciones
    const inspecciones = await prisma.inspecciones.findMany({
      where: {
        habilitacion_id: {
          in: habilitacionIds
        }
      },
      orderBy: {
        fecha_inspeccion: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: inspecciones
    })
  } catch (error) {
    console.error('Error al obtener inspecciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener inspecciones' },
      { status: 500 }
    )
  }
}
