import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const habilitacionId = parseInt(params.id)
    if (isNaN(habilitacionId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Obtener habilitación completa con relaciones
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId },
      include: {
        habilitaciones_personas: {
          include: {
            persona: true,
          },
        },
        habilitaciones_vehiculos: {
          include: {
            vehiculo: true,
          },
        },
        habilitaciones_establecimientos: {
          include: {
            establecimiento: true,
            remiseria: true,
          },
        },
        inspecciones: {
          include: {
            inspeccion_detalles: true,
            inspeccion_fotos: true,
          },
          orderBy: {
            fecha_inspeccion: 'desc',
          },
          take: 1, // Solo la última inspección
        },
      },
    })

    if (!habilitacion) {
      return NextResponse.json(
        { error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Generar PDF
    const pdfBuffer = await generarPDF(habilitacion)

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Habilitacion-${habilitacion.nro_licencia || habilitacion.id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error al generar PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar PDF' },
      { status: 500 }
    )
  }
}

async function generarPDF(habilitacion: any): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Colores y estilos
  const colors = {
    primary: [41, 128, 185],
    text: [0, 0, 0],
    gray: [150, 150, 150],
    border: [200, 200, 200],
    success: [39, 174, 96],
    warning: [241, 196, 15],
  }

  const estado = habilitacion.estado || 'PENDIENTE'
  const estadoColor = {
    HABILITADO: colors.success,
    PENDIENTE: colors.warning,
    VENCIDO: [231, 76, 60],
    RECHAZADO: [231, 76, 60],
  }[estado] || colors.gray

  // Marca de agua (si está habilitado)
  if (estado === 'HABILITADO') {
    doc.setFontSize(110)
    doc.setTextColor(230, 230, 230)
    doc.setFont('helvetica', 'bold')
    doc.text('HABILITADO', 105, 150, {
      align: 'center',
      angle: 45,
    })
  }

  // --- HEADER ---
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('Certificado de Habilitación', 15, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2])
  doc.text(
    'Municipalidad de Lanús - Dirección General de Movilidad y Transporte',
    15,
    27
  )

  // Línea separadora
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
  doc.setLineWidth(0.5)
  doc.line(15, 32, 195, 32)

  // --- DATOS GENERALES ---
  let yPos = 42

  doc.setFontSize(12)
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
  doc.setFont('helvetica', 'bold')
  doc.text('Datos Generales', 15, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Columna izquierda
  const addField = (label: string, value: string, x: number, y: number) => {
    doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2])
    doc.text(label, x, y)
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFont('helvetica', 'bold')
    doc.text(value || 'N/A', x + 35, y)
    doc.setFont('helvetica', 'normal')
  }

  addField('N° de Licencia:', habilitacion.nro_licencia || 'S/N', 15, yPos)
  addField('Expediente:', habilitacion.expte || 'S/N', 110, yPos)
  yPos += 7

  addField('Resolución:', habilitacion.resolucion || 'S/N', 15, yPos)
  addField('Año:', habilitacion.anio?.toString() || 'N/A', 110, yPos)
  yPos += 7

  addField(
    'Vigencia Inicio:',
    habilitacion.vigencia_inicio
      ? new Date(habilitacion.vigencia_inicio).toLocaleDateString('es-AR')
      : 'N/A',
    15,
    yPos
  )
  addField(
    'Vigencia Fin:',
    habilitacion.vigencia_fin
      ? new Date(habilitacion.vigencia_fin).toLocaleDateString('es-AR')
      : 'N/A',
    110,
    yPos
  )
  yPos += 7

  addField(
    'Tipo Transporte:',
    habilitacion.tipo_transporte || 'N/A',
    15,
    yPos
  )
  yPos += 10

  // --- ESTADO ---
  doc.setFillColor(
    estadoColor[0] as number,
    estadoColor[1] as number,
    estadoColor[2] as number
  )
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.rect(15, yPos - 5, 180, 12, 'F')
  doc.text(estado.toUpperCase(), 105, yPos + 2, { align: 'center' })
  yPos += 15

  // --- PERSONAS ---
  if (
    habilitacion.habilitaciones_personas &&
    habilitacion.habilitaciones_personas.length > 0
  ) {
    doc.setFontSize(12)
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFont('helvetica', 'bold')
    doc.text('Personas Autorizadas', 15, yPos)
    yPos += 8

    // Tabla de personas
    const personasData = habilitacion.habilitaciones_personas.map(
      (hp: any) => [
        hp.rol || 'N/A',
        `${hp.persona.apellido}, ${hp.persona.nombre}`,
        hp.persona.dni || 'N/A',
      ]
    )

    ;(doc as any).autoTable({
      startY: yPos,
      head: [['Rol', 'Nombre Completo', 'DNI']],
      body: personasData,
      theme: 'grid',
      headStyles: {
        fillColor: colors.primary,
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { left: 15, right: 15 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // --- VEHÍCULOS ---
  if (
    habilitacion.habilitaciones_vehiculos &&
    habilitacion.habilitaciones_vehiculos.length > 0
  ) {
    doc.setFontSize(12)
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFont('helvetica', 'bold')
    doc.text('Vehículos Habilitados', 15, yPos)
    yPos += 8

    const vehiculosData = habilitacion.habilitaciones_vehiculos.map(
      (hv: any) => [
        hv.vehiculo.dominio || 'N/A',
        hv.vehiculo.marca || 'N/A',
        hv.vehiculo.modelo || 'N/A',
        hv.vehiculo.anio?.toString() || 'N/A',
      ]
    )

    ;(doc as any).autoTable({
      startY: yPos,
      head: [['Dominio', 'Marca', 'Modelo', 'Año']],
      body: vehiculosData,
      theme: 'grid',
      headStyles: {
        fillColor: colors.primary,
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { left: 15, right: 15 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // --- ESTABLECIMIENTOS ---
  if (
    habilitacion.habilitaciones_establecimientos &&
    habilitacion.habilitaciones_establecimientos.length > 0
  ) {
    doc.setFontSize(12)
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFont('helvetica', 'bold')
    doc.text('Establecimientos', 15, yPos)
    yPos += 8

    const establecimientosData =
      habilitacion.habilitaciones_establecimientos.map((he: any) => {
        const est = he.establecimiento || he.remiseria
        return [
          he.tipo || 'N/A',
          est?.nombre || 'N/A',
          est?.domicilio || 'N/A',
          est?.localidad || 'N/A',
        ]
      })

    ;(doc as any).autoTable({
      startY: yPos,
      head: [['Tipo', 'Nombre', 'Domicilio', 'Localidad']],
      body: establecimientosData,
      theme: 'grid',
      headStyles: {
        fillColor: colors.primary,
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { left: 15, right: 15 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // --- OBSERVACIONES ---
  if (habilitacion.observaciones) {
    doc.setFontSize(12)
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFont('helvetica', 'bold')
    doc.text('Observaciones', 15, yPos)
    yPos += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2])
    const splitObs = doc.splitTextToSize(habilitacion.observaciones, 180)
    doc.text(splitObs, 15, yPos)
  }

  // --- FOOTER ---
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2])
    doc.setFont('helvetica', 'italic')
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      287,
      { align: 'center' }
    )
    doc.text(
      `Generado el ${new Date().toLocaleString('es-AR')}`,
      105,
      292,
      { align: 'center' }
    )
  }

  // Convertir a Buffer
  const pdfArrayBuffer = doc.output('arraybuffer')
  return Buffer.from(pdfArrayBuffer)
}
