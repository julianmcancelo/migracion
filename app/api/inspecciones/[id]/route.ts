import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/inspecciones/[id]
 * Obtiene una inspección por ID con datos de habilitación
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const inspeccionId = parseInt(params.id)

    const inspeccion = await prisma.inspecciones.findUnique({
      where: { id: inspeccionId },
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
                    nombre: true,
                    dni: true,
                    email: true
                  }
                }
              },
              take: 1
            },
            habilitaciones_vehiculos: {
              include: {
                vehiculo: {
                  select: {
                    dominio: true,
                    marca: true,
                    modelo: true
                  }
                }
              },
              take: 1
            }
          }
        }
      }
    })

    if (!inspeccion) {
      return NextResponse.json(
        { success: false, error: 'Inspección no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...inspeccion,
        habilitacion: inspeccion.habilitaciones_generales
      }
    })

  } catch (error) {
    console.error('Error al obtener inspección:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener la inspección' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/inspecciones/[id]
 * Actualiza una inspección existente
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const inspeccionId = parseInt(params.id)
    const body = await request.json()

    const { nombre_inspector, resultado, observaciones } = body

    // Verificar que la inspección existe
    const inspeccion = await prisma.inspecciones.findUnique({
      where: { id: inspeccionId }
    })

    if (!inspeccion) {
      return NextResponse.json(
        { success: false, error: 'Inspección no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar inspección
    const inspeccionActualizada = await prisma.inspecciones.update({
      where: { id: inspeccionId },
      data: {
        nombre_inspector: nombre_inspector || inspeccion.nombre_inspector,
        resultado: resultado || inspeccion.resultado,
        fecha_inspeccion: new Date() // Actualizar fecha al momento de completar
      }
    })

    // Si hay observaciones, guardarlas en inspeccion_detalles
    if (observaciones && observaciones.trim()) {
      await prisma.inspeccion_detalles.create({
        data: {
          inspeccion_id: inspeccionId,
          categoria: 'OBSERVACIONES_GENERALES',
          observaciones: observaciones.trim()
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: inspeccionActualizada,
      message: 'Inspección actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error al actualizar inspección:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar la inspección' },
      { status: 500 }
    )
  }
}
