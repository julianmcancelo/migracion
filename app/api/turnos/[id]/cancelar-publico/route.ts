import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

/**
 * POST /api/turnos/[id]/cancelar-publico
 * Cancelar turno desde email (no requiere autenticación)
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const turnoId = parseInt(params.id)

    // Verificar que el turno existe
    const turno = await prisma.turnos.findUnique({
      where: { id: turnoId }
    })
    
    // Obtener datos de la habilitación
    let habilitacion: any = null
    if (turno?.habilitacion_id) {
      habilitacion = await prisma.habilitaciones_generales.findUnique({
        where: { id: turno.habilitacion_id },
        select: {
          nro_licencia: true,
          tipo_transporte: true
        }
      })
    }

    if (!turno) {
      return NextResponse.json(
        { success: false, error: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el turno no esté ya cancelado
    if (turno.estado === 'CANCELADO') {
      return NextResponse.json(
        { success: false, error: 'Este turno ya fue cancelado anteriormente' },
        { status: 400 }
      )
    }

    // Verificar que el turno no esté finalizado
    if (turno.estado === 'FINALIZADO') {
      return NextResponse.json(
        { success: false, error: 'No se puede cancelar un turno ya finalizado' },
        { status: 400 }
      )
    }

    // Actualizar estado a CANCELADO
    await prisma.turnos.update({
      where: { id: turnoId },
      data: { estado: 'CANCELADO' }
    })

    // Crear notificación para el sistema
    await prisma.notificaciones.create({
      data: {
        dni_usuario: 'SISTEMA',
        tipo: 'TURNO_CANCELADO',
        titulo: `Turno cancelado - Lic. ${habilitacion?.nro_licencia || turnoId}`,
        texto: `El titular ha cancelado el turno del ${new Date(turno.fecha).toLocaleDateString('es-AR')}.`,
        leida: false
      }
    })

    // Obtener email del titular
    // @ts-ignore
    const habPersona: any = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: turno.habilitacion_id,
        rol: 'TITULAR'
      },
      // @ts-ignore
      include: {
        persona: true
      }
    })

    // Enviar email de confirmación de cancelación
    if (habPersona?.persona?.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        })

        const fechaFormateada = new Date(turno.fecha).toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

        await transporter.sendMail({
          from: `"Municipalidad de Lanús - Transporte" <${process.env.GMAIL_USER}>`,
          to: habPersona.persona.email,
          replyTo: 'transportepublicolanus@gmail.com',
          subject: '❌ Turno Cancelado - Inspección Vehicular - Lanús',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width,initial-scale=1.0">
              <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #DC2626, #EF4444); color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 30px; }
                .info-card { background: #FEF2F2; border: 2px solid #EF4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #FEE2E2; }
                .info-row:last-child { border-bottom: none; }
                .footer { background: #F9FAFB; padding: 20px; text-align: center; color: #6B7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>❌ Turno Cancelado</h1>
                  <p>Su turno ha sido cancelado exitosamente</p>
                </div>
                <div class="content">
                  <p><strong>Estimado/a ${habPersona.persona.nombre || 'Usuario'},</strong></p>
                  <p>Le confirmamos que su turno para inspección vehicular ha sido <strong>cancelado exitosamente</strong> según su solicitud.</p>
                  
                  <div class="info-card">
                    <h3>📋 Detalles del Turno Cancelado</h3>
                    <div class="info-row">
                      <span>Fecha del Turno:</span>
                      <span><strong>${fechaFormateada}</strong></span>
                    </div>
                    <div class="info-row">
                      <span>Hora:</span>
                      <span><strong>${turno.hora ? new Date(turno.hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</strong></span>
                    </div>
                    <div class="info-row">
                      <span>Licencia:</span>
                      <span><strong>${habilitacion?.nro_licencia || 'N/A'}</strong></span>
                    </div>
                    <div class="info-row">
                      <span>Tipo:</span>
                      <span><strong>${habilitacion?.tipo_transporte || 'N/A'}</strong></span>
                    </div>
                  </div>
                  
                  <p>Si necesita reprogramar su turno, puede hacerlo contactándose con nosotros o solicitando un nuevo turno a través de nuestros canales oficiales.</p>
                </div>
                <div class="footer">
                  <p><strong>Municipalidad de Lanús</strong><br>
                  Dirección General de Movilidad y Transporte<br><br>
                  📞 <strong>Teléfono:</strong> 4357-5100 (Int. 7137)<br>
                  📧 <strong>Email:</strong> transportepublicolanus@gmail.com<br><br>
                  Este es un mensaje automático, por favor no responda a este email.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })

        console.log('Email de cancelación enviado a:', habPersona.persona.email)
      } catch (emailError) {
        console.error('Error al enviar email de cancelación:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Turno cancelado exitosamente'
    })

  } catch (error) {
    console.error('Error al cancelar turno:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cancelar el turno' },
      { status: 500 }
    )
  }
}
