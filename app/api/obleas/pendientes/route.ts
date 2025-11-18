import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/obleas/pendientes
 * Obtiene las habilitaciones que necesitan colocación de oblea
 * (habilitaciones aprobadas sin oblea colocada)
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener habilitaciones HABILITADAS que no tienen oblea colocada
    const habilitacionesSinOblea = await prisma.habilitaciones_generales.findMany({
      where: {
        estado: 'HABILITADO',
        // Buscar habilitaciones que no tienen obleas o tienen obleas sin fecha de colocación
        obleas: {
          none: {},
        },
      },
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
        turnos: {
          where: {
            estado: 'CONFIRMADO',
          },
          orderBy: {
            fecha: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        fecha_aprobacion: 'desc',
      },
      take: 100, // Limitar a 100 resultados
    });

    // Mapear los datos para el frontend
    const obleasPendientes = habilitacionesSinOblea.map((habilitacion) => {
      const persona = habilitacion.habilitaciones_personas?.[0]?.persona;
      const vehiculo = habilitacion.habilitaciones_vehiculos?.[0]?.vehiculo;
      const turno = habilitacion.turnos?.[0];

      return {
        id: habilitacion.id,
        nro_licencia: habilitacion.nro_licencia,
        tipo_transporte: habilitacion.tipo_transporte,
        estado: habilitacion.estado,
        fecha_aprobacion: habilitacion.fecha_aprobacion,
        vigencia_inicio: habilitacion.vigencia_inicio,
        vigencia_fin: habilitacion.vigencia_fin,
        titular: persona
          ? {
              nombre: persona.nombre,
              dni: persona.dni,
              telefono: persona.telefono,
              email: persona.email,
            }
          : {
              nombre: 'Sin titular',
              dni: 'N/A',
              telefono: null,
              email: null,
            },
        vehiculo: vehiculo
          ? {
              dominio: vehiculo.dominio,
              marca: vehiculo.marca,
              modelo: vehiculo.modelo,
              anio: vehiculo.anio,
            }
          : {
              dominio: 'N/A',
              marca: 'Sin vehículo',
              modelo: '',
              anio: null,
            },
        turno: turno
          ? {
              fecha: turno.fecha,
              hora: turno.hora,
            }
          : null,
      };
    });

    return NextResponse.json({
      status: 'success',
      data: obleasPendientes,
      total: obleasPendientes.length,
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
