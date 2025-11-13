import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/ocr-titulo
 * Extrae datos del título de propiedad del vehículo (imagen o PDF)
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'API Key de Gemini no configurada' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se recibió ningún archivo' },
        { status: 400 }
      )
    }

    // Convertir archivo a base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Determinar mime type
    const mimeType = file.type || 'image/jpeg'

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Eres un experto en extraer información de títulos de propiedad de vehículos argentinos.

Analiza esta imagen/PDF de un título automotor y extrae EXACTAMENTE la siguiente información:

1. dominio: Dominio/patente del vehículo
2. marca: Marca del vehículo
3. modelo: Modelo del vehículo
4. tipo: Tipo de vehículo (Automóvil, Camioneta, Motocicleta, etc)
5. ano: Año de fabricación
6. chasis: Número de chasis completo
7. motor: Número de motor completo
8. color: Color del vehículo
9. combustible: Tipo de combustible (NAFTA, DIESEL, GNC, ELECTRICO)
10. titular: Nombre completo del titular
11. dni_titular: DNI del titular
12. fecha_inscripcion: Fecha de inscripción inicial (formato YYYY-MM-DD)
13. uso: Uso del vehículo (PARTICULAR, COMERCIAL, TAXI, REMIS)

IMPORTANTE:
- Si un campo no está visible o no se puede leer, devuelve null
- Las fechas DEBEN estar en formato YYYY-MM-DD
- Devuelve SOLO un objeto JSON válido, sin texto adicional
- No inventes datos, solo extrae lo que está visible
- El chasis y motor deben estar completos

Ejemplo de respuesta:
{
  "dominio": "ABC123",
  "marca": "FORD",
  "modelo": "FOCUS 1.6 S",
  "tipo": "AUTOMOVIL",
  "ano": 2018,
  "chasis": "8AFZZZ54A8J123456",
  "motor": "HJDA123456",
  "color": "GRIS",
  "combustible": "NAFTA",
  "titular": "JUAN PEREZ",
  "dni_titular": "12345678",
  "fecha_inscripcion": "2018-03-15",
  "uso": "PARTICULAR"
}
`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64,
        },
      },
      prompt,
    ])

    const response = result.response
    const text = response.text()

    console.log('Respuesta de Gemini (Título):', text)

    // Limpiar respuesta
    let cleanedText = text.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '')
    }

    // Parsear JSON
    const data = JSON.parse(cleanedText)

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error: any) {
    console.error('Error en OCR de título:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar el título del vehículo', details: error.message },
      { status: 500 }
    )
  }
}
