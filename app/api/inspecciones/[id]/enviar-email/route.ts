import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

/**
 * POST /api/inspecciones/[id]/enviar-email
 * Enviar inspección por email al contribuyente
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const inspeccionId = parseInt(params.id)
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requerido' },
        { status: 400 }
      )
    }

    // Obtener inspección con datos relacionados
    // @ts-ignore
    const inspeccion: any = await prisma.inspecciones.findUnique({
      where: { id: inspeccionId },
      // @ts-ignore
      include: {
        // @ts-ignore
        habilitaciones_generales: {
          // @ts-ignore
          include: {
            // @ts-ignore
            habilitaciones_personas: {
              // @ts-ignore
              include: {
                // @ts-ignore
                persona: true
              }
            },
            // @ts-ignore
            habilitaciones_vehiculos: {
              // @ts-ignore
              include: {
                // @ts-ignore
                vehiculo: true
              }
            }
          }
        }
      }
    })

    if (!inspeccion) {
      return NextResponse.json(
        { success: false, error: 'Inspección no encontrada' },
        { status: 404 }
      )
    }

    const habPersona = inspeccion.habilitaciones_generales?.habilitaciones_personas?.[0]
    const habVehiculo = inspeccion.habilitaciones_generales?.habilitaciones_vehiculos?.[0]
    const titular = habPersona?.persona
    const vehiculo = habVehiculo?.vehiculo

    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    })

    const fechaFormateada = new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Color según resultado
    const colores = {
      APROBADO: { bg: '#10B981', light: '#D1FAE5', border: '#34D399' },
      RECHAZADO: { bg: '#EF4444', light: '#FEE2E2', border: '#F87171' },
      CONDICIONAL: { bg: '#F59E0B', light: '#FEF3C7', border: '#FBBF24' }
    }

    const color = colores[inspeccion.resultado as keyof typeof colores] || colores.APROBADO

    // HTML del email
    const htmlEmail = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:linear-gradient(135deg,#F3F4F6 0%,#E5E7EB 100%);padding:40px 20px}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.15);overflow:hidden}.header{background:linear-gradient(135deg,${color.bg} 0%,${color.bg}CC 100%);padding:50px 30px;text-align:center;position:relative}.header::before{content:'';position:absolute;top:-50%;right:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%)}.badge{width:100px;height:100px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;border:4px solid rgba(255,255,255,0.3);backdrop-filter:blur(10px);position:relative}.icon{font-size:50px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1))}.header h1{color:#fff;font-size:32px;font-weight:700;margin-bottom:8px;text-shadow:0 2px 10px rgba(0,0,0,0.2);position:relative;z-index:1}.header p{color:rgba(255,255,255,0.95);font-size:16px;font-weight:500;position:relative;z-index:1}.content{padding:40px 35px}.greeting{font-size:20px;color:#111827;font-weight:600;margin-bottom:16px}.message{font-size:16px;color:#4B5563;line-height:1.7;margin-bottom:30px}.info-card{background:${color.light};border:2px solid ${color.border};border-radius:16px;padding:30px;margin:30px 0;box-shadow:0 4px 12px rgba(0,0,0,0.05)}.info-card h3{color:${color.bg};font-size:18px;font-weight:700;margin-bottom:20px}.info-row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.1)}.info-row:last-child{border-bottom:none}.info-label{color:#374151;font-weight:600;font-size:15px}.info-value{color:${color.bg};font-weight:700;font-size:16px}.alert-box{background:linear-gradient(135deg,#DBEAFE,#BFDBFE);border-left:5px solid #3B82F6;padding:20px;border-radius:12px;margin:25px 0}.contact-box{background:linear-gradient(135deg,#F3F4F6,#E5E7EB);border-radius:16px;padding:25px;margin-top:30px;border:1px solid #D1D5DB}.footer{background:linear-gradient(135deg,#1F2937,#111827);padding:30px;text-align:center}.footer p{color:#9CA3AF;font-size:13px;line-height:1.6}@media only screen and (max-width:600px){body{padding:20px 10px}.content{padding:30px 20px}.header{padding:40px 20px}.info-row{flex-direction:column;gap:8px}.info-value{text-align:left}}</style></head><body><div class="container"><div class="header"><div class="badge"><div class="icon">${inspeccion.resultado === 'APROBADO' ? '✅' : inspeccion.resultado === 'RECHAZADO' ? '❌' : '⚠️'}</div></div><h1>Inspección ${inspeccion.resultado}</h1><p>Dirección de Movilidad y Transporte</p><p style="font-size:14px;margin-top:5px">Municipalidad de Lanús</p></div><div class="content"><p class="greeting">Estimado/a <strong>${titular?.nombre || 'Titular'}</strong>,</p><p class="message">Le enviamos el resultado de la <strong>Inspección Técnica Vehicular</strong> realizada. Puede descargar el informe completo en PDF desde el enlace al final de este email.</p><div class="info-card"><h3><span>🚗</span> Datos de la Inspección</h3><div class="info-row"><span class="info-label">Licencia</span><span class="info-value">${inspeccion.nro_licencia}</span></div><div class="info-row"><span class="info-label">Patente</span><span class="info-value">${vehiculo?.patente || 'N/A'}</span></div><div class="info-row"><span class="info-label">Vehículo</span><span class="info-value">${vehiculo?.marca || ''} ${vehiculo?.modelo || ''}</span></div><div class="info-row"><span class="info-label">Fecha</span><span class="info-value">${fechaFormateada}</span></div><div class="info-row"><span class="info-label">Inspector</span><span class="info-value">${inspeccion.nombre_inspector}</span></div><div class="info-row" style="border:none;padding-top:20px;margin-top:10px;border-top:2px solid ${color.border}"><span class="info-label">Resultado</span><span class="info-value" style="font-size:18px;text-transform:uppercase">${inspeccion.resultado}</span></div></div>${inspeccion.resultado === 'APROBADO' ? `<div class="alert-box" style="background:linear-gradient(135deg,#D1FAE5,#A7F3D0);border-left:5px solid #10B981"><p style="color:#065F46;font-weight:700;margin-bottom:12px;font-size:16px">✅ Vehículo Aprobado</p><p style="color:#047857;line-height:1.8;margin:0">Su vehículo ha aprobado la inspección técnica. Puede continuar prestando servicios normalmente.</p></div>` : inspeccion.resultado === 'RECHAZADO' ? `<div class="alert-box" style="background:linear-gradient(135deg,#FEE2E2,#FECACA);border-left:5px solid #EF4444"><p style="color:#991B1B;font-weight:700;margin-bottom:12px;font-size:16px">❌ Vehículo Rechazado</p><p style="color:#B91C1C;line-height:1.8;margin:0">Su vehículo NO ha aprobado la inspección. Debe realizar las correcciones necesarias y volver a inspeccionar.</p></div>` : `<div class="alert-box" style="background:linear-gradient(135deg,#FEF3C7,#FDE68A);border-left:5px solid #F59E0B"><p style="color:#92400E;font-weight:700;margin-bottom:12px;font-size:16px">⚠️ Inspección Condicional</p><p style="color:#B45309;line-height:1.8;margin:0">Su vehículo presenta observaciones. Debe realizar las correcciones indicadas en un plazo determinado.</p></div>`}<div style="text-align:center;margin:30px 0"><a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/inspecciones/${inspeccion.id}/pdf" style="display:inline-block;background:linear-gradient(135deg,#2563EB,#3B82F6);color:#fff;padding:15px 40px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 4px 12px rgba(37,99,235,0.3)">📄 Descargar PDF Completo</a></div><div class="contact-box"><p style="color:#111827;font-size:17px;font-weight:700;margin-bottom:15px">📞 Contacto</p><p style="color:#374151;font-size:15px;line-height:1.8;margin:0"><strong>Dirección Gral. de Movilidad y Transporte</strong><br>Municipalidad de Lanús<br><br>📞 Teléfono: <strong>4357-5100 int. 7137</strong><br>📧 Email: <a href="mailto:transportepublicolanus@gmail.com" style="color:#2563EB;text-decoration:none;font-weight:600">transportepublicolanus@gmail.com</a><br><br><span style="color:#6B7280;font-size:14px">⏰ Lunes a Viernes de 8:00 a 16:00 hs</span></p></div></div><div class="footer"><p style="color:#F3F4F6;font-weight:700;font-size:16px;margin-bottom:10px">🏛️ Municipalidad de Lanús</p><p>Dirección General de Movilidad y Transporte</p><p style="margin-top:15px;padding-top:15px;border-top:1px solid #374151">© ${new Date().getFullYear()} Municipalidad de Lanús • Todos los derechos reservados</p></div></div></body></html>`

    // Enviar email
    await transporter.sendMail({
      from: `"Municipalidad de Lanús - Transporte" <${process.env.GMAIL_USER}>`,
      to: email,
      replyTo: 'transportepublicolanus@gmail.com',
      subject: `📋 Inspección ${inspeccion.resultado} - Licencia ${inspeccion.nro_licencia}`,
      html: htmlEmail
    })

    // Log de envío exitoso (la estructura de notificaciones puede variar)
    console.log(`✅ Inspección ${inspeccion.resultado} enviada por email a ${email} - Licencia ${inspeccion.nro_licencia}`)

    return NextResponse.json({
      success: true,
      message: 'Email enviado exitosamente'
    })

  } catch (error) {
    console.error('Error al enviar email de inspección:', error)
    return NextResponse.json(
      { success: false, error: 'Error al enviar email' },
      { status: 500 }
    )
  }
}
