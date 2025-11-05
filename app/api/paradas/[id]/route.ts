import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/paradas/[id]
 * Obtener una parada específica por ID (PÚBLICA)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const parada = await prisma.paradas.findUnique({
      where: { id },
      include: {
        imagenes: {
          orderBy: { orden: 'asc' },
        },
      },
    })

    if (!parada) {
      return NextResponse.json({ error: 'Parada no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...parada,
        latitud: Number(parada.latitud),
        longitud: Number(parada.longitud),
      },
    })
  } catch (error: any) {
    console.error('Error al obtener parada:', error)
    return NextResponse.json(
      { error: 'Error al obtener parada', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/paradas/[id]
 * Actualizar una parada existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { titulo, tipo, descripcion, latitud, longitud, estado, activo, metadata, imagenes } = body

    // Verificar que la parada existe
    const paradaExistente = await prisma.paradas.findUnique({
      where: { id },
    })

    if (!paradaExistente) {
      return NextResponse.json({ error: 'Parada no encontrada' }, { status: 404 })
    }

    // Preparar datos para actualizar (solo los campos que vienen)
    const dataToUpdate: any = {}

    if (titulo !== undefined) dataToUpdate.titulo = titulo
    if (tipo !== undefined) dataToUpdate.tipo = tipo
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion
    if (estado !== undefined) dataToUpdate.estado = estado
    if (activo !== undefined) dataToUpdate.activo = activo
    if (metadata !== undefined) dataToUpdate.metadata = metadata

    if (latitud !== undefined) {
      const lat = parseFloat(latitud)
      if (!isNaN(lat)) dataToUpdate.latitud = lat
    }

    if (longitud !== undefined) {
      const lng = parseFloat(longitud)
      if (!isNaN(lng)) dataToUpdate.longitud = lng
    }

    // Actualizar la parada
    const paradaActualizada = await prisma.paradas.update({
      where: { id },
      data: dataToUpdate,
      include: {
        imagenes: {
          orderBy: { orden: 'asc' },
        },
      },
    })

    // Si se envían imágenes, reemplazar todas las existentes
    if (imagenes !== undefined && Array.isArray(imagenes)) {
      // Eliminar imágenes existentes
      await prisma.paradas_imagenes.deleteMany({
        where: { parada_id: id },
      })

      // Crear nuevas imágenes
      if (imagenes.length > 0) {
        await prisma.paradas_imagenes.createMany({
          data: imagenes.map((img: any, index: number) => ({
            parada_id: id,
            imagen_base64: img.imagen_base64,
            descripcion: img.descripcion || null,
            orden: img.orden || index,
          })),
        })
      }

      // Recargar la parada con las nuevas imágenes
      const paradaConImagenes = await prisma.paradas.findUnique({
        where: { id },
        include: {
          imagenes: {
            orderBy: { orden: 'asc' },
          },
        },
      })

      if (paradaConImagenes) {
        return NextResponse.json({
          success: true,
          message: 'Parada actualizada exitosamente',
          data: {
            ...paradaConImagenes,
            latitud: Number(paradaConImagenes.latitud),
            longitud: Number(paradaConImagenes.longitud),
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Parada actualizada exitosamente',
      data: {
        ...paradaActualizada,
        latitud: Number(paradaActualizada.latitud),
        longitud: Number(paradaActualizada.longitud),
      },
    })
  } catch (error: any) {
    console.error('Error al actualizar parada:', error)
    return NextResponse.json(
      { error: 'Error al actualizar parada', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/paradas/[id]
 * Eliminar (desactivar) una parada
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Soft delete: solo desactivar
    const paradaEliminada = await prisma.paradas.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json({
      success: true,
      message: 'Parada eliminada exitosamente',
      data: {
        ...paradaEliminada,
        latitud: Number(paradaEliminada.latitud),
        longitud: Number(paradaEliminada.longitud),
      },
    })
  } catch (error: any) {
    console.error('Error al eliminar parada:', error)
    return NextResponse.json(
      { error: 'Error al eliminar parada', details: error.message },
      { status: 500 }
    )
  }
}
