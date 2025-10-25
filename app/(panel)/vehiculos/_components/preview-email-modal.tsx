'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Mail, Send, X, AlertTriangle, Calendar } from 'lucide-react'

interface PreviewEmailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  titular: {
    nombre: string
    email: string
  }
  vehiculo: {
    dominio: string
    marca?: string
    modelo?: string
  }
  documentosVencidos: Array<{
    tipo: string
    vencimiento: string
    diasVencido: number
  }>
  enviando?: boolean
}

/**
 * Modal de vista previa del email antes de enviar
 * Muestra cómo se verá el email que recibirá el titular
 */
export function PreviewEmailModal({
  open,
  onOpenChange,
  onConfirm,
  titular,
  vehiculo,
  documentosVencidos,
  enviando = false
}: PreviewEmailModalProps) {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="border-b bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-5 w-5 text-blue-600" />
              Vista Previa del Email
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              disabled={enviando}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p><strong>Para:</strong> {titular.nombre} ({titular.email})</p>
            <p><strong>Asunto:</strong> Actualización de documentación - Vehículo {vehiculo.dominio}</p>
          </div>
        </DialogHeader>

        {/* Vista Previa del Email */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Simulación del email */}
          <div className="rounded-lg border-2 border-gray-300 bg-white shadow-lg">
            {/* Header del Email */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
              <h2 className="text-2xl font-bold">🚗 Sistema de Transporte</h2>
              <p className="text-sm text-blue-100">Municipio de Lanús</p>
            </div>

            {/* Contenido del Email */}
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Estimado/a {titular.nombre},
              </h3>

              <p className="mb-4 text-gray-700">
                Le informamos que la siguiente documentación de su vehículo{' '}
                <strong className="text-blue-600">{vehiculo.dominio}</strong>
                {vehiculo.marca && vehiculo.modelo && (
                  <span> ({vehiculo.marca} {vehiculo.modelo})</span>
                )}{' '}
                se encuentra vencida:
              </p>

              {/* Alertas de Documentos Vencidos */}
              <div className="space-y-3">
                {documentosVencidos.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border-l-4 border-red-500 bg-red-50 p-4"
                  >
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900">{doc.tipo}</p>
                      <p className="text-sm text-red-700">
                        Vencida hace {doc.diasVencido} día{doc.diasVencido !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-red-600">
                        <Calendar className="mr-1 inline h-3 w-3" />
                        Vencimiento: {formatearFecha(doc.vencimiento)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-6 border-t border-gray-200 pt-6">
                <p className="mb-4 font-semibold text-gray-900">
                  Para mantener vigente su habilitación, debe actualizar la documentación a la brevedad.
                </p>

                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 font-semibold text-blue-900">¿Cómo proceder?</h4>
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-blue-800">
                    <li>Renovar la documentación vencida</li>
                    <li>Escanear los documentos actualizados en PDF o imagen clara</li>
                    <li>Enviarlos por email a: <strong>movilidadytransporte@lanus.gob.ar</strong></li>
                    <li>En el asunto mencionar: <strong>Actualización Documentación - Vehículo {vehiculo.dominio}</strong></li>
                  </ol>
                </div>
              </div>

              <div className="rounded-lg bg-gray-100 p-4 text-center">
                <p className="mb-3 font-semibold text-sm text-gray-800">
                  Dirección Gral. de Movilidad y Transporte
                </p>
                <p className="mb-2 text-sm text-gray-700">
                  Municipio de Lanús
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📧 Email: <a href="mailto:movilidadytransporte@lanus.gob.ar" className="text-blue-600 hover:underline">movilidadytransporte@lanus.gob.ar</a></p>
                  <p>📞 Teléfono: 4357-5100 Int. 7137</p>
                  <p>🌐 Web: <a href="https://www.lanus.gob.ar" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.lanus.gob.ar</a></p>
                </div>
              </div>
            </div>

            {/* Footer del Email */}
            <div className="border-t bg-gray-50 px-6 py-4">
              <p className="text-center text-xs text-gray-500">
                Este es un mensaje automático del Sistema de Transporte de Lanús.
                <br />
                Por favor no responda a este email.
              </p>
            </div>
          </div>
        </div>

        {/* Footer con Acciones */}
        <DialogFooter className="border-t bg-gray-50 px-6 py-4">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={enviando}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {enviando ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Confirmar y Enviar
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
