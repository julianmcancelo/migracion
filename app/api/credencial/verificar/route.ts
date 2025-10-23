import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/credencial/verificar?token=xxx
 * Valida el token y retorna todos los datos necesarios para mostrar la credencial
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token no proporcionado' }, { status: 400 })
    }

    // Buscar el token
    const tokenData = await prisma.tokens_acceso.findUnique({
      where: { token },
      include: {
        habilitacion: {
          include: {
            habilitaciones_personas: {
              include: {
                persona: {
                  select: {
                    id: true,
                    nombre: true,
                    dni: true,
                    cuit: true,
                    foto_url: true,
                    domicilio: true,
                  },
                },
              },
            },
            habilitaciones_vehiculos: {
              include: {
                vehiculo: {
                  select: {
                    id: true,
                    dominio: true,
                    marca: true,
                    modelo: true,
                    ano: true,
                    chasis: true,
                    motor: true,
                    asientos: true,
                    Aseguradora: true,
                    poliza: true,
                    Vencimiento_VTV: true,
                    Vencimiento_Poliza: true,
                  },
                },
              },
              take: 1,
            },
            habilitaciones_establecimientos: {
              include: {
                establecimiento: {
                  select: {
                    id: true,
                    nombre: true,
                    domicilio: true,
                    localidad: true,
                  },
                },
                remiseria: {
                  select: {
                    id: true,
                    nombre: true,
                    direccion: true,
                    localidad: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
    })

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Token no válido o revocado' },
        { status: 404 }
      )
    }

    // Verificar si el token ha expirado
    if (new Date(tokenData.fecha_expiracion) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Este enlace de acceso ha expirado' },
        { status: 403 }
      )
    }

    // Separar personas por rol
    const titular = tokenData.habilitacion.habilitaciones_personas.find(
      hp => hp.rol === 'TITULAR'
    )?.persona

    const conductores = tokenData.habilitacion.habilitaciones_personas
      .filter(hp => hp.rol === 'CONDUCTOR' || hp.rol === 'CHOFER')
      .map(hp => ({
        ...hp.persona,
        licencia_categoria: hp.licencia_categoria,
      }))

    const celadores = tokenData.habilitacion.habilitaciones_personas
      .filter(hp => hp.rol === 'CELADOR')
      .map(hp => hp.persona)

    // Obtener vehículo
    const vehiculo = tokenData.habilitacion.habilitaciones_vehiculos[0]?.vehiculo || null

    // Obtener destino (establecimiento o remisería)
    const destinoRelacion = tokenData.habilitacion.habilitaciones_establecimientos[0]
    let destino = null

    if (destinoRelacion) {
      if (destinoRelacion.tipo === 'establecimiento' && destinoRelacion.establecimiento) {
        destino = {
          tipo: 'establecimiento',
          nombre: destinoRelacion.establecimiento.nombre,
          direccion: destinoRelacion.establecimiento.domicilio,
          localidad: destinoRelacion.establecimiento.localidad,
        }
      } else if (destinoRelacion.tipo === 'remiseria' && destinoRelacion.remiseria) {
        destino = {
          tipo: 'remiseria',
          nombre: destinoRelacion.remiseria.nombre,
          direccion: destinoRelacion.remiseria.direccion,
          localidad: destinoRelacion.remiseria.localidad,
        }
      }
    }

    // Construir respuesta
    const credencialData = {
      habilitacion: {
        id: tokenData.habilitacion.id,
        nro_licencia: tokenData.habilitacion.nro_licencia,
        resolucion: tokenData.habilitacion.resolucion,
        vigencia_inicio: tokenData.habilitacion.vigencia_inicio,
        vigencia_fin: tokenData.habilitacion.vigencia_fin,
        estado: tokenData.habilitacion.estado,
        tipo: tokenData.habilitacion.tipo,
        tipo_transporte: tokenData.habilitacion.tipo_transporte,
        expte: tokenData.habilitacion.expte,
      },
      titular,
      conductores,
      celadores,
      vehiculo,
      destino,
      token: {
        token: tokenData.token,
        fecha_expiracion: tokenData.fecha_expiracion,
      },
    }

    return NextResponse.json({
      success: true,
      data: credencialData,
    })
  } catch (error) {
    console.error('Error al verificar token:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar el token' },
      { status: 500 }
    )
  }
}
