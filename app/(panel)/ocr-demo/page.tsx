'use client'

import { useState } from 'react'
import { OCRScanner } from '@/components/ocr-scanner'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles } from 'lucide-react'

export default function OCRDemoPage() {
  const [dniData, setDniData] = useState<any>(null)
  const [cedulaData, setCedulaData] = useState<any>(null)

  return (
    <div className="container mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">OCR con IA</h1>
        </div>
        <p className="text-gray-600">
          Escanea documentos automáticamente usando inteligencia artificial de Google Gemini
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dni" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dni">DNI / Documento</TabsTrigger>
          <TabsTrigger value="cedula">Cédula de Vehículo</TabsTrigger>
        </TabsList>

        {/* DNI Tab */}
        <TabsContent value="dni" className="space-y-4">
          <OCRScanner
            type="dni"
            onDataExtracted={data => {
              console.log('Datos DNI extraídos:', data)
              setDniData(data)
            }}
          />

          {/* Mostrar JSON completo */}
          {dniData && (
            <Card className="p-4">
              <h3 className="mb-3 font-semibold text-gray-900">📋 Datos extraídos (JSON):</h3>
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">
                {JSON.stringify(dniData, null, 2)}
              </pre>
            </Card>
          )}
        </TabsContent>

        {/* Cédula Tab */}
        <TabsContent value="cedula" className="space-y-4">
          <OCRScanner
            type="cedula"
            onDataExtracted={data => {
              console.log('Datos Cédula extraídos:', data)
              setCedulaData(data)
            }}
          />

          {/* Mostrar JSON completo */}
          {cedulaData && (
            <Card className="p-4">
              <h3 className="mb-3 font-semibold text-gray-900">📋 Datos extraídos (JSON):</h3>
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">
                {JSON.stringify(cedulaData, null, 2)}
              </pre>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Info adicional */}
      <Card className="mt-8 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
        <h3 className="mb-3 text-lg font-bold text-purple-900">🚀 Cómo usar esta funcionalidad:</h3>
        <div className="space-y-2 text-sm text-purple-800">
          <p>
            <strong>1. En formularios de personas:</strong> Los usuarios podrán escanear el DNI y
            los campos se llenarán automáticamente.
          </p>
          <p>
            <strong>2. En formularios de vehículos:</strong> Escanear la cédula verde/azul para
            cargar todos los datos del vehículo instantáneamente.
          </p>
          <p>
            <strong>3. Validación:</strong> Los datos extraídos pueden compararse con bases de datos
            oficiales para detectar fraudes.
          </p>
          <p className="mt-4 border-t border-purple-200 pt-4">
            <strong>⚡ Próximamente:</strong> OCR de pólizas de seguro, VTV, y otros documentos.
          </p>
        </div>
      </Card>
    </div>
  )
}
