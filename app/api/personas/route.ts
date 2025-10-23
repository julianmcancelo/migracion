import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { crearPersonaSchema } from '@/lib/validations/persona'

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
        OR: [{ nombre: { contains: buscar } }, { dni: { contains: buscar } }],
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

/**
 * POST /api/personas
 * Crear una nueva persona
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Solo administradores pueden crear personas
    if (session.rol === 'demo') {
      return NextResponse.json({ error: 'Sin permisos para crear personas' }, { status: 403 })
    }

    const body = await request.json()

    // Validar datos con Zod
    const validacion = crearPersonaSchema.safeParse(body)
    if (!validacion.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validacion.error.errors,
        },
        { status: 400 }
      )
    }

    const datos = validacion.data

    // Verificar que el DNI no exista
    const personaExistente = await prisma.personas.findUnique({
      where: { dni: datos.dni },
    })

    if (personaExistente) {
      return NextResponse.json(
        {
          error: 'Ya existe una persona con ese DNI',
        },
        { status: 409 }
      )
    }

    // Crear la persona
    const nuevaPersona = await prisma.personas.create({
      data: {
        nombre: datos.nombre,
        dni: datos.dni,
        genero: datos.genero,
        cuit: datos.cuit || null,
        telefono: datos.telefono || null,
        email: datos.email || null,
        domicilio_calle: datos.domicilio_calle || null,
        domicilio_nro: datos.domicilio_nro || null,
        domicilio_localidad: datos.domicilio_localidad || null,
        domicilio: 0, // Valor por defecto según el schema
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Persona creada exitosamente',
        data: nuevaPersona,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error al crear persona:', error)
    return NextResponse.json(
      { error: 'Error al crear persona', details: error.message },
      { status: 500 }
    )
  }
}
