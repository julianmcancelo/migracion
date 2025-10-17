import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generarPDFInspeccion } from '@/lib/pdf-generator'

/**
 * GET /api/inspecciones/[id]/pdf
 * Genera y descarga PDF de una inspección
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Obtener datos completos de la inspección
    const inspeccion = await prisma.inspecciones.findUnique({
      where: { id: Number(id) },
      include: {
        inspeccion_items: true,
        inspeccion_fotos: {
          orderBy: { id: 'asc' }
        }
      }
    })

    if (!inspeccion) {
      return NextResponse.json(
        { success: false, error: 'Inspección no encontrada' },
        { status: 404 }
      )
    }

    // Obtener datos de habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: inspeccion.habilitacion_id }
    })

    // Obtener datos del titular
    // @ts-ignore - Relaciones de Prisma
    const habPersona: any = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: inspeccion.habilitacion_id,
        rol: 'TITULAR'
      },
      // @ts-ignore
      include: {
        persona: true
      }
    })

    // Obtener datos del vehículo
    // @ts-ignore - Relaciones de Prisma
    const habVehiculo: any = await prisma.habilitaciones_vehiculos.findFirst({
      where: {
        habilitacion_id: inspeccion.habilitacion_id
      },
      // @ts-ignore
      include: {
        vehiculo: true
      }
    })

    // Preparar datos para el PDF
    const datosCompletos = {
      inspeccion: {
        id: inspeccion.id,
        fecha: inspeccion.fecha_inspeccion,
        inspector: inspeccion.nombre_inspector,
        nro_licencia: inspeccion.nro_licencia,
        tipo_transporte: inspeccion.tipo_transporte,
        resultado: inspeccion.resultado,
        firma_inspector: inspeccion.firma_inspector,
        firma_contribuyente: inspeccion.firma_contribuyente || null
      },
      titular: {
        nombre: habPersona?.persona?.nombre || 'N/A'
      },
      vehiculo: {
        dominio: habVehiculo?.vehiculo?.dominio || 'N/A',
        marca: habVehiculo?.vehiculo?.marca || 'N/A',
        modelo: habVehiculo?.vehiculo?.modelo || 'N/A',
        ano: habVehiculo?.vehiculo?.ano?.toString() || 'N/A',
        chasis: habVehiculo?.vehiculo?.chasis || 'N/A'
      },
      items: inspeccion.inspeccion_items.map(item => ({
        nombre: item.item_id_original,
        estado: item.estado,
        observacion: item.observacion || ''
      })),
      fotos: inspeccion.inspeccion_fotos.map(foto => ({
        tipo: foto.tipo_foto || 'Adicional',
        path: foto.foto_path || ''
      }))
    }

    // Generar PDF
    const pdfBuffer = await generarPDFInspeccion(datosCompletos)

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Inspeccion-${id}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error al generar PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar PDF' },
      { status: 500 }
    )
  }
}
