import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/vehiculos/[id]
 * Obtener un vehículo específico por ID con todas sus relaciones
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id: paramId } = await context.params
    const id = parseInt(paramId)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Obtener vehículo con todas sus relaciones y notificaciones
    const vehiculo = await prisma.vehiculos.findUnique({
      where: { id },
      include: {
        habilitaciones_vehiculos: {
          include: {
            habilitacion: {
              include: {
                habilitaciones_personas: {
                  where: {
                    rol: 'TITULAR'
                  },
                  include: {
                    persona: true
                  }
                }
              }
            }
          }
        }
        // TODO: Descomentar después de ejecutar 'npx prisma generate'
        // notificaciones_vehiculos: {
        //   orderBy: {
        //     fecha_envio: 'desc'
        //   },
        //   take: 5 // Últimas 5 notificaciones
        // }
      }
    })

    if (!vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    // Calcular alertas de vencimientos
    const hoy = new Date()
    const en30Dias = new Date()
    en30Dias.setDate(hoy.getDate() + 30)

    const alertas = {
      vtv: {
        vencida: vehiculo.Vencimiento_VTV ? new Date(vehiculo.Vencimiento_VTV) < hoy : false,
        proximaVencer: vehiculo.Vencimiento_VTV ? new Date(vehiculo.Vencimiento_VTV) < en30Dias && new Date(vehiculo.Vencimiento_VTV) >= hoy : false,
        diasRestantes: vehiculo.Vencimiento_VTV ? Math.ceil((new Date(vehiculo.Vencimiento_VTV).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)) : null
      },
      poliza: {
        vencida: vehiculo.Vencimiento_Poliza ? new Date(vehiculo.Vencimiento_Poliza) < hoy : false,
        proximaVencer: vehiculo.Vencimiento_Poliza ? new Date(vehiculo.Vencimiento_Poliza) < en30Dias && new Date(vehiculo.Vencimiento_Poliza) >= hoy : false,
        diasRestantes: vehiculo.Vencimiento_Poliza ? Math.ceil((new Date(vehiculo.Vencimiento_Poliza).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)) : null
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...vehiculo,
        alertas
      }
    })
  } catch (error: any) {
    console.error('Error al obtener vehículo:', error)
    return NextResponse.json(
      { error: 'Error al obtener vehículo', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/vehiculos/[id]
 * Actualizar datos de un vehículo
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id: paramId } = await context.params
    const id = parseInt(paramId)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()

    // Actualizar vehículo
    const vehiculoActualizado = await prisma.vehiculos.update({
      where: { id },
      data: {
        marca: body.marca || undefined,
        modelo: body.modelo || undefined,
        ano: body.ano || undefined,
        tipo: body.tipo || undefined,
        chasis: body.chasis || undefined,
        motor: body.motor || undefined,
        Vencimiento_VTV: body.Vencimiento_VTV || undefined,
        Vencimiento_Poliza: body.Vencimiento_Poliza || undefined,
      }
    })

    return NextResponse.json({
      success: true,
      data: vehiculoActualizado,
      message: 'Vehículo actualizado correctamente'
    })
  } catch (error: any) {
    console.error('Error al actualizar vehículo:', error)
    return NextResponse.json(
      { error: 'Error al actualizar vehículo', details: error.message },
      { status: 500 }
    )
  }
}
