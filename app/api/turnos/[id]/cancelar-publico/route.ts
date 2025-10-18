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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1F2937; background: #F3F4F6; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .header { background: #FFFFFF; color: #1F2937; padding: 30px; text-align: center; border-bottom: 4px solid #DC2626; }
    .logo { width: 120px; height: auto; margin: 0 auto 15px; display: block; }
    .cancel-badge { background: linear-gradient(135deg, #DC2626, #EF4444); color: white; padding: 15px; border-radius: 8px; margin-top: 15px; }
    .content { padding: 40px 30px; }
    .info-box { background: #FEF2F2; border: 2px solid #DC2626; border-radius: 12px; padding: 24px; margin: 30px 0; }
    .info-row { padding: 12px 0; border-bottom: 1px solid rgba(220, 38, 38, 0.2); }
    .info-row:last-child { border-bottom: none; }
    .new-turno-box { background: #DBEAFE; border: 2px solid #3B82F6; border-radius: 10px; padding: 20px; margin: 25px 0; }
    .contact-box { background: #F3F4F6; padding: 28px; border-radius: 12px; margin-top: 30px; }
    .footer { background: #1F2937; color: #9CA3AF; padding: 30px; text-align: center; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.lanus.gob.ar/logo-200.png" alt="Municipalidad de Lanús" class="logo" />
      <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 10px 0 5px 0;">Municipalidad de Lanús</h1>
      <p style="font-size: 16px; color: #6B7280; margin: 0;">Dirección General de Movilidad y Transporte</p>
      <div class="cancel-badge">
        <strong style="font-size: 20px;">❌ Turno Cancelado</strong>
      </div>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #111827; margin-bottom: 16px;">Estimado/a <strong>${habPersona.persona.nombre}</strong>,</p>
      <p style="font-size: 16px; color: #4B5563; margin-bottom: 30px; line-height: 1.8;">
        Hemos recibido y procesado la <strong>cancelación de su turno</strong> de inspección vehicular. El turno ha sido eliminado de nuestro sistema.
      </p>
      
      <div class="info-box">
        <h3 style="margin: 0 0 20px 0; color: #DC2626; font-size: 20px; font-weight: 700;">📋 Turno Cancelado</h3>
        <div class="info-row">
          <strong style="color: #374151;">Nro. de Licencia:</strong>
          <span style="color: #DC2626; font-weight: 700; margin-left: 10px;">${turno.habilitaciones_generales?.nro_licencia}</span>
        </div>
        <div class="info-row">
          <strong style="color: #374151;">Fecha original:</strong>
          <span style="color: #DC2626; font-weight: 700; margin-left: 10px;">${fechaFormateada}</span>
        </div>
        <div class="info-row">
          <strong style="color: #374151;">Estado:</strong>
          <span style="color: #DC2626; font-weight: 700; margin-left: 10px;">CANCELADO</span>
        </div>
      </div>
      
      <div class="new-turno-box">
        <strong style="color: #1E40AF; font-size: 16px; display: block; margin-bottom: 12px;">📅 ¿Necesita un Nuevo Turno?</strong>
        <p style="margin: 8px 0; color: #374151; line-height: 1.6;">
          Puede solicitar un nuevo turno cuando lo necesite comunicándose con nosotros por cualquiera de nuestros canales de atención.
        </p>
        <p style="margin: 8px 0; color: #374151; line-height: 1.6;">
          <strong>Horario de atención:</strong> Lunes a Viernes de 8:00 a 16:00 hs
        </p>
      </div>
      
      <div class="contact-box">
        <h4 style="margin: 0 0 16px 0; color: #111827; font-size: 18px;">📞 Contacto</h4>
        <p style="margin: 8px 0; color: #374151;">📞 Teléfono: <strong>4357-5100 int. 7137</strong></p>
        <p style="margin: 8px 0; color: #374151;">📧 Email: <a href="mailto:transportepublicolanus@gmail.com" style="color: #2563EB; text-decoration: none;">transportepublicolanus@gmail.com</a></p>
        <p style="margin: 8px 0; color: #374151;">🌐 Web: <a href="https://www.lanus.gob.ar" style="color: #2563EB; text-decoration: none;">www.lanus.gob.ar</a></p>
        <p style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #D1D5DB; font-size: 14px; color: #6B7280;">
          📍 Av. Hipólito Yrigoyen 3863, Lanús Oeste - CP: 1824
        </p>
      </div>
    </div>
    <div class="footer">
      <p><strong>Municipalidad de Lanús</strong></p>
      <p style="margin-top: 8px;">Dirección General de Movilidad y Transporte</p>
      <p style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #374151;">
        © ${new Date().getFullYear()} Municipalidad de Lanús • Todos los derechos reservados
      </p>
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
