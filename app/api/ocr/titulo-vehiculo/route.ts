import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * POST /api/ocr/titulo-vehiculo
 * 
 * Extrae datos del título de un vehículo usando Gemini 2.0 Flash (Vision)
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Eres un sistema experto en lectura de títulos de vehículos y cédulas verdes/azules argentinas.

Analiza ${isPDF ? 'el documento PDF' : 'la imagen'} del título del vehículo y extrae EXACTAMENTE los siguientes datos:

1. DOMINIO (Patente): Formato argentino (ABC123, AA123BB, etc.)
2. MARCA: Nombre del fabricante
3. MODELO: Modelo específico del vehículo
4. TIPO: Categoría (Sedán, Pick-up, Minibus, Camión, etc.)
5. AÑO: Año de fabricación
6. CHASIS: Número de chasis completo
7. MOTOR: Número de motor completo
8. ASIENTOS: Cantidad de asientos (solo número)

IMPORTANTE:
- Si no encuentras un dato, devuelve null para ese campo
- Los números deben ser exactos como aparecen en el documento
- El dominio debe estar en mayúsculas sin espacios ni guiones

Devuelve SOLO un objeto JSON válido con este formato exacto:
{
  "dominio": "ABC123",
  "marca": "FORD",
  "modelo": "TRANSIT",
  "tipo": "MINIBUS",
  "ano": 2020,
  "chasis": "8A...",
  "motor": "JX...",
  "asientos": 15
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

    // Validar que tenga al menos el dominio
    if (!datosExtraidos.dominio) {
      return NextResponse.json({
        success: false,
        error: 'No se pudo detectar el dominio del vehículo. Intente con una imagen más clara.',
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        dominio: datosExtraidos.dominio?.toUpperCase() || null,
        marca: datosExtraidos.marca || null,
        modelo: datosExtraidos.modelo || null,
        tipo: datosExtraidos.tipo || null,
        ano: datosExtraidos.ano ? parseInt(datosExtraidos.ano) : null,
        chasis: datosExtraidos.chasis || null,
        motor: datosExtraidos.motor || null,
        asientos: datosExtraidos.asientos ? parseInt(datosExtraidos.asientos) : null,
      },
      message: 'Datos extraídos correctamente. Revise y confirme antes de guardar.',
    })
  } catch (error) {
    console.error('Error en OCR de título:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar la imagen',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
