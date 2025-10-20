'use client'

import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import jsPDF from 'jspdf'

interface DatosOblea {
  id: number
  habilitacion: {
    id: number
    nro_licencia: string
    tipo_transporte: string
    expte: string
    resolucion: string
    vigencia_desde: string
    vigencia_mes_ano: string
  }
  titular: {
    nombre: string
    dni: string
  }
  vehiculo: {
    dominio: string
    marca: string
    modelo: string
  }
  fecha_emision: string
}

interface CertificadoObleaProps {
  habilitacionId: number
  onSuccess?: () => void
}

export function CertificadoOblea({ habilitacionId, onSuccess }: CertificadoObleaProps) {
  const [generando, setGenerando] = useState(false)
  const [datos, setDatos] = useState<DatosOblea | null>(null)

  const generarCertificado = async () => {
    setGenerando(true)
    
    try {
      // Generar datos de la oblea
      const response = await fetch(`/api/habilitaciones/${habilitacionId}/generar-oblea`, {
        method: 'POST'
      })

      const result = await response.json()

      if (result.success) {
        setDatos(result.data)
        await generarPDF(result.data)
        onSuccess?.()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error al generar certificado:', error)
      alert('Error al generar el certificado de oblea')
    } finally {
      setGenerando(false)
    }
  }

  const generarPDF = async (datosOblea: DatosOblea) => {
    const pdf = new jsPDF('portrait', 'mm', 'a4')
    
    // Configuración de colores (sin emojis problemáticos)
    const azulMunicipal = [41, 98, 255]
    const naranjaOblea = [255, 140, 0]
    const grisTexto = [64, 64, 64]
    
    // === HEADER PRINCIPAL ===
    pdf.setFillColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.rect(0, 0, 210, 50, 'F')
    
    // Escudo municipal (rectángulo decorativo)
    pdf.setFillColor(255, 255, 255)
    pdf.rect(15, 10, 25, 30, 'F')
    pdf.setDrawColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.setLineWidth(2)
    pdf.rect(15, 10, 25, 30)
    
    // Texto "ESCUDO" en el rectángulo
    pdf.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ESCUDO', 27.5, 22, { align: 'center' })
    pdf.text('MUNICIPAL', 27.5, 27, { align: 'center' })
    pdf.text('LANUS', 27.5, 32, { align: 'center' })
    
    // Título principal del municipio
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('MUNICIPALIDAD DE LANUS', 105, 20, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Subsecretaria de Ordenamiento Urbano', 105, 28, { align: 'center' })
    pdf.text('Direccion General de Movilidad y Transporte', 105, 35, { align: 'center' })
    
    // Fecha en esquina superior derecha
    pdf.setFontSize(10)
    pdf.text(`Fecha: ${datosOblea.fecha_emision}`, 195, 45, { align: 'right' })

    // === TÍTULO DEL CERTIFICADO ===
    pdf.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CERTIFICADO DE ENTREGA DE OBLEA', 105, 70, { align: 'center' })
    
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Transporte ${datosOblea.habilitacion.tipo_transporte}`, 105, 82, { align: 'center' })

    // === TEXTO INTRODUCTORIO ===
    pdf.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    
    const textoIntro = `Por medio del presente se deja constancia de la entrega de la oblea de habilitacion reglamentaria, con fecha de emision ${datosOblea.fecha_emision}, cuyos datos se detallan a continuacion:`
    const lineasIntro = pdf.splitTextToSize(textoIntro, 170)
    pdf.text(lineasIntro, 20, 95)

    // === SECCIÓN 1: DATOS DEL TITULAR ===
    let yPos = 110
    
    // Fondo de sección
    pdf.setFillColor(245, 250, 255)
    pdf.rect(20, yPos, 170, 30, 'F')
    pdf.setDrawColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.setLineWidth(1)
    pdf.rect(20, yPos, 170, 30)
    
    // Título de sección
    pdf.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DATOS DEL TITULAR', 25, yPos + 10)
    
    // Datos
    pdf.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Nombre: ${datosOblea.titular.nombre}`, 25, yPos + 18)
    pdf.text(`DNI: ${datosOblea.titular.dni}`, 25, yPos + 25)

    // === SECCIÓN 2: DATOS DEL VEHÍCULO ===
    yPos += 40
    
    pdf.setFillColor(250, 250, 250)
    pdf.rect(20, yPos, 170, 30, 'F')
    pdf.setDrawColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.rect(20, yPos, 170, 30)
    
    pdf.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DATOS DEL VEHICULO', 25, yPos + 10)
    
    pdf.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Dominio: ${datosOblea.vehiculo.dominio}`, 25, yPos + 18)
    pdf.text(`Marca: ${datosOblea.vehiculo.marca}`, 100, yPos + 18)
    pdf.text(`Modelo: ${datosOblea.vehiculo.modelo}`, 25, yPos + 25)

    // === SECCIÓN 3: DATOS DE LA HABILITACIÓN ===
    yPos += 40
    
    pdf.setFillColor(245, 250, 255)
    pdf.rect(20, yPos, 170, 30, 'F')
    pdf.setDrawColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.rect(20, yPos, 170, 30)
    
    pdf.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DATOS DE LA HABILITACION', 25, yPos + 10)
    
    pdf.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`N° Expediente: ${datosOblea.habilitacion.expte}`, 25, yPos + 18)
    pdf.text(`Resolucion: ${datosOblea.habilitacion.resolucion}`, 25, yPos + 25)
    pdf.text(`Vigencia Desde: ${datosOblea.habilitacion.vigencia_desde}`, 100, yPos + 25)

    // === LICENCIA DESTACADA ===
    yPos += 45
    
    pdf.setFillColor(naranjaOblea[0], naranjaOblea[1], naranjaOblea[2])
    pdf.rect(20, yPos, 170, 45, 'F')
    pdf.setDrawColor(naranjaOblea[0], naranjaOblea[1], naranjaOblea[2])
    pdf.setLineWidth(3)
    pdf.rect(20, yPos, 170, 45)
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('LICENCIA DE HABILITACION N°', 105, yPos + 15, { align: 'center' })
    
    pdf.setFontSize(32)
    pdf.setFont('helvetica', 'bold')
    pdf.text(datosOblea.habilitacion.nro_licencia, 105, yPos + 28, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Vigencia hasta ${datosOblea.habilitacion.vigencia_mes_ano}`, 105, yPos + 38, { align: 'center' })

    // === NOTA IMPORTANTE ===
    yPos += 55
    
    pdf.setFillColor(255, 248, 220)
    pdf.rect(20, yPos, 170, 20, 'F')
    pdf.setDrawColor(255, 193, 7)
    pdf.setLineWidth(1)
    pdf.rect(20, yPos, 170, 20)
    
    pdf.setTextColor(133, 77, 14)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('IMPORTANTE:', 25, yPos + 8)
    
    pdf.setFont('helvetica', 'normal')
    const textoNota = 'La oblea debera ser exhibida en un lugar visible del vehiculo en todo momento durante la prestacion del servicio.'
    const lineasNota = pdf.splitTextToSize(textoNota, 160)
    pdf.text(lineasNota, 25, yPos + 15)

    // === SECCIÓN DE FIRMAS ===
    yPos += 30
    
    pdf.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    
    // Cajas para firmas
    pdf.setDrawColor(128, 128, 128)
    pdf.setLineWidth(0.5)
    pdf.rect(30, yPos, 65, 20)
    pdf.rect(115, yPos, 65, 20)
    
    // Líneas para firmar
    pdf.line(35, yPos + 15, 90, yPos + 15)
    pdf.line(120, yPos + 15, 175, yPos + 15)
    
    pdf.setFontSize(9)
    pdf.text('Firma y Aclaracion', 62.5, yPos + 6, { align: 'center' })
    pdf.text('del Receptor', 62.5, yPos + 10, { align: 'center' })
    
    pdf.text('Firma y Sello del', 147.5, yPos + 6, { align: 'center' })
    pdf.text('Agente Municipal', 147.5, yPos + 10, { align: 'center' })

    // === FOOTER ===
    pdf.setFillColor(245, 245, 245)
    pdf.rect(0, 280, 210, 17, 'F')
    
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 10, 290)
    pdf.text(`ID Oblea: ${datosOblea.id}`, 105, 290, { align: 'center' })
    pdf.text('www.lanus.gob.ar', 200, 290, { align: 'right' })

    // Descargar PDF
    const nroLicenciaSeguro = datosOblea.habilitacion.nro_licencia.replace(/\//g, '-')
    pdf.save(`certificado_oblea_${nroLicenciaSeguro}.pdf`)
  }

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <FileText className="h-6 w-6 text-orange-600" />
          <h3 className="font-semibold text-orange-800">
            Certificado de Entrega de Oblea
          </h3>
        </div>
        
        <p className="text-sm text-orange-700 mb-4">
          Genera un certificado PDF que acredita la entrega de la oblea de habilitación 
          al titular del vehículo. Este documento debe ser firmado por ambas partes.
        </p>

        <div className="bg-orange-100 border border-orange-300 rounded p-3 mb-4">
          <h4 className="font-medium text-orange-800 mb-2">📋 El certificado incluye:</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Datos completos del titular y vehículo</li>
            <li>• Número de licencia y vigencia</li>
            <li>• Espacios para firmas del receptor y agente municipal</li>
            <li>• Información legal sobre el uso de la oblea</li>
          </ul>
        </div>

        <Button
          onClick={generarCertificado}
          disabled={generando}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {generando ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando certificado...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generar Certificado de Oblea
            </>
          )}
        </Button>
      </div>

      {datos && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">
              Certificado generado exitosamente
            </span>
          </div>
          <p className="text-sm text-green-700">
            ID de oblea: #{datos.id} - Licencia: {datos.habilitacion.nro_licencia}
          </p>
        </div>
      )}
    </div>
  )
}
