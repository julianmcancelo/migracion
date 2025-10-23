'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CredencialCardProps {
  data: any
  token: string
}

export function CredencialCard({ data, token }: CredencialCardProps) {
  const [copied, setCopied] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  const credencialUrl = `${baseUrl}/credencial/${token}`

  const esRemis = data.habilitacion.tipo_transporte === 'Remis'

  // Actualizar hora cada segundo para dificultar capturas
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(credencialUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error al copiar:', error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getEstadoBadge = () => {
    const estado = data.habilitacion.estado

    switch (estado) {
      case 'HABILITADO':
        return (
          <div className="border-b-2 border-green-700 bg-green-600 px-4 py-2 text-center text-sm font-semibold uppercase text-white">
            HABILITADO
          </div>
        )
      case 'NO_HABILITADO':
        return (
          <div className="border-b-2 border-red-700 bg-red-600 px-4 py-2 text-center text-sm font-semibold uppercase text-white">
            NO HABILITADO
          </div>
        )
      case 'EN_TRAMITE':
        return (
          <div className="border-b-2 border-yellow-600 bg-yellow-500 px-4 py-2 text-center text-sm font-semibold uppercase text-white">
            EN TRÁMITE
          </div>
        )
      default:
        return (
          <div className="border-b-2 border-gray-500 bg-gray-400 px-4 py-2 text-center text-sm font-semibold uppercase text-white">
            {estado || 'N/A'}
          </div>
        )
    }
  }

  const getVencimientoClass = (fecha: string | null) => {
    if (!fecha) return 'text-gray-500'

    const fechaVenc = new Date(fecha)
    const hoy = new Date()
    const limite = new Date()
    limite.setDate(limite.getDate() + 30)

    if (fechaVenc < hoy) return 'text-red-600 font-bold' // Vencido
    if (fechaVenc <= limite) return 'text-yellow-600 font-bold' // Por vencer
    return 'text-green-700' // Vigente
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-AR')
  }

  return (
    <>
      {/* Contenedor de la credencial */}
      <div className="mx-auto max-w-md" onContextMenu={e => e.preventDefault()}>
        {/* Marca de agua dinámica */}
        <div className="pointer-events-none fixed inset-0 z-50 flex select-none items-center justify-center opacity-10">
          <div className="rotate-[-45deg] whitespace-nowrap text-6xl font-black text-red-900">
            {currentTime.toLocaleTimeString('es-AR')}
          </div>
        </div>

        <div
          className="relative overflow-hidden bg-white shadow-2xl"
          style={{ userSelect: 'none', borderRadius: '12px' }}
        >
          {/* Header Azul */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">Credencial de Habilitación</h1>
                <p className="mt-1 text-sm text-blue-100">
                  {data.habilitacion.tipo_transporte} - Ciclo Lectivo 2025
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="https://www.lanus.gob.ar/logo-200.png"
                  alt="Lanús"
                  width={60}
                  height={60}
                  className="h-12 w-auto"
                />
                <div className="text-right">
                  <div className="text-xs font-bold">Lanús</div>
                  <div className="text-[10px] text-blue-100">GOBIERNO</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="border-b bg-gray-50 px-6 py-2">
            <p className="text-xs font-medium text-gray-600">
              Dirección General de Movilidad y Transporte
            </p>
          </div>

          {/* Info Principal con QR */}
          <div className="relative z-10 p-6">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 text-xs uppercase text-gray-500">N° DE LICENCIA</div>
                <div className="text-3xl font-bold text-blue-600">
                  {data.habilitacion.nro_licencia}
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 inline-block rounded bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
                  ESTADO: {data.habilitacion.estado}
                </div>
                <div className="inline-block rounded border-2 border-gray-300 bg-white p-2">
                  <QRCodeSVG value={credencialUrl} size={100} />
                </div>
                <div className="mt-1 text-xs text-gray-500">Verificar validez</div>
              </div>
            </div>

            {/* Vigencias */}
            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs font-medium uppercase text-gray-500">VIGENCIA</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(data.habilitacion.vigencia_inicio)} al{' '}
                  {formatDate(data.habilitacion.vigencia_fin)}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-gray-500">RESOLUCIÓN</div>
                <div className="font-semibold text-gray-900">
                  {data.habilitacion.resolucion || '0165/25'}
                </div>
              </div>
            </div>

            <div className="mb-6 border-t border-gray-300"></div>

            {/* Titular */}
            {data.titular && (
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-400 bg-gradient-to-br from-gray-200 to-gray-300">
                    <svg
                      className="h-10 w-10 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-sm font-semibold text-gray-600">
                      Titular del Permiso
                    </div>
                    <div className="text-base font-bold text-gray-900">{data.titular.nombre}</div>
                    <div className="mt-0.5 text-xs text-gray-600">
                      DNI: {data.titular.dni || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vehículo Habilitado */}
            {data.vehiculo && (
              <div className="mb-6">
                <div className="mb-3 flex items-start justify-between">
                  <div className="text-sm font-semibold text-gray-600">Vehículo Habilitado</div>
                  <div className="rounded bg-gray-900 px-4 py-1 font-mono text-sm font-bold text-white">
                    {data.vehiculo.dominio}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <div className="font-medium uppercase text-gray-500">VEHÍCULO</div>
                    <div className="font-semibold text-gray-900">
                      {data.vehiculo.marca} {data.vehiculo.modelo}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium uppercase text-gray-500">ASIENTOS</div>
                    <div className="font-semibold text-gray-900">
                      {data.vehiculo.asientos || '20'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium uppercase text-gray-500">AÑO</div>
                    <div className="font-semibold text-gray-900">{data.vehiculo.ano}</div>
                  </div>
                  <div>
                    <div className="font-medium uppercase text-gray-500">CHASIS</div>
                    <div className="font-mono text-[10px] font-semibold text-gray-900">
                      {data.vehiculo.chasis}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium uppercase text-gray-500">VENCIMIENTO VTV</div>
                    <div
                      className={`font-semibold ${getVencimientoClass(data.vehiculo.Vencimiento_VTV)}`}
                    >
                      {formatDate(data.vehiculo.Vencimiento_VTV) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium uppercase text-gray-500">VENCIMIENTO PÓLIZA</div>
                    <div
                      className={`font-semibold ${getVencimientoClass(data.vehiculo.Vencimiento_Poliza)}`}
                    >
                      {formatDate(data.vehiculo.Vencimiento_Poliza) || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conductores */}
            {data.conductores && data.conductores.length > 0 && (
              <div className="mb-6">
                {data.conductores.map((conductor: any, idx: number) => (
                  <div key={idx} className="mb-3 flex items-center gap-3">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-400 bg-gradient-to-br from-gray-200 to-gray-300">
                      <svg
                        className="h-8 w-8 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="mb-0.5 text-sm font-semibold text-gray-600">
                        Conductor/a Autorizado/a
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{conductor.nombre}</div>
                      <div className="text-xs text-gray-600">
                        Lic. Cat.: {conductor.licencia_categoria || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Establecimiento Educativo */}
            {data.destino && !esRemis && (
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-400 bg-gradient-to-br from-gray-200 to-gray-300">
                  <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="mb-0.5 text-sm font-semibold text-gray-600">
                    Establecimiento Educativo
                  </div>
                  <div className="text-sm font-semibold uppercase text-gray-900">
                    {data.destino.nombre}
                  </div>
                  <div className="text-xs text-gray-600">{data.destino.direccion}</div>
                </div>
              </div>
            )}

            {/* Celadores */}
            {!esRemis && data.celadores && data.celadores.length > 0 && (
              <div className="mb-6">
                {data.celadores.map((celador: any, idx: number) => (
                  <div key={idx} className="mb-3 flex items-center gap-3">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-400 bg-gradient-to-br from-gray-200 to-gray-300">
                      <svg
                        className="h-8 w-8 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="mb-0.5 text-sm font-semibold text-gray-600">Celador/a</div>
                      <div className="text-sm font-semibold text-gray-900">{celador.nombre}</div>
                      <div className="text-xs text-gray-600">DNI: {celador.dni}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 border-t pt-4 text-center text-xs italic text-gray-500">
              El presente certificado es válido únicamente si se presenta junto a la VTV y el seguro
              obligatorio vigentes.
            </div>
          </div>

          {/* Botón Imprimir */}
          <div className="border-t bg-gray-50 p-4 text-center">
            <Button onClick={handlePrint} className="bg-blue-600 text-white hover:bg-blue-700">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir o Guardar como PDF
            </Button>

            {/* Timestamp de visualización */}
            <div className="mt-3 border-t border-gray-300 pt-3">
              <p className="font-mono text-xs text-gray-500">
                Visualizado: {currentTime.toLocaleString('es-AR')}
              </p>
            </div>
          </div>

          {/* Advertencia anti-piratería */}
          <div className="border-t-2 border-red-300 bg-red-50 p-3 text-center">
            <p className="text-xs font-semibold text-red-700">
              ⚠️ DOCUMENTO OFICIAL - Uso exclusivo para verificación
            </p>
            <p className="mt-1 text-xs text-red-600">
              La captura, reproducción o falsificación está penada por ley
            </p>
          </div>
        </div>

        {/* Botones de acción (no se imprimen) */}
        <div className="no-print mt-4 flex justify-center gap-2">
          <Button
            onClick={handlePrint}
            className="bg-gray-700 text-white hover:bg-gray-800"
            size="sm"
          >
            <Printer className="mr-1 h-3 w-3" />
            Imprimir
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="border-gray-400 text-gray-700 hover:bg-gray-100"
          >
            {copied ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3 w-3" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* CSS para impresión y seguridad */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }

        /* Dificultar selección de texto */
        .credencial-content {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Desactivar arrastrar imágenes */
        img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }
      `}</style>
    </>
  )
}
