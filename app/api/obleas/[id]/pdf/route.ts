import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generarPDFOblea } from '@/lib/oblea-pdf-generator'

export const dynamic = 'force-dynamic'

/**
 * GET /api/obleas/[id]/pdf
 * Genera PDF completo de certificado de oblea con firmas y evidencia fotográfica
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: 'ID de oblea inválido' },
        { status: 400 }
      )
    }

    // Obtener oblea
    const oblea = await prisma.oblea_historial.findUnique({
      where: { id: Number(id) }
    })

    if (!oblea) {
      return NextResponse.json(
        { success: false, error: 'Oblea no encontrada' },
        { status: 404 }
      )
    }

    // Obtener habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: oblea.habilitacion_id }
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Obtener titular
    const habPersona = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: habilitacion.id,
        rol: 'TITULAR'
      }
    })

    let titular: any = null
    if (habPersona && habPersona.persona_id) {
      titular = await prisma.personas.findUnique({
        where: { id: habPersona.persona_id }
      })
    }

    // Obtener vehículo
    const habVehiculo = await prisma.habilitaciones_vehiculos.findFirst({
      where: { habilitacion_id: habilitacion.id }
    })

    let vehiculo: any = null
    if (habVehiculo && habVehiculo.vehiculo_id) {
      vehiculo = await prisma.vehiculos.findUnique({
        where: { id: habVehiculo.vehiculo_id }
      })
    }

    // Obtener última inspección de esta habilitación (para firmas y fotos)
    const inspeccion = await prisma.inspecciones.findFirst({
      where: { habilitacion_id: habilitacion.id },
      orderBy: { fecha_inspeccion: 'desc' },
      include: {
        inspeccion_fotos: {
          orderBy: { id: 'asc' }
        }
      }
    })

    // Preparar datos para el PDF
    const datosOblea = {
      habilitacion: {
        nro_licencia: habilitacion.nro_licencia || 'N/A',
        tipo_transporte: habilitacion.tipo_transporte || 'N/A',
        expte: habilitacion.expte || undefined,
        resolucion: habilitacion.resolucion || undefined,
        vigencia_inicio: habilitacion.vigencia_inicio || undefined,
        vigencia_fin: habilitacion.vigencia_fin || undefined
      },
      titular: {
        nombre: titular?.nombre || 'N/A',
        dni: titular?.dni?.toString() || 'N/A',
        domicilio: titular?.domicilio || undefined
      },
      vehiculo: {
        dominio: vehiculo?.dominio || 'N/A',
        marca: vehiculo?.marca || 'N/A',
        modelo: vehiculo?.modelo || 'N/A',
        ano: vehiculo?.ano?.toString() || undefined,
        chasis: vehiculo?.chasis || undefined
      },
      oblea: {
        id: oblea.id,
        fecha_solicitud: oblea.fecha_solicitud,
        hora_solicitud: oblea.hora_solicitud ? String(oblea.hora_solicitud) : undefined,
        estado: oblea.notificado || undefined
      },
      inspector: inspeccion ? {
        nombre: inspeccion.nombre_inspector,
        firma: inspeccion.firma_inspector || undefined
      } : undefined,
      contribuyente: inspeccion ? {
        firma: inspeccion.firma_contribuyente || undefined
      } : undefined,
      inspeccion: inspeccion ? {
        fecha: inspeccion.fecha_inspeccion,
        resultado: inspeccion.resultado || 'PENDIENTE',
        fotos: inspeccion.inspeccion_fotos.map(foto => ({
          tipo: foto.tipo_foto || 'Foto',
          path: foto.foto_path || ''
        }))
      } : undefined
    }

    // Convertir fotos a base64 si son URLs
    if (datosOblea.inspeccion?.fotos) {
      for (const foto of datosOblea.inspeccion.fotos) {
        if (foto.path && !foto.path.startsWith('data:image')) {
          // Si la foto está en un servidor externo, intentar convertirla
          try {
            if (foto.path.startsWith('http://') || foto.path.startsWith('https://')) {
              const response = await fetch(foto.path)
              if (response.ok) {
                const arrayBuffer = await response.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)
                const extension = foto.path.toLowerCase()
                const mimeType = extension.includes('.png') ? 'image/png' : 'image/jpeg'
                foto.path = `data:${mimeType};base64,${buffer.toString('base64')}`
              }
            }
          } catch (error) {
            console.error('Error convirtiendo foto:', error)
            // Dejar el path original si falla
          }
        }
      }
    }

    // Generar PDF
    console.log('Generando PDF de oblea con datos completos...')
    const pdfBuffer = await generarPDFOblea(datosOblea)

    // Convertir Buffer a Uint8Array para NextResponse
    const pdfArray = new Uint8Array(pdfBuffer)

    // Retornar PDF
    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Certificado-Oblea-${habilitacion.nro_licencia}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error al generar PDF de oblea:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Stack:', error instanceof Error ? error.stack : '')
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al generar PDF de oblea',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
