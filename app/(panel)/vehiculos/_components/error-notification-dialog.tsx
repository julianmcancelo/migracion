'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, X } from 'lucide-react'

interface ErrorNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  error: string
  detalle?: string
}

/**
 * Dialog de error para notificaciones
 * Diseño moderno y claro
 */
export function ErrorNotificationDialog({
  open,
  onOpenChange,
  error,
  detalle
}: ErrorNotificationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* Ícono de error con animación */}
        <div className="flex justify-center pb-4">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-12 w-12 text-red-600 animate-in zoom-in duration-300" />
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            Error al Enviar
          </DialogTitle>
          <DialogDescription className="sr-only">
            Ocurrió un error al enviar la notificación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mensaje de error */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-center font-medium text-red-900">
              {error}
            </p>
            {detalle && (
              <p className="mt-2 text-center text-sm text-red-700">
                {detalle}
              </p>
            )}
          </div>

          {/* Sugerencia */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm text-gray-700">
              💡 <strong>Sugerencia:</strong> Verifica que el vehículo tenga un titular 
              asignado con email registrado en el sistema.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            Cerrar
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              // Podría reabrir el modal de detalle o algo
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Revisar Datos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
