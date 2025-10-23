import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/personas/[id]
 * Obtener una persona específica por ID
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

    const persona = await prisma.personas.findUnique({
      where: { id },
    })

    if (!persona) {
      return NextResponse.json({ error: 'Persona no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: persona,
    })
  } catch (error: any) {
    console.error('Error al obtener persona:', error)
    return NextResponse.json(
      { error: 'Error al obtener persona', details: error.message },
      { status: 500 }
    )
  }
}
