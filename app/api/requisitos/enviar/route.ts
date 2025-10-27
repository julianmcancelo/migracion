import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'
import { notificarNuevoContacto } from '@/lib/notificaciones'

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
      
      // Notificar a los administradores sobre el nuevo contacto
      await notificarNuevoContacto(emailLower, 'requisitos_landing')
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
              <p style="margin: 0 0 12px 0; padding: 8px; background: #eff6ff; border-left: 3px solid #3b82f6; font-size: 12px; color: #1e40af;">
                <strong>Importante:</strong> La unidad debe estar radicada en Provincia de Buenos Aires
              </p>
              <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 13px; line-height: 1.6;">
                <li style="margin: 4px 0;">Título y Cédula verde a nombre del solicitante</li>
                <li style="margin: 4px 0;">Póliza de Seguro categoría transporte escolar con cobertura terceros transportados y no transportados + último recibo de pago</li>
                <li style="margin: 4px 0;">Certificación de escuela donde presta servicios con datos identificatorios</li>
                <li style="margin: 4px 0;">VTV como Transporte Escolar con su ANEXO (especificando categoría de Transporte y capacidad de asientos total)</li>
                <li style="margin: 4px 0;">Certificado de desinfección sanitaria</li>
                <li style="margin: 4px 0;">DNI (Titular, Chofer y Celador/a)</li>
                <li style="margin: 4px 0;">Libreta Sanitaria correspondiente al PARTIDO DE LANUS (Titular, Chofer y Celador/a)</li>
                <li style="margin: 4px 0;">Licencia de Conducir con categoría Transporte Escolar (Titular - Chofer)</li>
                <li style="margin: 4px 0;">Certificado de Antecedentes Penales (Titular, Chofer y Celador/a)</li>
                <li style="margin: 4px 0;">Certificado de Domicilio (Titular, Chofer y Celador/a)</li>
                <li style="margin: 4px 0;">Constancia de CUIT o CUIL (Titular, chofer y celador/a)</li>
                <li style="margin: 4px 0;">Cédula Azul a nombre del Chofer declarado (de corresponder)</li>
                <li style="margin: 4px 0;">Fotos color de la unidad: trasera, delantera y ambos laterales</li>
                <li style="margin: 4px 0;">Colores reglamentarios: NARANJA Nº 1054 (Normas IRAM) en Carrocería BAJA y BLANCO en Carrocería ALTA</li>
                <li style="margin: 4px 0;">Leyenda "TRANSPORTE ESCOLAR" bien visible desde el exterior (letra de trazo no menor de 20 cm, color negro)</li>
                <li style="margin: 4px 0;">Psicotécnico (Titular, chofer y celador/a)</li>
                <li style="margin: 4px 0;">02 (dos) Informes de Dominio</li>
                <li style="margin: 4px 0;">Último pago de patente de automotor (ARBA)</li>
                <li style="margin: 4px 0;">Constancia de Inscripción de la AFIP</li>
                <li style="margin: 4px 0;">Certificados de Deudores Alimentarios</li>
                <li style="margin: 4px 0;">En caso de ser PERSONA JURIDICA o EMPRESA UNILATERAL: presentar Estatuto o Contrato Social</li>
              </ol>
              <p style="margin: 12px 0 0 0; padding: 8px; background: #fef3c7; border-left: 3px solid #f59e0b; font-size: 12px; color: #92400e;">
                <strong>Para renovación:</strong> Adjuntar fotocopia de la Resolución correspondiente al año anterior
              </p>
            </div>
            
            <!-- Remis -->
            <div style="margin-bottom: 24px;">
              <h2 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #10b981;">
                Remis
              </h2>
              <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 13px; line-height: 1.6;">
                <li style="margin: 4px 0;">Solicitud de presentación de expediente ANEXO I</li>
                <li style="margin: 4px 0;">Título y Cédula Verde a nombre del solicitante</li>
                <li style="margin: 4px 0;">Póliza de Seguro con la categoría de Remis con cobertura hacia terceros transportados y no transportados, y último recibo de pago</li>
                <li style="margin: 4px 0;">Verificación Técnica Vehicular (VTV) como Remis - Transporte Público de Pasajeros hasta 9 personas</li>
                <li style="margin: 4px 0;">Planilla de Desinfección Sanitaria (Empresa Habilitada Nº 1928 Ministerio de Asuntos Agrarios Pcia. de Buenos Aires - Email: Tecmatasara@yahoo.com.ar)</li>
                <li style="margin: 4px 0;">DNI (Titular y Chofer si lo tuviera)</li>
                <li style="margin: 4px 0;">Libreta Sanitaria correspondiente al Partido de Lanús (de quien preste el servicio)</li>
                <li style="margin: 4px 0;">Licencia de Conducir con la categoría habilitante de Remis D.1 (Titular y Chofer si lo tuviera)</li>
                <li style="margin: 4px 0;">Constancia de CUIL o CUIT (Titular y Chofer si lo tuviera)</li>
                <li style="margin: 4px 0;">Certificados de Antecedentes Penales (Titular y Chofer si lo tuviera)</li>
                <li style="margin: 4px 0;">Certificado de Declaración Jurada de Domicilio (Titular y Chofer si lo tuviera)</li>
                <li style="margin: 4px 0;">Certificado de la Agencia (HABILITADA EN EL PARTIDO DE LANÚS) donde se llevará a cabo la explotación del Servicio de Remis, consignando los datos identificatorios de la misma</li>
                <li style="margin: 4px 0;">Certificado de GNC (ENERGAS)</li>
                <li style="margin: 4px 0;">Último pago de patente de automotor (ARBA o AGIP)</li>
                <li style="margin: 4px 0;">Constancia de inscripción de AFIP</li>
                <li style="margin: 4px 0;">Certificado de Deudores Alimentarios</li>
              </ol>
              <p style="margin: 12px 0 0 0; padding: 8px; background: #fef3c7; border-left: 3px solid #f59e0b; font-size: 12px; color: #92400e;">
                <strong>Para renovación:</strong> Presentar Resolución del año anterior
              </p>
              <p style="margin: 8px 0 0 0; padding: 8px; background: #fee2e2; border-left: 3px solid #dc2626; font-size: 12px; color: #991b1b;">
                <strong>Antigüedad máxima:</strong> La unidad a habilitar o renovar no debe exceder los 15 años de antigüedad desde la fecha de su fabricación
              </p>
              <p style="margin: 8px 0 0 0; padding: 8px; background: #dbeafe; border-left: 3px solid #2563eb; font-size: 12px; color: #1e40af;">
                <strong>Inspección Técnica:</strong> El turno de la Dirección General de Movilidad y Transporte será otorgado oportunamente
              </p>
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
