import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * POST /api/habilitaciones/[id]/cambiar-vehiculo
 * 
 * Cambia el vehículo de una habilitación activa manteniendo el historial completo.
 * 
 * Body:
 * - nuevo_vehiculo_id: ID del nuevo vehículo
 * - observaciones: Motivo del cambio (opcional)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const habilitacionId = parseInt(id)

    if (isNaN(habilitacionId)) {
      return NextResponse.json(
        { success: false, error: 'ID de habilitación inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { nuevo_vehiculo_id, observaciones } = body

    if (!nuevo_vehiculo_id) {
      return NextResponse.json(
        { success: false, error: 'Debe especificar el nuevo vehículo' },
        { status: 400 }
      )
    }

    // Verificar que la habilitación existe
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId },
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el nuevo vehículo existe
    const nuevoVehiculo = await prisma.vehiculos.findUnique({
      where: { id: parseInt(nuevo_vehiculo_id) },
    })

    if (!nuevoVehiculo) {
      return NextResponse.json(
        { success: false, error: 'El nuevo vehículo no existe' },
        { status: 404 }
      )
    }

    // Ejecutar cambio en transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Obtener el vehículo actual activo
      const vehiculoActual = await tx.habilitaciones_vehiculos.findFirst({
        where: {
          habilitacion_id: habilitacionId,
          activo: true,
        },
        include: {
          vehiculo: true,
        },
      })

      // 2. Marcar el vehículo anterior como inactivo (historial)
      if (vehiculoActual) {
        await tx.habilitaciones_vehiculos.update({
          where: { id: vehiculoActual.id },
          data: {
            activo: false,
            fecha_baja: new Date(),
            observaciones_cambio: observaciones || 'Cambio de material rodante',
          },
        })
      }

      // 3. Vincular el nuevo vehículo como activo
      const nuevoVinculo = await tx.habilitaciones_vehiculos.create({
        data: {
          habilitacion_id: habilitacionId,
          vehiculo_id: parseInt(nuevo_vehiculo_id),
          activo: true,
          fecha_alta: new Date(),
          observaciones_cambio: observaciones || 'Cambio de material rodante',
        },
        include: {
          vehiculo: true,
        },
      })

      // 4. Registrar NOVEDAD del cambio de vehículo
      await tx.habilitaciones_novedades.create({
        data: {
          habilitacion_id: habilitacionId,
          tipo_novedad: 'CAMBIO_VEHICULO',
          entidad_afectada: 'VEHICULO',
          entidad_id: parseInt(nuevo_vehiculo_id),
          descripcion: `Cambio de material rodante: ${vehiculoActual?.vehiculo?.dominio || 'N/A'} → ${nuevoVehiculo.dominio}`,
          datos_anteriores: vehiculoActual?.vehiculo ? JSON.stringify({
            vehiculo_id: vehiculoActual.vehiculo_id,
            dominio: vehiculoActual.vehiculo.dominio,
            marca: vehiculoActual.vehiculo.marca,
            modelo: vehiculoActual.vehiculo.modelo,
          }) : null,
          datos_nuevos: JSON.stringify({
            vehiculo_id: nuevoVinculo.vehiculo_id,
            dominio: nuevoVehiculo.dominio,
            marca: nuevoVehiculo.marca,
            modelo: nuevoVehiculo.modelo,
          }),
          observaciones: observaciones || 'Cambio de material rodante',
        },
      })

      return {
        vehiculo_anterior: vehiculoActual?.vehiculo,
        vehiculo_nuevo: nuevoVinculo.vehiculo,
      }
    })

    // Responder con éxito
    return NextResponse.json({
      success: true,
      message: 'Vehículo cambiado exitosamente',
      data: {
        habilitacion_id: habilitacionId,
        vehiculo_anterior: resultado.vehiculo_anterior
          ? {
              id: resultado.vehiculo_anterior.id,
              dominio: resultado.vehiculo_anterior.dominio,
              marca: resultado.vehiculo_anterior.marca,
              modelo: resultado.vehiculo_anterior.modelo,
            }
          : null,
        vehiculo_nuevo: {
          id: resultado.vehiculo_nuevo.id,
          dominio: resultado.vehiculo_nuevo.dominio,
          marca: resultado.vehiculo_nuevo.marca,
          modelo: resultado.vehiculo_nuevo.modelo,
        },
        observaciones,
      },
    })
  } catch (error) {
    console.error('Error al cambiar vehículo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al cambiar vehículo',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/habilitaciones/[id]/cambiar-vehiculo
 * 
 * Obtiene el historial completo de vehículos de una habilitación
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const habilitacionId = parseInt(id)

    if (isNaN(habilitacionId)) {
      return NextResponse.json(
        { success: false, error: 'ID de habilitación inválido' },
        { status: 400 }
      )
    }

    // Obtener todo el historial de vehículos (activos e inactivos)
    const historial = await prisma.habilitaciones_vehiculos.findMany({
      where: { habilitacion_id: habilitacionId },
      include: {
        vehiculo: true,
      },
      orderBy: {
        fecha_alta: 'desc',
      },
    })

    // Separar vehículo actual vs historial
    const vehiculoActual = historial.find((h) => h.activo)
    const vehiculosHistoricos = historial.filter((h) => !h.activo)

    return NextResponse.json({
      success: true,
      data: {
        vehiculo_actual: vehiculoActual
          ? {
              id: vehiculoActual.id,
              vehiculo_id: vehiculoActual.vehiculo_id,
              dominio: vehiculoActual.vehiculo?.dominio,
              marca: vehiculoActual.vehiculo?.marca,
              modelo: vehiculoActual.vehiculo?.modelo,
              fecha_alta: vehiculoActual.fecha_alta,
              observaciones: vehiculoActual.observaciones_cambio,
            }
          : null,
        historial: vehiculosHistoricos.map((h) => ({
          id: h.id,
          vehiculo_id: h.vehiculo_id,
          dominio: h.vehiculo?.dominio,
          marca: h.vehiculo?.marca,
          modelo: h.vehiculo?.modelo,
          fecha_alta: h.fecha_alta,
          fecha_baja: h.fecha_baja,
          observaciones: h.observaciones_cambio,
        })),
        total_cambios: vehiculosHistoricos.length,
      },
    })
  } catch (error) {
    console.error('Error al obtener historial de vehículos:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener historial',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
