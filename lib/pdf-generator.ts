import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DatosInspeccion {
  inspeccion: {
    id: number
    fecha: Date
    inspector: string
    nro_licencia: string
    tipo_transporte: string | null
    resultado: string | null
    firma_inspector: string
    firma_contribuyente: string | null
  }
  titular: {
    nombre: string
    dni?: string
  }
  vehiculo: {
    dominio: string
    marca: string
    modelo: string
    ano: string
    chasis: string
  }
  items: Array<{
    nombre: string
    categoria?: string
    estado: string
    observacion: string
    foto_path?: string
  }>
  fotos: Array<{
    tipo: string
    path: string
  }>
}

/**
 * Genera un PDF de inspección vehicular
 */
export async function generarPDFInspeccion(datos: DatosInspeccion): Promise<Buffer> {
  const doc = new jsPDF('p', 'mm', 'a4')
  
  // Colores del diseño
  const colorAcento: [number, number, number] = [59, 130, 246] // Celeste
  const colorTexto: [number, number, number] = [17, 24, 39] // Gris oscuro
  const colorMutado: [number, number, number] = [107, 114, 128] // Gris medio

  let yPos = 15

  // ==================== HEADER ====================
  const agregarHeader = () => {
    // Marca de agua
    doc.setFontSize(80)
    doc.setTextColor(240, 240, 240)
    doc.text('LANUS', 105, 160, {
      align: 'center',
      angle: 45
    })

    // Título
    doc.setFontSize(18)
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
    doc.setFont('helvetica', 'bold')
    doc.text('Informe de Inspección Vehicular', 105, 20, { align: 'center' })

    // Subtítulo
    doc.setFontSize(11)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.setFont('helvetica', 'normal')
    doc.text('Municipalidad de Lanús | Dirección Gral. de Movilidad y Transporte', 105, 27, { align: 'center' })

    // Línea divisoria
    doc.setDrawColor(colorAcento[0], colorAcento[1], colorAcento[2])
    doc.setLineWidth(0.6)
    doc.line(15, 33, 195, 33)

    yPos = 45
  }

  // ==================== FOOTER ====================
  const agregarFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.setFont('helvetica', 'italic')
    
    doc.line(15, 280, 195, 280)
    doc.text('Este documento es un informe oficial del Sistema de Habilitaciones de Transporte.', 105, 285, { align: 'center' })
    doc.text(`Página ${pageNum} de ${totalPages}`, 105, 290, { align: 'center' })
  }

  // Agregar primera página
  agregarHeader()

  // ==================== DATOS PRINCIPALES ====================
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])

  // Columna Izquierda - Datos de Inspección
  let yLeft = yPos
  doc.text('DATOS DE LA INSPECCIÓN', 20, yLeft)
  yLeft += 7

  doc.setFont('helvetica', 'normal')
  const datosInspeccion = [
    [`N° Inspección:`, datos.inspeccion.id.toString()],
    [`N° Licencia:`, datos.inspeccion.nro_licencia],
    [`Tipo Transporte:`, datos.inspeccion.tipo_transporte || 'N/A'],
    [`Fecha:`, new Date(datos.inspeccion.fecha).toLocaleString('es-AR')],
    [`Inspector:`, datos.inspeccion.inspector]
  ]

  datosInspeccion.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 20, yLeft)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 55, yLeft)
    yLeft += 6
  })

  // Columna Derecha - Datos del Vehículo
  let yRight = yPos
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL VEHÍCULO', 110, yRight)
  yRight += 7

  doc.setFont('helvetica', 'normal')
  const datosVehiculo = [
    [`Titular:`, datos.titular.nombre],
    [`DNI:`, datos.titular.dni || 'N/A'],
    [`Dominio:`, datos.vehiculo.dominio],
    [`Vehículo:`, `${datos.vehiculo.marca} ${datos.vehiculo.modelo}`],
    [`Año:`, datos.vehiculo.ano],
    [`Chasis:`, datos.vehiculo.chasis]
  ]

  datosVehiculo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 110, yRight)
    doc.setFont('helvetica', 'normal')
    // Recortar texto largo
    const maxWidth = 70
    const lines = doc.splitTextToSize(value, maxWidth)
    doc.text(lines[0], 135, yRight)
    yRight += 6
  })

  yPos = Math.max(yLeft, yRight) + 10

  // ==================== VEREDICTO ====================
  // Calcular veredicto automático
  const malCount = datos.items.filter(item => item.estado.toLowerCase() === 'mal').length
  const regularCount = datos.items.filter(item => item.estado.toLowerCase() === 'regular').length
  
  let veredicto = 'APROBADA'
  let veredictoColor: [number, number, number] = [76, 175, 80] // Verde
  
  if (malCount > 0) {
    veredicto = 'RECHAZADA'
    veredictoColor = [244, 67, 54] // Rojo
  } else if (regularCount >= 3) {
    veredicto = 'CONDICIONAL'
    veredictoColor = [255, 193, 7] // Amarillo/Naranja
  }

  // Cuadro de veredicto
  doc.setFillColor(veredictoColor[0], veredictoColor[1], veredictoColor[2])
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.rect(15, yPos, 180, 15, 'F')
  doc.text(`VEREDICTO FINAL: ${veredicto}`, 105, yPos + 10, { align: 'center' })
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  yPos += 25

  // ==================== TABLA DE ITEMS ====================
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorAcento[0], colorAcento[1], colorAcento[2])
  doc.text('Detalle de la Verificación', 15, yPos)
  doc.line(15, yPos + 2, 195, yPos + 2)
  yPos += 10

  // Agrupar items por categoría
  const itemsPorCategoria: { [key: string]: typeof datos.items } = {}
  datos.items.forEach(item => {
    const categoria = item.categoria || 'GENERAL'
    if (!itemsPorCategoria[categoria]) {
      itemsPorCategoria[categoria] = []
    }
    itemsPorCategoria[categoria].push(item)
  })

  // Preparar datos para la tabla con categorías
  const tableData: any[] = []
  Object.keys(itemsPorCategoria).sort().forEach(categoria => {
    // Fila de categoría
    tableData.push([
      { content: categoria.toUpperCase(), colSpan: 3, styles: { fillColor: [220, 220, 220], fontStyle: 'bold', halign: 'left' } }
    ])
    
    // Items de la categoría
    itemsPorCategoria[categoria].forEach(item => {
      tableData.push([
        item.nombre.replace(/_/g, ' '),
        item.estado.toUpperCase(),
        item.observacion || '-'
      ])
    })
  })

  autoTable(doc, {
    startY: yPos,
    head: [['Ítem Verificado', 'Estado', 'Observaciones']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: colorTexto,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: colorTexto
    },
    columnStyles: {
      0: { cellWidth: 80, halign: 'left' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 70, halign: 'left' }
    },
    didParseCell: function(data) {
      // Colorear celdas de estado (solo si no es una fila de categoría)
      if (data.column.index === 1 && data.section === 'body') {
        const cellContent = data.cell.text[0]?.toLowerCase() || ''
        // Verificar que no sea una fila de categoría (que tendría colSpan)
        const isCategory = typeof data.cell.raw === 'object' && data.cell.raw !== null && 'colSpan' in data.cell.raw
        
        if (!isCategory) {
          if (cellContent === 'bien') {
            data.cell.styles.fillColor = [200, 255, 200] // Verde claro
          } else if (cellContent === 'regular') {
            data.cell.styles.fillColor = [255, 255, 200] // Amarillo claro
          } else if (cellContent === 'mal') {
            data.cell.styles.fillColor = [255, 200, 200] // Rojo claro
          }
        }
      }
    },
    margin: { left: 15, right: 15 }
  })

  // @ts-ignore - autoTable modifica la instancia
  yPos = doc.lastAutoTable.finalY + 20

  // ==================== FIRMAS ====================
  if (yPos > 220) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorAcento[0], colorAcento[1], colorAcento[2])
  doc.text('Firmas Digitales', 15, yPos)
  doc.line(15, yPos + 2, 195, yPos + 2)
  yPos += 15

  // Firma Inspector
  if (datos.inspeccion.firma_inspector) {
    try {
      doc.addImage(datos.inspeccion.firma_inspector, 'PNG', 30, yPos, 60, 30)
    } catch (e) {
      doc.setFontSize(9)
      doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
      doc.text('Firma no disponible', 60, yPos + 15, { align: 'center' })
    }
  } else {
    doc.setFontSize(9)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.text('Firma no registrada', 60, yPos + 15, { align: 'center' })
  }
  doc.line(30, yPos + 35, 90, yPos + 35)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.text('Firma del Inspector', 60, yPos + 40, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.inspeccion.inspector, 60, yPos + 45, { align: 'center' })

  // Firma Contribuyente
  if (datos.inspeccion.firma_contribuyente) {
    try {
      doc.addImage(datos.inspeccion.firma_contribuyente, 'PNG', 120, yPos, 60, 30)
    } catch (e) {
      doc.setFontSize(9)
      doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
      doc.text('Firma no disponible', 150, yPos + 15, { align: 'center' })
    }
  } else {
    doc.setFontSize(9)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.text('Firma no registrada', 150, yPos + 15, { align: 'center' })
  }
  doc.line(120, yPos + 35, 180, yPos + 35)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.text('Firma del Contribuyente', 150, yPos + 40, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.titular.nombre, 150, yPos + 45, { align: 'center' })

  // ==================== PÁGINA DE FOTOS ====================
  // Combinar fotos generales con fotos de items
  const todasLasFotos: Array<{ tipo: string; path: string }> = [...datos.fotos]
  
  // Agregar fotos de items individuales
  datos.items.forEach(item => {
    if (item.foto_path) {
      todasLasFotos.push({
        tipo: `Evidencia: ${item.nombre}`,
        path: item.foto_path
      })
    }
  })

  if (todasLasFotos.length > 0) {
    doc.addPage()
    yPos = 20

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(colorAcento[0], colorAcento[1], colorAcento[2])
    doc.text('Evidencia Fotográfica', 15, yPos)
    doc.line(15, yPos + 2, 195, yPos + 2)
    yPos += 15

    const imgWidth = 85
    const imgHeight = 64
    const gutter = 10
    let xPos = 15
    let fotosEnFila = 0

    todasLasFotos.forEach((foto, index) => {
      // Verificar si necesita nueva página
      if (yPos + imgHeight + 15 > 270) {
        doc.addPage()
        yPos = 20
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(colorAcento[0], colorAcento[1], colorAcento[2])
        doc.text('Evidencia Fotográfica (Continuación)', 15, yPos)
        doc.line(15, yPos + 2, 195, yPos + 2)
        yPos += 15
        xPos = 15
        fotosEnFila = 0
      }

      // Dibujar borde de la foto
      doc.setDrawColor(209, 213, 219)
      doc.rect(xPos, yPos, imgWidth, imgHeight + 10)

      // Intentar agregar imagen
      let imagenAgregada = false
      
      if (foto.path) {
        try {
          // Detectar tipo de imagen
          let formato: 'PNG' | 'JPEG' | 'JPG' = 'JPEG'
          
          if (foto.path.includes('data:image/png') || foto.path.toLowerCase().endsWith('.png')) {
            formato = 'PNG'
          } else if (foto.path.includes('data:image/jpg') || foto.path.includes('data:image/jpeg')) {
            formato = 'JPEG'
          }
          
          // Intentar agregar la imagen
          if (foto.path.startsWith('data:image')) {
            // Es una imagen base64
            doc.addImage(foto.path, formato, xPos, yPos, imgWidth, imgHeight)
            imagenAgregada = true
          } else if (foto.path.startsWith('http://') || foto.path.startsWith('https://')) {
            // Es una URL - mostrar placeholder con mensaje
            doc.setFillColor(240, 240, 250)
            doc.rect(xPos, yPos, imgWidth, imgHeight, 'F')
            doc.setFontSize(8)
            doc.setTextColor(100, 100, 150)
            doc.text('Foto disponible en:', xPos + imgWidth / 2, yPos + imgHeight / 2 - 3, { align: 'center' })
            doc.setFontSize(7)
            doc.text('el sistema web', xPos + imgWidth / 2, yPos + imgHeight / 2 + 3, { align: 'center' })
            imagenAgregada = true
          } else {
            // Ruta de archivo local - placeholder
            doc.setFillColor(245, 245, 245)
            doc.rect(xPos, yPos, imgWidth, imgHeight, 'F')
            doc.setFontSize(8)
            doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
            doc.text('Foto almacenada', xPos + imgWidth / 2, yPos + imgHeight / 2 - 2, { align: 'center' })
            doc.setFontSize(7)
            const nombreArchivo = foto.path.split('/').pop()?.substring(0, 20) || 'archivo'
            doc.text(nombreArchivo, xPos + imgWidth / 2, yPos + imgHeight / 2 + 4, { align: 'center' })
            imagenAgregada = true
          }
        } catch (e) {
          console.error('Error al agregar imagen:', e)
          imagenAgregada = false
        }
      }
      
      // Si no se pudo agregar, mostrar placeholder
      if (!imagenAgregada) {
        doc.setFillColor(250, 240, 240)
        doc.rect(xPos, yPos, imgWidth, imgHeight, 'F')
        doc.setFontSize(9)
        doc.setTextColor(200, 100, 100)
        doc.text('❌', xPos + imgWidth / 2, yPos + imgHeight / 2 - 5, { align: 'center' })
        doc.setFontSize(8)
        doc.text('Foto no disponible', xPos + imgWidth / 2, yPos + imgHeight / 2 + 3, { align: 'center' })
      }

      // Título de la foto
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
      const tipoFormateado = foto.tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      doc.text(tipoFormateado, xPos + imgWidth / 2, yPos + imgHeight + 7, { align: 'center' })

      fotosEnFila++

      // Posicionar siguiente foto
      if (fotosEnFila === 2) {
        // Nueva fila
        xPos = 15
        yPos += imgHeight + 15
        fotosEnFila = 0
      } else {
        // Siguiente columna
        xPos += imgWidth + gutter
      }
    })
  }

  // Agregar footers a todas las páginas
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    agregarFooter(i, totalPages)
  }

  // Convertir a Buffer
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}
