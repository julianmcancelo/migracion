'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserPlus, X } from 'lucide-react'
import { RegistrarPersonaDialog } from '@/app/(panel)/habilitaciones/_components/nueva-habilitacion/registrar-persona-dialog'

interface RegistroPersonaRapidoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Dialog para acceso rápido al registro de personas con OCR
 */
export function RegistroPersonaRapidoDialog({
  open,
  onOpenChange,
}: RegistroPersonaRapidoDialogProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [personaCreada, setPersonaCreada] = useState<any>(null)

  const handlePersonaCreada = (persona: any) => {
    setPersonaCreada(persona)
    setMostrarFormulario(false)

    // Mostrar mensaje de éxito
    setTimeout(() => {
      setPersonaCreada(null)
      onOpenChange(false)
    }, 3000)
  }

  const handleClose = () => {
    setMostrarFormulario(false)
    setPersonaCreada(null)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open && !mostrarFormulario} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Registro Rápido de Persona
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {personaCreada ? (
              <div className="rounded-lg border-2 border-green-500 bg-green-50 p-6 text-center">
                <div className="mb-3 text-5xl text-green-600">✅</div>
                <h3 className="mb-2 text-lg font-bold text-green-900">¡Persona Registrada!</h3>
                <p className="mb-1 text-green-700">{personaCreada.nombre}</p>
                <p className="text-sm text-green-600">DNI: {personaCreada.dni}</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="mb-4 text-6xl">👤</div>
                  <h3 className="mb-2 font-semibold text-gray-900">Registrar Nueva Persona</h3>
                  <p className="text-sm text-gray-600">
                    Podrás usar el escáner de DNI con IA para llenar los datos automáticamente
                  </p>
                </div>

                <div className="space-y-3">
                  <Button onClick={() => setMostrarFormulario(true)} className="w-full" size="lg">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Comenzar Registro
                  </Button>

                  <Button onClick={handleClose} variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
                  <p className="mb-1 font-semibold">💡 Incluye OCR con IA:</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Escanea el DNI con la cámara</li>
                    <li>Los datos se llenan solos</li>
                    <li>Revisás y guardás</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulario real de registro */}
      <RegistrarPersonaDialog
        open={mostrarFormulario}
        onOpenChange={setMostrarFormulario}
        onPersonaCreada={handlePersonaCreada}
      />
    </>
  )
}
