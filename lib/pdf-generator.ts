import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DatosInspeccion {
  inspeccion: {
    id: number
    fecha: Date
    inspector: string
    nro_licencia: string
    nro_expediente?: string
    tipo_habilitacion?: string
    tipo_transporte: string | null
    resultado: string | null
    firma_inspector: string
    firma_contribuyente: string | null
  }
  titular: {
    nombre: string
    dni?: string
    domicilio?: string
  }
  conductor?: {
    nombre: string
    dni?: string
  }
  vehiculo: {
    dominio: string
    marca: string
    modelo: string
    ano: string
    chasis: string
    inscripcion_inicial?: string
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
  
  // Colores del diseño - Estilo certificado oficial
  const colorPrimario: [number, number, number] = [139, 35, 50] // Rojo bordó institucional
  const colorSecundario: [number, number, number] = [76, 175, 80] // Verde para aprobado
  const colorTexto: [number, number, number] = [0, 0, 0] // Negro
  const colorMutado: [number, number, number] = [100, 100, 100] // Gris medio
  const colorBorde: [number, number, number] = [0, 0, 0] // Negro
  const colorFondo: [number, number, number] = [245, 245, 245] // Gris muy claro

  let yPos = 15

  // ==================== HEADER ====================
  const agregarHeader = () => {
    // Fondo rojo bordó del header
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.roundedRect(10, 10, 190, 25, 3, 3, 'F')
    
    // Logo placeholder - texto "Lanús"
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('Lanus', 15, 20)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('PARTIDO', 15, 24)
    
    // Subsecretaria
    doc.setFontSize(7)
    doc.text('Subsecretaria de Ordenamiento Urbano', 15, 28.5)
    doc.text('Direccion Gral. de Movilidad y Transporte', 15, 31.5)

    // Titulo principal centrado
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICADO DE VERIFICACION VEHICULAR', 105, 22, { align: 'center' })
    
    // Fecha y hora en la esquina derecha
    const fecha = new Date(datos.inspeccion.fecha)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Fecha: ${fecha.toLocaleDateString('es-AR')}`, 195, 20, { align: 'right' })
    doc.text(`Hora: ${fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`, 195, 24, { align: 'right' })

    yPos = 42
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

  // ==================== INFO PRINCIPAL ====================
  yPos += 3
  
  // Línea superior
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  
  // Primera fila: Expediente y Licencia
  doc.text('Expediente N°:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.inspeccion.nro_expediente || 'S/N', 45, yPos)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Licencia N°:', 110, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.inspeccion.nro_licencia, 140, yPos)
  
  yPos += 6
  
  // Segunda fila: Tipo de Habilitacion y Transporte
  doc.setFont('helvetica', 'bold')
  doc.text('Tipo de Habilitacion:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.inspeccion.tipo_habilitacion || 'Inicial', 50, yPos)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Transporte:', 110, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.inspeccion.tipo_transporte || 'Escolar', 135, yPos)
  
  yPos += 8

  // ==================== TITULAR ====================
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.text('Titular', 15, yPos)
  yPos += 5
  
  doc.setFontSize(9)
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.text('Nombre:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.titular.nombre, 35, yPos)
  yPos += 5
  
  doc.setFont('helvetica', 'bold')
  doc.text('DNI:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.titular.dni || '---', 27, yPos)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Domicilio:', 70, yPos)
  doc.setFont('helvetica', 'normal')
  const domicilio = datos.titular.domicilio || 'No especificado'
  doc.text(domicilio.substring(0, 40), 93, yPos)
  yPos += 8

  // ==================== CONDUCTOR ====================
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.text('Conductor', 110, yPos - 13)
  
  doc.setFontSize(9)
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.text('Nombre:', 110, yPos - 8)
  doc.setFont('helvetica', 'normal')
  const nombreConductor = datos.conductor?.nombre || 'No especificado'
  doc.text(nombreConductor.substring(0, 30), 130, yPos - 8)
  
  doc.setFont('helvetica', 'bold')
  doc.text('DNI:', 110, yPos - 3)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.conductor?.dni || 'S/D', 122, yPos - 3)
  
  // ==================== VEHÍCULO ====================
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.text('Vehiculo', 15, yPos)
  yPos += 5
  
  doc.setFontSize(9)
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.text('Dominio:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.vehiculo.dominio, 36, yPos)
  yPos += 5
  
  doc.setFont('helvetica', 'bold')
  doc.text('Marca:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.vehiculo.marca, 31, yPos)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Modelo:', 90, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.vehiculo.modelo, 110, yPos)
  yPos += 5
  
  doc.setFont('helvetica', 'bold')
  doc.text('Inscripcion Inicial:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.vehiculo.inscripcion_inicial || 'No registrada', 50, yPos)
  yPos += 10

  // ==================== TITULO DE TABLA ====================
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.text('DETALLES Y OBSERVACIONES DEL VEHICULO', 105, yPos, { align: 'center' })
  yPos += 6

  // ==================== TABLA DE ITEMS ====================
  // Preparar datos para la tabla estilo certificado
  const tableData: any[] = []
  
  datos.items.forEach(item => {
    const estado = item.estado.toUpperCase()
    tableData.push([
      item.nombre.replace(/_/g, ' '),
      estado === 'BIEN' ? 'X' : '',
      estado === 'REGULAR' ? 'X' : '',
      estado === 'MAL' ? 'X' : '',
      item.observacion || ''
    ])
  })

  autoTable(doc, {
    startY: yPos,
    head: [['Descripcion', 'Bien', 'Regular', 'Mal', 'Observaciones']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      fontSize: 7,
      textColor: colorTexto,
      cellPadding: 2,
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 75, halign: 'left' },
      1: { cellWidth: 15, halign: 'center', fillColor: [255, 230, 230] },
      2: { cellWidth: 15, halign: 'center', fillColor: [255, 255, 230] },
      3: { cellWidth: 15, halign: 'center', fillColor: [255, 230, 230] },
      4: { cellWidth: 60, halign: 'left' }
    },
    margin: { left: 15, right: 15 }
  })

  // @ts-ignore - autoTable modifica la instancia
  yPos = doc.lastAutoTable.finalY + 12

  // ==================== FIRMAS ====================
  if (yPos > 235) {
    doc.addPage()
    agregarHeader()
    yPos = 52
  }

  // Título de sección
  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.roundedRect(15, yPos - 2, 180, 8, 2, 2, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('FIRMAS DIGITALES', 20, yPos + 3)
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  yPos += 12
  
  // Cajas para las firmas (más compactas)
  // Caja Inspector
  doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2])
  doc.roundedRect(20, yPos - 3, 75, 40, 3, 3, 'F')
  doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2])
  doc.setLineWidth(0.3)
  doc.roundedRect(20, yPos - 3, 75, 40, 3, 3, 'S')
  
  // Caja Contribuyente
  doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2])
  doc.roundedRect(115, yPos - 3, 75, 40, 3, 3, 'F')
  doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2])
  doc.roundedRect(115, yPos - 3, 75, 40, 3, 3, 'S')

  // Firma Inspector
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.text('INSPECTOR', 57.5, yPos + 2, { align: 'center' })
  
  if (datos.inspeccion.firma_inspector) {
    try {
      doc.addImage(datos.inspeccion.firma_inspector, 'PNG', 30, yPos + 5, 55, 18)
    } catch (e) {
      doc.setFontSize(7)
      doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
      doc.text('Firma no disponible', 57.5, yPos + 15, { align: 'center' })
    }
  } else {
    doc.setFontSize(7)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.text('Firma no registrada', 57.5, yPos + 15, { align: 'center' })
  }
  
  doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.setLineWidth(0.4)
  doc.line(30, yPos + 25, 85, yPos + 25)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.text(datos.inspeccion.inspector, 57.5, yPos + 29, { align: 'center' })
  doc.setFontSize(6.5)
  doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
  doc.text('Inspector Municipal', 57.5, yPos + 33, { align: 'center' })

  // Firma Contribuyente
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.text('CONTRIBUYENTE', 152.5, yPos + 2, { align: 'center' })
  
  if (datos.inspeccion.firma_contribuyente) {
    try {
      doc.addImage(datos.inspeccion.firma_contribuyente, 'PNG', 125, yPos + 5, 55, 18)
    } catch (e) {
      doc.setFontSize(7)
      doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
      doc.text('Firma no disponible', 152.5, yPos + 15, { align: 'center' })
    }
  } else {
    doc.setFontSize(7)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.text('Firma no registrada', 152.5, yPos + 15, { align: 'center' })
  }
  
  doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.setLineWidth(0.4)
  doc.line(125, yPos + 25, 180, yPos + 25)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.text(datos.titular.nombre, 152.5, yPos + 29, { align: 'center' })
  doc.setFontSize(6.5)
  doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
  doc.text('Titular del Vehiculo', 152.5, yPos + 33, { align: 'center' })

  yPos += 38

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
