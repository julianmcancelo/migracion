import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No hay sesión activa' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: session,
    })
  } catch (error) {
    console.error('Error obteniendo sesión:', error)
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
