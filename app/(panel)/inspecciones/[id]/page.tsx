'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

// Items de checklist para vehículos escolares
const ITEMS_CHECKLIST = [
  'Pta. accionada cond. para desc./ asc. (Puerta derecha)',
  'Pta. accionada cond. para desc./ asc. (Puerta izquierda)',
  'Salida de Emer. indep. de la plataf. asc. / desc. (En Caso de Combi - L. Der. y Trasero)',
  'Vent. Vidrio Temp. / inastillable (Apertura 10 cm)',
  'Pisos rec. con mat. Antideslizables',
  'Dimens. de Banquetas (desde el piso 0.40 mts - ancho min 0.45mts Prof. medida horiz. 0.40 mts)',
  'Asientos: Fijos, Acolchados, Estructu. metalicas, revestimiento (Caucho o similar)',
  'Puerta Izquierda de la Carroceria',
  'Cinturones de Seguridad en todos los asientos',
  'Cabezales o apoya Cabeza en todos los asientos',
  'Espacios Libres',
  'Pintura (Carroceria baja y capot naranja Nº 1054 IRAM - carroceria alta techo y parantes Color blanco)',
  'Leyenda de Escolares o Niños Tamaño minimo: 0,20 mts'
]

interface ItemChecklist {
  estado: 'BIEN' | 'REGULAR' | 'MAL' | null
  observacion: string
}

interface Inspeccion {
  id: number
  habilitacion_id: number
  nro_licencia: string
  nombre_inspector: string
  fecha_inspeccion: string
  tipo_transporte: string
  resultado: string
  email_contribuyente?: string
  habilitacion?: {
    nro_licencia: string
    tipo_transporte: string
    habilitaciones_personas?: Array<{
      persona: {
        nombre: string
        dni: string
        email?: string
      }
    }>
    habilitaciones_vehiculos?: Array<{
      vehiculo: {
        dominio: string
        marca?: string
        modelo?: string
      }
    }>
  }
}

export default function EditarInspeccionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [inspeccion, setInspeccion] = useState<Inspeccion | null>(null)
  
  const [nombreInspector, setNombreInspector] = useState('')
  const [resultado, setResultado] = useState<'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CONDICIONAL'>('PENDIENTE')
  const [observaciones, setObservaciones] = useState('')
  
  // Estado para checklist de items
  const [items, setItems] = useState<Record<number, ItemChecklist>>(() => {
    const initial: Record<number, ItemChecklist> = {}
    ITEMS_CHECKLIST.forEach((_, index) => {
      initial[index] = { estado: null, observacion: '' }
    })
    return initial
  })

  useEffect(() => {
    cargarInspeccion()
  }, [params.id])

  const cargarInspeccion = async () => {
    try {
      const response = await fetch(`/api/inspecciones/${params.id}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const insp = data.data
        setInspeccion(insp)
        setNombreInspector(insp.nombre_inspector === 'PENDIENTE' ? '' : insp.nombre_inspector)
        setResultado(insp.resultado || 'PENDIENTE')
        setObservaciones('')
      }
    } catch (error) {
      console.error('Error al cargar inspección:', error)
      alert('Error al cargar la inspección')
    } finally {
      setLoading(false)
    }
  }

  const setItemEstado = (index: number, estado: 'BIEN' | 'REGULAR' | 'MAL') => {
    setItems(prev => ({
      ...prev,
      [index]: { ...prev[index], estado }
    }))
  }

  const setItemObservacion = (index: number, observacion: string) => {
    setItems(prev => ({
      ...prev,
      [index]: { ...prev[index], observacion }
    }))
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombreInspector.trim()) {
      alert('Por favor ingrese el nombre del inspector')
      return
    }

    if (resultado === 'PENDIENTE') {
      alert('Por favor seleccione un resultado para la inspección')
      return
    }

    setGuardando(true)

    try {
      // Preparar items del checklist
      const itemsChecklist = ITEMS_CHECKLIST.map((nombre, index) => ({
        nombre,
        estado: items[index].estado,
        observacion: items[index].observacion
      })).filter(item => item.estado !== null) // Solo enviar items con estado

      const response = await fetch(`/api/inspecciones/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_inspector: nombreInspector.trim(),
          resultado,
          observaciones: observaciones.trim(),
          items: itemsChecklist
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Inspección actualizada exitosamente')
        router.push('/inspecciones')
      } else {
        alert('❌ Error: ' + (data.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('❌ Error al guardar la inspección')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Cargando inspección...</span>
        </div>
      </div>
    )
  }

  if (!inspeccion) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-20">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inspección no encontrada</h2>
          <Link href="/inspecciones">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a inspecciones
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const titular = inspeccion.habilitacion?.habilitaciones_personas?.[0]?.persona
  const vehiculo = inspeccion.habilitacion?.habilitaciones_vehiculos?.[0]?.vehiculo

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/inspecciones">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Completar Inspección
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Licencia N° <span className="font-mono font-bold text-blue-600">{inspeccion.nro_licencia}</span>
          </p>
        </div>
      </div>

      {/* Información de la habilitación */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">Información del Trámite</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-blue-700 font-medium">Fecha inspección:</span>
            <span className="ml-2 text-blue-900">
              {new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-AR')}
            </span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Tipo:</span>
            <span className="ml-2 text-blue-900">{inspeccion.tipo_transporte || 'N/A'}</span>
          </div>
          {titular && (
            <>
              <div>
                <span className="text-blue-700 font-medium">Titular:</span>
                <span className="ml-2 text-blue-900">{titular.nombre}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">DNI:</span>
                <span className="ml-2 text-blue-900 font-mono">{titular.dni}</span>
              </div>
            </>
          )}
          {vehiculo && (
            <>
              <div>
                <span className="text-blue-700 font-medium">Vehículo:</span>
                <span className="ml-2 text-blue-900 font-mono font-bold">{vehiculo.dominio}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Marca/Modelo:</span>
                <span className="ml-2 text-blue-900">{vehiculo.marca} {vehiculo.modelo}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleGuardar} className="bg-white border rounded-lg p-6 space-y-6">
        <div>
          <Label htmlFor="inspector" className="text-base font-semibold">
            Nombre del Inspector <span className="text-red-500">*</span>
          </Label>
          <Input
            id="inspector"
            value={nombreInspector}
            onChange={(e) => setNombreInspector(e.target.value)}
            placeholder="Ej: Juan Pérez"
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">
            Resultado de la Inspección <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setResultado('APROBADO')}
              className={`p-4 rounded-lg border-2 transition-all ${
                resultado === 'APROBADO'
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              <CheckCircle className={`h-8 w-8 mx-auto mb-2 ${resultado === 'APROBADO' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`font-semibold ${resultado === 'APROBADO' ? 'text-green-900' : 'text-gray-700'}`}>
                APROBADO
              </span>
            </button>

            <button
              type="button"
              onClick={() => setResultado('CONDICIONAL')}
              className={`p-4 rounded-lg border-2 transition-all ${
                resultado === 'CONDICIONAL'
                  ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-500'
                  : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
              }`}
            >
              <AlertCircle className={`h-8 w-8 mx-auto mb-2 ${resultado === 'CONDICIONAL' ? 'text-yellow-600' : 'text-gray-400'}`} />
              <span className={`font-semibold ${resultado === 'CONDICIONAL' ? 'text-yellow-900' : 'text-gray-700'}`}>
                CONDICIONAL
              </span>
            </button>

            <button
              type="button"
              onClick={() => setResultado('RECHAZADO')}
              className={`p-4 rounded-lg border-2 transition-all ${
                resultado === 'RECHAZADO'
                  ? 'border-red-500 bg-red-50 ring-2 ring-red-500'
                  : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <XCircle className={`h-8 w-8 mx-auto mb-2 ${resultado === 'RECHAZADO' ? 'text-red-600' : 'text-gray-400'}`} />
              <span className={`font-semibold ${resultado === 'RECHAZADO' ? 'text-red-900' : 'text-gray-700'}`}>
                RECHAZADO
              </span>
            </button>
          </div>
        </div>

        {/* Checklist detallado */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-red-600 mb-4 text-center">
            DETALLES Y OBSERVACIONES DEL VEHÍCULO
          </h3>
          
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold border-r">Descripción</th>
                  <th className="text-center p-3 font-semibold border-r w-24">Bien</th>
                  <th className="text-center p-3 font-semibold border-r w-24">Regular</th>
                  <th className="text-center p-3 font-semibold border-r w-24">Mal</th>
                  <th className="text-left p-3 font-semibold w-48">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {ITEMS_CHECKLIST.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 border-r text-xs">{item}</td>
                    <td className="p-3 border-r text-center">
                      <input
                        type="radio"
                        name={`item-${index}`}
                        checked={items[index].estado === 'BIEN'}
                        onChange={() => setItemEstado(index, 'BIEN')}
                        className="w-4 h-4 text-green-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 border-r text-center bg-pink-50">
                      <input
                        type="radio"
                        name={`item-${index}`}
                        checked={items[index].estado === 'REGULAR'}
                        onChange={() => setItemEstado(index, 'REGULAR')}
                        className="w-4 h-4 text-yellow-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 border-r text-center">
                      <input
                        type="radio"
                        name={`item-${index}`}
                        checked={items[index].estado === 'MAL'}
                        onChange={() => setItemEstado(index, 'MAL')}
                        className="w-4 h-4 text-red-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={items[index].observacion}
                        onChange={(e) => setItemObservacion(index, e.target.value)}
                        placeholder="Detalles..."
                        className="text-xs h-8"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <Label htmlFor="observaciones" className="text-base font-semibold">
            Observaciones Generales
          </Label>
          <Textarea
            id="observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Observaciones adicionales sobre la inspección completa..."
            rows={3}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Opcional - Comentarios adicionales que no correspondan a los items anteriores
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/inspecciones">
            <Button type="button" variant="outline" disabled={guardando}>
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={guardando || !nombreInspector.trim() || resultado === 'PENDIENTE'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {guardando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Inspección
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
