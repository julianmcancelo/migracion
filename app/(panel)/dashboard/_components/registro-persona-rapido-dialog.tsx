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
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Registro de Persona
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {personaCreada ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <div className="mb-2 text-4xl text-green-600">✅</div>
                <h3 className="mb-1 font-semibold text-green-900">Persona Registrada</h3>
                <p className="text-sm text-green-700">{personaCreada.nombre}</p>
                <p className="text-xs text-green-600">DNI: {personaCreada.dni}</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="mb-3 text-5xl">👤</div>
                  <h3 className="mb-1 font-semibold text-slate-900">Registrar Nueva Persona</h3>
                  <p className="text-sm text-slate-600">
                    Escanea el DNI con IA o ingresa los datos manualmente
                  </p>
                </div>

                <div className="space-y-2">
                  <Button onClick={() => setMostrarFormulario(true)} className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
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
