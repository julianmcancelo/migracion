import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/ocr-poliza
 * Extrae datos de una póliza de seguro (imagen o PDF)
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
Eres un experto en extraer información de pólizas de seguro automotor argentinas.

Analiza esta imagen/PDF de una póliza de seguro y extrae EXACTAMENTE la siguiente información:

1. aseguradora: Nombre de la compañía aseguradora
2. nro_poliza: Número de póliza
3. tipo_cobertura: Tipo de cobertura (Todo Riesgo, Terceros Completo, Responsabilidad Civil, etc)
4. vigencia_desde: Fecha de inicio de vigencia (formato YYYY-MM-DD)
5. vigencia_hasta: Fecha de fin de vigencia (formato YYYY-MM-DD)
6. dominio: Dominio del vehículo asegurado
7. marca: Marca del vehículo
8. modelo: Modelo del vehículo
9. ano: Año del vehículo
10. suma_asegurada: Suma asegurada o valor del vehículo (solo número, sin símbolos)
11. titular: Nombre del titular de la póliza

IMPORTANTE:
- Si un campo no está visible o no se puede leer, devuelve null
- Las fechas DEBEN estar en formato YYYY-MM-DD
- Devuelve SOLO un objeto JSON válido, sin texto adicional
- No inventes datos, solo extrae lo que está visible

Ejemplo de respuesta:
{
  "aseguradora": "La Caja Seguros",
  "nro_poliza": "123456789",
  "tipo_cobertura": "Terceros Completo",
  "vigencia_desde": "2024-01-15",
  "vigencia_hasta": "2025-01-15",
  "dominio": "ABC123",
  "marca": "FORD",
  "modelo": "FOCUS",
  "ano": 2020,
  "suma_asegurada": "5000000",
  "titular": "JUAN PEREZ"
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
    
    console.log('Respuesta de Gemini (Póliza):', text)

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
    console.error('Error en OCR de póliza:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar la póliza', details: error.message },
      { status: 500 }
    )
  }
}
