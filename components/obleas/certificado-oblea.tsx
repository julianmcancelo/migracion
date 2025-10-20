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
    
    // Configuración de fuentes y colores
    const primaryColor = [59, 130, 246] // Azul
    const secondaryColor = [75, 85, 99] // Gris
    
    // Header con logo y título
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.rect(0, 0, 210, 30, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('MUNICIPALIDAD DE LANÚS', 105, 12, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Subsecretaría de Ordenamiento Urbano', 105, 18, { align: 'center' })
    pdf.text('Dirección General de Movilidad y Transporte', 105, 24, { align: 'center' })

    // Título principal
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CERTIFICADO DE ENTREGA DE OBLEA', 105, 50, { align: 'center' })
    
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Transporte ${datosOblea.habilitacion.tipo_transporte}`, 105, 60, { align: 'center' })

    // Texto introductorio
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const textoIntro = `Por medio del presente se deja constancia de la entrega de la oblea de habilitación reglamentaria, con fecha de emisión ${datosOblea.fecha_emision}, cuyos datos se detallan a continuación:`
    
    const lineasIntro = pdf.splitTextToSize(textoIntro, 170)
    pdf.text(lineasIntro, 20, 80)

    // Sección de datos del titular
    let yPos = 100
    
    pdf.setFillColor(240, 248, 255)
    pdf.rect(20, yPos, 170, 25, 'F')
    
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DATOS DEL TITULAR:', 25, yPos + 8)
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Nombre: ${datosOblea.titular.nombre}`, 25, yPos + 16)
    pdf.text(`DNI: ${datosOblea.titular.dni}`, 110, yPos + 16)

    // Sección de datos del vehículo
    yPos += 35
    
    pdf.setFillColor(240, 248, 255)
    pdf.rect(20, yPos, 170, 25, 'F')
    
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DATOS DEL VEHÍCULO:', 25, yPos + 8)
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Dominio: ${datosOblea.vehiculo.dominio}`, 25, yPos + 16)
    pdf.text(`Marca: ${datosOblea.vehiculo.marca}`, 80, yPos + 16)
    pdf.text(`Modelo: ${datosOblea.vehiculo.modelo}`, 130, yPos + 16)

    // Sección de datos de la habilitación
    yPos += 35
    
    pdf.setFillColor(240, 248, 255)
    pdf.rect(20, yPos, 170, 25, 'F')
    
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DATOS DE LA HABILITACIÓN:', 25, yPos + 8)
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`N° Expediente: ${datosOblea.habilitacion.expte}`, 25, yPos + 16)
    pdf.text(`Resolución: ${datosOblea.habilitacion.resolucion}`, 110, yPos + 16)
    pdf.text(`Vigencia Desde: ${datosOblea.habilitacion.vigencia_desde}`, 25, yPos + 22)

    // Número de licencia destacado
    yPos += 40
    
    pdf.setFillColor(59, 130, 246)
    pdf.rect(20, yPos, 170, 35, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Licencia de Habilitación N°', 105, yPos + 12, { align: 'center' })
    
    pdf.setFontSize(28)
    pdf.text(datosOblea.habilitacion.nro_licencia, 105, yPos + 22, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Vigencia hasta ${datosOblea.habilitacion.vigencia_mes_ano}`, 105, yPos + 30, { align: 'center' })

    // Nota importante
    yPos += 50
    
    pdf.setTextColor(100, 100, 100)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'italic')
    const textoNota = 'La oblea deberá ser exhibida en un lugar visible del vehículo en todo momento durante la prestación del servicio. El presente certificado acredita la entrega de la misma, pero no reemplaza la documentación reglamentaria del vehículo (VTV, seguro, etc.).'
    const lineasNota = pdf.splitTextToSize(textoNota, 170)
    pdf.text(lineasNota, 20, yPos)

    // Firmas
    yPos += 30
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    
    // Líneas para firmas
    pdf.line(30, yPos, 90, yPos)
    pdf.line(120, yPos, 180, yPos)
    
    pdf.text('Firma y Aclaración del Receptor', 60, yPos + 8, { align: 'center' })
    pdf.text('Firma y Sello del Agente Municipal', 150, yPos + 8, { align: 'center' })

    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text(`Certificado generado el ${new Date().toLocaleString('es-AR')} - ID: ${datosOblea.id}`, 105, 285, { align: 'center' })

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
