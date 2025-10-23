import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * POST /api/habilitaciones/[id]/consultar-ia
 * 
 * Consulta con IA sobre el estado y detalles de una habilitación
 * usando Google Gemini para análisis inteligente
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const habilitacionId = parseInt(id)

    if (isNaN(habilitacionId)) {
      return NextResponse.json(
        { success: false, error: 'ID de habilitación inválido' },
        { status: 400 }
      )
    }

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

    // Obtener datos completos de la habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId },
      include: {
        habilitaciones_personas: {
          include: {
            persona: true,
          },
        },
        habilitaciones_vehiculos: {
          include: {
            vehiculo: true,
          },
          take: 1,
          orderBy: { id: 'desc' },
        },
        habilitaciones_establecimientos: {
          include: {
            establecimiento: true,
          },
        },
        oblea_historial: {
          orderBy: { fecha_solicitud: 'desc' },
          take: 5,
        },
      },
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Obtener inspecciones recientes
    const inspecciones = await prisma.inspecciones.findMany({
      where: {
        habilitacion_id: habilitacionId,
      },
      orderBy: { fecha_inspeccion: 'desc' },
      take: 3,
      include: {
        inspeccion_detalles: true,
      },
    })

    // Preparar contexto estructurado para la IA
    const contexto = prepararContextoHabilitacion(habilitacion, inspecciones)

    // Consultar a Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Eres un asistente experto en habilitaciones de transporte del Municipio de Lanús.
Tu tarea es analizar la información de una habilitación y responder preguntas de manera clara, profesional y precisa.

INFORMACIÓN DE LA HABILITACIÓN:
${contexto}

PREGUNTA DEL USUARIO:
${pregunta}

INSTRUCCIONES:
- Responde de forma clara y concisa en español
- Si la pregunta es sobre vencimientos, calcula los días restantes hasta hoy
- Si hay problemas o alertas, menciónalos
- Si la información no está disponible, indícalo claramente
- Usa lenguaje profesional pero accesible
- Si hay vencimientos próximos (menos de 30 días), resáltalo

RESPUESTA:
`

    const result = await model.generateContent(prompt)
    const respuesta = result.response.text()

    // Registrar la consulta (opcional, para analytics)
    // await prisma.consultas_ia.create({...})

    return NextResponse.json({
      success: true,
      data: {
        pregunta,
        respuesta,
        habilitacion_id: habilitacionId,
        nro_licencia: habilitacion.nro_licencia,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error en consulta IA:', error)
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

/**
 * Prepara el contexto de la habilitación en formato legible para la IA
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function prepararContextoHabilitacion(habilitacion: any, inspecciones: any[]): string {
  const hoy = new Date()
  
  // Calcular días hasta vencimiento
  const vigenciaFin = habilitacion.vigencia_fin ? new Date(habilitacion.vigencia_fin) : null
  const diasHastaVencimiento = vigenciaFin
    ? Math.floor((vigenciaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Titular
  const titular = habilitacion.habilitaciones_personas?.find((hp: any) => hp.rol === 'TITULAR')
  
  // Vehículo actual
  const vehiculoActual = habilitacion.habilitaciones_vehiculos?.[0]

  // Establecimientos
  const establecimientos = habilitacion.habilitaciones_establecimientos || []

  // Última inspección
  const ultimaInspeccion = inspecciones[0]

  // Construir contexto
  let contexto = `
=== DATOS GENERALES ===
Número de Licencia: ${habilitacion.nro_licencia || 'Sin asignar'}
Tipo de Transporte: ${habilitacion.tipo_transporte || 'No especificado'}
Estado: ${habilitacion.estado || 'No especificado'}
Expediente: ${habilitacion.expte || 'No especificado'}
Resolución: ${habilitacion.resolucion || 'No especificado'}

=== VIGENCIA ===
Fecha de Inicio: ${habilitacion.vigencia_inicio ? new Date(habilitacion.vigencia_inicio).toLocaleDateString('es-AR') : 'No especificada'}
Fecha de Fin: ${habilitacion.vigencia_fin ? new Date(habilitacion.vigencia_fin).toLocaleDateString('es-AR') : 'No especificada'}
Días hasta vencimiento: ${diasHastaVencimiento !== null ? (diasHastaVencimiento > 0 ? `${diasHastaVencimiento} días` : `VENCIDA hace ${Math.abs(diasHastaVencimiento)} días`) : 'No calculable'}
${diasHastaVencimiento !== null && diasHastaVencimiento < 30 && diasHastaVencimiento > 0 ? '⚠️ ALERTA: Vencimiento próximo' : ''}
${diasHastaVencimiento !== null && diasHastaVencimiento < 0 ? '🔴 CRÍTICO: Habilitación VENCIDA' : ''}

=== TITULAR ===
`
  
  if (titular?.persona) {
    contexto += `
Nombre: ${titular.persona.nombre || 'No especificado'}
DNI: ${titular.persona.dni || 'No especificado'}
Domicilio: ${titular.persona.domicilio || 'No especificado'}
Teléfono: ${titular.persona.telefono || 'No especificado'}
Email: ${titular.persona.email || 'No especificado'}
`
  } else {
    contexto += 'No hay titular asignado\n'
  }

  contexto += `
=== VEHÍCULO ACTUAL ===
`
  
  if (vehiculoActual?.vehiculo) {
    const v = vehiculoActual.vehiculo
    contexto += `
Dominio: ${v.dominio || 'No especificado'}
Marca: ${v.marca || 'No especificado'}
Modelo: ${v.modelo || 'No especificado'}
Año: ${v.ano || 'No especificado'}
Chasis: ${v.chasis || 'No especificado'}
Motor: ${v.motor || 'No especificado'}
Asientos: ${v.asientos || 'No especificado'}
VTV Vencimiento: ${v.Vencimiento_VTV ? new Date(v.Vencimiento_VTV).toLocaleDateString('es-AR') : 'No especificado'}
`
  } else {
    contexto += 'No hay vehículo asignado\n'
  }

  // Establecimientos (si es transporte escolar)
  if (establecimientos.length > 0) {
    contexto += `
=== ESTABLECIMIENTOS AUTORIZADOS ===
`
    establecimientos.forEach((he: any, index: number) => {
      if (he.establecimiento) {
        contexto += `
${index + 1}. ${he.establecimiento.nombre || 'Sin nombre'}
   Domicilio: ${he.establecimiento.domicilio || 'No especificado'}
   CUE: ${he.establecimiento.cue || 'No especificado'}
`
      }
    })
  }

  // Obleas
  if (habilitacion.oblea_historial && habilitacion.oblea_historial.length > 0) {
    contexto += `
=== OBLEAS EMITIDAS ===
Total de obleas: ${habilitacion.oblea_historial.length}
`
    habilitacion.oblea_historial.slice(0, 3).forEach((oblea: any, index: number) => {
      contexto += `
${index + 1}. Fecha: ${new Date(oblea.fecha_solicitud).toLocaleDateString('es-AR')} - Estado: ${oblea.estado || 'Sin estado'}
`
    })
  }

  // Inspecciones
  if (inspecciones.length > 0) {
    contexto += `
=== INSPECCIONES ===
Total de inspecciones: ${inspecciones.length}
`
    if (ultimaInspeccion) {
      const detallesAprobados = ultimaInspeccion.inspeccion_detalles?.filter((d: any) => d.estado === 'APROBADO').length || 0
      const detallesRechazados = ultimaInspeccion.inspeccion_detalles?.filter((d: any) => d.estado === 'RECHAZADO').length || 0
      const totalDetalles = ultimaInspeccion.inspeccion_detalles?.length || 0

      contexto += `
Última Inspección:
  Fecha: ${new Date(ultimaInspeccion.fecha_inspeccion).toLocaleDateString('es-AR')}
  Resultado: ${ultimaInspeccion.resultado_general || 'No especificado'}
  Items aprobados: ${detallesAprobados}/${totalDetalles}
  Items rechazados: ${detallesRechazados}/${totalDetalles}
  Observaciones: ${ultimaInspeccion.observaciones || 'Sin observaciones'}
`
    }
  }

  return contexto
}

/**
 * GET /api/habilitaciones/[id]/consultar-ia
 * 
 * Obtiene sugerencias de preguntas frecuentes
 */
export async function GET() {
  try {
    const sugerencias = [
      '¿Cuál es el estado actual de esta habilitación?',
      '¿Cuándo vence la habilitación?',
      '¿Tiene inspecciones pendientes?',
      '¿Cuáles son los datos del titular?',
      '¿Qué vehículo tiene asignado actualmente?',
      '¿Hay alguna alerta o problema?',
      '¿Cuántas obleas se han emitido?',
      '¿Cuándo fue la última inspección y cuál fue el resultado?',
      '¿Está vigente la habilitación?',
      '¿Qué documentación falta?',
    ]

    return NextResponse.json({
      success: true,
      data: {
        sugerencias,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al obtener sugerencias' },
      { status: 500 }
    )
  }
}
