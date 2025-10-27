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

    // Verificar que el vehículo existe
    const vehiculoExistente = await prisma.vehiculos.findUnique({
      where: { id }
    })

    if (!vehiculoExistente) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos para actualización (solo campos que no sean undefined)
    const updateData: any = {}
    
    if (body.marca !== undefined) updateData.marca = body.marca || null
    if (body.modelo !== undefined) updateData.modelo = body.modelo || null
    if (body.ano !== undefined) updateData.ano = body.ano || null
    if (body.tipo !== undefined) updateData.tipo = body.tipo || null
    if (body.chasis !== undefined) updateData.chasis = body.chasis || null
    if (body.motor !== undefined) updateData.motor = body.motor || null
    if (body.asientos !== undefined) updateData.asientos = body.asientos || null
    
    // Campos de fecha - convertir strings vacíos a null
    if (body.inscripcion_inicial !== undefined) {
      updateData.inscripcion_inicial = body.inscripcion_inicial ? new Date(body.inscripcion_inicial) : null
    }
    if (body.Vencimiento_VTV !== undefined) {
      updateData.Vencimiento_VTV = body.Vencimiento_VTV ? new Date(body.Vencimiento_VTV) : null
    }
    if (body.Vencimiento_Poliza !== undefined) {
      updateData.Vencimiento_Poliza = body.Vencimiento_Poliza ? new Date(body.Vencimiento_Poliza) : null
    }
    
    if (body.Aseguradora !== undefined) updateData.Aseguradora = body.Aseguradora || null
    if (body.poliza !== undefined) updateData.poliza = body.poliza || null

    // Actualizar vehículo
    const vehiculoActualizado = await prisma.vehiculos.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: vehiculoActualizado,
      message: 'Vehículo actualizado correctamente'
    })
  } catch (error: any) {
    console.error('Error al actualizar vehículo:', error)
    return NextResponse.json(
      { 
        error: 'Error al actualizar vehículo', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
