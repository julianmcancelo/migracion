import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/ocr-vtv
 * Extrae datos de un certificado de VTV (imagen o PDF)
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `
Eres un experto en extraer información de certificados de Verificación Técnica Vehicular (VTV) argentinos.

Analiza esta imagen/PDF de un certificado VTV y extrae EXACTAMENTE la siguiente información:

1. dominio: Dominio/patente del vehículo
2. marca: Marca del vehículo
3. modelo: Modelo del vehículo
4. ano: Año del vehículo
5. chasis: Número de chasis
6. motor: Número de motor
7. fecha_emision: Fecha de emisión de la VTV (formato YYYY-MM-DD)
8. fecha_vencimiento: Fecha de vencimiento de la VTV (formato YYYY-MM-DD)
9. resultado: Resultado de la inspección (APTO, NO APTO, CONDICIONAL)
10. planta_verificadora: Nombre de la planta verificadora
11. nro_certificado: Número de certificado VTV

IMPORTANTE:
- Si un campo no está visible o no se puede leer, devuelve null
- Las fechas DEBEN estar en formato YYYY-MM-DD
- Devuelve SOLO un objeto JSON válido, sin texto adicional
- El resultado debe ser: APTO, NO APTO o CONDICIONAL
- No inventes datos, solo extrae lo que está visible

Ejemplo de respuesta:
{
  "dominio": "ABC123",
  "marca": "FORD",
  "modelo": "FOCUS",
  "ano": 2018,
  "chasis": "8AFZZZ54A8J123456",
  "motor": "HJDA123456",
  "fecha_emision": "2024-06-15",
  "fecha_vencimiento": "2025-06-15",
  "resultado": "APTO",
  "planta_verificadora": "VTV Buenos Aires S.A.",
  "nro_certificado": "BA-1234567"
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

    console.log('Respuesta de Gemini (VTV):', text)

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
    console.error('Error en OCR de VTV:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar el certificado VTV', details: error.message },
      { status: 500 }
    )
  }
}
