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
        if (formData.domicilio_localidad)
          personaData.domicilio_localidad = formData.domicilio_localidad

        if (Object.keys(personaData).length > 0) {
          await fetch(`/api/personas/${formData.persona_id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(personaData),
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
            body: JSON.stringify(vehiculoData),
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
          body: JSON.stringify(habData),
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Generando documento...</p>
        </div>
      </div>
    )
  }

  if (error && !datosFaltantes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-8">
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-bold text-red-900">Error</h2>
          </div>
          <p className="mb-6 text-red-700">{error}</p>
          <div className="flex gap-3">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
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
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Faltan Datos Requeridos</h1>
            <p className="mt-2 text-gray-600">
              Complete la siguiente información para generar la resolución
            </p>
          </div>

          <form onSubmit={guardarDatos} className="space-y-6">
            {datosFaltantes.camposFaltantes.map(campo => {
              const fieldName = campo
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/ú/g, 'u')
                .replace(/é/g, 'e')
                .replace(/í/g, 'i')

              return (
                <div key={campo}>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{campo}</label>
                  <input
                    type={campo.includes('Año') ? 'number' : 'text'}
                    value={formData[fieldName] || ''}
                    onChange={e => setFormData({ ...formData, [fieldName]: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )
            })}

            <div className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={guardando}>
                {guardando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
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
