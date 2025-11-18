import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/obleas/pendientes
 * Obtiene las obleas pendientes de colocación para el inspector
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener obleas con estado 'PENDIENTE' o 'APROBADA'
    const obleasPendientes = await prisma.obleas.findMany({
      where: {
        OR: [
          { estado: 'PENDIENTE' },
          { estado: 'APROBADA' },
        ],
        fecha_colocacion: null, // No han sido colocadas aún
      },
      include: {
        habilitaciones_generales: {
          include: {
            habilitaciones_personas: {
              include: {
                personas: true,
              },
            },
            habilitaciones_vehiculos: {
              include: {
                vehiculos: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha_solicitud: 'desc',
      },
    });

    // Mapear los datos para el frontend
    const obleasFormateadas = obleasPendientes.map((oblea) => {
      const habilitacion = oblea.habilitaciones_generales;
      const persona = habilitacion?.habilitaciones_personas?.[0]?.personas;
      const vehiculo = habilitacion?.habilitaciones_vehiculos?.[0]?.vehiculos;

      return {
        id: oblea.id,
        numero_oblea: oblea.numero_oblea,
        estado: oblea.estado,
        fecha_solicitud: oblea.fecha_solicitud,
        vigencia_inicio: oblea.vigencia_inicio,
        vigencia_fin: oblea.vigencia_fin,
        habilitacion: {
          id: habilitacion?.id,
          nro_licencia: habilitacion?.nro_licencia,
          tipo_transporte: habilitacion?.tipo_transporte,
          estado: habilitacion?.estado,
        },
        titular: persona
          ? {
              nombre: persona.nombre,
              dni: persona.dni,
              telefono: persona.telefono,
            }
          : null,
        vehiculo: vehiculo
          ? {
              dominio: vehiculo.dominio,
              marca: vehiculo.marca,
              modelo: vehiculo.modelo,
              anio: vehiculo.anio,
            }
          : null,
      };
    });

    return NextResponse.json({
      status: 'success',
      data: obleasFormateadas,
      total: obleasFormateadas.length,
    });
  } catch (error) {
    console.error('Error al obtener obleas pendientes:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error al obtener obleas pendientes',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
