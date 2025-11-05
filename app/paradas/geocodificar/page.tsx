'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Download, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileSpreadsheet,
  Map,
  DollarSign,
  Clock,
  Zap,
  Wrench,
  Navigation,
  Scissors,
  Layers
} from 'lucide-react'

interface GeocodeProgress {
  total: number
  processed: number
  ok: number
  errors: number
  currentAddress: string
  status: 'idle' | 'processing' | 'completed' | 'error'
}

interface GeocodeResult {
  csv: string
  geojson: any
  reporte: any
}

export default function GeocodeInterfazPage() {
  const [file, setFile] = useState<File | null>(null)
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [rateLimit, setRateLimit] = useState(50)
  const [maxRequests, setMaxRequests] = useState(0)
  const [progress, setProgress] = useState<GeocodeProgress>({
    total: 0,
    processed: 0,
    ok: 0,
    errors: 0,
    currentAddress: '',
    status: 'idle'
  })
  const [result, setResult] = useState<GeocodeResult | null>(null)
  const [estimatedCost, setEstimatedCost] = useState<string>('')
  
  // Estados para geocodificación individual
  const [singleAddress, setSingleAddress] = useState('')
  const [singleResult, setSingleResult] = useState<any>(null)
  const [singleLoading, setSingleLoading] = useState(false)
  
  // Estados para guardar en BD
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Estados para dividir y unificar
  const [rowsPerFile, setRowsPerFile] = useState(50)
  const [mergeFiles, setMergeFiles] = useState<File[]>([])

  // Dividir Excel en lotes
  const handleSplitExcel = async () => {
    if (!file) {
      toast.error('Primero selecciona un archivo Excel')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('rowsPerFile', rowsPerFile.toString())

      const response = await fetch('/api/paradas/split-excel', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        toast.error(`Error: ${errorData.error || 'Error al dividir'}`)
        return
      }

      // Descargar ZIP
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `paradas_divididas_${rowsPerFile}_filas.zip`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success(`✅ Archivo dividido en lotes de ${rowsPerFile} filas!`)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(`Error: ${error.message}`)
    }
  }

  // Unificar múltiples archivos
  const handleMergeExcel = async () => {
    if (mergeFiles.length === 0) {
      toast.error('Selecciona al menos un archivo para unificar')
      return
    }

    try {
      const formData = new FormData()
      mergeFiles.forEach(f => formData.append('files', f))

      const response = await fetch('/api/paradas/merge-excel', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        toast.error(`Error: ${errorData.error || 'Error al unificar'}`)
        return
      }

      // Descargar archivo unificado
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'paradas_unificadas.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success(`✅ ${mergeFiles.length} archivos unificados correctamente!`)
      setMergeFiles([])
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(`Error: ${error.message}`)
    }
  }

  // Formatear Excel de Lanús
  const handleFormatLanusExcel = async () => {
    if (!file) {
      toast.error('Primero selecciona un archivo Excel')
      return
    }

    console.log('📁 Formateando archivo de Lanús:', file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/paradas/format-lanus-excel', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error del servidor:', errorData)
        toast.error(`Error: ${errorData.error || 'Error desconocido'}`)
        return
      }

      // Descargar archivo formateado
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'paradas_lanus_formato_geocode.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('✅ Excel formateado. ¡Ahora sube el archivo descargado para geocodificar!')
    } catch (error: any) {
      console.error('Error completo:', error)
      toast.error(`Error: ${error.message}`)
    }
  }

  // Arreglar Excel
  const handleFixExcel = async () => {
    if (!file) {
      toast.error('Primero selecciona un archivo Excel')
      return
    }

    console.log('📁 Archivo seleccionado:', file.name, file.type, file.size)

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('📤 Enviando petición a /api/paradas/fix-excel...')

      const response = await fetch('/api/paradas/fix-excel', {
        method: 'POST',
        body: formData
      })

      console.log('📥 Respuesta recibida:', response.status, response.statusText)

      if (!response.ok) {
        // Intentar leer el error JSON
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error del servidor:', errorData)
        toast.error(`Error: ${errorData.error || 'Error desconocido'}`)
        if (errorData.details) {
          console.error('Detalles:', errorData.details)
        }
        return
      }

      // Descargar archivo arreglado
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'paradas_arregladas.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('✅ Excel arreglado. Ahora sube el archivo descargado!')
    } catch (error: any) {
      console.error('Error completo:', error)
      toast.error(`Error: ${error.message}`)
    }
  }

  // Geocodificar dirección individual
  const handleGeocodeSingle = async () => {
    if (!singleAddress.trim()) {
      toast.error('Ingresa una dirección')
      return
    }

    setSingleLoading(true)
    setSingleResult(null)

    try {
      const response = await fetch('/api/paradas/geocode-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: singleAddress })
      })

      const data = await response.json()

      if (data.success) {
        setSingleResult(data)
        toast.success('¡Dirección geocodificada!')
      } else {
        toast.error(data.error || 'No se pudo geocodificar')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al geocodificar')
    } finally {
      setSingleLoading(false)
    }
  }

  // Guardar en base de datos
  const handleSaveToDatabase = async () => {
    if (!result?.geojson?.features) {
      toast.error('No hay datos para guardar')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/paradas/save-geocoded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: result.geojson.features })
      })

      const data = await response.json()

      if (data.success) {
        setSaved(true)
        toast.success(`✅ ${data.message}`)
      } else {
        toast.error(data.error || 'Error al guardar')
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al guardar en base de datos')
    } finally {
      setSaving(false)
    }
  }

  // Manejar carga de archivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast.error('Por favor selecciona un archivo Excel (.xlsx o .xls)')
      return
    }

    setFile(selectedFile)
    toast.success('Archivo cargado: ' + selectedFile.name)

    // Obtener nombres de hojas
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/paradas/upload-excel', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setSheetNames(data.sheets)
        setSelectedSheet(data.sheets[0])
        setEstimatedCost(`~$${(data.rowCount * 0.005).toFixed(2)} USD para ${data.rowCount} filas`)
      }
    } catch (error) {
      console.error('Error al analizar Excel:', error)
    }
  }

  // Ejecutar geocodificación
  const handleGeocode = async () => {
    if (!file) {
      toast.error('Primero selecciona un archivo Excel')
      return
    }

    setProgress({
      total: 0,
      processed: 0,
      ok: 0,
      errors: 0,
      currentAddress: '',
      status: 'processing'
    })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sheet', selectedSheet)
      formData.append('rate', rateLimit.toString())
      formData.append('maxRequests', maxRequests.toString())

      const response = await fetch('/api/paradas/geocode', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error en la geocodificación')
      }

      // Leer el stream de progreso
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No se pudo leer la respuesta')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            
            if (data.type === 'progress') {
              setProgress(prev => ({
                ...prev,
                ...data.data
              }))
            } else if (data.type === 'complete') {
              setProgress(prev => ({ ...prev, status: 'completed' }))
              setResult(data.data)
              toast.success('¡Geocodificación completada!')
            } else if (data.type === 'error') {
              throw new Error(data.message)
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error en la geocodificación')
      setProgress(prev => ({ ...prev, status: 'error' }))
    }
  }

  // Descargar CSV
  const downloadCSV = () => {
    if (!result?.csv) return
    const blob = new Blob([result.csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `paradas_geocodificadas_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Descargar GeoJSON
  const downloadGeoJSON = () => {
    if (!result?.geojson) return
    const blob = new Blob([JSON.stringify(result.geojson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `paradas_geocodificadas_${new Date().toISOString().split('T')[0]}.geojson`
    a.click()
    URL.revokeObjectURL(url)
  }

  const progressPercent = progress.total > 0 
    ? Math.round((progress.processed / progress.total) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Map className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Geocodificador de Paradas
          </h1>
          <p className="text-gray-600">
            Convierte direcciones de Excel a coordenadas GPS automáticamente
          </p>
        </div>

        {/* Herramientas Rápidas */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Geocodificación Individual */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-900">Geocodificar Dirección</h3>
                <p className="text-sm text-green-700">Obtén coordenadas de una sola dirección</p>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Ej: Av. Hipólito Yrigoyen 2050, Lanús"
                value={singleAddress}
                onChange={(e) => setSingleAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGeocodeSingle()}
              />
              <Button 
                onClick={handleGeocodeSingle}
                disabled={singleLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {singleLoading ? 'Geocodificando...' : 'Obtener Coordenadas'}
              </Button>

              {singleResult && (
                <div className="p-4 bg-white rounded-lg border border-green-300 mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Resultado:</p>
                  <p className="text-xs text-gray-600 mb-2">{singleResult.formatted_address}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-green-100 rounded">
                      <p className="text-xs text-green-600 font-medium">Latitud</p>
                      <p className="font-mono text-green-900">{singleResult.lat.toFixed(6)}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded">
                      <p className="text-xs text-green-600 font-medium">Longitud</p>
                      <p className="font-mono text-green-900">{singleResult.lng.toFixed(6)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Place ID: {singleResult.place_id}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Formatear Excel de Lanús */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-orange-900">Formatear Excel Lanús</h3>
                <p className="text-sm text-orange-700">Convierte tu Excel al formato geocodificable</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded border border-orange-200 text-sm text-orange-800">
                <p className="font-medium mb-1">✨ Convierte automáticamente:</p>
                <ul className="text-xs space-y-1">
                  <li>• AVENIDA → Calle</li>
                  <li>• ALTURA → Altura</li>
                  <li>• INTERSECCION → EntreCalles</li>
                  <li>• <strong>Crea dirección exacta:</strong> Calle + Altura</li>
                  <li>• Agrega columnas para LAT/LNG</li>
                  <li>• Mantiene N° OBJE, TIPO, ORIENTACION</li>
                </ul>
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs text-green-800">
                    <strong>Ejemplo:</strong> &quot;29 de Septiembre 1853, Lanús&quot;
                  </p>
                </div>
              </div>

              <Button
                onClick={handleFormatLanusExcel}
                disabled={!file}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Wrench className="w-4 h-4 mr-2" />
                {file ? '🔄 Formatear Excel' : 'Primero sube un archivo'}
              </Button>

              {file && (
                <p className="text-xs text-orange-600 text-center font-medium">
                  💾 Descarga el Excel formateado y luego súbelo para geocodificar
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Herramientas Avanzadas: Dividir y Unificar */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Dividir en lotes */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Dividir en Lotes</h3>
                <p className="text-sm text-blue-700">Para geocodificar de a poco</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded border border-blue-200 text-sm text-blue-800">
                <p className="font-medium mb-2">💡 ¿Por qué dividir?</p>
                <ul className="text-xs space-y-1">
                  <li>• Evita timeouts en archivos grandes</li>
                  <li>• Geocodifica de a poco sin perder progreso</li>
                  <li>• Pausa y continúa cuando quieras</li>
                </ul>
              </div>

              <div>
                <Label className="text-blue-900">Filas por archivo</Label>
                <Input
                  type="number"
                  value={rowsPerFile}
                  onChange={(e) => setRowsPerFile(parseInt(e.target.value) || 50)}
                  min="10"
                  max="1000"
                  className="mt-1"
                />
                <p className="text-xs text-blue-600 mt-1">
                  Recomendado: 50-100 filas por archivo
                </p>
              </div>

              <Button
                onClick={handleSplitExcel}
                disabled={!file}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Scissors className="w-4 h-4 mr-2" />
                {file ? `✂️ Dividir en lotes de ${rowsPerFile}` : 'Sube un archivo primero'}
              </Button>
            </div>
          </Card>

          {/* Unificar archivos */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-purple-900">Unificar Archivos</h3>
                <p className="text-sm text-purple-700">Combina varios en uno</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded border border-purple-200 text-sm text-purple-800">
                <p className="font-medium mb-1">📦 Une archivos geocodificados</p>
                <p className="text-xs">
                  Selecciona todos los lotes que geocodificaste y únelos en un solo Excel
                </p>
              </div>

              <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept=".xlsx,.xls"
                  onChange={(e) => setMergeFiles(Array.from(e.target.files || []))}
                  className="hidden"
                  id="merge-files-upload"
                />
                <label htmlFor="merge-files-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm text-purple-900 font-medium">
                    {mergeFiles.length > 0 
                      ? `${mergeFiles.length} archivos seleccionados` 
                      : 'Click para seleccionar archivos'}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Puedes seleccionar múltiples archivos
                  </p>
                </label>
              </div>

              <Button
                onClick={handleMergeExcel}
                disabled={mergeFiles.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Layers className="w-4 h-4 mr-2" />
                {mergeFiles.length > 0 ? `📦 Unificar ${mergeFiles.length} archivos` : 'Selecciona archivos primero'}
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Panel de Configuración */}
          <div className="md:col-span-2 space-y-6">
            {/* Paso 1: Subir Archivo */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">1</span>
                Subir Archivo Excel
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto" />
                      <p className="text-green-600 font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">Click para cambiar archivo</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600 font-medium">Click para seleccionar archivo</p>
                      <p className="text-sm text-gray-500">Archivos .xlsx o .xls</p>
                    </div>
                  )}
                </label>
              </div>

              {sheetNames.length > 0 && (
                <div className="mt-4">
                  <Label>Hoja del Excel</Label>
                  <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sheetNames.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </Card>

            {/* Paso 2: Configuración */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">2</span>
                Configuración
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate">Velocidad (requests/min)</Label>
                  <Input
                    id="rate"
                    type="number"
                    min="1"
                    max="100"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(parseInt(e.target.value) || 50)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recomendado: 30-50 para evitar límites
                  </p>
                </div>

                <div>
                  <Label htmlFor="max">Límite de Filas (0 = todas)</Label>
                  <Input
                    id="max"
                    type="number"
                    min="0"
                    value={maxRequests}
                    onChange={(e) => setMaxRequests(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    0 = procesar todo el archivo
                  </p>
                </div>
              </div>

              {estimatedCost && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Costo Estimado</p>
                    <p className="text-sm text-yellow-700">{estimatedCost}</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Incluye $200 USD gratis/mes (~40,000 requests)
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Paso 3: Ejecutar */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">3</span>
                Ejecutar Geocodificación
              </h2>

              <Button
                onClick={handleGeocode}
                disabled={!file || progress.status === 'processing'}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {progress.status === 'processing' ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Geocodificando...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Iniciar Geocodificación
                  </>
                )}
              </Button>

              {progress.status === 'processing' && (
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progreso</span>
                      <span>{progress.processed} / {progress.total} ({progressPercent}%)</span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Exitosas</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600 mt-1">{progress.ok}</p>
                    </div>

                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-900">Errores</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600 mt-1">{progress.errors}</p>
                    </div>
                  </div>

                  {progress.currentAddress && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium mb-1">PROCESANDO</p>
                      <p className="text-sm text-blue-900">{progress.currentAddress}</p>
                    </div>
                  )}
                </div>
              )}

              {progress.status === 'completed' && result && (
                <div className="mt-6 space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="font-medium text-green-900">¡Geocodificación Completada!</p>
                    </div>
                    <p className="text-sm text-green-700">
                      {result.reporte.geocodificadas_ok} paradas geocodificadas correctamente
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={downloadCSV} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar CSV
                    </Button>
                    <Button onClick={downloadGeoJSON} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar GeoJSON
                    </Button>
                  </div>

                  <Button
                    onClick={() => window.location.href = '/paradas/geocodificadas'}
                    className="w-full"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Ver en el Mapa
                  </Button>

                  {/* Botón para guardar en BD */}
                  <Button
                    onClick={handleSaveToDatabase}
                    disabled={saving || saved}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {saving ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Guardando en BD...
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        ✅ Guardado en Base de Datos
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        💾 Guardar en Base de Datos
                      </>
                    )}
                  </Button>

                  {saved && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-900">
                        Las paradas ya están disponibles en <a href="/paradas" className="underline font-medium">el mapa principal</a>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Panel de Información */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <h3 className="font-bold text-lg mb-4">Instrucciones</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Sube tu archivo Excel con las direcciones</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Configura la velocidad y límites</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Click en &quot;Iniciar Geocodificación&quot;</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Descarga los resultados o visualiza en el mapa</span>
                </li>
              </ol>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Requisitos del Excel
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Calle</strong> o Dirección</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Altura</strong> o Número</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Localidad</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Provincia</strong> (opcional)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>CodigoParada</strong> (opcional)</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-bold text-yellow-900 mb-1">Consejo</h3>
                  <p className="text-sm text-yellow-700">
                    Empieza con pocas filas (10-20) para probar antes de procesar todo el archivo
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
