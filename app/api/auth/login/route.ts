import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSession } from '@/lib/auth'

// Marcar como ruta dinámica para Vercel
export const dynamic = 'force-dynamic'

const loginSchema = z.object({
  email: z.string().email('El formato del correo electrónico no es válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validationResult = loginSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.errors[0].message 
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Buscar usuario en la base de datos
    const user = await prisma.admin.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Credenciales incorrectas. Inténtalo de nuevo.' 
        },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Credenciales incorrectas. Inténtalo de nuevo.' 
        },
        { status: 401 }
      )
    }

    // Crear sesión
    await createSession({
      userId: user.id,
      email: user.email || '',
      nombre: user.nombre || '',
      rol: user.rol || 'lector',
      legajo: user.legajo || undefined,
    })

    return NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    })

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error del servidor. Por favor, intenta más tarde.' 
      },
      { status: 500 }
    )
  }
}
