'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Camera, CheckCircle, XCircle, AlertCircle, Save } from 'lucide-react'
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
  { id: 'chasis', nombre: 'Estado de chasis' }
]

const TIPOS_FOTOS = [
  { id: 'frente', nombre: 'Frente del vehículo' },
  { id: 'contrafrente', nombre: 'Contrafrente' },
  { id: 'lateral_izq', nombre: 'Lateral izquierdo' },
  { id: 'lateral_der', nombre: 'Lateral derecho' },
  { id: 'interior', nombre: 'Interior' }
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

  useEffect(() => {
    // Obtener geolocalización
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordenadas({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => console.error('Error obteniendo ubicación:', error)
      )
    }
  }, [])

  const setItemEstado = (itemId: string, estado: 'BIEN' | 'REGULAR' | 'MAL') => {
    setItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], estado }
    }))
  }

  const setItemObservacion = (itemId: string, observacion: string) => {
    setItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], observacion }
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
        reader.onload = (event) => {
          setFotos(prev => ({
            ...prev,
            [tipoFoto]: event.target?.result as string
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
        y: clientY - rect.top
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
    const itemsIncompletos = ITEMS_CHECKLIST.filter(
      item => !items[item.id].estado
    )

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
        observacion: items[item.id].observacion
      }))

      const fotosData = Object.entries(fotos).map(([tipo, base64]) => ({
        tipo_foto: tipo,
        foto_base64: base64,
        latitud: coordenadas?.lat,
        longitud: coordenadas?.lng
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
        longitud: coordenadas?.lng
      }

      const response = await fetch('/api/inspecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
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
      case 'BIEN': return 'bg-green-500 text-white'
      case 'REGULAR': return 'bg-yellow-500 text-white'
      case 'MAL': return 'bg-red-500 text-white'
      default: return 'bg-gray-200 text-gray-700'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Inspección Vehicular</h1>
        <p className="text-gray-600 mt-2">
          Complete todos los campos y evalúe cada ítem del vehículo
        </p>
      </div>

      {/* Datos Generales */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Datos Generales</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nro. Licencia *
            </label>
            <input
              type="text"
              value={nroLicencia}
              onChange={(e) => setNroLicencia(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspector *
            </label>
            <input
              type="text"
              value={nombreInspector}
              onChange={(e) => setNombreInspector(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Contribuyente
            </label>
            <input
              type="email"
              value={emailContribuyente}
              onChange={(e) => setEmailContribuyente(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Transporte *
            </label>
            <select
              value={tipoTransporte}
              onChange={(e) => setTipoTransporte(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Checklist de Inspección</h2>
        
        <div className="space-y-4">
          {ITEMS_CHECKLIST.map((item) => (
            <div key={item.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-900">
                  {item.nombre}
                </label>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setItemEstado(item.id, 'BIEN')}
                    className={`px-4 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      items[item.id].estado === 'BIEN'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    BIEN
                  </button>
                  <button
                    onClick={() => setItemEstado(item.id, 'REGULAR')}
                    className={`px-4 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      items[item.id].estado === 'REGULAR'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    REGULAR
                  </button>
                  <button
                    onClick={() => setItemEstado(item.id, 'MAL')}
                    className={`px-4 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      items[item.id].estado === 'MAL'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <XCircle className="h-4 w-4 inline mr-1" />
                    MAL
                  </button>
                </div>
              </div>
              
              {items[item.id].estado && items[item.id].estado !== 'BIEN' && (
                <textarea
                  value={items[item.id].observacion}
                  onChange={(e) => setItemObservacion(item.id, e.target.value)}
                  placeholder="Observaciones..."
                  className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fotos del Vehículo */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fotos del Vehículo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIPOS_FOTOS.map((tipo) => (
            <div key={tipo.id} className="border border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">{tipo.nombre}</p>
              
              {fotos[tipo.id] ? (
                <div className="relative">
                  <img
                    src={fotos[tipo.id]}
                    alt={tipo.nombre}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setFotos(prev => {
                      const newFotos = { ...prev }
                      delete newFotos[tipo.id]
                      return newFotos
                    })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => capturarFoto(tipo.id)}
                  className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">Tomar foto</span>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Firmas */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Firmas Digitales</h2>
        
        {/* Firma Inspector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Firma del Inspector *
          </label>
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
            <canvas
              ref={canvasInspectorRef}
              width={600}
              height={200}
              className="w-full bg-white cursor-crosshair"
              onMouseDown={() => {
                if (canvasInspectorRef.current && !firmandoInspector) {
                  iniciarFirma(canvasInspectorRef.current)
                  setFirmandoInspector(true)
                }
              }}
            />
          </div>
          <div className="flex gap-2 mt-2">
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
          {firmaInspector && (
            <p className="text-sm text-green-600 mt-2">✓ Firma guardada</p>
          )}
        </div>

        {/* Firma Contribuyente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Firma del Contribuyente (Opcional)
          </label>
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
            <canvas
              ref={canvasContribuyenteRef}
              width={600}
              height={200}
              className="w-full bg-white cursor-crosshair"
              onMouseDown={() => {
                if (canvasContribuyenteRef.current && !firmandoContribuyente) {
                  iniciarFirma(canvasContribuyenteRef.current)
                  setFirmandoContribuyente(true)
                }
              }}
            />
          </div>
          <div className="flex gap-2 mt-2">
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
          {firmaContribuyente && (
            <p className="text-sm text-green-600 mt-2">✓ Firma guardada</p>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/inspecciones')}
        >
          Cancelar
        </Button>
        <Button
          onClick={guardarInspeccion}
          disabled={guardando}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="h-5 w-5 mr-2" />
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
