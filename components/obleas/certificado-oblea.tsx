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
        method: 'POST',
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

    // Colores institucionales más suaves
    const azulMunicipal = [30, 64, 175]
    const naranjaOblea = [242, 113, 28]
    const grisTexto = [50, 50, 50]

    // === HEADER COMPACTO ===
    pdf.setFillColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.rect(0, 0, 210, 35, 'F')

    // Logo municipal (placeholder - puedes agregar imagen después)
    pdf.setFillColor(255, 255, 255)
    pdf.circle(20, 17.5, 8, 'F')
    pdf.setDrawColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.setLineWidth(1)
    pdf.circle(20, 17.5, 8)

    pdf.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.setFontSize(6)
    pdf.setFont('helvetica', 'bold')
    pdf.text('LANUS', 20, 18, { align: 'center' })

    // Título header
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('MUNICIPALIDAD DE LANUS', 105, 14, { align: 'center' })

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Direccion General de Movilidad y Transporte', 105, 22, { align: 'center' })

    pdf.setFontSize(8)
    pdf.text(`Fecha: ${datosOblea.fecha_emision}`, 195, 30, { align: 'right' })

    // === TÍTULO COMPACTO ===
    pdf.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CERTIFICADO DE ENTREGA DE OBLEA', 105, 48, { align: 'center' })

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Transporte ${datosOblea.habilitacion.tipo_transporte}`, 105, 56, { align: 'center' })

    // === DATOS EN FORMATO TABLA COMPACTA ===
    let yPos = 68

    // Tabla de información
    pdf.setFillColor(248, 250, 252)
    pdf.rect(15, yPos, 180, 60, 'F')
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.3)
    pdf.rect(15, yPos, 180, 60)

    // Líneas divisorias horizontales
    pdf.line(15, yPos + 20, 195, yPos + 20)
    pdf.line(15, yPos + 40, 195, yPos + 40)

    // Contenido compacto
    pdf.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')

    // Fila 1: Titular
    pdf.text('TITULAR:', 20, yPos + 8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(datosOblea.titular.nombre, 45, yPos + 8)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DNI:', 20, yPos + 15)
    pdf.setFont('helvetica', 'normal')
    pdf.text(datosOblea.titular.dni, 45, yPos + 15)

    // Fila 2: Vehículo
    pdf.setFont('helvetica', 'bold')
    pdf.text('VEHICULO:', 20, yPos + 28)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Dom: ${datosOblea.vehiculo.dominio}`, 45, yPos + 28)
    pdf.text(`${datosOblea.vehiculo.marca} ${datosOblea.vehiculo.modelo}`, 80, yPos + 28)

    // Fila 3: Habilitación
    pdf.setFont('helvetica', 'bold')
    pdf.text('HABILITACION:', 20, yPos + 48)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Expte: ${datosOblea.habilitacion.expte}`, 45, yPos + 48)
    pdf.text(`Res: ${datosOblea.habilitacion.resolucion}`, 100, yPos + 48)
    pdf.text(`Vigencia: ${datosOblea.habilitacion.vigencia_desde}`, 20, yPos + 55)

    // === LICENCIA DESTACADA COMPACTA ===
    yPos += 70

    pdf.setFillColor(naranjaOblea[0], naranjaOblea[1], naranjaOblea[2])
    pdf.roundedRect(15, yPos, 180, 32, 2, 2, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text('LICENCIA DE HABILITACION', 105, yPos + 10, { align: 'center' })

    pdf.setFontSize(24)
    pdf.text(datosOblea.habilitacion.nro_licencia, 105, yPos + 20, { align: 'center' })

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Vigencia hasta ${datosOblea.habilitacion.vigencia_mes_ano}`, 105, yPos + 27, {
      align: 'center',
    })

    // === SECCIÓN DE FIRMAS MEJORADA ===
    yPos += 42

    pdf.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('FIRMAS Y CONFORMIDAD', 105, yPos, { align: 'center' })

    yPos += 8

    // Tres columnas de firmas
    const firmas = [
      { x: 25, titulo: 'FIRMA DEL INTERESADO', subtitulo: '(Aclaracion y DNI)' },
      { x: 105, titulo: 'FIRMA DEL INSPECTOR', subtitulo: '(Aclaracion y Legajo)' },
    ]

    firmas.forEach(firma => {
      // Caja para firma
      pdf.setDrawColor(150, 150, 150)
      pdf.setLineWidth(0.3)
      pdf.rect(firma.x - 32, yPos, 64, 30)

      // Línea para firma
      pdf.line(firma.x - 28, yPos + 20, firma.x + 28, yPos + 20)

      // Títulos
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text(firma.titulo, firma.x, yPos + 6, { align: 'center' })

      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'normal')
      pdf.text(firma.subtitulo, firma.x, yPos + 26, { align: 'center' })
    })

    // === NOTA LEGAL COMPACTA ===
    yPos += 38

    pdf.setFillColor(255, 252, 240)
    pdf.rect(15, yPos, 180, 15, 'F')
    pdf.setDrawColor(255, 193, 7)
    pdf.setLineWidth(0.5)
    pdf.rect(15, yPos, 180, 15)

    pdf.setTextColor(133, 77, 14)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.text('IMPORTANTE:', 20, yPos + 6)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    const textoNota =
      'La oblea debe exhibirse en lugar visible del vehiculo. Este certificado acredita su entrega.'
    pdf.text(textoNota, 20, yPos + 11)

    // === FOOTER COMPACTO ===
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.2)
    pdf.line(15, 280, 195, 280)

    pdf.setFontSize(7)
    pdf.setTextColor(120, 120, 120)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 15, 285)
    pdf.text(`ID: ${datosOblea.id}`, 105, 285, { align: 'center' })
    pdf.text('www.lanus.gob.ar', 195, 285, { align: 'right' })

    // Descargar PDF
    const nroLicenciaSeguro = datosOblea.habilitacion.nro_licencia.replace(/\//g, '-')
    pdf.save(`certificado_oblea_${nroLicenciaSeguro}.pdf`)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <div className="mb-3 flex items-center gap-3">
          <FileText className="h-6 w-6 text-orange-600" />
          <h3 className="font-semibold text-orange-800">Certificado de Entrega de Oblea</h3>
        </div>

        <p className="mb-4 text-sm text-orange-700">
          Genera un certificado PDF que acredita la entrega de la oblea de habilitación al titular
          del vehículo. Este documento debe ser firmado por ambas partes.
        </p>

        <div className="mb-4 rounded border border-orange-300 bg-orange-100 p-3">
          <h4 className="mb-2 font-medium text-orange-800">📋 El certificado incluye:</h4>
          <ul className="space-y-1 text-sm text-orange-700">
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando certificado...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generar Certificado de Oblea
            </>
          )}
        </Button>
      </div>

      {datos && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Certificado generado exitosamente</span>
          </div>
          <p className="text-sm text-green-700">
            ID de oblea: #{datos.id} - Licencia: {datos.habilitacion.nro_licencia}
          </p>
        </div>
      )}
    </div>
  )
}
