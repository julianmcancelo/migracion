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
    
    // Obtener turnos futuros que no estén cancelados
    const turnos = await prisma.turnos.findMany({
      where: {
        fecha: {
          gte: new Date() // Mayor o igual a hoy
        },
        estado: {
          not: 'CANCELADO'
        }
      },
      include: {
        habilitacion: {
          select: {
            id: true,
            nro_licencia: true,
            tipo_transporte: true,
            habilitaciones_personas: {
              where: {
                rol: 'TITULAR'
              },
              select: {
                persona: {
                  select: {
                    nombre: true,
                    email: true,
                    dni: true
                  }
                }
              },
              take: 1
            },
            habilitaciones_vehiculos: {
              select: {
                vehiculo: {
                  select: {
                    dominio: true,
                    marca: true,
                    modelo: true
                  }
                }
              },
              take: 1
            }
          }
        }
      },
      orderBy: [
        { fecha: 'asc' },
        { hora: 'asc' }
      ],
      take: limite
    })

    // Formatear datos
    const turnosFormateados = turnos.map(turno => {
      const titular = turno.habilitacion?.habilitaciones_personas?.[0]?.persona
      const vehiculo = turno.habilitacion?.habilitaciones_vehiculos?.[0]?.vehiculo

      return {
        id: turno.id,
        fecha: turno.fecha,
        hora: turno.hora,
        estado: turno.estado,
        observaciones: turno.observaciones,
        recordatorio_enviado: turno.recordatorio_enviado,
        habilitacion: {
          id: turno.habilitacion?.id,
          nro_licencia: turno.habilitacion?.nro_licencia,
          tipo_transporte: turno.habilitacion?.tipo_transporte
        },
        titular: titular ? {
          nombre: titular.nombre,
          email: titular.email,
          dni: titular.dni
        } : null,
        vehiculo: vehiculo ? {
          dominio: vehiculo.dominio,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo
        } : null
      }
    })

    return NextResponse.json({
      success: true,
      data: turnosFormateados
    })
  } catch (error) {
    console.error('Error al obtener próximos turnos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener próximos turnos' },
      { status: 500 }
    )
  }
}
