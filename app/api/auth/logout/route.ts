import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

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
        error: 'Error al cerrar sesión' 
      },
      { status: 500 }
    )
  }
}
