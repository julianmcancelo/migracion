import type { Metadata } from 'next'
import { DashboardContent } from './_components/dashboard-content'

export const metadata: Metadata = {
  title: 'Dashboard | Panel de Gestión',
}

/**
 * Página principal del dashboard
 * - KPIs de habilitaciones
 * - Alertas de vencimientos
 * - Acciones rápidas
 */
export default function DashboardPage() {
  return <DashboardContent />
}
