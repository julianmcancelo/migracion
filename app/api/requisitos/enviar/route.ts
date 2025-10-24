import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

// Configurar transporter de nodemailer
// Reutiliza las variables de Gmail si están configuradas
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER || process.env.GMAIL_USER,
    pass: process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD,
  },
})

/**
 * POST /api/requisitos/enviar
 * Envía el listado de requisitos por email y guarda el contacto para futuras comunicaciones
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validaciones
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'El email es requerido.' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'El formato del email no es válido.' },
        { status: 400 }
      )
    }

    const emailLower = email.toLowerCase().trim()

    // Guardar el email en la tabla de contactos interesados
    try {
      await prisma.$executeRaw`
        INSERT INTO contactos_interesados (email, origen, fecha_registro)
        VALUES (${emailLower}, 'requisitos_landing', NOW())
        ON DUPLICATE KEY UPDATE 
          ultima_consulta = NOW(),
          contador_consultas = contador_consultas + 1
      `
    } catch (dbError) {
      console.error('Error al guardar contacto:', dbError)
      // Continuar aunque falle el guardado
    }

    // Preparar el contenido del email
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Requisitos para Habilitaciones de Transporte</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Municipio de Lanús</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0;">Dirección General de Movilidad y Transporte</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Documentación Requerida para Habilitaciones</h2>
          <p>Estimado/a,</p>
          <p>A continuación encontrarás el listado completo de requisitos para tramitar tu habilitación de transporte:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #3b82f6; margin-top: 0;">📘 Transporte Escolar</h3>
            <ul style="list-style: none; padding-left: 0;">
              <li style="margin: 10px 0;">✅ <strong>DNI del titular</strong> - Original y fotocopia</li>
              <li style="margin: 10px 0;">✅ <strong>Cédula verde del vehículo</strong> - A nombre del titular</li>
              <li style="margin: 10px 0;">✅ <strong>Seguro vigente</strong> - Póliza contra terceros completos</li>
              <li style="margin: 10px 0;">✅ <strong>VTV vigente</strong> - Verificación técnica vehicular</li>
              <li style="margin: 10px 0;">✅ <strong>Certificado de antecedentes</strong> - Del titular y conductores</li>
              <li style="margin: 10px 0;">✅ <strong>Habilitación municipal del conductor</strong> - Licencia profesional vigente</li>
            </ul>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #10b981; margin-top: 0;">🚗 Remis</h3>
            <ul style="list-style: none; padding-left: 0;">
              <li style="margin: 10px 0;">✅ <strong>DNI y licencia de conducir</strong> - Del titular y todos los choferes</li>
              <li style="margin: 10px 0;">✅ <strong>Título del vehículo</strong> - Original y copia certificada</li>
              <li style="margin: 10px 0;">✅ <strong>Certificado de antecedentes</strong> - Para todos los conductores</li>
              <li style="margin: 10px 0;">✅ <strong>Seguro y VTV</strong> - Vigentes y actualizados</li>
              <li style="margin: 10px 0;">✅ <strong>Libre deuda municipal</strong> - Actualizado</li>
              <li style="margin: 10px 0;">✅ <strong>Certificado de aptitud psicofísica</strong> - De todos los conductores</li>
            </ul>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Importante</h4>
            <p style="margin: 5px 0; color: #856404;">Todos los documentos deben estar vigentes al momento de la presentación. Te recomendamos verificar las fechas de vencimiento antes de iniciar el trámite.</p>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">📞 Información de Contacto</h4>
            <p style="margin: 5px 0;"><strong>Teléfono:</strong> 4357-5100 int. 7137</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> transportepublicolanus@gmail.com</p>
            <p style="margin: 5px 0;"><strong>Dirección:</strong> Intendente Manuel Quindimil 857 (esq. Jujuy) - Lanús</p>
            <p style="margin: 5px 0;"><strong>Horario:</strong> Lunes a Viernes 8:00 - 14:00 hs</p>
          </div>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Ir al Portal de Gestión
            </a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #666; text-align: center;">
            Este correo fue enviado desde el sistema de Gestión de Transporte del Municipio de Lanús.<br />
            © 2025 Municipio de Lanús - Todos los derechos reservados
          </p>
        </div>
      </body>
      </html>
    `

    // Enviar el email usando Nodemailer
    try {
      // Verificar si hay credenciales de email configuradas
      const emailUser = process.env.SMTP_USER || process.env.GMAIL_USER
      
      // En desarrollo o si no hay credenciales, simular el envío
      if (process.env.NODE_ENV === 'development' || !emailUser) {
        console.log('Email simulado en desarrollo para:', emailLower)
        console.log('Contenido del email preparado correctamente')
        return NextResponse.json({
          success: true,
          message: 'Requisitos enviados exitosamente.',
        })
      }

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Municipio de Lanús" <${emailUser}>`,
        to: emailLower,
        subject: 'Requisitos para Habilitaciones de Transporte - Municipio de Lanús',
        html: htmlContent,
      })

      return NextResponse.json({
        success: true,
        message: 'Requisitos enviados exitosamente.',
      })
    } catch (emailError: any) {
      console.error('Error al enviar email:', emailError)
      
      return NextResponse.json(
        {
          success: false,
          error: 'Error al enviar el email. Por favor, intenta más tarde.',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error en /api/requisitos/enviar:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Ocurrió un error en el servidor. Por favor, intenta más tarde.',
      },
      { status: 500 }
    )
  }
}
