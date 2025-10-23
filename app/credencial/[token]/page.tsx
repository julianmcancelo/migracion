import { notFound } from 'next/navigation'
import { CredencialCard } from './_components/credencial-card'

interface CredencialPageProps {
  params: Promise<{
    token: string
  }>
}

async function getCredencialData(token: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/credencial/verificar?token=${token}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error al obtener datos de credencial:', error)
    return null
  }
}

export default async function CredencialPage({ params }: CredencialPageProps) {
  const { token } = await params
  const data = await getCredencialData(token)

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <CredencialCard data={data} token={token} />
    </div>
  )
}
