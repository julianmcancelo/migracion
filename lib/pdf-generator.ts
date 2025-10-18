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
  
  // Colores del diseño - Paleta profesional municipal
  const colorPrimario: [number, number, number] = [37, 99, 235] // Azul institucional
  const colorSecundario: [number, number, number] = [16, 185, 129] // Verde éxito
  const colorTexto: [number, number, number] = [31, 41, 55] // Gris oscuro
  const colorMutado: [number, number, number] = [107, 114, 128] // Gris medio
  const colorFondo: [number, number, number] = [249, 250, 251] // Gris muy claro
  const colorBorde: [number, number, number] = [229, 231, 235] // Gris claro

  let yPos = 15

  // ==================== HEADER ====================
  const agregarHeader = () => {
    // Fondo del header con gradiente simulado
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.rect(0, 0, 210, 40, 'F')
    
    // Franja decorativa inferior con patrón
    doc.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2])
    doc.rect(0, 40, 210, 3, 'F')
    
    // Líneas decorativas blancas
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.5)
    doc.line(15, 38, 195, 38)

    // Marca de agua
    doc.setFontSize(80)
    doc.setTextColor(245, 245, 250)
    doc.text('LANÚS', 105, 160, {
      align: 'center',
      angle: 45
    })

    // Título principal
    doc.setFontSize(22)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORME DE INSPECCIÓN VEHICULAR', 105, 16, { align: 'center' })

    // Subtítulo
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Municipalidad de Lanús', 105, 24, { align: 'center' })
    doc.setFontSize(8.5)
    doc.text('Dirección General de Movilidad y Transporte', 105, 30, { align: 'center' })
    
    // Info de inspección en header
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text(`Inspeccion N° ${datos.inspeccion.id}`, 195, 36, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(new Date(datos.inspeccion.fecha).toLocaleDateString('es-AR'), 195, 39.5, { align: 'right' })

    yPos = 52
  }

  // ==================== FOOTER ====================
  const agregarFooter = (pageNum: number, totalPages: number) => {
    // Línea decorativa
    doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2])
    doc.setLineWidth(0.5)
    doc.line(15, 278, 195, 278)
    
    // Fondo del footer
    doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2])
    doc.rect(0, 280, 210, 17, 'F')
    
    // Texto del footer
    doc.setFontSize(7)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.setFont('helvetica', 'normal')
    doc.text('Este documento es un informe oficial del Sistema de Habilitaciones de Transporte', 105, 285, { align: 'center' })
    doc.text('Municipalidad de Lanús - Argentina', 105, 289, { align: 'center' })
    
    // Número de página
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(`${pageNum}`, 195, 285, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(`de ${totalPages}`, 195, 289, { align: 'right' })
  }

  // Agregar primera página
  agregarHeader()

  // ==================== DATOS PRINCIPALES ====================
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])

  // Sección con fondo y sombra
  doc.setFillColor(210, 210, 210)
  doc.roundedRect(16, yPos - 4, 180, 65, 3, 3, 'F')
  
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(15, yPos - 5, 180, 65, 3, 3, 'F')
  
  // Borde decorativo
  doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.setLineWidth(0.5)
  doc.roundedRect(15, yPos - 5, 180, 65, 3, 3, 'S')
  
  // Línea divisoria vertical
  doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2])
  doc.setLineWidth(0.3)
  doc.line(105, yPos - 3, 105, yPos + 58)

  // Columna Izquierda - Datos de Inspección
  let yLeft = yPos
  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.roundedRect(18, yLeft - 3, 80, 6, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('DATOS DE LA INSPECCION', 22, yLeft + 1)
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  yLeft += 9

  doc.setFont('helvetica', 'normal')
  const datosInspeccion = [
    [`N° Inspección:`, datos.inspeccion.id.toString()],
    [`N° Licencia:`, datos.inspeccion.nro_licencia],
    [`Tipo Transporte:`, datos.inspeccion.tipo_transporte || 'N/A'],
    [`Fecha:`, new Date(datos.inspeccion.fecha).toLocaleString('es-AR')],
    [`Inspector:`, datos.inspeccion.inspector]
  ]

  datosInspeccion.forEach(([label, value], index) => {
    // Bullet point decorativo
    doc.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2])
    doc.circle(20, yLeft - 1, 1, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.text(label, 24, yLeft)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
    doc.text(value, 60, yLeft)
    yLeft += 5.5
  })

  // Columna Derecha - Datos del Vehículo
  let yRight = yPos
  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.roundedRect(108, yRight - 3, 80, 6, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('DATOS DEL VEHICULO', 112, yRight + 1)
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  yRight += 9

  doc.setFont('helvetica', 'normal')
  const datosVehiculo = [
    [`Titular:`, datos.titular.nombre],
    [`DNI:`, datos.titular.dni || 'N/A'],
    [`Dominio:`, datos.vehiculo.dominio],
    [`Vehículo:`, `${datos.vehiculo.marca} ${datos.vehiculo.modelo}`],
    [`Año:`, datos.vehiculo.ano],
    [`Chasis:`, datos.vehiculo.chasis]
  ]

  datosVehiculo.forEach(([label, value], index) => {
    // Bullet point decorativo
    doc.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2])
    doc.circle(110, yRight - 1, 1, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.text(label, 114, yRight)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
    // Recortar texto largo
    const maxWidth = 65
    const lines = doc.splitTextToSize(value, maxWidth)
    doc.text(lines[0], 140, yRight)
    yRight += 5.5
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

  // Cuadro de veredicto con diseño mejorado
  // Sombra
  doc.setFillColor(190, 190, 190)
  doc.roundedRect(16.5, yPos + 1.5, 180, 20, 5, 5, 'F')
  
  // Cuadro principal con gradiente simulado
  doc.setFillColor(veredictoColor[0] - 10, veredictoColor[1] - 10, veredictoColor[2] - 10)
  doc.roundedRect(15, yPos, 180, 20, 5, 5, 'F')
  doc.setFillColor(veredictoColor[0], veredictoColor[1], veredictoColor[2])
  doc.roundedRect(15, yPos, 180, 17, 5, 5, 'F')
  
  // Borde decorativo
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(1)
  doc.roundedRect(17, yPos + 2, 176, 13, 4, 4, 'S')
  
  // Icono según veredicto
  let icono = '✓'
  if (veredicto === 'RECHAZADA') icono = '✗'
  if (veredicto === 'CONDICIONAL') icono = '⚠'
  
  // Círculo para el icono
  doc.setFillColor(255, 255, 255)
  doc.circle(28, yPos + 10, 4.5, 'F')
  doc.setTextColor(veredictoColor[0], veredictoColor[1], veredictoColor[2])
  doc.setFontSize(16)
  doc.text(icono, 28, yPos + 12.5, { align: 'center' })
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text(`VEREDICTO FINAL: ${veredicto}`, 105, yPos + 12, { align: 'center' })
  
  // Estadísticas pequeñas
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(`Items mal: ${malCount} | Items regular: ${regularCount}`, 105, yPos + 17, { align: 'center' })
  
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  yPos += 30

  // ==================== TABLA DE ITEMS ====================
  // Título de sección
  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.roundedRect(15, yPos - 2, 180, 8, 2, 2, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('DETALLE DE LA VERIFICACION', 20, yPos + 3)
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  yPos += 12

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
    theme: 'striped',
    headStyles: {
      fillColor: colorPrimario,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: colorTexto,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    columnStyles: {
      0: { cellWidth: 80, halign: 'left', fontStyle: 'normal' },
      1: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
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
    agregarHeader()
    yPos = 60
  }

  // Título de sección
  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.roundedRect(15, yPos - 2, 180, 8, 2, 2, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('FIRMAS DIGITALES', 20, yPos + 3)
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  yPos += 18
  
  // Cajas para las firmas
  // Caja Inspector
  doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2])
  doc.roundedRect(20, yPos - 3, 75, 50, 3, 3, 'F')
  doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2])
  doc.setLineWidth(0.3)
  doc.roundedRect(20, yPos - 3, 75, 50, 3, 3, 'S')
  
  // Caja Contribuyente
  doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2])
  doc.roundedRect(115, yPos - 3, 75, 50, 3, 3, 'F')
  doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2])
  doc.roundedRect(115, yPos - 3, 75, 50, 3, 3, 'S')

  // Firma Inspector
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.text('INSPECTOR', 57.5, yPos + 2, { align: 'center' })
  
  if (datos.inspeccion.firma_inspector) {
    try {
      doc.addImage(datos.inspeccion.firma_inspector, 'PNG', 27, yPos + 5, 60, 25)
    } catch (e) {
      doc.setFontSize(8)
      doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
      doc.text('Firma no disponible', 57.5, yPos + 18, { align: 'center' })
    }
  } else {
    doc.setFontSize(8)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.text('Firma no registrada', 57.5, yPos + 18, { align: 'center' })
  }
  
  doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.setLineWidth(0.5)
  doc.line(27, yPos + 32, 88, yPos + 32)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.text(datos.inspeccion.inspector, 57.5, yPos + 37, { align: 'center' })
  doc.setFontSize(7)
  doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
  doc.text('Inspector Municipal', 57.5, yPos + 41, { align: 'center' })

  // Firma Contribuyente
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.text('CONTRIBUYENTE', 152.5, yPos + 2, { align: 'center' })
  
  if (datos.inspeccion.firma_contribuyente) {
    try {
      doc.addImage(datos.inspeccion.firma_contribuyente, 'PNG', 122, yPos + 5, 60, 25)
    } catch (e) {
      doc.setFontSize(8)
      doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
      doc.text('Firma no disponible', 152.5, yPos + 18, { align: 'center' })
    }
  } else {
    doc.setFontSize(8)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.text('Firma no registrada', 152.5, yPos + 18, { align: 'center' })
  }
  
  doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.setLineWidth(0.5)
  doc.line(122, yPos + 32, 183, yPos + 32)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.text(datos.titular.nombre, 152.5, yPos + 37, { align: 'center' })
  doc.setFontSize(7)
  doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
  doc.text('Titular del Vehiculo', 152.5, yPos + 41, { align: 'center' })

  yPos += 50

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
    agregarHeader()
    yPos = 60

    // Título de sección
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.roundedRect(15, yPos - 2, 180, 8, 2, 2, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('EVIDENCIA FOTOGRAFICA', 20, yPos + 3)
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
    yPos += 15

    const imgWidth = 85
    const imgHeight = 64
    const gutter = 10
    let xPos = 15
    let fotosEnFila = 0

    todasLasFotos.forEach((foto, index) => {
      // Verificar si necesita nueva página
      if (yPos + imgHeight + 15 > 265) {
        doc.addPage()
        agregarHeader()
        yPos = 60
        doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
        doc.roundedRect(15, yPos - 2, 180, 8, 2, 2, 'F')
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text('EVIDENCIA FOTOGRAFICA (Continuacion)', 20, yPos + 3)
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
        yPos += 15
        xPos = 15
        fotosEnFila = 0
      }

      // Sombra del marco
      doc.setFillColor(220, 220, 220)
      doc.roundedRect(xPos + 1, yPos + 1, imgWidth, imgHeight + 10, 2, 2, 'F')
      
      // Marco de la foto
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(xPos, yPos, imgWidth, imgHeight + 10, 2, 2, 'F')
      doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2])
      doc.setLineWidth(0.3)
      doc.roundedRect(xPos, yPos, imgWidth, imgHeight + 10, 2, 2, 'S')

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
