import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DatosHabilitacion {
  nro_licencia: string
  tipo_transporte: string
  estado: string
  vigencia_inicio?: string
  vigencia_fin?: string
  titular: {
    nombre: string
    dni: string
  }
  vehiculo: {
    dominio: string
    marca: string
    modelo: string
    ano?: number
    chasis?: string
    motor?: string
  }
}

/**
 * Genera un PDF de verificación técnica EN BLANCO
 * Solo con los datos de la habilitación, el resto vacío para completar manualmente
 */
export async function generarPDFVerificacion(datos: DatosHabilitacion): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 15

  // Título principal
  doc.setFillColor(41, 128, 185)
  doc.rect(0, 0, pageWidth, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('FORMULARIO DE VERIFICACIÓN TÉCNICA', pageWidth / 2, 15, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Municipio de Lanús - Dirección de Transporte', pageWidth / 2, 25, { align: 'center' })

  // Resetear color de texto
  doc.setTextColor(0, 0, 0)

  let yPos = 45

  // DATOS DE LA HABILITACIÓN (Completos)
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DE LA HABILITACIÓN', margin + 2, yPos + 5.5)

  yPos += 12

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Datos en tabla
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ['Licencia N°:', datos.nro_licencia],
      ['Tipo Transporte:', datos.tipo_transporte || 'N/A'],
      ['Estado:', datos.estado || 'N/A'],
      [
        'Vigencia:',
        datos.vigencia_inicio && datos.vigencia_fin
          ? `${new Date(datos.vigencia_inicio).toLocaleDateString('es-AR')} - ${new Date(datos.vigencia_fin).toLocaleDateString('es-AR')}`
          : 'N/A',
      ],
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  })

  yPos = (doc as any).lastAutoTable.finalY + 8

  // DATOS DEL TITULAR (Completos)
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL TITULAR', margin + 2, yPos + 5.5)

  yPos += 12

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ['Nombre:', datos.titular.nombre],
      ['DNI:', datos.titular.dni],
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  })

  yPos = (doc as any).lastAutoTable.finalY + 8

  // DATOS DEL VEHÍCULO (Completos)
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL VEHÍCULO', margin + 2, yPos + 5.5)

  yPos += 12

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ['Dominio:', datos.vehiculo.dominio],
      ['Marca:', datos.vehiculo.marca],
      ['Modelo:', datos.vehiculo.modelo],
      ['Año:', datos.vehiculo.ano?.toString() || 'N/A'],
      ['Chasis:', datos.vehiculo.chasis || 'N/A'],
      ['Motor:', datos.vehiculo.motor || 'N/A'],
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  })

  yPos = (doc as any).lastAutoTable.finalY + 10

  // DATOS DE LA VERIFICACIÓN (EN BLANCO - Para completar)
  doc.setFillColor(52, 152, 219)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DE LA VERIFICACIÓN (Completar)', margin + 2, yPos + 5.5)
  doc.setTextColor(0, 0, 0)

  yPos += 12

  // Campos vacíos para completar
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ['Fecha:', '_____ / _____ / _________'],
      ['Hora:', '_____ : _____'],
      ['Planta:', '_______________________________'],
      ['Turno:', '_______________________________'],
      ['N° Certificado:', '_______________________________'],
      ['N° Oblea:', '_______________________________'],
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  })

  yPos = (doc as any).lastAutoTable.finalY + 10

  // RESULTADO (EN BLANCO)
  doc.setFillColor(52, 152, 219)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('RESULTADO DE LA VERIFICACIÓN (Marcar)', margin + 2, yPos + 5.5)
  doc.setTextColor(0, 0, 0)

  yPos += 15

  // Checkboxes para resultado
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)

  // APROBADO
  doc.rect(margin + 20, yPos - 4, 5, 5, 'S')
  doc.text('APROBADO', margin + 28, yPos)

  // RECHAZADO
  doc.rect(margin + 80, yPos - 4, 5, 5, 'S')
  doc.text('RECHAZADO', margin + 88, yPos)

  // CONDICIONAL
  doc.rect(margin + 140, yPos - 4, 5, 5, 'S')
  doc.text('CONDICIONAL', margin + 148, yPos)

  yPos += 15

  // OBSERVACIONES (EN BLANCO)
  doc.setFillColor(52, 152, 219)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('OBSERVACIONES (Completar)', margin + 2, yPos + 5.5)
  doc.setTextColor(0, 0, 0)

  yPos += 10

  // Espacio para observaciones (líneas vacías)
  doc.setDrawColor(200, 200, 200)
  for (let i = 0; i < 5; i++) {
    yPos += 8
    doc.line(margin, yPos, pageWidth - margin, yPos)
  }

  yPos += 15

  // FIRMAS
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)

  const firmaY = yPos

  // Firma del Verificador
  doc.line(margin + 10, firmaY, margin + 70, firmaY)
  doc.text('Firma del Verificador', margin + 40, firmaY + 5, { align: 'center' })

  // Firma del Contribuyente
  doc.line(pageWidth - margin - 70, firmaY, pageWidth - margin - 10, firmaY)
  doc.text('Firma del Contribuyente', pageWidth - margin - 40, firmaY + 5, { align: 'center' })

  // Footer
  yPos = pageHeight - 15
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(128, 128, 128)
  doc.text(
    `Generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  )

  // Convertir a Buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}
