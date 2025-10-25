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
          {/* Simulación del email - Diseño Minimalista con Logo */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            {/* Header Minimalista con Logo */}
            <div className="border-b border-gray-100 px-8 py-8">
              <div className="mb-4 flex items-center justify-center">
                <img 
                  src="https://www.lanus.gob.ar/logo-200.png" 
                  alt="Municipalidad de Lanús"
                  className="h-16"
                />
              </div>
              <div className="text-center">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  MUNICIPIO DE LANÚS
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Dirección General de Movilidad y Transporte
                </h2>
              </div>
            </div>

            {/* Contenido del Email */}
            <div className="px-8 py-6 space-y-6">
              {/* Saludo */}
              <div>
                <p className="text-gray-900">
                  Estimado/a <strong>{titular.nombre}</strong>,
                </p>
              </div>

              {/* Información del Vehículo */}
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Vehículo:</span>
                  <span className="font-mono font-semibold text-gray-900">{vehiculo.dominio}</span>
                  {vehiculo.marca && vehiculo.modelo && (
                    <span className="text-sm text-gray-600">
                      • {vehiculo.marca} {vehiculo.modelo}
                    </span>
                  )}
                </div>
              </div>

              {/* Mensaje Principal */}
              <p className="text-gray-700 leading-relaxed">
                Le informamos que la siguiente documentación de su vehículo se encuentra vencida 
                y requiere actualización para mantener vigente su habilitación:
              </p>

              {/* Documentos Vencidos - Minimalista */}
              <div className="space-y-2">
                {documentosVencidos.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.tipo}</p>
                        <p className="text-xs text-gray-600">
                          Vencimiento: {formatearFecha(doc.vencimiento)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        Vencida
                      </p>
                      <p className="text-xs text-gray-500">
                        Hace {doc.diasVencido} día{doc.diasVencido !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instrucciones - Minimalista */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Pasos a seguir:</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                      1
                    </div>
                    <p className="text-sm text-gray-700">Renovar la documentación vencida</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                      2
                    </div>
                    <p className="text-sm text-gray-700">Escanear los documentos en PDF o imagen clara</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 mb-2">Enviar por email a:</p>
                      <a 
                        href={`mailto:movilidadytransporte@lanus.gob.ar?subject=Actualización Documentación - Vehículo ${vehiculo.dominio}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <Mail className="h-4 w-4" />
                        movilidadytransporte@lanus.gob.ar
                      </a>
                      <p className="mt-2 text-xs text-gray-500">
                        Asunto: Actualización Documentación - Vehículo {vehiculo.dominio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-100" />

              {/* Contacto - Minimalista */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Contacto</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-20 text-gray-500">Teléfono:</span>
                    <span className="font-medium">4357-5100 Int. 7137</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-20 text-gray-500">Email:</span>
                    <a href="mailto:movilidadytransporte@lanus.gob.ar" className="font-medium text-blue-600 hover:underline">
                      movilidadytransporte@lanus.gob.ar
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-20 text-gray-500">Web:</span>
                    <a href="https://www.lanus.gob.ar" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                      www.lanus.gob.ar
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Minimalista */}
            <div className="border-t border-gray-100 bg-gray-50 px-8 py-4">
              <p className="text-center text-xs text-gray-500">
                Mensaje automático del Sistema de Gestión de Transporte · No responder a este email
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
