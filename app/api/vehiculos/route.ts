import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/vehiculos
 * Buscar vehículos por dominio, marca o modelo
 * Query params:
 * - buscar: término de búsqueda (dominio, marca, modelo)
 * - limite: resultados máximos (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const buscar = searchParams.get('buscar') || ''
    const limite = parseInt(searchParams.get('limite') || '20')

    if (buscar.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Ingrese al menos 2 caracteres para buscar',
      })
    }

    // Buscar vehículos por dominio, marca o modelo
    const vehiculos = await prisma.vehiculos.findMany({
      where: {
        OR: [
          { dominio: { contains: buscar } },
          { marca: { contains: buscar } },
          { modelo: { contains: buscar } },
        ],
      },
      take: limite,
      orderBy: { dominio: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: vehiculos,
    })

  } catch (error: any) {
    console.error('Error al buscar vehículos:', error)
    return NextResponse.json(
      { error: 'Error al buscar vehículos', details: error.message },
      { status: 500 }
    )
  }
}
