import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/inspecciones/tramites-pendientes
 * Obtiene los trámites con turnos asignados que están pendientes de inspección
 */
export async function GET() {
  try {
    // Obtener habilitaciones con turnos pendientes
    const tramites = await prisma.habilitaciones_generales.findMany({
      where: {
        is_deleted: false,
        estado: {
          in: ['EN_TRAMITE', 'HABILITADO'],
        },
        turnos: {
          some: {
            estado: {
              in: ['PENDIENTE', 'CONFIRMADO'],
            },
          },
        },
      },
      include: {
        // Titular
        habilitaciones_personas: {
          where: {
            rol: 'TITULAR',
          },
          include: {
            persona: true,
          },
          take: 1,
        },
        // Vehículo activo
        habilitaciones_vehiculos: {
          where: {
            activo: true,
          },
          include: {
            vehiculo: true,
          },
          take: 1,
        },
        // Turno más próximo
        turnos: {
          where: {
            estado: {
              in: ['PENDIENTE', 'CONFIRMADO'],
            },
          },
          orderBy: {
            fecha: 'asc',
          },
          take: 1,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    // Formatear los datos para el frontend
    const tramitesFormateados = tramites.map((hab) => {
      const titular = hab.habilitaciones_personas[0]?.persona;
      const vehiculo = hab.habilitaciones_vehiculos[0]?.vehiculo;
      const turno = hab.turnos[0];

      return {
        habilitacion: {
          id: hab.id,
          nro_licencia: hab.nro_licencia,
          estado: hab.estado,
          tipo_transporte: hab.tipo_transporte,
          expte: hab.expte,
        },
        titular: titular
          ? {
              nombre: titular.nombre,
              dni: titular.dni,
              email: titular.email,
            }
          : null,
        vehiculo: vehiculo
          ? {
              dominio: vehiculo.dominio,
              marca: vehiculo.marca,
              modelo: vehiculo.modelo,
            }
          : null,
        turno: turno
          ? {
              fecha: turno.fecha.toISOString().split('T')[0],
              hora: turno.hora.toISOString().split('T')[1].substring(0, 5),
              estado: turno.estado,
            }
          : null,
      };
    });

    return NextResponse.json({
      status: 'success',
      data: tramitesFormateados,
    });
  } catch (error) {
    console.error('Error al obtener trámites pendientes:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error al obtener los trámites pendientes',
      },
      { status: 500 }
    );
  }
}
