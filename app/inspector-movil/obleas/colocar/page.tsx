'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Shield, Camera, Save, CheckCircle, AlertCircle, ArrowLeft, X, Check } from 'lucide-react'
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
  const inputFileRef = useRef<HTMLInputElement | null>(null)

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

  const procesarArchivoImagen = (file: File) => {
    const reader = new FileReader()
    reader.onload = event => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Redimensionar si es muy grande
        let width = img.width
        let height = img.height
        const maxSize = 1200

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize
            width = maxSize
          } else {
            width = (width / height) * maxSize
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)

        // Comprimir a 80% calidad
        setFotoOblea(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0]
    if (file) {
      procesarArchivoImagen(file)
    }
  }

  const capturarFoto = () => {
    inputFileRef.current?.click()
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
        router.push('/inspector-movil/obleas')
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!habilitacion) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-bold text-red-900">Habilitación no encontrada</h2>
            <p className="mb-4 text-red-700">
              No se pudo cargar la información de la habilitación
            </p>
            <Button onClick={() => router.push('/inspector-movil/obleas')} variant="outline">
              Volver
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pb-24">
      {/* Header Móvil Mejorado */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-white/20 p-2 active:bg-white/30"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-lg font-bold text-white">
              <Shield className="h-6 w-6" />
              Colocar Oblea
            </h1>
            <p className="text-xs text-blue-100">Registro de colocación</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Información de la Habilitación - Mejorado */}
        <div className="rounded-xl bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Datos de la Habilitación</h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">N° Licencia</p>
              <p className="text-2xl font-bold text-blue-700">{habilitacion.nro_licencia}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">Titular</p>
                <p className="text-sm font-semibold text-gray-900">{habilitacion.titular_nombre}</p>
                <p className="text-xs text-gray-500">DNI: {habilitacion.titular_dni}</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">Vehículo</p>
                <p className="text-lg font-bold text-gray-900">{habilitacion.vehiculo_dominio}</p>
                <p className="text-xs text-gray-500">
                  {habilitacion.vehiculo_marca} {habilitacion.vehiculo_modelo}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Foto de la Oblea - Mejorado */}
        <div className="rounded-xl bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Foto de la Oblea
              </h2>
            </div>
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
              Requerido
            </span>
          </div>

          {fotoOblea ? (
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={fotoOblea}
                alt="Oblea colocada"
                className="w-full rounded-xl object-cover shadow-md"
              />
              <button
                onClick={() => setFotoOblea('')}
                className="absolute right-3 top-3 rounded-full bg-red-500 p-2.5 text-white shadow-xl active:bg-red-600"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-3 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                ✓ Foto capturada
              </div>
            </div>
          ) : (
            <button
              onClick={capturarFoto}
              className="flex h-56 w-full items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 active:from-blue-100 active:to-blue-200"
            >
              <div className="text-center">
                <div className="mx-auto mb-3 rounded-full bg-blue-500 p-4">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <span className="text-base font-bold text-blue-700">Tomar Foto</span>
                <p className="mt-1 text-xs text-blue-600">Presiona para abrir la cámara</p>
              </div>
            </button>
          )}
          <input
            ref={inputFileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Firmas Digitales - Formato Profesional */}
        <div className="rounded-xl bg-white p-5 shadow-lg border border-gray-200">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-full bg-purple-100 p-2">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Firmas Digitales</h2>
              <p className="text-xs text-gray-500">Mínimo 1 firma requerida</p>
            </div>
          </div>

          {/* Firma Receptor */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Firma del Receptor
            </label>
            <div className="overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-50">
              <canvas
                ref={canvasReceptorRef}
                width={600}
                height={200}
                className="w-full touch-none bg-white cursor-crosshair"
                onMouseDown={() => {
                  if (canvasReceptorRef.current && !firmandoReceptor) {
                    iniciarFirma(canvasReceptorRef.current)
                    setFirmandoReceptor(true)
                  }
                }}
                onTouchStart={() => {
                  if (canvasReceptorRef.current && !firmandoReceptor) {
                    iniciarFirma(canvasReceptorRef.current)
                    setFirmandoReceptor(true)
                  }
                }}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  limpiarFirma(canvasReceptorRef.current)
                  setFirmaReceptor('')
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 active:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={() => {
                  if (canvasReceptorRef.current) {
                    setFirmaReceptor(canvasReceptorRef.current.toDataURL())
                  }
                }}
                className="flex-1 rounded-lg bg-[#0093D2] px-4 py-2.5 text-sm font-medium text-white active:bg-[#007AB8] transition-colors"
              >
                Guardar Firma
              </button>
            </div>
            {firmaReceptor && (
              <p className="mt-2 text-sm text-green-600 font-medium">✓ Firma guardada correctamente</p>
            )}
          </div>

          {/* Firma Inspector */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Firma del Inspector
            </label>
            <div className="overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-50">
              <canvas
                ref={canvasInspectorRef}
                width={600}
                height={200}
                className="w-full touch-none bg-white cursor-crosshair"
                onMouseDown={() => {
                  if (canvasInspectorRef.current && !firmandoInspector) {
                    iniciarFirma(canvasInspectorRef.current)
                    setFirmandoInspector(true)
                  }
                }}
                onTouchStart={() => {
                  if (canvasInspectorRef.current && !firmandoInspector) {
                    iniciarFirma(canvasInspectorRef.current)
                    setFirmandoInspector(true)
                  }
                }}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  limpiarFirma(canvasInspectorRef.current)
                  setFirmaInspector('')
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 active:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={() => {
                  if (canvasInspectorRef.current) {
                    setFirmaInspector(canvasInspectorRef.current.toDataURL())
                  }
                }}
                className="flex-1 rounded-lg bg-[#0093D2] px-4 py-2.5 text-sm font-medium text-white active:bg-[#007AB8] transition-colors"
              >
                Guardar Firma
              </button>
            </div>
            {firmaInspector && (
              <p className="mt-2 text-sm text-green-600 font-medium">✓ Firma guardada correctamente</p>
            )}
          </div>
        </div>

        {/* Resumen de completitud */}
        <div className="rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-4">
          <h3 className="mb-3 text-sm font-bold text-gray-700">📋 Checklist de Registro</h3>
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-sm ${fotoOblea ? 'text-green-600' : 'text-gray-400'}`}>
              {fotoOblea ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span className="font-medium">Foto de la oblea</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${firmaReceptor || firmaInspector ? 'text-green-600' : 'text-gray-400'}`}>
              {firmaReceptor || firmaInspector ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span className="font-medium">Al menos una firma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Guardar Flotante - Mejorado */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent p-4 pb-6 shadow-2xl">
        <button
          onClick={guardarOblea}
          disabled={guardando || !fotoOblea || (!firmaReceptor && !firmaInspector)}
          className={`w-full rounded-2xl py-5 text-lg font-bold shadow-xl transition-all ${
            guardando || !fotoOblea || (!firmaReceptor && !firmaInspector)
              ? 'bg-gray-300 text-gray-500'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white active:scale-95'
          }`}
        >
          {guardando ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Guardando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Save className="h-6 w-6" />
              <span>Registrar Oblea</span>
            </div>
          )}
        </button>
        {(!fotoOblea || (!firmaReceptor && !firmaInspector)) && (
          <p className="mt-2 text-center text-xs text-red-600">
            ⚠️ Completa todos los campos requeridos
          </p>
        )}
      </div>
    </div>
  )
}

export default function ColocarObleaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    }>
      <ColocarObleaContent />
    </Suspense>
  )
}
