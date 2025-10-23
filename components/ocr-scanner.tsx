'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, CheckCircle, XCircle, Scan } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface OCRScannerProps {
  type: 'dni' | 'cedula' | 'poliza' | 'vtv' | 'titulo' | 'licencia'
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

  // Mapear tipo a endpoint y nombre
  const endpoints: Record<string, string> = {
    dni: '/api/ai/ocr-dni',
    cedula: '/api/ai/ocr-cedula',
    poliza: '/api/ai/ocr-poliza',
    vtv: '/api/ai/ocr-vtv',
    titulo: '/api/ai/ocr-titulo',
    licencia: '/api/ai/ocr-licencia',
  }

  const docNames: Record<string, string> = {
    dni: 'DNI',
    cedula: 'Cédula Verde',
    poliza: 'Póliza de Seguro',
    vtv: 'Certificado VTV',
    titulo: 'Título del Vehículo',
    licencia: 'Licencia de Conducir',
  }

  const endpoint = endpoints[type]
  const docName = docNames[type]

  const processImage = async (file: File) => {
    setLoading(true)
    setError(null)
    setResult(null)

    // Mostrar preview (solo para imágenes)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // Para PDFs, mostrar nombre del archivo
      setPreview('PDF: ' + file.name)
    }

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
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
        <div className="flex items-center gap-2 border-b pb-3">
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
              className="flex h-24 flex-col gap-2"
            >
              <Camera className="h-8 w-8" />
              <span className="text-sm">Tomar Foto</span>
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex h-24 flex-col gap-2"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm">Subir Imagen/PDF</span>
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
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Preview de imagen o PDF */}
        {preview && (
          <div className="space-y-3">
            {preview.startsWith('PDF:') ? (
              <div className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                <div className="mb-2 text-4xl text-red-600">📄</div>
                <p className="text-sm font-semibold text-gray-700">{preview}</p>
                <p className="mt-1 text-xs text-gray-500">Listo para procesar</p>
              </div>
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 w-full rounded-lg border bg-gray-50 object-contain"
              />
            )}

            {!loading && !result && !error && (
              <Button onClick={handleReset} variant="outline" className="w-full">
                Cambiar {preview.startsWith('PDF:') ? 'Archivo' : 'Imagen'}
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
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">¡Datos extraídos correctamente!</p>
                <p className="text-sm text-green-700">Confianza: {result.confianza || 'N/A'}</p>
              </div>
            </div>

            {/* Datos extraídos */}
            <div className="space-y-2 rounded-lg border bg-gray-50 p-3 text-sm">
              {Object.entries(result).map(([key, value]) => {
                if (key === 'confianza' || value === null) return null
                return (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize text-gray-600">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-medium text-gray-900">{String(value)}</span>
                  </div>
                )
              })}
            </div>

            <Button onClick={handleReset} variant="outline" className="w-full">
              Escanear Otro Documento
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Error al procesar</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>

            <Button onClick={handleReset} variant="outline" className="w-full">
              Intentar de Nuevo
            </Button>
          </div>
        )}

        {/* Ayuda */}
        {!preview && (
          <div className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-gray-500">
            <p className="mb-1 font-medium text-blue-900">💡 Consejos para mejores resultados:</p>
            <ul className="list-inside list-disc space-y-1 text-blue-800">
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
