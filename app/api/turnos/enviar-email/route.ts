import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

/**
 * POST /api/turnos/enviar-email
 * Envía email de confirmación de turno
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, nombre, nro_licencia, fecha, hora, tipo_transporte } = body

    // Validaciones
    if (!email || !nombre || !nro_licencia || !fecha || !hora) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos para enviar el email' },
        { status: 400 }
      )
    }

    // Configurar transporter de nodemailer con Gmail
    const transporter = nodemailer.createTransporter({
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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .info-box { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { font-weight: bold; color: #1F2937; min-width: 140px; }
    .info-value { color: #3B82F6; font-weight: 600; }
    .footer { background: #F9FAFB; padding: 20px; text-align: center; color: #6B7280; font-size: 12px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
    .alert { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">🚌 Turno Confirmado</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Municipalidad de Lanús</p>
    </div>
    
    <div class="content">
      <p>Estimado/a <strong>${nombre}</strong>,</p>
      
      <p>Su turno para la inspección vehicular ha sido <strong>confirmado exitosamente</strong>.</p>
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #1F2937;">📋 Detalles del Turno</h3>
        <div class="info-row">
          <span class="info-label">Nro. de Licencia:</span>
          <span class="info-value">${nro_licencia}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tipo de Transporte:</span>
          <span class="info-value">${tipo_transporte}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha:</span>
          <span class="info-value">${fechaFormateada}</span>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <span class="info-label">Hora:</span>
          <span class="info-value">${hora} hs</span>
        </div>
      </div>
      
      <div class="alert">
        <strong>⚠️ Importante:</strong>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Presentarse con <strong>15 minutos de anticipación</strong></li>
          <li>Traer <strong>documentación del vehículo</strong> en regla</li>
          <li>El vehículo debe estar en <strong>condiciones óptimas</strong></li>
          <li>Traer <strong>DNI del titular</strong> y <strong>cédula verde</strong></li>
        </ul>
      </div>
      
      <p style="margin-top: 25px;">Si necesita reprogramar o cancelar su turno, por favor comuníquese con nosotros con anticipación.</p>
      
      <p style="margin-top: 20px; color: #6B7280; font-size: 14px;">
        <strong>Dirección Gral. de Movilidad y Transporte</strong><br>
        Municipalidad de Lanús<br>
        📧 Email: transporte@lanus.gob.ar<br>
        📞 Teléfono: [COMPLETAR]
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">Este es un email automático, por favor no responda a este mensaje.</p>
      <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Municipalidad de Lanús - Todos los derechos reservados</p>
    </div>
  </div>
</body>
</html>
    `

    // Enviar email
    const info = await transporter.sendMail({
      from: `"Municipalidad de Lanús" <${process.env.GMAIL_USER}>`,
      to: email,
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
