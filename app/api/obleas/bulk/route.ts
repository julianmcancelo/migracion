import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * PUT /api/obleas/bulk
 * Actualización masiva de obleas
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { accion, obleas_ids, datos_actualizacion } = body

    if (!accion || !obleas_ids || !Array.isArray(obleas_ids)) {
      return NextResponse.json(
        { success: false, error: 'Parámetros inválidos' },
        { status: 400 }
      )
    }

    let resultado: any = {}

    switch (accion) {
      case 'marcar_notificadas':
        resultado = await prisma.oblea_historial.updateMany({
          where: {
            id: {
              in: obleas_ids
            }
          },
          data: {
            notificado: 'si'
          }
        })
        break

      case 'marcar_pendientes':
        resultado = await prisma.oblea_historial.updateMany({
          where: {
            id: {
              in: obleas_ids
            }
          },
          data: {
            notificado: 'no'
          }
        })
        break

      case 'eliminar_masivo':
        resultado = await prisma.oblea_historial.deleteMany({
          where: {
            id: {
              in: obleas_ids
            }
          }
        })
        break

      case 'actualizar_fecha':
        if (!datos_actualizacion?.nueva_fecha) {
          return NextResponse.json(
            { success: false, error: 'Fecha requerida para actualización' },
            { status: 400 }
          )
        }
        resultado = await prisma.oblea_historial.updateMany({
          where: {
            id: {
              in: obleas_ids
            }
          },
          data: {
            fecha_solicitud: new Date(datos_actualizacion.nueva_fecha)
          }
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: resultado,
      message: `Acción "${accion}" aplicada a ${resultado.count} obleas`,
      obleas_afectadas: resultado.count
    })

  } catch (error: any) {
    console.error('Error en actualización masiva:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error en actualización masiva',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/obleas/bulk
 * Creación masiva de obleas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { habilitaciones_ids } = body

    if (!habilitaciones_ids || !Array.isArray(habilitaciones_ids)) {
      return NextResponse.json(
        { success: false, error: 'Lista de habilitaciones requerida' },
        { status: 400 }
      )
    }

    // Verificar que todas las habilitaciones existen y están HABILITADAS
    const habilitaciones = await prisma.habilitaciones_generales.findMany({
      where: {
        id: {
          in: habilitaciones_ids
        },
        estado: 'HABILITADO'
      }
    })

    if (habilitaciones.length !== habilitaciones_ids.length) {
      return NextResponse.json(
        { success: false, error: 'Algunas habilitaciones no existen o no están HABILITADAS' },
        { status: 400 }
      )
    }

    // Crear obleas masivamente
    const obleasCreadas = await Promise.all(
      habilitaciones_ids.map(async (habilitacion_id: number) => {
        return await prisma.oblea_historial.create({
          data: {
            habilitacion_id,
            fecha_solicitud: new Date(),
            hora_solicitud: new Date(),
            notificado: 'no'
          }
        })
      })
    )

    return NextResponse.json({
      success: true,
      data: obleasCreadas,
      message: `${obleasCreadas.length} obleas creadas exitosamente`,
      obleas_creadas: obleasCreadas.length
    })

  } catch (error: any) {
    console.error('Error en creación masiva:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error en creación masiva',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
