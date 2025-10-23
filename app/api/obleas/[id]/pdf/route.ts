import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generarPDFOblea } from '@/lib/oblea-pdf-generator'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'

/**
 * Helper: Convierte path de imagen a base64
 */
async function convertirImagenABase64(path: string): Promise<string | null> {
  try {
    // Si ya es base64, retornar tal cual
    if (path.startsWith('data:image')) {
      return path
    }

    // Si es URL externa, fetch
    if (path.startsWith('http://') || path.startsWith('https://')) {
      const response = await fetch(path)
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const mimeType = path.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg'
        return `data:${mimeType};base64,${buffer.toString('base64')}`
      }
    }

    // Si es path local del servidor
    if (path.startsWith('/') || path.startsWith('./')) {
      // Intentar primero desde public/
      try {
        const publicPath = join(process.cwd(), 'public', path)
        const fileBuffer = await readFile(publicPath)
        const mimeType = path.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg'
        console.log(`✅ Imagen leída desde public: ${publicPath}`)
        return `data:${mimeType};base64,${fileBuffer.toString('base64')}`
      } catch (err) {
        // Si falla, intentar desde la raíz del sistema
        console.log(`⚠️ No encontrado en public, intentando desde raíz: ${path}`)
        const fileBuffer = await readFile(path)
        const mimeType = path.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg'
        console.log(`✅ Imagen leída desde raíz: ${path}`)
        return `data:${mimeType};base64,${fileBuffer.toString('base64')}`
      }
    }

    return null
  } catch (error) {
    console.error('Error convirtiendo imagen:', error)
    return null
  }
}

/**
 * GET /api/obleas/[id]/pdf
 * Genera PDF completo de certificado de oblea con firmas y evidencia fotográfica
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, error: 'ID de oblea inválido' }, { status: 400 })
    }

    console.log('🔍 Buscando oblea con ID:', id)

    // Obtener oblea desde tabla 'obleas' (con firmas y foto)
    const oblea = await prisma.obleas.findUnique({
      where: { id: Number(id) },
    })

    if (!oblea) {
      return NextResponse.json({ success: false, error: 'Oblea no encontrada' }, { status: 404 })
    }

    console.log('✅ Oblea encontrada:', {
      id: oblea.id,
      tiene_foto: !!oblea.path_foto,
      tiene_firma_receptor: !!oblea.path_firma_receptor,
      tiene_firma_inspector: !!oblea.path_firma_inspector,
    })

    // Obtener habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: oblea.habilitacion_id },
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
        rol: 'TITULAR',
      },
    })

    let titular: any = null
    if (habPersona && habPersona.persona_id) {
      titular = await prisma.personas.findUnique({
        where: { id: habPersona.persona_id },
      })
    }

    // Obtener vehículo
    const habVehiculo = await prisma.habilitaciones_vehiculos.findFirst({
      where: { habilitacion_id: habilitacion.id },
    })

    let vehiculo: any = null
    if (habVehiculo && habVehiculo.vehiculo_id) {
      vehiculo = await prisma.vehiculos.findUnique({
        where: { id: habVehiculo.vehiculo_id },
      })
    }

    console.log('📸 Convirtiendo imágenes a base64...')

    // Convertir firmas a base64
    let firmaReceptorBase64: string | null = null
    let firmaInspectorBase64: string | null = null
    let fotoObleaBase64: string | null = null

    if (oblea.path_firma_receptor) {
      firmaReceptorBase64 = await convertirImagenABase64(oblea.path_firma_receptor)
      console.log('✍️ Firma receptor:', firmaReceptorBase64 ? 'Convertida' : 'Error')
    }

    if (oblea.path_firma_inspector) {
      firmaInspectorBase64 = await convertirImagenABase64(oblea.path_firma_inspector)
      console.log('✍️ Firma inspector:', firmaInspectorBase64 ? 'Convertida' : 'Error')
    }

    if (oblea.path_foto) {
      fotoObleaBase64 = await convertirImagenABase64(oblea.path_foto)
      console.log('📷 Foto oblea:', fotoObleaBase64 ? 'Convertida' : 'Error')
    }

    // Obtener última inspección (opcional, para datos adicionales)
    const inspeccion = await prisma.inspecciones.findFirst({
      where: { habilitacion_id: habilitacion.id },
      orderBy: { fecha_inspeccion: 'desc' },
    })

    // Preparar datos para el PDF
    const datosOblea = {
      habilitacion: {
        nro_licencia: habilitacion.nro_licencia || 'N/A',
        tipo_transporte: habilitacion.tipo_transporte || 'N/A',
        expte: habilitacion.expte || undefined,
        resolucion: habilitacion.resolucion || undefined,
        vigencia_inicio: habilitacion.vigencia_inicio || undefined,
        vigencia_fin: habilitacion.vigencia_fin || undefined,
      },
      titular: {
        nombre: titular?.nombre || 'N/A',
        dni: titular?.dni?.toString() || 'N/A',
        domicilio: titular?.domicilio || undefined,
      },
      vehiculo: {
        dominio: vehiculo?.dominio || 'N/A',
        marca: vehiculo?.marca || 'N/A',
        modelo: vehiculo?.modelo || 'N/A',
        ano: vehiculo?.ano?.toString() || undefined,
        chasis: vehiculo?.chasis || undefined,
      },
      oblea: {
        id: oblea.id,
        fecha_solicitud: oblea.fecha_colocacion,
        hora_solicitud: oblea.fecha_colocacion.toLocaleTimeString('es-AR'),
        estado: 'COLOCADA',
      },
      // ✅ Firmas desde tabla obleas
      inspector: {
        nombre: inspeccion?.nombre_inspector || 'Inspector Municipal',
        firma: firmaInspectorBase64 || undefined,
      },
      contribuyente: {
        firma: firmaReceptorBase64 || undefined,
      },
      // ✅ Foto de evidencia desde tabla obleas
      inspeccion: {
        fecha: oblea.fecha_colocacion,
        resultado: 'OBLEA COLOCADA',
        fotos: fotoObleaBase64
          ? [
              {
                tipo: 'Oblea Colocada',
                path: fotoObleaBase64,
              },
            ]
          : [],
      },
    }

    console.log('📄 Datos preparados para PDF:', {
      tiene_firmas: !!(firmaReceptorBase64 || firmaInspectorBase64),
      tiene_fotos: !!fotoObleaBase64,
    })

    // Las fotos ya fueron convertidas a base64 arriba

    // Generar PDF
    console.log('📝 Generando PDF de oblea con evidencia completa...')
    const pdfBuffer = await generarPDFOblea(datosOblea)
    console.log('✅ PDF generado exitosamente')

    // Convertir Buffer a Uint8Array para NextResponse
    const pdfArray = new Uint8Array(pdfBuffer)

    // Retornar PDF
    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Certificado-Oblea-${habilitacion.nro_licencia}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error al generar PDF de oblea:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Stack:', error instanceof Error ? error.stack : '')

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
