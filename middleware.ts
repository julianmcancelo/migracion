import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/habilitaciones', '/inspecciones', '/turnos']

// Rutas solo para invitados (no autenticados)
const guestOnlyRoutes = ['/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('session')

  // Verificar si la sesión es válida
  let isAuthenticated = false
  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie.value, secret)
      isAuthenticated = true
    } catch (error) {
      // Token inválido o expirado
      isAuthenticated = false
    }
  }

  // Rutas públicas de turnos (no requieren autenticación)
  const publicTurnosRoutes = [
    '/turnos/confirmar/',
    '/turnos/cancelar/',
    '/turnos/reprogramar/'
  ]
  const isPublicTurnosRoute = publicTurnosRoutes.some(route => pathname.startsWith(route))

  // Proteger rutas que requieren autenticación (excepto rutas públicas de turnos)
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isPublicTurnosRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'acceso_denegado')
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirigir usuarios autenticados desde páginas de invitados
  if (guestOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes de autenticación)
     * - api/turnos/.../confirmar-publico (confirmación pública)
     * - api/turnos/.../cancelar-publico (cancelación pública)
     * - api/turnos/.../reprogramar-publico (reprogramación pública)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|api/turnos/.*/(confirmar|cancelar|reprogramar)-publico|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)',
  ],
}
