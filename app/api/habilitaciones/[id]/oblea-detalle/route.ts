import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * GET /api/habilitaciones/[id]/oblea-detalle
 * Devuelve el último registro de oblea colocada para una habilitación,
 * incluyendo rutas de foto y firmas para consulta.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 })
    }

    const oblea = await prisma.obleas.findFirst({
      where: { habilitacion_id: Number(id) },
      orderBy: { fecha_colocacion: 'desc' },
    })

    if (!oblea) {
      return NextResponse.json({ success: false, error: 'No hay oblea registrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: oblea.id,
        fecha_colocacion: oblea.fecha_colocacion,
        path_foto: oblea.path_foto,
        path_firma_receptor: oblea.path_firma_receptor,
        path_firma_inspector: oblea.path_firma_inspector,
      },
    })
  } catch (error) {
    console.error('Error al obtener detalle de oblea:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener detalle de oblea' },
      { status: 500 }
    )
  }
}
