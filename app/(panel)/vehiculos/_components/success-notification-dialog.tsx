'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Mail, User, FileText } from 'lucide-react'

interface SuccessNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  titular: {
    nombre: string
    email: string
  }
  vehiculo: string
  documentos: string[]
}

/**
 * Dialog de éxito para notificación enviada
 * Diseño moderno y limpio
 */
export function SuccessNotificationDialog({
  open,
  onOpenChange,
  titular,
  vehiculo,
  documentos
}: SuccessNotificationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* Ícono de éxito con animación */}
        <div className="flex justify-center pb-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-600 animate-in zoom-in duration-300" />
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            ¡Notificación Enviada!
          </DialogTitle>
          <DialogDescription className="sr-only">
            La notificación se envió correctamente al titular
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mensaje principal */}
          <p className="text-center text-gray-600">
            Se ha enviado correctamente la solicitud de actualización de documentación
          </p>

          {/* Información del destinatario */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="mb-3 flex items-center gap-2 border-b border-green-200 pb-2">
              <Mail className="h-5 w-5 text-green-700" />
              <span className="font-semibold text-green-900">Destinatario</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">{titular.nombre}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-green-600" />
                <span className="text-green-700">{titular.email}</span>
              </div>
            </div>
          </div>

          {/* Documentos solicitados */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center gap-2 border-b border-blue-200 pb-2">
              <FileText className="h-5 w-5 text-blue-700" />
              <span className="font-semibold text-blue-900">Documentos Solicitados</span>
            </div>

            <ul className="space-y-1.5">
              {documentos.map((doc, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-blue-800">
                  <span className="text-blue-600">•</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vehículo */}
          <p className="text-center text-sm text-gray-500">
            Vehículo: <span className="font-mono font-semibold text-gray-700">{vehiculo}</span>
          </p>
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
