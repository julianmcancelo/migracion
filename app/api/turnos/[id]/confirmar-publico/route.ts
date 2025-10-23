import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

/**
 * POST /api/turnos/[id]/confirmar-publico
 * Confirmar turno desde email (no requiere autenticación)
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
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
            tipo_transporte: true,
          },
        },
      },
    })

    if (!turno) {
      return NextResponse.json({ success: false, error: 'Turno no encontrado' }, { status: 404 })
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
      data: { estado: 'CONFIRMADO' },
    })

    // Crear registro de inspección automáticamente
    const inspeccionExistente = await prisma.inspecciones.findFirst({
      where: {
        habilitacion_id: turno.habilitacion_id,
        nro_licencia: turno.habilitacion?.nro_licencia || 'SIN_NUMERO',
      },
    })

    if (!inspeccionExistente) {
      await prisma.inspecciones.create({
        data: {
          habilitacion_id: turno.habilitacion_id,
          nro_licencia: turno.habilitacion?.nro_licencia || 'SIN_NUMERO',
          nombre_inspector: 'PENDIENTE',
          firma_digital: '',
          fecha_inspeccion: new Date(turno.fecha),
          tipo_transporte: turno.habilitacion?.tipo_transporte || null,
          firma_inspector: '',
          firma_contribuyente: null,
          email_contribuyente: null,
          resultado: 'PENDIENTE',
        },
      })
    }

    // Crear notificación para el sistema
    await prisma.notificaciones.create({
      data: {
        dni_usuario: 'SISTEMA',
        tipo: 'TURNO_CONFIRMADO',
        titulo: `Turno confirmado - Lic. ${turno.habilitacion?.nro_licencia || turnoId}`,
        texto: `El titular ha confirmado su asistencia al turno del ${new Date(turno.fecha).toLocaleDateString('es-AR')}. Inspección creada automáticamente.`,
        leida: false,
      },
    })

    // Obtener email del titular para enviar confirmación
    // 
    const habPersona: any = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: turno.habilitacion_id,
        rol: 'TITULAR',
      },
      // 
      include: {
        persona: true,
      },
    })

    // Enviar email de confirmación al titular
    if (habPersona?.persona?.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        })

        const fechaFormateada = new Date(turno.fecha).toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        await transporter.sendMail({
          from: `"Municipalidad de Lanús - Transporte" <${process.env.GMAIL_USER}>`,
          to: habPersona.persona.email,
          replyTo: 'transportepublicolanus@gmail.com',
          subject: '✅ Turno Confirmado - Inspección Vehicular - Lanús',
          html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:linear-gradient(135deg,#F0FDF4 0%,#DCFCE7 100%);padding:40px 20px}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.15);overflow:hidden}.header{background:linear-gradient(135deg,#059669 0%,#10B981 50%,#34D399 100%);padding:50px 30px;text-align:center;position:relative}.header::before{content:'';position:absolute;top:-50%;right:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%)}.success-badge{width:100px;height:100px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;border:4px solid rgba(255,255,255,0.3);backdrop-filter:blur(10px);position:relative}.success-icon{font-size:50px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1))}.header h1{color:#fff;font-size:32px;font-weight:700;margin-bottom:8px;text-shadow:0 2px 10px rgba(0,0,0,0.2);position:relative;z-index:1}.header p{color:rgba(255,255,255,0.95);font-size:16px;font-weight:500;position:relative;z-index:1}.content{padding:40px 35px}.greeting{font-size:20px;color:#111827;font-weight:600;margin-bottom:16px}.message{font-size:16px;color:#4B5563;line-height:1.7;margin-bottom:30px}.info-card{background:linear-gradient(135deg,#F0FDF4 0%,#DCFCE7 100%);border:2px solid #10B981;border-radius:16px;padding:30px;margin:30px 0;box-shadow:0 4px 12px rgba(16,185,129,0.1)}.info-card h3{color:#059669;font-size:18px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:10px}.info-row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(16,185,129,0.2)}.info-row:last-child{border-bottom:none}.info-label{color:#374151;font-weight:600;font-size:15px}.info-value{color:#059669;font-weight:700;font-size:16px}.status-badge{display:inline-block;background:linear-gradient(135deg,#059669,#10B981);color:#fff;padding:8px 20px;border-radius:20px;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(16,185,129,0.3)}.alert-box{background:linear-gradient(135deg,#FEF3C7,#FDE68A);border-left:5px solid #F59E0B;padding:20px;border-radius:12px;margin:25px 0}.contact-box{background:linear-gradient(135deg,#F3F4F6,#E5E7EB);border-radius:16px;padding:25px;margin-top:30px;border:1px solid #D1D5DB}.footer{background:linear-gradient(135deg,#1F2937,#111827);padding:30px;text-align:center}.footer p{color:#9CA3AF;font-size:13px;line-height:1.6}@media only screen and (max-width:600px){body{padding:20px 10px}.content{padding:30px 20px}.header{padding:40px 20px}.info-row{flex-direction:column;gap:8px}.info-value{text-align:left}}</style></head><body><div class="container"><div class="header"><div class="success-badge"><div class="success-icon">✅</div></div><h1>¡Confirmación Recibida!</h1><p>Dirección de Movilidad y Transporte</p><p style="font-size:14px;margin-top:5px">Municipalidad de Lanús</p></div><div class="content"><p class="greeting">Estimado/a <strong>${habPersona.persona.nombre}</strong>,</p><p class="message">Hemos registrado exitosamente la <strong>confirmación de su asistencia</strong> al turno de inspección vehicular. Su turno está confirmado y lo esperamos en la fecha y hora acordada.</p><div class="info-card"><h3><span>📋</span> Detalles del Turno</h3><div class="info-row"><span class="info-label">Nro. de Licencia</span><span class="info-value">${turno.habilitacion?.nro_licencia}</span></div><div class="info-row"><span class="info-label">Tipo de Vehículo</span><span class="info-value">${turno.habilitacion?.tipo_transporte || 'N/A'}</span></div><div class="info-row"><span class="info-label">Fecha</span><span class="info-value">${fechaFormateada}</span></div><div class="info-row" style="border:none;padding-top:20px;margin-top:10px;border-top:2px solid #10B981"><span class="info-label">Estado del Turno</span><span class="status-badge">✓ CONFIRMADO</span></div></div><div class="alert-box"><p style="color:#92400E;font-weight:700;margin-bottom:12px;font-size:16px">⚠️ Recordatorios Importantes</p><ul style="color:#78350F;margin:0;padding-left:20px;line-height:1.8"><li>Presentarse con <strong>15 minutos de anticipación</strong></li><li>Traer <strong>DNI del titular y cédula verde</strong></li><li>El vehículo debe estar en <strong>condiciones óptimas</strong></li><li>Documentación del vehículo <strong>al día</strong></li></ul></div><div class="contact-box"><p style="color:#111827;font-size:17px;font-weight:700;margin-bottom:15px">📞 ¿Necesita Ayuda?</p><p style="color:#374151;font-size:15px;line-height:1.8;margin:0"><strong>Dirección Gral. de Movilidad y Transporte</strong><br>Municipalidad de Lanús<br><br>📞 Teléfono: <strong>4357-5100 int. 7137</strong><br>📧 Email: <a href="mailto:transportepublicolanus@gmail.com" style="color:#2563EB;text-decoration:none;font-weight:600">transportepublicolanus@gmail.com</a><br><br><span style="color:#6B7280;font-size:14px">⏰ Lunes a Viernes de 8:00 a 16:00 hs</span></p></div></div><div class="footer"><p style="color:#F3F4F6;font-weight:700;font-size:16px;margin-bottom:10px">🏛️ Municipalidad de Lanús</p><p>Dirección General de Movilidad y Transporte</p><p style="margin-top:15px;padding-top:15px;border-top:1px solid #374151">© ${new Date().getFullYear()} Municipalidad de Lanús • Todos los derechos reservados</p></div></div></body></html>`,
        })

        console.log('Email de confirmación enviado a:', habPersona.persona.email)
      } catch (emailError) {
        console.error('Error al enviar email de confirmación:', emailError)
        // No fallar la operación si el email falla
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Turno confirmado exitosamente',
    })
  } catch (error) {
    console.error('Error al confirmar turno:', error)
    return NextResponse.json(
      { success: false, error: 'Error al confirmar el turno' },
      { status: 500 }
    )
  }
}
