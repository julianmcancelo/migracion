import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

export type SessionData = {
  userId: number
  email: string
  nombre: string
  rol: string
  legajo?: string
}

// Duración de la sesión: 24 horas
const SESSION_DURATION = 24 * 60 * 60 * 1000

export async function createSession(data: SessionData) {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  })
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token.value, secret)
    return payload as SessionData
  } catch (error) {
    console.error('Error verificando sesión:', error)
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
