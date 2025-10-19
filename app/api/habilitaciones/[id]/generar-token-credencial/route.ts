import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

/**
 * POST /api/habilitaciones/[id]/generar-token-credencial
 * Genera un token de acceso público para la credencial digital
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const habilitacionId = parseInt(params.id)

    // Verificar que la habilitación existe
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId },
      select: {
        id: true,
        nro_licencia: true,
        estado: true
      }
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Generar token único
    const token = uuidv4()
    
    // Calcular fecha de expiración (90 días desde hoy)
    const fechaExpiracion = new Date()
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 90)

    // Crear token en la base de datos
    const tokenCreado = await prisma.tokens_acceso.create({
      data: {
        token,
        habilitacion_id: habilitacionId,
        fecha_expiracion: fechaExpiracion,
        activo: true
      }
    })

    // Construir URL de la credencial
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const credencialUrl = `${baseUrl}/credencial/${token}`

    return NextResponse.json({
      success: true,
      data: {
        token: tokenCreado.token,
        url: credencialUrl,
        fecha_expiracion: tokenCreado.fecha_expiracion,
        habilitacion: {
          id: habilitacion.id,
          nro_licencia: habilitacion.nro_licencia
        }
      }
    })

  } catch (error) {
    console.error('Error al generar token:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar token de credencial' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/habilitaciones/[id]/generar-token-credencial
 * Obtiene tokens activos de una habilitación
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const habilitacionId = parseInt(params.id)

    const tokens = await prisma.tokens_acceso.findMany({
      where: {
        habilitacion_id: habilitacionId,
        activo: true,
        fecha_expiracion: {
          gte: new Date() // Solo tokens no expirados
        }
      },
      orderBy: {
        fecha_creacion: 'desc'
      },
      take: 5 // Últimos 5 tokens
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const tokensConUrl = tokens.map(t => ({
      ...t,
      url: `${baseUrl}/credencial/${t.token}`
    }))

    return NextResponse.json({
      success: true,
      data: tokensConUrl
    })

  } catch (error) {
    console.error('Error al obtener tokens:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener tokens' },
      { status: 500 }
    )
  }
}
