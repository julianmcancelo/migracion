import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

// Marcar como ruta dinámica para Vercel
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await deleteSession()

    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    })
  } catch (error) {
    console.error('Error en logout:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al cerrar sesión',
      },
      { status: 500 }
    )
  }
}
