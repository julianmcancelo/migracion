import { notFound } from 'next/navigation'
import { HabilitacionDetalle } from './_components/habilitacion-detalle'

interface PageProps {
  params: {
    id: string
  }
}

/**
 * Página de detalle de habilitación
 * Muestra toda la información relacionada: personas, vehículos, turnos, inspecciones, obleas
 */
export default async function HabilitacionDetallePage({ params }: PageProps) {
  const { id } = params

  // Validar que el ID sea numérico
  if (!id || isNaN(Number(id))) {
    notFound()
  }

  return <HabilitacionDetalle id={id} />
}
