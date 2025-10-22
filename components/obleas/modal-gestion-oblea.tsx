'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Shield, Download, FileText, Calendar, User, Car, CheckCircle, Clock, Edit, Save, X } from 'lucide-react'

interface Oblea {
  id: number
  habilitacion_id: number
  fecha_solicitud: string
  hora_solicitud: string
  creado_en: string
  notificado: string
  nro_licencia: string
  tipo_transporte: string
  estado_habilitacion: string
  titular: string
  titular_dni: string
  vehiculo_dominio: string
  vehiculo_marca: string
  vehiculo_modelo: string
}

interface ModalGestionObleaProps {
  oblea: Oblea | null
  open: boolean
  onClose: () => void
  onUpdate: () => void
}

export function ModalGestionOblea({ oblea, open, onClose, onUpdate }: ModalGestionObleaProps) {
  const [editando, setEditando] = useState(false)
  const [notificado, setNotificado] = useState(oblea?.notificado || 'no')
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [regenerandoPDF, setRegenerandoPDF] = useState(false)

  if (!oblea) return null

  const handleCambiarEstado = async (nuevoEstado: string) => {
    setGuardando(true)
    try {
      const response = await fetch(`/api/obleas/${oblea.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificado: nuevoEstado })
      })

      const data = await response.json()
      
      if (data.success) {
        setNotificado(nuevoEstado)
        alert('✅ Estado actualizado exitosamente')
        onUpdate()
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error al actualizar:', error)
      alert('❌ Error al actualizar el estado')
    } finally {
      setGuardando(false)
      setEditando(false)
    }
  }

  const handleRegenerarPDF = async () => {
    setRegenerandoPDF(true)
    try {
      const response = await fetch(`/api/habilitaciones/${oblea.habilitacion_id}/generar-oblea`, {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.success) {
        alert('✅ PDF regenerado exitosamente. Descargando...')
        // Aquí podrías descargar automáticamente el PDF
        onUpdate()
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error al regenerar PDF:', error)
      alert('❌ Error al regenerar el PDF')
    } finally {
      setRegenerandoPDF(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    return estado === 'si' ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Notificada
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Pendiente
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Gestión de Oblea #{oblea.id}</DialogTitle>
                <DialogDescription>
                  Licencia: {oblea.nro_licencia} | {oblea.tipo_transporte}
                </DialogDescription>
              </div>
            </div>
            {getEstadoBadge(notificado)}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información Principal */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Información de la Oblea
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID Oblea:</span>
                <span className="ml-2 text-gray-900">#{oblea.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Fecha Solicitud:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(oblea.fecha_solicitud).toLocaleDateString('es-AR')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Hora Solicitud:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(oblea.hora_solicitud).toLocaleTimeString('es-AR')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Estado Habilitación:</span>
                <span className="ml-2 text-gray-900">{oblea.estado_habilitacion}</span>
              </div>
            </div>
          </Card>

          {/* Datos del Titular */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Datos del Titular
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nombre Completo:</span>
                <span className="ml-2 text-gray-900">{oblea.titular}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">DNI:</span>
                <span className="ml-2 text-gray-900">{oblea.titular_dni}</span>
              </div>
            </div>
          </Card>

          {/* Datos del Vehículo */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Car className="h-4 w-4" />
              Datos del Vehículo
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Dominio:</span>
                <span className="ml-2 text-gray-900 font-mono">{oblea.vehiculo_dominio}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Marca:</span>
                <span className="ml-2 text-gray-900">{oblea.vehiculo_marca}</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Modelo:</span>
                <span className="ml-2 text-gray-900">{oblea.vehiculo_modelo}</span>
              </div>
            </div>
          </Card>

          {/* Gestión de Estado */}
          <Card className="p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Gestión de Estado
            </h3>
            
            {!editando ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estado actual:</p>
                  {getEstadoBadge(notificado)}
                </div>
                <Button onClick={() => setEditando(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Cambiar Estado
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Selecciona el nuevo estado:</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleCambiarEstado('si')}
                    disabled={guardando}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {guardando ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como Notificada
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleCambiarEstado('no')}
                    disabled={guardando}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  >
                    {guardando ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Marcar como Pendiente
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setEditando(false)}
                    variant="outline"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Observaciones */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Observaciones / Notas</h3>
            <Textarea
              placeholder="Agregar observaciones o notas sobre esta oblea..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={4}
              className="mb-3"
            />
            <Button variant="outline" size="sm" disabled={!observaciones.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Observaciones
            </Button>
          </Card>

          {/* Acciones Rápidas */}
          <div className="flex gap-3">
            <Button
              onClick={handleRegenerarPDF}
              disabled={regenerandoPDF}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {regenerandoPDF ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Regenerar PDF
            </Button>
            <Button
              onClick={() => window.open(`/habilitaciones/${oblea.habilitacion_id}`, '_blank')}
              variant="outline"
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Habilitación
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
