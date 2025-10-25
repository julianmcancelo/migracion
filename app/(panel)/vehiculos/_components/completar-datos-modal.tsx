'use client'

import { useState } from 'react'
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
import { AlertCircle, Save, X } from 'lucide-react'

interface CompletarDatosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculo: {
    id: number
    dominio: string
    marca?: string | null
    modelo?: string | null
    ano?: number | null
    Vencimiento_VTV?: string | null
    Vencimiento_Poliza?: string | null
  } | null
  onGuardado: () => void
}

/**
 * Modal para completar datos faltantes de un vehículo
 * Permite edición rápida de los campos básicos
 */
export function CompletarDatosModal({
  open,
  onOpenChange,
  vehiculo,
  onGuardado
}: CompletarDatosModalProps) {
  const [guardando, setGuardando] = useState(false)
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    Vencimiento_VTV: '',
    Vencimiento_Poliza: ''
  })

  // Cuando abre el modal, cargar datos actuales
  useState(() => {
    if (vehiculo && open) {
      setFormData({
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        ano: vehiculo.ano?.toString() || '',
        Vencimiento_VTV: vehiculo.Vencimiento_VTV 
          ? new Date(vehiculo.Vencimiento_VTV).toISOString().split('T')[0] 
          : '',
        Vencimiento_Poliza: vehiculo.Vencimiento_Poliza 
          ? new Date(vehiculo.Vencimiento_Poliza).toISOString().split('T')[0] 
          : ''
      })
    }
  })

  if (!vehiculo) return null

  const camposFaltantes = []
  if (!vehiculo.marca) camposFaltantes.push('Marca')
  if (!vehiculo.modelo) camposFaltantes.push('Modelo')
  if (!vehiculo.ano) camposFaltantes.push('Año')
  if (!vehiculo.Vencimiento_VTV) camposFaltantes.push('Vencimiento VTV')
  if (!vehiculo.Vencimiento_Poliza) camposFaltantes.push('Vencimiento Póliza')

  const handleGuardar = async () => {
    setGuardando(true)

    try {
      const response = await fetch(`/api/vehiculos/${vehiculo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ano: formData.ano ? parseInt(formData.ano) : null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar')
      }

      alert('✅ Datos actualizados correctamente')
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Completar Datos - {vehiculo.dominio}
          </DialogTitle>
          <div className="mt-2 rounded-lg bg-orange-50 border border-orange-200 p-3">
            <p className="text-sm text-orange-800">
              <strong>Datos faltantes:</strong> {camposFaltantes.join(', ')}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="marca">
                Marca {!vehiculo.marca && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Ej: Mercedes Benz"
                disabled={guardando}
                className={!vehiculo.marca ? 'border-orange-300' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ano">
                Año {!vehiculo.ano && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="ano"
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                placeholder="Ej: 2020"
                disabled={guardando}
                className={!vehiculo.ano ? 'border-orange-300' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelo">
              Modelo {!vehiculo.modelo && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="modelo"
              value={formData.modelo}
              onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              placeholder="Ej: Sprinter 515"
              disabled={guardando}
              className={!vehiculo.modelo ? 'border-orange-300' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vtv">
              Vencimiento VTV {!vehiculo.Vencimiento_VTV && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="vtv"
              type="date"
              value={formData.Vencimiento_VTV}
              onChange={(e) => setFormData({ ...formData, Vencimiento_VTV: e.target.value })}
              disabled={guardando}
              className={!vehiculo.Vencimiento_VTV ? 'border-orange-300' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poliza">
              Vencimiento Póliza {!vehiculo.Vencimiento_Poliza && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="poliza"
              type="date"
              value={formData.Vencimiento_Poliza}
              onChange={(e) => setFormData({ ...formData, Vencimiento_Poliza: e.target.value })}
              disabled={guardando}
              className={!vehiculo.Vencimiento_Poliza ? 'border-orange-300' : ''}
            />
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
