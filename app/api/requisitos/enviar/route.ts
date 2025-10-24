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

    // Preparar el contenido del email (versión minimalista)
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Requisitos - Municipio de Lanús</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: #2563eb; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 600;">Municipio de Lanús</h1>
            <p style="color: #dbeafe; margin: 4px 0 0 0; font-size: 14px;">Requisitos para Habilitaciones</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            
            <p style="margin: 0 0 24px 0; color: #4b5563;">Hola,</p>
            <p style="margin: 0 0 24px 0; color: #4b5563;">Aquí tenés el listado de documentos necesarios:</p>
            
            <!-- Transporte Escolar -->
            <div style="margin-bottom: 24px;">
              <h2 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #3b82f6;">
                Transporte Escolar
              </h2>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
                <li style="margin: 6px 0;">DNI del titular (original y copia)</li>
                <li style="margin: 6px 0;">Cédula verde del vehículo</li>
                <li style="margin: 6px 0;">Seguro vigente</li>
                <li style="margin: 6px 0;">VTV vigente</li>
                <li style="margin: 6px 0;">Certificado de antecedentes</li>
                <li style="margin: 6px 0;">Habilitación municipal del conductor</li>
              </ul>
            </div>
            
            <!-- Remis -->
            <div style="margin-bottom: 24px;">
              <h2 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #10b981;">
                Remis
              </h2>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
                <li style="margin: 6px 0;">DNI y licencia de conducir (titular y choferes)</li>
                <li style="margin: 6px 0;">Título del vehículo</li>
                <li style="margin: 6px 0;">Certificado de antecedentes</li>
                <li style="margin: 6px 0;">Seguro y VTV vigentes</li>
                <li style="margin: 6px 0;">Libre deuda municipal</li>
                <li style="margin: 6px 0;">Certificado de aptitud psicofísica</li>
              </ul>
            </div>
            
            <!-- Contacto -->
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 24px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;"><strong>Contacto:</strong></p>
              <p style="margin: 4px 0; font-size: 14px; color: #4b5563;">📞 4357-5100 int. 7137</p>
              <p style="margin: 4px 0; font-size: 14px; color: #4b5563;">📍 Quindimil 857, Lanús</p>
              <p style="margin: 4px 0; font-size: 14px; color: #4b5563;">🕐 Lun-Vie 8:00-14:00</p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              © 2025 Municipio de Lanús
            </p>
          </div>
          
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
