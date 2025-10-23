'use client'

import { useEffect, useState, Suspense } from 'react'
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

function CredencialContent() {
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
            light: '#ffffff',
          },
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
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-sky-600"></div>
          <p className="mt-4 text-slate-600">Cargando credencial...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-sky-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zM12 3a3.75 3.75 0 00-3.75 3.75v3h7.5v-3A3.75 3.75 0 0012 3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="mb-3 mt-6 text-3xl font-black text-slate-900">Acceso Restringido</h1>
          <p className="mb-8 text-lg text-slate-700">
            {error || 'No se pudo cargar la credencial'}
          </p>
          <div className="rounded-lg border border-sky-200 bg-sky-50/80 p-4 text-left text-sm text-slate-800">
            <p className="mb-3 font-semibold text-slate-900">Contacto:</p>
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
  const estadoClase =
    data.estado === 'HABILITADO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 sm:p-8">
      <main className="mx-auto w-full max-w-4xl">
        <div
          id="credencial"
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* Marca de agua si está vencida */}
          {data.isExpired && (
            <>
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4">
                <div className="-rotate-12 transform rounded-lg border-4 border-white bg-red-600/95 px-12 py-8 text-center text-white shadow-2xl backdrop-blur-sm">
                  <h2 className="text-5xl font-black uppercase tracking-wider">VENCIDA</h2>
                  <p className="mt-1 text-lg">Por favor, regularice su situación.</p>
                </div>
              </div>
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm"></div>
            </>
          )}

          {/* Header */}
          <header className="flex items-center justify-between bg-gradient-to-r from-sky-700 to-sky-500 p-6 text-white">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                Credencial de Habilitación
              </h1>
              <p className="text-sm opacity-90">
                Transporte {data.tipo_transporte} - Ciclo Lectivo {cicloLectivo}
              </p>
            </div>
            <img
              src="https://www.lanus.gob.ar/img/logo-footer.svg"
              className="h-auto w-32 brightness-0 invert sm:w-36"
              alt="Logo Lanús"
            />
          </header>

          <div className="border-b border-slate-200 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700">
            <p>Dirección General de Movilidad y Transporte</p>
          </div>

          <div className="p-6">
            {/* Datos principales con QR */}
            <section className="grid grid-cols-1 gap-6 border-b border-slate-200 pb-6 md:grid-cols-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:col-span-2">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    N° de Licencia
                  </span>
                  <p className="text-lg font-bold text-sky-600">{data.nro_licencia}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Estado</span>
                  <p
                    className={`inline-block rounded-full px-3 py-1 text-base font-bold ${estadoClase}`}
                  >
                    {data.estado}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Vigencia</span>
                  <p className="font-semibold text-slate-700">
                    {formatFecha(data.vigencia_inicio)} al {formatFecha(data.vigencia_fin)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Resolución</span>
                  <p className="font-semibold text-slate-700">{data.resolucion}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center rounded-lg bg-slate-50 p-3">
                {qrUrl && (
                  <img
                    src={qrUrl}
                    alt="QR Code"
                    className="rounded-lg border-4 border-white shadow-md"
                  />
                )}
                <p className="mt-2 text-xs font-medium text-slate-600">Verificar validez</p>
              </div>
            </section>

            {/* Personas y Vehículo */}
            <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-2">
              <div className="space-y-6">
                {/* Titular */}
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-lg">
                    {data.titular_foto ? (
                      <img
                        src={data.titular_foto}
                        alt="Foto Titular"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg
                          className="h-12 w-12 text-slate-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Titular del Permiso</h3>
                    <p className="text-sm text-slate-600">{data.titular_nombre}</p>
                    <p className="text-xs text-slate-500">DNI: {data.titular_dni}</p>
                  </div>
                </div>

                {/* Conductor */}
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-lg">
                    {data.conductor_foto ? (
                      <img
                        src={data.conductor_foto}
                        alt="Foto Conductor"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg
                          className="h-12 w-12 text-slate-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Conductor/a Autorizado/a</h3>
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
                <div className="h-full rounded-lg bg-slate-50 p-4">
                  <h3 className="mb-2 text-lg font-bold text-slate-800">Vehículo Habilitado</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="col-span-2">
                      <p className="my-1 inline-block rounded-md bg-slate-800 px-3 py-1 font-mono text-2xl text-white">
                        {data.vehiculo_dominio || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        Vehículo
                      </span>
                      <p className="text-sm font-semibold text-slate-700">
                        {data.vehiculo_marca} {data.vehiculo_modelo} ({data.vehiculo_ano})
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        Asientos
                      </span>
                      <p className="text-sm font-semibold text-slate-700">
                        {data.vehiculo_asientos || 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-semibold uppercase text-slate-500">Chasis</span>
                      <p className="font-mono text-sm font-semibold text-slate-700">
                        {data.vehiculo_chasis || 'N/A'}
                      </p>
                    </div>

                    <hr className="col-span-2 my-2" />

                    <div>
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        Vencimiento VTV
                      </span>
                      <p
                        className={`text-sm font-semibold ${getVencimientoClass(data.vehiculo_vencimiento_vtv)}`}
                      >
                        {formatFecha(data.vehiculo_vencimiento_vtv || '')}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        Vencimiento Póliza
                      </span>
                      <p
                        className={`text-sm font-semibold ${getVencimientoClass(data.vehiculo_vencimiento_poliza)}`}
                      >
                        {formatFecha(data.vehiculo_vencimiento_poliza || '')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Celador */}
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-4 border-white bg-slate-200 shadow-lg">
                    <svg
                      className="h-12 w-12 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Celador/a</h3>
                    <p className="text-sm text-slate-600">{data.celador_nombre || 'No Asignado'}</p>
                    <p className="text-xs text-slate-500">DNI: {data.celador_dni || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Establecimiento */}
            <section className="border-t border-slate-200 pt-6">
              <h3 className="mb-2 text-lg font-bold text-slate-800">Establecimiento Educativo</h3>
              <div className="rounded-lg bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-800">
                  {data.escuela_nombre || 'No Asignado'}
                </p>
                <p className="text-slate-600">
                  {data.escuela_domicilio || 'N/A'} - {data.escuela_localidad || 'N/A'}
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="border-t bg-slate-50 px-6 py-3 text-center text-xs text-slate-500">
            <p>
              El presente certificado es válido únicamente si se presenta junto a la VTV y el seguro
              obligatorio vigentes.
            </p>
          </footer>
        </div>

        {/* Botón de imprimir */}
        <div className="no-print py-8 text-center">
          <button
            onClick={() => window.print()}
            className="inline-flex transform items-center gap-3 rounded-lg bg-sky-700 px-8 py-3 text-white shadow-lg transition-all hover:scale-105 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
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

export default function CredencialPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Cargando credencial...</p>
          </div>
        </div>
      }
    >
      <CredencialContent />
    </Suspense>
  )
}
