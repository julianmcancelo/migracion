import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Marcar como ruta dinámica
export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones
 * Obtiene lista de habilitaciones con filtros y paginación
 * 
 * Query params:
 * - tipo: 'Escolar' | 'Remis' | 'Demo'
 * - buscar: término de búsqueda (licencia, expediente, titular)
 * - pagina: número de página (default: 1)
 * - limite: resultados por página (default: 15)
 * - ordenar: campo de ordenamiento (default: 'id_desc')
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo') || 'Escolar'
    const buscar = searchParams.get('buscar') || ''
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '15')
    const ordenarParam = searchParams.get('ordenar') || 'id_desc'

    // Validar tipo de transporte según rol
    const tiposPermitidos = session.rol === 'demo' 
      ? ['Demo'] 
      : ['Escolar', 'Remis']

    if (!tiposPermitidos.includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo de transporte no permitido' },
        { status: 403 }
      )
    }

    // Configurar ordenamiento
    const ordenamientos: Record<string, any> = {
      'id_desc': { id: 'desc' },
      'licencia_asc': { nro_licencia: 'asc' },
      'licencia_desc': { nro_licencia: 'desc' },
    }
    const orderBy = ordenamientos[ordenarParam] || ordenamientos['id_desc']

    // Construir filtros
    const where: any = {
      tipo_transporte: tipo,
      is_deleted: false,
    }

    // Agregar búsqueda si existe
    if (buscar) {
      where.OR = [
        { nro_licencia: { contains: buscar } },
        { expte: { contains: buscar } },
      ]
    }

    // Calcular offset
    const skip = (pagina - 1) * limite

    // Obtener total de registros
    const total = await prisma.habilitaciones_generales.count({ where })

    // Obtener habilitaciones con relaciones (usando any temporalmente)
    const habilitaciones = await prisma.habilitaciones_generales.findMany({
      where,
      orderBy,
      skip,
      take: limite,
      include: {
        habilitaciones_personas: {
          where: {
            rol: { not: null },
          },
          include: {
            persona: true,
          },
        },
        habilitaciones_vehiculos: {
          include: {
            vehiculo: true,
          },
        },
        habilitaciones_establecimientos: true,
        habilitaciones_documentos: {
          where: {
            tipo_documento: 'Resolución',
          },
          take: 1,
        },
      },
    } as any)

    // Formatear datos con relaciones
    const habilitacionesFormateadas = habilitaciones.map((hab: any) => {
      // Obtener titular principal
      const titular = hab.habilitaciones_personas?.find(
        (hp: any) => hp.rol === 'TITULAR'
      )

      return {
        id: hab.id,
        nro_licencia: hab.nro_licencia,
        resolucion: hab.resolucion,
        estado: hab.estado,
        vigencia_inicio: hab.vigencia_inicio,
        vigencia_fin: hab.vigencia_fin,
        tipo_transporte: hab.tipo_transporte,
        expte: hab.expte,
        observaciones: hab.observaciones,
        titular_principal: titular?.persona?.nombre || null,
        personas: hab.habilitaciones_personas?.map((hp: any) => ({
          id: hp.id,
          nombre: hp.persona?.nombre,
          dni: hp.persona?.dni,
          rol: hp.rol,
          licencia_categoria: hp.licencia_categoria,
        })) || [],
        vehiculos: hab.habilitaciones_vehiculos?.map((hv: any) => ({
          id: hv.id,
          dominio: hv.vehiculo?.dominio,
          marca: hv.vehiculo?.marca,
          modelo: hv.vehiculo?.modelo,
        })) || [],
        establecimientos: hab.habilitaciones_establecimientos?.map((he: any) => ({
          id: he.id,
          nombre: 'Pendiente', // TODO: Obtener de tablas relacionadas
          tipo: he.tipo,
        })) || [],
        tiene_resolucion: hab.habilitaciones_documentos?.length > 0,
        resolucion_doc_id: hab.habilitaciones_documentos?.[0]?.id || null,
      }
    })

    return NextResponse.json({
      success: true,
      data: habilitacionesFormateadas,
      pagination: {
        pagina_actual: pagina,
        limite,
        total,
        total_paginas: Math.ceil(total / limite),
      },
    })

  } catch (error: any) {
    console.error('Error al obtener habilitaciones:', error)
    return NextResponse.json(
      { 
        error: 'Error al obtener habilitaciones',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
