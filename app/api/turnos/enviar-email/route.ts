import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

/**
 * POST /api/turnos/enviar-email
 * Envía email de confirmación de turno
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      email, 
      nombre, 
      nro_licencia, 
      fecha, 
      hora, 
      tipo_transporte, 
      turno_id,
      dni,
      telefono,
      vehiculo_patente,
      vehiculo_marca,
      vehiculo_modelo
    } = body

    // Validaciones
    if (!email || !nombre || !nro_licencia || !fecha || !hora) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos para enviar el email' },
        { status: 400 }
      )
    }

    // Configurar transporter de nodemailer con Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // tu-email@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD // Contraseña de aplicación de Gmail
      }
    })

    // Formatear fecha y hora
    const fechaFormateada = new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Plantilla HTML del email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      color: #1F2937;
      background: #F3F4F6;
      padding: 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .header { 
      background: #FFFFFF;
      color: #1F2937; 
      padding: 30px 30px 20px 30px;
      text-align: center;
      position: relative;
      border-bottom: 4px solid #2563EB;
    }
    .logo { 
      width: 120px; 
      height: auto; 
      margin: 0 auto 15px;
      display: block;
    }
    .municipality-name {
      font-size: 24px;
      font-weight: 700;
      color: #1F2937;
      margin: 10px 0 5px 0;
    }
    .department-name {
      font-size: 16px;
      color: #6B7280;
      margin: 0 0 5px 0;
      font-weight: 500;
    }
    .header h1 { 
      margin: 0; 
      font-size: 32px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header p { 
      margin: 8px 0 0 0; 
      opacity: 0.95;
      font-size: 16px;
      font-weight: 500;
    }
    .content { 
      padding: 40px 30px;
    }
    .greeting { 
      font-size: 18px;
      color: #111827;
      margin-bottom: 16px;
    }
    .message { 
      font-size: 16px;
      color: #4B5563;
      margin-bottom: 30px;
      line-height: 1.8;
    }
    .info-box { 
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border: 2px solid #3B82F6;
      border-radius: 12px;
      padding: 24px;
      margin: 30px 0;
    }
    .info-box h3 { 
      margin: 0 0 20px 0; 
      color: #1E40AF;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-row { 
      display: flex; 
      padding: 12px 0;
      border-bottom: 1px solid rgba(59, 130, 246, 0.2);
      align-items: center;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { 
      font-weight: 600;
      color: #374151;
      min-width: 160px;
      font-size: 15px;
    }
    .info-value { 
      color: #1E40AF;
      font-weight: 700;
      font-size: 16px;
      flex: 1;
    }
    .buttons-container { 
      text-align: center; 
      margin: 35px 0;
      padding: 20px;
      background: #F9FAFB;
      border-radius: 12px;
    }
    .button { 
      display: inline-block;
      padding: 16px 32px;
      color: white;
      text-decoration: none;
      border-radius: 10px;
      margin: 8px 6px;
      font-weight: 700;
      font-size: 15px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .button-confirm { 
      background: linear-gradient(135deg, #059669, #10B981);
    }
    .button-cancel { 
      background: linear-gradient(135deg, #DC2626, #EF4444);
    }
    .button-reschedule { 
      background: linear-gradient(135deg, #7C3AED, #9333EA);
    }
    .alert { 
      background: linear-gradient(135deg, #FEF3C7, #FDE68A);
      border-left: 5px solid #F59E0B;
      padding: 20px;
      margin: 25px 0;
      border-radius: 10px;
    }
    .alert strong { 
      color: #92400E;
      font-size: 16px;
      display: block;
      margin-bottom: 12px;
    }
    .alert ul { 
      margin: 12px 0 0 0;
      padding-left: 24px;
      color: #78350F;
    }
    .alert li { 
      margin: 8px 0;
      line-height: 1.6;
    }
    .contact-box { 
      background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
      padding: 28px;
      border-radius: 12px;
      margin-top: 30px;
      border: 2px solid #D1D5DB;
    }
    .contact-box h4 { 
      margin: 0 0 16px 0;
      color: #111827;
      font-size: 18px;
      font-weight: 700;
    }
    .contact-box p { 
      margin: 8px 0;
      color: #374151;
      font-size: 15px;
    }
    .contact-box a { 
      color: #2563EB;
      text-decoration: none;
      font-weight: 600;
    }
    .footer { 
      background: #1F2937;
      color: #9CA3AF;
      padding: 30px;
      text-align: center;
      font-size: 13px;
    }
    .footer p { margin: 8px 0; }
    .footer a { color: #60A5FA; text-decoration: none; }
    .divider { 
      height: 1px;
      background: linear-gradient(to right, transparent, #E5E7EB, transparent);
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.lanus.gob.ar/logo-200.png" alt="Municipalidad de Lanús" class="logo" />
      <h1 class="municipality-name">Municipalidad de Lanús</h1>
      <p class="department-name">Dirección General de Movilidad y Transporte</p>
      <div style="background: linear-gradient(135deg, #2563EB, #3B82F6); color: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
        <strong style="font-size: 20px;">✅ Turno Confirmado</strong>
      </div>
    </div>
    
    <div class="content">
      <p class="greeting">Estimado/a <strong>${nombre}</strong>,</p>
      
      <p class="message" style="font-size: 17px; line-height: 1.8; margin-bottom: 35px;">
        Su turno para la <strong>inspección vehicular</strong> ha sido confirmado exitosamente en nuestro sistema.
      </p>
      
      <!-- Card de Fecha y Hora -->
      <div style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border: 3px solid #3B82F6; border-radius: 16px; padding: 40px; margin: 30px 0; text-align: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);">
        <div style="font-size: 48px; margin-bottom: 15px;">📅</div>
        <div style="font-size: 16px; color: #1E40AF; font-weight: 700; letter-spacing: 1px; margin-bottom: 15px;">FECHA Y HORA DEL TURNO</div>
        <div style="font-size: 22px; color: #1E3A8A; font-weight: 700; margin-bottom: 20px; line-height: 1.6;">
          ${fechaFormateada}
        </div>
        <div style="background: white; border-radius: 12px; padding: 20px; display: inline-block; margin-top: 10px;">
          <div style="font-size: 18px; color: #1E40AF; font-weight: 600; margin-bottom: 8px;">Horario</div>
          <div style="font-size: 36px; color: #1E3A8A; font-weight: 700;">⏰ ${hora} hs</div>
        </div>
      </div>

      <!-- Card de Licencia y Vehículo -->
      <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 3px solid #F59E0B; border-radius: 16px; padding: 40px; margin: 30px 0; text-align: center; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);">
        <div style="font-size: 48px; margin-bottom: 15px;">🚗</div>
        <div style="font-size: 16px; color: #92400E; font-weight: 700; letter-spacing: 1px; margin-bottom: 15px;">DATOS DEL VEHÍCULO</div>
        <div style="background: white; border-radius: 12px; padding: 25px; margin: 20px auto; max-width: 400px;">
          <div style="font-size: 15px; color: #92400E; font-weight: 600; margin-bottom: 10px;">N° de Licencia</div>
          <div style="font-size: 28px; color: #78350F; font-weight: 700; font-family: monospace; letter-spacing: 2px;">${nro_licencia}</div>
          ${vehiculo_patente ? `
          <div style="border-top: 2px solid #FDE68A; margin: 20px 0; padding-top: 20px;">
            <div style="font-size: 15px; color: #92400E; font-weight: 600; margin-bottom: 10px;">Dominio/Patente</div>
            <div style="font-size: 32px; color: #78350F; font-weight: 700; font-family: monospace; letter-spacing: 3px;">${vehiculo_patente}</div>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Dirección con Mapa -->
      <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 3px solid #10B981; border-radius: 16px; padding: 40px; margin: 30px 0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 48px; margin-bottom: 15px;">📍</div>
          <div style="font-size: 16px; color: #065F46; font-weight: 700; letter-spacing: 1px; margin-bottom: 20px;">LUGAR DE LA INSPECCIÓN</div>
        </div>
        <div style="background: white; border-radius: 12px; padding: 30px; text-align: center;">
          <div style="font-size: 24px; color: #047857; font-weight: 700; line-height: 1.5; margin-bottom: 10px;">
            INTENDENTE MANUEL QUINDIMIL 857
          </div>
          <div style="font-size: 18px; color: #065F46; font-weight: 600; margin-top: 8px;">
            (ESQUINA JUJUY)
          </div>
          <div style="font-size: 16px; color: #6B7280; margin-top: 15px; padding-top: 15px; border-top: 2px solid #DCFCE7;">
            📍 Lanús, Buenos Aires
          </div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="buttons-container">
        <p style="margin-bottom: 16px; color: #6B7280; font-size: 14px;">
          <strong>Gestione su turno:</strong>
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/confirmar/${turno_id || 'ID'}" class="button button-confirm">
          ✅ Confirmar Asistencia
        </a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/reprogramar/${turno_id || 'ID'}" class="button button-reschedule">
          📅 Reprogramar Turno
        </a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/cancelar/${turno_id || 'ID'}" class="button button-cancel">
          ❌ Cancelar Turno
        </a>
      </div>
      
      <div class="divider"></div>
      
      <!-- Requisitos -->
      <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 3px solid #F59E0B; border-radius: 16px; padding: 35px; margin: 30px 0;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 42px; margin-bottom: 10px;">⚠️</div>
          <div style="font-size: 18px; color: #92400E; font-weight: 700; letter-spacing: 0.5px;">DOCUMENTACIÓN OBLIGATORIA</div>
        </div>
        <div style="background: white; border-radius: 12px; padding: 30px;">
          <div style="margin-bottom: 20px; padding: 18px; background: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px;">
            <div style="font-size: 17px; color: #92400E; font-weight: 700; margin-bottom: 5px;">📄 DNI del Titular</div>
            <div style="font-size: 14px; color: #78350F;">Documento Nacional de Identidad vigente</div>
          </div>
          <div style="margin-bottom: 20px; padding: 18px; background: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px;">
            <div style="font-size: 17px; color: #92400E; font-weight: 700; margin-bottom: 5px;">🚗 Cédula Verde del Vehículo</div>
            <div style="font-size: 14px; color: #78350F;">Título de propiedad del automotor</div>
          </div>
          <div style="padding: 18px; background: #DBEAFE; border-left: 4px solid #3B82F6; border-radius: 8px;">
            <div style="font-size: 17px; color: #1E40AF; font-weight: 700; margin-bottom: 5px;">⏰ Puntualidad</div>
            <div style="font-size: 14px; color: #1E3A8A;">Presentarse con <strong>15 minutos de anticipación</strong></div>
          </div>
        </div>
      </div>
      
      <div class="contact-box">
        <h4>📞 Consultas y Asistencia</h4>
        <p><strong>Dirección General de Movilidad y Transporte</strong></p>
        <p>Municipalidad de Lanús</p>
        <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 8px;">
          <p style="margin: 5px 0;">📞 <strong>Teléfono:</strong> 4357-5100 interno 7137</p>
          <p style="margin: 5px 0;">📧 <strong>Email:</strong> <a href="mailto:transportepublicolanus@gmail.com">transportepublicolanus@gmail.com</a></p>
          <p style="margin: 5px 0;">🌐 <strong>Web:</strong> <a href="https://www.lanus.gob.ar">www.lanus.gob.ar</a></p>
        </div>
        <p style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #D1D5DB; font-size: 14px; color: #6B7280;">
          ⏰ <strong>Horario de atención:</strong> Lunes a Viernes de 8:00 a 16:00 hs
        </p>
        <p style="font-size: 13px; color: #9CA3AF; margin-top: 12px;">
          Para consultas fuera del horario de atención, envíenos un email y le responderemos a la brevedad.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p style="font-weight: 600; margin-bottom: 4px;">Dirección Gral. de Movilidad y Transporte</p>
      <p style="margin: 4px 0;">Subsecretaría de Ordenamiento Urbano</p>
      <p style="margin: 4px 0; font-weight: 600;">Municipalidad de Lanús</p>
      <p style="margin-top: 12px;">Para consultas, responda a este email o contáctenos al <a href="tel:43575100">4357-5100</a> int. 7137</p>
      <p style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #374151;">
        © ${new Date().getFullYear()} Municipalidad de Lanús • Todos los derechos reservados
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Enviar email
    const info = await transporter.sendMail({
      from: `"Municipalidad de Lanús" <${process.env.GMAIL_USER}>`,
      to: email,
      replyTo: 'transportepublicolanus@gmail.com',
      subject: `✅ Turno Confirmado - Inspección Vehicular - Licencia ${nro_licencia}`,
      html: htmlContent
    })

    console.log('Email enviado:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email enviado correctamente',
      messageId: info.messageId
    })

  } catch (error: any) {
    console.error('Error al enviar email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al enviar email',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
