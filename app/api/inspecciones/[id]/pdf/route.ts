import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generarPDFInspeccion } from '@/lib/pdf-generator'
import path from 'path'

// Items predeterminados para Remis
const ITEMS_REMIS = [
  'Estado General de la Carrocería (exterior, paragolpes, vidrios)',
  'Estado de Espejos Retrovisores (Der. / Izq.)',
  'Estado y funcionamiento de todas las Luces (Posición, L.Corta, L. Larga, Giros, Balizas, Stop, M. Atrás)',
  'Cubiertas (Estado General banda de rodamiento y perfil. Def./Tras.)',
  'Estado General del Interior (Estado y Anclaje de Butacas y asiento trasero. Tapicería y Paneles de puerta)',
  'Cinturones de Seguridad (en las plazas delanteras y traseras acorde a la configuración del fabricante)',
  'Cabezales o Apoya Cabeza (en todas las plazas acorde a la configuración del fabricante)',
  'Matafuego Reglamentario (fijado en el interior del habitáculo, con carga y fecha vigente)',
  'Kit de Emergencias para Primeros Auxilios Completo',
  'Mampara Divisoria Transparente entre plazas delanteras y traseras',
]

// Items predeterminados para Escolar (incluye items comunes + específicos)
const ITEMS_ESCOLAR = [
  'Estado General de la Carrocería (exterior, paragolpes, vidrios)',
  'Estado de Espejos Retrovisores (Der. / Izq.)',
  'Estado y funcionamiento de todas las Luces (Posición, L.Corta, L. Larga, Giros, Balizas, Stop, M. Atrás)',
  'Cubiertas (Estado General banda de rodamiento y perfil. Def./Tras.)',
  'Estado General del Interior (Estado y Anclaje de Butacas y asiento trasero. Tapicería y Paneles de puerta)',
  'Cinturones de Seguridad (en las plazas delanteras y traseras acorde a la configuración del fabricante)',
  'Cabezales o Apoya Cabeza (en todas las plazas acorde a la configuración del fabricante)',
  'Matafuego Reglamentario (fijado en el interior del habitáculo, con carga y fecha vigente)',
  'Kit de Emergencias para Primeros Auxilios Completo',
  'Pta. accionada cond. para desc./ asc. (Puerta derecha)',
  'Pta. accionada cond. para desc./ asc. (Puerta izquierda)',
  'Salida de Emer. indep. de la plataf. asc. / desc. (En Caso de Combi - L. Der. y Trasero)',
  'Vent. Vidrio Temp. / inastillable (Apertura 10 cm)',
  'Pisos rec. con mat. Antideslizantes',
  'Dimens. de Banquetas (desde el piso 0.40 mts - ancho min 0.45mts Prof. medida horiz. 0.40 mts)',
  'Asientos: Fijos, Acolchados, Estructu. metalicas, revestimiento (Caucho o similar)',
  'Pintura (Carroceria baja y capot naranja Nº 1054 IRAM - carroceria alta techo y parantes Color blanco)',
  'Leyenda de Escolares o Niños Tamaño minimo: 0,20 mts',
]

/**
 * Convierte una ruta de imagen a base64 data URL
 * Compatible con imágenes guardadas en Base64 en la BD (nuevo sistema)
 * y con rutas de archivos del sistema antiguo
 */
async function convertirImagenABase64(rutaImagen: string): Promise<string | null> {
  try {
    // Si no hay imagen, retornar null
    if (!rutaImagen || rutaImagen === '') {
      console.log('⚠️ Imagen vacía')
      return null
    }

    // Si ya es base64 completo (con prefijo data:image), retornar tal cual
    if (rutaImagen.startsWith('data:image')) {
      console.log('✅ Imagen ya en Base64 completo')
      return rutaImagen
    }

    // Si es base64 sin prefijo (solo el string), agregar prefijo
    // Detectar si es base64 puro (empieza con /9j/ para JPEG o iVBOR para PNG)
    if (rutaImagen.startsWith('/9j/') || rutaImagen.startsWith('iVBOR') || rutaImagen.length > 1000) {
      console.log('✅ Base64 sin prefijo detectado, agregando prefijo')
      // Asumir JPEG por defecto
      return `data:image/jpeg;base64,${rutaImagen}`
    }

    // Sistema antiguo: Construir URL completa para descargar la imagen
    let urlImagen = ''

    if (rutaImagen.startsWith('http://') || rutaImagen.startsWith('https://')) {
      // Ya es una URL completa
      urlImagen = rutaImagen
    } else if (rutaImagen.startsWith('uploads/')) {
      // Ruta relativa del sistema antiguo
      const nombreArchivo = rutaImagen.replace(/^.*[\\\/]/, '')
      urlImagen = `https://credenciales.transportelanus.com.ar/uploads/inspecciones_fotos/${nombreArchivo}`
    } else {
      console.log(`⚠️ Formato de imagen no reconocido: ${rutaImagen.substring(0, 50)}...`)
      return null
    }

    console.log('📥 Descargando imagen desde:', urlImagen)

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
      console.log('✅ Imagen convertida a Base64')
      return `data:${mimeType};base64,${base64}`
    }

    console.log(`⚠️ No se pudo descargar la imagen: ${urlImagen}`)
    return null
  } catch (error) {
    console.error('❌ Error al convertir imagen:', error)
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

    console.log('📄 Generando PDF para inspección ID:', id)

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
    //  - Relaciones de Prisma
    const habPersona: any = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: inspeccion.habilitacion_id,
        rol: 'TITULAR',
      },
      // 
      include: {
        persona: true,
      },
    })

    // Obtener primer conductor
    //  - Relaciones de Prisma
    const habConductor: any = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: inspeccion.habilitacion_id,
        rol: 'CONDUCTOR',
      },
      // 
      include: {
        persona: true,
      },
    })

    // Obtener datos del vehículo
    //  - Relaciones de Prisma
    const habVehiculo: any = await prisma.habilitaciones_vehiculos.findFirst({
      where: {
        habilitacion_id: inspeccion.habilitacion_id,
      },
      // 
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

    // Solo requerir firma si la inspección no está pendiente
    if (!inspeccion.firma_inspector && inspeccion.resultado !== 'PENDIENTE') {
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
        firma_inspector: inspeccion.firma_inspector || null,
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
      items: (() => {
        // Si hay detalles de inspección, usarlos
        if (inspeccion.inspeccion_detalles && inspeccion.inspeccion_detalles.length > 0) {
          return inspeccion.inspeccion_detalles.map((item: any) => ({
            nombre: item.nombre_item || item.item_id_original,
            categoria: item.item_id || 'GENERAL',
            estado: item.estado,
            observacion: item.observacion || '',
            foto_path: item.foto_path || undefined,
          }))
        }
        
        // Si hay items guardados, usarlos
        if (inspeccion.inspeccion_items && inspeccion.inspeccion_items.length > 0) {
          return inspeccion.inspeccion_items.map((item: any) => ({
            nombre: item.nombre_item || item.item_id_original,
            categoria: item.item_id || 'GENERAL',
            estado: item.estado,
            observacion: item.observacion || '',
            foto_path: item.foto_path || undefined,
          }))
        }
        
        // Si no hay items (inspección pendiente), usar items predeterminados según el tipo
        const tipoTransporte = inspeccion.tipo_transporte?.toUpperCase() || ''
        const itemsPredeterminados = tipoTransporte.includes('REMIS') 
          ? ITEMS_REMIS 
          : tipoTransporte.includes('ESCOLAR') 
          ? ITEMS_ESCOLAR 
          : ITEMS_REMIS // Por defecto usar Remis
        
        return itemsPredeterminados.map(nombre => ({
          nombre,
          categoria: 'GENERAL',
          estado: '', // Vacío para inspecciones pendientes
          observacion: '',
          foto_path: undefined,
        }))
      })(),
      fotos: inspeccion.inspeccion_fotos.map(foto => ({
        tipo: foto.tipo_foto || 'Adicional',
        path: foto.foto_path || '',
      })),
    }

    // Convertir fotos a base64
    console.log(`🔍 Procesando ${datosCompletos.items.length} items`)
    for (const item of datosCompletos.items) {
      if (item.foto_path) {
        console.log(`📸 Item con foto: ${item.nombre?.substring(0, 30)}...`)
        console.log(`   Foto empieza con: ${item.foto_path.substring(0, 50)}...`)
        const base64 = await convertirImagenABase64(item.foto_path)
        if (base64) {
          item.foto_path = base64
        }
      }
    }

    console.log(`🔍 Procesando ${datosCompletos.fotos.length} fotos del vehículo`)
    for (const foto of datosCompletos.fotos) {
      if (foto.path) {
        console.log(`📸 Foto: ${foto.tipo}`)
        console.log(`   Path empieza con: ${foto.path.substring(0, 50)}...`)
        const base64 = await convertirImagenABase64(foto.path)
        if (base64) {
          foto.path = base64
        } else {
          console.warn(`⚠️ No se pudo convertir foto: ${foto.tipo}`)
        }
      }
    }

    // Generar PDF
    const pdfBuffer = await generarPDFInspeccion(datosCompletos)

    // Convertir Buffer a Uint8Array para NextResponse
    const pdfArray = new Uint8Array(pdfBuffer)

    // Retornar PDF para descarga automática
    const filename = `Inspeccion-${datosCompletos.inspeccion.nro_licencia || id}-${new Date().toISOString().split('T')[0]}.pdf`
    
    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
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
