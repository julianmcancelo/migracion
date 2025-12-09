import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { generarCertificadoPDF } from '@/lib/certificado-pdf-generator'

export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/[id]/descargar-certificado
 * 
 * Descarga un PDF de CERTIFICADO/CONSTANCIA de habilitación
 * Con todos los datos oficiales completos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const habilitacionId = parseInt(params.id)
    if (isNaN(habilitacionId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Obtener datos completos de la habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId },
      include: {
        habilitaciones_personas: {
          where: { rol: 'TITULAR' },
          include: {
            persona: true,
          },
          take: 1,
        },
        habilitaciones_vehiculos: {
          include: {
            vehiculo: true,
          },
          take: 1,
        },
      },
    })

    if (!habilitacion) {
      return NextResponse.json(
        { error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que esté habilitada
    if (habilitacion.estado !== 'HABILITADO') {
      return NextResponse.json(
        { error: 'La habilitación no está en estado HABILITADO' },
        { status: 400 }
      )
    }

    // Obtener titular
    const titular = habilitacion.habilitaciones_personas[0]?.persona
    if (!titular) {
      return NextResponse.json(
        { error: 'No se encontró el titular de la habilitación' },
        { status: 404 }
      )
    }

    // Obtener vehículo
    const vehiculo = habilitacion.habilitaciones_vehiculos[0]?.vehiculo
    if (!vehiculo) {
      return NextResponse.json(
        { error: 'No se encontró el vehículo de la habilitación' },
        { status: 404 }
      )
    }

    // Preparar datos para el PDF
    const datos = {
      nro_licencia: habilitacion.nro_licencia || 'S/N',
      tipo_transporte: habilitacion.tipo_transporte || 'N/A',
      estado: habilitacion.estado || 'N/A',
      vigencia_inicio: habilitacion.vigencia_inicio?.toISOString(),
      vigencia_fin: habilitacion.vigencia_fin?.toISOString(),
      resolucion: habilitacion.resolucion || undefined,
      expte: habilitacion.expte || undefined,
      titular: {
        nombre: titular.nombre || 'N/A',
        dni: titular.dni || 'N/A',
        domicilio: titular.domicilio_calle && titular.domicilio_nro
          ? `${titular.domicilio_calle} ${titular.domicilio_nro}${titular.domicilio_localidad ? ', ' + titular.domicilio_localidad : ''}`
          : undefined,
      },
      vehiculo: {
        dominio: vehiculo.dominio || 'N/A',
        marca: vehiculo.marca || 'N/A',
        modelo: vehiculo.modelo || 'N/A',
        ano: vehiculo.ano || undefined,
        chasis: vehiculo.chasis || undefined,
        motor: vehiculo.motor || undefined,
        asientos: vehiculo.asientos || undefined,
      },
    }

    // Generar PDF
    const pdfBuffer = await generarCertificadoPDF(datos)
    const pdfBytes = new Uint8Array(pdfBuffer)

    // Retornar PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado-${habilitacion.nro_licencia}-${Date.now()}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error al generar certificado:', error)
    return NextResponse.json(
      {
        error: 'Error al generar certificado',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
