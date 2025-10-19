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
          <div className="bg-green-600 text-white px-4 py-2 text-center font-semibold uppercase text-sm border-b-2 border-green-700">
            HABILITADO
          </div>
        )
      case 'NO_HABILITADO':
        return (
          <div className="bg-red-600 text-white px-4 py-2 text-center font-semibold uppercase text-sm border-b-2 border-red-700">
            NO HABILITADO
          </div>
        )
      case 'EN_TRAMITE':
        return (
          <div className="bg-yellow-500 text-white px-4 py-2 text-center font-semibold uppercase text-sm border-b-2 border-yellow-600">
            EN TRÁMITE
          </div>
        )
      default:
        return (
          <div className="bg-gray-400 text-white px-4 py-2 text-center font-semibold uppercase text-sm border-b-2 border-gray-500">
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
      <div className="max-w-md mx-auto" onContextMenu={(e) => e.preventDefault()}>
        {/* Marca de agua dinámica */}
        <div className="fixed inset-0 pointer-events-none select-none z-50 flex items-center justify-center opacity-10">
          <div className="text-6xl font-black text-red-900 rotate-[-45deg] whitespace-nowrap">
            {currentTime.toLocaleTimeString('es-AR')}
          </div>
        </div>
        
        <div className="bg-white shadow-xl border-2 border-gray-300 overflow-hidden relative" style={{ userSelect: 'none' }}>
          {/* Header */}
          <div className="bg-gray-800 text-white p-5 text-center border-b-4 border-gray-900">
            <div className="flex justify-center mb-3">
              <Image 
                src="https://www.lanus.gob.ar/logo-200.png" 
                alt="Municipalidad de Lanús" 
                width={80} 
                height={80}
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-base font-bold uppercase tracking-wide">Municipalidad de Lanús</h1>
            <p className="text-xs mt-1 font-medium">Dirección General de Movilidad y Transporte</p>
          </div>

          {/* Badge de estado */}
          {getEstadoBadge()}

          {/* Body */}
          <div className="p-6 relative z-10">
            {/* Tipo y número de licencia */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {data.habilitacion.tipo_transporte}
              </p>
              <p className="text-2xl font-bold text-gray-900 tracking-wide">
                LICENCIA N° {data.habilitacion.nro_licencia}
              </p>
            </div>

            {/* Vigencias */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs bg-gray-50 p-3 border border-gray-200">
              <div>
                <span className="text-gray-500 block font-medium uppercase">Vigencia Desde</span>
                <span className="text-sm font-semibold text-gray-900">{formatDate(data.habilitacion.vigencia_inicio)}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium uppercase">Vigencia Hasta</span>
                <span className="text-sm font-semibold text-gray-900">{formatDate(data.habilitacion.vigencia_fin)}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium uppercase">Tipo Trámite</span>
                <span className="text-sm font-semibold text-gray-900">{data.habilitacion.tipo || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium uppercase">Fecha Emisión</span>
                <span className="text-sm font-semibold text-gray-900">{new Date().toLocaleDateString('es-AR')}</span>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Titular */}
            {data.titular && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 pb-1 border-b border-gray-300">
                  Titular de la Habilitación
                </h3>
                <div className="flex items-center gap-3 bg-white p-3 border border-gray-300">
                  <div className="w-14 h-14 bg-gray-300 flex-shrink-0 flex items-center justify-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {data.titular.nombre?.charAt(0) || '?'}
                    </div>
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
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 pb-1 border-b border-gray-300">
                  Vehículo Afectado
                </h3>
                <div className="bg-white p-3 border border-gray-300">
                  <div className="mb-3 pb-2 border-b border-gray-200">
                    <span className="text-xs text-gray-500 font-medium uppercase">Dominio:</span>
                    <div className="inline-block ml-2 bg-gray-100 border border-gray-400 px-3 py-1 font-mono text-base font-bold text-gray-900">
                      {data.vehiculo.dominio}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="border-r border-gray-200 pr-2">
                      <span className="text-gray-500 font-medium uppercase">Marca:</span>
                      <p className="font-semibold text-gray-900">{data.vehiculo.marca}</p>
                    </div>
                    <div className="pl-2">
                      <span className="text-gray-500 font-medium uppercase">Año:</span>
                      <p className="font-semibold text-gray-900">{data.vehiculo.ano}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-500 font-medium uppercase">Modelo:</span>
                      <p className="font-semibold text-gray-900">{data.vehiculo.modelo}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-500 font-medium uppercase">Chasis:</span>
                      <p className="font-mono text-xs font-semibold text-gray-900">{data.vehiculo.chasis}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t-2 border-gray-300 space-y-2 text-xs">
                    <div className="border-b border-gray-200 pb-1">
                      <span className="text-gray-500 font-medium uppercase">Aseguradora:</span>
                      <p className="font-semibold text-gray-900">{data.vehiculo.Aseguradora || 'N/A'}</p>
                    </div>
                    <div className="border-b border-gray-200 pb-1">
                      <span className="text-gray-500 font-medium uppercase">Póliza N°:</span>
                      <p className="font-semibold text-gray-900">{data.vehiculo.poliza || 'N/A'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-gray-500 font-medium uppercase block">Venc. VTV:</span>
                        <p className={`font-semibold ${getVencimientoClass(data.vehiculo.Vencimiento_VTV)}`}>
                          {formatDate(data.vehiculo.Vencimiento_VTV)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium uppercase block">Venc. Póliza:</span>
                        <p className={`font-semibold ${getVencimientoClass(data.vehiculo.Vencimiento_Poliza)}`}>
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
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 pb-1 border-b border-gray-300">
                  {data.conductores.length > 1 ? 'Conductores' : 'Conductor'}
                </h3>
                <div className="space-y-2">
                  {data.conductores.map((conductor: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-2 border border-gray-300">
                      <div className="w-10 h-10 bg-gray-300 flex-shrink-0 flex items-center justify-center">
                        <div className="text-lg font-bold text-gray-600">
                          {conductor.nombre?.charAt(0) || '?'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">{conductor.nombre}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          DNI: <span className="font-medium">{conductor.dni}</span> | 
                          Cat.: <span className="font-medium">{conductor.licencia_categoria || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Celadores (solo para Escolar) */}
            {!esRemis && data.celadores && data.celadores.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 pb-1 border-b border-gray-300">
                  {data.celadores.length > 1 ? 'Celadores' : 'Celador'}
                </h3>
                <div className="space-y-2">
                  {data.celadores.map((celador: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-2 border border-gray-300">
                      <div className="w-10 h-10 bg-gray-300 flex-shrink-0 flex items-center justify-center">
                        <div className="text-lg font-bold text-gray-600">
                          {celador.nombre?.charAt(0) || '?'}
                        </div>
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
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 pb-1 border-b border-gray-300">
                  {esRemis ? 'Remisería' : 'Establecimiento'}
                </h3>
                <div className="bg-white p-3 border border-gray-300">
                  <p className="font-semibold text-sm text-gray-900">{data.destino.nombre}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {data.destino.direccion} - {data.destino.localidad}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="bg-gray-100 p-5 text-center border-t-2 border-gray-400">
            <div className="inline-block p-2 bg-white border-2 border-gray-400">
              <QRCodeSVG
                value={credencialUrl}
                size={120}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2 font-medium">Escanee para verificar autenticidad</p>
            
            {/* Timestamp de visualización */}
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-xs text-gray-500 font-mono">
                Visualizado: {currentTime.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
          
          {/* Advertencia anti-piratería */}
          <div className="bg-red-50 border-t-2 border-red-300 p-3 text-center">
            <p className="text-xs text-red-700 font-semibold">
              ⚠️ DOCUMENTO OFICIAL - Uso exclusivo para verificación
            </p>
            <p className="text-xs text-red-600 mt-1">
              La captura, reproducción o falsificación está penada por ley
            </p>
          </div>
        </div>

        {/* Botones de acción (no se imprimen) */}
        <div className="mt-4 flex justify-center gap-2 no-print">
          <Button
            onClick={handlePrint}
            className="bg-gray-700 hover:bg-gray-800 text-white"
            size="sm"
          >
            <Printer className="w-3 h-3 mr-1" />
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
                <Check className="w-3 h-3 mr-1" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
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
