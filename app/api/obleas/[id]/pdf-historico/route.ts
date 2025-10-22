import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jsPDF from 'jspdf'

export const dynamic = 'force-dynamic'

/**
 * GET /api/obleas/[id]/pdf-historico
 * Genera PDF de oblea histórica (tabla obleas) con evidencia disponible
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: 'ID de oblea inválido' },
        { status: 400 }
      )
    }

    console.log('📄 Generando PDF de oblea histórica ID:', id)

    // Obtener oblea de tabla histórica
    const oblea = await prisma.obleas.findUnique({
      where: { id: Number(id) }
    })

    if (!oblea) {
      return NextResponse.json(
        { success: false, error: 'Oblea no encontrada' },
        { status: 404 }
      )
    }

    // Obtener habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: oblea.habilitacion_id }
    })

    if (!habilitacion) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Obtener vehículo
    const habVehiculo = await prisma.habilitaciones_vehiculos.findFirst({
      where: { habilitacion_id: habilitacion.id },
      include: { vehiculo: true }
    })

    const vehiculo = habVehiculo?.vehiculo

    // Generar PDF
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Colores
    const azulMunicipal: [number, number, number] = [30, 64, 175]
    const naranjaOblea: [number, number, number] = [242, 113, 28]
    const grisTexto: [number, number, number] = [50, 50, 50]
    
    let yPos = 10

    // ==================== HEADER ====================
    doc.setFillColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    doc.rect(0, 0, 210, 35, 'F')
    
    doc.setFillColor(255, 255, 255)
    doc.circle(20, 17.5, 8, 'F')
    doc.setDrawColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    doc.setLineWidth(1)
    doc.circle(20, 17.5, 8)
    
    doc.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text('LANUS', 20, 18, { align: 'center' })
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text('MUNICIPALIDAD DE LANUS', 105, 14, { align: 'center' })
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Subsecretaria de Ordenamiento Urbano', 105, 20, { align: 'center' })
    doc.text('Direccion General de Movilidad y Transporte', 105, 25, { align: 'center' })
    
    doc.setFontSize(8)
    const fechaEmision = new Date(oblea.fecha_colocacion)
    doc.text(`Fecha: ${fechaEmision.toLocaleDateString('es-AR')}`, 195, 30, { align: 'right' })
    
    yPos = 42

    // ==================== TÍTULO ====================
    doc.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICADO DE ENTREGA DE OBLEA', 105, yPos, { align: 'center' })
    
    yPos += 6
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Transporte ${String(habilitacion.tipo_transporte || 'N/A')}`, 105, yPos, { align: 'center' })
    
    yPos += 2
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('(Oblea histórica - Sistema anterior)', 105, yPos, { align: 'center' })
    
    yPos += 10

    // ==================== DATOS DEL TITULAR ====================
    doc.setFillColor(245, 245, 245)
    doc.rect(15, yPos, 180, 20, 'F')
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.rect(15, yPos, 180, 20)
    
    yPos += 7
    doc.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DEL TITULAR:', 20, yPos)
    
    yPos += 5
    doc.setFont('helvetica', 'normal')
    doc.text(`Nombre: ${String(oblea.titular)}`, 20, yPos)
    
    yPos += 15

    // ==================== DATOS DEL VEHÍCULO ====================
    doc.setFillColor(245, 245, 245)
    doc.rect(15, yPos, 180, 15, 'F')
    doc.rect(15, yPos, 180, 15)
    
    yPos += 7
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DEL VEHICULO:', 20, yPos)
    
    yPos += 5
    doc.setFont('helvetica', 'normal')
    if (vehiculo) {
      doc.text(`Dominio: ${String(vehiculo.dominio)}`, 20, yPos)
      doc.text(`Marca/Modelo: ${String(vehiculo.marca)} ${String(vehiculo.modelo)}`, 80, yPos)
    } else {
      doc.text('Datos del vehículo no disponibles', 20, yPos)
    }
    
    yPos += 15

    // ==================== LICENCIA ====================
    doc.setFillColor(naranjaOblea[0], naranjaOblea[1], naranjaOblea[2])
    doc.roundedRect(15, yPos, 180, 30, 3, 3, 'F')
    
    yPos += 10
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('LICENCIA DE HABILITACION N°', 105, yPos, { align: 'center' })
    
    yPos += 8
    doc.setFontSize(24)
    doc.text(String(oblea.nro_licencia), 105, yPos, { align: 'center' })
    
    yPos += 8
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    if (habilitacion.vigencia_fin) {
      const vigenciaFin = new Date(habilitacion.vigencia_fin)
      doc.text(`Vigencia hasta ${vigenciaFin.toLocaleDateString('es-AR')}`, 105, yPos, { align: 'center' })
    }
    
    yPos += 15

    // ==================== FIRMAS (si existen) ====================
    doc.setFillColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
    doc.roundedRect(15, yPos, 180, 8, 2, 2, 'F')
    
    yPos += 6
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('FIRMAS Y CONFORMIDAD', 105, yPos, { align: 'center' })
    
    yPos += 10

    const firmaInspectorX = 50
    const firmaContribuyenteX = 155
    const firmaHeight = 35

    // Firma Inspector
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(firmaInspectorX - 30, yPos, 60, firmaHeight, 2, 2, 'F')
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.3)
    doc.roundedRect(firmaInspectorX - 30, yPos, 60, firmaHeight, 2, 2, 'S')

    doc.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('INSPECTOR MUNICIPAL', firmaInspectorX, yPos + 5, { align: 'center' })

    if (oblea.path_firma_inspector && oblea.path_firma_inspector !== '') {
      try {
        doc.addImage(oblea.path_firma_inspector, 'PNG', firmaInspectorX - 25, yPos + 8, 50, 15)
      } catch (e) {
        console.error('Error agregando firma inspector:', e)
        doc.setFontSize(7)
        doc.setTextColor(150, 150, 150)
        doc.text('Firma no disponible', firmaInspectorX, yPos + 15, { align: 'center' })
      }
    } else {
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text('Sin firma registrada', firmaInspectorX, yPos + 15, { align: 'center' })
    }

    doc.setDrawColor(100, 100, 100)
    doc.line(firmaInspectorX - 25, yPos + 25, firmaInspectorX + 25, yPos + 25)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    doc.text('Inspector Municipal', firmaInspectorX, yPos + 29, { align: 'center' })

    // Firma Contribuyente
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(firmaContribuyenteX - 30, yPos, 60, firmaHeight, 2, 2, 'F')
    doc.setDrawColor(150, 150, 150)
    doc.roundedRect(firmaContribuyenteX - 30, yPos, 60, firmaHeight, 2, 2, 'S')

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2])
    doc.text('CONTRIBUYENTE', firmaContribuyenteX, yPos + 5, { align: 'center' })

    if (oblea.path_firma_receptor && oblea.path_firma_receptor !== '') {
      try {
        doc.addImage(oblea.path_firma_receptor, 'PNG', firmaContribuyenteX - 25, yPos + 8, 50, 15)
      } catch (e) {
        console.error('Error agregando firma contribuyente:', e)
        doc.setFontSize(7)
        doc.setTextColor(150, 150, 150)
        doc.text('Firma no disponible', firmaContribuyenteX, yPos + 15, { align: 'center' })
      }
    } else {
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text('Sin firma registrada', firmaContribuyenteX, yPos + 15, { align: 'center' })
    }

    doc.setDrawColor(100, 100, 100)
    doc.line(firmaContribuyenteX - 25, yPos + 25, firmaContribuyenteX + 25, yPos + 25)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(String(oblea.titular), firmaContribuyenteX, yPos + 29, { align: 'center' })

    yPos += firmaHeight + 10

    // ==================== FOTO (si existe) ====================
    if (oblea.path_foto && oblea.path_foto !== '') {
      if (yPos + 80 > 270) {
        doc.addPage()
        yPos = 20
      }

      doc.setFillColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2])
      doc.roundedRect(15, yPos, 180, 8, 2, 2, 'F')
      
      yPos += 6
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('EVIDENCIA FOTOGRÁFICA', 105, yPos, { align: 'center' })
      
      yPos += 10

      try {
        doc.addImage(oblea.path_foto, 'JPEG', 40, yPos, 130, 98)
        yPos += 100
      } catch (e) {
        console.error('Error agregando foto:', e)
        doc.setFillColor(245, 245, 245)
        doc.rect(40, yPos, 130, 98, 'F')
        doc.setFontSize(10)
        doc.setTextColor(150, 150, 150)
        doc.text('Foto no disponible', 105, yPos + 50, { align: 'center' })
        yPos += 100
      }
    }

    // ==================== FOOTER ====================
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(15, 280, 195, 280)
    
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
    
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(6)
    doc.text(`Oblea ID: ${oblea.id} | Generado: ${new Date().toLocaleString('es-AR')} | Sistema Municipal de Lanús`, 105, 295, { align: 'center' })

    // Convertir a Buffer
    const pdfOutput = doc.output('arraybuffer')
    const pdfArray = new Uint8Array(Buffer.from(pdfOutput))

    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Certificado-Oblea-${oblea.nro_licencia}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error al generar PDF de oblea histórica:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al generar PDF de oblea',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
