'use client'

import { useRouter } from 'next/navigation'
import { ModalTurno } from '@/components/turnos/modal-turno'

export default function NuevoTurnoPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-8">
      <ModalTurno
        isOpen={true}
        onClose={() => router.push('/turnos')}
        onSuccess={() => router.push('/turnos')}
        turnoEdit={null}
        precargarLicencia=""
      />
    </div>
  )
}
