import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

/**
 * POST /api/vehiculos/[id]/solicitar-actualizacion
 * Envía notificación por email al titular del vehículo
 * solicitando actualización de documentación vencida
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id: paramId } = await context.params
    const vehiculoId = parseInt(paramId)

    if (isNaN(vehiculoId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { documentosVencidos, mensaje } = body

    // Obtener vehículo y titular
    const vehiculo = await prisma.vehiculos.findUnique({
      where: { id: vehiculoId },
      include: {
        habilitaciones_vehiculos: {
          include: {
            habilitacion: {
              include: {
                habilitaciones_personas: {
                  where: { rol: 'TITULAR' },
                  include: {
                    persona: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    // Buscar titular en todas las habilitaciones activas
    let titular = null
    
    for (const habVeh of vehiculo.habilitaciones_vehiculos) {
      const titularPersona = habVeh.habilitacion?.habilitaciones_personas?.find(
        hp => hp.rol === 'TITULAR'
      )?.persona
      
      if (titularPersona) {
        titular = titularPersona
        break
      }
    }

    if (!titular) {
      return NextResponse.json(
        { 
          error: 'No se encontró titular para este vehículo',
          detalle: 'El vehículo no tiene una persona con rol TITULAR en ninguna habilitación activa'
        },
        { status: 404 }
      )
    }

    // Validar que tenga email
    if (!titular.email) {
      return NextResponse.json(
        { 
          error: 'El titular no tiene email registrado',
          titular: titular.nombre
        },
        { status: 400 }
      )
    }

    // Configurar transporter de nodemailer con Gmail (igual que turnos)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // Formatear fecha de vencimiento
    const formatearFecha = (fecha: string) => {
      return new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    // Calcular días vencidos
    const calcularDiasVencido = (fecha: string) => {
      const hoy = new Date()
      const vencimiento = new Date(fecha)
      const diff = Math.floor((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24))
      return diff
    }

    // Generar HTML del email
    const docsHTML = documentosVencidos.map((doc: any) => {
      const diasVencido = calcularDiasVencido(doc.vencimiento)
      return `
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 10px 0; border-radius: 4px;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #991b1b;">⚠️ ${doc.tipo}</p>
          <p style="margin: 0; font-size: 13px; color: #7f1d1d;">
            Vencida hace ${diasVencido} día${diasVencido !== 1 ? 's' : ''}<br>
            <span style="font-size: 12px;">Vencimiento: ${formatearFecha(doc.vencimiento)}</span>
          </p>
        </div>
      `
    }).join('')

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f9fafb;">
  <table style="max-width: 600px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
    <!-- Header -->
    <tr>
      <td style="background: #ffffff; padding: 32px 32px 24px 32px; border-bottom: 1px solid #f3f4f6; text-align: center;">
        <img src="https://www.lanus.gob.ar/logo-200.png" alt="Municipalidad de Lanús" style="height: 64px; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 12px; color: #6b7280; font-weight: 600; letter-spacing: 0.5px;">MUNICIPIO DE LANÚS</p>
        <h1 style="margin: 4px 0 0 0; font-size: 18px; color: #111827; font-weight: 600;">Dirección General de Movilidad y Transporte</h1>
      </td>
    </tr>
    
    <!-- Contenido -->
    <tr>
      <td style="padding: 32px;">
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827;">Estimado/a <strong>${titular.nombre}</strong>,</p>
        
        <!-- Info del vehículo -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Vehículo: <span style="font-family: 'Courier New', monospace; font-weight: 600; color: #111827;">${vehiculo.dominio}</span>
            ${vehiculo.marca && vehiculo.modelo ? `<span style="color: #9ca3af;"> • ${vehiculo.marca} ${vehiculo.modelo}</span>` : ''}
          </p>
        </div>
        
        <p style="margin: 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
          Le informamos que la siguiente documentación de su vehículo se encuentra vencida y requiere actualización para mantener vigente su habilitación:
        </p>
        
        <!-- Documentos vencidos -->
        ${docsHTML}
        
        <!-- Instrucciones -->
        <div style="margin: 24px 0;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #111827; font-weight: 600;">Pasos a seguir:</h3>
          
          <div style="margin: 12px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; vertical-align: top;">
                  <div style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; color: #2563eb; flex-shrink: 0;">1</div>
                </td>
                <td style="padding: 8px 0 8px 12px; font-size: 14px; color: #374151;">Renovar la documentación vencida</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; vertical-align: top;">
                  <div style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; display: inline-flex; align-items: center; justify-center: center; font-weight: 600; font-size: 12px; color: #2563eb;">2</div>
                </td>
                <td style="padding: 8px 0 8px 12px; font-size: 14px; color: #374151;">Escanear los documentos en PDF o imagen clara (máx. 10MB)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; vertical-align: top;">
                  <div style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; color: #2563eb;">3</div>
                </td>
                <td style="padding: 8px 0 8px 12px;">
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151; font-weight: 500;">Responder a este email adjuntando los documentos</p>
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">💡 Tip: Mantenga el asunto del email sin modificar para una gestión más rápida.</p>
                </td>
              </tr>
            </table>
          </div>
        </div>
        
        <!-- Separador -->
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        
        <!-- Contacto -->
        <div style="margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #111827;">Contacto</p>
          <table style="width: 100%; font-size: 14px; color: #6b7280;">
            <tr>
              <td style="padding: 4px 0; width: 80px; color: #9ca3af;">Teléfono:</td>
              <td style="padding: 4px 0; font-weight: 500; color: #374151;">4357-5100 Int. 7137</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #9ca3af;">Email:</td>
              <td style="padding: 4px 0;"><a href="mailto:transportepublicolanus@gmail.com" style="color: #2563eb; text-decoration: none; font-weight: 500;">transportepublicolanus@gmail.com</a></td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #9ca3af;">Web:</td>
              <td style="padding: 4px 0;"><a href="https://www.lanus.gob.ar" style="color: #2563eb; text-decoration: none; font-weight: 500;">www.lanus.gob.ar</a></td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          Mensaje automático del Sistema de Gestión de Transporte · No responder a este email
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Enviar email
    await transporter.sendMail({
      from: `"Transporte Lanús" <${process.env.GMAIL_USER}>`,
      to: titular.email,
      replyTo: 'transportepublicolanus@gmail.com',
      subject: `Actualización de documentación - Vehículo ${vehiculo.dominio}`,
      html: htmlContent,
    })

    console.log('✅ Email enviado correctamente a:', titular.email)

    // TODO: Descomentar después de ejecutar 'npx prisma generate' y migración SQL
    // Registrar notificación en base de datos
    // await prisma.notificaciones_vehiculos.create({
    //   data: {
    //     vehiculo_id: vehiculoId,
    //     persona_id: titular.id,
    //     tipo: 'documentos_vencidos',
    //     documentos_notificados: JSON.stringify(documentosVencidos),
    //     email_destinatario: titular.email,
    //     enviado_por: session.userId
    //   }
    // })

    // console.log('📝 Notificación registrada en base de datos')

    return NextResponse.json({
      success: true,
      message: 'Email enviado correctamente',
      data: {
        titular: {
          nombre: titular.nombre,
          email: titular.email
        },
        vehiculo: vehiculo.dominio,
        documentos_solicitados: documentosVencidos
      }
    })
  } catch (error: any) {
    console.error('Error al enviar notificación:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al enviar notificación',
        details: error.message
      },
      { status: 500 }
    )
  }
}
