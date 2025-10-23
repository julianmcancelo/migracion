import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generarPDFInspeccion } from '@/lib/pdf-generator'
import nodemailer from 'nodemailer'

/**
 * POST /api/inspecciones/[id]/enviar-email
 * Envía el PDF de inspección por email al contribuyente
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 })
    }

    // Obtener inspección
    const inspeccion = await prisma.inspecciones.findUnique({
      where: { id: Number(id) },
      include: {
        inspeccion_detalles: {
          orderBy: { id: 'asc' },
        },
        inspeccion_items: true,
        inspeccion_fotos: {
          orderBy: { id: 'asc' },
        },
      },
    })

    if (!inspeccion) {
      return NextResponse.json(
        { success: false, error: 'Inspección no encontrada' },
        { status: 404 }
      )
    }

    if (!inspeccion.email_contribuyente) {
      return NextResponse.json(
        { success: false, error: 'La inspección no tiene email registrado' },
        { status: 400 }
      )
    }

    // Obtener datos de habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: inspeccion.habilitacion_id },
    })

    // Obtener titular
    let nombreTitular = 'Contribuyente'
    let dniTitular = 'N/A'
    let domicilioTitular = null

    if (habilitacion) {
      const habPersona = await prisma.habilitaciones_personas.findFirst({
        where: {
          habilitacion_id: habilitacion.id,
          rol: 'TITULAR',
        },
      })

      if (habPersona && habPersona.persona_id) {
        const persona = await prisma.personas.findUnique({
          where: { id: habPersona.persona_id },
        })
        if (persona) {
          nombreTitular = persona.nombre || 'Contribuyente'
          dniTitular = persona.dni || 'N/A'
          domicilioTitular = persona.domicilio || null
        }
      }

      // Obtener conductor
      const habConductor = await prisma.habilitaciones_personas.findFirst({
        where: {
          habilitacion_id: habilitacion.id,
          rol: 'CONDUCTOR',
        },
      })

      let conductorData = undefined
      if (habConductor && habConductor.persona_id) {
        const conductorPersona = await prisma.personas.findUnique({
          where: { id: habConductor.persona_id },
        })
        if (conductorPersona) {
          conductorData = {
            nombre: conductorPersona.nombre || 'N/A',
            dni: conductorPersona.dni || undefined,
          }
        }
      }

      // Obtener vehículo
      const habVehiculo = await prisma.habilitaciones_vehiculos.findFirst({
        where: { habilitacion_id: habilitacion.id },
      })

      let dominio = 'N/A'
      let marca = 'N/A'
      let modelo = 'N/A'
      let ano = 'N/A'
      let chasis = 'N/A'
      let inscripcion_inicial: string | undefined = undefined

      if (habVehiculo && habVehiculo.vehiculo_id) {
        const vehiculo = await prisma.vehiculos.findUnique({
          where: { id: habVehiculo.vehiculo_id },
        })
        if (vehiculo) {
          dominio = vehiculo.dominio || 'N/A'
          marca = vehiculo.marca || 'N/A'
          modelo = vehiculo.modelo || 'N/A'
          ano = vehiculo.ano?.toString() || 'N/A'
          chasis = vehiculo.chasis || 'N/A'
          inscripcion_inicial = vehiculo.inscripcion_inicial
            ? String(vehiculo.inscripcion_inicial)
            : undefined
        }
      }

      // Preparar datos para PDF
      const datosCompletos = {
        inspeccion: {
          id: inspeccion.id,
          fecha: inspeccion.fecha_inspeccion,
          inspector: inspeccion.nombre_inspector,
          nro_licencia: inspeccion.nro_licencia,
          nro_expediente: habilitacion?.expte || undefined,
          tipo_habilitacion: habilitacion?.tipo || undefined,
          tipo_transporte: inspeccion.tipo_transporte,
          resultado: inspeccion.resultado,
          firma_inspector: inspeccion.firma_inspector,
          firma_contribuyente: inspeccion.firma_contribuyente || null,
        },
        titular: {
          nombre: nombreTitular,
          dni: dniTitular,
          domicilio: domicilioTitular ? String(domicilioTitular) : undefined,
        },
        conductor: conductorData,
        vehiculo: {
          dominio,
          marca,
          modelo,
          ano,
          chasis,
          inscripcion_inicial,
        },
        items: (inspeccion.inspeccion_detalles && inspeccion.inspeccion_detalles.length > 0
          ? inspeccion.inspeccion_detalles
          : inspeccion.inspeccion_items
        ).map((item: any) => ({
          nombre: item.nombre_item || item.item_id_original,
          categoria: item.item_id || 'GENERAL',
          estado: item.estado,
          observacion: item.observacion || '',
          foto_path: item.foto_path || undefined,
        })),
        fotos: inspeccion.inspeccion_fotos.map(foto => ({
          tipo: foto.tipo_foto || 'Adicional',
          path: foto.foto_path || '',
        })),
      }

      // Generar PDF
      const pdfBuffer = await generarPDFInspeccion(datosCompletos)

      // Enviar email
      const resultadoNormalizado = inspeccion.resultado?.trim().toUpperCase()
      console.log(
        '📧 Resultado de inspección:',
        inspeccion.resultado,
        '→ Normalizado:',
        resultadoNormalizado
      )

      const resultadoTexto =
        resultadoNormalizado === 'APROBADO'
          ? 'APROBADA'
          : resultadoNormalizado === 'RECHAZADO'
            ? 'RECHAZADA'
            : resultadoNormalizado === 'CONDICIONAL'
              ? 'CONDICIONAL'
              : 'PENDIENTE'
      console.log('📧 Texto email:', resultadoTexto)

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .resultado { font-size: 24px; font-weight: bold; margin: 20px 0; padding: 15px; border-radius: 8px; text-align: center; }
            .resultado.aprobada { background: #d1fae5; color: #065f46; }
            .resultado.rechazada { background: #fee2e2; color: #991b1b; }
            .resultado.condicional { background: #fef3c7; color: #92400e; }
            .resultado.pendiente { background: #e0e7ff; color: #3730a3; }
            .info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .label { font-weight: bold; color: #6b7280; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Informe de Inspección Vehicular</h1>
              <p>Municipalidad de Lanús</p>
            </div>
            <div class="content">
              <p>Estimado/a <strong>${nombreTitular}</strong>,</p>
              
              <p>Le enviamos el informe de la inspección técnica vehicular realizada.</p>
              
              <div class="resultado ${resultadoTexto.toLowerCase()}">
                INSPECCIÓN ${resultadoTexto}
              </div>
              
              <div class="info">
                <div class="info-row">
                  <span class="label">N° Inspección:</span>
                  <span>${inspeccion.id}</span>
                </div>
                <div class="info-row">
                  <span class="label">N° Licencia:</span>
                  <span>${inspeccion.nro_licencia}</span>
                </div>
                <div class="info-row">
                  <span class="label">Dominio:</span>
                  <span>${dominio}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha:</span>
                  <span>${new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</span>
                </div>
                <div class="info-row">
                  <span class="label">Inspector:</span>
                  <span>${inspeccion.nombre_inspector}</span>
                </div>
              </div>
              
              <p>En el archivo adjunto encontrará el informe completo con todos los detalles de la inspección.</p>
              
              ${
                resultadoTexto === 'RECHAZADA'
                  ? '<p style="color: #991b1b;"><strong>Nota:</strong> Su vehículo no ha aprobado la inspección. Por favor, realice las correcciones necesarias y solicite una nueva inspección.</p>'
                  : resultadoTexto === 'CONDICIONAL'
                    ? '<p style="color: #92400e;"><strong>Nota:</strong> Su vehículo ha obtenido una aprobación condicional. Revise las observaciones en el informe adjunto.</p>'
                    : resultadoTexto === 'APROBADA'
                      ? '<p style="color: #065f46;"><strong>¡Felicitaciones!</strong> Su vehículo ha aprobado la inspección técnica.</p>'
                      : '<p style="color: #3730a3;"><strong>Nota:</strong> La inspección está pendiente de resolución final.</p>'
              }
            </div>
            <div class="footer">
              <p>Dirección General de Movilidad y Transporte</p>
              <p>Municipalidad de Lanús - Argentina</p>
              <p>Este es un mensaje automático, por favor no responda a este email.</p>
            </div>
          </div>
        </body>
        </html>
      `

      // Configurar transporter de nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })

      // Enviar email con PDF adjunto
      await transporter.sendMail({
        from: `"Municipalidad de Lanús" <${process.env.GMAIL_USER}>`,
        to: inspeccion.email_contribuyente,
        replyTo: 'transportepublicolanus@gmail.com',
        subject: `Informe de Inspección Vehicular - ${dominio} - ${resultadoTexto}`,
        html: emailHtml,
        attachments: [
          {
            filename: `inspeccion_${dominio}_${inspeccion.id}.pdf`,
            content: pdfBuffer,
          },
        ],
      })

      return NextResponse.json({
        success: true,
        message: 'Email enviado correctamente',
      })
    }

    return NextResponse.json(
      { success: false, error: 'No se pudo obtener información de la habilitación' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error al enviar email:', error)
    return NextResponse.json({ success: false, error: 'Error al enviar email' }, { status: 500 })
  }
}
