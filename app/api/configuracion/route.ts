import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/configuracion
 * Obtener la configuración de la aplicación (PÚBLICA)
 */
export async function GET() {
  try {
    // Obtener la primera configuración (solo debería haber una)
    let config = await prisma.configuracion_app.findFirst()

    // Si no existe, crear una por defecto
    if (!config) {
      config = await prisma.configuracion_app.create({
        data: {
          titulo: 'Sistema de Gestión Municipal',
          subtitulo: 'Municipio de Lanús',
          color_primario: '#2563eb',
          color_secundario: '#1e40af',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: config,
    })
  } catch (error: any) {
    console.error('Error al obtener configuración:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/configuracion
 * Actualizar la configuración de la aplicación (requiere autenticación admin)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      titulo,
      subtitulo,
      logo_base64,
      favicon_base64,
      color_primario,
      color_secundario,
      pie_pagina,
    } = body

    // Buscar la configuración existente
    let config = await prisma.configuracion_app.findFirst()

    if (config) {
      // Actualizar
      config = await prisma.configuracion_app.update({
        where: { id: config.id },
        data: {
          ...(titulo !== undefined && { titulo }),
          ...(subtitulo !== undefined && { subtitulo }),
          ...(logo_base64 !== undefined && { logo_base64 }),
          ...(favicon_base64 !== undefined && { favicon_base64 }),
          ...(color_primario !== undefined && { color_primario }),
          ...(color_secundario !== undefined && { color_secundario }),
          ...(pie_pagina !== undefined && { pie_pagina }),
          actualizado_por: session.userId,
        },
      })
    } else {
      // Crear
      config = await prisma.configuracion_app.create({
        data: {
          titulo: titulo || 'Sistema de Gestión Municipal',
          subtitulo,
          logo_base64,
          favicon_base64,
          color_primario: color_primario || '#2563eb',
          color_secundario: color_secundario || '#1e40af',
          pie_pagina,
          actualizado_por: session.userId,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      data: config,
    })
  } catch (error: any) {
    console.error('Error al actualizar configuración:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración', details: error.message },
      { status: 500 }
    )
  }
}
