import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/ocr-licencia
 * Extrae datos de una licencia de conducir argentina (imagen o PDF)
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
Eres un experto en extraer información de licencias de conducir argentinas.

Analiza esta imagen/PDF de una licencia de conducir y extrae EXACTAMENTE la siguiente información:

1. nro_licencia: Número de licencia
2. nombre: Nombre completo del titular
3. dni: DNI del titular (solo números)
4. fecha_nacimiento: Fecha de nacimiento (formato YYYY-MM-DD)
5. sexo: Sexo (M o F)
6. domicilio: Domicilio completo
7. fecha_emision: Fecha de emisión de la licencia (formato YYYY-MM-DD)
8. fecha_vencimiento: Fecha de vencimiento (formato YYYY-MM-DD)
9. categorias: Array de categorías habilitadas (ej: ["A1", "B1"])
10. donante: Si es donante de órganos (SI o NO)
11. grupo_sanguineo: Grupo sanguíneo y factor RH (ej: "O+", "A-")
12. cuil: CUIL del titular (si está visible)

IMPORTANTE:
- Si un campo no está visible o no se puede leer, devuelve null
- Las fechas DEBEN estar en formato YYYY-MM-DD
- Las categorías deben ser un array de strings
- Devuelve SOLO un objeto JSON válido, sin texto adicional
- No inventes datos, solo extrae lo que está visible

Ejemplo de respuesta:
{
  "nro_licencia": "B1234567",
  "nombre": "JUAN PEREZ",
  "dni": "12345678",
  "fecha_nacimiento": "1985-03-15",
  "sexo": "M",
  "domicilio": "CALLE FALSA 123, LANUS",
  "fecha_emision": "2023-01-10",
  "fecha_vencimiento": "2028-01-10",
  "categorias": ["B1", "D1"],
  "donante": "SI",
  "grupo_sanguineo": "O+",
  "cuil": "20-12345678-9"
}
`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64
        }
      },
      prompt
    ])

    const response = result.response
    const text = response.text()
    
    console.log('Respuesta de Gemini (Licencia):', text)

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
      data: data
    })

  } catch (error: any) {
    console.error('Error en OCR de licencia:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar la licencia de conducir', details: error.message },
      { status: 500 }
    )
  }
}
