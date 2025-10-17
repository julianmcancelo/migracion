import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

/**
 * POST /api/turnos/[id]/reprogramar-publico
 * Solicitar reprogramación de turno desde email (no requiere autenticación)
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const turnoId = parseInt(params.id)
    const body = await request.json()
    const { observaciones } = body

    // Verificar que el turno existe
    // @ts-ignore
    const turno: any = await prisma.turnos.findUnique({
      where: { id: turnoId },
      // @ts-ignore
      include: {
        habilitaciones_generales: {
          select: {
            nro_licencia: true,
            tipo_transporte: true
          }
        }
      }
    })

    if (!turno) {
      return NextResponse.json(
        { success: false, error: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el turno no esté cancelado
    if (turno.estado === 'CANCELADO') {
      return NextResponse.json(
        { success: false, error: 'No se puede reprogramar un turno cancelado' },
        { status: 400 }
      )
    }

    // Verificar que el turno no esté finalizado
    if (turno.estado === 'FINALIZADO') {
      return NextResponse.json(
        { success: false, error: 'No se puede reprogramar un turno finalizado' },
        { status: 400 }
      )
    }

    // Actualizar turno con observaciones de reprogramación
    await prisma.turnos.update({
      where: { id: turnoId },
      data: {
        observaciones: observaciones 
          ? `[REPROGRAMACIÓN SOLICITADA] ${observaciones}` 
          : '[REPROGRAMACIÓN SOLICITADA] Sin observaciones'
      }
    })

    // Crear notificación para el sistema
    await prisma.notificaciones.create({
      data: {
        dni_usuario: 'SISTEMA',
        tipo: 'TURNO_REPROGRAMAR',
        titulo: `Reprogramación - Lic. ${turno.habilitaciones_generales?.nro_licencia || turnoId}`,
        texto: `Solicitud de reprogramación del turno del ${new Date(turno.fecha).toLocaleDateString('es-AR')}. ${observaciones ? `Motivo: ${observaciones}` : 'Sin motivo especificado'}`,
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

    // Enviar email de confirmación de solicitud
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
          from: `"Municipalidad de Lanús" <${process.env.GMAIL_USER}>`,
          to: habPersona.persona.email,
          replyTo: 'transportepublicolanus@gmail.com',
          subject: '📅 Solicitud de Reprogramación Recibida - Inspección Vehicular',
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1F2937; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .icon { font-size: 48px; margin-bottom: 10px; }
    .info-box { background: #F5F3FF; border-left: 4px solid #7C3AED; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { background: #1F2937; color: #9CA3AF; padding: 20px; text-align: center; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">📅</div>
      <h1 style="margin: 0;">Solicitud Recibida</h1>
      <p style="margin: 10px 0 0 0;">Municipalidad de Lanús</p>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${habPersona.persona.nombre}</strong>,</p>
      <p>Hemos recibido su <strong>solicitud de reprogramación</strong> de turno de inspección vehicular.</p>
      <div class="info-box">
        <p style="margin: 0;"><strong>📋 Turno a Reprogramar:</strong></p>
        <p style="margin: 10px 0 5px 0;">Licencia: <strong>${turno.habilitaciones_generales?.nro_licencia}</strong></p>
        <p style="margin: 5px 0;">Fecha original: <strong>${fechaFormateada}</strong></p>
        ${observaciones ? `<p style="margin: 5px 0;">Motivo: <strong>${observaciones}</strong></p>` : ''}
        <p style="margin: 5px 0 0 0;">Estado: <strong style="color: #7C3AED;">EN PROCESO</strong></p>
      </div>
      <p><strong>Nuestro equipo se contactará con usted</strong> en las próximas 24-48 horas hábiles para coordinar una nueva fecha y horario.</p>
      <p style="color: #6B7280; font-size: 14px;">
        📞 Consultas: 4357-5100 int. 7137<br/>
        📧 transportepublicolanus@gmail.com<br/>
        ⏰ Lunes a Viernes de 8:00 a 16:00 hs
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;">© ${new Date().getFullYear()} Municipalidad de Lanús</p>
    </div>
  </div>
</body>
</html>
          `
        })

        console.log('Email de reprogramación enviado a:', habPersona.persona.email)
      } catch (emailError) {
        console.error('Error al enviar email de reprogramación:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud de reprogramación enviada exitosamente'
    })

  } catch (error) {
    console.error('Error al solicitar reprogramación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
