import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DatosHabilitacion {
  nro_licencia: string
  tipo_transporte: string
  estado: string
  vigencia_inicio?: string
  vigencia_fin?: string
  resolucion?: string
  expte?: string
  titular: {
    nombre: string
    dni: string
    domicilio?: string
  }
  vehiculo: {
    dominio: string
    marca: string
    modelo: string
    ano?: number
    chasis?: string
    motor?: string
    asientos?: number
  }
}

/**
 * Genera un PDF de CERTIFICADO/CONSTANCIA de habilitación
 * Con todos los datos completos para imprimir
 */
export async function generarCertificadoPDF(datos: DatosHabilitacion): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20

  // HEADER - Membrete oficial
  doc.setFillColor(41, 128, 185)
  doc.rect(0, 0, pageWidth, 45, 'F')

  // Logo placeholder
  doc.setFillColor(255, 255, 255)
  doc.circle(30, 22.5, 12, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('MUNICIPIO DE LANÚS', pageWidth / 2, 18, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Dirección de Transporte', pageWidth / 2, 28, { align: 'center' })

  doc.setFontSize(11)
  doc.text('Gobierno de la Provincia de Buenos Aires', pageWidth / 2, 36, { align: 'center' })

  // TÍTULO DEL DOCUMENTO
  doc.setTextColor(0, 0, 0)
  let yPos = 60

  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 15, 'F')
  
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('CERTIFICADO DE HABILITACIÓN', pageWidth / 2, yPos + 10, { align: 'center' })

  yPos += 25

  // Número de licencia destacado
  doc.setFillColor(41, 128, 185)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`LICENCIA N° ${datos.nro_licencia}`, pageWidth / 2, yPos + 8, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Transporte ${datos.tipo_transporte}`, pageWidth / 2, yPos + 15, { align: 'center' })

  yPos += 28

  doc.setTextColor(0, 0, 0)

  // CERTIFICACIÓN
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const textoCertificacion = `La Dirección de Transporte del Municipio de Lanús certifica que el presente vehículo se encuentra HABILITADO para prestar servicios de transporte ${datos.tipo_transporte.toLowerCase()} en el distrito, conforme a las disposiciones vigentes.`
  
  const lineas = doc.splitTextToSize(textoCertificacion, pageWidth - 2 * margin - 10)
  doc.text(lineas, margin + 5, yPos)
  yPos += lineas.length * 6 + 10

  // DATOS DEL TITULAR
  doc.setFillColor(52, 152, 219)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL TITULAR', margin + 3, yPos + 5.5)
  doc.setTextColor(0, 0, 0)

  yPos += 12

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ['Titular:', datos.titular.nombre],
      ['DNI:', datos.titular.dni],
      ...(datos.titular.domicilio ? [['Domicilio:', datos.titular.domicilio]] : []),
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: [245, 245, 245] },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  })

  yPos = (doc as any).lastAutoTable.finalY + 10

  // DATOS DEL VEHÍCULO
  doc.setFillColor(52, 152, 219)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL VEHÍCULO', margin + 3, yPos + 5.5)
  doc.setTextColor(0, 0, 0)

  yPos += 12

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ['Dominio:', datos.vehiculo.dominio],
      ['Marca:', datos.vehiculo.marca],
      ['Modelo:', datos.vehiculo.modelo],
      ...(datos.vehiculo.ano ? [['Año:', datos.vehiculo.ano.toString()]] : []),
      ...(datos.vehiculo.chasis ? [['Chasis:', datos.vehiculo.chasis]] : []),
      ...(datos.vehiculo.motor ? [['Motor:', datos.vehiculo.motor]] : []),
      ...(datos.vehiculo.asientos ? [['Asientos:', datos.vehiculo.asientos.toString()]] : []),
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: [245, 245, 245] },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  })

  yPos = (doc as any).lastAutoTable.finalY + 10

  // DATOS DE LA HABILITACIÓN
  doc.setFillColor(52, 152, 219)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DE LA HABILITACIÓN', margin + 3, yPos + 5.5)
  doc.setTextColor(0, 0, 0)

  yPos += 12

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ['Estado:', datos.estado],
      ['Tipo:', datos.tipo_transporte],
      ...(datos.vigencia_inicio ? [['Vigencia Desde:', new Date(datos.vigencia_inicio).toLocaleDateString('es-AR')]] : []),
      ...(datos.vigencia_fin ? [['Vigencia Hasta:', new Date(datos.vigencia_fin).toLocaleDateString('es-AR')]] : []),
      ...(datos.resolucion ? [['Resolución:', datos.resolucion]] : []),
      ...(datos.expte ? [['Expediente:', datos.expte]] : []),
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: [245, 245, 245] },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // VALIDEZ
  doc.setFillColor(255, 248, 220)
  doc.setDrawColor(255, 193, 7)
  doc.setLineWidth(0.5)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 20, 'FD')
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(156, 39, 176)
  doc.text('⚠️ IMPORTANTE:', margin + 5, yPos + 7)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9)
  const textoValidez = 'Este certificado es válido únicamente para el vehículo y titular indicados. Debe portarse junto con la documentación del vehículo durante la prestación del servicio.'
  const lineasValidez = doc.splitTextToSize(textoValidez, pageWidth - 2 * margin - 10)
  doc.text(lineasValidez, margin + 5, yPos + 13)

  yPos += 30

  // FIRMA Y SELLO
  yPos = pageHeight - 60

  doc.setDrawColor(0, 0, 0)
  doc.line(margin + 30, yPos, margin + 80, yPos)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Firma y Sello', margin + 55, yPos + 5, { align: 'center' })
  doc.setFontSize(8)
  doc.text('Dirección de Transporte', margin + 55, yPos + 10, { align: 'center' })
  doc.text('Municipio de Lanús', margin + 55, yPos + 14, { align: 'center' })

  // QR Code placeholder
  doc.setFillColor(220, 220, 220)
  doc.rect(pageWidth - margin - 35, yPos - 20, 30, 30, 'F')
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text('Código QR', pageWidth - margin - 20, yPos + 15, { align: 'center' })

  // Footer
  yPos = pageHeight - 15
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(128, 128, 128)
  doc.text(
    `Certificado generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  )

  doc.setFontSize(7)
  doc.text(
    'Municipio de Lanús - Dirección de Transporte | www.lanus.gob.ar',
    pageWidth / 2,
    yPos + 5,
    { align: 'center' }
  )

  // Convertir a Buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}
