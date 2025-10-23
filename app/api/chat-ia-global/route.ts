import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * POST /api/chat-ia-global
 * 
 * Chat IA global para consultas generales sobre el sistema
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pregunta } = body

    if (!pregunta || typeof pregunta !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Debe proporcionar una pregunta' },
        { status: 400 }
      )
    }

    // Verificar API Key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Servicio de IA no configurado' },
        { status: 500 }
      )
    }

    // Contexto del sistema
    const contextoSistema = `
Eres un asistente experto del sistema de gestión de habilitaciones de transporte del Municipio de Lanús.

SOBRE EL SISTEMA:
- Gestiona habilitaciones de transporte escolar y remises
- Permite generar credenciales, obleas, resoluciones
- Sistema de turnos e inspecciones vehiculares
- Panel administrativo con roles de usuario
- Genera PDFs con QR codes
- Manejo de vencimientos y alertas

FUNCIONALIDADES PRINCIPALES:
1. HABILITACIONES:
   - Crear, editar, ver habilitaciones
   - Asociar personas (titular, conductores, celadores)
   - Vincular vehículos y establecimientos
   - Cambiar vehículo (material rodante)
   - Ver historial completo

2. OBLEAS:
   - Generar obleas para vehículos habilitados
   - Ver historial de obleas
   - Descargar PDFs con firmas digitales

3. TURNOS:
   - Programar turnos de inspección
   - Confirmar, cancelar, reprogramar
   - Notificaciones automáticas

4. INSPECCIONES:
   - Inspecciones vehiculares completas
   - Checklist de items (frenos, luces, motor, etc.)
   - Fotos de evidencia
   - Certificados de aprobación

5. CREDENCIALES:
   - Generar credenciales con QR
   - Compartir por URL
   - Verificación pública

NAVEGACIÓN:
- Dashboard: Vista general y accesos rápidos
- Habilitaciones: Listado y gestión
- Turnos: Programación de inspecciones
- Inspecciones: Registrar inspecciones
- Obleas: Gestión de obleas
- Verificaciones: Validar credenciales

Responde de forma clara, concisa y profesional en español.
Si la pregunta es sobre cómo hacer algo en el sistema, da pasos específicos.
`

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
${contextoSistema}

PREGUNTA DEL USUARIO:
${pregunta}

Responde de forma clara y útil. Si la pregunta es sobre cómo hacer algo, proporciona pasos específicos.
Si no estás seguro, di que no tienes esa información específica pero sugiere alternativas.

RESPUESTA:
`

    const result = await model.generateContent(prompt)
    const respuesta = result.response.text()

    return NextResponse.json({
      success: true,
      data: {
        pregunta,
        respuesta,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error en chat IA global:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar consulta',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
