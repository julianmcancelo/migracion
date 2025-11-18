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
    firma_inspector: string | null
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
  try {
    console.log('Iniciando generación de PDF...')
    console.log(
      'Datos recibidos:',
      JSON.stringify({
        inspeccionId: datos.inspeccion.id,
        itemsCount: datos.items.length,
        fotosCount: datos.fotos.length,
      })
    )

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
      // Fondo rojo bordó del header (más compacto)
      doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
      doc.roundedRect(10, 8, 190, 18, 2, 2, 'F')

      // Logo placeholder - texto "Lanús"
      doc.setFontSize(11)
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.text('Lanus', 15, 15)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.text('PARTIDO', 15, 18)

      // Subsecretaria (más compacto)
      doc.setFontSize(6)
      doc.text('Subsecretaria de Ordenamiento Urbano', 15, 21)
      doc.text('Dir. Gral. de Movilidad y Transporte', 15, 24)

      // Titulo principal centrado
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('CERTIFICADO DE VERIFICACION VEHICULAR', 105, 17, { align: 'center' })

      // Fecha y hora en la esquina derecha
      let fecha: Date
      try {
        fecha = new Date(datos.inspeccion.fecha)
        if (isNaN(fecha.getTime())) {
          throw new Error('Fecha inválida')
        }
      } catch (e) {
        console.error('Error procesando fecha:', e)
        fecha = new Date()
      }

      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(`Fecha: ${fecha.toLocaleDateString('es-AR')}`, 195, 15, { align: 'right' })
      doc.text(
        `Hora: ${fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`,
        195,
        19,
        { align: 'right' }
      )

      yPos = 30
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
      doc.text(
        'Este documento es un informe oficial del Sistema de Habilitaciones de Transporte',
        105,
        285,
        { align: 'center' }
      )
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
    yPos += 4

    // Línea superior
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])

    // Primera fila: Expediente y Licencia
    doc.text('Expediente N°:', 15, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.inspeccion.nro_expediente || 'S/N'), 43, yPos)

    doc.setFont('helvetica', 'bold')
    doc.text('Licencia N°:', 115, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.inspeccion.nro_licencia), 140, yPos)

    yPos += 5

    // Segunda fila: Tipo de Habilitacion y Transporte
    doc.setFont('helvetica', 'bold')
    doc.text('Tipo Habilitacion:', 15, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.inspeccion.tipo_habilitacion || 'Inicial'), 50, yPos)

    doc.setFont('helvetica', 'bold')
    doc.text('Transporte:', 115, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.inspeccion.tipo_transporte || 'Escolar'), 138, yPos)

    yPos += 7

    // ==================== TITULAR ====================
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.text('Titular', 15, yPos)
    yPos += 4

    doc.setFontSize(8)
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
    doc.text('Nombre:', 15, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.titular.nombre).substring(0, 48), 33, yPos)
    yPos += 4

    doc.setFont('helvetica', 'bold')
    doc.text('DNI:', 15, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.titular.dni || '---'), 26, yPos)

    doc.setFont('helvetica', 'bold')
    doc.text('Domicilio:', 65, yPos)
    doc.setFont('helvetica', 'normal')
    const domicilio = String(datos.titular.domicilio || 'No especificado')
    doc.text(domicilio.substring(0, 42), 83, yPos)
    yPos += 6

    // ==================== CONDUCTOR ====================
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.text('Conductor', 115, yPos - 10)

    doc.setFontSize(8)
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
    doc.text('Nombre:', 115, yPos - 6)
    doc.setFont('helvetica', 'normal')
    const nombreConductor = String(datos.conductor?.nombre || 'No especificado')
    doc.text(nombreConductor.substring(0, 32), 133, yPos - 6)

    doc.setFont('helvetica', 'bold')
    doc.text('DNI:', 115, yPos - 2)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.conductor?.dni || 'S/D'), 126, yPos - 2)

    // ==================== VEHÍCULO ====================
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.text('Vehiculo', 15, yPos)
    yPos += 4

    doc.setFontSize(8)
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
    doc.text('Dominio:', 15, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.vehiculo.dominio), 34, yPos)

    doc.setFont('helvetica', 'bold')
    doc.text('Marca:', 75, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.vehiculo.marca), 90, yPos)

    doc.setFont('helvetica', 'bold')
    doc.text('Modelo:', 135, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.vehiculo.modelo), 152, yPos)
    yPos += 7

    // ==================== TITULO DE TABLA ====================
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.text('DETALLES Y OBSERVACIONES DEL VEHICULO', 105, yPos, { align: 'center' })
    yPos += 5

    // ==================== TABLA DE ITEMS ====================
    // Preparar datos para la tabla estilo certificado
    const tableData: any[] = []

    datos.items.forEach(item => {
      const estado = String(item.estado || '').toUpperCase()
      const nombre = String(item.nombre || 'Sin nombre')
      const observacion = String(item.observacion || '')

      tableData.push([
        nombre.replace(/_/g, ' '),
        estado === 'BIEN' ? 'X' : '',
        estado === 'REGULAR' ? 'X' : '',
        estado === 'MAL' ? 'X' : '',
        observacion,
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
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.3,
        lineColor: [0, 0, 0],
        cellPadding: 1.5,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: colorTexto,
        cellPadding: 1.5,
        lineWidth: 0.3,
        lineColor: [0, 0, 0],
        minCellHeight: 5,
      },
      columnStyles: {
        0: { cellWidth: 87, halign: 'left' },
        1: { cellWidth: 13, halign: 'center', fillColor: [255, 230, 230] },
        2: { cellWidth: 13, halign: 'center', fillColor: [255, 255, 230] },
        3: { cellWidth: 13, halign: 'center', fillColor: [255, 230, 230] },
        4: { cellWidth: 44, halign: 'left' },
      },
      margin: { left: 15, right: 15 },
    })

    //  - autoTable modifica la instancia
    yPos = doc.lastAutoTable.finalY + 5

    // ==================== FIRMAS ====================
    // Título de sección
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.roundedRect(15, yPos, 180, 7, 1, 1, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('FIRMAS DIGITALES', 20, yPos + 4.5)
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
    yPos += 9

    // Cajas para las firmas (compactas pero legibles)
    // Caja Inspector
    doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2])
    doc.roundedRect(20, yPos, 75, 28, 2, 2, 'F')
    doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2])
    doc.setLineWidth(0.3)
    doc.roundedRect(20, yPos, 75, 28, 2, 2, 'S')

    // Caja Contribuyente
    doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2])
    doc.roundedRect(115, yPos, 75, 28, 2, 2, 'F')
    doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2])
    doc.roundedRect(115, yPos, 75, 28, 2, 2, 'S')

    // Firma Inspector
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.text('INSPECTOR', 57.5, yPos + 3.5, { align: 'center' })

    if (datos.inspeccion.firma_inspector) {
      try {
        // Validar que sea Base64 válido
        if (datos.inspeccion.firma_inspector.startsWith('data:image')) {
          const sizeInKB = (datos.inspeccion.firma_inspector.length * 0.75) / 1024
          console.log(`📝 Firma inspector: ${sizeInKB.toFixed(0)}KB`)
          
          // Límite: 500KB para firmas
          if (sizeInKB < 500) {
            doc.addImage(datos.inspeccion.firma_inspector, 'JPEG', 32, yPos + 6, 50, 13)
            console.log('✅ Firma del inspector agregada')
          } else {
            throw new Error('Firma muy grande')
          }
        } else {
          throw new Error('Formato inválido')
        }
      } catch (e) {
        console.warn('⚠️ No se pudo agregar firma del inspector:', e)
        doc.setFontSize(6.5)
        doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
        doc.text('(Firma registrada)', 57, yPos + 13, { align: 'center' })
      }
    } else {
      doc.setFontSize(6.5)
      doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
      doc.text('(Sin firma)', 57, yPos + 13, { align: 'center' })
    }

    doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.setLineWidth(0.3)
    doc.line(30, yPos + 20, 85, yPos + 20)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
    doc.text(String(datos.inspeccion.inspector), 57.5, yPos + 23, { align: 'center' })
    doc.setFontSize(6)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.text('Inspector Municipal', 57.5, yPos + 26, { align: 'center' })

    // Firma Contribuyente
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.text('CONTRIBUYENTE', 152.5, yPos + 3.5, { align: 'center' })

    if (datos.inspeccion.firma_contribuyente) {
      try {
        if (datos.inspeccion.firma_contribuyente.startsWith('data:image')) {
          const sizeInKB = (datos.inspeccion.firma_contribuyente.length * 0.75) / 1024
          console.log(`📝 Firma contribuyente: ${sizeInKB.toFixed(0)}KB`)
          
          if (sizeInKB < 500) {
            doc.addImage(datos.inspeccion.firma_contribuyente, 'JPEG', 127, yPos + 6, 50, 13)
            console.log('✅ Firma del contribuyente agregada')
          } else {
            throw new Error('Firma muy grande')
          }
        } else {
          throw new Error('Formato inválido')
        }
      } catch (e) {
        console.warn('⚠️ No se pudo agregar firma del contribuyente:', e)
        doc.setFontSize(6.5)
        doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
        doc.text('(Firma registrada)', 152.5, yPos + 12, { align: 'center' })
      }
    } else {
      doc.setFontSize(6.5)
      doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
      doc.text('Firma no registrada', 152.5, yPos + 12, { align: 'center' })
    }

    doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.setLineWidth(0.3)
    doc.line(125, yPos + 20, 180, yPos + 20)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
    doc.text(String(datos.titular.nombre), 152.5, yPos + 23, { align: 'center' })
    doc.setFontSize(6)
    doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
    doc.text('Titular del Vehiculo', 152.5, yPos + 26, { align: 'center' })

    yPos += 38

    // ==================== PÁGINA DE FOTOS ====================
    // Combinar fotos generales con fotos de items
    const todasLasFotos: Array<{ tipo: string; path: string }> = [...datos.fotos]

    // Agregar fotos de items individuales
    datos.items.forEach(item => {
      if (item.foto_path) {
        todasLasFotos.push({
          tipo: `Evidencia: ${item.nombre}`,
          path: item.foto_path,
        })
      }
    })

    console.log(`📸 Total de fotos a procesar: ${todasLasFotos.length}`)
    
    // Filtrar solo fotos válidas (límite generoso de 1MB)
    const fotosValidas = todasLasFotos.filter(foto => {
      if (!foto.path || !foto.path.startsWith('data:image')) {
        console.log(`⚠️ Foto ${foto.tipo} no tiene Base64 válido`)
        return false
      }
      const sizeInKB = (foto.path.length * 0.75) / 1024
      console.log(`📊 Foto ${foto.tipo}: ${sizeInKB.toFixed(0)}KB`)
      if (sizeInKB > 1024) {
        console.log(`⚠️ Foto ${foto.tipo} muy grande (${sizeInKB.toFixed(0)}KB), omitiendo`)
        return false
      }
      return true
    })
    
    console.log(`✅ ${fotosValidas.length} fotos válidas para incluir en PDF`)
    
    if (fotosValidas.length > 0) {
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

      fotosValidas.forEach((foto, index) => {
        console.log(`📷 Procesando foto ${index + 1}/${fotosValidas.length}: ${foto.tipo}`)
        
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
            } else if (
              foto.path.includes('data:image/jpg') ||
              foto.path.includes('data:image/jpeg')
            ) {
              formato = 'JPEG'
            }

            // Intentar agregar la imagen
            if (foto.path.startsWith('data:image')) {
              // Es una imagen base64
              try {
                // Validar que el Base64 no sea demasiado grande
                const base64Length = foto.path.length
                const sizeInKB = (base64Length * 0.75) / 1024
                const sizeInMB = sizeInKB / 1024
                
                console.log(`📊 Procesando imagen ${foto.tipo}: ${sizeInKB.toFixed(0)}KB`)
                
                // Límite más estricto: 500KB por imagen
                if (sizeInKB > 500) {
                  console.warn(`⚠️ Imagen demasiado grande (${sizeInKB.toFixed(0)}KB), omitiendo...`)
                  throw new Error('Imagen demasiado grande')
                }
                
                // Intentar agregar la imagen
                doc.addImage(foto.path, formato, xPos, yPos, imgWidth, imgHeight)
                imagenAgregada = true
                console.log(`✅ Imagen agregada: ${foto.tipo} (${sizeInKB.toFixed(0)}KB)`)
              } catch (imgError) {
                console.error(`❌ Error al agregar imagen ${foto.tipo}:`, imgError)
                // Mostrar placeholder si falla
                doc.setFillColor(255, 245, 245)
                doc.rect(xPos, yPos, imgWidth, imgHeight, 'F')
                doc.setDrawColor(200, 200, 200)
                doc.setLineWidth(0.5)
                doc.rect(xPos, yPos, imgWidth, imgHeight, 'S')
                doc.setFontSize(9)
                doc.setTextColor(150, 150, 150)
                doc.text('📷', xPos + imgWidth / 2, yPos + imgHeight / 2 - 5, { align: 'center' })
                doc.setFontSize(7)
                doc.text('Imagen no disponible', xPos + imgWidth / 2, yPos + imgHeight / 2 + 2, {
                  align: 'center',
                })
                doc.setFontSize(6)
                doc.text('en este PDF', xPos + imgWidth / 2, yPos + imgHeight / 2 + 7, {
                  align: 'center',
                })
                imagenAgregada = true
              }
            } else if (foto.path.startsWith('http://') || foto.path.startsWith('https://')) {
              // Es una URL - mostrar placeholder con mensaje
              doc.setFillColor(240, 240, 250)
              doc.rect(xPos, yPos, imgWidth, imgHeight, 'F')
              doc.setFontSize(8)
              doc.setTextColor(100, 100, 150)
              doc.text('Foto disponible en:', xPos + imgWidth / 2, yPos + imgHeight / 2 - 3, {
                align: 'center',
              })
              doc.setFontSize(7)
              doc.text('el sistema web', xPos + imgWidth / 2, yPos + imgHeight / 2 + 3, {
                align: 'center',
              })
              imagenAgregada = true
            } else {
              // Ruta de archivo local - placeholder
              doc.setFillColor(245, 245, 245)
              doc.rect(xPos, yPos, imgWidth, imgHeight, 'F')
              doc.setFontSize(8)
              doc.setTextColor(colorMutado[0], colorMutado[1], colorMutado[2])
              doc.text('Foto almacenada', xPos + imgWidth / 2, yPos + imgHeight / 2 - 2, {
                align: 'center',
              })
              doc.setFontSize(7)
              const nombreArchivo = foto.path.split('/').pop()?.substring(0, 20) || 'archivo'
              doc.text(nombreArchivo, xPos + imgWidth / 2, yPos + imgHeight / 2 + 4, {
                align: 'center',
              })
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
          doc.text('Foto no disponible', xPos + imgWidth / 2, yPos + imgHeight / 2 + 3, {
            align: 'center',
          })
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
    console.log('Convirtiendo PDF a buffer...')
    const pdfOutput = doc.output('arraybuffer')
    const buffer = Buffer.from(pdfOutput)
    console.log('PDF generado exitosamente, tamaño:', buffer.length, 'bytes')
    return buffer
  } catch (error) {
    console.error('Error en generarPDFInspeccion:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }
    throw error
  }
}
