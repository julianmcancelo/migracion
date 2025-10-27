'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Save, X, Upload, Camera, Sparkles } from 'lucide-react'

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
  const [procesandoOCR, setProcesandoOCR] = useState(false)
  const [imagenTitulo, setImagenTitulo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    tipo: '',
    chasis: '',
    motor: '',
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
        tipo: '',
        chasis: '',
        motor: '',
        Vencimiento_VTV: vehiculo.Vencimiento_VTV 
          ? new Date(vehiculo.Vencimiento_VTV).toISOString().split('T')[0] 
          : '',
        Vencimiento_Poliza: vehiculo.Vencimiento_Poliza 
          ? new Date(vehiculo.Vencimiento_Poliza).toISOString().split('T')[0] 
          : ''
      })
    }
  })

  const procesarTitulo = async (file: File) => {
    setProcesandoOCR(true)
    
    try {
      const formDataOCR = new FormData()
      formDataOCR.append('image', file)

      const response = await fetch('/api/ai/ocr-titulo', {
        method: 'POST',
        body: formDataOCR
      })

      const data = await response.json()

      if (data.success && data.data) {
        // Auto-completar campos con datos del OCR
        setFormData(prev => ({
          ...prev,
          marca: data.data.marca || prev.marca,
          modelo: data.data.modelo || prev.modelo,
          ano: data.data.año || prev.ano,
          tipo: data.data.tipo || prev.tipo,
          chasis: data.data.chasis || prev.chasis,
          motor: data.data.motor || prev.motor,
        }))

        alert('✨ Datos del título cargados automáticamente')
      } else {
        throw new Error(data.error || 'No se pudieron extraer datos')
      }
    } catch (error: any) {
      alert(`❌ Error al procesar título: ${error.message}`)
    } finally {
      setProcesandoOCR(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagenTitulo(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Procesar con OCR
    await procesarTitulo(file)
  }

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
          <DialogDescription>
            Complete la información faltante del vehículo
          </DialogDescription>
          <div className="mt-2 rounded-lg bg-orange-50 border border-orange-200 p-3">
            <p className="text-sm text-orange-800">
              <strong>Datos faltantes:</strong> {camposFaltantes.join(', ')}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Botón OCR para título */}
          <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <Camera className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900">Carga Rápida con OCR</p>
                <p className="text-sm text-blue-700">Sube una foto del título del vehículo para completar automáticamente</p>
              </div>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={procesandoOCR || guardando}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {procesandoOCR ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Título
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {imagenTitulo && (
              <div className="mt-3">
                <img src={imagenTitulo} alt="Título" className="h-20 w-auto rounded border" />
              </div>
            )}
          </div>

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
                disabled={guardando || procesandoOCR}
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

          {/* Campos adicionales */}
          <div className="col-span-2 border-t pt-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Datos Técnicos (Opcionales)</p>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Vehículo</Label>
                <Input
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ej: Automóvil, Camioneta, Minibus"
                  disabled={guardando || procesandoOCR}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chasis">Número de Chasis</Label>
                <Input
                  id="chasis"
                  value={formData.chasis}
                  onChange={(e) => setFormData({ ...formData, chasis: e.target.value.toUpperCase() })}
                  placeholder="Ej: 8AC3B58Z4BE123456"
                  disabled={guardando || procesandoOCR}
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
                  disabled={guardando || procesandoOCR}
                  className="font-mono"
                />
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
