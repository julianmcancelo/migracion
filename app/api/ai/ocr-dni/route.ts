import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * POST /api/ai/ocr-dni
 * Extrae datos de un DNI usando Gemini Vision
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

    // Verificar que existe la API key
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
Analiza esta imagen de un DNI argentino y extrae la información en formato JSON estricto.

IMPORTANTE: Responde SOLO con el objeto JSON, sin texto adicional, sin markdown, sin explicaciones.

Formato esperado:
{
  "nombre": "Nombre completo como aparece en el DNI",
  "dni": "Solo números, sin puntos ni espacios",
  "sexo": "M o F",
  "fecha_nacimiento": "YYYY-MM-DD",
  "domicilio": "Dirección completa",
  "fecha_emision": "YYYY-MM-DD",
  "fecha_vencimiento": "YYYY-MM-DD o null si no vence",
  "ejemplar": "Letra que indica el ejemplar",
  "cuil": "CUIL/CUIT si está visible, sino null",
  "confianza": "Alta, Media o Baja según la claridad de la imagen"
}

Si no puedes leer algún campo, usa null. Si la imagen no es un DNI, responde con: {"error": "No es un DNI válido"}
`

    // Llamar a Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type
        }
      }
    ])

    const responseText = result.response.text()
    console.log('Respuesta de Gemini:', responseText)

    // Intentar parsear como JSON
    let data
    try {
      // Limpiar la respuesta de posibles caracteres markdown
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
          rawResponse: responseText
        },
        { status: 500 }
      )
    }

    // Verificar si hubo error en el reconocimiento
    if (data.error) {
      return NextResponse.json(
        { success: false, error: data.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error: any) {
    console.error('Error en OCR DNI:', error)
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
