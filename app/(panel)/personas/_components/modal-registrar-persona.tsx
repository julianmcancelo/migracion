'use client'

import { useState, useRef } from 'react'
import { User, X, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ModalRegistrarPersonaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegistroExitoso?: () => void
}

export default function ModalRegistrarPersona({
  open,
  onOpenChange,
  onRegistroExitoso,
}: ModalRegistrarPersonaProps) {
  const [loading, setLoading] = useState(false)
  const [loadingOCR, setLoadingOCR] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    genero: '',
    cuit: '',
    telefono: '',
    email: '',
    domicilio_calle: '',
    domicilio_nro: '',
    domicilio_localidad: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
    setSuccessMessage(null)
  }

  const handleEscanearDNI = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo (imagen o PDF)
    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf'

    if (!isImage && !isPDF) {
      setError('Por favor seleccione una imagen (JPG, PNG) o un archivo PDF válido')
      return
    }

    // Validar tamaño (máx 10MB para PDFs, 5MB para imágenes)
    const maxSize = isPDF ? 10 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`El archivo no debe superar los ${isPDF ? '10MB' : '5MB'}`)
      return
    }

    try {
      setLoadingOCR(true)
      setError(null)
      setSuccessMessage(null)

      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/ocr/dni-gemini', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await response.json()

      if (data.success) {
        // Autocompletar formulario con datos extraídos
        setFormData({
          dni: data.data.dni || '',
          nombre: data.data.nombre || '',
          genero: data.data.genero || '',
          cuit: data.data.cuit || '',
          telefono: data.data.telefono || '',
          email: data.data.email || '',
          domicilio_calle: data.data.domicilio_calle || '',
          domicilio_nro: data.data.domicilio_nro || '',
          domicilio_localidad: data.data.domicilio_localidad || '',
        })
        setSuccessMessage('✅ Datos extraídos correctamente. Revise y confirme.')
      } else {
        setError(data.error || 'Error al procesar el archivo')
      }
    } catch {
      setError('Error de conexión al procesar el archivo')
    } finally {
      setLoadingOCR(false)
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.dni.trim()) {
      setError('El DNI es obligatorio')
      return
    }

    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni: formData.dni,
          nombre: formData.nombre,
          genero: formData.genero || null,
          cuit: formData.cuit || null,
          telefono: formData.telefono || null,
          email: formData.email || null,
          domicilio_calle: formData.domicilio_calle || null,
          domicilio_nro: formData.domicilio_nro || null,
          domicilio_localidad: formData.domicilio_localidad || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onRegistroExitoso?.()
        onOpenChange(false)
        // Resetear formulario
        setFormData({
          dni: '',
          nombre: '',
          genero: '',
          cuit: '',
          telefono: '',
          email: '',
          domicilio_calle: '',
          domicilio_nro: '',
          domicilio_localidad: '',
        })
      } else {
        setError(data.error || 'Error al registrar persona')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Registrar Nueva Persona
          </DialogTitle>
          <DialogDescription>
            Complete los datos de la persona. DNI y nombre son obligatorios.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Botones de OCR */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            🤖 <strong>IA Automática:</strong> Escanea el DNI para llenar automáticamente
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleEscanearDNI}
              disabled={loadingOCR}
              className="flex-1"
              variant="outline"
            >
              {loadingOCR ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir DNI (Foto o PDF)
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            📸 Formatos: JPG, PNG, PDF. Imágenes: máx 5MB. PDFs: máx 10MB.
          </p>
        </div>

        {/* Input oculto para archivo */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DNI y Nombre (obligatorios) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">
                DNI <span className="text-red-600">*</span>
              </Label>
              <Input
                id="dni"
                placeholder="Ej: 12345678"
                value={formData.dni}
                onChange={(e) => handleChange('dni', e.target.value)}
                required
                maxLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuit">CUIT</Label>
              <Input
                id="cuit"
                placeholder="Ej: 20-12345678-9"
                value={formData.cuit}
                onChange={(e) => handleChange('cuit', e.target.value)}
                maxLength={13}
              />
            </div>
          </div>

          {/* Nombre completo */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre Completo <span className="text-red-600">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Juan Carlos Pérez"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
            />
          </div>

          {/* Género */}
          <div className="space-y-2">
            <Label htmlFor="genero">Género</Label>
            <Select value={formData.genero} onValueChange={(value) => handleChange('genero', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                placeholder="Ej: 11-2345-6789"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ej: ejemplo@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>

          {/* Domicilio */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="domicilio_calle">Calle</Label>
              <Input
                id="domicilio_calle"
                placeholder="Ej: Av. San Martín"
                value={formData.domicilio_calle}
                onChange={(e) => handleChange('domicilio_calle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domicilio_nro">Número</Label>
              <Input
                id="domicilio_nro"
                placeholder="Ej: 1234"
                value={formData.domicilio_nro}
                onChange={(e) => handleChange('domicilio_nro', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domicilio_localidad">Localidad</Label>
            <Input
              id="domicilio_localidad"
              placeholder="Ej: Lanús"
              value={formData.domicilio_localidad}
              onChange={(e) => handleChange('domicilio_localidad', e.target.value)}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.dni.trim() || !formData.nombre.trim()}>
              {loading ? 'Registrando...' : 'Registrar Persona'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
