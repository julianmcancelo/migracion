'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react'
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
  'Leyenda de Escolares o Niños Tamaño minimo: 0,20 mts',
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
  const [eliminando, setEliminando] = useState(false)
  const [inspeccion, setInspeccion] = useState<Inspeccion | null>(null)
  const [puedeEliminar, setPuedeEliminar] = useState(false)

  const [nombreInspector, setNombreInspector] = useState('')
  const [resultado, setResultado] = useState<
    'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CONDICIONAL'
  >('PENDIENTE')
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
    verificarPermisos()
  }, [params.id])

  const verificarPermisos = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      if (data.success && data.user) {
        setPuedeEliminar(data.user.email === 'jmcancelo@lanus.gob.ar')
      }
    } catch (error) {
      console.error('Error al verificar permisos:', error)
    }
  }

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
      [index]: { ...prev[index], estado },
    }))
  }

  const setItemObservacion = (index: number, observacion: string) => {
    setItems(prev => ({
      ...prev,
      [index]: { ...prev[index], observacion },
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
        observacion: items[index].observacion,
      })).filter(item => item.estado !== null) // Solo enviar items con estado

      const response = await fetch(`/api/inspecciones/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_inspector: nombreInspector.trim(),
          resultado,
          observaciones: observaciones.trim(),
          items: itemsChecklist,
        }),
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

  const handleEliminar = async () => {
    if (!confirm('⚠️ ¿Está seguro de ELIMINAR esta inspección?\n\nEsta acción no se puede deshacer.')) {
      return
    }

    setEliminando(true)

    try {
      const response = await fetch(`/api/inspecciones/${params.id}/eliminar`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Inspección eliminada exitosamente')
        router.push('/inspecciones')
      } else {
        alert('❌ Error: ' + (data.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('❌ Error al eliminar la inspección')
    } finally {
      setEliminando(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Cargando inspección...</span>
        </div>
      </div>
    )
  }

  if (!inspeccion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-20 text-center">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Inspección no encontrada</h2>
          <Link href="/inspecciones">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Link href="/inspecciones">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Completar Inspección</h1>
          </div>
          <p className="text-sm text-gray-600">
            Licencia N°{' '}
            <span className="font-mono font-bold text-blue-600">{inspeccion.nro_licencia}</span>
          </p>
        </div>
        
        {/* Botón Eliminar - Solo para usuario autorizado */}
        {puedeEliminar && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEliminar}
            disabled={eliminando}
            className="bg-red-600 hover:bg-red-700"
          >
            {eliminando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Inspección
              </>
            )}
          </Button>
        )}
      </div>

      {/* Información de la habilitación */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-3 font-semibold text-blue-900">Información del Trámite</h3>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div>
            <span className="font-medium text-blue-700">Fecha inspección:</span>
            <span className="ml-2 text-blue-900">
              {new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-AR')}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Tipo:</span>
            <span className="ml-2 text-blue-900">{inspeccion.tipo_transporte || 'N/A'}</span>
          </div>
          {titular && (
            <>
              <div>
                <span className="font-medium text-blue-700">Titular:</span>
                <span className="ml-2 text-blue-900">{titular.nombre}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">DNI:</span>
                <span className="ml-2 font-mono text-blue-900">{titular.dni}</span>
              </div>
            </>
          )}
          {vehiculo && (
            <>
              <div>
                <span className="font-medium text-blue-700">Vehículo:</span>
                <span className="ml-2 font-mono font-bold text-blue-900">{vehiculo.dominio}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Marca/Modelo:</span>
                <span className="ml-2 text-blue-900">
                  {vehiculo.marca} {vehiculo.modelo}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleGuardar} className="space-y-6 rounded-lg border bg-white p-6">
        <div>
          <Label htmlFor="inspector" className="text-base font-semibold">
            Nombre del Inspector <span className="text-red-500">*</span>
          </Label>
          <Input
            id="inspector"
            value={nombreInspector}
            onChange={e => setNombreInspector(e.target.value)}
            placeholder="Ej: Juan Pérez"
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label className="mb-3 block text-base font-semibold">
            Resultado de la Inspección <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setResultado('APROBADO')}
              className={`rounded-lg border-2 p-4 transition-all ${
                resultado === 'APROBADO'
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              <CheckCircle
                className={`mx-auto mb-2 h-8 w-8 ${resultado === 'APROBADO' ? 'text-green-600' : 'text-gray-400'}`}
              />
              <span
                className={`font-semibold ${resultado === 'APROBADO' ? 'text-green-900' : 'text-gray-700'}`}
              >
                APROBADO
              </span>
            </button>

            <button
              type="button"
              onClick={() => setResultado('CONDICIONAL')}
              className={`rounded-lg border-2 p-4 transition-all ${
                resultado === 'CONDICIONAL'
                  ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-500'
                  : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
              }`}
            >
              <AlertCircle
                className={`mx-auto mb-2 h-8 w-8 ${resultado === 'CONDICIONAL' ? 'text-yellow-600' : 'text-gray-400'}`}
              />
              <span
                className={`font-semibold ${resultado === 'CONDICIONAL' ? 'text-yellow-900' : 'text-gray-700'}`}
              >
                CONDICIONAL
              </span>
            </button>

            <button
              type="button"
              onClick={() => setResultado('RECHAZADO')}
              className={`rounded-lg border-2 p-4 transition-all ${
                resultado === 'RECHAZADO'
                  ? 'border-red-500 bg-red-50 ring-2 ring-red-500'
                  : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <XCircle
                className={`mx-auto mb-2 h-8 w-8 ${resultado === 'RECHAZADO' ? 'text-red-600' : 'text-gray-400'}`}
              />
              <span
                className={`font-semibold ${resultado === 'RECHAZADO' ? 'text-red-900' : 'text-gray-700'}`}
              >
                RECHAZADO
              </span>
            </button>
          </div>
        </div>

        {/* Checklist detallado */}
        <div className="border-t pt-6">
          <h3 className="mb-4 text-center text-lg font-bold text-red-600">
            DETALLES Y OBSERVACIONES DEL VEHÍCULO
          </h3>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-100">
                <tr>
                  <th className="border-r p-3 text-left font-semibold">Descripción</th>
                  <th className="w-24 border-r p-3 text-center font-semibold">Bien</th>
                  <th className="w-24 border-r p-3 text-center font-semibold">Regular</th>
                  <th className="w-24 border-r p-3 text-center font-semibold">Mal</th>
                  <th className="w-48 p-3 text-left font-semibold">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {ITEMS_CHECKLIST.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="border-r p-3 text-xs">{item}</td>
                    <td className="border-r p-3 text-center">
                      <input
                        type="radio"
                        name={`item-${index}`}
                        checked={items[index].estado === 'BIEN'}
                        onChange={() => setItemEstado(index, 'BIEN')}
                        className="h-4 w-4 cursor-pointer text-green-600"
                      />
                    </td>
                    <td className="border-r bg-pink-50 p-3 text-center">
                      <input
                        type="radio"
                        name={`item-${index}`}
                        checked={items[index].estado === 'REGULAR'}
                        onChange={() => setItemEstado(index, 'REGULAR')}
                        className="h-4 w-4 cursor-pointer text-yellow-600"
                      />
                    </td>
                    <td className="border-r p-3 text-center">
                      <input
                        type="radio"
                        name={`item-${index}`}
                        checked={items[index].estado === 'MAL'}
                        onChange={() => setItemEstado(index, 'MAL')}
                        className="h-4 w-4 cursor-pointer text-red-600"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={items[index].observacion}
                        onChange={e => setItemObservacion(index, e.target.value)}
                        placeholder="Detalles..."
                        className="h-8 text-xs"
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
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Observaciones adicionales sobre la inspección completa..."
            rows={3}
            className="mt-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Opcional - Comentarios adicionales que no correspondan a los items anteriores
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Inspección
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
