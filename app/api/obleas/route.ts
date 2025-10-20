import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/obleas
 * Obtiene todas las obleas con paginación y filtros
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '20')
    const busqueda = searchParams.get('busqueda') || ''
    const estado = searchParams.get('estado') || ''
    const fechaDesde = searchParams.get('fecha_desde') || ''
    const fechaHasta = searchParams.get('fecha_hasta') || ''
    const tipoTransporte = searchParams.get('tipo_transporte') || ''
    const notificado = searchParams.get('notificado') || ''
    
    const offset = (pagina - 1) * limite

    // Construir condiciones de búsqueda
    const whereConditions: any = {}
    
    // Filtro por búsqueda general
    if (busqueda) {
      whereConditions.OR = [
        {
          habilitaciones_generales: {
            nro_licencia: {
              contains: busqueda
            }
          }
        },
        {
          habilitaciones_generales: {
            habilitaciones_personas: {
              some: {
                persona: {
                  nombre: {
                    contains: busqueda
                  }
                }
              }
            }
          }
        },
        {
          habilitaciones_generales: {
            habilitaciones_vehiculos: {
              some: {
                vehiculo: {
                  dominio: {
                    contains: busqueda
                  }
                }
              }
            }
          }
        }
      ]
    }

    // Filtro por rango de fechas
    if (fechaDesde || fechaHasta) {
      whereConditions.fecha_solicitud = {}
      if (fechaDesde) {
        whereConditions.fecha_solicitud.gte = new Date(fechaDesde)
      }
      if (fechaHasta) {
        const fechaHastaDate = new Date(fechaHasta)
        fechaHastaDate.setHours(23, 59, 59, 999)
        whereConditions.fecha_solicitud.lte = fechaHastaDate
      }
    }

    // Filtro por tipo de transporte
    if (tipoTransporte) {
      whereConditions.habilitaciones_generales = {
        ...whereConditions.habilitaciones_generales,
        tipo_transporte: tipoTransporte
      }
    }

    // Filtro por estado de notificación
    if (notificado) {
      whereConditions.notificado = notificado
    }

    // Obtener obleas básicas primero
    const obleas = await prisma.oblea_historial.findMany({
      where: whereConditions,
      skip: offset,
      take: limite,
      orderBy: {
        fecha_solicitud: 'desc'
      },
      include: {
        habilitaciones_generales: true
      }
    })

    // Contar total para paginación
    const total = await prisma.oblea_historial.count({
      where: whereConditions
    })

    // Para cada oblea, cargar datos relacionados manualmente
    const obleasFormateadas = await Promise.all(
      obleas.map(async (oblea) => {
        // Obtener titular
        const titular = await prisma.habilitaciones_personas.findFirst({
          where: {
            habilitacion_id: oblea.habilitacion_id,
            rol: 'TITULAR'
          },
          include: {
            persona: {
              select: {
                nombre: true,
                dni: true
              }
            }
          }
        })

        // Obtener vehículo
        const vehiculoRel = await prisma.habilitaciones_vehiculos.findFirst({
          where: {
            habilitacion_id: oblea.habilitacion_id
          },
          include: {
            vehiculo: {
              select: {
                dominio: true,
                marca: true,
                modelo: true
              }
            }
          }
        })

        return {
          id: oblea.id,
          habilitacion_id: oblea.habilitacion_id,
          fecha_solicitud: oblea.fecha_solicitud,
          hora_solicitud: oblea.hora_solicitud,
          creado_en: oblea.creado_en,
          notificado: oblea.notificado,
          nro_licencia: oblea.habilitaciones_generales?.nro_licencia || 'N/A',
          tipo_transporte: oblea.habilitaciones_generales?.tipo_transporte || 'N/A',
          estado_habilitacion: oblea.habilitaciones_generales?.estado || 'N/A',
          titular: titular?.persona?.nombre || 'N/A',
          titular_dni: titular?.persona?.dni || 'N/A',
          vehiculo_dominio: vehiculoRel?.vehiculo?.dominio || 'N/A',
          vehiculo_marca: vehiculoRel?.vehiculo?.marca || 'N/A',
          vehiculo_modelo: vehiculoRel?.vehiculo?.modelo || 'N/A'
        }
      })
    )

    const totalPaginas = Math.ceil(total / limite)

    return NextResponse.json({
      success: true,
      data: obleasFormateadas,
      pagination: {
        pagina_actual: pagina,
        limite,
        total,
        total_paginas: totalPaginas
      }
    })

  } catch (error: any) {
    console.error('Error al obtener obleas:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener obleas',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/obleas
 * Crear nueva oblea manualmente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { habilitacion_id, observaciones } = body

    // Verificar que la habilitación existe
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacion_id }
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Crear nueva oblea
    const nuevaOblea = await prisma.oblea_historial.create({
      data: {
        habilitacion_id,
        fecha_solicitud: new Date(),
        hora_solicitud: new Date(),
        notificado: 'no'
      }
    })

    return NextResponse.json({
      success: true,
      data: nuevaOblea,
      message: 'Oblea creada exitosamente'
    })

  } catch (error: any) {
    console.error('Error al crear oblea:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear oblea',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
