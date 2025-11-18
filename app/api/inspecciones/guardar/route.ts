import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/inspecciones/guardar
 * Guarda una inspección completa con fotos y firmas en Base64
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      habilitacion_id,
      nro_licencia,
      tipo_transporte,
      titular,
      vehiculo,
      items,
      fotos_vehiculo,
      foto_adicional,
      firma_inspector,
      firma_contribuyente,
      email_contribuyente,
      sendEmailCopy,
    } = body;

    // Validaciones básicas
    if (!habilitacion_id || !nro_licencia || !firma_inspector) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Faltan datos obligatorios',
        },
        { status: 400 }
      );
    }

    // Crear directorio para las fotos si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'inspecciones');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const inspectionFolder = `${nro_licencia}_${timestamp}`;
    const inspectionPath = path.join(uploadDir, inspectionFolder);
    await mkdir(inspectionPath, { recursive: true });

    /**
     * Función auxiliar para guardar Base64 como archivo
     */
    const saveBase64File = async (
      base64Data: string,
      filename: string
    ): Promise<string> => {
      if (!base64Data || base64Data === '') return '';

      // Extraer el contenido Base64 (remover el prefijo data:image/...)
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Formato Base64 inválido');
      }

      const base64Content = matches[2];
      const buffer = Buffer.from(base64Content, 'base64');
      const filePath = path.join(inspectionPath, filename);
      
      await writeFile(filePath, buffer);
      
      // Retornar la ruta relativa para guardar en BD
      return `/uploads/inspecciones/${inspectionFolder}/${filename}`;
    };

    // Guardar la inspección en la base de datos
    const inspeccion = await prisma.inspecciones.create({
      data: {
        habilitacion_id: parseInt(habilitacion_id),
        nro_licencia,
        nombre_inspector: 'Inspector', // TODO: Obtener del usuario autenticado
        firma_digital: firma_inspector, // Campo legacy
        tipo_transporte,
        firma_inspector,
        firma_contribuyente: firma_contribuyente || null,
        email_contribuyente: email_contribuyente || null,
        resultado: 'PENDIENTE', // Se puede calcular según los estados
      },
    });

    // Guardar los detalles de cada ítem
    for (const item of items) {
      let fotoPath = '';
      if (item.foto) {
        fotoPath = await saveBase64File(
          item.foto,
          `item_${item.id}_${timestamp}.png`
        );
      }

      await prisma.inspeccion_detalles.create({
        data: {
          inspeccion_id: inspeccion.id,
          item_id: item.id,
          nombre_item: item.nombre,
          estado: item.estado,
          observacion: item.observacion || null,
          foto_path: fotoPath || null,
        },
      });
    }

    // Guardar fotos del vehículo
    const vehiclePhotoTypes = [
      { key: 'frente', label: 'Frente' },
      { key: 'contrafrente', label: 'Contrafrente' },
      { key: 'lateral_izq', label: 'Lateral Izquierdo' },
      { key: 'lateral_der', label: 'Lateral Derecho' },
    ];

    for (const photoType of vehiclePhotoTypes) {
      const photoData = fotos_vehiculo[photoType.key];
      if (photoData && photoData !== '') {
        const fotoPath = await saveBase64File(
          photoData,
          `vehiculo_${photoType.key}_${timestamp}.png`
        );

        await prisma.inspeccion_fotos.create({
          data: {
            inspeccion_id: inspeccion.id,
            tipo_foto: photoType.label,
            item_id_original: photoType.key,
            foto_path: fotoPath,
          },
        });
      }
    }

    // Guardar foto adicional si existe
    if (foto_adicional && foto_adicional !== '') {
      const fotoPath = await saveBase64File(
        foto_adicional,
        `adicional_${timestamp}.png`
      );

      await prisma.inspeccion_fotos.create({
        data: {
          inspeccion_id: inspeccion.id,
          tipo_foto: 'Adicional',
          item_id_original: 'adicional',
          foto_path: fotoPath,
        },
      });
    }

    // TODO: Implementar envío de email si sendEmailCopy es true
    // if (sendEmailCopy && email_contribuyente) {
    //   await enviarEmailInspeccion(email_contribuyente, inspeccion);
    // }

    return NextResponse.json({
      status: 'success',
      message: 'Inspección guardada correctamente',
      data: {
        inspeccion_id: inspeccion.id,
      },
    });
  } catch (error) {
    console.error('Error al guardar inspección:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error al guardar la inspección',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
