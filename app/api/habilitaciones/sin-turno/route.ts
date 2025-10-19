import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/sin-turno
 * Obtiene habilitaciones en trámite que no tienen turno asignado
 */
export async function GET() {
  try {
    // Obtener todas las habilitaciones en estado "EN_TRAMITE"
    const habilitaciones = await prisma.habilitaciones_generales.findMany({
      where: {
        estado: 'EN_TRAMITE',
        is_deleted: false
      },
      include: {
        habilitaciones_personas: {
          include: {
            persona: true
          }
        },
        habilitaciones_vehiculos: {
          include: {
            vehiculo: true
          }
        }
      }
    })

    // Obtener IDs de habilitaciones que ya tienen o tuvieron turno (cualquier estado)
    const turnosExistentes = await prisma.turnos.findMany({
      select: {
        habilitacion_id: true
      }
    })

    const idsConTurno = new Set(turnosExistentes.map(t => t.habilitacion_id))

    // Filtrar habilitaciones sin turno y formatear
    const sinTurno = habilitaciones
      .filter(h => !idsConTurno.has(h.id))
      .map(h => {
        const personaRel = h.habilitaciones_personas[0]
        const persona = personaRel?.persona
        const vehiculoRel = h.habilitaciones_vehiculos[0]
        const vehiculo = vehiculoRel?.vehiculo

        return {
          id: h.id,
          nro_licencia: h.nro_licencia,
          tipo_transporte: h.tipo_transporte,
          titular_nombre: persona?.nombre || null,
          titular_dni: persona?.dni || null,
          vehiculo_patente: vehiculo?.dominio || null,
          vehiculo_marca: vehiculo?.marca || null,
          vehiculo_modelo: vehiculo?.modelo || null
        }
      })

    return NextResponse.json({
      success: true,
      data: sinTurno,
      count: sinTurno.length
    })
  } catch (error) {
    console.error('Error al obtener habilitaciones sin turno:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener habilitaciones sin turno' },
      { status: 500 }
    )
  }
}
