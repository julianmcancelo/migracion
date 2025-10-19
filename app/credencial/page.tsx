'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import QRCode from 'qrcode'

interface CredencialData {
  id: number
  nro_licencia: string
  resolucion: string
  vigencia_inicio: string
  vigencia_fin: string
  estado: string
  tipo_transporte: string
  titular_nombre: string
  titular_dni: string
  titular_foto: string | null
  conductor_nombre: string | null
  conductor_dni: string | null
  conductor_foto: string | null
  licencia_categoria: string | null
  celador_nombre: string | null
  celador_dni: string | null
  escuela_nombre: string | null
  escuela_domicilio: string | null
  escuela_localidad: string | null
  vehiculo_marca: string | null
  vehiculo_modelo: string | null
  vehiculo_ano: number | null
  vehiculo_dominio: string | null
  vehiculo_asientos: number | null
  vehiculo_chasis: string | null
  vehiculo_vencimiento_vtv: string | null
  vehiculo_vencimiento_poliza: string | null
  isExpired: boolean
}

export default function CredencialPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [data, setData] = useState<CredencialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setError('Token de acceso no proporcionado')
      setLoading(false)
      return
    }

    fetchCredencial()
  }, [token])

  const fetchCredencial = async () => {
    try {
      const response = await fetch(`/api/credencial?token=${token}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        
        // Generar QR con la URL actual
        const currentUrl = window.location.href
        const qrDataUrl = await QRCode.toDataURL(currentUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1e293b', // slate-800
            light: '#ffffff'
          }
        })
        setQrUrl(qrDataUrl)
      } else {
        setError(result.error || 'Error al cargar la credencial')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const formatFecha = (fecha: string) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-AR')
  }

  const getVencimientoClass = (fecha: string | null) => {
    if (!fecha) return 'text-slate-500'
    const fechaDate = new Date(fecha)
    const hoy = new Date()
    const limiteProximo = new Date()
    limiteProximo.setDate(hoy.getDate() + 30)

    if (fechaDate < hoy) return 'text-red-600 font-bold'
    if (fechaDate <= limiteProximo) return 'text-amber-600 font-bold'
    return 'text-slate-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando credencial...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-4">
        <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-8 sm:p-12 max-w-lg w-full text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-sky-600" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zM12 3a3.75 3.75 0 00-3.75 3.75v3h7.5v-3A3.75 3.75 0 0012 3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-6 mb-3">
            Acceso Restringido
          </h1>
          <p className="text-slate-700 text-lg mb-8">
            {error || 'No se pudo cargar la credencial'}
          </p>
          <div className="text-sm text-left text-slate-800 bg-sky-50/80 border border-sky-200 p-4 rounded-lg">
            <p className="font-semibold text-slate-900 mb-3">Contacto:</p>
            <div className="space-y-2">
              <p>📞 4357-5100 (Int. 7137)</p>
              <p>📧 movilidadytransporte@lanus.gob.ar</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const cicloLectivo = new Date().getFullYear()
  const estadoClase = data.estado === 'HABILITADO' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800'

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <main className="w-full max-w-4xl mx-auto">
        <div 
          id="credencial" 
          className="bg-white rounded-2xl overflow-hidden relative shadow-2xl border border-slate-200"
        >
          {/* Marca de agua si está vencida */}
          {data.isExpired && (
            <>
              <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-red-600/95 text-white text-center py-8 px-12 transform -rotate-12 border-4 border-white shadow-2xl rounded-lg backdrop-blur-sm">
                  <h2 className="text-5xl font-black uppercase tracking-wider">VENCIDA</h2>
                  <p className="text-lg mt-1">Por favor, regularice su situación.</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10"></div>
            </>
          )}

          {/* Header */}
          <header className="bg-gradient-to-r from-sky-700 to-sky-500 text-white p-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Credencial de Habilitación
              </h1>
              <p className="text-sm opacity-90">
                Transporte {data.tipo_transporte} - Ciclo Lectivo {cicloLectivo}
              </p>
            </div>
            <img 
              src="https://www.lanus.gob.ar/img/logo-footer.svg" 
              className="w-32 sm:w-36 h-auto brightness-0 invert"
              alt="Logo Lanús"
            />
          </header>

          <div className="bg-slate-100 text-slate-700 px-6 py-3 text-sm font-semibold border-b border-slate-200">
            <p>Dirección General de Movilidad y Transporte</p>
          </div>

          <div className="p-6">
            {/* Datos principales con QR */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-200">
              <div className="md:col-span-2 grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    N° de Licencia
                  </span>
                  <p className="text-lg font-bold text-sky-600">
                    {data.nro_licencia}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    Estado
                  </span>
                  <p className={`text-base font-bold px-3 py-1 rounded-full inline-block ${estadoClase}`}>
                    {data.estado}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    Vigencia
                  </span>
                  <p className="font-semibold text-slate-700">
                    {formatFecha(data.vigencia_inicio)} al {formatFecha(data.vigencia_fin)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    Resolución
                  </span>
                  <p className="font-semibold text-slate-700">
                    {data.resolucion}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-3">
                {qrUrl && (
                  <img 
                    src={qrUrl} 
                    alt="QR Code" 
                    className="border-4 border-white rounded-lg shadow-md"
                  />
                )}
                <p className="mt-2 text-xs text-slate-600 font-medium">
                  Verificar validez
                </p>
              </div>
            </section>

            {/* Personas y Vehículo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6">
              <div className="space-y-6">
                {/* Titular */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 flex-shrink-0 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200">
                    {data.titular_foto ? (
                      <img 
                        src={data.titular_foto} 
                        alt="Foto Titular"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Titular del Permiso
                    </h3>
                    <p className="text-sm text-slate-600">
                      {data.titular_nombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      DNI: {data.titular_dni}
                    </p>
                  </div>
                </div>

                {/* Conductor */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 flex-shrink-0 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200">
                    {data.conductor_foto ? (
                      <img 
                        src={data.conductor_foto} 
                        alt="Foto Conductor"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Conductor/a Autorizado/a
                    </h3>
                    <p className="text-sm text-slate-600">
                      {data.conductor_nombre || 'No Asignado'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Lic. Cat: {data.licencia_categoria || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehículo y Celador */}
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg h-full">
                  <h3 className="font-bold text-lg text-slate-800 mb-2">
                    Vehículo Habilitado
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="col-span-2">
                      <p className="text-2xl font-mono text-white bg-slate-800 inline-block px-3 py-1 rounded-md my-1">
                        {data.vehiculo_dominio || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        Vehículo
                      </span>
                      <p className="text-sm text-slate-700 font-semibold">
                        {data.vehiculo_marca} {data.vehiculo_modelo} ({data.vehiculo_ano})
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        Asientos
                      </span>
                      <p className="text-sm text-slate-700 font-semibold">
                        {data.vehiculo_asientos || 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        Chasis
                      </span>
                      <p className="text-sm text-slate-700 font-semibold font-mono">
                        {data.vehiculo_chasis || 'N/A'}
                      </p>
                    </div>
                    
                    <hr className="col-span-2 my-2" />

                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        Vencimiento VTV
                      </span>
                      <p className={`text-sm font-semibold ${getVencimientoClass(data.vehiculo_vencimiento_vtv)}`}>
                        {formatFecha(data.vehiculo_vencimiento_vtv || '')}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        Vencimiento Póliza
                      </span>
                      <p className={`text-sm font-semibold ${getVencimientoClass(data.vehiculo_vencimiento_poliza)}`}>
                        {formatFecha(data.vehiculo_vencimiento_poliza || '')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Celador */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 flex-shrink-0 bg-slate-200 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Celador/a
                    </h3>
                    <p className="text-sm text-slate-600">
                      {data.celador_nombre || 'No Asignado'}
                    </p>
                    <p className="text-xs text-slate-500">
                      DNI: {data.celador_dni || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Establecimiento */}
            <section className="pt-6 border-t border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 mb-2">
                Establecimiento Educativo
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg text-sm">
                <p className="text-slate-800 font-semibold">
                  {data.escuela_nombre || 'No Asignado'}
                </p>
                <p className="text-slate-600">
                  {data.escuela_domicilio || 'N/A'} - {data.escuela_localidad || 'N/A'}
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="text-center text-xs text-slate-500 px-6 py-3 bg-slate-50 border-t">
            <p>
              El presente certificado es válido únicamente si se presenta junto a la VTV y el seguro obligatorio vigentes.
            </p>
          </footer>
        </div>

        {/* Botón de imprimir */}
        <div className="text-center py-8 no-print">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-3 px-8 py-3 bg-sky-700 text-white rounded-lg shadow-lg hover:bg-sky-800 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" 
              />
            </svg>
            <span className="font-semibold">Imprimir o Guardar como PDF</span>
          </button>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
