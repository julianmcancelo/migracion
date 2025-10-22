import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/obleas/export
 * Exporta obleas a CSV con filtros aplicados
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formato = searchParams.get('formato') || 'csv'
    const busqueda = searchParams.get('busqueda') || ''
    const fechaDesde = searchParams.get('fecha_desde') || ''
    const fechaHasta = searchParams.get('fecha_hasta') || ''
    const tipoTransporte = searchParams.get('tipo_transporte') || ''
    const notificado = searchParams.get('notificado') || ''

    // Construir condiciones de búsqueda (misma lógica que la API principal)
    const whereConditions: any = {}
    
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

    if (tipoTransporte) {
      whereConditions.habilitaciones_generales = {
        ...whereConditions.habilitaciones_generales,
        tipo_transporte: tipoTransporte
      }
    }

    if (notificado) {
      whereConditions.notificado = notificado
    }

    // Obtener todas las obleas (sin paginación para export)
    const obleas = await prisma.oblea_historial.findMany({
      where: whereConditions,
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

    // Formatear datos para export
    const datosExport = obleas.map(oblea => ({
      'ID Oblea': oblea.id,
      'Número Licencia': oblea.habilitaciones_generales?.nro_licencia || 'N/A',
      'Tipo Transporte': oblea.habilitaciones_generales?.tipo_transporte || 'N/A',
      'Estado Habilitación': oblea.habilitaciones_generales?.estado || 'N/A',
      'Titular': oblea.habilitaciones_generales?.habilitaciones_personas[0]?.persona?.nombre || 'N/A',
      'DNI Titular': oblea.habilitaciones_generales?.habilitaciones_personas[0]?.persona?.dni || 'N/A',
      'Dominio Vehículo': oblea.habilitaciones_generales?.habilitaciones_vehiculos[0]?.vehiculo?.dominio || 'N/A',
      'Marca Vehículo': oblea.habilitaciones_generales?.habilitaciones_vehiculos[0]?.vehiculo?.marca || 'N/A',
      'Modelo Vehículo': oblea.habilitaciones_generales?.habilitaciones_vehiculos[0]?.vehiculo?.modelo || 'N/A',
      'Fecha Solicitud': oblea.fecha_solicitud?.toLocaleDateString('es-AR') || 'N/A',
      'Hora Solicitud': oblea.hora_solicitud?.toLocaleTimeString('es-AR') || 'N/A',
      'Estado Notificación': oblea.notificado === 'si' ? 'Notificada' : 'Pendiente',
      'Fecha Creación': oblea.creado_en?.toLocaleDateString('es-AR') || 'N/A'
    }))

    if (formato === 'csv') {
      // Generar CSV
      const headers = Object.keys(datosExport[0] || {})
      const csvContent = [
        headers.join(','),
        ...datosExport.map(row => 
          headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
        )
      ].join('\n')

      const fechaActual = new Date().toISOString().split('T')[0]
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="obleas_export_${fechaActual}.csv"`
        }
      })
    }

    // Por defecto retornar JSON
    return NextResponse.json({
      success: true,
      data: datosExport,
      total: datosExport.length,
      fecha_export: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error al exportar obleas:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al exportar obleas',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
