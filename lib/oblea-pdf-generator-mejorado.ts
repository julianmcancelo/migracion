import jsPDF from 'jspdf'
import QRCode from 'qrcode'

interface DatosOblea {
  habilitacion: {
    id: number
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
 * Genera PDF de certificado de oblea con diseño MEJORADO y profesional
 */
export async function generarPDFOblea(datos: DatosOblea): Promise<Buffer> {
  try {
    console.log('🎨 Generando PDF con diseño mejorado...')

    // Generar QR
    const qrData = JSON.stringify({
      t: 'o', // oblea
      id: datos.oblea.id,
      h: datos.habilitacion.id
    })
    // URL base para redirección (ajustar según entorno si es necesario)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://credenciales.transportelanus.com.ar'
    const qrUrl = `${baseUrl}/inspector-movil/qr?data=${encodeURIComponent(qrData)}`

    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 100
    })

    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297

    // ==================== PALETA DE COLORES MEJORADA ====================
    const colores = {
      primario: [25, 118, 210] as [number, number, number],      // Azul moderno
      secundario: [255, 152, 0] as [number, number, number],     // Naranja vibrante
      exito: [76, 175, 80] as [number, number, number],          // Verde
      texto: [33, 33, 33] as [number, number, number],           // Gris oscuro
      textoClaro: [117, 117, 117] as [number, number, number],   // Gris medio
      fondoClaro: [250, 250, 250] as [number, number, number],   // Fondo gris muy claro
      fondoCard: [255, 255, 255] as [number, number, number],    // Blanco puro
      borde: [224, 224, 224] as [number, number, number],        // Borde gris suave
      acento: [233, 30, 99] as [number, number, number],         // Rosa/rojo acento
    }

    let yPos = 0

    // ==================== FUNCIÓN: AGREGAR SOMBRA ====================
    const agregarSombra = (x: number, y: number, w: number, h: number, radio = 0) => {
      // Sombra sutil (simulada con borde gris)
      doc.setFillColor(220, 220, 220)
      if (radio > 0) {
        doc.roundedRect(x + 1.5, y + 1.5, w, h, radio, radio, 'F')
      } else {
        doc.rect(x + 1.5, y + 1.5, w, h, 'F')
      }
    }

    // ==================== FUNCIÓN: CARD MODERNA ====================
    const crearCard = (x: number, y: number, w: number, h: number, conSombra = true) => {
      if (conSombra) agregarSombra(x, y, w, h, 3)

      doc.setFillColor(colores.fondoCard[0], colores.fondoCard[1], colores.fondoCard[2])
      doc.roundedRect(x, y, w, h, 3, 3, 'F')

      doc.setDrawColor(colores.borde[0], colores.borde[1], colores.borde[2])
      doc.setLineWidth(0.2)
      doc.roundedRect(x, y, w, h, 3, 3, 'S')
    }

    // ==================== HEADER MODERNO CON GRADIENTE ====================
    const agregarHeader = () => {
      // Fondo degradado azul (simulado con rectangulos)
      for (let i = 0; i < 40; i++) {
        const alpha = 1 - (i / 80)
        doc.setFillColor(
          colores.primario[0] + i * 2,
          colores.primario[1] + i * 2,
          colores.primario[2] + i * 3
        )
        doc.rect(0, i, pageWidth, 1, 'F')
      }

      // Logo moderno con círculo
      doc.setFillColor(255, 255, 255)
      doc.circle(25, 20, 12, 'F')

      // Borde del logo
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(2)
      doc.circle(25, 20, 12, 'S')

      // Texto en logo
      doc.setTextColor(colores.primario[0], colores.primario[1], colores.primario[2])
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('ML', 25, 22, { align: 'center' })

      // Título principal
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('MUNICIPALIDAD DE LANÚS', 105, 16, { align: 'center' })

      // Subtítulos
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Subsecretaría de Ordenamiento Urbano', 105, 22, { align: 'center' })

      doc.setFontSize(8)
      doc.text('Dirección General de Movilidad y Transporte', 105, 27, { align: 'center' })

      // Línea decorativa
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.line(70, 30, 140, 30)

      // Badge de fecha
      const fechaEmision = new Date(datos.oblea.fecha_solicitud)
      doc.setFillColor(230, 245, 255)
      doc.roundedRect(160, 12, 40, 10, 2, 2, 'F')

      doc.setFontSize(7)
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'normal')
      doc.text('FECHA EMISIÓN', 180, 17, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(fechaEmision.toLocaleDateString('es-AR'), 180, 20.5, { align: 'center' })

      // QR Code
      try {
        doc.addImage(qrCodeDataUrl, 'PNG', 165, 25, 25, 25)
      } catch (e) {
        console.error('Error agregando QR:', e)
      }

      yPos = 45
    }

    agregarHeader()

    // ==================== TÍTULO PRINCIPAL ====================
    doc.setFillColor(255, 248, 240)
    doc.roundedRect(15, yPos, 180, 16, 8, 8, 'F')

    doc.setTextColor(colores.primario[0], colores.primario[1], colores.primario[2])
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICADO DE OBLEA', 105, yPos + 7, { align: 'center' })

    doc.setFontSize(11)
    doc.setTextColor(colores.textoClaro[0], colores.textoClaro[1], colores.textoClaro[2])
    doc.setFont('helvetica', 'normal')
    doc.text(`Transporte ${String(datos.habilitacion.tipo_transporte).toUpperCase()}`, 105, yPos + 12, {
      align: 'center',
    })

    yPos += 22

    // ==================== DATOS DEL TITULAR (CARD) ====================
    crearCard(15, yPos, 85, 32)

    doc.setFillColor(colores.primario[0], colores.primario[1], colores.primario[2])
    doc.rect(15, yPos, 85, 8, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('👤 DATOS DEL TITULAR', 57.5, yPos + 5.5, { align: 'center' })

    yPos += 13
    doc.setTextColor(colores.texto[0], colores.texto[1], colores.texto[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Nombre:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.titular.nombre).substring(0, 30), 38, yPos)

    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('DNI:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.titular.dni), 38, yPos)

    if (datos.titular.domicilio) {
      yPos += 6
      doc.setFont('helvetica', 'bold')
      doc.text('Domicilio:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(String(datos.titular.domicilio).substring(0, 35), 38, yPos)
    }

    // ==================== DATOS DEL VEHÍCULO (CARD) ====================
    const vehiculoY = 67
    crearCard(110, vehiculoY, 85, 32)

    doc.setFillColor(colores.secundario[0], colores.secundario[1], colores.secundario[2])
    doc.rect(110, vehiculoY, 85, 8, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('🚗 DATOS DEL VEHÍCULO', 152.5, vehiculoY + 5.5, { align: 'center' })

    let vehiculoYPos = vehiculoY + 13
    doc.setTextColor(colores.texto[0], colores.texto[1], colores.texto[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Dominio:', 115, vehiculoYPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(datos.vehiculo.dominio), 135, vehiculoYPos)

    vehiculoYPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Marca:', 115, vehiculoYPos)
    doc.setFont('helvetica', 'normal')
    doc.text(`${String(datos.vehiculo.marca)} ${String(datos.vehiculo.modelo)}`.substring(0, 25), 135, vehiculoYPos)

    if (datos.vehiculo.ano) {
      vehiculoYPos += 6
      doc.setFont('helvetica', 'bold')
      doc.text('Año:', 115, vehiculoYPos)
      doc.setFont('helvetica', 'normal')
      doc.text(String(datos.vehiculo.ano), 135, vehiculoYPos)
    }

    yPos = 105

    // ==================== LICENCIA (DESTACADO) ====================
    agregarSombra(15, yPos, 180, 40, 5)

    // Fondo con gradiente
    doc.setFillColor(colores.primario[0], colores.primario[1], colores.primario[2])
    doc.roundedRect(15, yPos, 180, 40, 5, 5, 'F')

    // Borde brillante
    doc.setDrawColor(colores.secundario[0], colores.secundario[1], colores.secundario[2])
    doc.setLineWidth(1.5)
    doc.roundedRect(15, yPos, 180, 40, 5, 5, 'S')

    // Texto "LICENCIA"
    doc.setTextColor(240, 240, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('LICENCIA DE HABILITACIÓN N°', 105, yPos + 12, { align: 'center' })

    // Número de licencia (GRANDE)
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.text(String(datos.habilitacion.nro_licencia), 105, yPos + 25, { align: 'center' })

    // Vigencia
    if (datos.habilitacion.vigencia_fin) {
      const vigenciaFin = new Date(datos.habilitacion.vigencia_fin)
      doc.setFillColor(230, 240, 255)
      doc.roundedRect(65, yPos + 30, 80, 7, 3, 3, 'F')

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`⏰ Vigencia hasta ${vigenciaFin.toLocaleDateString('es-AR')}`, 105, yPos + 35, {
        align: 'center',
      })
    }

    yPos += 48

    // ==================== INSPECCIÓN (si existe) ====================
    if (datos.inspeccion) {
      crearCard(15, yPos, 180, 12, false)
      doc.setFillColor(colores.exito[0], colores.exito[1], colores.exito[2])
      doc.roundedRect(15, yPos, 180, 12, 3, 3, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      const fechaInsp = new Date(datos.inspeccion.fecha)
      doc.text(
        `✓ INSPECCIÓN APROBADA - ${fechaInsp.toLocaleDateString('es-AR')} - ${String(datos.inspeccion.resultado).toUpperCase()}`,
        105,
        yPos + 7.5,
        { align: 'center' }
      )

      yPos += 18
    }

    // ==================== FIRMAS DIGITALES (MEJORADAS) ====================
    doc.setTextColor(colores.texto[0], colores.texto[1], colores.texto[2])
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('✍️ FIRMAS Y CONFORMIDAD', 105, yPos, { align: 'center' })

    yPos += 8

    // FIRMA INSPECTOR
    crearCard(25, yPos, 70, 45)

    doc.setFillColor(colores.fondoClaro[0], colores.fondoClaro[1], colores.fondoClaro[2])
    doc.roundedRect(25, yPos, 70, 10, 2, 2, 'FD')

    doc.setTextColor(colores.primario[0], colores.primario[1], colores.primario[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('INSPECTOR MUNICIPAL', 60, yPos + 6.5, { align: 'center' })

    if (datos.inspector?.firma) {
      try {
        doc.addImage(datos.inspector.firma, 'PNG', 30, yPos + 12, 60, 20)
      } catch (e) {
        console.error('Error agregando firma inspector:', e)
        doc.setFontSize(7)
        doc.setTextColor(colores.textoClaro[0], colores.textoClaro[1], colores.textoClaro[2])
        doc.text('Firma no disponible', 60, yPos + 22, { align: 'center' })
      }
    }

    doc.setDrawColor(colores.borde[0], colores.borde[1], colores.borde[2])
    doc.setLineWidth(0.5)
    doc.line(30, yPos + 35, 90, yPos + 35)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colores.texto[0], colores.texto[1], colores.texto[2])
    doc.text(String(datos.inspector?.nombre || 'Inspector Municipal'), 60, yPos + 40, {
      align: 'center',
    })

    // FIRMA CONTRIBUYENTE
    crearCard(115, yPos, 70, 45)

    doc.setFillColor(colores.fondoClaro[0], colores.fondoClaro[1], colores.fondoClaro[2])
    doc.roundedRect(115, yPos, 70, 10, 2, 2, 'FD')

    doc.setTextColor(colores.secundario[0], colores.secundario[1], colores.secundario[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('CONTRIBUYENTE', 150, yPos + 6.5, { align: 'center' })

    if (datos.contribuyente?.firma) {
      try {
        doc.addImage(datos.contribuyente.firma, 'PNG', 120, yPos + 12, 60, 20)
      } catch (e) {
        console.error('Error agregando firma contribuyente:', e)
        doc.setFontSize(7)
        doc.setTextColor(colores.textoClaro[0], colores.textoClaro[1], colores.textoClaro[2])
        doc.text('Firma no disponible', 150, yPos + 22, { align: 'center' })
      }
    }

    doc.setDrawColor(colores.borde[0], colores.borde[1], colores.borde[2])
    doc.setLineWidth(0.5)
    doc.line(120, yPos + 35, 180, yPos + 35)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colores.texto[0], colores.texto[1], colores.texto[2])
    doc.text(String(datos.titular.nombre).substring(0, 30), 150, yPos + 40, { align: 'center' })

    yPos += 50

    // ==================== FOTOS DE EVIDENCIA (PÁGINA 2) ====================
    if (datos.inspeccion?.fotos && datos.inspeccion.fotos.length > 0) {
      doc.addPage()
      agregarHeader()
      yPos = 50

      doc.setFillColor(colores.primario[0], colores.primario[1], colores.primario[2])
      doc.roundedRect(15, yPos, 180, 12, 3, 3, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('📸 EVIDENCIA FOTOGRÁFICA', 105, yPos + 8, { align: 'center' })

      yPos += 18

      const imgWidth = 85
      const imgHeight = 64
      const gutter = 10
      let xPos = 15
      let fotosEnFila = 0

      datos.inspeccion.fotos.forEach((foto, index) => {
        if (yPos + imgHeight + 20 > 260) {
          doc.addPage()
          agregarHeader()
          yPos = 55
          xPos = 15
          fotosEnFila = 0
        }

        // Card de foto con sombra
        crearCard(xPos, yPos, imgWidth, imgHeight + 12)

        if (foto.path && foto.path.startsWith('data:image')) {
          try {
            const formato = foto.path.includes('data:image/png') ? 'PNG' : 'JPEG'
            doc.addImage(foto.path, formato, xPos + 2, yPos + 2, imgWidth - 4, imgHeight - 4)
          } catch (e) {
            console.error('Error agregando foto:', e)
            doc.setFillColor(colores.fondoClaro[0], colores.fondoClaro[1], colores.fondoClaro[2])
            doc.rect(xPos + 2, yPos + 2, imgWidth - 4, imgHeight - 4, 'F')
            doc.setFontSize(8)
            doc.setTextColor(colores.textoClaro[0], colores.textoClaro[1], colores.textoClaro[2])
            doc.text('Foto no disponible', xPos + imgWidth / 2, yPos + imgHeight / 2, {
              align: 'center',
            })
          }
        }

        // Badge de título
        doc.setFillColor(colores.secundario[0], colores.secundario[1], colores.secundario[2])
        doc.roundedRect(xPos, yPos + imgHeight, imgWidth, 12, 0, 0, 'F')

        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        const tipoFormateado = String(foto.tipo).replace(/_/g, ' ').toUpperCase()
        doc.text(tipoFormateado, xPos + imgWidth / 2, yPos + imgHeight + 8, { align: 'center' })

        fotosEnFila++

        if (fotosEnFila === 2) {
          xPos = 15
          yPos += imgHeight + 20
          fotosEnFila = 0
        } else {
          xPos += imgWidth + gutter
        }
      })
    }

    // ==================== FOOTER PROFESIONAL ====================
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)

      // Línea decorativa
      doc.setDrawColor(colores.borde[0], colores.borde[1], colores.borde[2])
      doc.setLineWidth(0.3)
      doc.line(15, 275, 195, 275)

      // Badge de advertencia
      crearCard(15, 277, 180, 12, false)
      doc.setFillColor(255, 243, 224)
      doc.roundedRect(15, 277, 180, 12, 3, 3, 'F')
      doc.setDrawColor(255, 152, 0)
      doc.setLineWidth(0.5)
      doc.roundedRect(15, 277, 180, 12, 3, 3, 'S')

      doc.setTextColor(230, 81, 0)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text('⚠️ IMPORTANTE:', 20, 283)
      doc.setFont('helvetica', 'normal')
      doc.text(
        'Este documento posee validez legal. La oblea debe exhibirse en lugar visible del vehículo.',
        52,
        283
      )

      // Info de página moderna
      doc.setTextColor(colores.textoClaro[0], colores.textoClaro[1], colores.textoClaro[2])
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Página ${i} de ${totalPages} • Oblea #${datos.oblea.id} • ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`,
        105,
        293,
        { align: 'center' }
      )
    }

    // Convertir a Buffer
    const pdfOutput = doc.output('arraybuffer')
    return Buffer.from(pdfOutput)
  } catch (error) {
    console.error('❌ Error generando PDF mejorado:', error)
    throw error
  }
}
