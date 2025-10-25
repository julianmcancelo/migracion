import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/vehiculos/[id]/solicitar-actualizacion
 * Envía notificación por email al titular del vehículo
 * solicitando actualización de documentación vencida
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id: paramId } = await context.params
    const vehiculoId = parseInt(paramId)

    if (isNaN(vehiculoId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { documentosVencidos, mensaje } = body

    // Obtener vehículo y titular
    const vehiculo = await prisma.vehiculos.findUnique({
      where: { id: vehiculoId },
      include: {
        habilitaciones_vehiculos: {
          include: {
            habilitacion: {
              include: {
                habilitaciones_personas: {
                  where: { rol: 'TITULAR' },
                  include: {
                    persona: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    // Obtener titular principal
    const titular = vehiculo.habilitaciones_vehiculos[0]?.habilitacion
      ?.habilitaciones_personas[0]?.persona

    if (!titular) {
      return NextResponse.json(
        { error: 'No se encontró titular para este vehículo' },
        { status: 404 }
      )
    }

    // Validar que tenga email
    if (!titular.email) {
      return NextResponse.json(
        { 
          error: 'El titular no tiene email registrado',
          titular: titular.nombre
        },
        { status: 400 }
      )
    }

    // TODO: Integrar con servicio de email (SendGrid, Resend, Nodemailer, etc.)
    // Por ahora, solo registramos en consola
    const notificacionData = {
      titular: {
        id: titular.id,
        nombre: titular.nombre,
        email: titular.email,
        dni: titular.dni
      },
      vehiculo: {
        id: vehiculoId,
        dominio: vehiculo.dominio,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo
      },
      documentos_vencidos: documentosVencidos,
      fecha_solicitud: new Date().toISOString(),
      solicitado_por: session.userId
    }
    
    console.log('📧 Notificación registrada:', notificacionData)
    
    // Aquí iría la integración con servicio de email:
    // await enviarEmail({
    //   to: titular.email,
    //   subject: `Actualización de documentación - Vehículo ${vehiculo.dominio}`,
    //   template: 'documentacion-vencida',
    //   data: notificacionData
    // })

    return NextResponse.json({
      success: true,
      message: 'Notificación registrada correctamente',
      data: {
        titular: {
          nombre: titular.nombre,
          email: titular.email
        },
        vehiculo: vehiculo.dominio,
        documentos_solicitados: documentosVencidos,
        nota: 'Email pendiente de configuración - Notificación registrada en sistema'
      }
    })
  } catch (error: any) {
    console.error('Error al enviar notificación:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al enviar notificación',
        details: error.message
      },
      { status: 500 }
    )
  }
}
