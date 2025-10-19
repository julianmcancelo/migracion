import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

/**
 * POST /api/habilitaciones/[id]/generar-token
 * Genera un token de acceso único para la credencial digital
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const habilitacionId = Number(id)

    // Verificar que la habilitación existe
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId }
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex')
    
    // Fecha de expiración: 1 año desde ahora
    const fechaExpiracion = new Date()
    fechaExpiracion.setFullYear(fechaExpiracion.getFullYear() + 1)

    // Verificar si ya existe un token para esta habilitación
    const tokenExistente = await prisma.tokens_acceso.findFirst({
      where: { habilitacion_id: habilitacionId }
    })

    let tokenCreado

    if (tokenExistente) {
      // Actualizar token existente
      tokenCreado = await prisma.tokens_acceso.update({
        where: { id: tokenExistente.id },
        data: {
          token,
          fecha_expiracion: fechaExpiracion,
          fecha_creacion: new Date()
        }
      })
    } else {
      // Crear nuevo token
      tokenCreado = await prisma.tokens_acceso.create({
        data: {
          token,
          habilitacion_id: habilitacionId,
          fecha_expiracion: fechaExpiracion,
          fecha_creacion: new Date()
        }
      })
    }

    // Construir URL de la credencial
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const credencialUrl = `${baseUrl}/credencial?token=${token}`

    return NextResponse.json({
      success: true,
      data: {
        token,
        url: credencialUrl,
        fecha_expiracion: fechaExpiracion,
        habilitacion_id: habilitacionId
      }
    })

  } catch (error: any) {
    console.error('Error al generar token:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al generar token',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/habilitaciones/[id]/generar-token
 * Obtiene el token existente o crea uno nuevo
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const habilitacionId = Number(id)

    // Buscar token existente no expirado
    const tokenExistente = await prisma.tokens_acceso.findFirst({
      where: {
        habilitacion_id: habilitacionId,
        fecha_expiracion: {
          gt: new Date()
        }
      }
    })

    if (tokenExistente) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const credencialUrl = `${baseUrl}/credencial?token=${tokenExistente.token}`

      return NextResponse.json({
        success: true,
        data: {
          token: tokenExistente.token,
          url: credencialUrl,
          fecha_expiracion: tokenExistente.fecha_expiracion,
          habilitacion_id: habilitacionId
        }
      })
    }

    // Si no existe, generar uno nuevo
    return POST(request, context)

  } catch (error: any) {
    console.error('Error al obtener token:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener token',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
