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
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(label, x, y)
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  doc.text(value || 'N/A', x + doc.getTextWidth(label) + 2, y)
}

export function generarCertificadoVerificacionPDF(datos: DatosVerificacion): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210
  const margin = 15

  // --- HEADER ---
  doc.setFillColor(139, 0, 0) // Color bordo
  doc.rect(0, 0, pageWidth, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CERTIFICADO DE VERIFICACIÓN VEHICULAR', pageWidth / 2, 12, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Subsecretaria de Ordenamiento Urbano', pageWidth / 2, 18, { align: 'center' })
  doc.text('Dirección Gral. de Movilidad y Transporte', pageWidth / 2, 23, { align: 'center' })

  // Fecha
  const fecha = new Date().toLocaleDateString('es-AR')
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  doc.setFontSize(8)
  doc.text(`Fecha: ${fecha}`, pageWidth - margin, 20, { align: 'right' })
  doc.text(`Hora: ${hora}`, pageWidth - margin, 25, { align: 'right' })

  let yPos = 38

  // --- DATOS PRINCIPALES (2 columnas) ---
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9)

  // Columna izquierda
  const col1X = margin
  const col2X = pageWidth / 2 + 5

  // Expediente y Licencia
  addField(doc, 'Expediente N°:', datos.expediente, col1X, yPos)
  addField(doc, 'Licencia N°:', datos.licencia, col2X, yPos)
  yPos += 7

  addField(doc, 'Tipo de Habilitación:', datos.tipoHabilitacion, col1X, yPos)
  addField(doc, 'Transporte:', datos.tipoTransporte, col2X, yPos)
  yPos += 10

  // --- TITULAR ---
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(139, 0, 0)
  doc.text('Titular', col1X, yPos)
  yPos += 5

  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  addField(doc, 'Nombre:', datos.titularNombre, col1X, yPos)
  addField(doc, 'DNI:', datos.titularDNI, col2X, yPos)
  yPos += 6
  addField(doc, 'Domicilio:', datos.titularDomicilio, col1X, yPos)
  yPos += 10

  // --- CONDUCTOR ---
  if (datos.conductorNombre) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(139, 0, 0)
    doc.text('Conductor', col2X, yPos - 4)

    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    addField(doc, 'Nombre:', datos.conductorNombre, col2X, yPos + 1)
    yPos += 6
    addField(doc, 'DNI:', datos.conductorDNI || 'N/A', col2X, yPos)
    yPos += 4
  }

  // --- VEHÍCULO ---
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(139, 0, 0)
  doc.text('Vehículo', col1X, yPos)
  yPos += 5

  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  addField(doc, 'Dominio:', datos.dominio, col1X, yPos)
  yPos += 6
  addField(doc, 'Marca:', datos.marca, col1X, yPos)
  addField(doc, 'Modelo:', datos.modelo, col2X, yPos)
  yPos += 6
  addField(doc, 'Inscripción Inicial:', datos.inscripcion, col1X, yPos)
  yPos += 10

  // --- TABLA DE VERIFICACIÓN ---
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(139, 0, 0)
  doc.text('DETALLES Y OBSERVACIONES DEL VEHÍCULO', pageWidth / 2, yPos, { align: 'center' })
  yPos += 5

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
    head: [['Descripción', 'Bien', 'Regular', 'Mal', 'Observaciones']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [139, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 90, fontSize: 7 },
      1: { cellWidth: 15, halign: 'center', fontSize: 8 },
      2: { cellWidth: 15, halign: 'center', fontSize: 8 },
      3: { cellWidth: 15, halign: 'center', fontSize: 8 },
      4: { cellWidth: 45, fontSize: 7 },
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
  })

  // --- FIRMAS ---
  const finalY = (doc as any).lastAutoTable.finalY + 10

  // Líneas para firmas
  const lineY = finalY + 30
  const lineWidth = 70

  // Firma del Interesado
  doc.line(margin, lineY, margin + lineWidth, lineY)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Firma del Interesado', margin + lineWidth / 2, lineY + 5, { align: 'center' })

  // Firma del Agente Verificador
  const rightX = pageWidth - margin - lineWidth
  doc.line(rightX, lineY, rightX + lineWidth, lineY)
  doc.text('Firma del Agente Verificador', rightX + lineWidth / 2, lineY + 5, { align: 'center' })

  return doc
}
