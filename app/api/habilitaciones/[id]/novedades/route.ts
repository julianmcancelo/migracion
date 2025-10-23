import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

/**
 * GET /api/habilitaciones/[id]/novedades
 * 
 * Obtiene todas las novedades/auditoría de una habilitación
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = params
    const habilitacionId = parseInt(id)

    if (isNaN(habilitacionId)) {
      return NextResponse.json(
        { success: false, error: 'ID de habilitación inválido' },
        { status: 400 }
      )
    }

    // Obtener todas las novedades
    const novedades = await prisma.habilitaciones_novedades.findMany({
      where: {
        habilitacion_id: habilitacionId,
      },
      orderBy: {
        fecha_novedad: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        novedades,
        total: novedades.length,
      },
    })
  } catch (error) {
    console.error('Error al obtener novedades:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener novedades',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/habilitaciones/[id]/novedades
 * 
 * Registra una novedad manualmente
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = params
    const habilitacionId = parseInt(id)

    if (isNaN(habilitacionId)) {
      return NextResponse.json(
        { success: false, error: 'ID de habilitación inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      tipo_novedad,
      entidad_afectada,
      entidad_id,
      descripcion,
      datos_anteriores,
      datos_nuevos,
      observaciones,
    } = body

    if (!tipo_novedad || !entidad_afectada || !descripcion) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Crear novedad
    const novedad = await prisma.habilitaciones_novedades.create({
      data: {
        habilitacion_id: habilitacionId,
        tipo_novedad,
        entidad_afectada,
        entidad_id: entidad_id ? parseInt(entidad_id) : null,
        descripcion,
        datos_anteriores: datos_anteriores ? JSON.stringify(datos_anteriores) : null,
        datos_nuevos: datos_nuevos ? JSON.stringify(datos_nuevos) : null,
        usuario_nombre: session.nombre || 'Sistema',
        observaciones,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Novedad registrada exitosamente',
      data: novedad,
    })
  } catch (error) {
    console.error('Error al registrar novedad:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al registrar novedad',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
