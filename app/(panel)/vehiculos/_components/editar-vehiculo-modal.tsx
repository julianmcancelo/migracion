'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Save, X } from 'lucide-react'

interface EditarVehiculoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculo: {
    id: number
    dominio: string
    marca?: string | null
    modelo?: string | null
    ano?: number | null
    tipo?: string | null
    chasis?: string | null
    motor?: string | null
    asientos?: number | null
    inscripcion_inicial?: string | null
    Aseguradora?: string | null
    poliza?: string | null
    Vencimiento_VTV?: string | null
    Vencimiento_Poliza?: string | null
  } | null
  onGuardado: () => void
}

/**
 * Modal para editar todos los datos de un vehículo
 * Permite edición completa de información técnica, documentación y seguro
 */
export function EditarVehiculoModal({
  open,
  onOpenChange,
  vehiculo,
  onGuardado
}: EditarVehiculoModalProps) {
  const [guardando, setGuardando] = useState(false)
  
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    tipo: '',
    chasis: '',
    motor: '',
    asientos: '',
    inscripcion_inicial: '',
    Aseguradora: '',
    poliza: '',
    Vencimiento_VTV: '',
    Vencimiento_Poliza: ''
  })

  // Cargar datos cuando abre el modal o cambia el vehículo
  useEffect(() => {
    if (vehiculo && open) {
      setFormData({
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        ano: vehiculo.ano?.toString() || '',
        tipo: vehiculo.tipo || '',
        chasis: vehiculo.chasis || '',
        motor: vehiculo.motor || '',
        asientos: vehiculo.asientos?.toString() || '',
        inscripcion_inicial: vehiculo.inscripcion_inicial 
          ? new Date(vehiculo.inscripcion_inicial).toISOString().split('T')[0] 
          : '',
        Aseguradora: vehiculo.Aseguradora || '',
        poliza: vehiculo.poliza || '',
        Vencimiento_VTV: vehiculo.Vencimiento_VTV 
          ? new Date(vehiculo.Vencimiento_VTV).toISOString().split('T')[0] 
          : '',
        Vencimiento_Poliza: vehiculo.Vencimiento_Poliza 
          ? new Date(vehiculo.Vencimiento_Poliza).toISOString().split('T')[0] 
          : ''
      })
    }
  }, [vehiculo, open])

  if (!vehiculo) return null

  const handleGuardar = async () => {
    setGuardando(true)

    try {
      const response = await fetch(`/api/vehiculos/${vehiculo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marca: formData.marca || null,
          modelo: formData.modelo || null,
          ano: formData.ano ? parseInt(formData.ano) : null,
          tipo: formData.tipo || null,
          chasis: formData.chasis || null,
          motor: formData.motor || null,
          asientos: formData.asientos ? parseInt(formData.asientos) : null,
          inscripcion_inicial: formData.inscripcion_inicial || null,
          Aseguradora: formData.Aseguradora || null,
          poliza: formData.poliza || null,
          Vencimiento_VTV: formData.Vencimiento_VTV || null,
          Vencimiento_Poliza: formData.Vencimiento_Poliza || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar')
      }

      alert('✅ Vehículo actualizado correctamente')
      onGuardado()
      onOpenChange(false)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Editar Vehículo - {vehiculo.dominio}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-1" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="space-y-6 py-4">
            {/* Información Básica */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Información Básica</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    placeholder="Ej: Mercedes Benz"
                    disabled={guardando}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="Ej: Sprinter 515"
                    disabled={guardando}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ano">Año</Label>
                  <Input
                    id="ano"
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                    placeholder="Ej: 2020"
                    disabled={guardando}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Vehículo</Label>
                  <Input
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    placeholder="Ej: Automóvil, Camioneta, Minibus"
                    disabled={guardando}
                  />
                </div>
              </div>
            </div>

            {/* Datos Técnicos */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Datos Técnicos</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="chasis">Número de Chasis</Label>
                  <Input
                    id="chasis"
                    value={formData.chasis}
                    onChange={(e) => setFormData({ ...formData, chasis: e.target.value.toUpperCase() })}
                    placeholder="Ej: 8AC3B58Z4BE123456"
                    disabled={guardando}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motor">Número de Motor</Label>
                  <Input
                    id="motor"
                    value={formData.motor}
                    onChange={(e) => setFormData({ ...formData, motor: e.target.value.toUpperCase() })}
                    placeholder="Ej: OM651XXXXXX"
                    disabled={guardando}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asientos">Cantidad de Asientos</Label>
                  <Input
                    id="asientos"
                    type="number"
                    value={formData.asientos}
                    onChange={(e) => setFormData({ ...formData, asientos: e.target.value })}
                    placeholder="Ej: 19"
                    disabled={guardando}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inscripcion_inicial">Inscripción Inicial</Label>
                  <Input
                    id="inscripcion_inicial"
                    type="date"
                    value={formData.inscripcion_inicial}
                    onChange={(e) => setFormData({ ...formData, inscripcion_inicial: e.target.value })}
                    disabled={guardando}
                  />
                </div>
              </div>
            </div>

            {/* VTV */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">VTV</h3>
              <div className="grid gap-4 sm:grid-cols-1">
                <div className="space-y-2">
                  <Label htmlFor="vtv">Vencimiento VTV</Label>
                  <Input
                    id="vtv"
                    type="date"
                    value={formData.Vencimiento_VTV}
                    onChange={(e) => setFormData({ ...formData, Vencimiento_VTV: e.target.value })}
                    disabled={guardando}
                  />
                </div>
              </div>
            </div>

            {/* Seguro */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Seguro</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="aseguradora">Aseguradora</Label>
                  <Input
                    id="aseguradora"
                    value={formData.Aseguradora}
                    onChange={(e) => setFormData({ ...formData, Aseguradora: e.target.value })}
                    placeholder="Ej: La Caja"
                    disabled={guardando}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="poliza">Número de Póliza</Label>
                  <Input
                    id="poliza"
                    value={formData.poliza}
                    onChange={(e) => setFormData({ ...formData, poliza: e.target.value })}
                    placeholder="Ej: 123456789"
                    disabled={guardando}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="poliza_vto">Vencimiento Póliza</Label>
                  <Input
                    id="poliza_vto"
                    type="date"
                    value={formData.Vencimiento_Poliza}
                    onChange={(e) => setFormData({ ...formData, Vencimiento_Poliza: e.target.value })}
                    disabled={guardando}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={guardando}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={guardando}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {guardando ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
