import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/habilitaciones/[id]/generar-oblea
 * Genera certificado de entrega de oblea para una habilitación
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const habilitacionId = parseInt(params.id)

    // Verificar que la habilitación existe y está activa
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId },
      include: {
        habilitaciones_personas: {
          where: { rol: 'TITULAR' },
          include: {
            persona: {
              select: {
                nombre: true,
                dni: true,
              },
            },
          },
          take: 1,
        },
        habilitaciones_vehiculos: {
          include: {
            vehiculo: {
              select: {
                dominio: true,
                marca: true,
                modelo: true,
              },
            },
          },
          take: 1,
        },
      },
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    if (habilitacion.estado !== 'HABILITADO') {
      return NextResponse.json(
        { success: false, error: 'El estado debe ser HABILITADO para generar oblea' },
        { status: 400 }
      )
    }

    // Registrar la entrega de oblea en el historial
    const nuevaOblea = await prisma.oblea_historial.create({
      data: {
        habilitacion_id: habilitacionId,
        fecha_solicitud: new Date(),
        hora_solicitud: new Date(),
        notificado: 'si',
      },
    })

    // Preparar datos para el certificado
    const titular = habilitacion.habilitaciones_personas[0]?.persona
    const vehiculo = habilitacion.habilitaciones_vehiculos[0]?.vehiculo

    // Formatear fechas
    const fechaHoy = new Date().toLocaleDateString('es-AR')

    let vigenciaMesAno = 'N/A'
    if (habilitacion.vigencia_fin) {
      const fechaVigencia = new Date(habilitacion.vigencia_fin)
      const meses = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ]
      const mesEspanol = meses[fechaVigencia.getMonth()]
      vigenciaMesAno = `${mesEspanol} de ${fechaVigencia.getFullYear()}`
    }

    let vigenciaDesde = 'N/A'
    if (habilitacion.vigencia_inicio) {
      vigenciaDesde = new Date(habilitacion.vigencia_inicio).toLocaleDateString('es-AR')
    }

    const datosOblea = {
      id: nuevaOblea.id,
      habilitacion: {
        id: habilitacion.id,
        nro_licencia: habilitacion.nro_licencia,
        tipo_transporte: habilitacion.tipo_transporte,
        expte: habilitacion.expte,
        resolucion: habilitacion.resolucion,
        vigencia_desde: vigenciaDesde,
        vigencia_mes_ano: vigenciaMesAno,
      },
      titular: {
        nombre: titular?.nombre || 'N/A',
        dni: titular?.dni || 'N/A',
      },
      vehiculo: {
        dominio: vehiculo?.dominio || 'N/A',
        marca: vehiculo?.marca || 'N/A',
        modelo: vehiculo?.modelo || 'N/A',
      },
      fecha_emision: fechaHoy,
    }

    return NextResponse.json({
      success: true,
      data: datosOblea,
      message: 'Certificado de oblea generado exitosamente',
    })
  } catch (error: any) {
    console.error('Error al generar oblea:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar certificado de oblea',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
