import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

/**
 * POST /api/turnos/[id]/reenviar-notificacion
 * Reenvía la notificación por email de un turno
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const turnoId = parseInt(params.id)

    // Obtener el turno con toda la información necesaria
    const turno = await prisma.turnos.findUnique({
      where: { id: turnoId },
      include: {
        habilitacion: {
          select: {
            nro_licencia: true,
            tipo_transporte: true,
            habilitaciones_personas: {
              where: {
                rol: 'TITULAR'
              },
              select: {
                persona: {
                  select: {
                    nombre: true,
                    email: true
                  }
                }
              },
              take: 1
            },
            habilitaciones_vehiculos: {
              select: {
                vehiculo: {
                  select: {
                    dominio: true
                  }
                }
              },
              take: 1
            }
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

    const titular = turno.habilitacion?.habilitaciones_personas?.[0]?.persona
    const vehiculo = turno.habilitacion?.habilitaciones_vehiculos?.[0]?.vehiculo

    if (!titular?.email) {
      return NextResponse.json(
        { success: false, error: 'No se encontró email del titular' },
        { status: 400 }
      )
    }

    // Configurar nodemailer
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

    const horaFormateada = new Date(`1970-01-01T${turno.hora}`).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Enviar email
    await transporter.sendMail({
      from: `"Municipalidad de Lanús - Transporte" <${process.env.GMAIL_USER}>`,
      to: titular.email,
      subject: '📅 Recordatorio: Turno de Inspección Vehicular - Lanús',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #E5E7EB; }
    .info-box { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E7EB; }
    .info-label { font-weight: 600; color: #4B5563; }
    .info-value { color: #1F2937; font-weight: 500; }
    .btn { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .btn-secondary { background: #6B7280; }
    .footer { background: #F3F4F6; padding: 20px; text-align: center; font-size: 12px; color: #6B7280; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Turno de Inspección Vehicular</h1>
      <p>Dirección de Movilidad y Transporte</p>
      <p style="font-size: 14px; margin-top: 5px;">Municipalidad de Lanús</p>
    </div>
    
    <div class="content">
      <p style="font-size: 18px; margin-bottom: 10px;">Estimado/a <strong>${titular.nombre}</strong>,</p>
      
      <p>Le recordamos que tiene un turno programado para la inspección vehicular:</p>
      
      <div class="info-box">
        <h3 style="margin: 0 0 15px 0; color: #1F2937;">📋 Detalles del Turno</h3>
        <div class="info-row">
          <span class="info-label">Fecha:</span>
          <span class="info-value">${fechaFormateada}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Hora:</span>
          <span class="info-value">${horaFormateada}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Nro. Licencia:</span>
          <span class="info-value">${turno.habilitacion?.nro_licencia || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Dominio:</span>
          <span class="info-value">${vehiculo?.dominio || 'N/A'}</span>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <span class="info-label">Tipo:</span>
          <span class="info-value">${turno.habilitacion?.tipo_transporte || 'N/A'}</span>
        </div>
      </div>

      <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0 0 10px 0; color: #92400E;"><strong>⚠️ Importante:</strong> Por favor llegue 10 minutos antes de su turno con toda la documentación requerida.</p>
        <p style="margin: 5px 0; color: #92400E;"><strong>📄 Documentación Obligatoria:</strong></p>
        <ul style="margin: 5px 0; padding-left: 20px; color: #92400E;">
          <li>DNI del titular</li>
          <li>Cédula Verde del vehículo</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/confirmar/${turno.id}" class="btn">✅ Confirmar Asistencia</a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/cancelar/${turno.id}" class="btn btn-secondary">❌ Cancelar Turno</a>
      </div>

      <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin-top: 20px;">
        <h3 style="color: #1F2937; margin: 0 0 15px 0;">📍 Ubicación de Inspección</h3>
        <p style="margin: 5px 0; font-size: 15px;"><strong>Dirección:</strong> Intendente Manuel Quindimil 857, esquina Jujuy, Lanús</p>
        <p style="margin: 15px 0 5px 0; color: #4B5563;"><strong>Por dudas o reprogramaciones, comuníquese a:</strong></p>
        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:transportepublicolanus@gmail.com" style="color: #3B82F6;">transportepublicolanus@gmail.com</a></p>
        <div style="background: #DBEAFE; padding: 12px; border-radius: 6px; margin-top: 15px;">
          <p style="margin: 0; color: #1E40AF; font-weight: 600;">📧 Por favor, confirme su asistencia respondiendo este correo.</p>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p style="font-weight: 600; margin-bottom: 8px;">Dirección Gral. de Movilidad y Transporte</p>
      <p style="margin: 4px 0;">Subsecretaría de Ordenamiento Urbano</p>
      <p style="margin: 4px 0; font-weight: 600;">Municipalidad de Lanús</p>
      <p style="margin-top: 12px; font-size: 11px; color: #9CA3AF;">Este es un correo electrónico automático. Para consultas, responda a este correo o contáctenos al email indicado.</p>
    </div>
  </div>
</body>
</html>`
    })

    // Actualizar flag de recordatorio enviado
    await prisma.turnos.update({
      where: { id: turnoId },
      data: { recordatorio_enviado: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Notificación reenviada exitosamente'
    })

  } catch (error) {
    console.error('Error al reenviar notificación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al reenviar notificación' },
      { status: 500 }
    )
  }
}
