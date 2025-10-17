import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/establecimientos
 * Buscar establecimientos o remiserías
 * Query params:
 * - buscar: término de búsqueda (nombre)
 * - tipo: 'establecimiento' | 'remiseria' (opcional)
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
    const tipo = searchParams.get('tipo') || null
    const limite = parseInt(searchParams.get('limite') || '20')

    if (buscar.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Ingrese al menos 2 caracteres para buscar',
      })
    }

    let resultados: any[] = []

    // Si es remiseria o no se especifica tipo, buscar en remiserias
    if (!tipo || tipo === 'remiseria') {
      const remiserias = await prisma.remiserias.findMany({
        where: {
          nombre: { contains: buscar },
        },
        take: limite,
        orderBy: { nombre: 'asc' },
      })

      resultados = [
        ...resultados,
        ...remiserias.map(r => ({
          ...r,
          tipo_entidad: 'remiseria' as const,
        })),
      ]
    }

    // Si es establecimiento o no se especifica tipo, buscar en establecimientos
    if (!tipo || tipo === 'establecimiento') {
      const establecimientos = await prisma.establecimientos.findMany({
        where: {
          nombre: { contains: buscar },
        },
        take: limite,
        orderBy: { nombre: 'asc' },
      })

      resultados = [
        ...resultados,
        ...establecimientos.map(e => ({
          ...e,
          tipo_entidad: 'establecimiento' as const,
        })),
      ]
    }

    // Limitar resultados totales
    resultados = resultados.slice(0, limite)

    return NextResponse.json({
      success: true,
      data: resultados,
    })

  } catch (error: any) {
    console.error('Error al buscar establecimientos:', error)
    return NextResponse.json(
      { error: 'Error al buscar establecimientos', details: error.message },
      { status: 500 }
    )
  }
}
