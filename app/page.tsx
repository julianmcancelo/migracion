import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

/**
 * Página de inicio
 * - Redirige al dashboard si está autenticado
 * - Redirige al login si no está autenticado
 */
export default async function Home() {
  const session = await getSession()
  
  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
