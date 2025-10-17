import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

/**
 * POST /api/turnos/[id]/confirmar-publico
 * Confirmar turno desde email (no requiere autenticación)
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

    // Verificar que el turno no esté cancelado
    if (turno.estado === 'CANCELADO') {
      return NextResponse.json(
        { success: false, error: 'Este turno ya fue cancelado' },
        { status: 400 }
      )
    }

    // Verificar que el turno no esté finalizado
    if (turno.estado === 'FINALIZADO') {
      return NextResponse.json(
        { success: false, error: 'Este turno ya fue finalizado' },
        { status: 400 }
      )
    }

    // Actualizar estado a CONFIRMADO
    await prisma.turnos.update({
      where: { id: turnoId },
      data: { estado: 'CONFIRMADO' }
    })

    // Crear notificación para el sistema
    await prisma.notificaciones.create({
      data: {
        dni_usuario: 'SISTEMA',
        tipo: 'TURNO_CONFIRMADO',
        titulo: `Turno confirmado - Lic. ${turno.habilitaciones_generales?.nro_licencia || turnoId}`,
        texto: `El titular ha confirmado su asistencia al turno del ${new Date(turno.fecha).toLocaleDateString('es-AR')}.`,
        leida: false
      }
    })

    // Obtener email del titular para enviar confirmación
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

    // Enviar email de confirmación al titular
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
          subject: '✅ Confirmación Recibida - Inspección Vehicular',
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1F2937; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #059669, #10B981); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .success-icon { font-size: 48px; margin-bottom: 10px; }
    .info-box { background: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { background: #1F2937; color: #9CA3AF; padding: 20px; text-align: center; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✅</div>
      <h1 style="margin: 0;">Confirmación Recibida</h1>
      <p style="margin: 10px 0 0 0;">Municipalidad de Lanús</p>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${habPersona.persona.nombre}</strong>,</p>
      <p>Hemos recibido la <strong>confirmación de su asistencia</strong> al turno de inspección vehicular.</p>
      <div class="info-box">
        <p style="margin: 0;"><strong>📋 Detalles del Turno:</strong></p>
        <p style="margin: 10px 0 5px 0;">Licencia: <strong>${turno.habilitaciones_generales?.nro_licencia}</strong></p>
        <p style="margin: 5px 0;">Fecha: <strong>${fechaFormateada}</strong></p>
        <p style="margin: 5px 0 0 0;">Estado: <strong style="color: #059669;">CONFIRMADO ✓</strong></p>
      </div>
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

        console.log('Email de confirmación enviado a:', habPersona.persona.email)
      } catch (emailError) {
        console.error('Error al enviar email de confirmación:', emailError)
        // No fallar la operación si el email falla
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Turno confirmado exitosamente'
    })

  } catch (error) {
    console.error('Error al confirmar turno:', error)
    return NextResponse.json(
      { success: false, error: 'Error al confirmar el turno' },
      { status: 500 }
    )
  }
}
