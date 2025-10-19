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
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
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
            onDataExtracted={(data) => {
              console.log('Datos DNI extraídos:', data)
              setDniData(data)
            }}
          />

          {/* Mostrar JSON completo */}
          {dniData && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-gray-900">
                📋 Datos extraídos (JSON):
              </h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                {JSON.stringify(dniData, null, 2)}
              </pre>
            </Card>
          )}
        </TabsContent>

        {/* Cédula Tab */}
        <TabsContent value="cedula" className="space-y-4">
          <OCRScanner
            type="cedula"
            onDataExtracted={(data) => {
              console.log('Datos Cédula extraídos:', data)
              setCedulaData(data)
            }}
          />

          {/* Mostrar JSON completo */}
          {cedulaData && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-gray-900">
                📋 Datos extraídos (JSON):
              </h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                {JSON.stringify(cedulaData, null, 2)}
              </pre>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Info adicional */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <h3 className="font-bold text-lg mb-3 text-purple-900">
          🚀 Cómo usar esta funcionalidad:
        </h3>
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
          <p className="mt-4 pt-4 border-t border-purple-200">
            <strong>⚡ Próximamente:</strong> OCR de pólizas de seguro, VTV, y otros documentos.
          </p>
        </div>
      </Card>
    </div>
  )
}
