import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/turnos - Listar turnos con filtros
 * Query params:
 * - estado: PENDIENTE | CONFIRMADO | FINALIZADO | CANCELADO
 * - fecha_desde: ISO date
 * - fecha_hasta: ISO date
 * - habilitacion_id: number
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const fechaDesde = searchParams.get('fecha_desde')
    const fechaHasta = searchParams.get('fecha_hasta')
    const habilitacionId = searchParams.get('habilitacion_id')

    // Construir filtros
    const where: any = {}

    if (estado) {
      where.estado = estado
    }

    if (fechaDesde || fechaHasta) {
      where.fecha = {}
      if (fechaDesde) {
        where.fecha.gte = new Date(fechaDesde)
      }
      if (fechaHasta) {
        where.fecha.lte = new Date(fechaHasta)
      }
    }

    if (habilitacionId) {
      where.habilitacion_id = Number(habilitacionId)
    }

    // Obtener turnos
    const turnos = await prisma.turnos.findMany({
      where,
      orderBy: [
        { fecha: 'asc' },
        { hora: 'asc' }
      ],
      take: 100
    })

    // Obtener información de habilitaciones para cada turno
    const turnosConInfo = await Promise.all(
      turnos.map(async (turno) => {
        const habilitacion = await prisma.habilitaciones_generales.findUnique({
          where: { id: turno.habilitacion_id },
          select: {
            id: true,
            nro_licencia: true,
            tipo_transporte: true,
          }
        })

        return {
          ...turno,
          habilitacion
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: turnosConInfo,
      total: turnosConInfo.length
    })

  } catch (error) {
    console.error('Error al obtener turnos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener turnos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/turnos - Crear nuevo turno
 * Body:
 * {
 *   habilitacion_id: number
 *   fecha: string (ISO date)
 *   hora: string (HH:mm)
 *   observaciones?: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { habilitacion_id, fecha, hora, observaciones } = body

    // Validaciones
    if (!habilitacion_id || !fecha || !hora) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Verificar que la habilitación existe
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: Number(habilitacion_id) }
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Crear fecha_hora combinada
    const fechaDate = new Date(fecha)
    const [horas, minutos] = hora.split(':')
    const fechaHora = new Date(fechaDate)
    fechaHora.setHours(Number(horas), Number(minutos), 0, 0)

    // Crear turno
    const turno = await prisma.turnos.create({
      data: {
        habilitacion_id: Number(habilitacion_id),
        fecha: fechaDate,
        hora: new Date(`1970-01-01T${hora}:00`),
        fecha_hora: fechaHora,
        observaciones: observaciones || null,
        estado: 'PENDIENTE'
      }
    })

    // Obtener datos del titular para enviar email
    // @ts-ignore
    const habPersona: any = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: Number(habilitacion_id),
        rol: 'TITULAR'
      },
      // @ts-ignore
      include: {
        persona: true
      }
    })

    // Enviar email de confirmación si tiene email
    if (habPersona?.persona?.email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/turnos/enviar-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: habPersona.persona.email,
            nombre: habPersona.persona.nombre,
            nro_licencia: habilitacion.nro_licencia,
            fecha: fecha,
            hora: hora,
            tipo_transporte: habilitacion.tipo_transporte
          })
        })
        console.log('Email de confirmación enviado a:', habPersona.persona.email)
      } catch (emailError) {
        console.error('Error al enviar email, pero turno creado:', emailError)
        // No fallar si el email falla, el turno ya está creado
      }
    }

    return NextResponse.json({
      success: true,
      data: turno,
      email_enviado: !!habPersona?.persona?.email
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear turno:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear turno' },
      { status: 500 }
    )
  }
}
