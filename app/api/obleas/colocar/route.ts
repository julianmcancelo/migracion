import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

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

    // Crear directorio para las fotos
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'obleas');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const obleaFolder = `${nro_licencia}_${timestamp}`;
    const obleaPath = path.join(uploadDir, obleaFolder);
    await mkdir(obleaPath, { recursive: true });

    // Función para guardar Base64
    const saveBase64File = async (
      base64Data: string,
      filename: string
    ): Promise<string> => {
      if (!base64Data || base64Data === '') return '';

      const matches = base64Data.match(/^data:([A-Za-z-+\\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Formato Base64 inválido');
      }

      const base64Content = matches[2];
      const buffer = Buffer.from(base64Content, 'base64');
      const filePath = path.join(obleaPath, filename);

      await writeFile(filePath, buffer);

      return `/uploads/obleas/${obleaFolder}/${filename}`;
    };

    // Guardar archivos
    const pathFoto = await saveBase64File(foto_oblea, `oblea_${timestamp}.png`);
    const pathFirmaReceptor = firma_receptor
      ? await saveBase64File(firma_receptor, `firma_receptor_${timestamp}.png`)
      : '';
    const pathFirmaInspector = firma_inspector
      ? await saveBase64File(firma_inspector, `firma_inspector_${timestamp}.png`)
      : '';

    // Guardar en la base de datos
    const oblea = await prisma.obleas.create({
      data: {
        habilitacion_id: parseInt(habilitacion_id),
        nro_licencia,
        titular,
        fecha_colocacion: new Date(),
        path_foto: pathFoto,
        path_firma_receptor: pathFirmaReceptor,
        path_firma_inspector: pathFirmaInspector,
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
