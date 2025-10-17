import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

/**
 * POST /api/turnos/[id]/cancelar-publico
 * Cancelar turno desde email (no requiere autenticación)
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const turnoId = parseInt(params.id)

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
        titulo: `Turno cancelado - Lic. ${turno.habilitaciones_generales?.nro_licencia || turnoId}`,
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
          from: `"Municipalidad de Lanús" <${process.env.GMAIL_USER}>`,
          to: habPersona.persona.email,
          replyTo: 'transportepublicolanus@gmail.com',
          subject: '❌ Cancelación Confirmada - Inspección Vehicular',
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1F2937; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #DC2626, #EF4444); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .icon { font-size: 48px; margin-bottom: 10px; }
    .info-box { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { background: #1F2937; color: #9CA3AF; padding: 20px; text-align: center; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">❌</div>
      <h1 style="margin: 0;">Cancelación Confirmada</h1>
      <p style="margin: 10px 0 0 0;">Municipalidad de Lanús</p>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${habPersona.persona.nombre}</strong>,</p>
      <p>Hemos recibido y procesado la <strong>cancelación de su turno</strong> de inspección vehicular.</p>
      <div class="info-box">
        <p style="margin: 0;"><strong>📋 Turno Cancelado:</strong></p>
        <p style="margin: 10px 0 5px 0;">Licencia: <strong>${turno.habilitaciones_generales?.nro_licencia}</strong></p>
        <p style="margin: 5px 0;">Fecha original: <strong>${fechaFormateada}</strong></p>
        <p style="margin: 5px 0 0 0;">Estado: <strong style="color: #DC2626;">CANCELADO</strong></p>
      </div>
      <p>Puede solicitar un nuevo turno cuando lo necesite comunicándose con nosotros.</p>
      <p style="color: #6B7280; font-size: 14px;">
        📞 Consultas: 4357-5100 int. 7137<br/>
        📧 transportepublicolanus@gmail.com
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
