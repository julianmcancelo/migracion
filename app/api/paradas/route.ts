import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/paradas
 * Obtener todas las paradas activas o filtradas (PÚBLICA)
 * Query params:
 * - tipo: filtrar por tipo (seguridad, transporte, semaforo, etc.)
 * - activo: true/false
 * - limite: resultados máximos
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo')
    const activoParam = searchParams.get('activo')
    const limite = parseInt(searchParams.get('limite') || '1000')

    const where: Prisma.paradasWhereInput = {}

    if (tipo) {
      where.tipo = tipo as any
    }

    if (activoParam !== null) {
      where.activo = activoParam === 'true'
    } else {
      where.activo = true // Por defecto solo mostrar activas
    }

    const paradas = await prisma.paradas.findMany({
      where,
      take: limite,
      orderBy: { creado_en: 'desc' },
      include: {
        imagenes: {
          orderBy: { orden: 'asc' },
        },
      },
    })

    // Convertir Decimal a number para JSON
    const paradasFormateadas = paradas.map(parada => ({
      ...parada,
      latitud: Number(parada.latitud),
      longitud: Number(parada.longitud),
    }))

    return NextResponse.json({
      success: true,
      data: paradasFormateadas,
      total: paradasFormateadas.length,
    })
  } catch (error: any) {
    console.error('Error al obtener paradas:', error)
    return NextResponse.json(
      { error: 'Error al obtener paradas', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/paradas
 * Crear una nueva parada
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { titulo, tipo, descripcion, latitud, longitud, estado, metadata, imagenes } = body

    // Validaciones básicas
    if (!titulo || !tipo || !latitud || !longitud) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: titulo, tipo, latitud, longitud' },
        { status: 400 }
      )
    }

    // Validar que las coordenadas sean números válidos
    const lat = parseFloat(latitud)
    const lng = parseFloat(longitud)

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Las coordenadas deben ser números válidos' },
        { status: 400 }
      )
    }

    const nuevaParada = await prisma.paradas.create({
      data: {
        titulo,
        tipo,
        descripcion: descripcion || null,
        latitud: lat,
        longitud: lng,
        estado: estado || 'ok',
        creado_por: session.userId || null,
        metadata: metadata || null,
        imagenes: imagenes ? {
          create: imagenes.map((img: any, index: number) => ({
            imagen_base64: img.imagen_base64,
            descripcion: img.descripcion || null,
            orden: img.orden || index,
          })),
        } : undefined,
      },
      include: {
        imagenes: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Parada creada exitosamente',
      data: {
        ...nuevaParada,
        latitud: Number(nuevaParada.latitud),
        longitud: Number(nuevaParada.longitud),
      },
    })
  } catch (error: any) {
    console.error('Error al crear parada:', error)
    return NextResponse.json(
      { error: 'Error al crear parada', details: error.message },
      { status: 500 }
    )
  }
}
