'use client'

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DatosVerificacion {
  // Habilitación
  expediente: string
  licencia: string
  tipoHabilitacion: string
  tipoTransporte: string
  
  // Titular
  titularNombre: string
  titularDNI: string
  titularDomicilio: string
  
  // Conductor
  conductorNombre?: string
  conductorDNI?: string
  
  // Vehículo
  dominio: string
  marca: string
  modelo: string
  inscripcion: string
  
  // Ítems de verificación (si vienen de la BD)
  items?: Array<{
    descripcion: string
    estado: 'bien' | 'regular' | 'mal' | null
    observaciones?: string
  }>
}

const ITEMS_ESCOLAR = [
  'Pta. accionada cond. para desc./ asc. (Puerta derecha)',
  'Pta. accionada cond. para desc./ asc. (Puerta izquierda)',
  'Salida de Emer. indep. de laplataf. asc. / desc. (En Caso de Combi - L. Der. y Trasero)',
  'Vent. Vidrio Temp. / inastillable (Apertura 10 cm)',
  'Pisos rec. con mat. Antideslizantes',
  'Dimens. de Banquetas ( desde el piso 0.40 mts - ancho min 0.45mts Prof. medida horiz. 0.40 mts)',
  'Asientos: Fijos, Acolchados, Estructu. metalicas, revestimiento (Caucho o similar )',
  'Puerta Izquierda de la Carroceria',
  'Cinturones de Seguridad en todos los asientos',
  'Cabezales o apoya Cabeza en todos los asientos',
  'Espacios Libres',
  'Pintura ( Carroceria baja y capot naranja Nº 1054 IRAM - carroceria altatecho y parantes Color blanco)',
  'Leyenda de Escolares o Niños Tamaño minimo : 0,20 mts',
]

function addField(doc: jsPDF, label: string, value: string, x: number, y: number) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(80, 80, 80)
  doc.text(label, x, y)
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  const labelWidth = doc.getTextWidth(label)
  doc.text(value || 'N/A', x + labelWidth + 1.5, y)
}

export function generarCertificadoVerificacionPDF(datos: DatosVerificacion): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true, // Mejor compresión
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 12

  // --- HEADER COMPACTO ---
  doc.setFillColor(139, 0, 0) // Color bordo
  doc.rect(0, 0, pageWidth, 25, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('CERTIFICADO DE VERIFICACIÓN VEHICULAR', pageWidth / 2, 10, { align: 'center' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Subsecretaria de Ordenamiento Urbano - Dirección Gral. de Movilidad y Transporte', pageWidth / 2, 16, { align: 'center' })

  // Fecha compacta
  const fecha = new Date().toLocaleDateString('es-AR')
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  doc.setFontSize(7)
  doc.text(`${fecha} - ${hora}`, pageWidth - margin, 21, { align: 'right' })

  let yPos = 32

  // --- DATOS PRINCIPALES (2 columnas) ---
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9)

  // Columna izquierda
  const col1X = margin
  const col2X = pageWidth / 2 + 5

  // Expediente y Licencia
  addField(doc, 'Expediente N°:', datos.expediente, col1X, yPos)
  addField(doc, 'Licencia N°:', datos.licencia, col2X, yPos)
  yPos += 6

  addField(doc, 'Tipo:', datos.tipoHabilitacion, col1X, yPos)
  addField(doc, 'Transporte:', datos.tipoTransporte, col2X, yPos)
  yPos += 8

  // --- TITULAR (Compacto) ---
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(139, 0, 0)
  doc.text('TITULAR', col1X, yPos)
  yPos += 4

  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  addField(doc, 'Nombre:', datos.titularNombre, col1X, yPos)
  addField(doc, 'DNI:', datos.titularDNI, col2X, yPos)
  yPos += 5
  addField(doc, 'Domicilio:', datos.titularDomicilio, col1X, yPos)
  yPos += 8

  // --- VEHÍCULO ---
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(139, 0, 0)
  doc.text('VEHÍCULO', col1X, yPos)
  
  // CONDUCTOR en la misma línea si existe
  if (datos.conductorNombre) {
    doc.text('CONDUCTOR', col2X, yPos)
  }
  yPos += 4

  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  addField(doc, 'Dominio:', datos.dominio, col1X, yPos)
  if (datos.conductorNombre) {
    addField(doc, 'Nombre:', datos.conductorNombre, col2X, yPos)
  }
  yPos += 5
  addField(doc, 'Marca:', datos.marca, col1X, yPos)
  addField(doc, 'Modelo:', datos.modelo, col2X - 25, yPos)
  if (datos.conductorNombre) {
    addField(doc, 'DNI:', datos.conductorDNI || 'N/A', col2X + 30, yPos)
  }
  yPos += 5
  addField(doc, 'Insc. Inicial:', datos.inscripcion, col1X, yPos)
  yPos += 8

  // --- TABLA DE VERIFICACIÓN OPTIMIZADA ---
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(139, 0, 0)
  doc.text('DETALLES Y OBSERVACIONES DEL VEHÍCULO', pageWidth / 2, yPos, { align: 'center' })
  yPos += 4

  // Preparar datos de la tabla
  const tableData = ITEMS_ESCOLAR.map((item) => {
    // Si vienen datos de la BD, buscar el item
    const itemData = datos.items?.find((i) => i.descripcion === item)
    
    return [
      item,
      itemData?.estado === 'bien' ? '✓' : '',
      itemData?.estado === 'regular' ? '✓' : '',
      itemData?.estado === 'mal' ? '✓' : '',
      itemData?.observaciones || '',
    ]
  })

  autoTable(doc, {
    startY: yPos,
    head: [['Descripción', 'B', 'R', 'M', 'Observaciones']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [139, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1,
    },
    columnStyles: {
      0: { cellWidth: 95, fontSize: 6.5 },
      1: { cellWidth: 10, halign: 'center', fontSize: 7 },
      2: { cellWidth: 10, halign: 'center', fontSize: 7 },
      3: { cellWidth: 10, halign: 'center', fontSize: 7 },
      4: { cellWidth: 61, fontSize: 6.5 },
    },
    styles: {
      fontSize: 6.5,
      cellPadding: 0.8,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      minCellHeight: 6,
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
    didDrawPage: function(data) {
      // Asegurar que todo quepa en una página
      if (data.pageNumber > 1) {
        console.warn('El contenido excede una página')
      }
    },
  })

  // --- FIRMAS COMPACTAS ---
  const finalY = (doc as any).lastAutoTable.finalY + 8

  // Verificar que haya espacio para las firmas
  const lineY = Math.min(finalY + 15, pageHeight - 25)
  const lineWidth = 65

  doc.setDrawColor(100, 100, 100)
  doc.setLineWidth(0.3)

  // Firma del Interesado
  doc.line(margin + 5, lineY, margin + 5 + lineWidth, lineY)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text('Firma del Interesado', margin + 5 + lineWidth / 2, lineY + 4, { align: 'center' })

  // Firma del Agente Verificador
  const rightX = pageWidth - margin - lineWidth - 5
  doc.line(rightX, lineY, rightX + lineWidth, lineY)
  doc.text('Firma del Agente Verificador', rightX + lineWidth / 2, lineY + 4, { align: 'center' })

  return doc
}
