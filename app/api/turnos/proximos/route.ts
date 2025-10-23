import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/turnos/proximos
 * Obtiene los próximos turnos de inspección ordenados por fecha
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limite = parseInt(searchParams.get('limite') || '10')

    // Usar query raw para evitar campo fecha_hora corrupto
    const hoy = new Date().toISOString().split('T')[0]

    const turnosRaw: any[] = await prisma.$queryRaw`
      SELECT 
        t.id, t.habilitacion_id, t.fecha, t.hora, t.estado, 
        t.observaciones, t.recordatorio_enviado, t.creado_en
      FROM turnos t
      WHERE t.fecha >= ${hoy}
      AND t.estado != 'CANCELADO'
      ORDER BY t.fecha ASC, t.hora ASC
      LIMIT ${limite}
    `

    // Enriquecer con datos de habilitación
    const turnosFormateados = await Promise.all(
      turnosRaw.map(async turno => {
        const habilitacion = await prisma.habilitaciones_generales.findUnique({
          where: { id: turno.habilitacion_id },
          include: {
            habilitaciones_personas: {
              where: {
                rol: 'TITULAR',
              },
              include: {
                persona: {
                  select: {
                    nombre: true,
                    email: true,
                    dni: true,
                  },
                },
              },
              take: 1,
            },
            habilitaciones_vehiculos: {
              include: {
                vehiculo: {
                  select: {
                    dominio: true,
                    marca: true,
                    modelo: true,
                  },
                },
              },
              take: 1,
            },
          },
        })

        const titular = habilitacion?.habilitaciones_personas?.[0]?.persona
        const vehiculo = habilitacion?.habilitaciones_vehiculos?.[0]?.vehiculo

        return {
          id: turno.id,
          fecha: turno.fecha,
          hora: turno.hora,
          estado: turno.estado,
          observaciones: turno.observaciones,
          recordatorio_enviado: turno.recordatorio_enviado,
          habilitacion: {
            id: habilitacion?.id,
            nro_licencia: habilitacion?.nro_licencia,
            tipo_transporte: habilitacion?.tipo_transporte,
          },
          titular: titular
            ? {
                nombre: titular.nombre,
                email: titular.email,
                dni: titular.dni,
              }
            : null,
          vehiculo: vehiculo
            ? {
                dominio: vehiculo.dominio,
                marca: vehiculo.marca,
                modelo: vehiculo.modelo,
              }
            : null,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: turnosFormateados,
    })
  } catch (error) {
    console.error('Error al obtener próximos turnos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener próximos turnos' },
      { status: 500 }
    )
  }
}
