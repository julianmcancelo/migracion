import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { habilitacionSchema } from '@/lib/validations/habilitacion'

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
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo') || 'Escolar'
    const buscar = searchParams.get('buscar') || searchParams.get('search') || ''
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '15')
    const ordenarParam = searchParams.get('ordenar') || 'id_desc'

    // Validar tipo de transporte según rol
    const tiposPermitidos = session.rol === 'demo' ? ['Demo'] : ['Escolar', 'Remis']

    if (!tiposPermitidos.includes(tipo)) {
      return NextResponse.json({ error: 'Tipo de transporte no permitido' }, { status: 403 })
    }

    // Configurar ordenamiento
    const ordenamientos: Record<string, any> = {
      id_desc: { id: 'desc' },
      licencia_asc: { nro_licencia: 'asc' },
      licencia_desc: { nro_licencia: 'desc' },
    }
    const orderBy = ordenamientos[ordenarParam] || ordenamientos['id_desc']

    // Construir filtros
    const where: any = {
      tipo_transporte: tipo,
      is_deleted: false,
    }

    // Agregar búsqueda si existe
    if (buscar) {
      where.OR = [{ nro_licencia: { contains: buscar } }, { expte: { contains: buscar } }]
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
            rol: { in: ['TITULAR', 'CONDUCTOR', 'CHOFER', 'CELADOR'] },
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
      // Obtener titular principal (con manejo seguro)
      const titular = hab.habilitaciones_personas?.find((hp: any) => hp.rol && hp.rol === 'TITULAR')

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
        personas:
          hab.habilitaciones_personas?.map((hp: any) => ({
            id: hp.id,
            nombre: hp.persona?.nombre,
            genero: hp.persona?.genero,
            dni: hp.persona?.dni,
            cuit: hp.persona?.cuit,
            telefono: hp.persona?.telefono,
            email: hp.persona?.email,
            foto_url: hp.persona?.foto_url,
            domicilio_calle: hp.persona?.domicilio_calle,
            domicilio_nro: hp.persona?.domicilio_nro,
            domicilio_localidad: hp.persona?.domicilio_localidad,
            rol: hp.rol,
            licencia_categoria: hp.licencia_categoria,
          })) || [],
        vehiculos:
          hab.habilitaciones_vehiculos?.map((hv: any) => ({
            id: hv.id,
            dominio: hv.vehiculo?.dominio,
            marca: hv.vehiculo?.marca,
            modelo: hv.vehiculo?.modelo,
            tipo: hv.vehiculo?.tipo,
            chasis: hv.vehiculo?.chasis,
            ano: hv.vehiculo?.ano,
            motor: hv.vehiculo?.motor,
            asientos: hv.vehiculo?.asientos,
            inscripcion_inicial: hv.vehiculo?.inscripcion_inicial,
            Aseguradora: hv.vehiculo?.Aseguradora,
            poliza: hv.vehiculo?.poliza,
            Vencimiento_Poliza: hv.vehiculo?.Vencimiento_Poliza,
            Vencimiento_VTV: hv.vehiculo?.Vencimiento_VTV,
          })) || [],
        establecimientos:
          hab.habilitaciones_establecimientos?.map((he: any) => ({
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
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/habilitaciones
 * Crea una nueva habilitación con sus relaciones
 *
 * Body:
 * - Datos de la habilitación (ver habilitacionSchema)
 * - personas: array de personas vinculadas
 * - vehiculos: array de vehículos vinculados
 * - establecimientos: array de establecimientos vinculados (opcional)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar permisos (solo admin puede crear)
    if (session.rol === 'demo' || session.rol === 'lector') {
      return NextResponse.json(
        { error: 'No tiene permisos para crear habilitaciones' },
        { status: 403 }
      )
    }

    // Obtener y validar datos del body
    const body = await request.json()
    const validacion = habilitacionSchema.safeParse(body)

    if (!validacion.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          detalles: validacion.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validacion.data

    // Crear habilitación con transacción
    const nuevaHabilitacion = await prisma.$transaction(async tx => {
      // 1. Crear la habilitación
      const habilitacion = await tx.habilitaciones_generales.create({
        data: {
          tipo_transporte: data.tipo_transporte,
          estado: data.estado,
          anio: data.anio || new Date().getFullYear(),
          vigencia_inicio: data.vigencia_inicio ? new Date(data.vigencia_inicio) : null,
          vigencia_fin: data.vigencia_fin ? new Date(data.vigencia_fin) : null,
          nro_licencia: data.nro_licencia,
          expte: data.expte,
          resolucion: data.resolucion || null,
          observaciones: data.observaciones || null,
          oblea_colocada: data.oblea_colocada,
          is_deleted: false,
          notificado: false,
        },
      })

      // 2. Vincular personas
      if (data.personas && data.personas.length > 0) {
        await tx.habilitaciones_personas.createMany({
          data: data.personas.map(p => ({
            habilitacion_id: habilitacion.id,
            persona_id: p.persona_id,
            rol: p.rol,
            licencia_categoria: p.licencia_categoria || null,
          })),
        })
      }

      // 3. Vincular vehículos
      if (data.vehiculos && data.vehiculos.length > 0) {
        await tx.habilitaciones_vehiculos.createMany({
          data: data.vehiculos.map(v => ({
            habilitacion_id: habilitacion.id,
            vehiculo_id: v.vehiculo_id,
          })),
        })
      }

      // 4. Vincular establecimientos (opcional)
      if (data.establecimientos && data.establecimientos.length > 0) {
        await tx.habilitaciones_establecimientos.createMany({
          data: data.establecimientos.map(e => ({
            habilitacion_id: habilitacion.id,
            establecimiento_id: e.establecimiento_id,
            tipo: e.tipo,
          })),
        })
      }

      return habilitacion
    })

    // Obtener habilitación completa con relaciones
    const habilitacionCompleta = await prisma.habilitaciones_generales.findUnique({
      where: { id: nuevaHabilitacion.id },
      include: {
        habilitaciones_personas: {
          include: { persona: true },
        },
        habilitaciones_vehiculos: {
          include: { vehiculo: true },
        },
        habilitaciones_establecimientos: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Habilitación creada exitosamente',
        data: habilitacionCompleta,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error al crear habilitación:', error)
    return NextResponse.json(
      {
        error: 'Error al crear habilitación',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
