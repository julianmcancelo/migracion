import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generarPDFInspeccion } from '@/lib/pdf-generator'
import path from 'path'

/**
 * Convierte una ruta de imagen a base64 data URL
 */
async function convertirImagenABase64(rutaImagen: string): Promise<string | null> {
  try {
    // Si ya es base64, retornar tal cual
    if (rutaImagen.startsWith('data:image')) {
      return rutaImagen
    }

    // Construir URL completa para descargar la imagen
    let urlImagen = ''

    if (rutaImagen.startsWith('http://') || rutaImagen.startsWith('https://')) {
      // Ya es una URL completa
      urlImagen = rutaImagen
    } else {
      // Construir URL desde la ruta relativa
      // Remover cualquier prefijo de ruta local si existe
      const nombreArchivo = rutaImagen.replace(/^.*[\\\/]/, '')
      urlImagen = `https://credenciales.transportelanus.com.ar/uploads/inspecciones_fotos/${nombreArchivo}`
    }

    // Intentar descargar la imagen
    const response = await fetch(urlImagen)

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Detectar tipo MIME
      const extension = path.extname(rutaImagen).toLowerCase()
      let mimeType = 'image/jpeg'

      if (extension === '.png') {
        mimeType = 'image/png'
      } else if (extension === '.jpg' || extension === '.jpeg') {
        mimeType = 'image/jpeg'
      }

      const base64 = buffer.toString('base64')
      return `data:${mimeType};base64,${base64}`
    }

    console.log(`No se pudo descargar la imagen: ${urlImagen}`)
    return null
  } catch (error) {
    console.error('Error al convertir imagen:', error)
    return null
  }
}

/**
 * GET /api/inspecciones/[id]/pdf
 * Genera y descarga PDF de una inspección
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 })
    }

    // Obtener datos completos de la inspección
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

    // Obtener datos de habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: inspeccion.habilitacion_id },
    })

    // Obtener datos del titular
    // @ts-expect-error - Relaciones de Prisma
    const habPersona: any = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: inspeccion.habilitacion_id,
        rol: 'TITULAR',
      },
      // @ts-expect-error
      include: {
        persona: true,
      },
    })

    // Obtener primer conductor
    // @ts-expect-error - Relaciones de Prisma
    const habConductor: any = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: inspeccion.habilitacion_id,
        rol: 'CONDUCTOR',
      },
      // @ts-expect-error
      include: {
        persona: true,
      },
    })

    // Obtener datos del vehículo
    // @ts-expect-error - Relaciones de Prisma
    const habVehiculo: any = await prisma.habilitaciones_vehiculos.findFirst({
      where: {
        habilitacion_id: inspeccion.habilitacion_id,
      },
      // @ts-expect-error
      include: {
        vehiculo: true,
      },
    })

    // Validar datos críticos
    if (!inspeccion.fecha_inspeccion) {
      return NextResponse.json(
        { success: false, error: 'Falta fecha de inspección' },
        { status: 400 }
      )
    }

    if (!inspeccion.nombre_inspector) {
      return NextResponse.json(
        { success: false, error: 'Falta nombre del inspector' },
        { status: 400 }
      )
    }

    if (!inspeccion.nro_licencia) {
      return NextResponse.json(
        { success: false, error: 'Falta número de licencia' },
        { status: 400 }
      )
    }

    if (!inspeccion.firma_inspector) {
      return NextResponse.json(
        { success: false, error: 'Falta firma del inspector' },
        { status: 400 }
      )
    }

    // Preparar datos para el PDF
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
        nombre: habPersona?.persona?.nombre || 'N/A',
        dni: habPersona?.persona?.dni?.toString() || 'N/A',
        domicilio: habPersona?.persona?.domicilio || null,
      },
      conductor: habConductor
        ? {
            nombre: habConductor.persona?.nombre || 'N/A',
            dni: habConductor.persona?.dni?.toString() || null,
          }
        : undefined,
      vehiculo: {
        dominio: habVehiculo?.vehiculo?.dominio || 'N/A',
        marca: habVehiculo?.vehiculo?.marca || 'N/A',
        modelo: habVehiculo?.vehiculo?.modelo || 'N/A',
        ano: habVehiculo?.vehiculo?.ano?.toString() || 'N/A',
        chasis: habVehiculo?.vehiculo?.chasis || 'N/A',
        inscripcion_inicial: habVehiculo?.vehiculo?.inscripcion_inicial
          ? new Date(habVehiculo.vehiculo.inscripcion_inicial).toLocaleDateString('es-AR')
          : undefined,
      },
      items: (inspeccion.inspeccion_detalles && inspeccion.inspeccion_detalles.length > 0
        ? inspeccion.inspeccion_detalles
        : inspeccion.inspeccion_items
      ).map((item: any) => ({
        nombre: item.nombre_item || item.item_id_original,
        categoria: item.item_id || 'GENERAL', // Usar item_id como categoría
        estado: item.estado,
        observacion: item.observacion || '',
        foto_path: item.foto_path || undefined,
      })),
      fotos: inspeccion.inspeccion_fotos.map(foto => ({
        tipo: foto.tipo_foto || 'Adicional',
        path: foto.foto_path || '',
      })),
    }

    // Convertir fotos a base64
    for (const item of datosCompletos.items) {
      if (item.foto_path) {
        const base64 = await convertirImagenABase64(item.foto_path)
        if (base64) {
          item.foto_path = base64
        }
      }
    }

    for (const foto of datosCompletos.fotos) {
      if (foto.path) {
        const base64 = await convertirImagenABase64(foto.path)
        if (base64) {
          foto.path = base64
        }
      }
    }

    // Generar PDF
    const pdfBuffer = await generarPDFInspeccion(datosCompletos)

    // Convertir Buffer a Uint8Array para NextResponse
    const pdfArray = new Uint8Array(pdfBuffer)

    // Retornar PDF
    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Inspeccion-${id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error al generar PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Stack:', errorStack)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar PDF',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      { status: 500 }
    )
  }
}
