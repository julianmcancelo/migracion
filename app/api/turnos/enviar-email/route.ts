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

    // Plantilla HTML del email - Ultra Simple y Responsive
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6; 
      color: #333;
      background: #fff;
      padding: 20px;
      margin: 0;
    }
    table { 
      max-width: 600px; 
      width: 100%;
      margin: 0 auto;
      border-collapse: collapse;
    }
    h1 { 
      font-size: 18px;
      color: #000;
      margin: 0 0 5px 0;
    }
    h2 { 
      font-size: 14px;
      color: #666;
      font-weight: normal;
      margin: 0 0 15px 0;
    }
    h3 {
      font-size: 13px;
      color: #000;
      font-weight: bold;
      margin: 20px 0 8px 0;
      text-transform: uppercase;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    p { 
      margin: 8px 0;
      font-size: 14px;
    }
    strong { color: #000; }
    a { 
      color: #0066cc;
      text-decoration: none;
    }
    .btn { 
      display: inline-block;
      padding: 8px 16px;
      margin: 5px;
      background: #0066cc;
      color: #fff !important;
      text-decoration: none;
      font-size: 12px;
      border-radius: 3px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      font-size: 11px;
      color: #666;
      text-align: center;
    }
    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <td style="text-align: center; padding: 20px 0;">
        <img src="https://www.lanus.gob.ar/logo-200.png" alt="Municipalidad de Lanús" width="80" />
        <h1>Municipalidad de Lanús</h1>
        <h2>Dirección General de Movilidad y Transporte</h2>
      </td>
    </tr>
    <tr>
      <td>
        <p>Estimado/a <strong>${nombre}</strong>,</p>
        <p>Su turno para la inspección vehicular ha sido confirmado exitosamente.</p>
        
        <h3>Fecha y Hora</h3>
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <p><strong>Hora:</strong> ${hora} hs</p>

        <h3>Datos del Vehículo</h3>
        <p><strong>N° de Licencia:</strong> ${nro_licencia}</p>
        ${vehiculo_patente ? `<p><strong>Dominio:</strong> ${vehiculo_patente}</p>` : ''}
        ${vehiculo_marca || vehiculo_modelo ? `<p><strong>Vehículo:</strong> ${vehiculo_marca || ''} ${vehiculo_modelo || ''}</p>` : ''}

        <h3>Lugar de Inspección</h3>
        <p><strong>Dirección:</strong> Intendente Manuel Quindimil 857 (esq. Jujuy), Lanús, Buenos Aires</p>
        
        <hr>
        
        <div style="text-align: center; margin: 20px 0;">
          <p style="margin-bottom: 10px;"><strong>Gestione su turno:</strong></p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/confirmar/${turno_id || 'ID'}" class="btn">Confirmar</a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/reprogramar/${turno_id || 'ID'}" class="btn">Reprogramar</a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/cancelar/${turno_id || 'ID'}" class="btn" style="background: #dc2626;">Cancelar</a>
        </div>
        
        <h3>Documentación Obligatoria</h3>
        <p>• DNI del Titular (Documento vigente)</p>
        <p>• Cédula Verde del Vehículo</p>
        <p>• Presentarse con 15 minutos de anticipación</p>
        
        <h3>Consultas</h3>
        <p><strong>Teléfono:</strong> 4357-5100 interno 7137</p>
        <p><strong>Email:</strong> <a href="mailto:transportepublicolanus@gmail.com">transportepublicolanus@gmail.com</a></p>
        <p><strong>Horario:</strong> Lunes a Viernes de 8:00 a 16:00 hs</p>
        
        <div class="footer">
          <p>Dirección General de Movilidad y Transporte</p>
          <p>Municipalidad de Lanús</p>
          <p>© ${new Date().getFullYear()} Municipalidad de Lanús</p>
        </div>
      </td>
    </tr>
  </table>
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
