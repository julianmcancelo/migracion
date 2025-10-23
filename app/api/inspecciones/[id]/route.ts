import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/inspecciones/[id]
 * Obtiene una inspección por ID con datos de habilitación
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const inspeccionId = parseInt(params.id)

    const inspeccion = await prisma.inspecciones.findUnique({
      where: { id: inspeccionId },
    })

    if (!inspeccion) {
      return NextResponse.json(
        { success: false, error: 'Inspección no encontrada' },
        { status: 404 }
      )
    }

    // Obtener datos de la habilitación por separado
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: inspeccion.habilitacion_id },
      select: {
        nro_licencia: true,
        tipo_transporte: true,
      },
    })

    // Obtener titular
    // @ts-expect-error
    const habPersona = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: inspeccion.habilitacion_id,
        rol: 'TITULAR',
      },
      // @ts-expect-error
      include: {
        persona: {
          select: {
            nombre: true,
            dni: true,
            email: true,
          },
        },
      },
    })

    // Obtener vehículo
    // @ts-expect-error
    const habVehiculo = await prisma.habilitaciones_vehiculos.findFirst({
      where: {
        habilitacion_id: inspeccion.habilitacion_id,
      },
      // @ts-expect-error
      include: {
        vehiculo: {
          select: {
            dominio: true,
            marca: true,
            modelo: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...inspeccion,
        habilitacion: {
          ...habilitacion,
          habilitaciones_personas: habPersona ? [habPersona] : [],
          habilitaciones_vehiculos: habVehiculo ? [habVehiculo] : [],
        },
      },
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
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const inspeccionId = parseInt(params.id)
    const body = await request.json()

    const { nombre_inspector, resultado, observaciones, items } = body

    // Verificar que la inspección existe
    const inspeccion = await prisma.inspecciones.findUnique({
      where: { id: inspeccionId },
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
        fecha_inspeccion: new Date(), // Actualizar fecha al momento de completar
      },
    })

    // Guardar items del checklist
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (item.estado) {
          await prisma.inspeccion_detalles.create({
            data: {
              inspeccion_id: inspeccionId,
              item_id: item.nombre.substring(0, 50), // Limitar longitud
              nombre_item: item.nombre,
              estado: item.estado,
              observacion: item.observacion || null,
            },
          })
        }
      }
    }

    // Si hay observaciones generales, guardarlas también
    if (observaciones && observaciones.trim()) {
      await prisma.inspeccion_detalles.create({
        data: {
          inspeccion_id: inspeccionId,
          item_id: 'observaciones_generales',
          nombre_item: 'Observaciones Generales',
          estado: 'INFO',
          observacion: observaciones.trim(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: inspeccionActualizada,
      message: 'Inspección actualizada exitosamente',
    })
  } catch (error) {
    console.error('Error al actualizar inspección:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar la inspección' },
      { status: 500 }
    )
  }
}
