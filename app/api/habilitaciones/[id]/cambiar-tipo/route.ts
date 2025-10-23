import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/habilitaciones/[id]/cambiar-tipo
 * Cambia el tipo de una habilitación y registra la novedad
 * 
 * Body:
 * - tipo_nuevo: string (ej: "Alta", "Renovación", "Cambio de Material")
 * - observaciones?: string (opcional)
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

    // Solo admin puede cambiar tipo
    if (session.rol === 'demo' || session.rol === 'lector') {
      return NextResponse.json(
        { error: 'Sin permisos para modificar habilitaciones' },
        { status: 403 }
      )
    }

    const habilitacionId = parseInt(params.id)
    if (isNaN(habilitacionId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { tipo_nuevo, observaciones } = body

    if (!tipo_nuevo || tipo_nuevo.trim() === '') {
      return NextResponse.json(
        { error: 'El tipo nuevo es obligatorio' },
        { status: 400 }
      )
    }

    // Obtener habilitación actual
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId },
      select: {
        id: true,
        nro_licencia: true,
        tipo: true,
      },
    })

    if (!habilitacion) {
      return NextResponse.json(
        { error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    const tipoAnterior = habilitacion.tipo || 'Sin especificar'

    // Actualizar el tipo
    await prisma.habilitaciones_generales.update({
      where: { id: habilitacionId },
      data: {
        tipo: tipo_nuevo,
      },
    })

    // Registrar novedad en historial
    await prisma.habilitaciones_novedades.create({
      data: {
        habilitacion_id: habilitacionId,
        tipo_novedad: 'CAMBIO_TIPO',
        entidad_afectada: 'HABILITACION',
        entidad_id: habilitacionId,
        descripcion: `Cambio de tipo: ${tipoAnterior} → ${tipo_nuevo}`,
        datos_anteriores: JSON.stringify({ tipo: tipoAnterior }),
        datos_nuevos: JSON.stringify({ tipo: tipo_nuevo }),
        usuario_nombre: session.nombre || 'Sistema',
        observaciones: observaciones || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Tipo de habilitación actualizado exitosamente',
      data: {
        tipo_anterior: tipoAnterior,
        tipo_nuevo: tipo_nuevo,
      },
    })
  } catch (error: any) {
    console.error('Error al cambiar tipo de habilitación:', error)
    return NextResponse.json(
      {
        error: 'Error al cambiar tipo de habilitación',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
