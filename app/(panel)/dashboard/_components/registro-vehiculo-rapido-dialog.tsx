'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
  Aseguradora: string
  poliza: string
  Vencimiento_VTV: string
  Vencimiento_Poliza: string
}

/**
 * Dialog para registro rápido de vehículos con OCR
 */
export function RegistroVehiculoRapidoDialog({ open, onOpenChange }: RegistroVehiculoRapidoDialogProps) {
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
    Aseguradora: '',
    poliza: '',
    Vencimiento_VTV: '',
    Vencimiento_Poliza: ''
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
          asientos: formData.asientos ? parseInt(formData.asientos) : null
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
        Aseguradora: '',
        poliza: '',
        Vencimiento_VTV: '',
        Vencimiento_Poliza: ''
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
      Aseguradora: '',
      poliza: '',
      Vencimiento_VTV: '',
      Vencimiento_Poliza: ''
    })
    setError(null)
    setShowOCR(false)
    setVehiculoCreado(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Registro Rápido de Vehículo
          </DialogTitle>
        </DialogHeader>

        {vehiculoCreado ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h3 className="font-bold text-green-900 text-xl mb-3">¡Vehículo Registrado!</h3>
            <div className="space-y-1">
              <p className="text-green-700 font-semibold text-lg">{vehiculoCreado.dominio}</p>
              <p className="text-green-600">{vehiculoCreado.marca} {vehiculoCreado.modelo}</p>
              {vehiculoCreado.ano && <p className="text-sm text-green-600">Año: {vehiculoCreado.ano}</p>}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Botón OCR */}
            {!showOCR && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900 flex items-center gap-2 text-sm">
                      <Scan className="h-4 w-4" />
                      ¿Tenés la Cédula Verde?
                    </h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Escaneá y autocompletamos los datos
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowOCR(true)}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Scan className="h-3 w-3 mr-1" />
                    Escanear
                  </Button>
                </div>
              </div>
            )}

            {/* OCR */}
            {showOCR && (
              <div className="border-2 border-blue-300 rounded-lg p-3 bg-blue-50">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold text-blue-900 text-sm">Escanear Cédula Verde</h5>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOCR(false)}
                    className="text-blue-700 h-6"
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
                <Label htmlFor="dominio">Dominio / Patente <span className="text-red-500">*</span></Label>
                <Input
                  id="dominio"
                  value={formData.dominio}
                  onChange={(e) => handleChange('dominio', e.target.value.toUpperCase())}
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
                  onChange={(e) => handleChange('marca', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => handleChange('modelo', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => handleChange('tipo', e.target.value)}
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
                  onChange={(e) => handleChange('ano', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="chasis">Chasis</Label>
                <Input
                  id="chasis"
                  value={formData.chasis}
                  onChange={(e) => handleChange('chasis', e.target.value.toUpperCase())}
                  disabled={loading}
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="motor">Motor</Label>
                <Input
                  id="motor"
                  value={formData.motor}
                  onChange={(e) => handleChange('motor', e.target.value.toUpperCase())}
                  disabled={loading}
                  className="uppercase"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !formData.dominio.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Car className="h-4 w-4 mr-2" />
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
