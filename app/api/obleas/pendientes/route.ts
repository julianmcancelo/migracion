import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/obleas/pendientes
 * Obtiene las habilitaciones relevantes para el inspector móvil
 * (habilitaciones HABILITADO o EN_TRAMITE, con o sin oblea colocada)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limiteParam = searchParams.get('limite');
    const limite = limiteParam ? parseInt(limiteParam) || 100 : 100;

    // Obtener habilitaciones HABILITADAS o EN_TRAMITE, independientemente de si tienen oblea
    const habilitacionesSinOblea = await prisma.habilitaciones_generales.findMany({
      where: {
        estado: {
          in: ['HABILITADO', 'EN_TRAMITE'],
        },
        is_deleted: false,
      },
      orderBy: {
        id: 'desc',
      },
      take: limite, // Limitar resultados
    });

    // Obtener datos relacionados manualmente
    const obleasPendientes = await Promise.all(
      habilitacionesSinOblea.map(async (habilitacion) => {
        // Obtener titular
        const habPersona = await prisma.habilitaciones_personas.findFirst({
          where: {
            habilitacion_id: habilitacion.id,
            rol: 'TITULAR',
          },
          include: {
            persona: true,
          },
        });

        // Obtener vehículo
        const habVehiculo = await prisma.habilitaciones_vehiculos.findFirst({
          where: {
            habilitacion_id: habilitacion.id,
            activo: true,
          },
          include: {
            vehiculo: true,
          },
        });

        // Obtener último turno
        const turno = await prisma.turnos.findFirst({
          where: {
            habilitacion_id: habilitacion.id,
            estado: 'CONFIRMADO',
          },
          orderBy: {
            fecha: 'desc',
          },
        });

        return {
          id: habilitacion.id,
          nro_licencia: habilitacion.nro_licencia,
          nro_resolucion: habilitacion.resolucion,
          tipo_transporte: habilitacion.tipo_transporte,
          estado: habilitacion.estado,
          vigencia_inicio: habilitacion.vigencia_inicio,
          vigencia_fin: habilitacion.vigencia_fin,
          oblea_colocada: habilitacion.oblea_colocada,
          titular: habPersona?.persona
            ? {
                nombre: habPersona.persona.nombre,
                dni: habPersona.persona.dni,
                telefono: habPersona.persona.telefono,
                email: habPersona.persona.email,
              }
            : {
                nombre: 'Sin titular',
                dni: 'N/A',
                telefono: null,
                email: null,
              },
          vehiculo: habVehiculo?.vehiculo
            ? {
                dominio: habVehiculo.vehiculo.dominio,
                marca: habVehiculo.vehiculo.marca,
                modelo: habVehiculo.vehiculo.modelo,
                anio: habVehiculo.vehiculo.ano,
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
      })
    );

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
