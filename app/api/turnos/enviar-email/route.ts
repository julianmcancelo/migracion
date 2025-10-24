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
      vehiculo_modelo,
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
        pass: process.env.GMAIL_APP_PASSWORD, // Contraseña de aplicación de Gmail
      },
    })

    // Formatear fecha y hora
    const fechaFormateada = new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Plantilla HTML del email - Formal e Institucional
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.5; 
      color: #2c3e50;
      background: #f5f5f5;
      padding: 15px;
    }
    .container { 
      max-width: 650px; 
      margin: 0 auto; 
      background: #ffffff;
      border: 1px solid #d1d5db;
      overflow: hidden;
    }
    .header { 
      background: #ffffff;
      color: #2c3e50; 
      padding: 20px;
      text-align: center;
      border-bottom: 3px solid #2563EB;
    }
    .logo { 
      width: 100px; 
      height: auto; 
      margin: 0 auto 12px;
      display: block;
    }
    .municipality-name {
      font-size: 20px;
      font-weight: 700;
      color: #1a202c;
      margin: 8px 0 4px 0;
    }
    .department-name {
      font-size: 14px;
      color: #4a5568;
      margin: 0 0 12px 0;
      font-weight: 500;
    }
    .status-banner {
      background: #2563EB;
      color: white;
      padding: 12px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 12px;
    }
    .content { 
      padding: 25px 20px;
    }
    .greeting { 
      font-size: 15px;
      color: #2c3e50;
      margin-bottom: 12px;
    }
    .message { 
      font-size: 14px;
      color: #4a5568;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .info-card { 
      background: #f8f9fa;
      border: 2px solid #dee2e6;
      padding: 18px;
      margin: 20px 0;
    }
    .info-card-title {
      font-size: 13px;
      font-weight: 700;
      color: #495057;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #dee2e6;
    }
    .info-row { 
      display: flex; 
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
      align-items: center;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { 
      font-weight: 600;
      color: #495057;
      min-width: 140px;
      font-size: 13px;
    }
    .info-value { 
      color: #2c3e50;
      font-weight: 600;
      font-size: 14px;
      flex: 1;
    }
    .buttons-container { 
      text-align: center; 
      margin: 25px 0;
      padding: 18px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
    }
    .button { 
      display: inline-block;
      padding: 12px 24px;
      color: white;
      text-decoration: none;
      margin: 6px 4px;
      font-weight: 600;
      font-size: 13px;
      border: none;
    }
    .button-confirm { 
      background: #10b981;
    }
    .button-cancel { 
      background: #dc2626;
    }
    .button-reschedule { 
      background: #7c3aed;
    }
    .requirements-box { 
      background: #fff9db;
      border: 2px solid #fbbf24;
      padding: 18px;
      margin: 20px 0;
    }
    .requirements-title { 
      color: #92400e;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    .requirement-item {
      margin: 10px 0;
      padding: 12px;
      background: white;
      border-left: 3px solid #fbbf24;
    }
    .requirement-item-title {
      font-size: 13px;
      color: #78350f;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .requirement-item-desc {
      font-size: 12px;
      color: #92400e;
    }
    .contact-box { 
      background: #f8f9fa;
      padding: 18px;
      margin-top: 20px;
      border: 1px solid #dee2e6;
    }
    .contact-box h4 { 
      margin: 0 0 12px 0;
      color: #2c3e50;
      font-size: 15px;
      font-weight: 700;
    }
    .contact-box p { 
      margin: 6px 0;
      color: #4a5568;
      font-size: 13px;
    }
    .contact-box a { 
      color: #2563EB;
      text-decoration: none;
      font-weight: 600;
    }
    .footer { 
      background: #2c3e50;
      color: #cbd5e0;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
    .footer p { margin: 5px 0; }
    .footer a { color: #93c5fd; text-decoration: none; }
    .divider { 
      height: 1px;
      background: #dee2e6;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.lanus.gob.ar/logo-200.png" alt="Municipalidad de Lanús" class="logo" />
      <h1 class="municipality-name">Municipalidad de Lanús</h1>
      <p class="department-name">Dirección General de Movilidad y Transporte</p>
      <div class="status-banner">TURNO CONFIRMADO</div>
    </div>
    
    <div class="content">
      <p class="greeting">Estimado/a <strong>${nombre}</strong>,</p>
      
      <p class="message">
        Su turno para la inspección vehicular ha sido confirmado exitosamente en nuestro sistema.
      </p>
      
      <!-- Datos del Turno -->
      <div class="info-card">
        <div class="info-card-title">📅 Fecha y Hora del Turno</div>
        <div class="info-row">
          <span class="info-label">Fecha:</span>
          <span class="info-value">${fechaFormateada}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Hora:</span>
          <span class="info-value">${hora} hs</span>
        </div>
      </div>

      <!-- Datos del Vehículo -->
      <div class="info-card">
        <div class="info-card-title">🚗 Datos del Vehículo</div>
        <div class="info-row">
          <span class="info-label">N° de Licencia:</span>
          <span class="info-value" style="font-family: monospace;">${nro_licencia}</span>
        </div>
        ${
          vehiculo_patente
            ? `<div class="info-row">
          <span class="info-label">Dominio/Patente:</span>
          <span class="info-value" style="font-family: monospace;">${vehiculo_patente}</span>
        </div>`
            : ''
        }
        ${
          vehiculo_marca || vehiculo_modelo
            ? `<div class="info-row">
          <span class="info-label">Vehículo:</span>
          <span class="info-value">${vehiculo_marca || ''} ${vehiculo_modelo || ''}</span>
        </div>`
            : ''
        }
      </div>

      <!-- Lugar de Inspección -->
      <div class="info-card">
        <div class="info-card-title">📍 Lugar de la Inspección</div>
        <div class="info-row">
          <span class="info-label">Dirección:</span>
          <span class="info-value">Intendente Manuel Quindimil 857 (esq. Jujuy)</span>
        </div>
        <div class="info-row">
          <span class="info-label">Localidad:</span>
          <span class="info-value">Lanús, Buenos Aires</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="buttons-container">
        <p style="margin-bottom: 12px; color: #4a5568; font-size: 13px; font-weight: 600;">
          Gestione su turno:
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/confirmar/${turno_id || 'ID'}" class="button button-confirm">
          Confirmar Asistencia
        </a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/reprogramar/${turno_id || 'ID'}" class="button button-reschedule">
          Reprogramar Turno
        </a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/cancelar/${turno_id || 'ID'}" class="button button-cancel">
          Cancelar Turno
        </a>
      </div>
      
      <div class="divider"></div>
      
      <!-- Documentación Requerida -->
      <div class="requirements-box">
        <div class="requirements-title">⚠️ Documentación Obligatoria</div>
        <div class="requirement-item">
          <div class="requirement-item-title">DNI del Titular</div>
          <div class="requirement-item-desc">Documento Nacional de Identidad vigente</div>
        </div>
        <div class="requirement-item">
          <div class="requirement-item-title">Cédula Verde del Vehículo</div>
          <div class="requirement-item-desc">Título de propiedad del automotor</div>
        </div>
        <div class="requirement-item">
          <div class="requirement-item-title">Puntualidad</div>
          <div class="requirement-item-desc">Presentarse con 15 minutos de anticipación</div>
        </div>
      </div>
      
      <div class="contact-box">
        <h4>Consultas y Asistencia</h4>
        <p><strong>Dirección General de Movilidad y Transporte</strong></p>
        <p>Municipalidad de Lanús</p>
        <div style="margin: 12px 0; padding: 12px; background: white; border: 1px solid #dee2e6;">
          <p style="margin: 4px 0;"><strong>Teléfono:</strong> 4357-5100 interno 7137</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:transportepublicolanus@gmail.com">transportepublicolanus@gmail.com</a></p>
          <p style="margin: 4px 0;"><strong>Web:</strong> <a href="https://www.lanus.gob.ar">www.lanus.gob.ar</a></p>
        </div>
        <p style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #dee2e6; font-size: 12px;">
          <strong>Horario de atención:</strong> Lunes a Viernes de 8:00 a 16:00 hs
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p style="font-weight: 600;">Dirección Gral. de Movilidad y Transporte</p>
      <p>Subsecretaría de Ordenamiento Urbano</p>
      <p style="font-weight: 600;">Municipalidad de Lanús</p>
      <p style="margin-top: 10px;">Para consultas, responda a este email o contáctenos al <a href="tel:43575100">4357-5100</a> int. 7137</p>
      <p style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #4a5568;">
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
      html: htmlContent,
    })

    console.log('Email enviado:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email enviado correctamente',
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error('Error al enviar email:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al enviar email',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
