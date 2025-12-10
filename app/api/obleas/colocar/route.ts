import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * POST /api/obleas/colocar
 * Registra la colocación de una oblea con foto y firmas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      habilitacion_id,
      nro_licencia,
      titular,
      foto_oblea,
      firma_receptor,
      firma_inspector,
      ubicacion,
    } = body;

    // Validaciones
    if (!habilitacion_id || !nro_licencia || !titular) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Faltan datos obligatorios',
        },
        { status: 400 }
      );
    }

    if (!foto_oblea) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'La foto de la oblea es obligatoria',
        },
        { status: 400 }
      );
    }

    // Guardar en la base de datos directamente en base64 (data URL)
    const oblea = await prisma.obleas.create({
      data: {
        habilitacion_id: parseInt(habilitacion_id),
        nro_licencia,
        titular,
        fecha_colocacion: new Date(),
        // Se guardan directamente los data URL/base64 recibidos
        path_foto: foto_oblea,
        path_firma_receptor: firma_receptor || '',
        path_firma_inspector: firma_inspector || '',
      },
    });

    // Marcar la habilitación como "oblea colocada"
    await prisma.habilitaciones_generales.update({
      where: {
        id: parseInt(habilitacion_id),
      },
      data: {
        oblea_colocada: true,
      },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Oblea registrada correctamente',
      data: {
        oblea_id: oblea.id,
        fecha_colocacion: oblea.fecha_colocacion,
      },
    });
  } catch (error) {
    console.error('Error al registrar oblea:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error al registrar la oblea',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
