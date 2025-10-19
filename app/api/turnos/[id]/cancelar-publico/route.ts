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
      where: { id: turnoId },
      include: {
        habilitacion: {
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
        titulo: `Turno cancelado - Lic. ${turno.habilitacion?.nro_licencia || turnoId}`,
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
          html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:linear-gradient(135deg,#FEF2F2 0%,#FEE2E2 100%);padding:40px 20px}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.15);overflow:hidden}.header{background:linear-gradient(135deg,#DC2626 0%,#EF4444 50%,#F87171 100%);padding:50px 30px;text-align:center;position:relative}.header::before{content:'';position:absolute;top:-50%;right:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%)}.cancel-badge{width:100px;height:100px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;border:4px solid rgba(255,255,255,0.3);backdrop-filter:blur(10px);position:relative}.cancel-icon{font-size:50px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1))}.header h1{color:#fff;font-size:32px;font-weight:700;margin-bottom:8px;text-shadow:0 2px 10px rgba(0,0,0,0.2);position:relative;z-index:1}.header p{color:rgba(255,255,255,0.95);font-size:16px;font-weight:500;position:relative;z-index:1}.content{padding:40px 35px}.greeting{font-size:20px;color:#111827;font-weight:600;margin-bottom:16px}.message{font-size:16px;color:#4B5563;line-height:1.7;margin-bottom:30px}.info-card{background:linear-gradient(135deg,#FEF2F2 0%,#FEE2E2 100%);border:2px solid#EF4444;border-radius:16px;padding:30px;margin:30px 0;box-shadow:0 4px 12px rgba(239,68,68,0.1)}.info-card h3{color:#DC2626;font-size:18px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:10px}.info-row{display:flex;justify-between:space-between;padding:14px 0;border-bottom:1px solid rgba(239,68,68,0.2)}.info-row:last-child{border-bottom:none}.info-label{color:#374151;font-weight:600;font-size:15px}.info-value{color:#DC2626;font-weight:700;font-size:16px}.status-badge{display:inline-block;background:linear-gradient(135deg,#DC2626,#EF4444);color:#fff;padding:8px 20px;border-radius:20px;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(239,68,68,0.3)}.info-box{background:linear-gradient(135deg,#DBEAFE,#BFDBFE);border-left:5px solid #3B82F6;padding:20px;border-radius:12px;margin:25px 0}.contact-box{background:linear-gradient(135deg,#F3F4F6,#E5E7EB);border-radius:16px;padding:25px;margin-top:30px;border:1px solid #D1D5DB}.footer{background:linear-gradient(135deg,#1F2937,#111827);padding:30px;text-align:center}.footer p{color:#9CA3AF;font-size:13px;line-height:1.6}@media only screen and (max-width:600px){body{padding:20px 10px}.content{padding:30px 20px}.header{padding:40px 20px}.info-row{flex-direction:column;gap:8px}.info-value{text-align:left}}</style></head><body><div class="container"><div class="header"><div class="cancel-badge"><div class="cancel-icon">❌</div></div><h1>Turno Cancelado</h1><p>Dirección de Movilidad y Transporte</p><p style="font-size:14px;margin-top:5px">Municipalidad de Lanús</p></div><div class="content"><p class="greeting">Estimado/a <strong>${habPersona.persona.nombre}</strong>,</p><p class="message">Hemos recibido y procesado la <strong>cancelación de su turno</strong> de inspección vehicular. El horario ha quedado liberado en nuestro sistema.</p><div class="info-card"><h3><span>📋</span> Turno Cancelado</h3><div class="info-row"><span class="info-label">Nro. de Licencia</span><span class="info-value">${turno.habilitacion?.nro_licencia}</span></div><div class="info-row"><span class="info-label">Tipo de Vehículo</span><span class="info-value">${turno.habilitacion?.tipo_transporte || 'N/A'}</span></div><div class="info-row"><span class="info-label">Fecha Original</span><span class="info-value">${fechaFormateada}</span></div><div class="info-row" style="border-bottom:none"><span class="info-label">Estado</span><span class="status-badge">CANCELADO</span></div></div><div class="info-box"><p style="margin:0;color:#1E40AF;font-size:15px;line-height:1.6">💡 <strong>¿Necesita un nuevo turno?</strong> Puede solicitarlo nuevamente ingresando a su panel con su número de licencia.</p></div><div class="contact-box"><h3 style="color:#374151;font-size:16px;font-weight:700;margin-bottom:15px">📞 ¿Necesita ayuda?</h3><p style="color:#6B7280;font-size:14px;line-height:1.6;margin-bottom:10px">Si tiene alguna consulta o necesita asistencia:</p><p style="color:#374151;font-size:14px;margin:8px 0"><strong>Email:</strong> <a href="mailto:transportepublicolanus@gmail.com" style="color:#3B82F6;text-decoration:none">transportepublicolanus@gmail.com</a></p><p style="color:#374151;font-size:14px;margin:8px 0"><strong>Dirección:</strong> Avda. Hipólito Yrigoyen 3863, Lanús Oeste</p></div></div><div class="footer"><p>Este es un correo electrónico automático, por favor no responda a este mensaje.</p><p style="margin-top:8px">© 2025 Municipalidad de Lanús - Dirección de Movilidad y Transporte</p></div></div></body></html>`
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
