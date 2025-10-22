import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DatosOblea {
  habilitacion: {
    nro_licencia: string
    tipo_transporte: string
    expte?: string
    resolucion?: string
    vigencia_inicio?: Date
    vigencia_fin?: Date
  }
  titular: {
    nombre: string
    dni: string
    domicilio?: string
  }
  vehiculo: {
    dominio: string
    marca: string
    modelo: string
    ano?: string
    chasis?: string
  }
  oblea: {
    id: number
    fecha_solicitud: Date
    hora_solicitud?: string
    estado?: string
  }
  inspector?: {
    nombre: string
    firma?: string
  }
  contribuyente?: {
    firma?: string
  }
  inspeccion?: {
    fecha: Date
    resultado: string
    fotos?: Array<{ tipo: string; path: string }>
  }
}

/**
 * Genera PDF de certificado de oblea con evidencia completa
 */
export async function generarPDFOblea(datos: DatosOblea): Promise<Buffer> {
  try {
    console.log('Generando PDF de oblea con evidencia...')
    
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Colores institucionales
    const azulMunicipal: [number, number, number] = [30, 64, 175]
    const naranjaOblea: [number, number, number] = [242, 113, 28]
    const verdeAprobado: [number, number, number] = [76, 175, 80]
    const grisTexto: [number, number, number] = [50, 50, 50]
    const grisClaro: [number, number, number] = [245, 245, 245]
    
    let yPos = 10

    // ==================== HEADER ====================
    const agregarHeader = () => {
      // Fondo azul
      doc.setFillColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
      doc.rect(0, 0, 210, 35, 'F')
      
      // Logo circular
      doc.setFillColor(255, 255, 255)
      doc.circle(20, 17.5, 8, 'F')
      doc.setDrawColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
      doc.setLineWidth(1)
      doc.circle(20, 17.5, 8)
      
      doc.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text('LANUS', 20, 18, { align: 'center' })
      
      // Título header
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.text('MUNICIPALIDAD DE LANUS', 105, 14, { align: 'center' })
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Subsecretaria de Ordenamiento Urbano', 105, 20, { align: 'center' })
      doc.text('Direccion General de Movilidad y Transporte', 105, 25, { align: 'center' })
      
      // Fecha
      doc.setFontSize(8)
      const fechaEmision = new Date(datos.oblea.fecha_solicitud)
      doc.text(`Fecha: ${fechaEmision.toLocaleDateString('es-AR')}`, 195, 30, { align: 'right' })
      
      yPos = 42
    }

    agregarHeader()

    // ==================== TÍTULO ====================
    doc.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICADO DE ENTREGA DE OBLEA', 105, yPos, { align: 'center' })
    
    yPos += 6
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Transporte ${String(datos.habilitacion.tipo_transporte)}`, 105, yPos, { align: 'center' })
    
    yPos += 10

    // ==================== DATOS DEL TITULAR ====================
    doc.setFillColor(grisClaro[0], grisClaro[1], grisClaro[2])
    doc.rect(15, yPos, 180, 25, 'F')
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.rect(15, yPos, 180, 25)
    
    yPos += 7
    doc.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DEL TITULAR:', 20, yPos)
    
    yPos += 5
    doc.setFont('helvetica', 'normal')
    doc.text(`Nombre: ${String(datos.titular.nombre)}`, 20, yPos)
    
    yPos += 5
    doc.text(`DNI: ${String(datos.titular.dni)}`, 20, yPos)
    if (datos.titular.domicilio) {
      doc.text(`Domicilio: ${String(datos.titular.domicilio).substring(0, 50)}`, 80, yPos)
    }
    
    yPos += 10

    // ==================== DATOS DEL VEHÍCULO ====================
    doc.setFillColor(grisClaro[0], grisClaro[1], grisClaro[2])
    doc.rect(15, yPos, 180, 20, 'F')
    doc.rect(15, yPos, 180, 20)
    
    yPos += 7
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DEL VEHICULO:', 20, yPos)
    
    yPos += 5
    doc.setFont('helvetica', 'normal')
    doc.text(`Dominio: ${String(datos.vehiculo.dominio)}`, 20, yPos)
    doc.text(`Marca/Modelo: ${String(datos.vehiculo.marca)} ${String(datos.vehiculo.modelo)}`, 80, yPos)
    if (datos.vehiculo.ano) {
      doc.text(`Año: ${String(datos.vehiculo.ano)}`, 150, yPos)
    }
    
    yPos += 15

    // ==================== LICENCIA DE HABILITACIÓN ====================
    doc.setFillColor(naranjaOblea[0], naranjaOblea[1], naranjaOblea[2])
    doc.roundedRect(15, yPos, 180, 35, 3, 3, 'F')
    
    yPos += 10
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('LICENCIA DE HABILITACION N°', 105, yPos, { align: 'center' })
    
    yPos += 8
    doc.setFontSize(24)
    doc.text(String(datos.habilitacion.nro_licencia), 105, yPos, { align: 'center' })
    
    yPos += 8
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    if (datos.habilitacion.vigencia_fin) {
      const vigenciaFin = new Date(datos.habilitacion.vigencia_fin)
      doc.text(`Vigencia hasta ${vigenciaFin.toLocaleDateString('es-AR')}`, 105, yPos, { align: 'center' })
    }
    
    yPos += 15

    // ==================== DATOS DE INSPECCIÓN (si existe) ====================
    if (datos.inspeccion) {
      doc.setFillColor(verdeAprobado[0], verdeAprobado[1], verdeAprobado[2])
      doc.rect(15, yPos, 180, 12, 'F')
      
      yPos += 7
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      const fechaInsp = new Date(datos.inspeccion.fecha)
      doc.text(`✓ Inspección realizada: ${fechaInsp.toLocaleDateString('es-AR')} - Resultado: ${String(datos.inspeccion.resultado)}`, 105, yPos, { align: 'center' })
      
      yPos += 12
    }

    // ==================== FIRMAS DIGITALES ====================
    doc.setFillColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    doc.roundedRect(15, yPos, 180, 8, 2, 2, 'F')
    
    yPos += 6
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('FIRMAS Y CONFORMIDAD', 105, yPos, { align: 'center' })
    
    yPos += 10

    // Cajas de firmas
    const firmaInspectorX = 50
    const firmaContribuyenteX = 155
    const firmaHeight = 35

    // Firma Inspector
    doc.setFillColor(grisClaro[0], grisClaro[1], grisClaro[2])
    doc.roundedRect(firmaInspectorX - 30, yPos, 60, firmaHeight, 2, 2, 'F')
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.3)
    doc.roundedRect(firmaInspectorX - 30, yPos, 60, firmaHeight, 2, 2, 'S')

    doc.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('INSPECTOR MUNICIPAL', firmaInspectorX, yPos + 5, { align: 'center' })

    if (datos.inspector?.firma) {
      try {
        doc.addImage(datos.inspector.firma, 'PNG', firmaInspectorX - 25, yPos + 8, 50, 15)
      } catch (e) {
        console.error('Error agregando firma inspector:', e)
        doc.setFontSize(7)
        doc.setTextColor(150, 150, 150)
        doc.text('Firma no disponible', firmaInspectorX, yPos + 15, { align: 'center' })
      }
    }

    doc.setDrawColor(100, 100, 100)
    doc.line(firmaInspectorX - 25, yPos + 25, firmaInspectorX + 25, yPos + 25)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    doc.text(String(datos.inspector?.nombre || 'Inspector Municipal'), firmaInspectorX, yPos + 29, { align: 'center' })

    // Firma Contribuyente
    doc.setFillColor(grisClaro[0], grisClaro[1], grisClaro[2])
    doc.roundedRect(firmaContribuyenteX - 30, yPos, 60, firmaHeight, 2, 2, 'F')
    doc.setDrawColor(150, 150, 150)
    doc.roundedRect(firmaContribuyenteX - 30, yPos, 60, firmaHeight, 2, 2, 'S')

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    doc.text('CONTRIBUYENTE', firmaContribuyenteX, yPos + 5, { align: 'center' })

    if (datos.contribuyente?.firma) {
      try {
        doc.addImage(datos.contribuyente.firma, 'PNG', firmaContribuyenteX - 25, yPos + 8, 50, 15)
      } catch (e) {
        console.error('Error agregando firma contribuyente:', e)
        doc.setFontSize(7)
        doc.setTextColor(150, 150, 150)
        doc.text('Firma no disponible', firmaContribuyenteX, yPos + 15, { align: 'center' })
      }
    }

    doc.setDrawColor(100, 100, 100)
    doc.line(firmaContribuyenteX - 25, yPos + 25, firmaContribuyenteX + 25, yPos + 25)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.titular.nombre), firmaContribuyenteX, yPos + 29, { align: 'center' })

    yPos += firmaHeight + 10

    // ==================== FOTOS DE EVIDENCIA ====================
    if (datos.inspeccion?.fotos && datos.inspeccion.fotos.length > 0) {
      doc.addPage()
      agregarHeader()
      yPos = 55

      doc.setFillColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
      doc.roundedRect(15, yPos - 5, 180, 8, 2, 2, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('EVIDENCIA FOTOGRÁFICA', 105, yPos, { align: 'center' })
      
      yPos += 12

      const imgWidth = 85
      const imgHeight = 64
      const gutter = 10
      let xPos = 15
      let fotosEnFila = 0

      datos.inspeccion.fotos.forEach((foto, index) => {
        if (yPos + imgHeight + 15 > 270) {
          doc.addPage()
          agregarHeader()
          yPos = 55
          xPos = 15
          fotosEnFila = 0
        }

        // Marco de foto
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(xPos, yPos, imgWidth, imgHeight + 10, 2, 2, 'F')
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.3)
        doc.roundedRect(xPos, yPos, imgWidth, imgHeight + 10, 2, 2, 'S')

        if (foto.path && foto.path.startsWith('data:image')) {
          try {
            const formato = foto.path.includes('data:image/png') ? 'PNG' : 'JPEG'
            doc.addImage(foto.path, formato, xPos, yPos, imgWidth, imgHeight)
          } catch (e) {
            console.error('Error agregando foto:', e)
            doc.setFillColor(245, 245, 245)
            doc.rect(xPos, yPos, imgWidth, imgHeight, 'F')
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text('Foto no disponible', xPos + imgWidth / 2, yPos + imgHeight / 2, { align: 'center' })
          }
        } else {
          doc.setFillColor(240, 240, 250)
          doc.rect(xPos, yPos, imgWidth, imgHeight, 'F')
          doc.setFontSize(8)
          doc.setTextColor(100, 100, 150)
          doc.text('Foto en servidor', xPos + imgWidth / 2, yPos + imgHeight / 2, { align: 'center' })
        }

        // Título de foto
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
        const tipoFormateado = String(foto.tipo).replace(/_/g, ' ').toUpperCase()
        doc.text(tipoFormateado, xPos + imgWidth / 2, yPos + imgHeight + 7, { align: 'center' })

        fotosEnFila++

        if (fotosEnFila === 2) {
          xPos = 15
          yPos += imgHeight + 15
          fotosEnFila = 0
        } else {
          xPos += imgWidth + gutter
        }
      })
    }

    // ==================== FOOTER EN TODAS LAS PÁGINAS ====================
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      
      // Línea separadora
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(15, 280, 195, 280)
      
      // Fondo amarillo de advertencia
      doc.setFillColor(255, 252, 240)
      doc.rect(15, 282, 180, 10, 'F')
      doc.setDrawColor(255, 193, 7)
      doc.setLineWidth(0.5)
      doc.rect(15, 282, 180, 10)
      
      doc.setTextColor(133, 77, 14)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text('IMPORTANTE:', 18, 287)
      doc.setFont('helvetica', 'normal')
      doc.text('La oblea debe exhibirse en lugar visible del vehículo. Documento oficial con validez legal.', 40, 287)
      
      // Info de página
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(6)
      doc.text(`Pág. ${i} de ${totalPages} | Oblea ID: ${datos.oblea.id} | Generado: ${new Date().toLocaleString('es-AR')}`, 105, 295, { align: 'center' })
    }

    // Convertir a Buffer
    const pdfOutput = doc.output('arraybuffer')
    return Buffer.from(pdfOutput)
    
  } catch (error) {
    console.error('Error generando PDF de oblea:', error)
    throw error
  }
}
