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

/**
 * PUT /api/personas/[id]
 * Actualizar una persona existente
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Solo administradores pueden editar personas
    if (session.rol === 'demo') {
      return NextResponse.json({ error: 'Sin permisos para editar personas' }, { status: 403 })
    }

    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Verificar que la persona existe
    const personaExistente = await prisma.personas.findUnique({
      where: { id },
    })

    if (!personaExistente) {
      return NextResponse.json({ error: 'Persona no encontrada' }, { status: 404 })
    }

    const body = await request.json()

    // Validar que al menos venga el nombre
    if (!body.nombre || body.nombre.trim() === '') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }

    // Actualizar la persona (el DNI no se puede cambiar)
    const personaActualizada = await prisma.personas.update({
      where: { id },
      data: {
        nombre: body.nombre,
        genero: body.genero || null,
        cuit: body.cuit || null,
        telefono: body.telefono || null,
        email: body.email || null,
        domicilio_calle: body.domicilio_calle || null,
        domicilio_nro: body.domicilio_nro || null,
        domicilio_localidad: body.domicilio_localidad || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Persona actualizada exitosamente',
      data: personaActualizada,
    })
  } catch (error: any) {
    console.error('Error al actualizar persona:', error)
    return NextResponse.json(
      { error: 'Error al actualizar persona', details: error.message },
      { status: 500 }
    )
  }
}
