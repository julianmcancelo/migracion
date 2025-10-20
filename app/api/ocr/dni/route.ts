import { NextRequest, NextResponse } from 'next/server'
import Tesseract from 'tesseract.js'

/**
 * POST /api/ocr/dni
 * Procesa imagen de DNI y extrae datos usando OCR
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó imagen' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de archivo no válido. Use JPG, PNG o WebP' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'El archivo es demasiado grande. Máximo 10MB' },
        { status: 400 }
      )
    }

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('Iniciando OCR para DNI...')

    // Procesar con Tesseract
    const { data: { text } } = await Tesseract.recognize(
      buffer,
      'spa', // Español
      {
        logger: m => console.log('OCR Progress:', m)
      }
    )

    console.log('Texto extraído:', text)

    // Extraer datos del DNI
    const datosExtraidos = extraerDatosDNI(text)

    return NextResponse.json({
      success: true,
      data: {
        textoCompleto: text,
        datosExtraidos,
        confianza: calcularConfianza(datosExtraidos)
      }
    })

  } catch (error: any) {
    console.error('Error en OCR:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al procesar la imagen',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * Extrae datos específicos del texto del DNI
 */
function extraerDatosDNI(texto: string) {
  const datos: any = {
    dni: null,
    nombre: null,
    apellido: null,
    fechaNacimiento: null,
    sexo: null,
    nacionalidad: null,
    domicilio: null,
    fechaVencimiento: null
  }

  // Limpiar texto
  const textoLimpio = texto
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()

  console.log('Texto limpio:', textoLimpio)

  // Extraer DNI (8 dígitos)
  const dniMatch = textoLimpio.match(/(?:DNI|DOCUMENTO|DOC)\s*:?\s*(\d{7,8})/i) ||
                   textoLimpio.match(/\b(\d{7,8})\b/)
  if (dniMatch) {
    datos.dni = dniMatch[1]
  }

  // Extraer nombre y apellido
  const nombreMatch = textoLimpio.match(/(?:NOMBRES?|APELLIDOS?\s+Y\s+NOMBRES?)\s*:?\s*([A-ZÁÉÍÓÚÑ\s]+)/i)
  if (nombreMatch) {
    const nombreCompleto = nombreMatch[1].trim()
    const partes = nombreCompleto.split(/\s+/)
    
    if (partes.length >= 2) {
      // Asumimos que los primeros son apellidos y los últimos nombres
      const mitad = Math.ceil(partes.length / 2)
      datos.apellido = partes.slice(0, mitad).join(' ')
      datos.nombre = partes.slice(mitad).join(' ')
    } else {
      datos.nombre = nombreCompleto
    }
  }

  // Extraer fecha de nacimiento
  const fechaNacMatch = textoLimpio.match(/(?:NACIMIENTO|NAC|FECHA\s+DE\s+NAC)\s*:?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i)
  if (fechaNacMatch) {
    const [, dia, mes, año] = fechaNacMatch
    datos.fechaNacimiento = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
  }

  // Extraer sexo
  const sexoMatch = textoLimpio.match(/(?:SEXO|SEX)\s*:?\s*([MF])/i)
  if (sexoMatch) {
    datos.sexo = sexoMatch[1] === 'M' ? 'MASCULINO' : 'FEMENINO'
  }

  // Extraer nacionalidad
  const nacionalidadMatch = textoLimpio.match(/(?:NACIONALIDAD|NAC)\s*:?\s*([A-ZÁÉÍÓÚÑ]+)/i)
  if (nacionalidadMatch && nacionalidadMatch[1] !== 'NACIMIENTO') {
    datos.nacionalidad = nacionalidadMatch[1]
  }

  // Extraer domicilio
  const domicilioMatch = textoLimpio.match(/(?:DOMICILIO|DOM)\s*:?\s*([A-ZÁÉÍÓÚÑ0-9\s,\.]+)/i)
  if (domicilioMatch) {
    datos.domicilio = domicilioMatch[1].trim()
  }

  // Extraer fecha de vencimiento
  const vencimientoMatch = textoLimpio.match(/(?:VENCIMIENTO|VENCE|VÁLIDO\s+HASTA)\s*:?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i)
  if (vencimientoMatch) {
    const [, dia, mes, año] = vencimientoMatch
    datos.fechaVencimiento = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
  }

  return datos
}

/**
 * Calcula un porcentaje de confianza basado en los datos extraídos
 */
function calcularConfianza(datos: any): number {
  const camposImportantes = ['dni', 'nombre', 'fechaNacimiento', 'sexo']
  const camposEncontrados = camposImportantes.filter(campo => datos[campo])
  
  return Math.round((camposEncontrados.length / camposImportantes.length) * 100)
}
