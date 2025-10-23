import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

/**
 * GET /api/credencial?token=xxx
 * Obtiene los datos completos de la credencial usando el token
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token no proporcionado' }, { status: 400 })
    }

    // Buscar token y verificar validez
    const tokenData = await prisma.tokens_acceso.findFirst({
      where: { token },
    })

    if (!tokenData) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 404 })
    }

    // Verificar expiración
    if (new Date(tokenData.fecha_expiracion) < new Date()) {
      return NextResponse.json({ success: false, error: 'Token expirado' }, { status: 403 })
    }

    // Consulta SQL completa para obtener todos los datos
    const sql = `
      SELECT 
        hg.id,
        hg.nro_licencia,
        hg.resolucion,
        hg.vigencia_inicio,
        hg.vigencia_fin,
        hg.estado,
        hg.tipo_transporte,
        
        p_titular.nombre AS titular_nombre,
        p_titular.dni AS titular_dni,
        p_titular.cuit AS titular_cuit,
        p_titular.foto_url AS titular_foto,
        
        p_conductor.nombre AS conductor_nombre,
        p_conductor.dni AS conductor_dni,
        p_conductor.foto_url AS conductor_foto,
        hp_conductor.licencia_categoria,
        
        p_celador.nombre AS celador_nombre,
        p_celador.dni AS celador_dni,
        
        e.nombre AS escuela_nombre,
        e.domicilio AS escuela_domicilio,
        e.localidad AS escuela_localidad,
        
        v.marca AS vehiculo_marca,
        v.modelo AS vehiculo_modelo,
        v.ano AS vehiculo_ano,
        v.motor AS vehiculo_motor,
        v.chasis AS vehiculo_chasis,
        v.asientos AS vehiculo_asientos,
        v.dominio AS vehiculo_dominio,
        v.Aseguradora AS vehiculo_aseguradora,
        v.poliza AS vehiculo_poliza,
        v.Vencimiento_VTV AS vehiculo_vencimiento_vtv,
        v.Vencimiento_Poliza AS vehiculo_vencimiento_poliza
        
      FROM habilitaciones_generales hg
      
      LEFT JOIN habilitaciones_personas hp_titular 
        ON hp_titular.habilitacion_id = hg.id AND hp_titular.rol = 'TITULAR'
      LEFT JOIN personas p_titular 
        ON p_titular.id = hp_titular.persona_id
      
      LEFT JOIN habilitaciones_personas hp_conductor 
        ON hp_conductor.habilitacion_id = hg.id AND hp_conductor.rol = 'CONDUCTOR'
      LEFT JOIN personas p_conductor 
        ON p_conductor.id = hp_conductor.persona_id
      
      LEFT JOIN habilitaciones_personas hp_celador 
        ON hp_celador.habilitacion_id = hg.id AND hp_celador.rol = 'CELADOR'
      LEFT JOIN personas p_celador 
        ON p_celador.id = hp_celador.persona_id
      
      LEFT JOIN habilitaciones_establecimientos he 
        ON he.habilitacion_id = hg.id AND he.tipo = 'establecimiento'
      LEFT JOIN establecimientos e 
        ON e.id = he.establecimiento_id
      
      LEFT JOIN habilitaciones_vehiculos hv 
        ON hv.habilitacion_id = hg.id
      LEFT JOIN vehiculos v 
        ON v.id = hv.vehiculo_id
      
      WHERE hg.id = ?
    `

    const result: any = await prisma.$queryRawUnsafe(sql, tokenData.habilitacion_id)

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    const data = result[0]

    // Verificar si está vencida
    const isExpired = new Date(data.vigencia_fin) < new Date()

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        isExpired,
      },
    })
  } catch (error: any) {
    console.error('Error al obtener credencial:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener credencial',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
