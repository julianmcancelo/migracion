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
export function RegistroPersonaRapidoDialog({ open, onOpenChange }: RegistroPersonaRapidoDialogProps) {
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
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                <div className="text-green-600 text-5xl mb-3">✅</div>
                <h3 className="font-bold text-green-900 text-lg mb-2">¡Persona Registrada!</h3>
                <p className="text-green-700 mb-1">{personaCreada.nombre}</p>
                <p className="text-sm text-green-600">DNI: {personaCreada.dni}</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Registrar Nueva Persona
                  </h3>
                  <p className="text-sm text-gray-600">
                    Podrás usar el escáner de DNI con IA para llenar los datos automáticamente
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setMostrarFormulario(true)}
                    className="w-full"
                    size="lg"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Comenzar Registro
                  </Button>

                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                  <p className="font-semibold mb-1">💡 Incluye OCR con IA:</p>
                  <ul className="list-disc list-inside space-y-1">
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
