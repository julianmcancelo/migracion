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

/**
 * POST /api/vehiculos
 * Crear un nuevo vehículo
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      dominio,
      marca,
      modelo,
      tipo,
      ano,
      chasis,
      motor,
      asientos,
      inscripcion_inicial,
      Aseguradora,
      poliza,
      Vencimiento_VTV,
      Vencimiento_Poliza
    } = body

    // Validación básica
    if (!dominio || dominio.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El dominio es obligatorio' },
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const existente = await prisma.vehiculos.findFirst({
      where: { dominio: dominio.toUpperCase() }
    })

    if (existente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un vehículo con ese dominio' },
        { status: 409 }
      )
    }

    // Crear vehículo
    const vehiculo = await prisma.vehiculos.create({
      data: {
        dominio: dominio.toUpperCase(),
        marca: marca || null,
        modelo: modelo || null,
        tipo: tipo || null,
        ano: ano || null,
        chasis: chasis || null,
        motor: motor || null,
        asientos: asientos || null,
        inscripcion_inicial: inscripcion_inicial || null,
        Aseguradora: Aseguradora || null,
        poliza: poliza || null,
        Vencimiento_VTV: Vencimiento_VTV || null,
        Vencimiento_Poliza: Vencimiento_Poliza || null
      }
    })

    return NextResponse.json({
      success: true,
      data: vehiculo,
      message: 'Vehículo registrado exitosamente'
    })

  } catch (error: any) {
    console.error('Error al crear vehículo:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear vehículo', details: error.message },
      { status: 500 }
    )
  }
}
