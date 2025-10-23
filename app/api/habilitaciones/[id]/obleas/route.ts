import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/[id]/obleas
 * Obtiene el historial de obleas de una habilitación
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const obleas = await prisma.oblea_historial.findMany({
      where: {
        habilitacion_id: Number(id),
      },
      orderBy: { fecha_solicitud: 'desc' },
    })

    // Obtener información de la habilitación para el número de licencia
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: Number(id) },
      select: { nro_licencia: true },
    })

    // Agregar número de licencia a cada oblea
    const obleasConLicencia = obleas.map(oblea => ({
      ...oblea,
      nro_licencia: habilitacion?.nro_licencia || 'N/A',
      estado: 'ENTREGADA', // Por ahora todas las obleas en historial están entregadas
      fecha_entrega: oblea.fecha_solicitud, // Usar fecha_solicitud como fecha_entrega
      observaciones: 'Oblea registrada en el sistema',
    }))

    return NextResponse.json({
      success: true,
      data: obleasConLicencia,
    })
  } catch (error) {
    console.error('Error al obtener obleas:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener obleas' }, { status: 500 })
  }
}
