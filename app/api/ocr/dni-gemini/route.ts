import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * POST /api/ocr/dni
 * 
 * Extrae datos del DNI usando Gemini 2.0 Flash (Vision)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar API Key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Servicio de OCR no configurado' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo (imagen o PDF)
    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf'

    if (!isImage && !isPDF) {
      return NextResponse.json(
        { success: false, error: 'Solo se permiten imágenes (JPG, PNG) o archivos PDF' },
        { status: 400 }
      )
    }

    // Convertir archivo a base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    // Usar Gemini 2.0 Flash con capacidad de visión
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `
Eres un sistema experto en lectura de DNI argentinos (Documento Nacional de Identidad).

Analiza ${isPDF ? 'el documento PDF' : 'la imagen'} del DNI y extrae EXACTAMENTE los siguientes datos:

1. DNI: Número de documento (8 dígitos)
2. NOMBRE: Nombre completo de la persona
3. GENERO: Masculino, Femenino u Otro
4. CUIT: Si está visible (formato: 20-12345678-9)
5. TELEFONO: Si está visible
6. EMAIL: Si está visible
7. DOMICILIO_CALLE: Calle del domicilio
8. DOMICILIO_NRO: Número de la calle
9. DOMICILIO_LOCALIDAD: Localidad/Ciudad

IMPORTANTE:
- Si no encuentras un dato, devuelve null para ese campo
- El nombre debe estar completo (nombre y apellido)
- El género debe ser: "Masculino", "Femenino" u "Otro"
- El DNI debe ser exacto como aparece en el documento

Devuelve SOLO un objeto JSON válido con este formato exacto:
{
  "dni": "12345678",
  "nombre": "JUAN CARLOS PEREZ",
  "genero": "Masculino",
  "cuit": "20-12345678-9",
  "telefono": "11-1234-5678",
  "email": "ejemplo@email.com",
  "domicilio_calle": "Av. San Martin",
  "domicilio_nro": "1234",
  "domicilio_localidad": "Lanus"
}

NO agregues texto adicional, solo el JSON.
`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ])

    const response = result.response
    const text = response.text()

    // Extraer JSON de la respuesta
    let datosExtraidos
    try {
      // Intentar parsear directamente
      datosExtraidos = JSON.parse(text)
    } catch {
      // Si falla, buscar JSON en el texto
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        datosExtraidos = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No se pudo extraer JSON de la respuesta')
      }
    }

    // Validar que tenga al menos el DNI
    if (!datosExtraidos.dni) {
      return NextResponse.json({
        success: false,
        error: 'No se pudo detectar el DNI. Intente con una imagen más clara.',
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        dni: datosExtraidos.dni || null,
        nombre: datosExtraidos.nombre || null,
        genero: datosExtraidos.genero || null,
        cuit: datosExtraidos.cuit || null,
        telefono: datosExtraidos.telefono || null,
        email: datosExtraidos.email || null,
        domicilio_calle: datosExtraidos.domicilio_calle || null,
        domicilio_nro: datosExtraidos.domicilio_nro || null,
        domicilio_localidad: datosExtraidos.domicilio_localidad || null,
      },
      message: 'Datos extraídos correctamente. Revise y confirme antes de guardar.',
    })
  } catch (error) {
    console.error('Error en OCR de DNI:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar el archivo',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
