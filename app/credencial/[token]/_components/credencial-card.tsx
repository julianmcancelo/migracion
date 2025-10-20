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
        
        <div className="bg-white shadow-2xl overflow-hidden relative" style={{ userSelect: 'none', borderRadius: '12px' }}>
          {/* Header Azul */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Credencial de Habilitación</h1>
                <p className="text-sm mt-1 text-blue-100">
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
          <div className="bg-gray-50 px-6 py-2 border-b">
            <p className="text-xs text-gray-600 font-medium">Dirección General de Movilidad y Transporte</p>
          </div>

          {/* Info Principal con QR */}
          <div className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase mb-1">N° DE LICENCIA</div>
                <div className="text-3xl font-bold text-blue-600">{data.habilitacion.nro_licencia}</div>
              </div>
              <div className="text-center">
                <div className="inline-block px-4 py-1 bg-green-100 text-green-700 font-semibold text-sm rounded mb-2">
                  ESTADO: {data.habilitacion.estado}
                </div>
                <div className="bg-white p-2 border-2 border-gray-300 rounded inline-block">
                  <QRCodeSVG value={credencialUrl} size={100} />
                </div>
                <div className="text-xs text-gray-500 mt-1">Verificar validez</div>
              </div>
            </div>

            {/* Vigencias */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">VIGENCIA</div>
                <div className="font-semibold text-gray-900">{formatDate(data.habilitacion.vigencia_inicio)} al {formatDate(data.habilitacion.vigencia_fin)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">RESOLUCIÓN</div>
                <div className="font-semibold text-gray-900">{data.habilitacion.resolucion || '0165/25'}</div>
              </div>
            </div>

            <div className="border-t border-gray-300 mb-6"></div>

            {/* Titular */}
            {data.titular && (
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 flex items-center justify-center border-2 border-gray-400">
                    <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600 mb-1">Titular del Permiso</div>
                    <div className="font-bold text-base text-gray-900">{data.titular.nombre}</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      DNI: {data.titular.dni || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vehículo Habilitado */}
            {data.vehiculo && (
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm font-semibold text-gray-600">Vehículo Habilitado</div>
                  <div className="bg-gray-900 text-white px-4 py-1 rounded font-mono text-sm font-bold">
                    {data.vehiculo.dominio}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <div className="text-gray-500 uppercase font-medium">VEHÍCULO</div>
                    <div className="font-semibold text-gray-900">{data.vehiculo.marca} {data.vehiculo.modelo}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase font-medium">ASIENTOS</div>
                    <div className="font-semibold text-gray-900">{data.vehiculo.asientos || '20'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase font-medium">AÑO</div>
                    <div className="font-semibold text-gray-900">{data.vehiculo.ano}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase font-medium">CHASIS</div>
                    <div className="font-mono text-[10px] font-semibold text-gray-900">{data.vehiculo.chasis}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase font-medium">VENCIMIENTO VTV</div>
                    <div className={`font-semibold ${getVencimientoClass(data.vehiculo.Vencimiento_VTV)}`}>
                      {formatDate(data.vehiculo.Vencimiento_VTV) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase font-medium">VENCIMIENTO PÓLIZA</div>
                    <div className={`font-semibold ${getVencimientoClass(data.vehiculo.Vencimiento_Poliza)}`}>
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
                  <div key={idx} className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 flex items-center justify-center border-2 border-gray-400">
                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-600 mb-0.5">Conductor/a Autorizado/a</div>
                      <div className="font-semibold text-sm text-gray-900">{conductor.nombre}</div>
                      <div className="text-xs text-gray-600">Lic. Cat.: {conductor.licencia_categoria || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Establecimiento Educativo */}
            {data.destino && !esRemis && (
              <div className="flex items-start gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 flex items-center justify-center border-2 border-gray-400">
                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-600 mb-0.5">Establecimiento Educativo</div>
                  <div className="font-semibold text-sm text-gray-900 uppercase">{data.destino.nombre}</div>
                  <div className="text-xs text-gray-600">{data.destino.direccion}</div>
                </div>
              </div>
            )}

            {/* Celadores */}
            {!esRemis && data.celadores && data.celadores.length > 0 && (
              <div className="mb-6">
                {data.celadores.map((celador: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 flex items-center justify-center border-2 border-gray-400">
                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-600 mb-0.5">Celador/a</div>
                      <div className="font-semibold text-sm text-gray-900">{celador.nombre}</div>
                      <div className="text-xs text-gray-600">DNI: {celador.dni}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="text-xs text-gray-500 text-center italic mt-8 pt-4 border-t">
              El presente certificado es válido únicamente si se presenta junto a la VTV y el seguro obligatorio vigentes.
            </div>
          </div>

          {/* Botón Imprimir */}
          <div className="bg-gray-50 p-4 text-center border-t">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir o Guardar como PDF
            </Button>
            
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
