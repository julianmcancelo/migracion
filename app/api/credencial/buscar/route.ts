import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * POST /api/credencial/buscar
 * Busca una credencial activa por DNI y email del titular
 * Endpoint público para que contribuyentes accedan a sus credenciales
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dni, email } = body

    // Validaciones
    if (!dni || !email) {
      return NextResponse.json(
        { success: false, error: 'DNI y email son requeridos.' },
        { status: 400 }
      )
    }

    // Limpiar DNI (remover espacios, puntos, guiones)
    const dniLimpio = dni.toString().replace(/[^0-9]/g, '')

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'El formato del email no es válido.' },
        { status: 400 }
      )
    }

    // Buscar token de acceso activo usando Prisma raw query
    const results = await prisma.$queryRaw<Array<{ token: string }>>`
      SELECT t.token
      FROM tokens_acceso t
      JOIN habilitaciones_personas hp ON t.habilitacion_id = hp.habilitacion_id
      JOIN personas p ON hp.persona_id = p.id
      WHERE p.dni = ${dniLimpio}
        AND p.email = ${email.toLowerCase().trim()}
        AND hp.rol = 'TITULAR'
        AND t.fecha_expiracion >= CURDATE()
      ORDER BY t.creado_en DESC
      LIMIT 1
    `

    if (results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se encontró una credencial activa con la combinación de DNI y email proporcionada.',
        },
        { status: 404 }
      )
    }

    const token = results[0].token

    // Log de acceso (opcional, para auditoría)
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
      await prisma.$executeRaw`
        INSERT INTO logs_acceso_credencial (dni, email, token, fecha_acceso, ip_address) 
        VALUES (${dniLimpio}, ${email}, ${token}, NOW(), ${ipAddress})
      `
    } catch (logError) {
      // Si falla el log, no afecta la respuesta al usuario
      console.error('Error al registrar log de acceso:', logError)
    }

    return NextResponse.json({
      success: true,
      token,
      message: 'Credencial encontrada exitosamente.',
    })
  } catch (error) {
    console.error('Error en /api/credencial/buscar:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Ocurrió un error en el servidor. Por favor, intente más tarde.',
      },
      { status: 500 }
    )
  }
}
