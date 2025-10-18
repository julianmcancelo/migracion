import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/establecimientos/[id]?tipo=establecimiento|remiseria
 * Obtener un establecimiento o remisería específico por ID
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

    const id = parseInt(params.id)
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo') || 'establecimiento'
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    let establecimiento

    if (tipo === 'remiseria') {
      establecimiento = await prisma.remiserias.findUnique({
        where: { id },
      })
      if (establecimiento) {
        establecimiento = {
          ...establecimiento,
          tipo_entidad: 'remiseria' as const
        }
      }
    } else {
      establecimiento = await prisma.establecimientos.findUnique({
        where: { id },
      })
      if (establecimiento) {
        establecimiento = {
          ...establecimiento,
          tipo_entidad: 'establecimiento' as const
        }
      }
    }

    if (!establecimiento) {
      return NextResponse.json({ error: 'Establecimiento no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: establecimiento,
    })

  } catch (error: any) {
    console.error('Error al obtener establecimiento:', error)
    return NextResponse.json(
      { error: 'Error al obtener establecimiento', details: error.message },
      { status: 500 }
    )
  }
}
