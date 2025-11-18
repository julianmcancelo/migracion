import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * POST /api/inspecciones/guardar
 * Guarda una inspección completa con fotos y firmas en Base64
 * Compatible con Vercel (serverless) - guarda imágenes en Base64 en la BD
 * 
 * Nota: El límite de body en Vercel es 4.5MB por defecto.
 * Las imágenes se comprimen en el cliente antes de enviar.
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

    console.log('💾 Guardando inspección para habilitación:', habilitacion_id);

    // Calcular resultado automático basado en los estados
    const itemsMalos = items.filter((i: any) => i.estado === 'mal').length;
    const itemsRegulares = items.filter((i: any) => i.estado === 'regular').length;
    
    let resultado = 'APROBADO';
    if (itemsMalos > 0) {
      resultado = 'RECHAZADO';
    } else if (itemsRegulares > 2) {
      resultado = 'CONDICIONAL';
    }

    console.log(`📊 Resultado: ${resultado} (Malos: ${itemsMalos}, Regulares: ${itemsRegulares})`);

    // Guardar la inspección en la base de datos
    const inspeccion = await prisma.inspecciones.create({
      data: {
        habilitacion_id: parseInt(habilitacion_id),
        nro_licencia,
        nombre_inspector: titular?.nombre || 'Inspector',
        firma_digital: firma_inspector, // Campo legacy
        tipo_transporte,
        firma_inspector,
        firma_contribuyente: firma_contribuyente || null,
        email_contribuyente: email_contribuyente || null,
        resultado,
      },
    });

    console.log('✅ Inspección creada con ID:', inspeccion.id);

    // Guardar los detalles de cada ítem (con foto en Base64)
    let itemsConFoto = 0;
    for (const item of items) {
      if (item.foto) {
        const sizeInKB = (item.foto.length * 0.75) / 1024;
        console.log(`📸 Item ${item.nombre} con foto: ${sizeInKB.toFixed(0)}KB`);
        itemsConFoto++;
      }
      
      await prisma.inspeccion_detalles.create({
        data: {
          inspeccion_id: inspeccion.id,
          item_id: item.id,
          nombre_item: item.nombre,
          estado: item.estado,
          observacion: item.observacion || null,
          foto_path: item.foto || null, // Guardar Base64 directamente
        },
      });
    }

    console.log(`✅ ${items.length} ítems guardados (${itemsConFoto} con foto)`);

    // Guardar fotos del vehículo (en Base64)
    const vehiclePhotoTypes = [
      { key: 'frente', label: 'Frente' },
      { key: 'contrafrente', label: 'Contrafrente' },
      { key: 'lateral_izq', label: 'Lateral Izquierdo' },
      { key: 'lateral_der', label: 'Lateral Derecho' },
    ];

    let fotosGuardadas = 0;
    for (const photoType of vehiclePhotoTypes) {
      const photoData = fotos_vehiculo[photoType.key];
      if (photoData && photoData !== '') {
        const sizeInKB = (photoData.length * 0.75) / 1024;
        console.log(`📸 Guardando foto ${photoType.label}: ${sizeInKB.toFixed(0)}KB`);
        console.log(`   Empieza con: ${photoData.substring(0, 50)}...`);
        
        await prisma.inspeccion_fotos.create({
          data: {
            inspeccion_id: inspeccion.id,
            tipo_foto: photoType.label,
            item_id_original: photoType.key,
            foto_path: photoData, // Guardar Base64 directamente
          },
        });
        fotosGuardadas++;
        console.log(`✅ Foto ${photoType.label} guardada correctamente`);
      } else {
        console.log(`⚠️ Foto ${photoType.label} vacía, no se guarda`);
      }
    }

    // Guardar foto adicional si existe
    if (foto_adicional && foto_adicional !== '') {
      await prisma.inspeccion_fotos.create({
        data: {
          inspeccion_id: inspeccion.id,
          tipo_foto: 'Adicional',
          item_id_original: 'adicional',
          foto_path: foto_adicional, // Guardar Base64 directamente
        },
      });
      fotosGuardadas++;
    }

    console.log(`✅ ${fotosGuardadas} fotos del vehículo guardadas`);

    // Marcar turno como finalizado si existe
    const turno = await prisma.turnos.findFirst({
      where: {
        habilitacion_id: parseInt(habilitacion_id),
        estado: {
          in: ['PENDIENTE', 'CONFIRMADO'],
        },
      },
      orderBy: { fecha: 'desc' },
    });

    if (turno) {
      await prisma.turnos.update({
        where: { id: turno.id },
        data: { estado: 'FINALIZADO' },
      });
      console.log('✅ Turno marcado como finalizado');
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
