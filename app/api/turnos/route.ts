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

    // Construir filtros WHERE
    let whereClause = "WHERE t.fecha > '1970-01-01'"
    const params: any[] = []

    if (estado) {
      whereClause += ' AND t.estado = ?'
      params.push(estado)
    }

    if (fechaDesde) {
      whereClause += ' AND t.fecha >= ?'
      params.push(fechaDesde)
    }

    if (fechaHasta) {
      whereClause += ' AND t.fecha <= ?'
      params.push(fechaHasta)
    }

    if (habilitacionId) {
      whereClause += ' AND t.habilitacion_id = ?'
      params.push(Number(habilitacionId))
    }

    // SQL optimizado con LEFT JOINs (como en inspecciones)
    const sql = `
      SELECT 
        t.id,
        t.habilitacion_id,
        t.fecha,
        t.hora,
        t.estado,
        t.observaciones,
        t.recordatorio_enviado,
        t.creado_en,
        hg.nro_licencia,
        hg.tipo_transporte,
        p.nombre as titular_nombre,
        p.dni as titular_dni,
        p.email as titular_email,
        p.telefono as titular_telefono,
        v.dominio as vehiculo_patente,
        v.marca as vehiculo_marca,
        v.modelo as vehiculo_modelo
      FROM turnos AS t
      LEFT JOIN habilitaciones_generales AS hg ON t.habilitacion_id = hg.id
      LEFT JOIN habilitaciones_personas AS hp ON hg.id = hp.habilitacion_id AND hp.rol = 'TITULAR'
      LEFT JOIN personas AS p ON hp.persona_id = p.id
      LEFT JOIN habilitaciones_vehiculos AS hv ON hg.id = hv.habilitacion_id
      LEFT JOIN vehiculos AS v ON hv.vehiculo_id = v.id
      ${whereClause}
      ORDER BY t.fecha ASC, t.hora ASC
      LIMIT 100
    `

    // Ejecutar query raw SQL
    const turnos: any[] = await prisma.$queryRawUnsafe(sql, ...params)

    // Formatear datos
    const turnosFormateados = turnos.map((turno: any) => ({
      id: turno.id,
      habilitacion_id: turno.habilitacion_id,
      fecha: turno.fecha,
      hora: turno.hora,
      estado: turno.estado,
      observaciones: turno.observaciones,
      recordatorio_enviado: turno.recordatorio_enviado,
      creado_en: turno.creado_en,
      habilitacion: {
        id: turno.habilitacion_id,
        nro_licencia: turno.nro_licencia || 'N/A',
        tipo_transporte: turno.tipo_transporte || 'N/A',
      },
      titular_nombre: turno.titular_nombre || 'Sin datos',
      titular_dni: turno.titular_dni || '',
      titular_email: turno.titular_email || '',
      titular_telefono: turno.titular_telefono || '',
      vehiculo_patente: turno.vehiculo_patente || 'Sin patente',
      vehiculo_marca: turno.vehiculo_marca || '',
      vehiculo_modelo: turno.vehiculo_modelo || '',
    }))

    return NextResponse.json({
      success: true,
      data: turnosFormateados,
      total: turnosFormateados.length,
    })
  } catch (error) {
    console.error('Error al obtener turnos:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener turnos' }, { status: 500 })
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
      where: { id: Number(habilitacion_id) },
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
        estado: 'PENDIENTE',
      },
    })

    // Obtener datos del titular para enviar email
    // @ts-expect-error
    const habPersona: any = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: Number(habilitacion_id),
        rol: 'TITULAR',
      },
      // @ts-expect-error
      include: {
        persona: true,
      },
    })

    // Enviar email de confirmación si tiene email
    if (habPersona?.persona?.email) {
      try {
        // Obtener datos del vehículo
        // @ts-expect-error
        const habVehiculo: any = await prisma.habilitaciones_vehiculos.findFirst({
          where: { habilitacion_id: Number(habilitacion_id) },
          // @ts-expect-error
          include: { vehiculo: true },
        })

        await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/turnos/enviar-email`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              turno_id: turno.id,
              email: habPersona.persona.email,
              nombre: habPersona.persona.nombre,
              dni: habPersona.persona.dni,
              telefono: habPersona.persona.telefono,
              nro_licencia: habilitacion.nro_licencia,
              fecha: fecha,
              hora: hora,
              tipo_transporte: habilitacion.tipo_transporte,
              vehiculo_patente: habVehiculo?.vehiculo?.dominio,
              vehiculo_marca: habVehiculo?.vehiculo?.marca,
              vehiculo_modelo: habVehiculo?.vehiculo?.modelo,
            }),
          }
        )
        console.log('Email de confirmación enviado a:', habPersona.persona.email)
      } catch (emailError) {
        console.error('Error al enviar email, pero turno creado:', emailError)
        // No fallar si el email falla, el turno ya está creado
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: turno,
        email_enviado: !!habPersona?.persona?.email,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear turno:', error)
    return NextResponse.json({ success: false, error: 'Error al crear turno' }, { status: 500 })
  }
}
