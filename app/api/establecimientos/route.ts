import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/establecimientos
 * Obtiene TODOS los establecimientos y remiserías unificados
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener establecimientos educativos
    const establecimientos = await prisma.establecimientos.findMany({
      orderBy: { nombre: 'asc' },
    })

    // Obtener remiserías
    const remiserias = await prisma.remiserias.findMany({
      orderBy: { nombre: 'asc' },
    })

    // Unificar formato
    const establecimientosFormateados = establecimientos.map(e => ({
      id: `E-${e.id}`,
      id_real: e.id,
      nombre: e.nombre || '',
      tipo: 'ESCUELA' as const,
      direccion: e.direccion || e.domicilio || '',
      latitud: e.latitud ? parseFloat(e.latitud.toString()) : null,
      longitud: e.longitud ? parseFloat(e.longitud.toString()) : null,
      telefono: null,
      email: null,
      responsable: null,
      activo: true,
    }))

    const remiseriasFormateadas = remiserias.map(r => ({
      id: `R-${r.id}`,
      id_real: r.id,
      nombre: r.nombre,
      tipo: 'REMISERIA' as const,
      direccion: r.direccion || '',
      latitud: r.latitud ? parseFloat(r.latitud.toString()) : null,
      longitud: r.longitud ? parseFloat(r.longitud.toString()) : null,
      telefono: null,
      email: null,
      responsable: null,
      activo: true,
    }))

    const todos = [...establecimientosFormateados, ...remiseriasFormateadas]

    return NextResponse.json({
      success: true,
      data: todos,
    })
  } catch (error: any) {
    console.error('Error al obtener establecimientos:', error)
    return NextResponse.json(
      { error: 'Error al obtener establecimientos', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/establecimientos
 * Crea un nuevo establecimiento o remisería
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, tipo, direccion, latitud, longitud, telefono, email, responsable, observaciones, activo } = body

    if (!nombre || !tipo || !direccion) {
      return NextResponse.json(
        { error: 'Nombre, tipo y dirección son obligatorios' },
        { status: 400 }
      )
    }

    if (tipo === 'ESCUELA') {
      // Crear en tabla establecimientos
      const nuevo = await prisma.establecimientos.create({
        data: {
          habilitacion_id: 0, // Temporal
          nombre,
          domicilio: direccion,
          localidad: 'Lanús',
          latitud: latitud || null,
          longitud: longitud || null,
          direccion,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Establecimiento creado exitosamente',
        data: nuevo,
      }, { status: 201 })
    } else if (tipo === 'REMISERIA') {
      // Crear en tabla remiserias
      const nuevo = await prisma.remiserias.create({
        data: {
          nombre,
          direccion,
          latitud: latitud || null,
          longitud: longitud || null,
          localidad: 'Lanús',
          nro_habilitacion: `REM-${Date.now()}`,
          nro_expediente: `EXP-${Date.now()}`,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Remisería creada exitosamente',
        data: nuevo,
      }, { status: 201 })
    } else {
      return NextResponse.json(
        { error: 'Tipo inválido' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error al crear establecimiento:', error)
    return NextResponse.json(
      { error: 'Error al crear establecimiento', details: error.message },
      { status: 500 }
    )
  }
}
