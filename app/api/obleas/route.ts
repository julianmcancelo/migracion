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
    
    const offset = (pagina - 1) * limite

    // Construir condiciones de búsqueda
    const whereConditions: any = {}
    
    if (busqueda) {
      whereConditions.OR = [
        {
          nro_licencia: {
            contains: busqueda
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
        }
      ]
    }

    // Obtener obleas con información relacionada
    const obleas = await prisma.oblea_historial.findMany({
      where: whereConditions,
      skip: offset,
      take: limite,
      orderBy: {
        fecha_solicitud: 'desc'
      },
      include: {
        habilitaciones_generales: {
          include: {
            habilitaciones_personas: {
              where: { rol: 'TITULAR' },
              include: {
                persona: {
                  select: {
                    nombre: true,
                    dni: true
                  }
                }
              },
              take: 1
            },
            habilitaciones_vehiculos: {
              include: {
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
      }
    })

    // Contar total para paginación
    const total = await prisma.oblea_historial.count({
      where: whereConditions
    })

    // Formatear datos
    const obleasFormateadas = obleas.map(oblea => ({
      id: oblea.id,
      habilitacion_id: oblea.habilitacion_id,
      fecha_solicitud: oblea.fecha_solicitud,
      hora_solicitud: oblea.hora_solicitud,
      creado_en: oblea.creado_en,
      notificado: oblea.notificado,
      nro_licencia: oblea.habilitaciones_generales?.nro_licencia || 'N/A',
      tipo_transporte: oblea.habilitaciones_generales?.tipo_transporte || 'N/A',
      estado_habilitacion: oblea.habilitaciones_generales?.estado || 'N/A',
      titular: oblea.habilitaciones_generales?.habilitaciones_personas[0]?.persona?.nombre || 'N/A',
      titular_dni: oblea.habilitaciones_generales?.habilitaciones_personas[0]?.persona?.dni || 'N/A',
      vehiculo_dominio: oblea.habilitaciones_generales?.habilitaciones_vehiculos[0]?.vehiculo?.dominio || 'N/A',
      vehiculo_marca: oblea.habilitaciones_generales?.habilitaciones_vehiculos[0]?.vehiculo?.marca || 'N/A',
      vehiculo_modelo: oblea.habilitaciones_generales?.habilitaciones_vehiculos[0]?.vehiculo?.modelo || 'N/A'
    }))

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
