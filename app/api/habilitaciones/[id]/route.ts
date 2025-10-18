import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * GET /api/habilitaciones/[id]
 * Obtiene una habilitación individual con todos sus detalles
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Buscar habilitación con todas las relaciones
    // @ts-ignore
    const habilitacion: any = await prisma.habilitaciones_generales.findUnique({
      where: { id: Number(id) },
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
        habilitaciones_establecimientos: {
          include: {
            establecimiento: true,
            remiseria: true,
          },
        },
        habilitaciones_documentos: true,
      },
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Formatear respuesta similar al listado
    // @ts-ignore - Las relaciones existen
    const titular = habilitacion.habilitaciones_personas?.find((hp: any) => hp.rol === 'TITULAR')

    const habilitacionFormateada = {
      id: habilitacion.id,
      numero: habilitacion.nro_licencia,
      nro_licencia: habilitacion.nro_licencia,
      resolucion: habilitacion.resolucion,
      tipo: habilitacion.tipo,
      estado: habilitacion.estado,
      vigencia_inicio: habilitacion.vigencia_inicio,
      vigencia_fin: habilitacion.vigencia_fin,
      tipo_transporte: habilitacion.tipo_transporte,
      expte: habilitacion.expte,
      observaciones: habilitacion.observaciones,
      anio: habilitacion.anio,
      oblea_colocada: habilitacion.oblea_colocada,
      titular_principal: titular?.persona?.nombre || null,
      
      // Relaciones anidadas completas para el modal de detalle
      // @ts-ignore
      habilitaciones_personas: habilitacion.habilitaciones_personas?.map((hp: any) => ({
        id: hp.id,
        rol: hp.rol,
        licencia_categoria: hp.licencia_categoria,
        persona: {
          id: hp.persona?.id,
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
        }
      })) || [],
      
      // @ts-ignore
      habilitaciones_vehiculos: habilitacion.habilitaciones_vehiculos?.map((hv: any) => ({
        id: hv.id,
        vehiculo: {
          id: hv.vehiculo?.id,
          dominio: hv.vehiculo?.dominio,
          marca: hv.vehiculo?.marca,
          modelo: hv.vehiculo?.modelo,
          tipo: hv.vehiculo?.tipo,
          anio: hv.vehiculo?.ano,
          cantidad_asientos: hv.vehiculo?.asientos,
          nro_chasis: hv.vehiculo?.chasis,
          nro_motor: hv.vehiculo?.motor,
          aseguradora: hv.vehiculo?.Aseguradora,
          poliza_nro: hv.vehiculo?.poliza,
          poliza_vencimiento: hv.vehiculo?.Vencimiento_Poliza,
          vtv_vencimiento: hv.vehiculo?.Vencimiento_VTV,
        }
      })) || [],
      
      // Personas (formato plano para compatibilidad)
      // @ts-ignore
      personas: habilitacion.habilitaciones_personas?.map((hp: any) => ({
        id: hp.id,
        nombre: hp.persona?.nombre,
        dni: hp.persona?.dni,
        rol: hp.rol,
      })) || [],
      
      // Vehículos (formato plano para compatibilidad)
      // @ts-ignore
      vehiculos: habilitacion.habilitaciones_vehiculos?.map((hv: any) => ({
        id: hv.id,
        dominio: hv.vehiculo?.dominio,
        marca: hv.vehiculo?.marca,
        modelo: hv.vehiculo?.modelo,
      })) || [],
      
      // Establecimientos
      // @ts-ignore
      establecimientos: habilitacion.habilitaciones_establecimientos?.map((he: any) => ({
        id: he.id,
        nombre: he.tipo === 'establecimiento' 
          ? he.establecimiento?.nombre 
          : he.remiseria?.nombre,
        tipo: he.tipo,
        domicilio: he.establecimiento?.domicilio || null,
      })) || [],
      
      // Historial (TODO: implementar consultas a tablas de historial)
      verificaciones: [],
      inspecciones: [],
      
      // @ts-ignore
      tiene_resolucion: habilitacion.habilitaciones_documentos?.length > 0,
      // @ts-ignore
      resolucion_doc_id: habilitacion.habilitaciones_documentos?.[0]?.id || null,
    }

    return NextResponse.json({
      success: true,
      data: habilitacionFormateada,
    })
  } catch (error) {
    console.error('Error al obtener habilitación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener habilitación' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/habilitaciones/[id]
 * Actualiza una habilitación existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar que la habilitación exista
    // @ts-ignore
    const habilitacionExistente = await prisma.habilitaciones_generales.findUnique({
      where: { id: Number(id) },
    })

    if (!habilitacionExistente) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Usar transacción para mantener integridad
    const habilitacionActualizada = await prisma.$transaction(async (tx) => {
      // 1. Actualizar datos básicos
      // @ts-ignore
      const hab = await tx.habilitaciones_generales.update({
        where: { id: Number(id) },
        data: {
          tipo_transporte: body.tipo_transporte,
          estado: body.estado,
          nro_licencia: body.nro_licencia,
          expte: body.expte,
          resolucion: body.resolucion || null,
          anio: body.anio ? parseInt(body.anio) : null,
          vigencia_inicio: body.vigencia_inicio ? new Date(body.vigencia_inicio) : null,
          vigencia_fin: body.vigencia_fin ? new Date(body.vigencia_fin) : null,
          observaciones: body.observaciones || null,
          oblea_colocada: body.oblea_colocada || false,
        },
      })

      // 2. Actualizar personas (eliminar y recrear)
      if (body.personas && Array.isArray(body.personas)) {
        // Eliminar todas las personas existentes
        // @ts-ignore
        await tx.habilitaciones_personas.deleteMany({
          where: { 
            habilitacion_id: Number(id),
            rol: { in: ['TITULAR', 'CONDUCTOR', 'CHOFER', 'CELADOR'] }
          },
        })

        // Crear nuevas relaciones
        for (const persona of body.personas) {
          // @ts-ignore
          await tx.habilitaciones_personas.create({
            data: {
              habilitacion_id: Number(id),
              persona_id: persona.persona_id,
              rol: persona.rol,
              licencia_categoria: persona.licencia_categoria || null,
            },
          })
        }
      }

      // 3. Actualizar vehículos (eliminar y recrear)
      if (body.vehiculos && Array.isArray(body.vehiculos)) {
        // Eliminar todos los vehículos existentes
        // @ts-ignore
        await tx.habilitaciones_vehiculos.deleteMany({
          where: { habilitacion_id: Number(id) },
        })

        // Crear nuevas relaciones
        for (const vehiculo of body.vehiculos) {
          // @ts-ignore
          await tx.habilitaciones_vehiculos.create({
            data: {
              habilitacion_id: Number(id),
              vehiculo_id: vehiculo.vehiculo_id,
            },
          })
        }
      }

      return hab
    })

    return NextResponse.json({
      success: true,
      message: 'Habilitación actualizada exitosamente',
      data: habilitacionActualizada,
    })

  } catch (error: any) {
    console.error('Error al actualizar habilitación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar habilitación', details: error.message },
      { status: 500 }
    )
  }
}
