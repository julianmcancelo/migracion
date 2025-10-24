import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

/**
 * POST /api/turnos/[id]/reenviar-notificacion
 * Reenvía la notificación por email de un turno
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const turnoId = parseInt(params.id)

    // Obtener el turno con toda la información necesaria
    const turno = await prisma.turnos.findUnique({
      where: { id: turnoId },
      include: {
        habilitacion: {
          select: {
            nro_licencia: true,
            tipo_transporte: true,
            habilitaciones_personas: {
              where: {
                rol: 'TITULAR',
              },
              select: {
                persona: {
                  select: {
                    nombre: true,
                    email: true,
                  },
                },
              },
              take: 1,
            },
            habilitaciones_vehiculos: {
              select: {
                vehiculo: {
                  select: {
                    dominio: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
    })

    if (!turno) {
      return NextResponse.json({ success: false, error: 'Turno no encontrado' }, { status: 404 })
    }

    const titular = turno.habilitacion?.habilitaciones_personas?.[0]?.persona
    const vehiculo = turno.habilitacion?.habilitaciones_vehiculos?.[0]?.vehiculo

    if (!titular?.email) {
      return NextResponse.json(
        { success: false, error: 'No se encontró email del titular' },
        { status: 400 }
      )
    }

    // Configurar nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    const fechaFormateada = new Date(turno.fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const horaFormateada = new Date(`1970-01-01T${turno.hora}`).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    // Enviar email
    await transporter.sendMail({
      from: `"Municipalidad de Lanús - Transporte" <${process.env.GMAIL_USER}>`,
      to: titular.email,
      subject: 'Recordatorio: Turno de Inspección Vehicular - Lanús',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; background: #fff; padding: 20px; margin: 0; }
    table { max-width: 600px; width: 100%; margin: 0 auto; border-collapse: collapse; }
    h1 { font-size: 18px; color: #000; margin: 0 0 5px 0; }
    h2 { font-size: 14px; color: #666; font-weight: normal; margin: 0 0 15px 0; }
    h3 { font-size: 13px; color: #000; font-weight: bold; margin: 20px 0 8px 0; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    p { margin: 8px 0; font-size: 14px; }
    strong { color: #000; }
    a { color: #0066cc; text-decoration: none; }
    .btn { display: inline-block; padding: 8px 16px; margin: 5px; background: #0066cc; color: #fff !important; text-decoration: none; font-size: 12px; border-radius: 3px; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #666; text-align: center; }
    hr { border: none; border-top: 1px solid #ddd; margin: 15px 0; }
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
        <p>Estimado/a <strong>${titular.nombre}</strong>,</p>
        <p>Le recordamos que tiene un turno programado para la inspección vehicular.</p>
        
        <h3>Detalles del Turno</h3>
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <p><strong>Hora:</strong> ${horaFormateada}</p>
        <p><strong>N° de Licencia:</strong> ${turno.habilitacion?.nro_licencia || 'N/A'}</p>
        <p><strong>Dominio:</strong> ${vehiculo?.dominio || 'N/A'}</p>
        <p><strong>Tipo:</strong> ${turno.habilitacion?.tipo_transporte || 'N/A'}</p>

        <h3>Lugar de Inspección</h3>
        <p><strong>Dirección:</strong> Intendente Manuel Quindimil 857 (esq. Jujuy), Lanús, Buenos Aires</p>
        
        <hr>
        
        <div style="text-align: center; margin: 20px 0;">
          <p style="margin-bottom: 10px;"><strong>Gestione su turno:</strong></p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/confirmar/${turno.id}" class="btn">Confirmar</a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/turnos-publico/cancelar/${turno.id}" class="btn" style="background: #dc2626;">Cancelar</a>
        </div>
        
        <h3>Documentación Obligatoria</h3>
        <p>• DNI del Titular (Documento vigente)</p>
        <p>• Cédula Verde del Vehículo</p>
        <p>• Presentarse con 15 minutos de anticipación</p>
        
        <h3>Consultas</h3>
        <p><strong>Email:</strong> <a href="mailto:transportepublicolanus@gmail.com">transportepublicolanus@gmail.com</a></p>
        <p>Por favor, confirme su asistencia respondiendo este correo.</p>
        
        <div class="footer">
          <p>Dirección General de Movilidad y Transporte</p>
          <p>Municipalidad de Lanús</p>
          <p>© ${new Date().getFullYear()} Municipalidad de Lanús</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`,
    })

    // Actualizar flag de recordatorio enviado
    await prisma.turnos.update({
      where: { id: turnoId },
      data: { recordatorio_enviado: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Notificación reenviada exitosamente',
    })
  } catch (error) {
    console.error('Error al reenviar notificación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al reenviar notificación' },
      { status: 500 }
    )
  }
}
