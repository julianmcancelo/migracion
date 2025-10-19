'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, CheckCircle, XCircle, Scan } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface OCRScannerProps {
  type: 'dni' | 'cedula'
  onDataExtracted: (data: any) => void
  buttonText?: string
}

export function OCRScanner({ type, onDataExtracted, buttonText }: OCRScannerProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const endpoint = type === 'dni' ? '/api/ai/ocr-dni' : '/api/ai/ocr-cedula'
  const docName = type === 'dni' ? 'DNI' : 'Cédula Verde'

  const processImage = async (file: File) => {
    setLoading(true)
    setError(null)
    setResult(null)

    // Mostrar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        onDataExtracted(data.data)
      } else {
        setError(data.error || 'Error al procesar la imagen')
      }
    } catch (err: any) {
      console.error('Error:', err)
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImage(file)
    }
  }

  const handleReset = () => {
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 pb-3 border-b">
          <Scan className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            {buttonText || `Escanear ${docName} con IA`}
          </h3>
        </div>

        {/* Botones de carga */}
        {!preview && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => cameraInputRef.current?.click()}
              variant="outline"
              className="h-24 flex flex-col gap-2"
            >
              <Camera className="h-8 w-8" />
              <span className="text-sm">Tomar Foto</span>
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="h-24 flex flex-col gap-2"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm">Subir Imagen</span>
            </Button>
          </div>
        )}

        {/* Inputs ocultos */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Preview de imagen */}
        {preview && (
          <div className="space-y-3">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full max-h-64 object-contain border rounded-lg bg-gray-50"
            />
            
            {!loading && !result && !error && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                Cambiar Imagen
              </Button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-medium">Procesando con IA...</span>
          </div>
        )}

        {/* Resultado exitoso */}
        {result && !error && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">¡Datos extraídos correctamente!</p>
                <p className="text-sm text-green-700">
                  Confianza: {result.confianza || 'N/A'}
                </p>
              </div>
            </div>

            {/* Datos extraídos */}
            <div className="bg-gray-50 border rounded-lg p-3 space-y-2 text-sm">
              {Object.entries(result).map(([key, value]) => {
                if (key === 'confianza' || value === null) return null
                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="font-medium text-gray-900">{String(value)}</span>
                  </div>
                )
              })}
            </div>

            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              Escanear Otro Documento
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Error al procesar</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>

            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              Intentar de Nuevo
            </Button>
          </div>
        )}

        {/* Ayuda */}
        {!preview && (
          <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
            <p className="font-medium text-blue-900 mb-1">💡 Consejos para mejores resultados:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Toma la foto con buena iluminación</li>
              <li>Asegúrate que el {docName} esté completo y legible</li>
              <li>Evita reflejos o sombras sobre el documento</li>
              <li>Mantén el documento lo más plano posible</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}
