import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/vehiculos/[id]
 * Obtener un vehículo específico por ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const vehiculo = await prisma.vehiculos.findUnique({
      where: { id },
    })

    if (!vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: vehiculo,
    })
  } catch (error: any) {
    console.error('Error al obtener vehículo:', error)
    return NextResponse.json(
      { error: 'Error al obtener vehículo', details: error.message },
      { status: 500 }
    )
  }
}
