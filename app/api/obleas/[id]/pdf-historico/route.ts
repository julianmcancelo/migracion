import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generarPDFOblea } from '@/lib/oblea-pdf-generator-mejorado'

export const dynamic = 'force-dynamic'

/**
 * GET /api/obleas/[id]/pdf-historico
 * Genera PDF de oblea histórica (tabla obleas) con evidencia disponible
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, error: 'ID de oblea inválido' }, { status: 400 })
    }

    console.log('📄 Generando PDF de oblea histórica ID:', id)

    // Obtener oblea de tabla histórica
    const oblea = await prisma.obleas.findUnique({
      where: { id: Number(id) },
    })

    if (!oblea) {
      return NextResponse.json({ success: false, error: 'Oblea no encontrada' }, { status: 404 })
    }

    // Obtener habilitación con relaciones
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: oblea.habilitacion_id },
      include: {
        habilitaciones_personas: {
          where: { rol: 'TITULAR' },
          include: { persona: true },
          take: 1,
        },
        habilitaciones_vehiculos: {
          include: { vehiculo: true },
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

    // Obtener titular y vehículo
    const titular = habilitacion.habilitaciones_personas?.[0]?.persona
    const vehiculo = habilitacion.habilitaciones_vehiculos?.[0]?.vehiculo

    // Preparar datos para el generador mejorado
    const datosOblea = {
      habilitacion: {
        id: habilitacion.id,
        nro_licencia: oblea.nro_licencia || '',
        tipo_transporte: String(habilitacion.tipo_transporte || 'N/A'),
        expte: habilitacion.expte || undefined,
        resolucion: habilitacion.resolucion || undefined,
        vigencia_inicio: habilitacion.vigencia_inicio || undefined,
        vigencia_fin: habilitacion.vigencia_fin || undefined,
      },
      titular: {
        nombre: oblea.titular || titular?.nombre || 'No especificado',
        dni: titular?.dni || '',
        domicilio: titular?.domicilio ? String(titular.domicilio) : undefined,
      },
      vehiculo: {
        dominio: vehiculo?.dominio || 'No especificado',
        marca: vehiculo?.marca || 'No especificado',
        modelo: vehiculo?.modelo || '',
        ano: vehiculo?.ano ? String(vehiculo.ano) : undefined,
        chasis: vehiculo?.chasis || undefined,
      },
      oblea: {
        id: oblea.id,
        fecha_solicitud: oblea.fecha_colocacion,
        hora_solicitud: undefined,
        estado: 'COLOCADA',
      },
      inspector: oblea.path_firma_inspector
        ? {
          nombre: 'Inspector Municipal',
          firma: oblea.path_firma_inspector,
        }
        : undefined,
      contribuyente: oblea.path_firma_receptor
        ? {
          firma: oblea.path_firma_receptor,
        }
        : undefined,
    }

    console.log('📄 Generando PDF con generador mejorado...')

    // Generar PDF con el generador mejorado
    const pdfBuffer = await generarPDFOblea(datosOblea)
    const pdfArray = new Uint8Array(pdfBuffer)

    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Certificado-Oblea-${oblea.nro_licencia}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error al generar PDF de oblea histórica:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar PDF de oblea',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
