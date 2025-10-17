import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/personas
 * Buscar personas por nombre o DNI
 * Query params:
 * - buscar: término de búsqueda (nombre o DNI)
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

    // Buscar personas por nombre o DNI
    const personas = await prisma.personas.findMany({
      where: {
        OR: [
          { nombre: { contains: buscar } },
          { dni: { contains: buscar } },
        ],
      },
      take: limite,
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: personas,
    })

  } catch (error: any) {
    console.error('Error al buscar personas:', error)
    return NextResponse.json(
      { error: 'Error al buscar personas', details: error.message },
      { status: 500 }
    )
  }
}
