import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * POST /api/ai/ocr-cedula
 * Extrae datos de una cédula verde/azul usando Gemini Vision
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó imagen' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'API Key de Gemini no configurada' },
        { status: 500 }
      )
    }

    // Convertir imagen a base64
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Analiza esta imagen de una cédula verde/azul de vehículo argentina y extrae la información en formato JSON estricto.

IMPORTANTE: Responde SOLO con el objeto JSON, sin texto adicional, sin markdown, sin explicaciones.

Formato esperado:
{
  "dominio": "Dominio/patente del vehículo (ej: ABC123 o AB123CD)",
  "marca": "Marca del vehículo",
  "modelo": "Modelo del vehículo",
  "ano": "Año de fabricación (número de 4 dígitos)",
  "tipo": "Tipo de vehículo (ej: Automóvil, Camioneta, etc)",
  "chasis": "Número de chasis completo",
  "motor": "Número de motor",
  "titular": "Nombre del titular",
  "dni_titular": "DNI del titular (solo números)",
  "domicilio_titular": "Domicilio del titular si está visible",
  "color": "Color del vehículo si está visible",
  "confianza": "Alta, Media o Baja según la claridad de la imagen"
}

Si no puedes leer algún campo, usa null. Si la imagen no es una cédula válida, responde con: {"error": "No es una cédula válida"}
`

    // Llamar a Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type,
        },
      },
    ])

    const responseText = result.response.text()
    console.log('Respuesta de Gemini (cédula):', responseText)

    // Intentar parsear como JSON
    let data
    try {
      const cleanText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      data = JSON.parse(cleanText)
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError)
      return NextResponse.json(
        {
          success: false,
          error: 'No se pudo interpretar la respuesta de Gemini',
          rawResponse: responseText,
        },
        { status: 500 }
      )
    }

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error: any) {
    console.error('Error en OCR Cédula:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar la imagen',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
