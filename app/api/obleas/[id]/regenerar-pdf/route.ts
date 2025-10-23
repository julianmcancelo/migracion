import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/obleas/[id]/regenerar-pdf
 * Regenera el PDF de una oblea específica del historial
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const obleaId = parseInt(params.id)

    if (isNaN(obleaId)) {
      return NextResponse.json({ success: false, error: 'ID de oblea inválido' }, { status: 400 })
    }

    // Obtener la oblea con toda su información relacionada
    const oblea = await prisma.oblea_historial.findUnique({
      where: { id: obleaId },
      include: {
        habilitaciones_generales: {
          include: {
            habilitaciones_personas: {
              where: { rol: 'TITULAR' },
              include: {
                persona: true,
              },
              take: 1,
            },
            habilitaciones_vehiculos: {
              include: {
                vehiculo: true,
              },
              take: 1,
            },
          },
        },
      },
    })

    if (!oblea) {
      return NextResponse.json({ success: false, error: 'Oblea no encontrada' }, { status: 404 })
    }

    const habilitacion = oblea.habilitaciones_generales
    const titular = habilitacion?.habilitaciones_personas[0]?.persona
    const vehiculo = habilitacion?.habilitaciones_vehiculos[0]?.vehiculo

    if (!habilitacion || !titular || !vehiculo) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos para generar PDF' },
        { status: 400 }
      )
    }

    // Construir la URL para generar el PDF
    // Esto abrirá la página de generación de certificado
    const pdfUrl = `/api/habilitaciones/${habilitacion.id}/generar-oblea-pdf?oblea_id=${obleaId}`

    return NextResponse.json({
      success: true,
      pdfUrl,
      message: 'PDF listo para generar',
    })
  } catch (error: any) {
    console.error('Error al regenerar PDF:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al regenerar PDF',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
