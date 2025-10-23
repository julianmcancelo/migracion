'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Camera, CheckCircle, XCircle, AlertCircle, Save, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Items de checklist para inspección
const ITEMS_CHECKLIST = [
  { id: 'luces_delanteras', nombre: 'Luces delanteras' },
  { id: 'luces_traseras', nombre: 'Luces traseras' },
  { id: 'luces_freno', nombre: 'Luces de freno' },
  { id: 'luces_giro', nombre: 'Luces de giro' },
  { id: 'neumaticos_delanteros', nombre: 'Neumáticos delanteros' },
  { id: 'neumaticos_traseros', nombre: 'Neumáticos traseros' },
  { id: 'frenos', nombre: 'Sistema de frenos' },
  { id: 'direccion', nombre: 'Sistema de dirección' },
  { id: 'suspension', nombre: 'Suspensión' },
  { id: 'escape', nombre: 'Sistema de escape' },
  { id: 'cristales', nombre: 'Cristales y parabrisas' },
  { id: 'espejos', nombre: 'Espejos retrovisores' },
  { id: 'cinturones', nombre: 'Cinturones de seguridad' },
  { id: 'matafuego', nombre: 'Matafuego' },
  { id: 'balizas', nombre: 'Balizas' },
  { id: 'botiquin', nombre: 'Botiquín' },
  { id: 'carroceria', nombre: 'Estado de carrocería' },
  { id: 'chasis', nombre: 'Estado de chasis' },
]

const TIPOS_FOTOS = [
  { id: 'frente', nombre: 'Frente del vehículo' },
  { id: 'contrafrente', nombre: 'Contrafrente' },
  { id: 'lateral_izq', nombre: 'Lateral izquierdo' },
  { id: 'lateral_der', nombre: 'Lateral derecho' },
  { id: 'interior', nombre: 'Interior' },
]

interface ItemState {
  estado: 'BIEN' | 'REGULAR' | 'MAL' | null
  observacion: string
}

function NuevaInspeccionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const canvasInspectorRef = useRef<HTMLCanvasElement>(null)
  const canvasContribuyenteRef = useRef<HTMLCanvasElement>(null)

  const [habilitacionId] = useState(searchParams.get('habilitacion_id'))
  const [turnoId] = useState(searchParams.get('turno_id'))

  // Estados de habilitación y vehículo
  const [habilitacion, setHabilitacion] = useState<any>(null)
  const [vehiculo, setVehiculo] = useState<any>(null)
  const [loadingHabilitacion, setLoadingHabilitacion] = useState(false)

  // Estados del formulario
  const [nroLicencia, setNroLicencia] = useState('')
  const [nombreInspector, setNombreInspector] = useState('')
  const [emailContribuyente, setEmailContribuyente] = useState('')
  const [tipoTransporte, setTipoTransporte] = useState<'ESCOLAR' | 'REMIS'>('ESCOLAR')

  // Estados de items
  const [items, setItems] = useState<Record<string, ItemState>>(() => {
    const initial: Record<string, ItemState> = {}
    ITEMS_CHECKLIST.forEach(item => {
      initial[item.id] = { estado: null, observacion: '' }
    })
    return initial
  })

  // Estados de fotos
  const [fotos, setFotos] = useState<Record<string, string>>({})

  // Estados de firmas
  const [firmandoInspector, setFirmandoInspector] = useState(false)
  const [firmandoContribuyente, setFirmandoContribuyente] = useState(false)
  const [firmaInspector, setFirmaInspector] = useState<string>('')
  const [firmaContribuyente, setFirmaContribuyente] = useState<string>('')

  // Geolocalización
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null)

  const [guardando, setGuardando] = useState(false)

  // Cargar datos de la habilitación y vehículo
  useEffect(() => {
    if (habilitacionId) {
      cargarHabilitacion()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habilitacionId])

  const cargarHabilitacion = async () => {
    if (!habilitacionId) return
    
    setLoadingHabilitacion(true)
    try {
      const response = await fetch(`/api/habilitaciones/${habilitacionId}`)
      const data = await response.json()
      
      if (data.success) {
        setHabilitacion(data.data)
        setNroLicencia(data.data.nro_licencia || '')
        setTipoTransporte(data.data.tipo_transporte === 'Remis' ? 'REMIS' : 'ESCOLAR')
        
        // Extraer vehículo actual
        const vehiculoActual = data.data.habilitaciones_vehiculos?.[0]
        if (vehiculoActual) {
          setVehiculo(vehiculoActual.vehiculo || vehiculoActual)
        }
      }
    } catch (error) {
      console.error('Error cargando habilitación:', error)
    } finally {
      setLoadingHabilitacion(false)
    }
  }

  useEffect(() => {
    // Obtener geolocalización
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setCoordenadas({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        error => console.error('Error obteniendo ubicación:', error)
      )
    }
  }, [])

  const setItemEstado = (itemId: string, estado: 'BIEN' | 'REGULAR' | 'MAL') => {
    setItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], estado },
    }))
  }

  const setItemObservacion = (itemId: string, observacion: string) => {
    setItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], observacion },
    }))
  }

  const capturarFoto = (tipoFoto: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' as any

    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = event => {
          setFotos(prev => ({
            ...prev,
            [tipoFoto]: event.target?.result as string,
          }))
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const iniciarFirma = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

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
      dibujando = true
      const pos = obtenerPosicion(e)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }

    const dibujar = (e: MouseEvent | TouchEvent) => {
      if (!dibujando) return
      const pos = obtenerPosicion(e)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }

    const terminar = () => {
      dibujando = false
    }

    canvas.addEventListener('mousedown', iniciar)
    canvas.addEventListener('mousemove', dibujar)
    canvas.addEventListener('mouseup', terminar)
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

  const guardarInspeccion = async () => {
    // Validaciones
    if (!habilitacionId || !nroLicencia || !nombreInspector) {
      alert('Complete todos los campos obligatorios')
      return
    }

    if (!firmaInspector) {
      alert('Debe firmar como inspector')
      return
    }

    // Verificar que todos los items estén evaluados
    const itemsIncompletos = ITEMS_CHECKLIST.filter(item => !items[item.id].estado)

    if (itemsIncompletos.length > 0) {
      alert(`Complete la evaluación de: ${itemsIncompletos.map(i => i.nombre).join(', ')}`)
      return
    }

    setGuardando(true)

    try {
      // Preparar datos
      const itemsData = ITEMS_CHECKLIST.map(item => ({
        item_id: item.id,
        estado: items[item.id].estado,
        observacion: items[item.id].observacion,
      }))

      const fotosData = Object.entries(fotos).map(([tipo, base64]) => ({
        tipo_foto: tipo,
        foto_base64: base64,
        latitud: coordenadas?.lat,
        longitud: coordenadas?.lng,
      }))

      const body = {
        habilitacion_id: Number(habilitacionId),
        nro_licencia: nroLicencia,
        nombre_inspector: nombreInspector,
        firma_inspector: firmaInspector,
        firma_contribuyente: firmaContribuyente || undefined,
        email_contribuyente: emailContribuyente || undefined,
        tipo_transporte: tipoTransporte,
        items: itemsData,
        fotos_vehiculo: fotosData,
        latitud: coordenadas?.lat,
        longitud: coordenadas?.lng,
      }

      const response = await fetch('/api/inspecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)
        router.push('/inspecciones')
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error al guardar inspección:', error)
      alert('Error al guardar la inspección')
    } finally {
      setGuardando(false)
    }
  }

  const getEstadoColor = (estado: string | null) => {
    switch (estado) {
      case 'BIEN':
        return 'bg-green-500 text-white'
      case 'REGULAR':
        return 'bg-yellow-500 text-white'
      case 'MAL':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Inspección Vehicular</h1>
        <p className="mt-2 text-gray-600">
          Complete todos los campos y evalúe cada ítem del vehículo
        </p>
      </div>

      {/* Datos del Vehículo a Inspeccionar */}
      {loadingHabilitacion ? (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Cargando datos del vehículo...</span>
          </div>
        </div>
      ) : vehiculo ? (
        <div className="mb-6 rounded-xl border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-lg">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Car className="h-6 w-6 text-blue-600" />
            Vehículo a Inspeccionar
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="mb-1 text-xs font-medium text-gray-500">DOMINIO</p>
              <p className="text-2xl font-bold text-gray-900">{vehiculo.dominio || '-'}</p>
            </div>
            
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="mb-1 text-xs font-medium text-gray-500">MARCA</p>
              <p className="text-lg font-semibold text-gray-900">{vehiculo.marca || '-'}</p>
            </div>
            
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="mb-1 text-xs font-medium text-gray-500">MODELO</p>
              <p className="text-lg font-semibold text-gray-900">{vehiculo.modelo || '-'}</p>
            </div>
            
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="mb-1 text-xs font-medium text-gray-500">AÑO</p>
              <p className="text-lg font-semibold text-gray-900">{vehiculo.anio || vehiculo.ano || '-'}</p>
            </div>
            
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="mb-1 text-xs font-medium text-gray-500">ASIENTOS</p>
              <p className="text-lg font-semibold text-gray-900">{vehiculo.cantidad_asientos || vehiculo.asientos || '-'}</p>
            </div>
            
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="mb-1 text-xs font-medium text-gray-500">TIPO</p>
              <p className="text-lg font-semibold text-gray-900">{vehiculo.tipo || '-'}</p>
            </div>
          </div>

          {habilitacion && (
            <div className="mt-4 rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Habilitación:</span> {habilitacion.nro_licencia || '-'}
                {' | '}
                <span className="font-medium">Titular:</span> {habilitacion.titular_principal || '-'}
              </p>
            </div>
          )}
        </div>
      ) : habilitacionId && (
        <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 p-6 shadow-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ No se encontró vehículo asociado a esta habilitación
          </p>
        </div>
      )}

      {/* Datos Generales */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Datos Generales</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Nro. Licencia *</label>
            <input
              type="text"
              value={nroLicencia}
              onChange={e => setNroLicencia(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 123456"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Inspector *</label>
            <input
              type="text"
              value={nombreInspector}
              onChange={e => setNombreInspector(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Contribuyente
            </label>
            <input
              type="email"
              value={emailContribuyente}
              onChange={e => setEmailContribuyente(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="email@ejemplo.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tipo de Transporte *
            </label>
            <select
              value={tipoTransporte}
              onChange={e => setTipoTransporte(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="ESCOLAR">Escolar</option>
              <option value="REMIS">Remis</option>
            </select>
          </div>
        </div>

        {coordenadas && (
          <div className="mt-4 text-sm text-gray-600">
            📍 Ubicación: {coordenadas.lat.toFixed(6)}, {coordenadas.lng.toFixed(6)}
          </div>
        )}
      </div>

      {/* Checklist de Items */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Checklist de Inspección</h2>

        <div className="space-y-4">
          {ITEMS_CHECKLIST.map(item => (
            <div key={item.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">{item.nombre}</label>

                <div className="flex gap-2">
                  <button
                    onClick={() => setItemEstado(item.id, 'BIEN')}
                    className={`rounded-lg px-4 py-1 text-xs font-semibold transition-colors ${
                      items[item.id].estado === 'BIEN'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle className="mr-1 inline h-4 w-4" />
                    BIEN
                  </button>
                  <button
                    onClick={() => setItemEstado(item.id, 'REGULAR')}
                    className={`rounded-lg px-4 py-1 text-xs font-semibold transition-colors ${
                      items[item.id].estado === 'REGULAR'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <AlertCircle className="mr-1 inline h-4 w-4" />
                    REGULAR
                  </button>
                  <button
                    onClick={() => setItemEstado(item.id, 'MAL')}
                    className={`rounded-lg px-4 py-1 text-xs font-semibold transition-colors ${
                      items[item.id].estado === 'MAL'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <XCircle className="mr-1 inline h-4 w-4" />
                    MAL
                  </button>
                </div>
              </div>

              {items[item.id].estado && items[item.id].estado !== 'BIEN' && (
                <textarea
                  value={items[item.id].observacion}
                  onChange={e => setItemObservacion(item.id, e.target.value)}
                  placeholder="Observaciones..."
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fotos del Vehículo */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Fotos del Vehículo</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TIPOS_FOTOS.map(tipo => (
            <div key={tipo.id} className="rounded-lg border border-gray-300 p-4">
              <p className="mb-2 text-sm font-medium text-gray-700">{tipo.nombre}</p>

              {fotos[tipo.id] ? (
                <div className="relative">
                  <img
                    src={fotos[tipo.id]}
                    alt={tipo.nombre}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={() =>
                      setFotos(prev => {
                        const newFotos = { ...prev }
                        delete newFotos[tipo.id]
                        return newFotos
                      })
                    }
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => capturarFoto(tipo.id)}
                  className="flex h-40 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-blue-500 hover:bg-blue-50"
                >
                  <div className="text-center">
                    <Camera className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Tomar foto</span>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Firmas */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Firmas Digitales</h2>

        {/* Firma Inspector */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Firma del Inspector *
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

        {/* Firma Contribuyente */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Firma del Contribuyente (Opcional)
          </label>
          <div className="overflow-hidden rounded-lg border-2 border-gray-300">
            <canvas
              ref={canvasContribuyenteRef}
              width={600}
              height={200}
              className="w-full cursor-crosshair bg-white"
              onMouseDown={() => {
                if (canvasContribuyenteRef.current && !firmandoContribuyente) {
                  iniciarFirma(canvasContribuyenteRef.current)
                  setFirmandoContribuyente(true)
                }
              }}
            />
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                limpiarFirma(canvasContribuyenteRef.current)
                setFirmaContribuyente('')
              }}
            >
              Limpiar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (canvasContribuyenteRef.current) {
                  setFirmaContribuyente(canvasContribuyenteRef.current.toDataURL())
                }
              }}
            >
              Guardar Firma
            </Button>
          </div>
          {firmaContribuyente && <p className="mt-2 text-sm text-green-600">✓ Firma guardada</p>}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push('/inspecciones')}>
          Cancelar
        </Button>
        <Button
          onClick={guardarInspeccion}
          disabled={guardando}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="mr-2 h-5 w-5" />
          {guardando ? 'Guardando...' : 'Guardar Inspección'}
        </Button>
      </div>
    </div>
  )
}

export default function NuevaInspeccionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando formulario...</div>}>
      <NuevaInspeccionContent />
    </Suspense>
  )
}
