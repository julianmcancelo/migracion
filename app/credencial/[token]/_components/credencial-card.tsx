'use client'

import { useState } from 'react'
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  const credencialUrl = `${baseUrl}/credencial/${token}`

  const esRemis = data.habilitacion.tipo_transporte === 'Remis'

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
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 flex items-center justify-center gap-2 font-bold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            ✓ HABILITADO
          </div>
        )
      case 'NO_HABILITADO':
        return (
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 flex items-center justify-center gap-2 font-bold animate-pulse">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            ✗ NO HABILITADO
          </div>
        )
      case 'EN_TRAMITE':
        return (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 flex items-center justify-center gap-2 font-bold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.332-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.698-1.742-3.03l5.58-9.92z" />
            </svg>
            ⏳ EN TRÁMITE
          </div>
        )
      default:
        return (
          <div className="bg-gray-300 text-gray-800 px-4 py-2 flex items-center justify-center gap-2 font-bold">
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
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative">
          {/* Marca de agua */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] opacity-[0.03] font-black text-[5rem] text-red-900 pointer-events-none select-none">
            LANÚS
          </div>

          {/* Borde decorativo superior */}
          <div className="h-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800" />

          {/* Header */}
          <div className="bg-gradient-to-br from-red-600 to-red-800 text-white p-6 text-center relative z-10">
            <div className="flex justify-center mb-3">
              <div className="bg-white p-2 rounded-lg">
                <svg className="w-12 h-12 text-red-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <h1 className="text-sm font-medium uppercase tracking-wider">Municipalidad de Lanús</h1>
            <p className="text-xs opacity-90 mt-1">Movilidad y Transporte</p>
          </div>

          {/* Badge de estado */}
          {getEstadoBadge()}

          {/* Body */}
          <div className="p-6 relative z-10">
            {/* Tipo y número de licencia */}
            <div className="text-center mb-6">
              <p className="text-xl font-extrabold text-gray-800 uppercase tracking-wide">
                {data.habilitacion.tipo_transporte}
              </p>
              <p className="text-3xl font-black text-red-700 tracking-tight mt-2">
                LIC. N° {data.habilitacion.nro_licencia}
              </p>
            </div>

            {/* Vigencias */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
              <div>
                <span className="text-gray-600 block font-medium">VIGENCIA DESDE</span>
                <span className="text-sm font-bold text-gray-900">{formatDate(data.habilitacion.vigencia_inicio)}</span>
              </div>
              <div>
                <span className="text-gray-600 block font-medium">VIGENCIA HASTA</span>
                <span className="text-sm font-bold text-gray-900">{formatDate(data.habilitacion.vigencia_fin)}</span>
              </div>
              <div>
                <span className="text-gray-600 block font-medium">TIPO TRÁMITE</span>
                <span className="text-sm font-bold text-gray-900">{data.habilitacion.tipo || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600 block font-medium">FECHA EMISIÓN</span>
                <span className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('es-AR')}</span>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Titular */}
            {data.titular && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 pb-1 border-b border-dashed border-gray-300">
                  Titular de la Habilitación
                </h3>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="w-16 h-20 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    {data.titular.foto_url ? (
                      <Image 
                        src={data.titular.foto_url} 
                        alt="Foto Titular" 
                        width={64} 
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-gray-900 truncate">{data.titular.nombre}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      DNI: <span className="font-semibold">{data.titular.dni || 'N/A'}</span>
                    </p>
                    {esRemis && data.titular.cuit && (
                      <p className="text-xs text-gray-600">
                        CUIT: <span className="font-semibold">{data.titular.cuit}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Vehículo */}
            {data.vehiculo && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 pb-1 border-b border-dashed border-gray-300">
                  Vehículo Afectado
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="mb-3">
                    <span className="text-xs text-gray-600 font-medium">DOMINIO:</span>
                    <div className="inline-block ml-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-mono text-base font-bold">
                      {data.vehiculo.dominio}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-600">MARCA:</span>
                      <p className="font-bold text-gray-900">{data.vehiculo.marca}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">AÑO:</span>
                      <p className="font-bold text-gray-900">{data.vehiculo.ano}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">MODELO:</span>
                      <p className="font-bold text-gray-900">{data.vehiculo.modelo}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">CHASIS:</span>
                      <p className="font-mono text-xs font-bold text-gray-900">{data.vehiculo.chasis}</p>
                    </div>
                  </div>

                  <hr className="my-3" />

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-600">ASEGURADORA:</span>
                      <p className="font-bold text-gray-900">{data.vehiculo.Aseguradora || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">PÓLIZA N°:</span>
                      <p className="font-bold text-gray-900">{data.vehiculo.poliza || 'N/A'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <span className="text-gray-600">VENC. VTV:</span>
                        <p className={`font-bold ${getVencimientoClass(data.vehiculo.Vencimiento_VTV)}`}>
                          {formatDate(data.vehiculo.Vencimiento_VTV)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">VENC. PÓLIZA:</span>
                        <p className={`font-bold ${getVencimientoClass(data.vehiculo.Vencimiento_Poliza)}`}>
                          {formatDate(data.vehiculo.Vencimiento_Poliza)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conductores */}
            {data.conductores && data.conductores.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 pb-1 border-b border-dashed border-gray-300">
                  {data.conductores.length > 1 ? 'Conductores Asignados' : 'Conductor Asignado'}
                </h3>
                <div className="space-y-3">
                  {data.conductores.map((conductor: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="w-16 h-20 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                        {conductor.foto_url ? (
                          <Image 
                            src={conductor.foto_url} 
                            alt="Foto Conductor" 
                            width={64} 
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base text-gray-900">{conductor.nombre}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          DNI: <span className="font-semibold">{conductor.dni}</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          Lic. Cat.: <span className="font-semibold">{conductor.licencia_categoria || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Celadores (solo para Escolar) */}
            {!esRemis && data.celadores && data.celadores.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 pb-1 border-b border-dashed border-gray-300">
                  {data.celadores.length > 1 ? 'Celadores Asignados' : 'Celador Asignado'}
                </h3>
                <div className="space-y-3">
                  {data.celadores.map((celador: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="w-16 h-20 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                        {celador.foto_url ? (
                          <Image 
                            src={celador.foto_url} 
                            alt="Foto Celador" 
                            width={64} 
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base text-gray-900">{celador.nombre}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          DNI: <span className="font-semibold">{celador.dni}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Destino */}
            {data.destino && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 pb-1 border-b border-dashed border-gray-300">
                  {esRemis ? 'Remisería Adherida' : 'Establecimiento Educativo Asignado'}
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="font-bold text-base text-gray-900">{data.destino.nombre}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {data.destino.direccion} - {data.destino.localidad}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="bg-gray-100 p-6 text-center border-t border-gray-200">
            <div className="inline-block p-3 bg-white rounded-lg shadow-md">
              <QRCodeSVG
                value={credencialUrl}
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-xs text-gray-600 mt-3">Verifique autenticidad escaneando el código</p>
          </div>
        </div>

        {/* Botones de acción (no se imprimen) */}
        <div className="mt-6 flex justify-center gap-3 no-print">
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Credencial
          </Button>
          
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                ¡Enlace Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Enlace
              </>
            )}
          </Button>
        </div>
      </div>

      {/* CSS para impresión */}
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
      `}</style>
    </>
  )
}
