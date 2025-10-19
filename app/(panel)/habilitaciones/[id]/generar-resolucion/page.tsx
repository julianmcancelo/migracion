'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FileText, AlertTriangle, Download, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DatosFaltantes {
  camposFaltantes: string[]
  data: any
}

export default function GenerarResolucionPage() {
  const params = useParams()
  const router = useRouter()
  const habilitacionId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [datosFaltantes, setDatosFaltantes] = useState<DatosFaltantes | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [guardando, setGuardando] = useState(false)

  const generarDocumento = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/habilitaciones/${habilitacionId}/generar-resolucion`)
      
      if (response.ok) {
        // Descargar el archivo
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Resolucion-${habilitacionId}.docx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        
        if (data.camposFaltantes) {
          // Hay campos faltantes, mostrar formulario
          setDatosFaltantes(data)
          setFormData(data.data || {})
        } else {
          setError(data.error || 'Error al generar el documento')
        }
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const guardarDatos = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setError(null)

    try {
      // Actualizar datos de persona
      if (formData.persona_id) {
        const personaData: any = {}
        if (formData.titular_dni) personaData.dni = formData.titular_dni
        if (formData.domicilio_calle) personaData.domicilio_calle = formData.domicilio_calle
        if (formData.domicilio_nro) personaData.domicilio_nro = formData.domicilio_nro
        if (formData.domicilio_localidad) personaData.domicilio_localidad = formData.domicilio_localidad

        if (Object.keys(personaData).length > 0) {
          await fetch(`/api/personas/${formData.persona_id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(personaData)
          })
        }
      }

      // Actualizar datos de vehículo
      if (formData.vehiculo_id) {
        const vehiculoData: any = {}
        if (formData.vehiculo_dominio) vehiculoData.dominio = formData.vehiculo_dominio
        if (formData.vehiculo_marca) vehiculoData.marca = formData.vehiculo_marca
        if (formData.vehiculo_modelo) vehiculoData.modelo = formData.vehiculo_modelo
        if (formData.vehiculo_ano) vehiculoData.ano = Number(formData.vehiculo_ano)

        if (Object.keys(vehiculoData).length > 0) {
          await fetch(`/api/vehiculos/${formData.vehiculo_id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vehiculoData)
          })
        }
      }

      // Actualizar habilitación
      const habData: any = {}
      if (formData.expediente_nro) habData.expte = formData.expediente_nro
      if (formData.licencia_nro) habData.nro_licencia = formData.licencia_nro

      if (Object.keys(habData).length > 0) {
        await fetch(`/api/habilitaciones/${habilitacionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habData)
        })
      }

      // Reintentar generación
      setDatosFaltantes(null)
      await generarDocumento()

    } catch (err) {
      setError('Error al guardar los datos')
    } finally {
      setGuardando(false)
    }
  }

  useEffect(() => {
    generarDocumento()
  }, [])

  if (loading && !datosFaltantes) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-lg text-gray-600">Generando documento...</p>
        </div>
      </div>
    )
  }

  if (error && !datosFaltantes) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-bold text-red-900">Error</h2>
          </div>
          <p className="text-red-700 mb-6">{error}</p>
          <div className="flex gap-3">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button onClick={generarDocumento} className="bg-blue-600 hover:bg-blue-700">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (datosFaltantes) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-3xl mx-auto p-8">
          <div className="text-center mb-8">
            <div className="mx-auto bg-amber-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Faltan Datos Requeridos</h1>
            <p className="text-gray-600 mt-2">
              Complete la siguiente información para generar la resolución
            </p>
          </div>

          <form onSubmit={guardarDatos} className="space-y-6">
            {datosFaltantes.camposFaltantes.map((campo) => {
              const fieldName = campo.toLowerCase().replace(/\s+/g, '_').replace(/ú/g, 'u').replace(/é/g, 'e').replace(/í/g, 'i')
              
              return (
                <div key={campo}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {campo}
                  </label>
                  <input
                    type={campo.includes('Año') ? 'number' : 'text'}
                    value={formData[fieldName] || ''}
                    onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )
            })}

            <div className="border-t pt-6 flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={guardando}
              >
                {guardando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Guardar y Generar
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return null
}
