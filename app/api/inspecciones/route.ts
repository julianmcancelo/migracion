import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/inspecciones - Listar inspecciones
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const habilitacionId = searchParams.get('habilitacion_id')
    const resultado = searchParams.get('resultado')

    // Construir filtros WHERE
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (habilitacionId) {
      whereClause += ' AND i.habilitacion_id = ?'
      params.push(Number(habilitacionId))
    }

    if (resultado) {
      whereClause += ' AND i.resultado = ?'
      params.push(resultado)
    }

    // SQL optimizado con LEFT JOINs como en el código PHP original
    const sql = `
      SELECT 
        i.id,
        i.habilitacion_id,
        i.nro_licencia,
        i.fecha_inspeccion,
        i.resultado,
        i.nombre_inspector,
        i.tipo_transporte,
        i.email_contribuyente,
        p.nombre as titular_nombre,
        p.dni as titular_dni,
        v.dominio as vehiculo_patente,
        v.marca as vehiculo_marca,
        v.modelo as vehiculo_modelo
      FROM inspecciones AS i
      LEFT JOIN habilitaciones_generales AS hg ON i.habilitacion_id = hg.id
      LEFT JOIN habilitaciones_personas AS hp ON hg.id = hp.habilitacion_id
      LEFT JOIN personas AS p ON hp.persona_id = p.id
      LEFT JOIN habilitaciones_vehiculos AS hv ON hg.id = hv.habilitacion_id
      LEFT JOIN vehiculos AS v ON hv.vehiculo_id = v.id
      ${whereClause}
      ORDER BY i.fecha_inspeccion DESC
      LIMIT 100
    `

    // Ejecutar query raw SQL
    const inspecciones: any[] = await prisma.$queryRawUnsafe(sql, ...params)

    // Formatear datos
    const inspeccionesFormateadas = inspecciones.map((insp: any) => ({
      ...insp,
      titular_nombre: insp.titular_nombre || 'Sin datos',
      titular_dni: insp.titular_dni || '',
      vehiculo_patente: insp.vehiculo_patente || 'Sin patente',
      vehiculo_marca: insp.vehiculo_marca || '',
      vehiculo_modelo: insp.vehiculo_modelo || ''
    }))

    // Enriquecer con datos de habilitación (titular y vehículo)
    const inspeccionesEnriquecidas = await Promise.all(
      inspecciones.map(async (inspeccion) => {
        try {
          // Obtener habilitación
          const habilitacion = await prisma.habilitaciones_generales.findUnique({
            where: { id: inspeccion.habilitacion_id }
          })

          if (!habilitacion) {
            return {
              ...inspeccion,
              titular: null,
              dominio: null
            }
          }

          // Obtener titular
          const habPersona = await prisma.habilitaciones_personas.findFirst({
            where: {
              habilitacion_id: habilitacion.id,
              rol: 'TITULAR'
            }
          })

          let titular: string | null = null
          if (habPersona && habPersona.persona_id) {
            const persona = await prisma.personas.findUnique({
              where: { id: habPersona.persona_id }
            })
            titular = persona?.nombre || null
          }

          // Obtener vehículo
          const habVehiculo = await prisma.habilitaciones_vehiculos.findFirst({
            where: { habilitacion_id: habilitacion.id }
          })

          let dominio: string | null = null
          if (habVehiculo && habVehiculo.vehiculo_id) {
            const vehiculo = await prisma.vehiculos.findUnique({
              where: { id: habVehiculo.vehiculo_id }
            })
            dominio = vehiculo?.dominio || null
          }

          return {
            ...inspeccion,
            titular,
            dominio
          }
        } catch (error) {
          console.error(`Error al enriquecer inspección ${inspeccion.id}:`, error)
          return {
            ...inspeccion,
            titular: null,
            dominio: null
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: inspeccionesEnriquecidas,
      total: inspeccionesEnriquecidas.length
    })

  } catch (error) {
    console.error('Error al obtener inspecciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener inspecciones' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inspecciones - Crear nueva inspección
 * Body:
 * {
 *   habilitacion_id: number
 *   nro_licencia: string
 *   nombre_inspector: string
 *   firma_inspector: string (base64)
 *   firma_contribuyente?: string (base64)
 *   email_contribuyente?: string
 *   tipo_transporte: 'ESCOLAR' | 'REMIS'
 *   items: Array<{
 *     item_id: string
 *     estado: 'BIEN' | 'REGULAR' | 'MAL'
 *     observacion?: string
 *   }>
 *   fotos_vehiculo: Array<{
 *     tipo_foto: string
 *     foto_base64: string
 *     latitud?: number
 *     longitud?: number
 *   }>
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      habilitacion_id,
      nro_licencia,
      nombre_inspector,
      firma_inspector,
      firma_contribuyente,
      email_contribuyente,
      tipo_transporte,
      items,
      fotos_vehiculo,
      latitud,
      longitud
    } = body

    // Validaciones
    if (!habilitacion_id || !nro_licencia || !nombre_inspector || !firma_inspector) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Verificar habilitación existe
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: Number(habilitacion_id) }
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Calcular resultado automático
    const itemsMalos = items?.filter((i: any) => i.estado === 'MAL').length || 0
    const itemsRegulares = items?.filter((i: any) => i.estado === 'REGULAR').length || 0
    
    let resultado = 'APROBADO'
    if (itemsMalos > 0) {
      resultado = 'RECHAZADO'
    } else if (itemsRegulares > 2) {
      resultado = 'CONDICIONAL'
    }
    
    console.log('🔍 Items malos:', itemsMalos, '| Regulares:', itemsRegulares, '| Resultado:', resultado)

    // Crear inspección
    const inspeccion = await prisma.inspecciones.create({
      data: {
        habilitacion_id: Number(habilitacion_id),
        nro_licencia,
        nombre_inspector,
        firma_digital: `${latitud || 0},${longitud || 0}`, // GPS en formato texto
        firma_inspector,
        firma_contribuyente: firma_contribuyente || null,
        email_contribuyente: email_contribuyente || null,
        tipo_transporte: tipo_transporte || null,
        resultado
      }
    })

    // Crear items de inspección
    if (items && items.length > 0) {
      await prisma.inspeccion_items.createMany({
        data: items.map((item: any) => ({
          id_inspeccion: inspeccion.id,
          item_id_original: item.item_id,
          estado: item.estado,
          observacion: item.observacion || null
        }))
      })
    }

    // Crear fotos del vehículo
    if (fotos_vehiculo && fotos_vehiculo.length > 0) {
      await prisma.inspeccion_fotos.createMany({
        data: fotos_vehiculo.map((foto: any) => ({
          inspeccion_id: inspeccion.id,
          tipo_foto: foto.tipo_foto,
          item_id_original: foto.tipo_foto, // Para compatibilidad
          foto_path: foto.foto_base64, // En producción, guardar en storage y poner URL
          latitud: foto.latitud || null,
          longitud: foto.longitud || null
        }))
      })
    }

    // Marcar turno como finalizado si existe
    const turno = await prisma.turnos.findFirst({
      where: {
        habilitacion_id: Number(habilitacion_id),
        estado: 'CONFIRMADO'
      },
      orderBy: { fecha_hora: 'desc' }
    })

    if (turno) {
      await prisma.turnos.update({
        where: { id: turno.id },
        data: { estado: 'FINALIZADO' }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...inspeccion,
        items: items?.length || 0,
        fotos: fotos_vehiculo?.length || 0
      },
      message: `Inspección ${resultado.toLowerCase()} creada exitosamente`
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear inspección:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear inspección' },
      { status: 500 }
    )
  }
}
