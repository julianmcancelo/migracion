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
import { Car, Loader2, Scan } from 'lucide-react'
import { OCRScanner } from '@/components/ocr-scanner'

interface RegistroVehiculoRapidoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface VehiculoFormData {
  dominio: string
  marca: string
  modelo: string
  tipo: string
  ano: string
  chasis: string
  motor: string
  asientos: string
  inscripcion_inicial: string
  Aseguradora: string
  poliza: string
  Vencimiento_VTV: string
  Vencimiento_Poliza: string
}

/**
 * Dialog para registro rápido de vehículos con OCR
 */
export function RegistroVehiculoRapidoDialog({
  open,
  onOpenChange,
}: RegistroVehiculoRapidoDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOCR, setShowOCR] = useState(false)
  const [vehiculoCreado, setVehiculoCreado] = useState<any>(null)

  const [formData, setFormData] = useState<VehiculoFormData>({
    dominio: '',
    marca: '',
    modelo: '',
    tipo: '',
    ano: '',
    chasis: '',
    motor: '',
    asientos: '',
    inscripcion_inicial: '',
    Aseguradora: '',
    poliza: '',
    Vencimiento_VTV: '',
    Vencimiento_Poliza: '',
  })

  // Procesar datos del OCR
  const handleOCRData = (data: any) => {
    console.log('Datos OCR Cédula recibidos:', data)

    if (data.dominio) setFormData(prev => ({ ...prev, dominio: data.dominio.toUpperCase() }))
    if (data.marca) setFormData(prev => ({ ...prev, marca: data.marca }))
    if (data.modelo) setFormData(prev => ({ ...prev, modelo: data.modelo }))
    if (data.tipo) setFormData(prev => ({ ...prev, tipo: data.tipo }))
    if (data.ano) setFormData(prev => ({ ...prev, ano: String(data.ano) }))
    if (data.chasis) setFormData(prev => ({ ...prev, chasis: data.chasis }))
    if (data.motor) setFormData(prev => ({ ...prev, motor: data.motor }))

    setShowOCR(false)
  }

  const handleChange = (field: keyof VehiculoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.dominio.trim()) {
      setError('El dominio es obligatorio')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ano: formData.ano ? parseInt(formData.ano) : null,
          asientos: formData.asientos ? parseInt(formData.asientos) : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el vehículo')
      }

      setVehiculoCreado(data.data)

      // Resetear formulario
      setFormData({
        dominio: '',
        marca: '',
        modelo: '',
        tipo: '',
        ano: '',
        chasis: '',
        motor: '',
        asientos: '',
        inscripcion_inicial: '',
        Aseguradora: '',
        poliza: '',
        Vencimiento_VTV: '',
        Vencimiento_Poliza: '',
      })

      // Cerrar después de 3 segundos
      setTimeout(() => {
        setVehiculoCreado(null)
        onOpenChange(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      dominio: '',
      marca: '',
      modelo: '',
      tipo: '',
      ano: '',
      chasis: '',
      motor: '',
      asientos: '',
      inscripcion_inicial: '',
      Aseguradora: '',
      poliza: '',
      Vencimiento_VTV: '',
      Vencimiento_Poliza: '',
    })
    setError(null)
    setShowOCR(false)
    setVehiculoCreado(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Car className="h-5 w-5 text-blue-600" />
            Registro de Vehículo
          </DialogTitle>
        </DialogHeader>

        {vehiculoCreado ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <div className="mb-3 text-5xl text-green-600">✅</div>
            <h3 className="mb-2 text-lg font-bold text-green-900">Vehículo Registrado</h3>
            <div className="space-y-0.5">
              <p className="font-semibold text-green-700">{vehiculoCreado.dominio}</p>
              <p className="text-sm text-green-600">
                {vehiculoCreado.marca} {vehiculoCreado.modelo}
              </p>
              {vehiculoCreado.ano && (
                <p className="text-xs text-green-600">Año: {vehiculoCreado.ano}</p>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Botón OCR */}
            {!showOCR && (
              <div className="rounded-lg border bg-blue-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                      <Scan className="h-4 w-4" />
                      ¿Tenés la Cédula Verde?
                    </h4>
                    <p className="mt-0.5 text-xs text-blue-700">
                      Escanea y autocompletamos los datos
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowOCR(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Scan className="mr-1 h-3 w-3" />
                    Escanear
                  </Button>
                </div>
              </div>
            )}

            {/* OCR */}
            {showOCR && (
              <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h5 className="text-sm font-semibold text-blue-900">Escanear Cédula Verde</h5>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOCR(false)}
                    className="h-6 text-blue-700"
                  >
                    Cerrar
                  </Button>
                </div>
                <OCRScanner
                  type="cedula"
                  onDataExtracted={handleOCRData}
                  buttonText="Escanear Cédula"
                />
              </div>
            )}

            {/* Formulario */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="dominio">
                  Dominio / Patente <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dominio"
                  value={formData.dominio}
                  onChange={e => handleChange('dominio', e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123"
                  required
                  disabled={loading}
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={e => handleChange('marca', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={e => handleChange('modelo', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  value={formData.tipo}
                  onChange={e => handleChange('tipo', e.target.value)}
                  placeholder="Ej: Automóvil"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="ano">Año</Label>
                <Input
                  id="ano"
                  type="number"
                  value={formData.ano}
                  onChange={e => handleChange('ano', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="chasis">Chasis</Label>
                <Input
                  id="chasis"
                  value={formData.chasis}
                  onChange={e => handleChange('chasis', e.target.value.toUpperCase())}
                  disabled={loading}
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="motor">Motor</Label>
                <Input
                  id="motor"
                  value={formData.motor}
                  onChange={e => handleChange('motor', e.target.value.toUpperCase())}
                  disabled={loading}
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="asientos">Asientos</Label>
                <Input
                  id="asientos"
                  type="number"
                  value={formData.asientos}
                  onChange={e => handleChange('asientos', e.target.value)}
                  disabled={loading}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="inscripcion_inicial">Inscripción Inicial</Label>
                <Input
                  id="inscripcion_inicial"
                  type="date"
                  value={formData.inscripcion_inicial}
                  onChange={e => handleChange('inscripcion_inicial', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !formData.dominio.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Car className="mr-2 h-4 w-4" />
                    Registrar Vehículo
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
