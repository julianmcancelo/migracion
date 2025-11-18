'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Shield, Camera, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Habilitacion {
  id: number
  nro_licencia: string
  tipo_transporte: string
  estado: string
  titular_nombre: string
  titular_dni: string
  vehiculo_dominio: string
  vehiculo_marca: string
  vehiculo_modelo: string
  vigencia_fin: string
}

function ColocarObleaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const canvasReceptorRef = useRef<HTMLCanvasElement>(null)
  const canvasInspectorRef = useRef<HTMLCanvasElement>(null)

  const [habilitacionId] = useState(searchParams.get('id'))
  const [habilitacion, setHabilitacion] = useState<Habilitacion | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados del formulario
  const [fotoOblea, setFotoOblea] = useState<string>('')
  const [firmaReceptor, setFirmaReceptor] = useState<string>('')
  const [firmaInspector, setFirmaInspector] = useState<string>('')
  const [firmandoReceptor, setFirmandoReceptor] = useState(false)
  const [firmandoInspector, setFirmandoInspector] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Cargar datos de la habilitación
  useEffect(() => {
    if (habilitacionId) {
      cargarHabilitacion()
    } else {
      setLoading(false)
    }
  }, [habilitacionId])

  const cargarHabilitacion = async () => {
    if (!habilitacionId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/habilitaciones/${habilitacionId}`)
      const data = await response.json()

      if (data.success) {
        const hab = data.data
        setHabilitacion({
          id: hab.id,
          nro_licencia: hab.nro_licencia,
          tipo_transporte: hab.tipo_transporte,
          estado: hab.estado,
          titular_nombre: hab.titular_principal || hab.titular_nombre,
          titular_dni: hab.titular_dni || 'N/A',
          vehiculo_dominio: hab.habilitaciones_vehiculos?.[0]?.vehiculo?.dominio || 'N/A',
          vehiculo_marca: hab.habilitaciones_vehiculos?.[0]?.vehiculo?.marca || '',
          vehiculo_modelo: hab.habilitaciones_vehiculos?.[0]?.vehiculo?.modelo || '',
          vigencia_fin: hab.vigencia_fin || 'N/A',
        })
      } else {
        alert('No se pudo cargar la habilitación')
      }
    } catch (error) {
      console.error('Error cargando habilitación:', error)
      alert('Error al cargar la habilitación')
    } finally {
      setLoading(false)
    }
  }

  const capturarFoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' as any

    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = event => {
          setFotoOblea(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const iniciarFirma = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    let dibujando = false

    const obtenerPosicion = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }
    }

    const iniciar = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      dibujando = true
      const pos = obtenerPosicion(e)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }

    const dibujar = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (!dibujando) return
      const pos = obtenerPosicion(e)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }

    const terminar = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      dibujando = false
    }

    canvas.addEventListener('mousedown', iniciar)
    canvas.addEventListener('mousemove', dibujar)
    canvas.addEventListener('mouseup', terminar)
    canvas.addEventListener('mouseleave', terminar)
    canvas.addEventListener('touchstart', iniciar)
    canvas.addEventListener('touchmove', dibujar)
    canvas.addEventListener('touchend', terminar)
  }

  const limpiarFirma = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const guardarOblea = async () => {
    // Validaciones
    if (!habilitacion) {
      alert('No hay habilitación seleccionada')
      return
    }

    if (!fotoOblea) {
      alert('Debe tomar una foto de la oblea colocada')
      return
    }

    if (!firmaReceptor && !firmaInspector) {
      alert('Debe haber al menos una firma (receptor o inspector)')
      return
    }

    setGuardando(true)

    try {
      const body = {
        habilitacion_id: habilitacion.id,
        nro_licencia: habilitacion.nro_licencia,
        titular: habilitacion.titular_nombre,
        foto_oblea: fotoOblea,
        firma_receptor: firmaReceptor || undefined,
        firma_inspector: firmaInspector || undefined,
      }

      const response = await fetch('/api/obleas/colocar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.status === 'success') {
        alert('✅ ' + result.message)
        router.push('/obleas')
      } else {
        alert('❌ Error: ' + result.message)
      }
    } catch (error) {
      console.error('Error al registrar oblea:', error)
      alert('Error al registrar la oblea')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!habilitacion) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-red-900">Habilitación no encontrada</h2>
          <p className="mb-4 text-red-700">
            No se pudo cargar la información de la habilitación
          </p>
          <Button onClick={() => router.push('/obleas')} variant="outline">
            Volver a Obleas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <Shield className="h-8 w-8 text-blue-600" />
          Colocar Oblea
        </h1>
        <p className="mt-2 text-gray-600">
          Registre la colocación de la oblea con foto y firmas
        </p>
      </div>

      {/* Información de la Habilitación */}
      <div className="mb-6 rounded-xl border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-lg">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <CheckCircle className="h-6 w-6 text-green-600" />
          Habilitación
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="mb-1 text-xs font-medium text-gray-500">N° LICENCIA</p>
            <p className="text-xl font-bold text-blue-600">{habilitacion.nro_licencia}</p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <p className="mb-1 text-xs font-medium text-gray-500">ESTADO</p>
            <p className="text-lg font-semibold text-green-600">{habilitacion.estado}</p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <p className="mb-1 text-xs font-medium text-gray-500">TITULAR</p>
            <p className="text-lg font-semibold text-gray-900">{habilitacion.titular_nombre}</p>
            <p className="text-sm text-gray-500">DNI: {habilitacion.titular_dni}</p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <p className="mb-1 text-xs font-medium text-gray-500">VEHÍCULO</p>
            <p className="text-lg font-bold text-gray-900">{habilitacion.vehiculo_dominio}</p>
            <p className="text-sm text-gray-500">
              {habilitacion.vehiculo_marca} {habilitacion.vehiculo_modelo}
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow md:col-span-2">
            <p className="mb-1 text-xs font-medium text-gray-500">TIPO DE TRANSPORTE</p>
            <p className="text-lg font-semibold text-gray-900">{habilitacion.tipo_transporte}</p>
          </div>
        </div>
      </div>

      {/* Foto de la Oblea */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Foto de la Oblea Colocada *</h2>

        {fotoOblea ? (
          <div className="relative">
            <img
              src={fotoOblea}
              alt="Oblea colocada"
              className="w-full rounded-lg object-cover"
            />
            <button
              onClick={() => setFotoOblea('')}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white shadow-lg hover:bg-red-600"
            >
              <AlertCircle className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={capturarFoto}
            className="flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <div className="text-center">
              <Camera className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <span className="text-lg font-medium text-gray-600">Tomar Foto de la Oblea</span>
              <p className="mt-1 text-sm text-gray-500">
                Capture la oblea colocada en el vehículo
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Firmas */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Firmas Digitales</h2>
        <p className="mb-4 text-sm text-gray-600">
          Al menos una firma es requerida (receptor o inspector)
        </p>

        {/* Firma Receptor */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Firma del Receptor (Titular o Autorizado)
          </label>
          <div className="overflow-hidden rounded-lg border-2 border-gray-300">
            <canvas
              ref={canvasReceptorRef}
              width={600}
              height={200}
              className="w-full cursor-crosshair bg-white"
              onMouseDown={() => {
                if (canvasReceptorRef.current && !firmandoReceptor) {
                  iniciarFirma(canvasReceptorRef.current)
                  setFirmandoReceptor(true)
                }
              }}
            />
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                limpiarFirma(canvasReceptorRef.current)
                setFirmaReceptor('')
              }}
            >
              Limpiar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (canvasReceptorRef.current) {
                  setFirmaReceptor(canvasReceptorRef.current.toDataURL())
                }
              }}
            >
              Guardar Firma
            </Button>
          </div>
          {firmaReceptor && <p className="mt-2 text-sm text-green-600">✓ Firma guardada</p>}
        </div>

        {/* Firma Inspector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Firma del Inspector
          </label>
          <div className="overflow-hidden rounded-lg border-2 border-gray-300">
            <canvas
              ref={canvasInspectorRef}
              width={600}
              height={200}
              className="w-full cursor-crosshair bg-white"
              onMouseDown={() => {
                if (canvasInspectorRef.current && !firmandoInspector) {
                  iniciarFirma(canvasInspectorRef.current)
                  setFirmandoInspector(true)
                }
              }}
            />
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                limpiarFirma(canvasInspectorRef.current)
                setFirmaInspector('')
              }}
            >
              Limpiar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (canvasInspectorRef.current) {
                  setFirmaInspector(canvasInspectorRef.current.toDataURL())
                }
              }}
            >
              Guardar Firma
            </Button>
          </div>
          {firmaInspector && <p className="mt-2 text-sm text-green-600">✓ Firma guardada</p>}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push('/obleas')}>
          Cancelar
        </Button>
        <Button
          onClick={guardarOblea}
          disabled={guardando}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="mr-2 h-5 w-5" />
          {guardando ? 'Guardando...' : 'Registrar Oblea'}
        </Button>
      </div>
    </div>
  )
}

export default function ColocarObleaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando formulario...</div>}>
      <ColocarObleaContent />
    </Suspense>
  )
}
