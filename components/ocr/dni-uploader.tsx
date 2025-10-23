'use client'

import { useState, useRef } from 'react'
import { Upload, Camera, FileImage, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DatosExtraidos {
  dni: string | null
  nombre: string | null
  apellido: string | null
  fechaNacimiento: string | null
  sexo: string | null
  nacionalidad: string | null
  domicilio: string | null
  fechaVencimiento: string | null
}

interface ResultadoOCR {
  textoCompleto: string
  datosExtraidos: DatosExtraidos
  confianza: number
}

interface DNIUploaderProps {
  onDatosExtraidos: (datos: DatosExtraidos) => void
  onError?: (error: string) => void
  disabled?: boolean
}

export function DNIUploader({ onDatosExtraidos, onError, disabled = false }: DNIUploaderProps) {
  const [procesando, setProcesando] = useState(false)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoOCR | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validaciones
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Tipo de archivo no válido. Use JPG, PNG o WebP'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'El archivo es demasiado grande. Máximo 10MB'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    // Preview de la imagen
    const reader = new FileReader()
    reader.onload = e => {
      setImagenPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Procesar OCR
    await procesarOCR(file)
  }

  const procesarOCR = async (file: File) => {
    setProcesando(true)
    setError(null)
    setResultado(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/ocr/dni', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setResultado(result.data)
        onDatosExtraidos(result.data.datosExtraidos)
      } else {
        const errorMsg = result.error || 'Error al procesar la imagen'
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err: any) {
      const errorMsg = 'Error al conectar con el servidor'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setProcesando(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const limpiar = () => {
    setImagenPreview(null)
    setResultado(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Área de carga */}
      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50'
            : 'cursor-pointer border-blue-300 hover:border-blue-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
          disabled={disabled}
        />

        {procesando ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Procesando DNI con OCR...</p>
            <p className="text-xs text-gray-500">Esto puede tomar unos segundos</p>
          </div>
        ) : imagenPreview ? (
          <div className="space-y-3">
            <img
              src={imagenPreview}
              alt="Preview DNI"
              className="mx-auto max-h-40 rounded border"
            />
            <div className="flex justify-center gap-2">
              <Button
                onClick={e => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                variant="outline"
                size="sm"
                disabled={disabled}
              >
                <Upload className="mr-2 h-4 w-4" />
                Cambiar imagen
              </Button>
              <Button
                onClick={e => {
                  e.stopPropagation()
                  limpiar()
                }}
                variant="outline"
                size="sm"
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <FileImage className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Subir foto del DNI</p>
              <p className="mt-1 text-xs text-gray-500">
                Arrastra una imagen o haz clic para seleccionar
              </p>
              <p className="mt-1 text-xs text-gray-400">JPG, PNG o WebP (máx. 10MB)</p>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={disabled}>
                <Upload className="mr-2 h-4 w-4" />
                Seleccionar archivo
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={e => {
                  e.stopPropagation()
                  // Aquí podrías implementar captura desde cámara
                }}
              >
                <Camera className="mr-2 h-4 w-4" />
                Usar cámara
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Resultado del OCR */}
      {resultado && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Datos extraídos exitosamente</h3>
            <span className="ml-auto text-sm text-green-600">
              Confianza: {resultado.confianza}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(resultado.datosExtraidos)
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize text-gray-600">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                  </span>
                  <span className="font-medium text-gray-800">{String(value)}</span>
                </div>
              ))}
          </div>

          {resultado.confianza < 70 && (
            <div className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-800">
              ⚠️ Confianza baja. Revisa los datos extraídos antes de continuar.
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 font-semibold text-blue-800">💡 Consejos para mejores resultados:</h4>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• Asegúrate de que el DNI esté bien iluminado</li>
          <li>• Evita reflejos y sombras</li>
          <li>• Mantén el DNI plano y sin arrugas</li>
          <li>• Usa la mayor resolución posible</li>
          <li>• Verifica los datos extraídos antes de continuar</li>
        </ul>
      </div>
    </div>
  )
}
